// 오캉과 엄마: 아빠의 기억 — 게임 수치는 이 파일 한 곳에 둡니다.
// 화면 배치(위치·크기)·화면 문장·이름표·손님 이름은 ui_text.js, 대사는 story_data.js 에 있습니다.
// 두 파일은 편집기(편집기_켜기.bat)로 고칠 수 있습니다.
// "임시"라고 적힌 값은 아직 정하지 않은 값입니다 (DEVLOG.md 참고).
var G = G || {};

G.DATA = {
  saveKey: 'abba_memory_v6',   // 저장 형식이 바뀌면 숫자를 올립니다 (v6: 튜토리얼)
  seed: 20261028,              // 시드 난수 (같은 시드 = 같은 결과)

  // 화면: 세로 9:16. 코드는 540×960 좌표로 그리고 이미지는 2배(1080×1920)로 만듭니다.
  view: { w: 540, h: 960 },

  // 머지 보드 (임시: 7칸×9칸, 직접 해 보고 조정)
  board: {
    cols: 7,
    rows: 9,
    // 칸 크기(cell)와 보드 위치(top)는 ui_text.js의 boardPos (편집기로 고침)
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
    },
    // 밀면: 스토리 1 뒤(확장 1단계)부터. 보드가 넓어진 만큼 재료도 늘려 지루하지 않게 (사용자 결정 2026-10-30)
    milmyeon: {
      name: '밀면',
      color: '#E8DDB5',
      steps: ['밀가루', '면 반죽', '삶은 면', '물밀면', '밀면 한 상']
    }
  },

  // 생성기: 체인마다 1개. 처음 놓이는 칸 (col, row는 0부터). 끌어서 옮길 수 있음
  // fromStage: 이 확장 단계부터 보드에 생김 (그 칸이 차 있으면 가까운 빈 칸). 주문도 그때부터 이 요리를 요구함
  generators: [
    { chain: 'oden',     name: '생선 상자',  col: 1, row: 0, fromStage: 0 },
    { chain: 'gukbap',   name: '가마솥',     col: 5, row: 0, fromStage: 0 },
    { chain: 'milmyeon', name: '밀가루 포대', col: 0, row: 0, fromStage: 1 }   // 확장 1단계에 열리는 왼쪽 줄
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

  // 시작 돈
  startMoney: 0,

  // 튜토리얼 (도입 뒤 첫 머지 화면): 가운데(slot 1) 손님에게 쉬운 주문 하나. 설명 문장은 ui_text.js의 tutorial
  tutorialSetup: {
    chain: 'oden',
    slot: 1,
    order: { cust: 2, needs: [{ chain: 'oden', lv: 2 }], reward: 15 }
  },

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
    threeChanceByStage: [0, 0.2, 0.25],   // 요리 3개를 요구하는 주문 확률 (확장 단계별, 작은 가게에는 없음). 2026-10-30
    threeLevelDown: 1,         // 3개짜리 주문은 단계를 이만큼 낮춤 (최소 2단계)
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
    fadeMs: 250,                        // 대화창 나타나는 시간
    // 스토리별 배경 그림. 앞에서부터 있는 파일을 씀, 다 없으면 bg_memory(밤 시장 골목)
    bg: { intro: ['bg_memory'], story1: ['bg_story1'], story2: ['bg_story2'], ending: ['bg_story2'] },
    // 마무리 장면 간판 글씨: bg_story2의 빈 간판 위에 코드로 씀 (2026-10-29 사용자 결정, bg_ending 그림은 만들지 않음)
    // (자리·크기·글자는 ui_text.js의 storyLayout.sign, texts.signText)
    signScene: 'ending'
  },

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
    mergeHint: '#39E66B',          // 합칠 수 있는 칸 (나무판·쟁반·생성기 빛과 구분되는 밝은 초록)
    mergeHintDark: '#0B3A1A',
    night: '#2A2350',
    nightDeep: '#141C33',
    father: ['#E89AAE', '#4F8A5B'],   // placeholder: 분홍 셔츠, 초록 멜빵바지
    mother: ['#F1E3C8', '#A23B3B'],   // placeholder: 크림 블라우스, 붉은 앞치마
    mono: '#FFC857',
    shop: ['#7A6A58', '#B58A5A', '#D9A86A']   // 가게 0/1/2단계 placeholder
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
    'ui_button', 'ui_expand',
    'char_father', 'char_mother',
    // 안 쓰는 그림은 목록에서 뺌 (제출본 용량): ui_order(말풍선, 접시로 바뀜), char_*_smile(표정 차분, 아직 안 씀)
    'ui_dialog', 'bg_memory',
    'ui_lock', 'bg_story1', 'bg_story2',   // 2차 요청 (없으면 코드 그림 / bg_memory)
    'ui_plate',                            // 3차 요청 (없으면 코드 접시)
    'bg_title',                            // 타이틀 화면 (없으면 bg_memory)
    'milmyeon_1', 'milmyeon_2', 'milmyeon_3', 'milmyeon_4', 'milmyeon_5', 'gen_milmyeon'   // 4차 요청: 밀면 (없으면 색 블록)
  ]
};

// ui_text.js(편집기가 쓰는 파일)의 값을 G.DATA에 넣음
G.applyUiText = function (U) {
  var D = G.DATA;
  D.layout = U.layout;
  D.storyLayout = U.storyLayout;
  D.board.top = U.boardPos.top;
  D.board.cell = U.boardPos.cell;
  D.texts = U.texts;
  D.tutorial = U.tutorial;
  D.names = U.names;
  D.customers = U.customers;
};
