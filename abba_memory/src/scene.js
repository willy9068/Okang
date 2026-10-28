// 장면 상태: 'merge'(머지 보드) / 'story'(대화창: 도입·스토리 1·2·마무리) / 'end'(끝 화면)
// 흐름: 도입 → 머지 → 확장 1 → 스토리 1 → 머지 → 확장 2 → 스토리 2 → 마무리 → 끝 화면
var G = G || {};

G.Scene = {
  list: ['merge', 'story', 'end'],
  current: 'merge',

  go: function (name) {
    if (G.Scene.list.indexOf(name) < 0) return;
    G.Scene.current = name;
  },

  is: function (name) { return G.Scene.current === name; }
};
