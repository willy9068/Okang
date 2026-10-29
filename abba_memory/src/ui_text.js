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
      "y": 600,
      "w": 320,
      "h": 56,
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
      "y": 162,
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
    "장사 첫날이네예. 저 생선 상자부터 함 눌러 보이소. 생선살이 나올 끼라예.",
    "똑같은 생선살 두 개를 끌어다가 포개 보이소. 그라믄 어묵 반죽이 되는 기라예.",
    "됐네예! 그 어묵 반죽, 손님 앞 접시에 갖다 노이소.",
    "돈 벌었지예? 돈이 모이믄 위에 '가게 확장'을 누르이소. 가게가 넓어집니더. 인자 혼자 해 보이소. 욕보이소!"
  ],
  "texts": {
    "shopStage": [
      "작은 가게",
      "확장 1단계",
      "확장 2단계"
    ],
    "hintMerge": "같은 재료 같은 단계끼리 겹치면 다음 단계가 돼요.",
    "boardFull": "보드가 가득 찼어요! 아이템을 길게 눌러 치울 수 있어요.",
    "deleted": "치웠어요.",
    "cantDeleteGen": "생성기는 치울 수 없어요.",
    "loadFail": "저장된 진행을 불러오지 못해 새로 시작해요.",
    "expandBtn": "가게 확장",
    "expandDone": [
      "",
      "가게가 한 칸 넓어졌어요!",
      "가게가 북적이기 시작했어요!"
    ],
    "tapNext": "▼",
    "endTitle": "오캉과 엄마: 아빠의 기억",
    "endLines": [
      "이야기는 본편으로 이어집니다.",
      "(데모 · 임시 대사)"
    ],
    "endTime": "머지 시간 {time}",
    "endRestart": "처음부터",
    "endContinue": "가게 계속 하기",
    "restartConfirm": "처음부터 다시 할까요? 지금 진행은 지워져요.",
    "noMoney": "돈이 모자라요.",
    "serveReady": "내기",
    "served": "{name} 손님 +{money}",
    "notWanted": "이 주문에는 필요 없는 요리예요.",
    "signText": "황가상점",
    "titleMain": "오캉과 엄마",
    "titleSub": "아빠의 기억",
    "titleNote": "데모 · 임시 대사",
    "titleContinue": "이어하기",
    "titleNew": "처음부터",
    "titleStart": "시작하기",
    "tutTapToStart": "(화면을 누르면 시작)"
  }
};

G.applyUiText(G.UI_TEXT);
