// 오캉과 엄마: 아빠의 기억 — 모든 수치와 문장은 이 파일 한 곳에 둡니다.
// "임시"라고 적힌 값은 아직 정하지 않은 값입니다 (DEVLOG.md 참고).
var G = G || {};

G.DATA = {
  saveKey: 'abba_memory_v2',   // 저장 형식이 바뀌면 숫자를 올립니다 (v2: 주문·복구 추가)
  seed: 20261028,              // 시드 난수 (같은 시드 = 같은 결과)

  // 화면: 세로 9:16. 코드는 540×960 좌표로 그리고 이미지는 2배(1080×1920)로 만듭니다.
  view: { w: 540, h: 960 },

  // 화면 구역 (540×960 좌표)
  layout: {
    hudH: 56,                     // 상단 HUD
    shop: { y: 0, h: 330 },       // 가게 그림 (HUD 뒤까지 깔림)
    panel: { y: 330, h: 600 },    // 나무 카운터 보드 판
    hint: { y: 930, h: 30 },      // 맨 아래 안내 문구 줄
    restoreBtn: { x: 160, y: 62, w: 220, h: 38 },   // 복구 버튼
    orders: { y: 108, w: 160, h: 214, gap: 15 }     // 주문 칸 3개 (가로로 나란히)
  },

  // 머지 보드 (임시: 7칸×9칸, 직접 해 보고 조정)
  board: {
    cols: 7,
    rows: 9,
    cell: 64,            // 칸 하나 크기
    top: 342,            // 보드 위쪽 y
    itemScale: 0.86      // 칸 안에서 아이템 크기 비율
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

  // 생성기: 체인마다 1개. 보드 위 고정 칸 (col, row는 0부터)
  generators: [
    { chain: 'oden',   name: '생선 상자', col: 0, row: 0 },
    { chain: 'gukbap', name: '가마솥',   col: 6, row: 0 }
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
    // 복구 단계별로 주문에 나오는 요리 단계 (같은 숫자가 많을수록 자주 나옴)
    levelsByStage: [
      [2, 3, 3, 4],            // 낡은 가게
      [3, 4, 4, 5],            // 복구 1단계 이후
      [3, 4, 4, 5]             // 복구 2단계 이후 (데모 마무리 뒤 계속 플레이)
    ],
    twoChance: 0.3,            // 요리 2개를 요구하는 주문이 나올 확률
    twoLevelDown: 1,           // 2개짜리 주문은 단계를 이만큼 낮춤 (최소 2단계)
    rewardByLv: [0, 5, 15, 35, 80, 170]   // 요리 단계별 보상 (0번은 안 씀)
  },

  // 가게 복구 비용 (임시, tools/balance.js로 맞춘 값. 한 판 머지 약 3분 + 4분 목표)
  restore: {
    costs: [520, 780]          // 1단계, 2단계
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
    humanFactor: 1.3,          // 고민·실수 몫
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
    mergeGlow: '#FFC857',
    night: '#2A2350',
    shop: ['#7A6A58', '#B58A5A', '#D9A86A']   // 가게 0/1/2단계 placeholder
  },

  // 화면 문장 (작성자가 직접 고칠 수 있게 여기 둡니다)
  texts: {
    shopStage: ['낡은 가게', '복구 1단계', '복구 2단계'],
    hintMerge: '같은 재료 같은 단계끼리 겹치면 다음 단계가 돼요.',
    boardFull: '보드가 가득 찼어요! 아이템을 길게 눌러 치울 수 있어요.',
    deleted: '치웠어요.',
    cantDeleteGen: '생성기는 치울 수 없어요.',
    loadFail: '저장된 진행을 불러오지 못해 새로 시작해요.',
    restoreBtn: '가게 복구',
    restoreDone: ['', '가게가 깨끗해졌어요! (스토리 1은 3일차)', '가게가 넓어졌어요! (스토리 2는 3일차)'],
    restoreAllDone: '복구 완료! 걸린 시간 {time} (마무리 장면은 4일차)',
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
    'ui_order', 'ui_button', 'ui_restore'
  ]
};
