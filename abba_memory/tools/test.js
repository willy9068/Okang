// 자동 테스트 (순수 계산만). 실행: node tools/test.js
var fs = require('fs');
var path = require('path');
var vm = require('vm');

var ctx = { Math: Math, JSON: JSON };
vm.createContext(ctx);
['data.js', 'rng.js', 'board.js', 'order.js', 'expand.js', 'story_data.js', 'story.js'].forEach(function (f) {
  vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'src', f), 'utf8'), ctx, { filename: f });
});
var G = ctx.G, D = G.DATA, B = G.Board;

var pass = 0, fail = 0;
function check(name, cond) {
  if (cond) pass++;
  else { fail++; console.log('  실패: ' + name); }
}
function emptyBoard() {
  var s = B.create(D);
  for (var i = 0; i < s.cells.length; i++) if (s.cells[i] && s.cells[i].kind === 'item') s.cells[i] = null;
  return s;
}
function genIdx(s, chain) {
  for (var i = 0; i < s.cells.length; i++) if (s.cells[i] && s.cells[i].kind === 'gen' && s.cells[i].chain === chain) return i;
  return -1;
}

// --- 보드 만들기 ---
(function () {
  var s = B.create(D);
  check('칸 수 = 가로×세로', s.cells.length === D.board.cols * D.board.rows);
  check('생성기 2개', s.cells.filter(function (c) { return c && c.kind === 'gen'; }).length === D.generators.length);
  check('시작 재료 수', B.itemCount(s) === D.startItems.length);
})();

// --- 합성 ---
(function () {
  var s = emptyBoard();
  s.cells[10] = B.newItem(s, 'oden', 1);
  s.cells[11] = B.newItem(s, 'oden', 1);
  var r = B.drop(D, s, 10, 11);
  check('같은 종류·같은 단계는 합쳐짐', r.type === 'merge' && s.cells[11].lv === 2 && s.cells[11].chain === 'oden');
  check('합친 뒤 원래 칸은 빈 칸', s.cells[10] === null);
  check('합친 뒤 아이템 1개', B.itemCount(s) === 1);

  s.cells[12] = B.newItem(s, 'oden', 1);
  r = B.drop(D, s, 12, 11);
  check('단계가 다르면 자리만 바뀜', r.type === 'swap' && s.cells[11].lv === 1 && s.cells[12].lv === 2);

  s.cells[20] = B.newItem(s, 'gukbap', 2);
  r = B.drop(D, s, 20, 12);
  check('종류가 다르면 합쳐지지 않음', r.type === 'swap' && B.itemCount(s) === 3);

  var max = B.maxLv(D, 'oden');
  s.cells[30] = B.newItem(s, 'oden', max);
  s.cells[31] = B.newItem(s, 'oden', max);
  r = B.drop(D, s, 30, 31);
  check('최종 단계는 합쳐지지 않음', r.type === 'swap' && s.cells[30].lv === max && s.cells[31].lv === max);

  r = B.drop(D, s, 30, 40);
  check('빈 칸으로는 옮겨짐', r.type === 'move' && s.cells[40] && s.cells[30] === null);

  var g = genIdx(s, 'oden');
  r = B.drop(D, s, 40, g);
  check('생성기 위에는 놓을 수 없음', r.type === 'none' && s.cells[g].kind === 'gen' && s.cells[40]);

  check('생성기는 드래그할 수 없음', B.drop(D, s, g, 41).type === 'none');
})();

// --- 생성기 ---
(function () {
  var s = emptyBoard();
  var g = genIdx(s, 'oden');
  var rng = G.makeRng(1);
  var r = B.spawn(s, g, rng);
  check('생성기 탭 → 빈 칸에 1단계', r.ok && s.cells[r.idx].lv === 1 && s.cells[r.idx].chain === 'oden');
  var gc = B.col(s, g), gr = B.row(s, g);
  var d = Math.abs(B.col(s, r.idx) - gc) + Math.abs(B.row(s, r.idx) - gr);
  check('생성기 바로 옆 칸에 생김', d === 1);

  var before = B.itemCount(s);
  while (!B.isFull(s)) B.spawn(s, g, rng);
  check('보드가 다 찰 때까지 생성됨', B.itemCount(s) === before + (s.cells.length - D.generators.length - before));
  r = B.spawn(s, g, rng);
  check('가득 차면 생성 불가', !r.ok && r.reason === 'full');
  check('생성기가 아닌 칸은 생성 불가', !B.spawn(s, 20, rng).ok);
})();

