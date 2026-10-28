// 오캉과 엄마: 아빠의 기억 — 모든 수치와 문장은 이 파일 한 곳에 둡니다.
// "임시"라고 적힌 값은 아직 정하지 않은 값입니다 (DEVLOG.md 참고).
var G = G || {};

G.DATA = {
  saveKey: 'abba_memory_v4',   // 저장 형식이 바뀌면 숫자를 올립니다 (v4: 닫힌 칸·생성기 자리)
  seed: 20261028,              // 시드 난수 (같은 시드 = 같은 결과)

  // 화면: 세로 9:16. 코드는 540×960 좌표로 그리고 이미지는 2배(1080×1920)로 만듭니다.
  view: { w: 540, h: 960 },

  // 화면 구역 (540×960 좌표)
  layout: {
    hudH: 56,                     // 상단 HUD
    shop: { y: 0, h: 330 },       // 가게 그림 (HUD 뒤까지 깔림)
    panel: { y: 330, h: 600 },    // 나무 카운터 보드 판
    hint: { y: 930, h: 30 },      // 맨 아래 안내 문구 줄
    expandBtn: { x: 160, y: 62, w: 220, h: 38 },   // 확장 버튼
    orders: { y: 108, w: 160, h: 214, gap: 15 }     // 주문 칸 3개 (가로로 나란히)
  },

  // 머지 보드 (임시: 7칸×9칸, 직접 해 보고 조정)
  board: {
    cols: 7,
    rows: 9,
    cell: 64,            // 칸 하나 크기
    top: 342,            // 보드 위쪽 y
    itemScale: 0.86,     // 칸 안에서 아이템 크기 비율
    // 확장 단계별 열린 칸 (c0~c1열, r0~r1행, 0부터 셈). 2026-10-28 사용자 결정
    openByStage: [
      { c0: 1, c1: 5, r0: 0, r1: 5 },   // 작은 가게: 5×6 (양옆 줄, 아래 3줄 닫힘)
      { c0: 0, c1: 6, r0: 0, r1: 5 },   // 확장 1단계: 7×6 (양옆 열림)
      { c0: 0, c1: 6, r0: 0, r1: 8 }    // 확장 2단계: 7×9 전부
    ]
  },

  // 생성기 반짝임
  genGlow: {
    pulseMs: 1600,       // 빛이 커졌다 작아지는 한 바퀴
    starEveryMs: 2000,   // 작은 별이 반짝이는 간격
    starMs: 500          // 별 한 번 반짝이는 시간
  },

  // 재료·요리 체인 (단계 이름은 임시, 이미지 파일명은 단계 번호)
  chains: {
    oden: {
      name: '어묵',
      color: '#E9A23B',
      steps: ['생선살', '어묵 반죽', '튀김 어묵', '어묵 꼬치', '어묵탕']
    },
    gukbap: {
      name: '돼지국밥',
      color: '#D9C3A0',
      steps: ['돼지뼈', '사골 육수', '수육', '뚝배기 국밥', '국밥 한 상']
    }
  },

  // 생성기: 체인마다 1개. 처음 놓이는 칸 (col, row는 0부터). 끌어서 옮길 수 있음
  generators: [
    { chain: 'oden',   name: '생선 상자', col: 1, row: 0 },
    { chain: 'gukbap', name: '가마솥',   col: 5, row: 0 }
  ],

  // 시작할 때 보드에 놓인 재료 (임시: 소량)
  startItems: [
    { chain: 'oden',   lv: 1, col: 2, row: 3 },
    { chain: 'oden',   lv: 1, col: 3, row: 4 },
    { chain: 'gukbap', lv: 1, col: 4, row: 3 },
    { chain: 'gukbap', lv: 1, col: 3, row: 2 }
  ],

  // 조작
  input: {
    longPressMs: 600,    // 임시: 이만큼 누르고 있으면 아이템 삭제
    dragStartPx: 6       // 이만큼 움직여야 드래그로 봄 (그 전엔 탭)
  },

  // 대화창 이름표 (스토리는 3일차)
  names: { mother: '태자', father: '나' },

  // 시작 돈
  startMoney: 0,

  // 손님 (이미지: cust_1 ~ cust_4)
  customers: [
    { id: 1, name: '부두 일꾼',     color: '#8C6B4F' },
    { id: 2, name: '상인 아주머니', color: '#C46A8A' },
    { id: 3, name: '학생',         color: '#4D5B7A' },
    { id: 4, name: '할아버지',      color: '#7E8C5A' }
  ],

  // 손님 주문 (임시)
  orders: {
    count: 3,                  // 동시에 뜨는 주문 수
    // 확장 단계별로 주문에 나오는 요리 단계 (같은 숫자가 많을수록 자주 나옴)
    levelsByStage: [
      [2, 3, 3, 4],            // 작은 가게
      [3, 4, 4, 5],            // 확장 1단계 이후
      [3, 4, 4, 5]             // 확장 2단계 이후 (데모 마무리 뒤 계속 플레이)
    ],
    twoChance: 0.3,            // 요리 2개를 요구하는 주문이 나올 확률
    twoLevelDown: 1,           // 2개짜리 주문은 단계를 이만큼 낮춤 (최소 2단계)
    rewardByLv: [0, 5, 15, 35, 80, 170]   // 요리 단계별 보상 (0번은 안 씀)
  },

  // 가게 확장 비용 (임시). 2026-10-28 직접 해 본 시간(520/780에서 1분 + 2분 30초)을 보고 약 30% 줄임
  expand: {
    costs: [360, 550]          // 1단계, 2단계
  },

  // 스토리 (대사는 story_data.js)
  story: {
    intro: 'intro',                     // 새 게임 시작 때
    afterExpand: [null, ['story1'], ['story2', 'ending']],   // 확장 단계별로 이어서 볼 장면
    delayMs: 900,                       // 확장 연출이 끝나고 대화창이 뜨기까지
    charsPerSec: 32,                    // 한 글자씩 나오는 속도
    fadeMs: 250                         // 대화창 나타나는 시간
  },

  // 스토리 화면 배치 (540×960 좌표)
  storyLayout: {
    father: { x: 6, y: 330, w: 280, h: 400 },     // 나 (왼쪽)
    mother: { x: 254, y: 330, w: 280, h: 400 },   // 태자 (오른쪽)
    box: { x: 16, y: 700, w: 508, h: 200, pad: 74, padTop: 56 },   // 대화창 (pad: 글자 안쪽 여백, ui_dialog 장식 피함)
    choice: { x: 40, y: 430, w: 460, h: 66, gap: 14 }   // 선택지 버튼 3개
  },

  // 조작 안내 (처음 한 번씩, 순서대로)
  tutorial: [
    '생선 상자나 가마솥(생성기)을 눌러 재료를 만들어요.',
    '같은 재료 같은 단계 2개를 끌어서 겹쳐 보세요.',
    '손님이 원하는 요리를 주문 칸에 끌어 놓거나, 다 모이면 주문 칸을 눌러요.'
  ],

  // 밸런스 계산용 (tools/balance.js만 씀): 사람이 한 동작에 쓰는 시간(초)
  balanceSim: {
    secTap: 0.7, secMerge: 1.6, secServe: 1.5, secDelete: 1.5,
    humanFactor: 0.65,         // 사람 보정. 2026-10-28 직접 플레이(비용 520/780에서 1분+2분30초)에 맞춤
    runs: 30                   // 시드를 바꿔 몇 판 돌릴지
  },

  // 색 (이미지가 없을 때 쓰는 색 블록 포함)
  colors: {
    outline: '#2B1D14',
    wood: '#9A6A3C',
    woodDark: '#6E4824',
    cream: '#F4E6CC',
    navy: '#1F2B4A',
    gold: '#D9A441',
    teal: '#2F7F86',
    cell: '#2E2A28',
    cellRim: '#4A4440',
    locked: 'rgba(10,8,6,0.62)',   // 닫힌 칸 덮개
    mergeGlow: '#FFC857',
    night: '#2A2350',
    nightDeep: '#141C33',
    father: ['#E89AAE', '#4F8A5B'],   // placeholder: 분홍 셔츠, 초록 멜빵바지
    mother: ['#F1E3C8', '#A23B3B'],   // placeholder: 크림 블라우스, 붉은 앞치마
    mono: '#FFC857',
    shop: ['#7A6A58', '#B58A5A', '#D9A86A']   // 가게 0/1/2단계 placeholder
  },

  // 화면 문장 (작성자가 직접 고칠 수 있게 여기 둡니다)
  texts: {
    shopStage: ['작은 가게', '확장 1단계', '확장 2단계'],
    hintMerge: '같은 재료 같은 단계끼리 겹치면 다음 단계가 돼요.',
    boardFull: '보드가 가득 찼어요! 아이템을 길게 눌러 치울 수 있어요.',
    deleted: '치웠어요.',
    cantDeleteGen: '생성기는 치울 수 없어요.',
    loadFail: '저장된 진행을 불러오지 못해 새로 시작해요.',
    expandBtn: '가게 확장',
    expandDone: ['', '가게가 한 칸 넓어졌어요!', '가게가 북적이기 시작했어요!'],
    tapNext: '▼',
    endTitle: '오캉과 엄마: 아빠의 기억',
    endLines: ['이야기는 본편으로 이어집니다.', '(데모 · 임시 대사)'],
    endTime: '머지 시간 {time}',
    endRestart: '처음부터',
    endContinue: '가게 계속 하기',
    restartConfirm: '처음부터 다시 할까요? 지금 진행은 지워져요.',
    noMoney: '돈이 모자라요.',
    serveReady: '내기',
    served: '{name} 손님 +{money}',
    notWanted: '이 주문에는 필요 없는 요리예요.'
  },

  // 이미지 파일 이름 (assets/<이름>.png). 없으면 색 블록으로 그립니다.
  // 이름 규칙은 README.md "이미지 넣기" 참고.
  images: [
    'oden_1', 'oden_2', 'oden_3', 'oden_4', 'oden_5',
    'gukbap_1', 'gukbap_2', 'gukbap_3', 'gukbap_4', 'gukbap_5',
    'gen_oden', 'gen_gukbap',
    'ui_cell', 'ui_board', 'ui_hud', 'ui_coin', 'fx_merge',
    'shop_0', 'shop_1', 'shop_2',
    'cust_1', 'cust_2', 'cust_3', 'cust_4',
    'ui_order', 'ui_button', 'ui_expand',
    'char_father', 'char_mother', 'char_father_smile', 'char_mother_smile',
    'ui_dialog', 'bg_memory'
  ]
};
