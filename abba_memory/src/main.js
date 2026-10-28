// 게임 시작, 저장, 입력(드래그/터치), 매 프레임 갱신
var G = G || {};

G.state = null;      // { money, restore, board, orders, tut, served, playMs }
G.rng = null;
G.input = null;      // 누르고 있는 중인 정보
G.anims = [];        // 화면 연출 (아이템 id 기준)
G.hint = null;       // { text, until }

// ---------- 저장 (막혀 있어도 게임은 동작) ----------
G.save = function () {
  try {
    var s = G.state;
    var o = {
      money: s.money,
      restore: s.restore,
      board: G.Board.serialize(s.board),
      orders: s.orders,
      tut: s.tut,
      served: s.served,
      playMs: s.playMs,
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
    return {
      money: o.money || 0,
      restore: Math.min(o.restore || 0, G.DATA.restore.costs.length),
      board: board,
      orders: G.Order.valid(G.DATA, o.orders) ? o.orders : null,
      tut: o.tut || 0,
      served: o.served || 0,
      playMs: o.playMs || 0,
      rng: o.rng
    };
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
  G.state = {
    money: G.DATA.startMoney, restore: 0, board: G.Board.create(G.DATA),
    orders: [], tut: 0, served: 0, playMs: 0
  };
  G.Order.fillAll(G.DATA, G.state, G.rng);
  G.anims = [];
  G.input = null;
};

// ---------- 안내 문구 ----------
G.showHint = function (text, ms) {
  G.hint = { text: text, until: performance.now() + (ms || 2200) };
};

// 조작 안내: 안내마다 따로 '해 봤음'을 표시 (tut는 비트 묶음)
G.tutDone = function (step) {
  G.state.tut |= (1 << step);
};

// 아직 안 해 본 첫 안내 문장 (다 했으면 null)
G.tutText = function () {
  var list = G.DATA.tutorial;
  for (var i = 0; i < list.length; i++) if (!(G.state.tut & (1 << i))) return list[i];
  return null;
};

G.fmtTime = function (ms) {
  var sec = Math.floor(ms / 1000);
  return Math.floor(sec / 60) + ':' + ('0' + (sec % 60)).slice(-2);
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

G.orderRect = function (oi) {
  var L = G.DATA.layout.orders, n = G.DATA.orders.count;
  var x0 = (G.DATA.view.w - n * L.w - (n - 1) * L.gap) / 2;
  return { x: x0 + oi * (L.w + L.gap), y: L.y, w: L.w, h: L.h };
};

G.inRect = function (r, x, y) {
  return x >= r.x && x < r.x + r.w && y >= r.y && y < r.y + r.h;
};

G.orderAt = function (x, y) {
  for (var i = 0; i < G.DATA.orders.count; i++) if (G.inRect(G.orderRect(i), x, y)) return i;
  return -1;
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
  G.tutDone(0);
  G.save();
};

G.dropItem = function (from, to) {
  var s = G.state.board;
  var res = G.Board.drop(G.DATA, s, from, to);
  if (res.type === 'merge') {
    G.addAnim({ type: 'pop', id: res.item.id, dur: 260 });
    G.addAnim({ type: 'spark', idx: res.idx, dur: 400 });
    G.tutDone(1);
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

G.afterServe = function (oi, done) {
  var cust = G.DATA.customers.filter(function (c) { return c.id === done.cust; })[0];
  G.showHint(G.DATA.texts.served.replace('{name}', cust ? cust.name : '').replace('{money}', done.reward), 2000);
  G.addAnim({ type: 'coin', oi: oi, amount: done.reward, dur: 700 });
  G.addAnim({ type: 'order', oi: oi, dur: 300 });
  G.tutDone(2);
};

// 요리를 주문 칸에 끌어 놓기
G.deliverItem = function (from, oi) {
  var res = G.Order.deliver(G.DATA, G.state, oi, from, G.rng);
  if (!res.ok) { G.showHint(G.DATA.texts.notWanted, 1500); return; }
  if (res.completed) G.afterServe(oi, res.completed);
  else G.addAnim({ type: 'order', oi: oi, dur: 200 });
  G.save();
};

// 주문 칸 탭: 다 모였으면 한꺼번에 냄
G.tapOrder = function (oi) {
  var res = G.Order.serve(G.DATA, G.state, oi, G.rng);
  if (!res.ok) { G.addAnim({ type: 'orderShake', oi: oi, dur: 300 }); return; }
  res.cells.forEach(function (i) { G.addAnim({ type: 'poof', idx: i, dur: 300 }); });
  G.afterServe(oi, res.completed);
  G.save();
};

G.tapRestore = function () {
  var D = G.DATA, s = G.state;
  var r = G.Restore.apply(D, s);
  if (r === 'noMoney') { G.showHint(D.texts.noMoney, 1500); return; }
  if (r !== 'ok') return;
  G.addAnim({ type: 'restore', dur: 900 });
  if (s.restore >= D.restore.costs.length) {
    G.showHint(D.texts.restoreAllDone.replace('{time}', G.fmtTime(s.playMs)), 8000);
  } else {
    G.showHint(D.texts.restoreDone[s.restore], 4000);
  }
  // 스토리 장면은 3일차에 여기서 연결
  G.save();
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
  var base = { pid: e.pointerId, x0: p.x, y0: p.y, x: p.x, y: p.y, t0: performance.now(), drag: false };
  if (G.Restore.cost(G.DATA, G.state) !== null && G.inRect(G.DATA.layout.restoreBtn, p.x, p.y)) {
    base.button = 'restore';
  } else if (G.orderAt(p.x, p.y) >= 0) {
    base.order = G.orderAt(p.x, p.y);
  } else {
    var i = G.cellAt(p.x, p.y);
    if (i < 0 || !G.state.board.cells[i]) return;
    base.from = i;
  }
  G.canvas.setPointerCapture(e.pointerId);
  G.input = base;
};

G.onMove = function (e) {
  var inp = G.input;
  if (!inp || inp.pid !== e.pointerId) return;
  var p = G.toView(e);
  inp.x = p.x; inp.y = p.y;
  if (inp.from === undefined) return;
  var c = G.state.board.cells[inp.from];
  var moved = Math.abs(p.x - inp.x0) + Math.abs(p.y - inp.y0) > G.DATA.input.dragStartPx;
  if (!inp.drag && moved && c && c.kind === 'item') {
    inp.drag = true;
    inp.targets = G.Board.mergeTargets(G.DATA, G.state.board, inp.from);
    inp.orderTargets = [];
    G.state.orders.forEach(function (o, oi) { if (G.Order.accepts(o, c) >= 0) inp.orderTargets.push(oi); });
  }
};

G.onUp = function (e) {
  var inp = G.input;
  if (!inp || inp.pid !== e.pointerId) return;
  G.input = null;
  var p = G.toView(e);
  if (inp.button === 'restore') {
    if (G.inRect(G.DATA.layout.restoreBtn, p.x, p.y)) G.tapRestore();
    return;
  }
  if (inp.order !== undefined) {
    if (G.orderAt(p.x, p.y) === inp.order) G.tapOrder(inp.order);
    return;
  }
  if (inp.done) return;   // 길게 눌러 이미 삭제됨
  var c = G.state.board.cells[inp.from];
  if (!c) return;
  if (inp.drag) {
    var oi = G.orderAt(p.x, p.y);
    if (oi >= 0) G.deliverItem(inp.from, oi);
    else G.dropItem(inp.from, G.cellAt(p.x, p.y));
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
G.lastNow = 0;

G.update = function (now) {
  var dt = G.lastNow ? Math.min(now - G.lastNow, 250) : 0;   // 탭을 떠나 있던 시간은 세지 않음
  G.lastNow = now;
  if (G.Scene.is('merge') && G.state.restore < G.DATA.restore.costs.length) G.state.playMs += dt;

  var inp = G.input;
  if (inp && inp.from !== undefined && !inp.drag && !inp.done && now - inp.t0 >= G.DATA.input.longPressMs) {
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
    G.state = saved;
    delete G.state.rng;
    if (!G.state.orders) { G.state.orders = []; G.Order.fillAll(G.DATA, G.state, G.rng); }
  } else {
    G.newGame();
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
