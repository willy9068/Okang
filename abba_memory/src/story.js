// 스토리 진행 규칙 (순수 계산만. 대사는 story_data.js, 그리기는 ui.js)
// run(진행 중인 스토리): { id, i: 지금 줄 번호, queue: 선택 직후 끼워 넣는 줄(반응·독백) }
var G = G || {};

G.Story = {
  begin: function (id) {
    return { id: id, i: 0, queue: [] };
  },

  lines: function (run) { return G.STORY[run.id].lines; },

  // 지금 보여 줄 것: { kind: 'line', who, text } / { kind: 'choice', prompt, options } / { kind: 'end' }
  current: function (run) {
    if (run.queue.length) return { kind: 'line', who: run.queue[0].who, text: run.queue[0].text };
    var L = G.Story.lines(run);
    if (run.i >= L.length) return { kind: 'end' };
    var l = L[run.i];
    if (l.choice) return { kind: 'choice', prompt: l.choice.prompt, options: l.choice.options };
    return { kind: 'line', who: l.who, text: l.text };
  },

  // 대사 줄 넘기기 (선택지 앞에서는 넘어가지 않음)
  next: function (run) {
    if (run.queue.length) { run.queue.shift(); return; }
    var c = G.Story.current(run);
    if (c.kind === 'line') run.i++;
  },

  // k번째 선택지 고르기: 태자 반응 한 줄 → 아버지 독백 한 줄을 끼워 넣고 다음 줄로
  choose: function (run, k) {
    var c = G.Story.current(run);
    if (c.kind !== 'choice' || !c.options[k]) return false;
    var o = c.options[k];
    run.queue = [{ who: 'mother', text: o.react }, { who: 'mono', text: o.mono }];
    run.i++;
    return true;
  },

  // 스토리 하나의 대사 줄 수와 선택 수 (확인용)
  count: function (id) {
    var n = 0, ch = 0;
    G.STORY[id].lines.forEach(function (l) { if (l.choice) ch++; else n++; });
    return { lines: n, choices: ch };
  }
};
