// 머지 보드 규칙 (순수 계산만. 화면 그리기는 ui.js)
// 칸 하나는 null(빈 칸) 또는
//   { kind: 'item', chain: 'oden', lv: 1, id: 7 }
//   { kind: 'gen',  chain: 'oden', id: 1 }
var G = G || {};

G.Board = {
  create: function (data) {
    var b = data.board;
    var s = { cols: b.cols, rows: b.rows, cells: [], nextId: 1 };
    for (var i = 0; i < b.cols * b.rows; i++) s.cells.push(null);
    var k;
    for (k = 0; k < data.generators.length; k++) {
      var g = data.generators[k];
      s.cells[G.Board.idx(s, g.col, g.row)] = { kind: 'gen', chain: g.chain, gen: k, id: s.nextId++ };
    }
    for (k = 0; k < data.startItems.length; k++) {
      var it = data.startItems[k];
      var at = G.Board.idx(s, it.col, it.row);
      if (!s.cells[at]) s.cells[at] = G.Board.newItem(s, it.chain, it.lv);
    }
    return s;
  },

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

  emptyCount: function (s) {
    var n = 0;
    for (var i = 0; i < s.cells.length; i++) if (!s.cells[i]) n++;
    return n;
  },

  isFull: function (s) { return G.Board.emptyCount(s) === 0; },

  itemCount: function (s) {
    var n = 0;
    for (var i = 0; i < s.cells.length; i++) if (s.cells[i] && s.cells[i].kind === 'item') n++;
    return n;
  },

  // 생성기 탭: 생성기에서 가장 가까운 빈 칸에 1단계 재료를 만든다.
  // 거리가 같은 칸이 여럿이면 시드 난수로 고른다.
  // 결과: { ok: true, idx: 칸 번호, item } / { ok: false, reason: 'full' | 'notGen' }
  spawn: function (s, genIdx, rng) {
    var g = s.cells[genIdx];
    if (!g || g.kind !== 'gen') return { ok: false, reason: 'notGen' };
    var gc = G.Board.col(s, genIdx), gr = G.Board.row(s, genIdx);
    var best = [], bestD = Infinity;
    for (var i = 0; i < s.cells.length; i++) {
      if (s.cells[i]) continue;
      var dc = G.Board.col(s, i) - gc, dr = G.Board.row(s, i) - gr;
      var d = dc * dc + dr * dr;
      if (d < bestD) { bestD = d; best = [i]; }
      else if (d === bestD) best.push(i);
    }
    if (!best.length) return { ok: false, reason: 'full' };
    var pick = best[Math.floor(rng() * best.length)];
    var item = G.Board.newItem(s, g.chain, 1);
    s.cells[pick] = item;
    return { ok: true, idx: pick, item: item };
  },

  // 드래그한 아이템을 다른 칸에 놓기.
  // 결과 type: 'move'(빈 칸) / 'merge'(합성) / 'swap'(자리 바꿈) / 'none'(아무 일 없음)
  drop: function (data, s, from, to) {
    var a = s.cells[from];
    if (from === to || !a || a.kind !== 'item' || to < 0 || to >= s.cells.length) return { type: 'none' };
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
    if (b.kind === 'item') {
      s.cells[to] = a; s.cells[from] = b;
      return { type: 'swap', idx: to };
    }
    return { type: 'none' };   // 생성기 위에는 놓을 수 없음
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

  // 저장 데이터가 지금 보드 크기와 다르면 null (새로 시작)
  deserialize: function (data, o) {
    if (!o || o.cols !== data.board.cols || o.rows !== data.board.rows ||
        !o.cells || o.cells.length !== o.cols * o.rows) return null;
    for (var i = 0; i < o.cells.length; i++) {
      var c = o.cells[i];
      if (c && !data.chains[c.chain]) return null;
    }
    return { cols: o.cols, rows: o.rows, nextId: o.nextId || 1, cells: o.cells };
  }
};
