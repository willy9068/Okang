// 자동 테스트 (순수 계산만). 실행: node tools/test.js
var fs = require('fs');
var path = require('path');
var vm = require('vm');

var ctx = { Math: Math, JSON: JSON };
vm.createContext(ctx);
['data.js', 'rng.js', 'board.js'].forEach(function (f) {
  vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'src', f), 'utf8'), ctx, { filename: f });
});
var G = ctx.G, D = G.DATA, B = G.Board;

var pass = 0, fail = 0;
function check(name, cond) {
  if (cond) pass++;
  else { fail++; console.log('  실패: ' + name); }
}
function emptyBoard() {
  var s = B.create(D);
  for (var i = 0; i < s.cells.length; i++) if (s.cells[i] && s.cells[i].kind === 'item') s.cells[i] = null;
  return s;
}
function genIdx(s, chain) {
  for (var i = 0; i < s.cells.length; i++) if (s.cells[i] && s.cells[i].kind === 'gen' && s.cells[i].chain === chain) return i;
  return -1;
}

// --- 보드 만들기 ---
(function () {
  var s = B.create(D);
  check('칸 수 = 가로×세로', s.cells.length === D.board.cols * D.board.rows);
  check('생성기 2개', s.cells.filter(function (c) { return c && c.kind === 'gen'; }).length === D.generators.length);
  check('시작 재료 수', B.itemCount(s) === D.startItems.length);
})();

// --- 합성 ---
(function () {
  var s = emptyBoard();
  s.cells[10] = B.newItem(s, 'oden', 1);
  s.cells[11] = B.newItem(s, 'oden', 1);
  var r = B.drop(D, s, 10, 11);
  check('같은 종류·같은 단계는 합쳐짐', r.type === 'merge' && s.cells[11].lv === 2 && s.cells[11].chain === 'oden');
  check('합친 뒤 원래 칸은 빈 칸', s.cells[10] === null);
  check('합친 뒤 아이템 1개', B.itemCount(s) === 1);

  s.cells[12] = B.newItem(s, 'oden', 1);
  r = B.drop(D, s, 12, 11);
  check('단계가 다르면 자리만 바뀜', r.type === 'swap' && s.cells[11].lv === 1 && s.cells[12].lv === 2);

  s.cells[20] = B.newItem(s, 'gukbap', 2);
  r = B.drop(D, s, 20, 12);
  check('종류가 다르면 합쳐지지 않음', r.type === 'swap' && B.itemCount(s) === 3);

  var max = B.maxLv(D, 'oden');
  s.cells[30] = B.newItem(s, 'oden', max);
  s.cells[31] = B.newItem(s, 'oden', max);
  r = B.drop(D, s, 30, 31);
  check('최종 단계는 합쳐지지 않음', r.type === 'swap' && s.cells[30].lv === max && s.cells[31].lv === max);

  r = B.drop(D, s, 30, 40);
  check('빈 칸으로는 옮겨짐', r.type === 'move' && s.cells[40] && s.cells[30] === null);

  var g = genIdx(s, 'oden');
  r = B.drop(D, s, 40, g);
  check('생성기 위에는 놓을 수 없음', r.type === 'none' && s.cells[g].kind === 'gen' && s.cells[40]);

  check('생성기는 드래그할 수 없음', B.drop(D, s, g, 41).type === 'none');
})();

// --- 생성기 ---
(function () {
  var s = emptyBoard();
  var g = genIdx(s, 'oden');
  var rng = G.makeRng(1);
  var r = B.spawn(s, g, rng);
  check('생성기 탭 → 빈 칸에 1단계', r.ok && s.cells[r.idx].lv === 1 && s.cells[r.idx].chain === 'oden');
  var gc = B.col(s, g), gr = B.row(s, g);
  var d = Math.abs(B.col(s, r.idx) - gc) + Math.abs(B.row(s, r.idx) - gr);
  check('생성기 바로 옆 칸에 생김', d === 1);

  var before = B.itemCount(s);
  while (!B.isFull(s)) B.spawn(s, g, rng);
  check('보드가 다 찰 때까지 생성됨', B.itemCount(s) === before + (s.cells.length - D.generators.length - before));
  r = B.spawn(s, g, rng);
  check('가득 차면 생성 불가', !r.ok && r.reason === 'full');
  check('생성기가 아닌 칸은 생성 불가', !B.spawn(s, 20, rng).ok);
})();

// --- 길게 눌러 삭제 ---
(function () {
  var s = B.create(D);
  var it = D.startItems[0];
  var i = B.idx(s, it.col, it.row);
  check('아이템은 삭제됨', B.remove(s, i) && s.cells[i] === null);
  check('생성기는 삭제 안 됨', !B.remove(s, genIdx(s, 'oden')));
  check('빈 칸 삭제는 아무 일 없음', !B.remove(s, i));
})();

// --- 합칠 수 있는 칸 표시 ---
(function () {
  var s = emptyBoard();
  s.cells[10] = B.newItem(s, 'gukbap', 2);
  s.cells[11] = B.newItem(s, 'gukbap', 2);
  s.cells[12] = B.newItem(s, 'gukbap', 3);
  s.cells[13] = B.newItem(s, 'oden', 2);
  var t = B.mergeTargets(D, s, 10);
  check('합칠 수 있는 칸만 표시', t.length === 1 && t[0] === 11);
})();

// --- 시드 난수 ---
(function () {
  var a = G.makeRng(42), b = G.makeRng(42), same = true;
  for (var i = 0; i < 100; i++) if (a() !== b()) same = false;
  check('같은 시드면 같은 난수', same);

  function play(seed) {
    var s = emptyBoard(), rng = G.makeRng(seed), g = genIdx(s, 'gukbap'), out = [];
    for (var k = 0; k < 12; k++) out.push(B.spawn(s, g, rng).idx);
    return out.join(',');
  }
  check('같은 시드면 같은 생성 위치', play(7) === play(7));
  var r = G.makeRng(5); r(); r();
  var st = r.getState(), x = r();
  r.setState(st);
  check('난수 상태 저장·복원', r() === x);
})();

// --- 저장 형식 ---
(function () {
  var s = B.create(D);
  var o = JSON.parse(JSON.stringify(B.serialize(s)));
  var back = B.deserialize(D, o);
  check('저장 → 불러오기 그대로', back && JSON.stringify(back.cells) === JSON.stringify(s.cells));
  o.cols = 99;
  check('보드 크기가 다르면 불러오지 않음', B.deserialize(D, o) === null);
  check('잘못된 저장은 불러오지 않음', B.deserialize(D, null) === null);
})();

console.log('통과 ' + pass + ' / 실패 ' + fail);
process.exit(fail ? 1 : 0);
