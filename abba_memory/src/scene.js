// 장면 상태: 도입 → 머지 → 복구 → 스토리 → … → 마무리
// 1일차에는 머지 장면만 있습니다. 나머지는 3~4일차에 채웁니다.
var G = G || {};

G.Scene = {
  list: ['intro', 'merge', 'story', 'ending'],
  current: 'merge',

  go: function (name) {
    if (G.Scene.list.indexOf(name) < 0) return;
    G.Scene.current = name;
  },

  is: function (name) { return G.Scene.current === name; }
};
