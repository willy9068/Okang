// 오캉과 엄마: 아빠의 기억 — 모든 수치와 문장은 이 파일 한 곳에 둡니다.
// "임시"라고 적힌 값은 아직 정하지 않은 값입니다 (DEVLOG.md 참고).
var G = G || {};

G.DATA = {
  saveKey: 'abba_memory_v1',   // 저장 형식이 바뀌면 숫자를 올립니다
  seed: 20261028,              // 시드 난수 (같은 시드 = 같은 결과)

  // 화면: 세로 9:16. 코드는 540×960 좌표로 그리고 이미지는 2배(1080×1920)로 만듭니다.
  view: { w: 540, h: 960 },

  // 화면 구역 (540×960 좌표)
  layout: {
    hudH: 56,                     // 상단 HUD
    shop: { y: 0, h: 330 },       // 가게 그림 (HUD 뒤까지 깔림)
    panel: { y: 330, h: 600 },    // 나무 카운터 보드 판
    hint: { y: 930, h: 30 }       // 맨 아래 안내 문구 줄
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

  // 시작 돈 (주문·복구는 2일차)
  startMoney: 0,

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
    hintStart: '생성기를 눌러 재료를 만들고, 같은 재료 2개를 겹쳐 보세요.',
    hintMerge: '같은 재료 같은 단계끼리 겹치면 다음 단계가 돼요.',
    boardFull: '보드가 가득 찼어요! 아이템을 길게 눌러 치울 수 있어요.',
    deleted: '치웠어요.',
    cantDeleteGen: '생성기는 치울 수 없어요.',
    loadFail: '저장된 진행을 불러오지 못해 새로 시작해요.'
  },

  // 이미지 파일 이름 (assets/<이름>.png). 없으면 색 블록으로 그립니다.
  // 이름 규칙은 README.md "이미지 넣기" 참고.
  images: [
    'oden_1', 'oden_2', 'oden_3', 'oden_4', 'oden_5',
    'gukbap_1', 'gukbap_2', 'gukbap_3', 'gukbap_4', 'gukbap_5',
    'gen_oden', 'gen_gukbap',
    'ui_cell', 'ui_board', 'ui_hud', 'ui_coin', 'fx_merge',
    'shop_0', 'shop_1', 'shop_2'
  ]
};