// --- 길게 눌러 삭제 ---
(function () {
  var s = B.create(D);
  var it = D.startItems[0];
  var i = B.idx(s, it.col, it.row);
  check('아이템은 삭제됨', B.remove(s, i) && s.cells[i] === null);
  check('생성기는 삭제 안 됨', !B.remove(s, genIdx(s, 'oden')));
  check('빈 칸 삭제는 아무 일 없음', !B.remove(s, i));
})();

// --- 합칠 수 있는 칸 표시 ---
(function () {
  var s = emptyBoard();
  s.cells[10] = B.newItem(s, 'gukbap', 2);
  s.cells[11] = B.newItem(s, 'gukbap', 2);
  s.cells[12] = B.newItem(s, 'gukbap', 3);
  s.cells[13] = B.newItem(s, 'oden', 2);
  var t = B.mergeTargets(D, s, 10);
  check('합칠 수 있는 칸만 표시', t.length === 1 && t[0] === 11);
})();

// --- 시드 난수 ---
(function () {
  var a = G.makeRng(42), b = G.makeRng(42), same = true;
  for (var i = 0; i < 100; i++) if (a() !== b()) same = false;
  check('같은 시드면 같은 난수', same);

  function play(seed) {
    var s = emptyBoard(), rng = G.makeRng(seed), g = genIdx(s, 'gukbap'), out = [];
    for (var k = 0; k < 12; k++) out.push(B.spawn(s, g, rng).idx);
    return out.join(',');
  }
  check('같은 시드면 같은 생성 위치', play(7) === play(7));
  var r = G.makeRng(5); r(); r();
  var st = r.getState(), x = r();
  r.setState(st);
  check('난수 상태 저장·복원', r() === x);
})();

// --- 저장 형식 ---
(function () {
  var s = B.create(D);
  var o = JSON.parse(JSON.stringify(B.serialize(s)));
  var back = B.deserialize(D, o);
  check('저장 → 불러오기 그대로', back && JSON.stringify(back.cells) === JSON.stringify(s.cells));
  o.cols = 99;
  check('보드 크기가 다르면 불러오지 않음', B.deserialize(D, o) === null);
  check('잘못된 저장은 불러오지 않음', B.deserialize(D, null) === null);
})();

// --- 주문 ---
function makeState() {
  var st = { money: 0, expand: 0, board: emptyBoard(), orders: [], served: 0 };
  return st;
}
(function () {
  var st = makeState(), rng = G.makeRng(3);
  G.Order.fillAll(D, st, rng);
  check('주문 3개', st.orders.length === D.orders.count);
  var custs = st.orders.map(function (o) { return o.cust; });
  check('손님이 겹치지 않음', custs[0] !== custs[1] && custs[1] !== custs[2] && custs[0] !== custs[2]);

  // 단계 범위: 작은 가게는 levelsByStage[0] 안 (2개짜리는 한 단계 낮음)
  var okRange = true, two = 0, r2 = G.makeRng(9);
  for (var k = 0; k < 300; k++) {
    var o = G.Order.make(D, 0, r2, []);
    if (o.needs.length === 2) two++;
    o.needs.forEach(function (n) {
      var lo = Math.min.apply(null, D.orders.levelsByStage[0]);
      var hi = Math.max.apply(null, D.orders.levelsByStage[0]);
      if (o.needs.length === 2) { lo = Math.max(2, lo - D.orders.twoLevelDown); hi = hi - D.orders.twoLevelDown; }
      if (n.lv < lo || n.lv > hi) okRange = false;
    });
    var sum = 0;
    o.needs.forEach(function (n) { sum += D.orders.rewardByLv[n.lv]; });
    if (sum !== o.reward) okRange = false;
  }
  check('주문 단계와 보상이 표대로', okRange);
  check('2개짜리 주문이 섞여 나옴', two > 30 && two < 150);

  var hi1 = 0, r3 = G.makeRng(11);
  for (k = 0; k < 200; k++) G.Order.make(D, 1, r3, []).needs.forEach(function (n) { hi1 = Math.max(hi1, n.lv); });
  check('확장 1단계 뒤에는 5단계 요리도 주문', hi1 === 5);
})();

