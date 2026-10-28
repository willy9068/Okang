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
      '<button data-a="restore">복구 단계 +1</button>' +
      '<button data-a="reset">보드 초기화</button>' +
      '<div class="row"><select id="dbgChain">' + chainOpts + '</select>' +
      '<select id="dbgLv">' + lvOpts + '</select>' +
      '<button data-a="make">아이템 생성</button></div>' +
      '<button data-a="fill">보드 가득 채우기</button>' +
      '<button data-a="story" disabled>스토리 장면 보기 (3일차)</button>' +
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
    else if (a === 'restore') {
      s.restore = Math.min(D.texts.shopStage.length - 1, s.restore + 1);
      G.save();
    }
    else if (a === 'reset') {
      s.board = G.Board.create(D);
      G.save();
      G.Debug.out('보드를 처음 상태로 되돌렸습니다.');
    }
    else if (a === 'make') {
      var chain = document.getElementById('dbgChain').value;
      var lv = Math.min(+document.getElementById('dbgLv').value, G.Board.maxLv(D, chain));
      var at = s.board.cells.indexOf(null);
      if (at < 0) { G.Debug.out('빈 칸이 없습니다.'); return; }
      s.board.cells[at] = G.Board.newItem(s.board, chain, lv);
      G.addAnim({ type: 'pop', id: s.board.cells[at].id, dur: 260 });
      G.save();
    }
    else if (a === 'fill') {
      var keys = Object.keys(D.chains);
      for (var i = 0; i < s.board.cells.length; i++) {
        if (!s.board.cells[i]) s.board.cells[i] = G.Board.newItem(s.board, keys[i % keys.length], 1 + (i % 3));
      }
      G.save();
    }
    else if (a === 'wipe') {
      G.clearSave();
      G.newGame();
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
