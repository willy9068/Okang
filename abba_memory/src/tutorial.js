// 첫 머지 화면 튜토리얼 (도입 스토리 바로 뒤, 한 번만)
// 순서: 0 생성기 누르기 → 1 같은 재료 2개 겹치기 → 2 요리를 손님 접시에 놓기 → 3 확장 버튼 안내(화면 누르면 끝)
// 해야 할 곳만 밝게 두고 나머지는 어둡게, 그곳만 누를 수 있습니다. 태자가 말풍선으로 설명합니다 (문장은 ui_text.js의 tutorial).
var G = G || {};

G.Tut = {
  DONE: 4,

  // 새 게임: 튜토리얼 시작 + 가운데 손님에게 쉬운 주문 하나
  setup: function (st) {
    var T = G.DATA.tutorialSetup;
    st.tut = 0;
    var o = JSON.parse(JSON.stringify(T.order));
    o.needs.forEach(function (n) { n.done = false; });
    // 다른 칸 손님과 겹치면 안 겹치는 손님으로
    var busy = st.orders.filter(function (x, i) { return x && i !== T.slot; }).map(function (x) { return x.cust; });
    if (busy.indexOf(o.cust) >= 0) {
      var free = G.DATA.customers.filter(function (c) { return busy.indexOf(c.id) < 0; });
      if (free.length) o.cust = free[0].id;
    }
    st.orders[T.slot] = o;
  },

  on: function () {
    return !(G.Edit && G.Edit.on) && G.state && G.state.tut < G.Tut.DONE;
  },

  // 지금 화면에 튜토리얼이 떠 있는가
  active: function () {
    return G.Tut.on() && G.Scene.is('merge') && !G.storyAt;
  },

  step: function () { return G.state.tut; },

  // 튜토리얼 재료 체인의 생성기 칸
  gen: function (s) {
    var chain = G.DATA.tutorialSetup.chain;
    for (var i = 0; i < s.cells.length; i++) {
      var c = s.cells[i];
      if (c && c.kind === 'gen' && c.chain === chain) return i;
    }
    return -1;
  },

  // 같은 재료 1단계 두 칸 (서로 가까운 것)
  pair: function (s) {
    var chain = G.DATA.tutorialSetup.chain, list = [], best = null, bestD = Infinity;
    s.cells.forEach(function (c, i) { if (c && c.kind === 'item' && c.chain === chain && c.lv === 1) list.push(i); });
    for (var a = 0; a < list.length; a++) {
      for (var b = a + 1; b < list.length; b++) {
        var dc = G.Board.col(s, list[a]) - G.Board.col(s, list[b]);
        var dr = G.Board.row(s, list[a]) - G.Board.row(s, list[b]);
        var d = dc * dc + dr * dr;
        if (d < bestD) { bestD = d; best = [list[a], list[b]]; }
      }
    }
    return best;
  },

  // 주문한 요리가 있는 칸
  dish: function (st) {
    var n = st.orders[G.DATA.tutorialSetup.slot].needs[0];
    for (var i = 0; i < st.board.cells.length; i++) {
      var c = st.board.cells[i];
      if (c && c.kind === 'item' && c.chain === n.chain && c.lv === n.lv) return i;
    }
    return -1;
  },

  // 누를 수 있는가. kind: 'cell' | 'order' | 'button'
  allowDown: function (st, kind, idx) {
    var k = st.tut, slot = G.DATA.tutorialSetup.slot;
    if (k === 0) return kind === 'cell' && idx === G.Tut.gen(st.board);
    if (k === 1) {
      var p = G.Tut.pair(st.board);
      if (!p) return kind === 'cell' && idx === G.Tut.gen(st.board);   // 재료가 모자라면 다시 뽑게
      return kind === 'cell' && p.indexOf(idx) >= 0;
    }
    if (k === 2) return (kind === 'cell' && idx === G.Tut.dish(st)) || (kind === 'order' && idx === slot);
    return true;
  },

  // 끌어서 놓을 수 있는가 (to: 칸 번호 또는 -1, oi: 주문 칸 번호 또는 -1)
  allowDrop: function (st, from, to, oi) {
    var k = st.tut;
    if (k === 1) return to >= 0 && G.Board.canMerge(G.DATA, st.board.cells[from], st.board.cells[to]);
    if (k === 2) return oi === G.DATA.tutorialSetup.slot;
    return true;
  },

  // 게임에서 일어난 일로 다음 단계로
  event: function (name) {
    if (!G.Tut.on()) return;
    var k = G.state.tut;
    if ((k === 0 && name === 'spawn') || (k === 1 && name === 'merge') || (k === 2 && name === 'serve')) {
      G.state.tut++;
      G.Tut.shownAt = performance.now();
    }
  },

  finish: function () {
    G.state.tut = G.Tut.DONE;
    G.save();
  },

  // 주문 칸을 보여 줄지 (튜토리얼 중에는 튜토리얼 손님만)
  showOrder: function (oi) {
    return !G.Tut.active() || G.state.tut >= 3 || oi === G.DATA.tutorialSetup.slot;
  },

  // ---------- 그리기 ----------
  shownAt: 0,

  // 이번 단계에서 밝게 둘 곳과 손가락 움직임
  plan: function () {
    var st = G.state, s = st.board, k = st.tut, slot = G.DATA.tutorialSetup.slot;
    var c = function (i) { return G.cellRect(i); };
    if (k === 0) return { holes: [c(G.Tut.gen(s))], tap: c(G.Tut.gen(s)) };
    if (k === 1) {
      var p = G.Tut.pair(s);
      if (!p) return { holes: [c(G.Tut.gen(s))], tap: c(G.Tut.gen(s)) };
      return { holes: [c(p[0]), c(p[1])], from: c(p[0]), to: c(p[1]) };
    }
    if (k === 2) {
      var d = G.Tut.dish(st), o = G.orderRect(slot);
      var plate = { x: o.x, y: o.y + o.h * 0.4, w: o.w, h: o.h * 0.4 };
      if (d < 0) return { holes: [o], tap: plate };
      return { holes: [c(d), o], from: c(d), to: plate };
    }
    return { holes: [G.DATA.layout.expandBtn], tap: G.DATA.layout.expandBtn };
  },

  draw: function (ctx, now) {
    var D = G.DATA, C = D.colors, P = G.Tut.plan();
    // 1) 어둡게 덮고 구멍 내기
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, D.view.w, D.view.h);
    P.holes.forEach(function (r) {
      var m = 4, x = r.x - m, y = r.y - m, w = r.w + 2 * m, h = r.h + 2 * m, rr = 12;
      ctx.moveTo(x + rr, y);
      ctx.arcTo(x, y, x, y + h, rr);        // 반대 방향으로 그려 구멍이 됨
      ctx.arcTo(x, y + h, x + w, y + h, rr);
      ctx.arcTo(x + w, y + h, x + w, y, rr);
      ctx.arcTo(x + w, y, x, y, rr);
      ctx.closePath();
    });
    ctx.fillStyle = 'rgba(8,10,20,0.62)';
    ctx.fill('evenodd');
    // 구멍 테두리
    var pulse = 0.5 + 0.5 * Math.sin(now / 200);
    P.holes.forEach(function (r) {
      G.UI.roundRect(ctx, r.x - 4, r.y - 4, r.w + 8, r.h + 8, 12);
      ctx.lineWidth = 3 + 2 * pulse; ctx.strokeStyle = C.mergeHint; ctx.stroke();
    });
    ctx.restore();

    // 2) 손가락
    var hx, hy, t = (now % 1600) / 1600;
    if (P.from) {
      var e = Math.min(1, Math.max(0, (t - 0.15) / 0.6));
      e = e * e * (3 - 2 * e);
      hx = P.from.x + P.from.w / 2 + (P.to.x + P.to.w / 2 - P.from.x - P.from.w / 2) * e;
      hy = P.from.y + P.from.h / 2 + (P.to.y + P.to.h / 2 - P.from.y - P.from.h / 2) * e;
    } else {
      hx = P.tap.x + P.tap.w / 2;
      hy = P.tap.y + P.tap.h / 2 + Math.abs(Math.sin(t * Math.PI * 2)) * -8;
    }
    G.Tut.drawHand(ctx, hx, hy, P.from && t > 0.15 && t < 0.8);

    // 3) 태자 말풍선
    G.Tut.drawBubble(ctx, D, C, D.tutorial[G.state.tut] || '', G.state.tut === 3);
  },

  // 손가락 (그림 없이 코드로): 누르는 중이면 조금 작게
  drawHand: function (ctx, x, y, pressing) {
    var k = pressing ? 0.9 : 1;
    ctx.save();
    ctx.translate(x + 6, y + 8);
    ctx.scale(k, k);
    ctx.fillStyle = '#FFFFFF'; ctx.strokeStyle = '#2B1D14'; ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-6, 0); ctx.lineTo(-6, 26); ctx.quadraticCurveTo(-6, 44, 10, 46);
    ctx.lineTo(22, 46); ctx.quadraticCurveTo(34, 44, 34, 30); ctx.lineTo(34, 18);
    ctx.quadraticCurveTo(34, 12, 28, 12); ctx.quadraticCurveTo(22, 12, 22, 18);
    ctx.lineTo(22, 14); ctx.quadraticCurveTo(22, 8, 16, 8); ctx.quadraticCurveTo(10, 8, 10, 14);
    ctx.lineTo(10, 0); ctx.quadraticCurveTo(10, -8, 2, -8); ctx.quadraticCurveTo(-6, -8, -6, 0);
    ctx.closePath();
    ctx.fill(); ctx.stroke();
    ctx.restore();
  },

  drawBubble: function (ctx, D, C, text, last) {
    var B = D.layout.tutBubble, ps = B.h - 24;
    ctx.save();
    G.UI.roundRect(ctx, B.x, B.y, B.w, B.h, 16);
    ctx.fillStyle = C.cream; ctx.fill();
    ctx.lineWidth = 4; ctx.strokeStyle = C.navy; ctx.stroke();
    G.UI.roundRect(ctx, B.x + 5, B.y + 5, B.w - 10, B.h - 10, 12);
    ctx.lineWidth = 2; ctx.strokeStyle = C.gold; ctx.stroke();
    // 태자 얼굴 (char_mother 그림의 얼굴 부분, 없으면 동그라미)
    var px = B.x + 14, py = B.y + 12, im = G.UI.img('char_mother');
    ctx.save();
    ctx.beginPath(); ctx.arc(px + ps / 2, py + ps / 2, ps / 2, 0, Math.PI * 2); ctx.clip();
    if (im) {
      var sw = im.width * 0.56;
      ctx.drawImage(im, im.width * 0.22, im.height * 0.02, sw, sw, px, py, ps, ps);
    } else {
      ctx.fillStyle = C.mother[1]; ctx.fillRect(px, py, ps, ps);
    }
    ctx.restore();
    ctx.beginPath(); ctx.arc(px + ps / 2, py + ps / 2, ps / 2, 0, Math.PI * 2);
    ctx.lineWidth = 3; ctx.strokeStyle = C.gold; ctx.stroke();
    // 이름표 + 문장
    var tx = px + ps + 14, tw = B.x + B.w - 16 - tx;
    ctx.fillStyle = C.navy; ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'left'; ctx.textBaseline = 'top';
    ctx.fillText(D.names.mother, tx, B.y + 12);
    ctx.fillStyle = C.outline; ctx.font = '16px sans-serif';
    G.UI.wrap(ctx, text, tw).forEach(function (l, i) { ctx.fillText(l, tx, B.y + 34 + i * 22); });
    if (last) {
      ctx.fillStyle = 'rgba(43,29,20,0.6)'; ctx.font = '12px sans-serif';
      ctx.textAlign = 'right'; ctx.textBaseline = 'bottom';
      ctx.fillText(D.texts.tutTapToStart, B.x + B.w - 14, B.y + B.h - 8);
    }
    ctx.restore();
  }
};