(function () {
  var st = makeState(), rng = G.makeRng(4);
  st.orders = [
    { cust: 1, needs: [{ chain: 'oden', lv: 3, done: false }], reward: 35 },
    { cust: 2, needs: [{ chain: 'gukbap', lv: 2, done: false }, { chain: 'gukbap', lv: 2, done: false }], reward: 30 },
    { cust: 3, needs: [{ chain: 'oden', lv: 4, done: false }], reward: 80 }
  ];
  st.board.cells[10] = B.newItem(st.board, 'oden', 2);
  var r = G.Order.deliver(D, st, 0, 10, rng);
  check('맞지 않는 요리는 낼 수 없음', !r.ok && st.board.cells[10] && st.money === 0);

  st.board.cells[11] = B.newItem(st.board, 'oden', 3);
  r = G.Order.deliver(D, st, 0, 11, rng);
  check('맞는 요리 끌어 놓기 → 돈', r.ok && r.completed && st.money === 35 && st.board.cells[11] === null);
  check('끝난 주문은 새 주문으로', st.orders[0].needs.every(function (n) { return !n.done; }) && st.served === 1);

  st.board.cells[20] = B.newItem(st.board, 'gukbap', 2);
  r = G.Order.deliver(D, st, 1, 20, rng);
  check('2개짜리는 1개만 내면 아직 안 끝남', r.ok && !r.completed && st.money === 35 && st.orders[1].needs[0].done);
  check('보드에 1개 더 없으면 탭으로 못 냄', !G.Order.serve(D, st, 1, rng).ok);
  st.board.cells[21] = B.newItem(st.board, 'gukbap', 2);
  check('남은 요리가 보드에 있으면 체크', G.Order.haveFlags(st.orders[1], st.board).every(function (h) { return h; }));
  r = G.Order.serve(D, st, 1, rng);
  check('주문 칸 탭으로 남은 요리 내기', r.ok && st.money === 65 && st.board.cells[21] === null);

  // 같은 요리 2개가 필요하면 보드에 2개 있어야 함
  st.orders[2] = { cust: 3, needs: [{ chain: 'oden', lv: 2, done: false }, { chain: 'oden', lv: 2, done: false }], reward: 30 };
  st.board.cells[10] = null;   // 앞에서 남은 어묵 2단계 치움
  st.board.cells[30] = B.newItem(st.board, 'oden', 2);
  check('같은 요리 2개 필요한데 1개뿐이면 못 냄', G.Order.readyOnBoard(st.orders[2], st.board) === null);
  st.board.cells[31] = B.newItem(st.board, 'oden', 2);
  var cells = G.Order.readyOnBoard(st.orders[2], st.board);
  check('같은 요리 2개 있으면 서로 다른 칸', cells && cells.length === 2 && cells[0] !== cells[1]);

  check('생성기는 낼 수 없음', !G.Order.deliver(D, st, 2, 0, rng).ok);
  check('저장된 주문 검사', G.Order.valid(D, st.orders) && !G.Order.valid(D, [{ needs: [] }]));
})();

