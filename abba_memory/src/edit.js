// 편집 모드: 주소 끝에 ?edit 가 붙으면 켜짐 (편집기 tools/editor.html 이 이 모드로 게임을 띄움)
// 화면 위 UI 덩어리를 끌어서 옮기고, 오른쪽 아래 모서리를 끌어서 크기를 바꿉니다.
// 바뀐 값은 G.DATA 에 바로 들어가고, 저장은 편집기가 합니다.
var G = G || {};

G.Edit = {
  on: /[?&]edit/.test(window.location.search),
  sel: null,        // 고른 덩어리 id
  drag: null,       // { id, mode: 'move' | 'size', px, py, r0 }
  handle: 14,       // 크기 조절 모서리 크기

  // 장면별로 고칠 수 있는 덩어리. get: 지금 사각형, set: 사각형을 값에 반영
  defs: function () {
    var D = G.DATA, L = D.layout, S = D.storyLayout, B = D.board;
    var plain = function (o) {
      return { get: function () { return { x: o.x, y: o.y, w: o.w, h: o.h }; },
               set: function (r) { o.x = r.x; o.y = r.y; o.w = r.w; o.h = r.h; } };
    };
    var full = function (o, name) {   // 가로는 화면 전체, 세로 위치·높이만
      return { name: name,
               get: function () { return { x: 0, y: o.y, w: D.view.w, h: o.h }; },
               set: function (r) { o.y = r.y; o.h = r.h; } };
    };
    var list = {
      merge: [
        { id: 'hud', name: '상단 HUD', get: function () { return { x: 0, y: 0, w: D.view.w, h: L.hudH }; },
          set: function (r) { L.hudH = Math.max(24, r.h); } },
        mix({ id: 'expandBtn', name: '확장 버튼' }, plain(L.expandBtn)),
        { id: 'orders', name: '손님·접시 칸 (3칸 같이)', extra: ['gap'],
          get: function () { var r = G.orderRect(0); return { x: r.x, y: r.y, w: r.w, h: r.h }; },
          set: function (r) {
            var O = L.orders, n = D.orders.count;
            O.y = r.y; O.w = r.w; O.h = r.h;
            O.gap = Math.max(0, Math.round((D.view.w - 2 * r.x - n * r.w) / (n - 1)));
          } },
        mix({ id: 'shop', name: '가게 그림' }, full(L.shop)),
        mix({ id: 'panel', name: '보드 나무판' }, full(L.panel)),
        { id: 'board', name: '보드 칸 (가로 가운데 맞춤)',
          get: function () {
            var w = B.cols * B.cell;
            return { x: (D.view.w - w) / 2, y: B.top, w: w, h: B.rows * B.cell };
          },
          set: function (r) { B.top = r.y; B.cell = Math.max(24, Math.round(r.w / B.cols)); } },
        mix({ id: 'hint', name: '안내 문구 줄' }, full(L.hint))
      ],
      story: [
        mix({ id: 'father', name: '나 (아버지 그림)' }, plain(S.father)),
        mix({ id: 'mother', name: '태자 (어머니 그림)' }, plain(S.mother)),
        mix({ id: 'box', name: '대화창', extra: ['pad', 'padTop'] }, plain(S.box)),
        { id: 'choice', name: '선택지 (첫 버튼 기준)', extra: ['gap'],
          get: function () { return { x: S.choice.x, y: S.choice.y, w: S.choice.w, h: S.choice.h }; },
          set: function (r) { S.choice.x = r.x; S.choice.y = r.y; S.choice.w = r.w; S.choice.h = r.h; } },
        mix({ id: 'sign', name: '간판 글씨 자리 (마무리 장면)' }, plain(S.sign))
      ],
      title: [
        mix({ id: 'titleText', name: '제목 글자' }, full(L.titleText)),
        { id: 'menuBtn', name: '버튼 (첫 버튼 기준)', extra: ['gap'], obj: L.menuBtn,
          get: function () { var M = L.menuBtn; return { x: M.x, y: M.y, w: M.w, h: M.h }; },
          set: function (r) { var M = L.menuBtn; M.x = r.x; M.y = r.y; M.w = r.w; M.h = r.h; } }
      ],
      end: []
    };
    list.end.push(list.title[1]);   // 끝 화면 버튼도 같은 자리
    function mix(a, b) { for (var k in b) if (!(k in a)) a[k] = b[k]; return a; }
    // extra 값(gap, pad 등)이 들어 있는 원래 객체
    list.merge[2].obj = L.orders;
    list.story[2].obj = S.box;
    list.story[3].obj = S.choice;
    return list;
  },

  items: function () { return G.Edit.defs()[G.Scene.current] || []; },

  find: function (id) {
    var all = G.Edit.defs(), out = null;
    Object.keys(all).forEach(function (k) { all[k].forEach(function (d) { if (d.id === id) out = d; }); });
    return out;
  },

  // 편집기가 부름: 사각형 하나 바꾸기
  setRect: function (id, r) {
    var d = G.Edit.find(id);
    if (!d) return;
    d.set({ x: Math.round(r.x), y: Math.round(r.y), w: Math.max(8, Math.round(r.w)), h: Math.max(8, Math.round(r.h)) });
  },

  notify: function (id) {
    try {
      if (window.parent && window.parent !== window && window.parent.EditorHooks) window.parent.EditorHooks.changed(id);
    } catch (e) { /* 편집기 밖에서 열었을 때 */ }
  },

  // 편집기가 부름: 보여 줄 장면 고르기
  // pick: 선택지 번호(0~2)를 주면 고른 직후 모습, step: 'react'(태자 반응) | 'mono'(아버지 속마음)
  show: function (scene, id, index, pick, step) {
    if (scene === 'story') {
      G.openStory(id, true);
      var run = G.story.run;
      run.i = Math.max(0, Math.min(index || 0, G.STORY[id].lines.length - 1));
      if (typeof pick === 'number') {   // 선택지를 고른 직후 (반응·독백)
        G.Story.choose(run, pick);
        if (step === 'mono') run.queue.shift();
      }
      G.story.t0 = -1e9;
      G.story.open = -1e9;
    } else {
      G.story = null;
      G.Scene.go(scene);
    }
    G.Edit.sel = null;
  },

  // 보기 좋게 보드에 아이템 몇 개 놓기 (편집 모드는 저장하지 않음)
  seed: function () {
    var s = G.state, D = G.DATA;
    s.expand = 0;
    var spots = [[2, 1, 'oden', 2], [3, 1, 'oden', 3], [4, 2, 'gukbap', 4], [2, 3, 'gukbap', 1], [5, 4, 'oden', 5], [1, 5, 'gukbap', 2]];
    spots.forEach(function (p) {
      var i = G.Board.idx(s.board, p[0], p[1]);
      if (!s.board.cells[i]) s.board.cells[i] = G.Board.newItem(s.board, p[2], p[3]);
    });
    s.money = 120;
  },

  init: function () {
    var c = G.canvas;
    c.addEventListener('pointerdown', G.Edit.down);
    c.addEventListener('pointermove', G.Edit.move);
    c.addEventListener('pointerup', G.Edit.up);
    c.addEventListener('pointercancel', G.Edit.up);
  },

  down: function (e) {
    var p = G.toView(e), H = G.Edit.handle, best = null, bestArea = Infinity;
    G.Edit.items().forEach(function (d) {
      var r = d.get();
      if (!G.inRect({ x: r.x - 4, y: r.y - 4, w: r.w + 8, h: r.h + 8 }, p.x, p.y)) return;
      var area = r.w * r.h;
      if (d.id === G.Edit.sel) area = -1;   // 고른 것 먼저
      if (area < bestArea) { bestArea = area; best = d; }
    });
    if (!best) { G.Edit.sel = null; G.Edit.notify(null); return; }
    var r0 = best.get();
    var corner = p.x > r0.x + r0.w - H && p.y > r0.y + r0.h - H;
    G.Edit.sel = best.id;
    G.Edit.drag = { id: best.id, mode: corner ? 'size' : 'move', px: p.x, py: p.y, r0: r0 };
    G.canvas.setPointerCapture(e.pointerId);
    G.Edit.notify(best.id);
  },

  move: function (e) {
    var dr = G.Edit.drag;
    if (!dr) return;
    var p = G.toView(e), dx = p.x - dr.px, dy = p.y - dr.py, r = dr.r0;
    if (dr.mode === 'move') G.Edit.setRect(dr.id, { x: r.x + dx, y: r.y + dy, w: r.w, h: r.h });
    else G.Edit.setRect(dr.id, { x: r.x, y: r.y, w: r.w + dx, h: r.h + dy });
    G.Edit.notify(dr.id);
  },

  up: function () { G.Edit.drag = null; },

  // 덩어리 테두리와 이름 그리기
  draw: function (ctx) {
    var H = G.Edit.handle;
    G.Edit.items().forEach(function (d) {
      var r = d.get(), on = d.id === G.Edit.sel;
      ctx.save();
      ctx.setLineDash(on ? [] : [5, 4]);
      ctx.lineWidth = on ? 3 : 1.5;
      ctx.strokeStyle = on ? '#FFC857' : 'rgba(80,220,255,0.9)';
      ctx.strokeRect(r.x + 0.5, r.y + 0.5, r.w - 1, r.h - 1);
      ctx.setLineDash([]);
      ctx.fillStyle = on ? '#FFC857' : 'rgba(80,220,255,0.9)';
      ctx.fillRect(r.x + r.w - H, r.y + r.h - H, H, H);
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'left'; ctx.textBaseline = 'top';
      var tw = ctx.measureText(d.name).width + 8;
      ctx.fillStyle = on ? 'rgba(120,80,0,0.85)' : 'rgba(0,60,80,0.8)';
      ctx.fillRect(r.x, r.y, tw, 16);
      ctx.fillStyle = '#FFFFFF';
      ctx.fillText(d.name, r.x + 4, r.y + 2);
      ctx.restore();
    });
  }
};
