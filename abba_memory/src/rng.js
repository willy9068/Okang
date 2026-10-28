// 시드 난수 (mulberry32). 같은 시드면 항상 같은 순서의 수가 나옵니다.
var G = G || {};

G.makeRng = function (seed) {
  var s = seed >>> 0;
  var rng = function () {
    s = (s + 0x6D2B79F5) >>> 0;
    var t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  // 저장·불러오기용: 현재 상태값
  rng.getState = function () { return s; };
  rng.setState = function (v) { s = v >>> 0; };
  return rng;
};
