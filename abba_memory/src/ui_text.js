// 화면 배치(위치·크기, 540×960 좌표) · 화면 문장 · 이름표 · 손님 이름
// ★ 편집기(abba_memory/편집기_켜기.bat)가 이 파일을 통째로 다시 씁니다. 직접 고쳐도 되지만 형식(JSON)을 지켜 주세요.
var G = G || {};

G.UI_TEXT = {
  "layout": {
    "hudH": 56,
    "shop": {
      "y": 0,
      "h": 330
    },
    "panel": {
      "y": 330,
      "h": 600
    },
    "hint": {
      "y": 930,
      "h": 30
    },
    "expandBtn": {
      "x": 175,
      "y": 9,
      "w": 200,
      "h": 38
    },
    "orders": {
      "y": 129,
      "w": 160,
      "h": 200,
      "gap": 15
    },
    "menuBtn": {
      "x": 110,
      "y": 610,
      "w": 320,
      "h": 53,
      "gap": 20
    },
    "titleText": {
      "y": 250,
      "h": 150
    },
    "tutBubble": {
      "x": 12,
      "y": 824,
      "w": 516,
      "h": 100
    }
  },
  "boardPos": {
    "top": 342,
    "cell": 64
  },
  "storyLayout": {
    "father": {
      "x": 6,
      "y": 330,
      "w": 280,
      "h": 400
    },
    "mother": {
      "x": 254,
      "y": 330,
      "w": 280,
      "h": 400
    },
    "box": {
      "x": 16,
      "y": 700,
      "w": 508,
      "h": 200,
      "pad": 74,
      "padTop": 56
    },
    "choice": {
      "x": 40,
      "y": 430,
      "w": 460,
      "h": 66,
      "gap": 14
    },
    "sign": {
      "x": 78,
      "y": 175,
      "w": 374,
      "h": 146
    }
  },
  "names": {
    "mother": "태자",
    "father": "나"
  },
  "customers": [
    {
      "id": 1,
      "name": "부두 일꾼",
      "color": "#8C6B4F"
    },
    {
      "id": 2,
      "name": "상인 아주머니",
      "color": "#C46A8A"
    },
    {
      "id": 3,
      "name": "학생",
      "color": "#4D5B7A"
    },
    {
      "id": 4,
      "name": "할아버지",
      "color": "#7E8C5A"
    }
  ],
  "tutorial": [
    "장사 첫날이네예!\n저 생선 상자부터 함 눌러 보이소.\n생선살이 나올 끼라예.",
    "똑같은 생선살 두 개를 끌어다가 포개 보이소.\n그라믄 어묵 반죽이 되는 기라예.",
    "됐네예!\n그 어묵 반죽, 손님 앞 접시에 갖다 노이소.",
    "돈 벌었지예? 돈이 모이믄 위에 '가게 확장'을 누르이소.\n가게가 넓어집니더.\n인자 혼자 해 보이소. 욕보이소!"
  ],
  "texts": {
    "shopStage": [
      "작은 가게",
      "확장 1단계",
      "확장 2단계"
    ],
    "hintMerge": "같은 재료 같은 단계끼리 포개믄 다음 단계 됩니더.",
    "boardFull": "보드가 꽉 찼네예! 길게 누르믄 치울 수 있어예.",
    "deleted": "치았어예.",
    "cantDeleteGen": "생성기는 몬 치웁니더.",
    "loadFail": "저장한 거를 몬 불러와가 새로 시작합니더.",
    "expandBtn": "가게 확장",
    "expandDone": [
      "",
      "가게가 한 칸 넓어졌다 아입니꺼!",
      "가게가 인자 북적북적하네예!"
    ],
    "tapNext": "▼",
    "endTitle": "오캉과 엄마: 아빠의 기억",
    "endLines": [
      "이야기는 본편에서 이어집니더.",
      ""
    ],
    "endTime": "머지 시간 {time}",
    "endRestart": "처음부터 하입시더",
    "endContinue": "장사 더 하입시더",
    "restartConfirm": "처음부터 다시 할낍니꺼? 지금까지 한 거는 다 지워집니더.",
    "noMoney": "돈이 모자라예.",
    "serveReady": "",
    "served": "{name} 손님 +{money}",
    "notWanted": "이 주문에는 필요 없는 기라예.",
    "signText": "황가상점",
    "titleMain": "오캉과 엄마",
    "titleSub": "아빠의 기억",
    "titleNote": "",
    "titleContinue": "이어서 하입시더",
    "titleNew": "처음부터 하입시더",
    "titleStart": "장사 시작하입시더",
    "tutTapToStart": "(화면을 누르믄 시작합니더)"
  }
};

G.applyUiText(G.UI_TEXT);
