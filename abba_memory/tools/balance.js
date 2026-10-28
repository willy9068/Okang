// 밸런스 계산: 가상의 플레이어가 한 판을 돌며 복구까지 걸리는 시간을 어림합니다.
// 실행: node tools/balance.js
// 동작 하나에 드는 시간은 data.js의 balanceSim. 실제 사람 플레이로 꼭 다시 확인해야 합니다.
var fs = require('fs');
var path = require('path');
var vm = require('vm');

var ctx = { Math: Math, JSON: JSON };
vm.createContext(ctx);
['data.js', 'rng.js', 'board.js', 'order.js', 'restore.js'].forEach(function (f) {
  vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'src', f), 'utf8'), ctx, { filename: f });
});
var G = ctx.G, D = G.DATA, B = G.Board, S = D.balanceSim;

// 아직 안 낸 요리 목록
function wants(st) {
  var out = [];
  st.orders.forEach(function (o) { o.needs.forEach(function (n) { if (!n.done) out.push(n); }); });
  return out;
}

// 체인별 "필요한 양 - 보드에 있는 양" (1단계 재료 개수로 환산)
function deficit(st, chain) {
  var need = 0, have = 0;
  wants(st).forEach(function (n) { if (n.chain === chain) need += Math.pow(2, n.lv - 1); });
  st.board.cells.forEach(function (c) {
    if (c && c.kind === 'item' && c.chain === chain) have += Math.pow(2, c.lv - 1);
  });
  return need - have;
}

// 쓸모 있는 합성: 그 체인에서 더 높은 단계가 필요하고, 그 단계가 아직 보드에 충분하지 않음
function bestMerge(st) {
  var w = wants(st), best = null;
  for (var i = 0; i < st.board.cells.length; i++) {
    var a = st.board.cells[i];
    if (!a || a.kind !== 'item') continue;
    var useful = w.some(function (n) { return n.chain === a.chain && n.lv > a.lv; });
    if (!useful) continue;
    for (var j = i + 1; j < st.board.cells.length; j++) {
      if (B.canMerge(D, a, st.board.cells[j]) && (!best || a.lv > best.lv)) best = { from: i, to: j, lv: a.lv };
    }
  }
  return best;
}

function junk(st) {
  var w = wants(st), pick = -1, pickLv = 99;
  st.board.cells.forEach(function (c, i) {
    if (!c || c.kind !== 'item') return;
    var useful = w.some(function (n) { return n.chain === c.chain && n.lv >= c.lv; });
    var lv = useful ? c.lv + 10 : c.lv;
    if (lv < pickLv) { pickLv = lv; pick = i; }
  });
  return pick;
}

function genOf(st, chain) {
  for (var i = 0; i < st.board.cells.length; i++) {
    var c = st.board.cells[i];
    if (c && c.kind === 'gen' && c.chain === chain) return i;
  }
  return -1;
}

function play(seed) {
  var rng = G.makeRng(seed);
  var st = { money: D.startMoney, restore: 0, board: B.create(D), orders: [], served: 0 };
  G.Order.fillAll(D, st, rng);
  var t = 0, stageT = [], stageServed = [], lastServed = 0, steps = 0;
  var chains = Object.keys(D.chains);
  while (st.restore < D.restore.costs.length && steps++ < 20000) {
    if (G.Restore.can(D, st)) {
      G.Restore.apply(D, st);
      stageT.push(t); stageServed.push(st.served - lastServed); lastServed = st.served;
      t = 0;
      continue;
    }
    var served = false;
    for (var oi = 0; oi < st.orders.length && !served; oi++) {
      if (G.Order.serve(D, st, oi, rng).ok) { t += S.secServe; served = true; }
    }
    if (served) continue;
    var m = bestMerge(st);
    if (m) { B.drop(D, st.board, m.from, m.to); t += S.secMerge; continue; }
    var chain = chains.slice().sort(function (a, b) { return deficit(st, b) - deficit(st, a); })[0];
    if (B.isFull(st.board) || deficit(st, chain) <= 0) {
      var j = junk(st);
      if (j >= 0) { B.remove(st.board, j); t += S.secDelete; continue; }
    }
    B.spawn(st.board, genOf(st, chain), rng);
    t += S.secTap;
  }
  return { stageT: stageT.map(function (x) { return x * S.humanFactor; }), stageServed: stageServed };
}

var n = S.runs, sum = [0, 0], served = [0, 0], min = [1e9, 1e9], max = [0, 0];
for (var k = 0; k < n; k++) {
  var r = play(D.seed + k);
  for (var s = 0; s < 2; s++) {
    sum[s] += r.stageT[s]; served[s] += r.stageServed[s];
    min[s] = Math.min(min[s], r.stageT[s]); max[s] = Math.max(max[s], r.stageT[s]);
  }
}
function fmt(sec) { sec = Math.round(sec); return Math.floor(sec / 60) + '분 ' + (sec % 60) + '초'; }
console.log('복구 비용: ' + D.restore.costs.join(', ') + ' / ' + n + '판 평균 (사람 보정 x' + S.humanFactor + ')');
for (s = 0; s < 2; s++) {
  console.log('  복구 ' + (s + 1) + '단계까지: ' + fmt(sum[s] / n) + ' (빠름 ' + fmt(min[s]) + ', 느림 ' + fmt(max[s]) +
    '), 낸 주문 약 ' + (served[s] / n).toFixed(1) + '개');
}
console.log('  머지 합계: ' + fmt((sum[0] + sum[1]) / n));
