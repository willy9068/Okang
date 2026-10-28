// 가게 확장 규칙 (순수 계산만)
var G = G || {};

G.Expand = {
  // 다음 확장 비용 (다 확장했으면 null)
  cost: function (data, st) {
    var c = data.expand.costs;
    return st.expand < c.length ? c[st.expand] : null;
  },

  can: function (data, st) {
    var c = G.Expand.cost(data, st);
    return c !== null && st.money >= c;
  },

  // 결과: 'ok' / 'noMoney' / 'max'
  apply: function (data, st) {
    var c = G.Expand.cost(data, st);
    if (c === null) return 'max';
    if (st.money < c) return 'noMoney';
    st.money -= c;
    st.expand++;
    return 'ok';
  }
};
