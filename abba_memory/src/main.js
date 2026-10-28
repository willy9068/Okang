// 게임 시작, 저장, 입력(드래그/터치), 매 프레임 갱신
var G = G || {};

G.state = null;      // { money, restore, board }
G.rng = null;
G.input = null;      // 누르고 있는 중인 정보
G.anims = [];        // 화면 연출 (아이템 id 기준)
G.hint = null;       // { text, until }

// ---------- 저장 (막혀 있어도 게임은 동작) ----------
G.save = function () {
  try {
    var o = {
      money: G.state.money,
      restore: G.state.restore,
      board: G.Board.serialize(G.state.board),
      rng: G.rng.getState()
    };
    window.localStorage.setItem(G.DATA.saveKey, JSON.stringify(o));
  } catch (e) { /* 저장이 막힌 환경: 무시 */ }
};

G.load = function () {
  var raw = null;
  try { raw = window.localStorage.getItem(G.DATA.saveKey); } catch (e) { return null; }
  if (!raw) return null;
  try {
    var o = JSON.parse(raw);
    var board = G.Board.deserialize(G.DATA, o.board);
    if (!board) { G.showHint(G.DATA.texts.loadFail, 3000); return null; }
    return { money: o.money || 0, restore: o.restore || 0, board: board, rng: o.rng };
  } catch (e) {
    G.showHint(G.DATA.texts.loadFail, 3000);
    return null;
  }
};

G.clearSave = function () {
  try { window.localStorage.removeItem(G.DATA.saveKey); } catch (e) { /* 무시 */ }
};

G.newGame = function () {
  G.rng = G.makeRng(G.DATA.seed);
  G.state = { money: G.DATA.startMoney, restore: 0, board: G.Board.create(G.DATA) };
  G.anims = [];
  G.input = null;
};

// ---------- 안내 문구 ----------
G.showHint = function (text, ms) {
  G.hint = { text: text, until: performance.now() + (ms || 2200) };
};

// ---------- 연출 ----------
G.addAnim = function (a) {
  a.t0 = performance.now();
  G.anims.push(a);
};

// ---------- 좌표 ----------
G.cellRect = function (i) {
  var b = G.DATA.board, s = G.state.board;
  var x0 = (G.DATA.view.w - b.cols * b.cell) / 2;
  return { x: x0 + G.Board.col(s, i) * b.cell, y: b.top + G.Board.row(s, i) * b.cell, w: b.cell, h: b.cell };
};

G.cellAt = function (x, y) {
  var b = G.DATA.board;
  var x0 = (G.DATA.view.w - b.cols * b.cell) / 2;
  var c = Math.floor((x - x0) / b.cell), r = Math.floor((y - b.top) / b.cell);
  if (c < 0 || r < 0 || c >= b.cols || r >= b.rows) return -1;
  return G.Board.idx(G.state.board, c, r);
};

// ---------- 행동 ----------
G.tapGenerator = function (i) {
  var res = G.Board.spawn(G.state.board, i, G.rng);
  if (!res.ok) {
    if (res.reason === 'full') {
      G.showHint(G.DATA.texts.boardFull, 3000);
      G.addAnim({ type: 'shake', id: G.state.board.cells[i].id, dur: 300 });
    }
    return;
  }
  var from = G.cellRect(i);
  G.addAnim({ type: 'fly', id: res.item.id, fromX: from.x, fromY: from.y, dur: 180 });
  G.addAnim({ type: 'bump', id: G.state.board.cells[i].id, dur: 160 });
  G.save();
};

G.dropItem = function (from, to) {
  var s = G.state.board;
  var res = G.Board.drop(G.DATA, s, from, to);
  if (res.type === 'merge') {
    G.addAnim({ type: 'pop', id: res.item.id, dur: 260 });
    G.addAnim({ type: 'spark', idx: res.idx, dur: 400 });
    if (res.item.lv === G.Board.maxLv(G.DATA, res.item.chain)) {
      G.showHint(G.DATA.chains[res.item.chain].steps[res.item.lv - 1] + ' 완성!', 2000);
    }
  } else if (res.type === 'swap') {
    var r = G.cellRect(to);
    G.addAnim({ type: 'fly', id: s.cells[from].id, fromX: r.x, fromY: r.y, dur: 140 });
  } else if (res.type === 'none' && to >= 0 && to !== from) {
    // 놓을 수 없는 자리 (생성기 위): 제자리로 돌아감
    var rt = G.cellRect(to);
    G.addAnim({ type: 'fly', id: s.cells[from].id, fromX: rt.x, fromY: rt.y, dur: 140 });
  }
  if (res.type !== 'none') G.save();
};

G.describe = function (c) {
  var ch = G.DATA.chains[c.chain];
  if (c.kind === 'gen') return ch.name + ' 생성기';
  var max = G.Board.maxLv(G.DATA, c.chain);
  var t = ch.name + ' ' + c.lv + '단계: ' + ch.steps[c.lv - 1];
  return c.lv >= max ? t + ' (최종)' : t + ' → 다음: ' + ch.steps[c.lv];
};

