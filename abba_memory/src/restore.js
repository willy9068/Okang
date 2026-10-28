// 가게 복구 규칙 (순수 계산만)
var G = G || {};

G.Restore = {
  // 다음 복구 비용 (다 복구했으면 null)
  cost: function (data, st) {
    var c = data.restore.costs;
    return st.restore < c.length ? c[st.restore] : null;
  },

  can: function (data, st) {
    var c = G.Restore.cost(data, st);
    return c !== null && st.money >= c;
  },

  // 결과: 'ok' / 'noMoney' / 'max'
  apply: function (data, st) {
    var c = G.Restore.cost(data, st);
    if (c === null) return 'max';
    if (st.money < c) return 'noMoney';
    st.money -= c;
    st.restore++;
    return 'ok';
  }
};