// --- 확장 ---
(function () {
  var st = makeState();
  var c1 = D.expand.costs[0], c2 = D.expand.costs[1];
  st.money = c1 - 1;
  check('돈이 부족하면 확장 불가', G.Expand.apply(D, st) === 'noMoney' && st.expand === 0 && st.money === c1 - 1);
  st.money = c1 + 10;
  check('확장하면 비용 차감, 단계 진행', G.Expand.apply(D, st) === 'ok' && st.expand === 1 && st.money === 10);
  check('다음 비용은 2단계 비용', G.Expand.cost(D, st) === c2);
  st.money = c2;
  G.Expand.apply(D, st);
  check('2단계까지 확장', st.expand === 2 && st.money === 0);
  st.money = 99999;
  check('더 확장할 것이 없음', G.Expand.apply(D, st) === 'max' && G.Expand.cost(D, st) === null && st.money === 99999);
})();

// --- 스토리 ---
(function () {
  var S = G.Story;
  ['story1', 'story2'].forEach(function (id) {
    var c = S.count(id);
    check(id + ': 대사 15줄, 선택 2개', c.lines === 15 && c.choices === 2);
  });
  check('도입은 짧게 (8줄 이하, 선택 없음)', S.count('intro').lines <= 8 && S.count('intro').choices === 0);
  check('마무리 장면 있음', S.count('ending').lines > 0);

  // 모든 선택지가 3개, 반응·독백 문장이 있음
  var ok = true;
  Object.keys(G.STORY).forEach(function (id) {
    G.STORY[id].lines.forEach(function (l) {
      if (l.choice) {
        if (l.choice.options.length !== 3) ok = false;
        l.choice.options.forEach(function (o) { if (!o.text || !o.react || !o.mono) ok = false; });
      } else if (['narr', 'father', 'mother', 'mono'].indexOf(l.who) < 0 || !l.text) ok = false;
    });
  });
  check('모든 줄의 형식이 맞음 (선택지 3개, 반응·독백 있음)', ok);

  // 고른 선택에 따라 반응·독백이 달라지고, 그 다음 줄은 같다
  function playTo(k) {
    var run = S.begin('story1'), seen = [];
    var guard = 0;
    while (S.current(run).kind !== 'end' && guard++ < 200) {
      var c = S.current(run);
      if (c.kind === 'choice') S.choose(run, k);
      else { seen.push(c.who + ':' + c.text); S.next(run); }
    }
    return seen;
  }
  var a0 = playTo(0), a1 = playTo(1), a2 = playTo(2);
  var opt = G.STORY.story1.lines.filter(function (l) { return l.choice; })[0].choice.options;
  check('선택 1 → 태자 반응 1', a0.indexOf('mother:' + opt[0].react) >= 0 && a0.indexOf('mother:' + opt[1].react) < 0);
  check('선택 2 → 독백 2', a1.indexOf('mono:' + opt[1].mono) >= 0 && a1.indexOf('mono:' + opt[0].mono) < 0);
  function strip(list) {
    var all = [];
    G.STORY.story1.lines.forEach(function (l) {
      if (l.choice) l.choice.options.forEach(function (o) { all.push('mother:' + o.react, 'mono:' + o.mono); });
    });
    return list.filter(function (x) { return all.indexOf(x) < 0; }).join('|');
  }
  check('선택과 상관없이 나머지 이야기는 같음', strip(a0) === strip(a1) && strip(a1) === strip(a2));
  check('선택 직후 반응 → 독백 순서', a0.indexOf('mother:' + opt[0].react) + 1 === a0.indexOf('mono:' + opt[0].mono));

  var run = S.begin('story1');
  check('선택지 앞에서는 그냥 넘어가지 않음', (function () {
    while (S.current(run).kind !== 'choice') S.next(run);
    S.next(run);
    return S.current(run).kind === 'choice';
  })());
  check('없는 선택지는 고를 수 없음', !S.choose(run, 5));

  // 확장 단계별로 볼 스토리가 data.js에 맞게 있음
  var okIds = true;
  D.story.afterExpand.forEach(function (ids) { (ids || []).forEach(function (id) { if (!G.STORY[id]) okIds = false; }); });
  check('확장 뒤 스토리 id가 모두 있음', okIds && !!G.STORY[D.story.intro] && D.story.afterExpand.length === D.expand.costs.length + 1);
})();

console.log('통과 ' + pass + ' / 실패 ' + fail);
process.exit(fail ? 1 : 0);
