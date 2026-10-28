// 손님 주문 규칙 (순수 계산만. 화면 그리기는 ui.js)
// 주문 하나: { cust: 손님 id, needs: [{ chain, lv, done }], reward }
// st(게임 상태): { money, expand, board, orders, ... }
var G = G || {};

G.Order = {
  // 새 주문 하나. busy = 지금 다른 주문 칸에 있는 손님 id 목록 (겹치지 않게)
  make: function (data, stage, rng, busy) {
    var O = data.orders;
    var pool = O.levelsByStage[Math.min(stage, O.levelsByStage.length - 1)];
    var chains = Object.keys(data.chains);
    var n = rng() < O.twoChance ? 2 : 1;
    var needs = [], reward = 0;
    for (var k = 0; k < n; k++) {
      var lv = pool[Math.floor(rng() * pool.length)];
      if (n === 2) lv = Math.max(2, lv - O.twoLevelDown);
      var chain = chains[Math.floor(rng() * chains.length)];
      needs.push({ chain: chain, lv: lv, done: false });
      reward += O.rewardByLv[lv];
    }
    var free = data.customers.filter(function (c) { return busy.indexOf(c.id) < 0; });
    if (!free.length) free = data.customers;
    var cust = free[Math.floor(rng() * free.length)].id;
    return { cust: cust, needs: needs, reward: reward };
  },

  // 빈 주문 칸을 채움 (처음 시작, 불러오기 실패 때)
  fillAll: function (data, st, rng) {
    if (!st.orders) st.orders = [];
    while (st.orders.length < data.orders.count) {
      st.orders.push(G.Order.make(data, st.expand, rng, G.Order.busy(st, -1)));
    }
  },

  busy: function (st, except) {
    var out = [];
    st.orders.forEach(function (o, i) { if (i !== except && o) out.push(o.cust); });
    return out;
  },

  // 이 아이템이 주문의 아직 안 채운 칸에 맞는가 → 칸 번호 또는 -1
  accepts: function (order, item) {
    if (!order || !item || item.kind !== 'item') return -1;
    for (var k = 0; k < order.needs.length; k++) {
      var n = order.needs[k];
      if (!n.done && n.chain === item.chain && n.lv === item.lv) return k;
    }
    return -1;
  },

  // 남은 요리가 보드에 다 있으면 그 칸 번호 목록, 아니면 null
  // (같은 요리 2개가 필요하면 서로 다른 칸 2개가 있어야 함)
  readyOnBoard: function (order, board) {
    var used = [];
    for (var k = 0; k < order.needs.length; k++) {
      var n = order.needs[k];
      if (n.done) continue;
      var found = -1;
      for (var i = 0; i < board.cells.length; i++) {
        var c = board.cells[i];
        if (c && c.kind === 'item' && c.chain === n.chain && c.lv === n.lv && used.indexOf(i) < 0) { found = i; break; }
      }
      if (found < 0) return null;
      used.push(found);
    }
    return used;
  },

  // 각 필요 요리가 보드에 있는가 (주문 칸의 ✓ 표시용)
  haveFlags: function (order, board) {
    var used = [];
    return order.needs.map(function (n) {
      if (n.done) return true;
      for (var i = 0; i < board.cells.length; i++) {
        var c = board.cells[i];
        if (c && c.kind === 'item' && c.chain === n.chain && c.lv === n.lv && used.indexOf(i) < 0) {
          used.push(i);
          return true;
        }
      }
      return false;
    });
  },

  // 주문이 다 채워지면 돈을 받고 새 주문으로 바꿈
  complete: function (data, st, oi, rng) {
    var o = st.orders[oi];
    st.money += o.reward;
    st.served = (st.served || 0) + 1;
    st.orders[oi] = G.Order.make(data, st.expand, rng, G.Order.busy(st, oi));
    return o;
  },

  // 보드 칸의 요리를 끌어 놓아 주문 하나를 채움
  // 결과: { ok: false } / { ok: true, completed: 끝난 주문 또는 null }
  deliver: function (data, st, oi, bi, rng) {
    var o = st.orders[oi], item = st.board.cells[bi];
    var k = G.Order.accepts(o, item);
    if (k < 0) return { ok: false };
    o.needs[k].done = true;
    st.board.cells[bi] = null;
    var all = o.needs.every(function (n) { return n.done; });
    return { ok: true, completed: all ? G.Order.complete(data, st, oi, rng) : null };
  },

  // 주문 칸 탭: 남은 요리가 보드에 다 있으면 한꺼번에 냄
  serve: function (data, st, oi, rng) {
    var o = st.orders[oi];
    var cells = o && G.Order.readyOnBoard(o, st.board);
    if (!cells) return { ok: false };
    cells.forEach(function (i) { st.board.cells[i] = null; });
    o.needs.forEach(function (n) { n.done = true; });
    return { ok: true, cells: cells, completed: G.Order.complete(data, st, oi, rng) };
  },

  // 저장된 주문이 올바른가
  valid: function (data, orders) {
    if (!orders || orders.length !== data.orders.count) return false;
    return orders.every(function (o) {
      return o && o.needs && o.needs.length && o.needs.every(function (n) {
        return data.chains[n.chain] && n.lv >= 1 && n.lv <= data.chains[n.chain].steps.length;
      });
    });
  }
};
