// 화면 그리기. 이미지가 있으면 이미지, 없으면 색 블록·글자로 그립니다.
var G = G || {};

G.ASSET_BASE = G.ASSET_BASE || '../assets/';   // 제출본(단일 HTML)에서는 빌드가 바꿈
G.IMG = {};          // 이름 → 다 불러온 Image
G.IMG_FAIL = {};     // 이름 → 불러오기 실패

G.UI = {
  loadImages: function () {
    G.DATA.images.forEach(function (name) {
      // 제출본(단일 HTML)은 들어 있는 그림만 씀. 없는 그림은 요청하지 않음 (콘솔 오류 0)
      if (G.ASSET_ONLY && !(G.ASSET_DATA && G.ASSET_DATA[name])) { G.IMG_FAIL[name] = true; return; }
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
    G.UI.drawExpandBtn(ctx, D, C, now);
    G.UI.drawOrders(ctx, D, C, now);
    G.UI.drawPanel(ctx, D, C);
    G.UI.drawBoard(ctx, D, C, now);
    G.UI.drawEffects(ctx, D, C, now);
    G.UI.drawHint(ctx, D, C, now);
    if (G.Tut.active()) G.Tut.draw(ctx, now);
    if (G.Scene.is('story') && G.story) {
      ctx.save();
      ctx.globalAlpha = Math.min(1, (now - G.story.open) / D.story.fadeMs);
      G.UI.drawStory(ctx, D, C, now);
      ctx.restore();
    } else if (G.Scene.is('end')) {
      G.UI.drawEnd(ctx, D, C);
    } else if (G.Scene.is('title')) {
      G.UI.drawTitle(ctx, D, C);
    }
    if (G.Edit.on) G.Edit.draw(ctx);
  },

  drawShop: function (ctx, D, C) {
    var L = D.layout.shop, st = G.state.expand;
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

  // 확장 버튼: 비용과 모은 돈 막대. 돈이 충분하면 반짝임
  drawExpandBtn: function (ctx, D, C, now) {
    var cost = G.Expand.cost(D, G.state);
    if (cost === null) return;
    var R = D.layout.expandBtn, ok = G.state.money >= cost;
    var press = G.input && G.input.button === 'expand';
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
    var icon = G.UI.img('ui_expand');
    if (icon) ctx.drawImage(icon, 10, 4, 24, 24);
    ctx.fillStyle = ok ? '#FFFFFF' : '#C9CED8';
    ctx.font = 'bold 15px sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(D.texts.expandBtn + '  ' + G.state.money.toLocaleString() + ' / ' + cost.toLocaleString(), R.w / 2, R.h / 2 - 3);
    ctx.restore();
  },

  // 손님 주문 칸 3개
  drawOrders: function (ctx, D, C, now) {
    var inp = G.input;
    var drag = inp && inp.drag ? G.state.board.cells[inp.from] : null;
    var hoverOrder = drag ? G.orderAt(inp.x, inp.y) : -1;
    G.state.orders.forEach(function (o, oi) {
      if (!G.Tut.showOrder(oi)) return;   // 튜토리얼 중에는 튜토리얼 손님만
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

      // 손님 얼굴 (칸 위쪽 절반)
      var cust = D.customers.filter(function (c) { return c.id === o.cust; })[0] || D.customers[0];
      var fs = Math.min(r.w * 0.62, r.h * 0.5);       // 얼굴 크기
      var cim = G.UI.img('cust_' + cust.id);
      if (cim) ctx.drawImage(cim, r.w / 2 - fs / 2, 0, fs, fs);
      else {
        ctx.beginPath(); ctx.arc(r.w / 2, fs / 2, fs * 0.38, 0, Math.PI * 2);
        ctx.fillStyle = cust.color; ctx.fill();
        ctx.lineWidth = 3; ctx.strokeStyle = C.outline; ctx.stroke();
        ctx.fillStyle = C.cream; ctx.font = 'bold 11px sans-serif';
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(cust.name, r.w / 2, fs / 2);
      }

      // 손님 바로 밑 접시 (가십하버식). 접시 위에 요리
      var pw = r.w * 0.94, ph = r.h * 0.32, py = r.h * 0.6;   // 접시 크기·가운데 높이
      var pim = G.UI.img('ui_plate');
      if (pim) ctx.drawImage(pim, r.w / 2 - pw / 2, py - ph / 2, pw, ph);
      else {
        ctx.beginPath(); ctx.ellipse(r.w / 2, py + 3, pw / 2, ph / 2, 0, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0,0,0,0.18)'; ctx.fill();               // 그림자
        ctx.beginPath(); ctx.ellipse(r.w / 2, py, pw / 2, ph / 2, 0, 0, Math.PI * 2);
        ctx.fillStyle = '#FBF8F2'; ctx.fill();
        ctx.lineWidth = 3; ctx.strokeStyle = C.outline; ctx.stroke();
        ctx.beginPath(); ctx.ellipse(r.w / 2, py, pw / 2 - 7, ph / 2 - 5, 0, 0, Math.PI * 2);
        ctx.lineWidth = 2; ctx.strokeStyle = '#7FA6C9'; ctx.stroke();  // 파란 테두리
      }
      if (accept || ready) {   // 받을 수 있는 접시: 합칠 수 있는 칸과 같은 초록
        ctx.beginPath(); ctx.ellipse(r.w / 2, py, pw / 2 + 3, ph / 2 + 3, 0, 0, Math.PI * 2);
        ctx.lineWidth = hoverOrder === oi ? 9 : 7; ctx.strokeStyle = C.mergeHintDark; ctx.stroke();
        ctx.lineWidth = hoverOrder === oi ? 5 : 3.5; ctx.strokeStyle = C.mergeHint; ctx.stroke();
      }

      // 필요한 요리 (이미 낸 것은 흐리게, 보드에 있는 것은 초록 체크)
      var n = o.needs.length, size = Math.min(ph * (n === 1 ? 1.15 : 1.0), r.w * (n === 1 ? 0.45 : 0.36));
      o.needs.forEach(function (need, k2) {
        var cx = n === 1 ? r.w / 2 : r.w / 2 + (k2 === 0 ? -1 : 1) * pw * 0.22;
        var cy = py - ph * 0.12;
        ctx.save();
        if (need.done) ctx.globalAlpha = 0.35;
        G.UI.drawCell(ctx, D, C, { kind: 'item', chain: need.chain, lv: need.lv }, cx, cy, size);
        ctx.restore();
        if (have[k2] && !need.done) G.UI.drawCheck(ctx, cx + size / 2 - 6, cy - size / 2 + 6);
      });

      // 보상 또는 내기 (접시 아래)
      var ry = r.h * 0.9;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      if (ready) {
        G.UI.roundRect(ctx, r.w / 2 - 46, ry - 13, 92, 26, 10);
        ctx.fillStyle = C.teal; ctx.fill();
        ctx.lineWidth = 2; ctx.strokeStyle = C.gold; ctx.stroke();
        ctx.fillStyle = '#FFFFFF'; ctx.font = 'bold 14px sans-serif';
        ctx.fillText(D.texts.serveReady + ' +' + o.reward, r.w / 2, ry);
      } else {
        G.UI.roundRect(ctx, r.w / 2 - 36, ry - 12, 72, 24, 10);
        ctx.fillStyle = 'rgba(31,43,74,0.85)'; ctx.fill();
        var coin = G.UI.img('ui_coin');
        if (coin) ctx.drawImage(coin, r.w / 2 - 32, ry - 9, 18, 18);
        else {
          ctx.beginPath(); ctx.arc(r.w / 2 - 23, ry, 8, 0, Math.PI * 2);
          ctx.fillStyle = C.gold; ctx.fill();
        }
        ctx.fillStyle = C.cream; ctx.font = 'bold 14px sans-serif';
        ctx.fillText('+' + o.reward, r.w / 2 + 8, ry);
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

  // 돈 날아가기, 확장 번쩍
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
      } else if (a.type === 'expand') {
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
    // 확장 단계
    ctx.textAlign = 'right';
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText(D.texts.shopStage[G.state.expand], w - 22, 29);
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
      if (!G.Board.isOpen(s, i)) G.UI.drawLocked(ctx, C, r);
    }

    // 합칠 수 있는 칸 (드래그 중): 칸 안을 초록으로 깜빡이게 채움 (테두리는 아이템 위에 다시 그림)
    var pulse = 0.5 + 0.5 * Math.sin(now / 160);
    if (targets.length) {
      ctx.save();
      ctx.fillStyle = 'rgba(57,230,107,' + (0.25 + 0.3 * pulse) + ')';
      targets.forEach(function (t) {
        var tr = G.cellRect(t);
        G.UI.roundRect(ctx, tr.x + 2, tr.y + 2, tr.w - 4, tr.h - 4, 10);
        ctx.fill();
      });
      ctx.restore();
    }
    // 손가락 아래 칸
    if (hover >= 0 && hover !== inp.from && G.Board.isOpen(s, hover)) {
      var hr = G.cellRect(hover);
      var ok = targets.indexOf(hover) >= 0;
      G.UI.roundRect(ctx, hr.x + 2, hr.y + 2, hr.w - 4, hr.h - 4, 10);
      ctx.fillStyle = ok ? 'rgba(57,230,107,0.55)' : 'rgba(255,255,255,0.12)';
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
      if (c.kind === 'gen') G.UI.drawGenGlow(ctx, D, C, x + r.w / 2, y + r.h / 2, r.w, now, c.id);
      G.UI.drawCell(ctx, D, C, c, x + r.w / 2, y + r.h / 2, r.w * D.board.itemScale * k);
      if (press) G.UI.drawPressRing(ctx, C, r, (now - inp.t0) / D.input.longPressMs);
    }

    // 연출: 합성 반짝, 삭제 연기
    G.anims.forEach(function (a) {
      if (a.type === 'unlock') {
        var ut = (now - a.t0) / a.dur, ur = G.cellRect(a.idx);
        ctx.save();
        ctx.globalAlpha = 1 - ut;
        G.UI.roundRect(ctx, ur.x + 2, ur.y + 2, ur.w - 4, ur.h - 4, 10);
        ctx.fillStyle = 'rgba(255,214,120,0.55)'; ctx.fill();
        ctx.lineWidth = 3; ctx.strokeStyle = C.mergeGlow; ctx.stroke();
        ctx.restore();
        return;
      }
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

    // 합칠 수 있는 칸 테두리: 어두운 바깥선 + 밝은 초록 점선 (아이템 위에)
    if (targets.length) {
      ctx.save();
      targets.forEach(function (t) {
        var tr = G.cellRect(t);
        G.UI.roundRect(ctx, tr.x + 2, tr.y + 2, tr.w - 4, tr.h - 4, 10);
        ctx.setLineDash([]);
        ctx.lineWidth = 7; ctx.strokeStyle = C.mergeHintDark; ctx.stroke();
        ctx.setLineDash([8, 5]);
        ctx.lineDashOffset = -(now / 30) % 13;
        ctx.lineWidth = 4; ctx.strokeStyle = C.mergeHint; ctx.stroke();
      });
      ctx.restore();
    }

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

  // 닫힌 칸: ui_lock 그림, 없으면 어둡게 덮고 가운데 작은 자물쇠 (확장하면 열림)
  drawLocked: function (ctx, C, r) {
    var lockIm = G.UI.img('ui_lock');
    if (lockIm) { ctx.drawImage(lockIm, r.x + 2, r.y + 2, r.w - 4, r.h - 4); return; }
    var cx = r.x + r.w / 2, cy = r.y + r.h / 2;
    G.UI.roundRect(ctx, r.x + 2, r.y + 2, r.w - 4, r.h - 4, 10);
    ctx.fillStyle = C.locked; ctx.fill();
    ctx.save();
    ctx.globalAlpha = 0.75;
    ctx.lineWidth = 3; ctx.strokeStyle = '#C9B48A';
    ctx.beginPath(); ctx.arc(cx, cy - 4, 7, Math.PI, 0); ctx.stroke();   // 고리
    G.UI.roundRect(ctx, cx - 10, cy - 4, 20, 15, 3);                    // 몸통
    ctx.fillStyle = '#C9B48A'; ctx.fill();
    ctx.fillStyle = '#3A3028';
    ctx.fillRect(cx - 1.5, cy + 1, 3, 6);                                  // 열쇠 구멍
    ctx.restore();
  },

  // 생성기 뒤 노란 빛 (천천히 커졌다 작아짐) + 가끔 작은 별
  drawGenGlow: function (ctx, D, C, cx, cy, size, now, id) {
    var g = D.genGlow;
    var p = 0.5 + 0.5 * Math.sin(now / g.pulseMs * Math.PI * 2);
    var rad = size * (0.52 + 0.1 * p);
    ctx.save();
    var rg = ctx.createRadialGradient(cx, cy, size * 0.2, cx, cy, rad);
    rg.addColorStop(0, 'rgba(255,200,87,' + (0.35 + 0.25 * p) + ')');
    rg.addColorStop(1, 'rgba(255,200,87,0)');
    ctx.fillStyle = rg;
    ctx.fillRect(cx - rad, cy - rad, rad * 2, rad * 2);
    // 별: 생성기마다 시간을 조금 어긋나게
    var t = (now + id * 700) % g.starEveryMs;
    if (t < g.starMs) {
      var k = Math.sin(t / g.starMs * Math.PI);
      var sx = cx + size * 0.3, sy = cy - size * 0.3, ss = size * 0.45 * k;
      var fx = G.UI.img('fx_merge');
      ctx.globalAlpha = k;
      if (fx) ctx.drawImage(fx, sx - ss / 2, sy - ss / 2, ss, ss);
      else {
        ctx.fillStyle = '#FFF3C4';
        ctx.beginPath();
        for (var n = 0; n < 8; n++) {
          var ang = n * Math.PI / 4, rr = n % 2 ? ss * 0.15 : ss * 0.5;
          ctx.lineTo(sx + Math.cos(ang) * rr, sy + Math.sin(ang) * rr);
        }
        ctx.closePath(); ctx.fill();
      }
    }
    ctx.restore();
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
    var text = (G.hint && now < G.hint.until) ? G.hint.text : D.texts.hintMerge;
    ctx.fillStyle = C.cream;
    ctx.font = '13px sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(text, D.view.w / 2, H.y + H.h / 2);
  },

  // ---------- 스토리 (대화창 오버레이) ----------

  // 기억 장면 배경: 밤 + 등불 (bg_memory 이미지가 있으면 그것)
  // names: 쓸 배경 그림 이름 목록 (앞에서부터 있는 것, 다 없으면 bg_memory, 그것도 없으면 코드로 그린 밤)
  drawNight: function (ctx, D, C, names) {
    var im = null;
    (names || []).forEach(function (n) { if (!im) im = G.UI.img(n); });
    im = im || G.UI.img('bg_memory');
    if (im) { ctx.drawImage(im, 0, 0, D.view.w, D.view.h); return; }
    var g = ctx.createLinearGradient(0, 0, 0, D.view.h);
    g.addColorStop(0, C.night); g.addColorStop(1, C.nightDeep);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, D.view.w, D.view.h);
    [[70, 120], [190, 90], [330, 110], [460, 80]].forEach(function (p) {
      var rg = ctx.createRadialGradient(p[0], p[1], 2, p[0], p[1], 46);
      rg.addColorStop(0, 'rgba(255,200,87,0.9)'); rg.addColorStop(1, 'rgba(255,200,87,0)');
      ctx.fillStyle = rg;
      ctx.fillRect(p[0] - 46, p[1] - 46, 92, 92);
    });
  },

  // 글자 폭에 맞춰 줄바꿈 (띄어쓰기 우선, 긴 단어는 글자 단위)
  wrap: function (ctx, text, maxW) {
    var out = [], line = '';
    text.split(' ').forEach(function (word) {
      var t = line ? line + ' ' + word : word;
      if (ctx.measureText(t).width <= maxW) { line = t; return; }
      if (line) out.push(line);
      line = '';
      for (var i = 0; i < word.length; i++) {
        if (ctx.measureText(line + word[i]).width > maxW) { out.push(line); line = ''; }
        line += word[i];
      }
    });
    if (line) out.push(line);
    return out;
  },

  // 어둡게 만든 그림 (한 번 만들어 두고 다시 씀). 비쳐 보이지 않게 투명도 대신 색을 어둡게
  dimCache: {},
  dimmed: function (name, im) {
    if (G.UI.dimCache[name]) return G.UI.dimCache[name];
    var c = document.createElement('canvas');
    c.width = im.width; c.height = im.height;
    var x = c.getContext('2d');
    x.drawImage(im, 0, 0);
    x.globalCompositeOperation = 'source-atop';
    x.fillStyle = 'rgba(15,12,30,0.55)';
    x.fillRect(0, 0, c.width, c.height);
    G.UI.dimCache[name] = c;
    return c;
  },

  // 인물 한 명 (active = 말하는 중이면 밝고 조금 크게)
  drawPortrait: function (ctx, D, C, who, active) {
    var r = D.storyLayout[who];
    ctx.save();
    var dimNoImg = !active && !G.UI.img('char_' + who);
    if (dimNoImg) ctx.globalAlpha *= 0.4;
    var k = active ? 1.04 : 1;
    ctx.translate(r.x + r.w / 2, r.y + r.h);
    ctx.scale(k, k);
    ctx.translate(-r.w / 2, -r.h);
    var im = G.UI.img('char_' + who);
    if (im && !active) im = G.UI.dimmed('char_' + who, im);
    if (im) {
      var s = Math.min(r.w / im.width, r.h / im.height);
      ctx.drawImage(im, (r.w - im.width * s) / 2, r.h - im.height * s, im.width * s, im.height * s);
    } else {
      // placeholder: 상반신 (몸통 + 머리)
      var col = C[who], cx = r.w / 2;
      G.UI.roundRect(ctx, cx - 95, r.h - 190, 190, 200, 60);
      ctx.fillStyle = col[0]; ctx.fill();
      ctx.lineWidth = 4; ctx.strokeStyle = C.outline; ctx.stroke();
      ctx.fillStyle = col[1];
      if (who === 'father') {   // 멜빵
        ctx.fillRect(cx - 60, r.h - 190, 22, 200);
        ctx.fillRect(cx + 38, r.h - 190, 22, 200);
        ctx.fillRect(cx - 60, r.h - 90, 120, 100);
      } else {                  // 앞치마
        G.UI.roundRect(ctx, cx - 55, r.h - 150, 110, 160, 20);
        ctx.fill();
      }
      ctx.beginPath(); ctx.arc(cx, r.h - 250, 82, 0, Math.PI * 2);
      ctx.fillStyle = '#F2C9A0'; ctx.fill();
      ctx.lineWidth = 4; ctx.strokeStyle = C.outline; ctx.stroke();
      ctx.beginPath(); ctx.arc(cx, r.h - 262, 84, Math.PI * 1.05, Math.PI * 1.95);
      ctx.lineWidth = 26; ctx.strokeStyle = '#2B2420'; ctx.stroke();
      ctx.fillStyle = C.outline;
      ctx.beginPath(); ctx.arc(cx - 28, r.h - 245, 6, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(cx + 28, r.h - 245, 6, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
  },

  // 마무리 장면: bg_story2의 빈 간판 위에 코드로 '황가상점'
  drawSign: function (ctx, D, C, id) {
    if (id !== D.story.signScene) return;
    var r = D.storyLayout.sign, t = D.texts.signText;
    ctx.save();
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    var fsz = r.h * 0.55;
    ctx.font = 'bold ' + fsz + 'px "Malgun Gothic", "Apple SD Gothic Neo", sans-serif';
    var tw = ctx.measureText(t).width;
    if (tw > r.w * 0.86) { fsz *= r.w * 0.86 / tw; ctx.font = 'bold ' + fsz + 'px "Malgun Gothic", "Apple SD Gothic Neo", sans-serif'; }
    ctx.fillStyle = C.navy;
    ctx.fillText(t, r.x + r.w / 2, r.y + r.h / 2 + 2);
    ctx.restore();
  },

  choiceRect: function (k) {
    var L = G.DATA.storyLayout.choice;
    return { x: L.x, y: L.y + k * (L.h + L.gap), w: L.w, h: L.h };
  },

  choiceAt: function (x, y, n) {
    for (var k = 0; k < n; k++) if (G.inRect(G.UI.choiceRect(k), x, y)) return k;
    return -1;
  },

  drawStory: function (ctx, D, C, now) {
    var run = G.story.run, c = G.Story.current(run);
    if (c.kind === 'end') return;
    var who = c.kind === 'line' ? c.who : 'father';   // 고르는 동안은 '나'가 밝게
    G.UI.drawNight(ctx, D, C, D.story.bg[run.id]);
    G.UI.drawSign(ctx, D, C, run.id);
    G.UI.drawPortrait(ctx, D, C, 'father', who === 'father');
    G.UI.drawPortrait(ctx, D, C, 'mother', who === 'mother');

    var B = D.storyLayout.box, mono = c.kind === 'line' && who === 'mono';
    // 대화창
    var im = G.UI.img('ui_dialog');
    if (mono) {
      G.UI.roundRect(ctx, B.x, B.y, B.w, B.h, 16);
      ctx.fillStyle = 'rgba(20,28,51,0.88)'; ctx.fill();
      ctx.lineWidth = 2; ctx.strokeStyle = C.gold; ctx.stroke();
    } else if (im) {
      ctx.drawImage(im, B.x, B.y, B.w, B.h);
    } else {
      G.UI.roundRect(ctx, B.x, B.y, B.w, B.h, 16);
      ctx.fillStyle = C.cream; ctx.fill();
      ctx.lineWidth = 5; ctx.strokeStyle = C.navy; ctx.stroke();
      G.UI.roundRect(ctx, B.x + 6, B.y + 6, B.w - 12, B.h - 12, 12);
      ctx.lineWidth = 2; ctx.strokeStyle = C.gold; ctx.stroke();
    }

    // 이름표 (나: 왼쪽, 태자: 오른쪽, 장면 설명·속마음은 없음)
    if (who === 'father' || who === 'mother') {
      var name = D.names[who];
      ctx.font = 'bold 17px sans-serif';
      var nw = ctx.measureText(name).width + 34;
      var nx = who === 'father' ? B.x + B.pad - 10 : B.x + B.w - B.pad + 10 - nw;   // 모서리 장식 안쪽
      G.UI.roundRect(ctx, nx, B.y - 18, nw, 34, 12);
      ctx.fillStyle = C.navy; ctx.fill();
      ctx.lineWidth = 2; ctx.strokeStyle = C.gold; ctx.stroke();
      ctx.fillStyle = C.cream; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(name, nx + nw / 2, B.y - 1);
    }

    // 글자 (한 글자씩)
    var full = c.kind === 'line' ? c.text : c.prompt;
    var n = c.kind === 'line'
      ? Math.min(full.length, Math.floor((now - G.story.t0) / 1000 * D.story.charsPerSec))
      : full.length;
    ctx.font = (mono ? 'italic ' : '') + '19px sans-serif';
    ctx.fillStyle = mono ? C.mono : (who === 'narr' ? '#5A4A3A' : C.outline);
    ctx.textAlign = 'left'; ctx.textBaseline = 'top';
    var lines = G.UI.wrap(ctx, full, B.w - 2 * B.pad), shown = 0;
    lines.forEach(function (l, i) {
      var part = l.slice(0, Math.max(0, n - shown));
      shown += l.length + 1;   // 줄바꿈 자리의 띄어쓰기 몫
      ctx.fillText(part, B.x + B.pad, B.y + B.padTop + i * 30);
    });
    if (c.kind === 'line' && n >= full.length && Math.floor(now / 400) % 2 === 0) {
      ctx.fillStyle = mono ? C.mono : C.navy;
      ctx.textAlign = 'right'; ctx.textBaseline = 'bottom';
      ctx.font = '16px sans-serif';
      ctx.fillText(D.texts.tapNext, B.x + B.w - B.pad, B.y + B.h - 24);
    }

    // 선택지 3개
    if (c.kind === 'choice') {
      c.options.forEach(function (o, k) {
        var r = G.UI.choiceRect(k);
        G.UI.roundRect(ctx, r.x, r.y, r.w, r.h, 14);
        ctx.fillStyle = C.cream; ctx.fill();
        ctx.lineWidth = 3; ctx.strokeStyle = C.navy; ctx.stroke();
        ctx.fillStyle = C.gold;
        ctx.beginPath(); ctx.arc(r.x + 28, r.y + r.h / 2, 13, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = C.navy; ctx.font = 'bold 15px sans-serif';
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(String(k + 1), r.x + 28, r.y + r.h / 2 + 1);
        ctx.fillStyle = C.outline; ctx.font = '17px sans-serif';
        ctx.textAlign = 'left';
        var ol = G.UI.wrap(ctx, o.text, r.w - 64);
        ol.forEach(function (t, i) {
          ctx.fillText(t, r.x + 50, r.y + r.h / 2 + (i - (ol.length - 1) / 2) * 22);
        });
      });
    }
  },

  // ---------- 타이틀 · 끝 화면 버튼 (ui_text.js의 layout.menuBtn, 아래로 나란히) ----------
  menuRect: function (k) {
    var M = G.DATA.layout.menuBtn;
    return { x: M.x, y: M.y + k * (M.h + M.gap), w: M.w, h: M.h };
  },

  menuAt: function (x, y, n) {
    for (var k = 0; k < n; k++) if (G.inRect(G.UI.menuRect(k), x, y)) return k;
    return -1;
  },

  drawMenu: function (ctx, C, items) {
    items.forEach(function (it, k) {
      var r = G.UI.menuRect(k);
      G.UI.roundRect(ctx, r.x, r.y, r.w, r.h, 14);
      ctx.fillStyle = it[1]; ctx.fill();
      ctx.lineWidth = 3; ctx.strokeStyle = C.gold; ctx.stroke();
      ctx.fillStyle = '#FFFFFF'; ctx.font = 'bold 18px sans-serif';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(it[0], r.x + r.w / 2, r.y + r.h / 2);
    });
  },

  // 글자가 잘 보이게 가로 띠를 살짝 어둡게 (위아래는 흐리게)
  darkBand: function (ctx, D, y, h) {
    var g = ctx.createLinearGradient(0, y, 0, y + h);
    g.addColorStop(0, 'rgba(20,28,51,0)'); g.addColorStop(0.5, 'rgba(20,28,51,0.6)'); g.addColorStop(1, 'rgba(20,28,51,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, y, D.view.w, h);
  },

  // ---------- 타이틀 ----------
  drawTitle: function (ctx, D, C) {
    var T = D.texts, R = D.layout.titleText;
    G.UI.drawNight(ctx, D, C, ['bg_title']);
    G.UI.darkBand(ctx, D, R.y - 40, R.h + 80);
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillStyle = C.cream; ctx.font = 'bold 26px sans-serif';
    ctx.fillText(T.titleMain, D.view.w / 2, R.y + R.h * 0.25);
    ctx.fillStyle = C.mono; ctx.font = 'bold 44px sans-serif';
    ctx.fillText(T.titleSub, D.view.w / 2, R.y + R.h * 0.58);
    ctx.fillStyle = 'rgba(244,230,204,0.75)'; ctx.font = '14px sans-serif';
    ctx.fillText(T.titleNote, D.view.w / 2, R.y + R.h * 0.9);
    G.UI.drawMenu(ctx, C, G.hasSave
      ? [[T.titleContinue, C.teal], [T.titleNew, '#4A5468']]
      : [[T.titleStart, C.teal]]);
  },

  // ---------- 끝 화면 ----------
  drawEnd: function (ctx, D, C) {
    var T = D.texts;
    G.UI.drawNight(ctx, D, C);
    G.UI.darkBand(ctx, D, 270, 290);
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillStyle = C.mono; ctx.font = 'bold 28px sans-serif';
    ctx.fillText(T.endTitle, D.view.w / 2, 330);
    ctx.fillStyle = C.cream; ctx.font = '18px sans-serif';
    T.endLines.forEach(function (l, i) { ctx.fillText(l, D.view.w / 2, 400 + i * 30); });
    ctx.fillStyle = 'rgba(244,230,204,0.6)'; ctx.font = '14px sans-serif';
    ctx.fillText(T.endTime.replace('{time}', G.fmtTime(G.state.playMs)), D.view.w / 2, 520);
    G.UI.drawMenu(ctx, C, [[T.endRestart, C.teal], [T.endContinue, '#4A5468']]);
  }
};