// ---------- 입력 (마우스·터치 공통: Pointer Events) ----------
G.toView = function (e) {
  var r = G.canvas.getBoundingClientRect();
  return { x: (e.clientX - r.left) / G.scale, y: (e.clientY - r.top) / G.scale };
};

G.onDown = function (e) {
  if (G.input || !G.Scene.is('merge')) return;
  var p = G.toView(e);
  var i = G.cellAt(p.x, p.y);
  if (i < 0 || !G.state.board.cells[i]) return;
  G.canvas.setPointerCapture(e.pointerId);
  G.input = { pid: e.pointerId, from: i, x0: p.x, y0: p.y, x: p.x, y: p.y, t0: performance.now(), drag: false };
};

G.onMove = function (e) {
  var inp = G.input;
  if (!inp || inp.pid !== e.pointerId) return;
  var p = G.toView(e);
  inp.x = p.x; inp.y = p.y;
  var c = G.state.board.cells[inp.from];
  var moved = Math.abs(p.x - inp.x0) + Math.abs(p.y - inp.y0) > G.DATA.input.dragStartPx;
  if (!inp.drag && moved && c && c.kind === 'item') {
    inp.drag = true;
    inp.targets = G.Board.mergeTargets(G.DATA, G.state.board, inp.from);
  }
};

G.onUp = function (e) {
  var inp = G.input;
  if (!inp || inp.pid !== e.pointerId) return;
  G.input = null;
  if (inp.done) return;   // 길게 눌러 이미 삭제됨
  var c = G.state.board.cells[inp.from];
  if (!c) return;
  if (inp.drag) {
    var p = G.toView(e);
    G.dropItem(inp.from, G.cellAt(p.x, p.y));
  } else if (c.kind === 'gen') {
    G.tapGenerator(inp.from);
  } else {
    G.showHint(G.describe(c), 2200);
    G.addAnim({ type: 'bump', id: c.id, dur: 160 });
  }
};

G.onCancel = function (e) {
  if (G.input && G.input.pid === e.pointerId) G.input = null;
};

// ---------- 매 프레임 ----------
G.update = function (now) {
  var inp = G.input;
  if (inp && !inp.drag && !inp.done && now - inp.t0 >= G.DATA.input.longPressMs) {
    var c = G.state.board.cells[inp.from];
    if (c && c.kind === 'gen') {
      G.showHint(G.DATA.texts.cantDeleteGen, 1500);
      inp.done = true;
    } else if (c && G.Board.remove(G.state.board, inp.from)) {
      G.addAnim({ type: 'poof', idx: inp.from, dur: 300 });
      G.showHint(G.DATA.texts.deleted, 1200);
      inp.done = true;
      G.save();
    }
  }
  G.anims = G.anims.filter(function (a) { return now - a.t0 < a.dur; });
};

G.frame = function (now) {
  G.update(now);
  G.UI.draw(now);
  if (G.Debug) G.Debug.tick(now);
  window.requestAnimationFrame(G.frame);
};

// ---------- 화면 크기 맞추기 (세로 9:16, PC는 가운데) ----------
G.resize = function () {
  var v = G.DATA.view;
  var s = Math.min(window.innerWidth / v.w, window.innerHeight / v.h);
  var dpr = window.devicePixelRatio || 1;
  G.scale = s;
  G.canvas.style.width = Math.floor(v.w * s) + 'px';
  G.canvas.style.height = Math.floor(v.h * s) + 'px';
  G.canvas.width = Math.floor(v.w * s * dpr);
  G.canvas.height = Math.floor(v.h * s * dpr);
  G.ctx.setTransform(s * dpr, 0, 0, s * dpr, 0, 0);
};

G.start = function () {
  G.canvas = document.getElementById('game');
  G.ctx = G.canvas.getContext('2d');
  G.UI.loadImages();
  var saved = G.load();
  if (saved) {
    G.rng = G.makeRng(G.DATA.seed);
    if (typeof saved.rng === 'number') G.rng.setState(saved.rng);
    G.state = { money: saved.money, restore: saved.restore, board: saved.board };
  } else {
    G.newGame();
    G.showHint(G.DATA.texts.hintStart, 5000);
  }
  G.resize();
  window.addEventListener('resize', G.resize);
  G.canvas.addEventListener('pointerdown', G.onDown);
  G.canvas.addEventListener('pointermove', G.onMove);
  G.canvas.addEventListener('pointerup', G.onUp);
  G.canvas.addEventListener('pointercancel', G.onCancel);
  G.canvas.addEventListener('contextmenu', function (e) { e.preventDefault(); });
  if (G.Debug) G.Debug.init();
  window.requestAnimationFrame(G.frame);
};

window.addEventListener('load', G.start);
