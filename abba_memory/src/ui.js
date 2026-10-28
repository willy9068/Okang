// 화면 그리기. 이미지가 있으면 이미지, 없으면 색 블록·글자로 그립니다.
var G = G || {};

G.ASSET_BASE = G.ASSET_BASE || '../assets/';   // 제출본(단일 HTML)에서는 빌드가 바꿈
G.IMG = {};          // 이름 → 다 불러온 Image
G.IMG_FAIL = {};     // 이름 → 불러오기 실패

G.UI = {
  loadImages: function () {
    G.DATA.images.forEach(function (name) {
      var im = new Image();
      im.onload = function () { G.IMG[name] = im; };
      im.onerror = function () { G.IMG_FAIL[name] = true; };
      im.src = (G.ASSET_DATA && G.ASSET_DATA[name]) || (G.ASSET_BASE + name + '.png');
    });
  },

  img: function (name) { return G.IMG[name] || null; },

  roundRect: function (ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  },

  // 아이템 id 기준으로 지금 걸린 연출 찾기
  animOf: function (id, type, now, oi) {
    for (var i = 0; i < G.anims.length; i++) {
      var a = G.anims[i];
      if (a.id === id && a.type === type && a.oi === oi) return { a: a, t: Math.min(1, (now - a.t0) / a.dur) };
    }
    return null;
  },

  draw: function (now) {
    var ctx = G.ctx, D = G.DATA, C = D.colors;
    ctx.fillStyle = C.navy;
    ctx.fillRect(0, 0, D.view.w, D.view.h);
    G.UI.drawShop(ctx, D, C);
    G.UI.drawHud(ctx, D, C);
    G.UI.drawRestoreBtn(ctx, D, C, now);
    G.UI.drawOrders(ctx, D, C, now);
    G.UI.drawPanel(ctx, D, C);
    G.UI.drawBoard(ctx, D, C, now);
    G.UI.drawEffects(ctx, D, C, now);
    G.UI.drawHint(ctx, D, C, now);
  },

  drawShop: function (ctx, D, C) {
    var L = D.layout.shop, st = G.state.restore;
    var im = G.UI.img('shop_' + st);
    if (im) { ctx.drawImage(im, 0, L.y, D.view.w, L.h); return; }
    // placeholder: 벽 + 카운터 + 단계 글자
    ctx.fillStyle = C.shop[st] || C.shop[0];
    ctx.fillRect(0, L.y, D.view.w, L.h);
    ctx.fillStyle = 'rgba(255,255,255,0.08)';
    for (var x = 0; x < D.view.w; x += 36) ctx.fillRect(x, L.y + 60, 1, L.h - 140);
    ctx.fillStyle = C.wood;
    ctx.fillRect(0, L.y + L.h - 80, D.view.w, 80);
    ctx.fillStyle = C.woodDark;
    ctx.fillRect(0, L.y + L.h - 80, D.view.w, 8);
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'bottom';
    ctx.fillText('shop_' + st, 8, L.y + L.h - 4);
  },

  // 복구 버튼: 비용과 모은 돈 막대. 돈이 충분하면 반짝임
  drawRestoreBtn: function (ctx, D, C, now) {
    var cost = G.Restore.cost(D, G.state);
    if (cost === null) return;
    var R = D.layout.restoreBtn, ok = G.state.money >= cost;
    var press = G.input && G.input.button === 'restore';
    var k = press ? 0.96 : ok ? 1 + 0.03 * Math.sin(now / 180) : 1;
    ctx.save();
    ctx.translate(R.x + R.w / 2, R.y + R.h / 2);
    ctx.scale(k, k);
    ctx.translate(-R.w / 2, -R.h / 2);
    var im = G.UI.img('ui_button');
    if (im) ctx.drawImage(im, 0, 0, R.w, R.h);
    else {
      G.UI.roundRect(ctx, 0, 0, R.w, R.h, 12);
      ctx.fillStyle = ok ? C.teal : '#4A5468'; ctx.fill();
      ctx.lineWidth = 3; ctx.strokeStyle = C.gold; ctx.stroke();
    }
    // 진행 막대
    var p = Math.min(1, G.state.money / cost);
    G.UI.roundRect(ctx, 10, R.h - 9, R.w - 20, 5, 2);
    ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.fill();
    if (p > 0) {
      G.UI.roundRect(ctx, 10, R.h - 9, Math.max(5, (R.w - 20) * p), 5, 2);
      ctx.fillStyle = C.mergeGlow; ctx.fill();
    }
    var icon = G.UI.img('ui_restore');
    if (icon) ctx.drawImage(icon, 10, 4, 24, 24);
    ctx.fillStyle = ok ? '#FFFFFF' : '#C9CED8';
    ctx.font = 'bold 15px sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(D.texts.restoreBtn + '  ' + G.state.money.toLocaleString() + ' / ' + cost.toLocaleString(), R.w / 2, R.h / 2 - 3);
    ctx.restore();
  },

  // 손님 주문 칸 3개
  drawOrders: function (ctx, D, C, now) {
    var inp = G.input;
    var drag = inp && inp.drag ? G.state.board.cells[inp.from] : null;
    var hoverOrder = drag ? G.orderAt(inp.x, inp.y) : -1;
    G.state.orders.forEach(function (o, oi) {
      var r = G.orderRect(oi);
      var have = G.Order.haveFlags(o, G.state.board);
      var ready = have.every(function (h) { return h; });
      var accept = drag && inp.orderTargets && inp.orderTargets.indexOf(oi) >= 0;
      var x = r.x;
      var sh = G.UI.animOf(undefined, 'orderShake', now, oi);
      if (sh) x += Math.sin(sh.t * Math.PI * 6) * 4 * (1 - sh.t);
      var ap = G.UI.animOf(undefined, 'order', now, oi);
      var k = ap ? 1 + 0.08 * Math.sin(ap.t * Math.PI) : 1;
      ctx.save();
      ctx.translate(x + r.w / 2, r.y + r.h / 2);
      ctx.scale(k, k);
      ctx.translate(-r.w / 2, -r.h / 2);

      // 손님 얼굴
      var cust = D.customers.filter(function (c) { return c.id === o.cust; })[0] || D.customers[0];
      var cim = G.UI.img('cust_' + cust.id);
      if (cim) ctx.drawImage(cim, r.w / 2 - 36, 0, 72, 72);
      else {
        ctx.beginPath(); ctx.arc(r.w / 2, 34, 28, 0, Math.PI * 2);
        ctx.fillStyle = cust.color; ctx.fill();
        ctx.lineWidth = 3; ctx.strokeStyle = C.outline; ctx.stroke();
        ctx.fillStyle = C.cream; ctx.font = 'bold 11px sans-serif';
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(cust.name, r.w / 2, 34);
      }

      // 말풍선
      var by = 74, bh = r.h - by;
      var bim = G.UI.img('ui_order');
      if (bim) ctx.drawImage(bim, 0, by, r.w, bh);
      else {
        G.UI.roundRect(ctx, 0, by, r.w, bh, 14);
        ctx.fillStyle = C.cream; ctx.fill();
        ctx.lineWidth = 3; ctx.strokeStyle = C.outline; ctx.stroke();
      }
      if (accept || ready) {
        G.UI.roundRect(ctx, 3, by + 3, r.w - 6, bh - 6, 12);
        ctx.lineWidth = hoverOrder === oi ? 5 : 3;
        ctx.strokeStyle = C.mergeGlow; ctx.stroke();
      }

      // 필요한 요리 (이미 낸 것은 흐리게, 보드에 있는 것은 초록 체크)
      var n = o.needs.length, size = n === 1 ? 64 : 54;
      o.needs.forEach(function (need, k2) {
        var cx = n === 1 ? r.w / 2 : r.w / 2 + (k2 === 0 ? -36 : 36);
        var cy = by + 50;
        ctx.save();
        if (need.done) ctx.globalAlpha = 0.35;
        G.UI.drawCell(ctx, D, C, { kind: 'item', chain: need.chain, lv: need.lv }, cx, cy, size);
        ctx.restore();
        if (have[k2] && !need.done) G.UI.drawCheck(ctx, cx + size / 2 - 6, cy - size / 2 + 6);
      });

      // 보상 또는 내기
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      if (ready) {
        G.UI.roundRect(ctx, r.w / 2 - 44, r.h - 34, 88, 26, 10);
        ctx.fillStyle = C.teal; ctx.fill();
        ctx.lineWidth = 2; ctx.strokeStyle = C.gold; ctx.stroke();
        ctx.fillStyle = '#FFFFFF'; ctx.font = 'bold 14px sans-serif';
        ctx.fillText(D.texts.serveReady + ' +' + o.reward, r.w / 2, r.h - 21);
      } else {
        ctx.fillStyle = C.outline; ctx.font = 'bold 14px sans-serif';
        ctx.fillText('+' + o.reward, r.w / 2, r.h - 21);
      }
      ctx.restore();
    });
  },

  drawCheck: function (ctx, x, y) {
    ctx.beginPath(); ctx.arc(x, y, 9, 0, Math.PI * 2);
    ctx.fillStyle = '#3FA34D'; ctx.fill();
    ctx.lineWidth = 2; ctx.strokeStyle = '#FFFFFF'; ctx.stroke();
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(x - 4, y);
    ctx.lineTo(x - 1, y + 3);
    ctx.lineTo(x + 4, y - 3);
    ctx.stroke();
  },

  // 돈 날아가기, 복구 번쩍
  drawEffects: function (ctx, D, C, now) {
    G.anims.forEach(function (a) {
      var t = (now - a.t0) / a.dur;
      if (a.type === 'coin') {
        var r = G.orderRect(a.oi);
        var sx = r.x + r.w / 2, sy = r.y + r.h - 30;
        var x = sx + (34 - sx) * t;
        var y = sy + (28 - sy) * t - Math.sin(t * Math.PI) * 40;
        ctx.save();
        ctx.globalAlpha = 1 - t * 0.3;
        ctx.beginPath(); ctx.arc(x, y, 10, 0, Math.PI * 2);
        ctx.fillStyle = C.gold; ctx.fill();
        ctx.lineWidth = 2; ctx.strokeStyle = C.outline; ctx.stroke();
        ctx.restore();
      } else if (a.type === 'restore') {
        ctx.save();
        ctx.globalAlpha = Math.sin(t * Math.PI) * 0.8;
        ctx.fillStyle = '#FFF6DA';
        ctx.fillRect(0, D.layout.shop.y, D.view.w, D.layout.shop.h);
        ctx.restore();
      }
    });
  },


  drawHud: function (ctx, D, C) {
    var h = D.layout.hudH, w = D.view.w;
    var im = G.UI.img('ui_hud');
    if (im) ctx.drawImage(im, 0, 0, w, h);
    else {
      G.UI.roundRect(ctx, 6, 6, w - 12, h - 12, 12);
      ctx.fillStyle = C.navy; ctx.fill();
      ctx.lineWidth = 3; ctx.strokeStyle = C.gold; ctx.stroke();
    }
    // 돈
    var coin = G.UI.img('ui_coin');
    if (coin) ctx.drawImage(coin, 20, 14, 28, 28);
    else {
      ctx.beginPath(); ctx.arc(34, 28, 13, 0, Math.PI * 2);
      ctx.fillStyle = C.gold; ctx.fill();
      ctx.lineWidth = 2; ctx.strokeStyle = C.outline; ctx.stroke();
    }
    ctx.fillStyle = C.cream;
    ctx.font = 'bold 20px sans-serif';
    ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    ctx.fillText(G.state.money.toLocaleString(), 56, 29);
    // 복구 단계
    ctx.textAlign = 'right';
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText(D.texts.shopStage[G.state.restore], w - 22, 29);
  },

  drawPanel: function (ctx, D, C) {
    var P = D.layout.panel, w = D.view.w;
    var im = G.UI.img('ui_board');
    if (im) { ctx.drawImage(im, 0, P.y, w, P.h); return; }
    G.UI.roundRect(ctx, 8, P.y, w - 16, P.h, 18);
    ctx.fillStyle = C.wood; ctx.fill();
    ctx.lineWidth = 4; ctx.strokeStyle = C.outline; ctx.stroke();
    ctx.fillStyle = 'rgba(0,0,0,0.08)';
    for (var y = P.y + 30; y < P.y + P.h; y += 60) ctx.fillRect(12, y, w - 24, 2);
  },

  drawBoard: function (ctx, D, C, now) {
    var s = G.state.board, inp = G.input, i, r;
    var cellIm = G.UI.img('ui_cell');
    var targets = (inp && inp.drag && inp.targets) || [];
    var hover = (inp && inp.drag) ? G.cellAt(inp.x, inp.y) : -1;

    // 칸
    for (i = 0; i < s.cells.length; i++) {
      r = G.cellRect(i);
      if (cellIm) ctx.drawImage(cellIm, r.x + 2, r.y + 2, r.w - 4, r.h - 4);
      else {
        G.UI.roundRect(ctx, r.x + 3, r.y + 3, r.w - 6, r.h - 6, 9);
        ctx.fillStyle = C.cell; ctx.fill();
        ctx.lineWidth = 2; ctx.strokeStyle = C.cellRim; ctx.stroke();
      }
    }

    // 합칠 수 있는 칸: 노란 점선 테두리 (드래그 중)
    if (targets.length) {
      ctx.save();
      ctx.setLineDash([6, 4]);
      ctx.lineDashOffset = -(now / 40) % 10;
      ctx.lineWidth = 3; ctx.strokeStyle = C.mergeGlow;
      targets.forEach(function (t) {
        var tr = G.cellRect(t);
        G.UI.roundRect(ctx, tr.x + 3, tr.y + 3, tr.w - 6, tr.h - 6, 9);
        ctx.stroke();
      });
      ctx.restore();
    }
    // 손가락 아래 칸
    if (hover >= 0 && hover !== inp.from) {
      var hr = G.cellRect(hover);
      var ok = targets.indexOf(hover) >= 0;
      G.UI.roundRect(ctx, hr.x + 2, hr.y + 2, hr.w - 4, hr.h - 4, 10);
      ctx.fillStyle = ok ? 'rgba(255,200,87,0.35)' : 'rgba(255,255,255,0.12)';
      ctx.fill();
    }

    // 아이템
    for (i = 0; i < s.cells.length; i++) {
      var c = s.cells[i];
      if (!c) continue;
      if (inp && inp.drag && inp.from === i) continue;   // 드래그 중인 것은 맨 위에 따로
      r = G.cellRect(i);
      var x = r.x, y = r.y, k = 1;
      var fly = G.UI.animOf(c.id, 'fly', now);
      if (fly) {
        var e = 1 - Math.pow(1 - fly.t, 3);
        x = fly.a.fromX + (r.x - fly.a.fromX) * e;
        y = fly.a.fromY + (r.y - fly.a.fromY) * e;
      }
      var pop = G.UI.animOf(c.id, 'pop', now);
      if (pop) k = 1 + 0.35 * Math.sin(pop.t * Math.PI);
      var bump = G.UI.animOf(c.id, 'bump', now);
      if (bump) k *= 1 + 0.12 * Math.sin(bump.t * Math.PI);
      var shake = G.UI.animOf(c.id, 'shake', now);
      if (shake) x += Math.sin(shake.t * Math.PI * 6) * 4 * (1 - shake.t);
      // 길게 누르는 중이면 조금 작아짐
      var press = (inp && !inp.drag && !inp.done && inp.from === i && c.kind === 'item');
      if (press) k *= 0.92;
      G.UI.drawCell(ctx, D, C, c, x + r.w / 2, y + r.h / 2, r.w * D.board.itemScale * k);
      if (press) G.UI.drawPressRing(ctx, C, r, (now - inp.t0) / D.input.longPressMs);
    }

    // 연출: 합성 반짝, 삭제 연기
    G.anims.forEach(function (a) {
      if (a.type !== 'spark' && a.type !== 'poof') return;
      var t = (now - a.t0) / a.dur, ar = G.cellRect(a.idx);
      var cx = ar.x + ar.w / 2, cy = ar.y + ar.h / 2;
      var fx = a.type === 'spark' ? G.UI.img('fx_merge') : null;
      ctx.save();
      ctx.globalAlpha = 1 - t;
      if (fx) {
        var sz = ar.w * (1 + t);
        ctx.drawImage(fx, cx - sz / 2, cy - sz / 2, sz, sz);
      } else {
        ctx.strokeStyle = a.type === 'spark' ? C.mergeGlow : '#DDDDDD';
        ctx.lineWidth = 3;
        for (var n = 0; n < 8; n++) {
          var ang = n * Math.PI / 4, r0 = 14 + 26 * t, r1 = r0 + 8;
          ctx.beginPath();
          ctx.moveTo(cx + Math.cos(ang) * r0, cy + Math.sin(ang) * r0);
          ctx.lineTo(cx + Math.cos(ang) * r1, cy + Math.sin(ang) * r1);
          ctx.stroke();
        }
      }
      ctx.restore();
    });

    // 드래그 중인 아이템 (손가락 위, 조금 크게)
    if (inp && inp.drag) {
      var dc = s.cells[inp.from];
      if (dc) {
        ctx.save();
        ctx.shadowColor = 'rgba(0,0,0,0.4)'; ctx.shadowBlur = 10; ctx.shadowOffsetY = 6;
        G.UI.drawCell(ctx, D, C, dc, inp.x, inp.y - 10, D.board.cell * D.board.itemScale * 1.18);
        ctx.restore();
      }
    }
  },

  // 아이템 또는 생성기 하나 (가운데 cx, cy, 크기 size)
  drawCell: function (ctx, D, C, c, cx, cy, size) {
    var ch = D.chains[c.chain];
    var name = c.kind === 'gen' ? 'gen_' + c.chain : c.chain + '_' + c.lv;
    var im = G.UI.img(name);
    if (im) { ctx.drawImage(im, cx - size / 2, cy - size / 2, size, size); return; }

    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    if (c.kind === 'gen') {
      G.UI.roundRect(ctx, cx - size / 2, cy - size / 2, size, size, 10);
      ctx.fillStyle = ch.color; ctx.fill();
      ctx.lineWidth = 3; ctx.strokeStyle = C.mergeGlow; ctx.stroke();
      ctx.fillStyle = C.outline;
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText(ch.name, cx, cy - 8);
      ctx.font = 'bold 11px sans-serif';
      ctx.fillText('생성기', cx, cy + 9);
      return;
    }
    var max = G.Board.maxLv(D, c.chain);
    var rad = size / 2 * (0.78 + 0.22 * c.lv / max);   // 단계가 높을수록 조금 크게
    ctx.beginPath(); ctx.arc(cx, cy, rad, 0, Math.PI * 2);
    ctx.fillStyle = ch.color; ctx.fill();
    ctx.lineWidth = c.lv >= max ? 4 : 2.5;
    ctx.strokeStyle = c.lv >= max ? C.gold : C.outline;
    ctx.stroke();
    ctx.fillStyle = C.outline;
    ctx.font = 'bold 18px sans-serif';
    ctx.fillText(String(c.lv), cx, cy - 6);
    ctx.font = '10px sans-serif';
    ctx.fillText(ch.steps[c.lv - 1], cx, cy + 12);
  },

  drawPressRing: function (ctx, C, r, t) {
    if (t < 0.15) return;   // 짧게 누를 때는 안 보이게
    var p = Math.min(1, (t - 0.15) / 0.85);
    ctx.save();
    ctx.beginPath();
    ctx.arc(r.x + r.w / 2, r.y + r.h / 2, r.w / 2 - 2, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * p);
    ctx.lineWidth = 4; ctx.strokeStyle = '#E0503A';
    ctx.stroke();
    ctx.restore();
  },

  drawHint: function (ctx, D, C, now) {
    var H = D.layout.hint;
    var tut = G.tutText();
    var text = (G.hint && now < G.hint.until) ? G.hint.text : (tut || D.texts.hintMerge);
    ctx.fillStyle = C.cream;
    ctx.font = '13px sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(text, D.view.w / 2, H.y + H.h / 2);
  }
};
