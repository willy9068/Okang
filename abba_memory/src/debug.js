// 디버그 패널: D키로 열고 닫기. 휴대폰에서는 주소 끝에 ?debug 를 붙이면 왼쪽 위에 열기 버튼이 생깁니다.
var G = G || {};

G.Debug = {
  el: null,
  showFps: false,
  frames: 0,
  last: 0,
  fps: 0,

  init: function () {
    var D = G.DATA;
    var el = document.createElement('div');
    el.id = 'debug';
    el.style.display = 'none';

    var chainOpts = Object.keys(D.chains).map(function (k) {
      return '<option value="' + k + '">' + D.chains[k].name + '</option>';
    }).join('');
    var lvOpts = '';
    for (var lv = 1; lv <= 5; lv++) lvOpts += '<option value="' + lv + '">' + lv + '단계</option>';

    el.innerHTML =
      '<b>디버그 (D키)</b>' +
      '<button data-a="money">돈 +1,000</button>' +
      '<button data-a="expand">확장 단계 건너뛰기</button>' +
      '<button data-a="reset">보드 초기화</button>' +
      '<div class="row"><select id="dbgChain">' + chainOpts + '</select>' +
      '<select id="dbgLv">' + lvOpts + '</select>' +
      '<button data-a="make">아이템 생성</button></div>' +
      '<button data-a="fill">보드 가득 채우기</button>' +
      '<button data-a="orders">주문 새로 뽑기</button>' +
      '<div class="row"><button data-a="tutAgain">튜토리얼 다시</button><button data-a="tutSkip">튜토리얼 끝내기</button></div>' +
      '<button data-a="info">진행 정보 (걸린 시간·주문 수)</button>' +
      '<div class="row"><select id="dbgStory">' +
        Object.keys(G.STORY).map(function (k) { return '<option value="' + k + '">' + k + '</option>'; }).join('') +
        '</select><button data-a="story">스토리 보기</button></div>' +
      '<label><input type="checkbox" id="dbgFps"> FPS 표시</label>' +
      '<button data-a="wipe">저장 지우고 새로 시작</button>' +
      '<button data-a="images">이미지 상태</button>' +
      '<pre id="dbgOut"></pre>';
    document.body.appendChild(el);
    G.Debug.el = el;

    el.addEventListener('click', function (e) {
      var a = e.target.getAttribute && e.target.getAttribute('data-a');
      if (a) G.Debug.act(a);
    });
    document.getElementById('dbgFps').addEventListener('change', function (e) {
      G.Debug.showFps = e.target.checked;
    });
    window.addEventListener('keydown', function (e) {
      if (e.key === 'd' || e.key === 'D') G.Debug.toggle();
    });
    if (/[?&]debug/.test(window.location.search)) {
      var b = document.createElement('button');
      b.id = 'debugOpen'; b.textContent = 'D';
      b.addEventListener('click', G.Debug.toggle);
      document.body.appendChild(b);
    }
  },

  toggle: function () {
    var el = G.Debug.el;
    el.style.display = el.style.display === 'none' ? 'block' : 'none';
  },

  out: function (t) { document.getElementById('dbgOut').textContent = t; },

  act: function (a) {
    var D = G.DATA, s = G.state;
    if (a === 'money') { s.money += 1000; G.save(); }
    else if (a === 'expand') {
      // 비용만큼 돈을 주고 확장 (확장 뒤 스토리도 그대로 나옴)
      var cost = G.Expand.cost(D, s);
      if (cost === null) { G.Debug.out('더 확장할 단계가 없습니다.'); return; }
      if (!G.Scene.is('merge')) { G.Debug.out('머지 화면에서만 됩니다.'); return; }
      s.money += cost;
      G.tapExpand();
    }
    else if (a === 'story') {
      // 진행과 상관없이 보기만 함 (끝나면 머지로)
      G.openStory(document.getElementById('dbgStory').value, true);
    }
    else if (a === 'reset') {
      s.board = G.Board.create(D);
      G.Board.setStage(D, s.board, s.expand);
      G.save();
      G.Debug.out('보드를 처음 상태로 되돌렸습니다.');
    }
    else if (a === 'make') {
      var chain = document.getElementById('dbgChain').value;
      var lv = Math.min(+document.getElementById('dbgLv').value, G.Board.maxLv(D, chain));
      var at = G.Board.emptyCells(s.board)[0];
      if (at === undefined) at = -1;
      if (at < 0) { G.Debug.out('빈 칸이 없습니다.'); return; }
      s.board.cells[at] = G.Board.newItem(s.board, chain, lv);
      G.addAnim({ type: 'pop', id: s.board.cells[at].id, dur: 260 });
      G.save();
    }
    else if (a === 'fill') {
      var keys = Object.keys(D.chains);
      for (var i = 0; i < s.board.cells.length; i++) {
        if (!s.board.cells[i] && G.Board.isOpen(s.board, i)) s.board.cells[i] = G.Board.newItem(s.board, keys[i % keys.length], 1 + (i % 3));
      }
      G.save();
    }
    else if (a === 'orders') {
      s.orders = [];
      G.Order.fillAll(D, s, G.rng);
      G.save();
    }
    else if (a === 'tutAgain') {
      G.Tut.setup(s);
      G.story = null;
      G.Scene.go('merge');
      G.save();
    }
    else if (a === 'tutSkip') { G.Tut.finish(); }
    else if (a === 'info') {
      G.Debug.out('머지 시간 ' + G.fmtTime(s.playMs) + '\n낸 주문 ' + s.served +
        '\n돈 ' + s.money + '\n확장 ' + s.expand + '단계\n튜토리얼 ' + (s.tut >= G.Tut.DONE ? '끝남' : (s.tut + 1) + '단계'));
    }
    else if (a === 'wipe') {
      G.clearSave();
      G.newGame();
      G.save();
      G.playNextStory();
      G.Debug.out('저장을 지우고 새로 시작했습니다.');
    }
    else if (a === 'images') {
      var lines = D.images.map(function (n) {
        return (G.IMG[n] ? '[있음] ' : G.IMG_FAIL[n] ? '[없음] ' : '[로딩] ') + n;
      });
      G.Debug.out(lines.join('\n'));
    }
  },

  tick: function (now) {
    G.Debug.frames++;
    if (now - G.Debug.last >= 1000) {
      G.Debug.fps = G.Debug.frames;
      G.Debug.frames = 0;
      G.Debug.last = now;
    }
    if (G.Debug.showFps) {
      var ctx = G.ctx;
      ctx.fillStyle = 'rgba(0,0,0,0.6)';
      ctx.fillRect(4, 60, 64, 20);
      ctx.fillStyle = '#7CFC00';
      ctx.font = '12px monospace';
      ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
      ctx.fillText('FPS ' + G.Debug.fps, 8, 70);
    }
  }
};
