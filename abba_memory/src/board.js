// 머지 보드 규칙 (순수 계산만. 화면 그리기는 ui.js)
// 칸 하나는 null(빈 칸) 또는
//   { kind: 'item', chain: 'oden', lv: 1, id: 7 }
//   { kind: 'gen',  chain: 'oden', id: 1 }
// s.open[i] = 그 칸이 열려 있는가 (가게 확장 단계에 따라 넓어짐, data.board.openByStage)
var G = G || {};

G.Board = {
  create: function (data) {
    var b = data.board;
    var s = { cols: b.cols, rows: b.rows, cells: [], open: [], nextId: 1 };
    for (var i = 0; i < b.cols * b.rows; i++) s.cells.push(null);
    G.Board.setStage(data, s, 0);
    var k;
    for (k = 0; k < data.generators.length; k++) {
      var g = data.generators[k];
      if ((g.fromStage || 0) > 0) continue;   // 나중 단계 생성기는 setStage에서 놓음
      s.cells[G.Board.idx(s, g.col, g.row)] = { kind: 'gen', chain: g.chain, gen: k, id: s.nextId++ };
    }
    for (k = 0; k < data.startItems.length; k++) {
      var it = data.startItems[k];
      var at = G.Board.idx(s, it.col, it.row);
      if (!s.cells[at]) s.cells[at] = G.Board.newItem(s, it.chain, it.lv);
    }
    return s;
  },

  // 확장 단계에 맞춰 열린 칸을 정함. 결과: 이번에 새로 열린 칸 번호 목록
  setStage: function (data, s, stage) {
    var list = data.board.openByStage;
    var a = list[Math.min(stage, list.length - 1)], opened = [];
    for (var i = 0; i < s.cols * s.rows; i++) {
      var c = G.Board.col(s, i), r = G.Board.row(s, i);
      var open = c >= a.c0 && c <= a.c1 && r >= a.r0 && r <= a.r1;
      if (open && s.open[i] === false) opened.push(i);
      s.open[i] = open;
    }
    G.Board.placeGens(data, s, stage);
    return opened;
  },

  // 이 단계에 생겨야 하는데 보드에 없는 생성기를 놓음 (확장할 때, 예전 저장을 불러올 때)
  // 정한 칸이 차 있거나 닫혀 있으면 가장 가까운 빈 칸. 놓은 칸 번호 목록을 돌려줌
  placeGens: function (data, s, stage) {
    var placed = [];
    data.generators.forEach(function (g, k) {
      if ((g.fromStage || 0) > stage) return;
      for (var i = 0; i < s.cells.length; i++) {
        if (s.cells[i] && s.cells[i].kind === 'gen' && s.cells[i].chain === g.chain) return;
      }
      var want = G.Board.idx(s, g.col, g.row), best = -1, bestD = 1e9;
      for (i = 0; i < s.cells.length; i++) {
        if (s.cells[i] || !G.Board.isOpen(s, i)) continue;
        var d = Math.abs(G.Board.col(s, i) - g.col) + Math.abs(G.Board.row(s, i) - g.row);
        if (i === want) d = -1;
        if (d < bestD) { bestD = d; best = i; }
      }
      if (best < 0) return;   // 빈 칸이 없으면 다음 확장·불러오기 때 다시 시도
      s.cells[best] = { kind: 'gen', chain: g.chain, gen: k, id: s.nextId++ };
      placed.push(best);
    });
    return placed;
  },

  isOpen: function (s, i) { return i >= 0 && i < s.cells.length && s.open[i] !== false; },

  idx: function (s, col, row) { return row * s.cols + col; },
  col: function (s, i) { return i % s.cols; },
  row: function (s, i) { return Math.floor(i / s.cols); },

  newItem: function (s, chain, lv) {
    return { kind: 'item', chain: chain, lv: lv, id: s.nextId++ };
  },

  maxLv: function (data, chain) { return data.chains[chain].steps.length; },

  // 두 칸이 합쳐질 수 있는가: 둘 다 아이템, 같은 종류, 같은 단계, 최종 단계 아님
  canMerge: function (data, a, b) {
    return !!(a && b && a.kind === 'item' && b.kind === 'item' &&
      a.chain === b.chain && a.lv === b.lv && a.lv < G.Board.maxLv(data, a.chain));
  },

  // 열린 빈 칸 목록
  emptyCells: function (s) {
    var out = [];
    for (var i = 0; i < s.cells.length; i++) if (!s.cells[i] && G.Board.isOpen(s, i)) out.push(i);
    return out;
  },

  emptyCount: function (s) { return G.Board.emptyCells(s).length; },

  isFull: function (s) { return G.Board.emptyCount(s) === 0; },

  itemCount: function (s) {
    var n = 0;
    for (var i = 0; i < s.cells.length; i++) if (s.cells[i] && s.cells[i].kind === 'item') n++;
    return n;
  },

  // 생성기 탭: 열린 빈 칸 중 아무 데나(시드 난수) 1단계 재료를 만든다.
  // 결과: { ok: true, idx: 칸 번호, item } / { ok: false, reason: 'full' | 'notGen' }
  spawn: function (s, genIdx, rng) {
    var g = s.cells[genIdx];
    if (!g || g.kind !== 'gen') return { ok: false, reason: 'notGen' };
    var empty = G.Board.emptyCells(s);
    if (!empty.length) return { ok: false, reason: 'full' };
    var pick = empty[Math.floor(rng() * empty.length)];
    var item = G.Board.newItem(s, g.chain, 1);
    s.cells[pick] = item;
    return { ok: true, idx: pick, item: item };
  },

  // 끌어 온 아이템·생성기를 다른 칸에 놓기 (닫힌 칸에는 못 놓음).
  // 결과 type: 'move'(빈 칸) / 'merge'(합성) / 'swap'(자리 바꿈) / 'none'(아무 일 없음)
  drop: function (data, s, from, to) {
    var a = s.cells[from];
    if (from === to || !a || !G.Board.isOpen(s, to)) return { type: 'none' };
    var b = s.cells[to];
    if (!b) {
      s.cells[to] = a; s.cells[from] = null;
      return { type: 'move', idx: to };
    }
    if (G.Board.canMerge(data, a, b)) {
      var m = G.Board.newItem(s, a.chain, a.lv + 1);
      s.cells[to] = m; s.cells[from] = null;
      return { type: 'merge', idx: to, item: m };
    }
    s.cells[to] = a; s.cells[from] = b;
    return { type: 'swap', idx: to };
  },

  // 길게 눌러 삭제 (생성기는 삭제 불가)
  remove: function (s, i) {
    var c = s.cells[i];
    if (!c || c.kind !== 'item') return false;
    s.cells[i] = null;
    return true;
  },

  // 드래그 중인 아이템과 합칠 수 있는 칸 목록 (노란 테두리 표시용)
  mergeTargets: function (data, s, from) {
    var a = s.cells[from], out = [];
    for (var i = 0; i < s.cells.length; i++) {
      if (i !== from && G.Board.canMerge(data, a, s.cells[i])) out.push(i);
    }
    return out;
  },

  serialize: function (s) {
    return { cols: s.cols, rows: s.rows, nextId: s.nextId, cells: s.cells };
  },

  // 저장 데이터가 지금 보드 크기와 다르면 null (새로 시작). 열린 칸은 불러온 뒤 setStage로 정함
  deserialize: function (data, o) {
    if (!o || o.cols !== data.board.cols || o.rows !== data.board.rows ||
        !o.cells || o.cells.length !== o.cols * o.rows) return null;
    for (var i = 0; i < o.cells.length; i++) {
      var c = o.cells[i];
      if (c && !data.chains[c.chain]) return null;
    }
    return { cols: o.cols, rows: o.rows, nextId: o.nextId || 1, cells: o.cells, open: [] };
  }
};
