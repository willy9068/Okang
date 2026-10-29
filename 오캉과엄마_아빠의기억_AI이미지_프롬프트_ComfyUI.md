# 오캉과 엄마: 아빠의 기억 — 아트 스타일 · 이미지 목록 · AI 이미지 프롬프트 (ComfyUI용)

> 2026-10-28 (2차 요청: 8장 · 3차 요청 2026-10-29: 9장) · 양식은 `스톱앤스케치_AI이미지_프롬프트_ComfyUI.md`를 따랐습니다. 프롬프트는 영어로 썼습니다(대부분의 모델이 영어에서 안정적).
> 아트 기준 이미지: `따뜻한 한식당 요리 게임 화면-3.png`(기본 톤), `전통 시장 경매 게임 UI-2.png`·`등불이 빛나는 유령 던전 퍼즐 UI-1.png`(UI 틀, 밤 장면).
> 저는 이미지를 직접 만들 수 없고 ComfyUI도 실행해 보지 못했습니다. **결과가 어떻게 나오는지는 확인하지 못했으니** 첫날 3장 시험(0-1)으로 먼저 확인하세요.
> 게임 안 파일 이름은 3장 표와 `abba_memory/README.md`의 이름 규칙이 같습니다. 파일이 없으면 게임은 색 블록으로 돌아갑니다.

---

## 0. 먼저 읽을 것

### 0-1. 사용 순서
1. 2장 **스타일 블록**을 모든 프롬프트 앞에 한 글자도 바꾸지 말고 붙입니다.
2. **먼저 3장만** 만듭니다: ① 아버지 정면(`char_father`) ② 어묵 1단계 아이콘(`oden_1`) ③ 처음 가게(`shop_0`). 세 장이 한 게임처럼, 그리고 참고 이미지 3번(한식당)과 같은 게임처럼 보이면 나머지를 진행합니다. 안 맞으면 모델·LoRA·스타일 참조부터 바꿉니다.
3. 항목당 4장 이상 뽑아 **직접 고르고**, 고른 이유와 고친 내용을 7장 기록표에 씁니다.
4. 이미지가 없어도 게임은 색 블록으로 돌아가니, 이미지가 늦어져도 개발은 막히지 않습니다.

### 0-2. ComfyUI를 써도 되는가
**쓰셔도 됩니다. 단, 아래를 지켜야 합니다.** (스톱앤스케치와 같은 기준)
- **기각 위험 (가장 중요):** AI만 쓰고 작성자의 기획 의도·수정·검증이 확인되지 않으면 기각될 수 있습니다. 모델 이름, 프롬프트, 고른 이유, 손본 내용을 7장 기록표와 일일 히스토리에 남기세요.
- **사내 규정:** AI 생성 이미지 사용 허용 여부, 로컬 모델 허용 여부는 **확인하지 못했습니다.**
- **모델 라이선스:** 체크포인트/LoRA마다 다릅니다. 상업 이용 가능 여부를 모델 페이지에서 직접 확인하고 모델 이름·버전·확인 날짜를 기록하세요.
- **원작 영화 관련 (이 프로젝트에서 추가):** 인물은 원작 설정(어머니 김태자, 부산 황가상점)만 쓰고, **배우의 얼굴을 닮게 만들지 않습니다.** 배우 이름·사진을 프롬프트나 참조 이미지로 넣지 않습니다. 제작사 검수 전 임시 디자인입니다.
- 기존 게임·작품·작가 이름을 프롬프트에 넣지 않습니다(가십하버 등은 UI 구성만 참고).

### 0-3. 이 프로젝트에서 AI가 약한 부분
- **같은 인물을 여러 표정으로 일관되게** 뽑기 어렵습니다. → 인물은 **기본 1장**을 먼저 확정하고, 표정 차분은 시드 고정 + 참조 이미지(IP-Adapter 계열)로 시도합니다. 안 맞으면 기본 1장만 쓰고 코드로 살짝 흔들기·확대로 감정을 표현합니다.
- **머지 아이템 10장의 일관성**: 같은 그릇·같은 각도·같은 크기로 보여야 합니다. 4-3의 공통 문장(각도·그릇)을 바꾸지 마세요.
- **1990년 고증**: 모델이 요즘 물건(스마트폰, LED 간판, 플라스틱 테이블)을 섞기 쉽습니다. 네거티브에 넣어 두었지만 고를 때 확인하세요.
- **투명 배경**은 단색 배경으로 뽑고 배경 제거(rembg 계열 노드 등)를 씁니다.
- **글자**는 AI가 못 씁니다. 간판 글자, 이름표, 숫자는 모두 코드(폰트)로 넣습니다. 간판은 "빈 간판"으로 뽑습니다.

---

## 1. 아트 스타일 정리 (2026-10-28 사용자 결정)

| 항목 | 내용 |
|---|---|
| 기본 톤 | **한식당 낮 톤** (참고 3번): 따뜻한 나무, 크림색 벽, 오후 햇살, 부드러운 명암 |
| UI 틀 | **남색 + 금색 테두리** (참고 1·2번): 상단 HUD, 버튼, 대화창, 패널 |
| 기억(스토리) 장면 | **밤 + 따뜻한 불빛** (참고 1번의 색): 남보라 밤하늘, 노란 불빛. 불빛은 **백열전구 줄·포장마차 천막** (종이 등롱은 일본풍이라 쓰지 않음, 8-0). 대화창 뒤 배경만 이 톤 |
| 인물 | 2~2.5등신 귀여운 캐릭터, 굵은 진갈색 외곽선, 큰 머리, 점 눈에 가까운 둥근 눈 |
| 아버지 | 참고 1번의 **젊은 남자** 기준: 20대 후반 한국 남성, 짧은 검은 머리, 콧수염 없음, 분홍 셔츠 + 초록 멜빵바지 |
| 어머니(태자) | **20대 중반 한국 여성** (원작 김태자, 현재 57세 → 1990년 기준). 부산 시장 상인 집안의 씩씩한 인상. 배우와 닮지 않게 |
| 시대·장소 | 1990년 부산 시장 골목, 바다가 가까운 동네. 함석·나무·타일·연탄난로·브라운관 TV 같은 소재. **한국 단서·일본풍 금지 목록은 8-0** |
| 아이템 | 투명 배경 단독 물체. 칸(쟁반)은 별도 이미지 1장을 코드가 반복 사용 |
| 화면 | **세로 1080×1920 (9:16).** 코드는 540×960 좌표로 그리고 2배 이미지를 씁니다 |
| 금지 | 가로 UI, 3D 렌더, 사진, 글자, 요즘 물건, 실제 배우 얼굴 |

### 1-1. 색 팔레트 (data.js에도 같은 값 사용)
| 용도 | 색 | HEX (시작값, 보고 조정) |
|---|---|---|
| 외곽선 | 진한 갈색 | #2B1D14 |
| 나무(가게·보드 판) | 따뜻한 갈색 | #9A6A3C |
| 벽·종이·말풍선 | 크림색 | #F4E6CC |
| UI 틀 | 남색 | #1F2B4A |
| UI 테두리 | 금색 | #D9A441 |
| 주요 버튼 | 청록 (참고 2번 +500 버튼) | #2F7F86 |
| 칸(쟁반) | 짙은 먹색 | #2E2A28 |
| 합칠 수 있음 표시 | 등불 노랑 | #FFC857 |
| 기억 장면 밤 | 남보라 | #2A2350 |
| 어묵 체인 | 노릇한 주황 | #E9A23B |
| 돼지국밥 체인 | 뽀얀 국물 베이지 | #D9C3A0 |

---

## 2. 스타일 블록 (모든 프롬프트 앞에 복사)

```
STYLE: 2D casual mobile game asset, cute chibi cartoon style, thick dark brown
outlines of uniform weight, clean flat colors with soft cel shading and subtle
painted texture, warm cozy afternoon light, retro Korean 1990 Busan atmosphere,
gentle and nostalgic mood, no text, no watermark
```

### 공통 네거티브 프롬프트
```
text, letters, hangul, kanji, numbers, watermark, logo, signature, 3d render,
photo, realistic, photorealistic, anime screencap, sketchy thin lines, messy
lines, blurry, extra limbs, extra fingers, deformed hands, smartphone, LED sign,
modern car, neon, glossy plastic, horror, dark gloomy
```
※ 밤 장면(4-8)만 `dark gloomy`를 빼고 `horror, scary ghost`는 남깁니다.

### ComfyUI 설정 요령 (확인 못 한 부분은 표시)
- 모델: 상업 이용이 가능한 체크포인트. **[라이선스 직접 확인 필요]**
- 해상도: 정사각 에셋은 1024×1024 → 후처리로 축소. 세로 배경은 9:16(예: 768×1344 생성 후 업스케일 1080×1920). 가게 배경(1080×660)은 1344×832 정도로 뽑아 잘라 씁니다.
- **시드 고정**: 같은 인물의 다른 표정, 같은 체인의 다른 단계는 시드를 고정하고 묘사만 바꿉니다.
- **스타일 참조**: 참고 이미지 3번(한식당)을 IP-Adapter 계열 노드의 스타일 참조로 넣는 것을 먼저 시도해 보세요. 어떤 노드·모델이 가능한지는 **설치 환경에 따라 다르니 직접 확인**하세요. 참고 이미지 속 인물을 그대로 복사하지 않도록 가중치는 낮게(0.3~0.5 정도부터) 시작합니다.
- 같은 프롬프트로 최소 4장(배치 4) 뽑고 고릅니다.
- 워크플로 JSON을 `abba_memory/assets/original/`에 함께 보관합니다.

---

## 3. 이미지 목록과 파일 규격 (1차 33장, 최소 구성 19장 · 2차 추가는 8-3 · 3차는 9장)

우선순위: ★=1~2일차에 필요(보드·가게) / ☆=3~5일차(스토리·UI) / ○=여유 있을 때
최소 구성 = ★ 전부 + 인물 2장 + 대화창.

| # | 구분 | 파일명 | 크기(px) | 배경 | 우선 |
|---|---|---|---|---|---|
| 1~5 | 어묵 체인 1~5단계 | oden_1 ~ oden_5.png | 256×256 | 투명 | ★ |
| 6~10 | 돼지국밥 체인 1~5단계 | gukbap_1 ~ gukbap_5.png | 256×256 | 투명 | ★ |
| 11 | 생성기: 생선 상자 (어묵) | gen_oden.png | 256×256 | 투명 | ★ |
| 12 | 생성기: 가마솥 (돼지국밥) | gen_gukbap.png | 256×256 | 투명 | ★ |
| 13 | 보드 칸 (검은 쟁반) | ui_cell.png | 128×128 | 투명 | ★ |
| 14 | 보드 판 (나무 카운터) | ui_board.png | 1080×1200 | 투명 | ★ |
| 15 | 가게: 처음 상태 | shop_0.png | 1080×660 | 있음 | ★ ✏️ 다시 (8-2) |
| 16 | 가게: 1단계 확장 | shop_1.png | 1080×660 | 있음 | ★ ✏️ 다시 (8-2) |
| 17 | 가게: 2단계 확장 | shop_2.png | 1080×660 | 있음 | ★ ✏️ 다시 (8-2) |
| 18~21 | 손님 4명 (상반신) | cust_1 ~ cust_4.png | 256×256 | 투명 | ★ |
| 22 | 주문 말풍선 | ui_order.png | 256×256 | 투명 | ☆ |
| 23 | 돈 아이콘 (동전) | ui_coin.png | 96×96 | 투명 | ☆ |
| 24 | 상단 HUD 틀 | ui_hud.png | 1080×112 | 투명 | ☆ |
| 25 | 버튼 (청록, 금테) | ui_button.png | 384×128 | 투명 | ☆ |
| 26 | 확장 아이콘 (망치) | ui_expand.png | 128×128 | 투명 | ☆ |
| 27 | 아버지 기본 (상반신) | char_father.png | 768×1024 | 투명 | ☆ (최소) |
| 28 | 어머니(태자) 기본 (상반신) | char_mother.png | 768×1024 | 투명 | ☆ (최소) |
| 29 | 대화창 (9분할용) | ui_dialog.png | 1024×384 | 투명 | ☆ (최소) |
| 30 | 기억 장면 배경 (밤 시장 골목) | bg_memory.png | 1080×1920 | 있음 | ☆ ✏️ 다시 (8-1) |
| 31 | 합성 반짝 효과 | fx_merge.png | 256×256 | 투명 | ○ |
| 32 | 아버지 웃음 (표정 차분) | char_father_smile.png | 768×1024 | 투명 | ○ |
| 33 | 어머니 웃음 (표정 차분) | char_mother_smile.png | 768×1024 | 투명 | ○ |

상태 (2026-10-28 2차): ✏️ = 1차 그림이 일본풍이라 8장 프롬프트로 다시 그림. 새로 필요한 #34~37은 **8-3**.

※ 숫자(돈, 주문 보상), 이름표, 간판 글자, 길게 누르기 원형 게이지, 합칠 수 있음 노란 테두리는 **코드로** 그립니다.
※ 아이템 단계 이름은 개발 가이드 4-1의 **임시** 이름입니다. 이름이 바뀌면 프롬프트 묘사만 바꾸고 파일명(단계 번호)은 그대로 둡니다.

### 3-1. 화면에서 이미지가 놓이는 자리 (세로 1080×1920 기준)

```
y    0 ┌──────────────────────────┐
       │ ui_hud (돈, 확장 단계)      │ 0~112
  112  │                          │
       │ shop_0/1/2 (가게 안쪽)      │ 0~660 (HUD 뒤까지 깔림)
       │  손님 cust_1~4 + 주문 말풍선  │ 손님 머리 y≈300~520
  660  ├──────────────────────────┤
       │ ui_board (나무 카운터 판)    │ 660~1860
       │  7칸×9칸, 칸 하나 128px      │ 보드 폭 896, 좌우 여백 92
       │  ui_cell 위에 아이템(≈112px)  │
 1860  ├──────────────────────────┤
       │ 안내 문구 줄 (코드)          │ 1860~1920
 1920  └──────────────────────────┘
```
- 가게 그림은 **아래쪽 1/3에 카운터 윗면**이 오게 그리면 손님이 카운터 너머에 앉은 것처럼 보입니다(참고 3번 구도). 위쪽 112px은 HUD가 덮으니 천장·조명 정도만 둡니다.
- 대화창 장면에서는 인물이 화면 아래쪽 절반에 서고, 대화창이 맨 아래(y 1400~1880)에 놓입니다.

---

## 4. 프롬프트 (각각 앞에 2장 스타일 블록을 붙임)

> 형식: `[스타일 블록] + 아래 본문`. 투명 배경이 필요한 것은 끝에 `on a plain white background, isolated, single object, centered`를 붙이고 후처리로 배경을 지웁니다.

### 4-1. 아버지 기본 (#27) — 첫 3장 시험 ①
```
upper body portrait of a cute chibi Korean man in his late twenties, short neat
black hair, round friendly face, no mustache, slightly shy but kind smile, pink
collared shirt with rolled sleeves, green denim overalls, 1990 Busan market
shopkeeper, facing slightly to the right, three-quarter view, waist-up,
on a plain white background, isolated, single character, centered
```
메모: 참고 1번의 젊은 남자 모습이 기준입니다. 참고 3번의 콧수염 아저씨처럼 나오면 `young, no mustache`를 앞쪽으로 옮기세요.

### 4-2. 어머니(태자) 기본 (#28)
```
upper body portrait of a cute chibi Korean woman in her mid twenties, energetic
and confident expression, bright eyes, shoulder-length black hair tied in a low
ponytail with a few loose strands, 1990 Korean retro style, cream blouse with a
small floral pattern, rolled sleeves, a dark red apron, daughter of a Busan market
merchant family, facing slightly to the left, three-quarter view, waist-up,
on a plain white background, isolated, single character, centered
```
메모: 아버지와 **마주 보게** 방향을 반대로 둡니다(아버지 오른쪽, 어머니 왼쪽). 배우를 닮았는지 꼭 확인하세요(0-2). 원작 인물 정보는 투자제안서 9쪽 인물 소개 기준입니다(현재 57세 → 1990년 20대).

### 4-2b. 표정 차분 (#32, #33) ○
```
(char_father_smile) same character as reference, same outfit and pose, eyes
                    closed in a warm happy smile, slight blush
(char_mother_smile) same character as reference, same outfit and pose, laughing
                    with mouth open, eyes curved, one hand near her cheek
```
→ #27, #28과 **같은 시드** + 해당 이미지를 참조 이미지로 넣습니다. 옷·머리가 달라지면 쓰지 않습니다.

### 4-3. 머지 아이템 공통 문장 (#1~10) — 첫 3장 시험 ②는 oden_1
모든 아이템 프롬프트 앞(스타일 블록 바로 뒤)에 아래 문장을 붙입니다. 각도와 크기를 맞추기 위한 것입니다.
```
game item icon, single food object, seen from a 3/4 top-down angle, fills about
80 percent of the frame, bold silhouette readable at small size, warm appetizing
colors, on a plain white background, isolated, centered
```

#### 어묵 체인 (#1~5) — 시드 고정, 같은 접시 계열
```
(oden_1 생선살)    a small pile of fresh white minced fish paste with a pink tint
                   on a simple round light-blue enamel plate
(oden_2 어묵 반죽)  a smooth ball of fish cake dough with a wooden spatula on the
                   same light-blue enamel plate
(oden_3 튀김 어묵)  three golden deep-fried flat fish cakes, crispy edges, on the
                   same light-blue enamel plate
(oden_4 어묵 꼬치)  two Korean fish cake skewers, folded wavy fish cake on long
                   wooden sticks, glossy golden brown
(oden_5 어묵탕)    a steaming aluminum pot of Korean fish cake soup, skewers sticking
                   out, clear broth with green onion and radish, rising steam
```

#### 돼지국밥 체인 (#6~10) — 시드 고정, 같은 뚝배기 계열
```
(gukbap_1 돼지뼈)     a few clean pork bones on a wooden cutting board
(gukbap_2 사골 육수)   a small aluminum pot of milky white pork bone broth, gentle steam
(gukbap_3 수육)       neatly sliced boiled pork belly fanned on a wooden board, a small
                     dish of salted shrimp sauce
(gukbap_4 뚝배기 국밥)  a black earthenware pot of Busan pork rice soup, milky broth,
                     sliced pork, chopped green onion on top, steaming
(gukbap_5 국밥 한 상)  a full meal tray: black earthenware pot of pork rice soup, bowl
                     of rice, small side dishes of kimchi, chives and onion, steaming
```
메모: 단계가 올라갈수록 **크기·김·반찬이 늘어 보이게** 고릅니다. 5단계는 한눈에 "완성 요리"로 읽혀야 주문 칸에서 구분됩니다.

### 4-4. 생성기 (#11, #12)
```
(gen_oden)   a wooden fish crate overflowing with fresh fish and ice, a small
             lantern-yellow glow around the crate edge, Busan fish market style
(gen_gukbap) a big black cast-iron cauldron on a small brick stove with a red
             fire underneath, steam rising, a small lantern-yellow glow around it
```
각 항목 `game item icon, 3/4 top-down angle, plain white background, isolated, centered`.
메모: 생성기는 아이템과 구분되도록 **테두리 빛(노란 기운)** 을 넣었습니다. 노란 빛이 "합칠 수 있음" 표시와 헷갈리면 빼세요.

### 4-5. 보드 칸 / 보드 판 (#13, #14)
```
(ui_cell)  a single square dark charcoal serving tray seen from directly above,
           rounded corners, thin lighter rim, slight inner shadow, empty, flat,
           plain white background
(ui_board) a large wooden kitchen counter top seen from directly above, warm
           brown wood planks, thick dark outline frame with rounded corners,
           empty surface, no objects, vertical rectangle, plain white background
```
메모: 참고 3번 하단의 검은 쟁반이 기준입니다. ui_cell은 코드가 63번 반복해서 깔기 때문에 **무늬가 없고 단순할수록** 좋습니다. ui_board는 안쪽이 비어야 합니다.

### 4-6. 가게 3단계 (#15~17) — 첫 3장 시험 ③은 shop_0
> **2026-10-28: 1차 그림이 일본 가정집처럼 나와서 8-2의 새 프롬프트로 다시 그립니다.** 아래는 1차 기록용으로 남겨 둡니다 (`noren curtain` 같은 일본풍 단어가 원인 중 하나, 8-0).

**구도는 세 장 모두 같게** (같은 시드, 묘사만 바꿈). 정면에서 본 작은 식당 안쪽, 아래 1/3에 카운터, 뒤쪽 벽에 창문과 선반.
```
(shop_0 처음 상태)
interior of a small old Korean eatery in a 1990 Busan market, front view, a long
wooden counter across the bottom third, behind it an empty dusty room, cracked
cream tiles, faded wallpaper peeling, a broken wooden shelf, dim light from a
dirty window, a few cardboard boxes, cobwebs in the corner, still cozy and cute,
empty blank signboard above, no people, wide horizontal composition

(shop_1 1단계 확장)
same interior and same composition, cleaned and repaired, fresh cream tiles,
mended wooden shelf with aluminum pots and bowls, a clean window with afternoon
sunlight, a small potted plant, two wooden stools at the counter, warm hanging
lamp, empty blank signboard, no people

(shop_2 2단계 확장)
same interior and same composition, lively and expanded, wall opened to a second
table area, a window showing the Busan harbor and fishing boats, shelves full of
earthenware pots and jars, a calendar and a small CRT television on the wall,
warm lanterns, a blank cloth noren curtain, potted plants, inviting and bright,
no people
```
메모: 사람은 넣지 않습니다(손님은 코드가 cust 이미지를 따로 얹음). 손님이 앉을 카운터 뒤 자리(가로 3군데)를 비워 두세요. 1990년 고증(TV, 달력, 알루미늄 냄비)은 고를 때 확인합니다.

### 4-7. 손님 4명 (#18~21)
```
(cust_1 부두 일꾼)    cute chibi middle-aged Korean dock worker, tanned face, towel
                    around the neck, gray work jacket, big hungry grin
(cust_2 상인 아주머니) cute chibi Korean market auntie in her fifties, permed short
                    curly hair, floral vest, cheerful
(cust_3 학생)        cute chibi Korean high school boy, short buzz cut, black 1990
                    school uniform with stand-up collar, eager expression
(cust_4 할아버지)     cute chibi Korean grandfather, gray flat cap, gentle closed-eye
                    smile, olive cardigan
```
각 항목 끝에 `head and shoulders, facing front, plain white background, isolated, centered`.
메모: 참고 3번처럼 **카운터 위로 머리와 손만** 보이는 구도가 됩니다. 손은 넣어도 되지만 손가락이 이상하면 어깨까지만 씁니다.

### 4-8. 기억 장면 배경 (#30)
> **2026-10-28: 1차 그림이 일본 풍경처럼 나와서 8-1의 새 프롬프트로 다시 그립니다.** 아래는 1차 기록용입니다 (`paper lanterns`가 원인 중 하나, 8-0).

```
vertical scene, a narrow Busan market alley at night in 1990, closed shop
shutters, warm yellow paper lanterns hanging in a row, soft lantern glow, deep
indigo purple night sky with a few stars, wet stone ground reflecting the
lanterns, nostalgic dreamlike memory mood, slight soft vignette at the edges,
empty center for characters, no people
```
메모: 참고 1번의 남보라 밤 + 노란 등불 톤입니다. 이 배경 위에 인물·대화창이 올라가므로 **가운데 아래쪽이 비어 있고 어두운 정도가 고른 것**을 고르세요. 무서운 느낌(유령, 묘비)이 섞이면 쓰지 않습니다.

### 4-9. UI 틀 (#22~26, #29)
```
(ui_hud)     a long horizontal game UI bar, dark navy blue panel with an ornate
             gold trim border and small Korean traditional corner ornaments,
             empty inside, flat
(ui_button)  a rounded rectangle game button, teal green fill, thick gold trim
             border, subtle top highlight, empty, no text
(ui_dialog)  a wide rounded dialog box, cream paper inside, dark navy frame with
             gold trim, traditional Korean cloud-pattern corner ornaments, empty
             inside, flat front view
(ui_order)   a round white speech bubble with a small tail at the bottom left,
             thick dark brown outline, empty inside
(ui_coin)    a shiny gold coin with a simple flower emblem, thick outline
(ui_expand) a small wooden hammer with a red handle tie, thick outline
```
각 항목 끝에 `plain white background, isolated, centered`.
메모: 참고 1·2번 상단 바와 하단 버튼이 기준입니다. ui_dialog는 **9분할**(가장자리 장식은 네 귀퉁이에만, 변은 반복 가능한 단순한 선)로 늘려 쓰므로 가운데에 장식이 있으면 안 됩니다.

### 4-10. 효과 (#31) ○
```
(fx_merge) a burst of warm yellow sparkles and small stars with a soft round
           glow, thick outlines, plain white background
```

---

## 5. 후처리
1. 배경 제거(투명 PNG) → 가장자리 흰 테두리 확인
2. 3장 표의 크기로 맞춤. 아이템 10장은 **물체 크기를 서로 비슷하게**(여백 10% 안팎) 자릅니다
3. 외곽선 색이 튀는 이미지는 색 보정(외곽선 #2B1D14 계열로 통일)
4. 원본은 `abba_memory/assets/original/`에, 게임용은 `abba_memory/assets/<파일명>.png`에 저장
5. 제출본(단일 HTML)은 빌드 스크립트가 WebP로 줄여 넣습니다(6일차)

## 5-1. 게임에 넣는 법
- `abba_memory/assets/<3장 파일명>.png`로 저장 → `abba_memory/src/index.html` 새로고침하면 바로 반영, 파일이 없으면 색 블록
- 파일 이름이 한 글자라도 다르면 색 블록으로 나옵니다. 디버그 패널(D키)의 "이미지 상태"에서 어떤 파일이 들어갔는지 볼 수 있습니다

## 6. 판단 기준 (고를 때)
- 칸 크기(약 112px)에서 **어묵 1~5단계, 국밥 1~5단계가 서로 구분되는가**, 특히 4단계와 5단계
- 어묵 체인과 국밥 체인이 **색만 봐도 갈리는가** (주황 vs 베이지)
- 아버지·어머니·손님이 참고 3번 인물들과 같은 게임처럼 보이는가 (외곽선 굵기, 등신)
- 가게 3장이 같은 구도인가, 확장 차이가 한눈에 보이는가
- 1990년에 없던 물건이 섞이지 않았는가
- **일본풍 단서가 섞이지 않았는가** (종이 등롱, 노렌, 나무 창살·종이 미닫이, 다다미, 기와 처마, 세로 깃발) — 2026-10-28 추가, 8-0
- 가게 3장이 **같은 가게가 넓어지는 것**으로 보이는가 (카운터·바닥·천장 위치가 같은가) — 8-2
- 어머니가 특정 배우를 닮지 않았는가

## 7. 선택 기록표 (제출 리소스 + "본인 경험 및 의견" 근거)
| 파일 | 모델/LoRA(버전·라이선스 확인일) | 프롬프트 수정 | 시드 | 뽑은 수 | 고른 이유 | 직접 고친 내용 |
|---|---|---|---|---|---|---|
| char_father | | | | | | |
| oden_1 | | | | | | |
| shop_0 | | | | | | |
(이후 행 추가)

---

## 8. 2차 이미지 요청 (2026-10-28, 1차 33장을 게임에 넣어 본 뒤)

> 근거: 사용자가 1차 33장을 `abba_memory/assets/`에 넣고 게임에서 확인한 의견.
> - `bg_memory`가 **일본 풍경** 같다 → 한국 부산 시장 거리로
> - `shop_0~2`가 가게보다 **일본 가정집** 같다 → 한국 부산 시장 음식점으로, 그리고 **확장되는 느낌**으로
> - 필요한 이미지가 더 있으면 추가

### 8-0. 왜 일본풍으로 나왔나, 어떻게 막나
- **1차 프롬프트 탓이 큽니다.** 4-8에 `paper lanterns hanging in a row`(종이 등롱 줄), 4-6에 `noren curtain`(일본식 가게 천)을 제가 넣었습니다. 둘 다 일본을 강하게 떠올리게 하는 단어입니다.
- 귀여운 2D 그림체 모델은 "아시아 + 옛날 + 가게"를 일본 풍경으로 그리는 경향이 있습니다 (나무 창살, 미닫이 종이문, 기와 처마). 그래서 **한국에만 있는 물건을 구체적으로** 적고, 일본 단서를 **네거티브에 따로** 넣습니다.
- 지금 그림 중 `gen_oden`(생선 상자)에도 작은 종이 등롱이 붙어 있습니다. 게임에서 작게 보여 급하지는 않지만, 다시 뽑는다면 등롱을 빼세요 (8-3).

#### 1990년 부산 시장 음식점 단서 (넣을 것 / 뺄 것)
| 넣을 것 (한국 1990) | 영어 표현 | 뺄 것 (일본풍) |
|---|---|---|
| 알루미늄 틀 미닫이 유리문 | aluminum-framed sliding glass doors | 나무 창살, 종이 미닫이문(쇼지) |
| 작은 정사각 흰색·민트색 벽 타일 | small square white and mint-green wall tiles | 다다미, 나무 판자 벽 가득 |
| 천장 형광등 (긴 막대 등) | fluorescent tube lights on the ceiling | 종이 등롱(초칭) |
| 둥근 스테인리스 상 + 빨간 둥근 플라스틱 의자 | round stainless steel tables, red round plastic stools | 낮은 나무 좌식 탁자 |
| 입구 쪽 큰 스테인리스 육수 솥 | a huge steaming stainless steel stock pot near the entrance | 라멘집 카운터 |
| 스테인리스 물컵, 플라스틱 물병 | stainless steel water cups, plastic water pitcher | 사케 병, 도자기 술잔 |
| 글자 없는 나무 메뉴판 | blank wooden menu boards on the wall | 세로 글씨 천 깃발 |
| 벽걸이 선풍기, 벽 선반 위 브라운관 TV | wall-mounted electric fan, small CRT TV on a wall bracket | |
| 줄무늬 천막 차양, 파란 방수포 | striped canvas awning, blue tarpaulin | 노렌(가게 입구 천) |
| 함석 지붕, 셔터 내린 점포 | corrugated metal roofs, rolled-down metal shutters | 기와 처마, 도리이 |
| 주황 천막 포장마차 불빛 | glowing orange tarp tents of street food carts | 이자카야 |
| 전봇대와 엉킨 전깃줄, 맨 백열전구 줄 | concrete utility poles with tangled wires, bare light bulbs strung on wires | |
| 스티로폼 생선 상자, 빨간 고무 대야 | styrofoam fish boxes, red rubber basins | |
| 산비탈 동네 불빛 (부산 산복도로) | hillside village houses with small lit windows | 벚꽃, 신사 |

#### 일본풍 네거티브 (2장 공통 네거티브 뒤에 추가)
```
japanese style, japan, paper lantern, chochin, noren, shoji, tatami, torii,
shrine, japanese tiled roof, izakaya, ramen shop, sake bottle, kimono, yukata,
sakura, kanji sign, vertical banner flag, wooden lattice window
```
※ 8장의 프롬프트는 모두 이 네거티브를 함께 씁니다.

### 8-1. 기억 장면 배경 `bg_memory` 다시 그리기 ★ (같은 이름으로 덮어쓰기)
밤 + 따뜻한 불빛 톤은 그대로, **불빛의 출처를 종이 등롱 → 백열전구 줄·포장마차 천막**으로 바꿉니다.
```
vertical scene, a Korean traditional market alley in Busan at night in 1990,
rows of closed stalls with rolled-down metal shutters and corrugated metal
roofs, bare warm incandescent light bulbs strung on wires across the alley,
a glowing orange tarp tent of a street food cart at the far end, blue
tarpaulin awnings and a big faded beach parasol over a stall, stacked
styrofoam fish boxes and red rubber basins at the sides, concrete utility
poles with tangled electric wires, wet concrete ground reflecting the warm
light, in the distance a steep hillside village with small lit windows under
a deep indigo purple night sky with a few stars, nostalgic dreamlike memory
mood, slight soft vignette, empty center and lower half for characters,
no people
```
메모
- 가운데 아래쪽(인물이 서는 자리, y 700~1500)이 **비어 있고 어둡기가 고른 것**을 고릅니다. 1차 그림처럼 골목이 가운데로 깊게 들어가는 구도는 좋았습니다.
- 간판은 글자 없이 나와야 합니다. 한글 비슷한 깨진 글자가 나오면 지우거나 다시 뽑습니다.
- 고를 때 확인: 종이 등롱, 기와 처마, 세로 깃발이 없는가.

### 8-2. 가게 3단계 `shop_0~2` 다시 그리기 ★ (같은 이름으로 덮어쓰기)
> **2026-10-29: 이 순서(부분 인페인트)로 만든 그림이 오려 붙인 것처럼 보여서, 9-3의 '그림 전체를 다시 그리는' 순서로 바꿉니다.** 아래는 2차 기록용입니다.


#### 확장되는 느낌을 만드는 방법
보드가 **처음 5×6 → 확장 1단계 양옆 열림(7×6) → 확장 2단계 아래까지 전부(7×9)** 로 넓어지는 것과 맞춰, 가게도 **가운데 작은 가게 → 양옆 이웃 칸까지 넓힘 → 안쪽 벽을 터서 뒤쪽 방까지** 로 넓어지게 합니다.

| 그림 | 가게 모습 | 보드와 맞춤 |
|---|---|---|
| shop_0 | **가운데 1칸짜리 작은 국밥·어묵집.** 양옆은 이웃 점포의 내린 셔터와 칸막이 벽. 카운터 하나, 큰 솥 하나, 빨간 의자 2개 | 5×6 (양옆 닫힘) |
| shop_1 | 같은 구도에서 **양옆 셔터가 올라가 이웃 칸까지 가게가 됨.** 둥근 스테인리스 상 2개, 빨간 의자, 형광등, 메뉴판 | 7×6 (양옆 열림) |
| shop_2 | 같은 구도에서 **안쪽 벽을 터서 뒤쪽 방과 큰 창이 생김.** 창 너머 부산 항구, 손님 상 여러 개, 브라운관 TV, 달력, 글자 없는 큰 간판 틀 | 7×9 (전부) |

**세 장의 구도를 똑같이 맞추는 순서 (권장)**
1. **shop_2(가장 넓은 모습)를 먼저** 뽑아 고릅니다.
2. shop_2를 바탕으로 **인페인트**(그림 일부만 다시 그리기)해서 **뒤쪽 방 부분을 막힌 타일 벽**으로 바꾸면 shop_1이 됩니다.
3. shop_1을 바탕으로 **좌우 1/4씩을 이웃 점포의 내린 셔터·칸막이**로 인페인트하면 shop_0이 됩니다.
4. 이렇게 하면 카운터·바닥·천장 위치가 세 장 모두 같아서, 게임에서 그림이 바뀔 때 **같은 가게가 넓어지는 것**으로 보입니다.
- ComfyUI에서는 이미지 불러오기 + 마스크 + 인페인트용 노드로 할 수 있습니다. 어떤 노드·모델을 쓸 수 있는지, 다시 그리는 세기(denoise)를 얼마로 할지는 **설치 환경에 따라 다르니 직접 확인**하세요(0.6~0.8 정도에서 시작해 보는 것을 권합니다). 인페인트가 안 되면 같은 시드 + 아래 세 프롬프트로 뽑고, 카운터 위치가 가장 비슷한 것끼리 고릅니다.

**공통 구도 (세 장 모두 앞에 붙임)**
```
front view of the inside of a small Korean restaurant in a 1990 Busan
traditional market, seen from behind the customer counter, a long worn wooden
counter with a stainless steel top edge across the bottom third of the image,
the space behind the counter visible, ceiling with fluorescent tube lights at
the top, wide horizontal composition, no people
```

**shop_2 (먼저 뽑음) — 확장 2단계**
```
[공통 구도] + lively expanded restaurant, the back wall opened into a second
dining room, several round stainless steel tables with red round plastic
stools, a big window at the back showing the Busan harbor with fishing boats
and cranes, a huge steaming stainless steel stock pot on a gas burner at the
left, blank wooden menu boards on the wall, a wall calendar, a small CRT
television on a wall bracket, a wall-mounted electric fan, small square white
and mint-green wall tiles, aluminum-framed sliding glass doors at the side,
a large empty blank signboard frame above the back room, warm and bright,
inviting
```

**shop_1 — 확장 1단계 (shop_2에서 뒤쪽 방을 막음)**
```
[공통 구도] + the same restaurant before the back room was opened, a plain
back wall of small square white and mint-green tiles with one small window,
the left and right neighboring stalls joined into the restaurant with their
metal shutters rolled up, two round stainless steel tables with red round
plastic stools on the sides, a huge steaming stainless steel stock pot on a
gas burner at the left, blank wooden menu boards, a wall-mounted electric fan,
clean and cheerful
```
인페인트로 할 때 마스크: **뒤쪽 방·큰 창·간판 틀 부분.**

**shop_0 — 처음 (shop_1에서 양옆을 이웃 셔터로 막음)**
```
[공통 구도] + a tiny one-room restaurant stall squeezed between neighboring
stalls, on the far left and far right the rolled-down metal shutters and
plywood partitions of the neighbors' closed stalls, only the center space is
the restaurant, one huge steaming stainless steel stock pot on a gas burner,
two red round plastic stools at the counter, a single bare light bulb and one
fluorescent tube, a plain tiled back wall with one small window, a small blank
wooden menu board, modest and a bit worn but clean, a fresh start
```
인페인트로 할 때 마스크: **좌우 각 1/4 (상 2개가 있던 자리).**

메모
- **처음 가게는 '망한 가게'가 아니라 '막 차린 작은 가게'** 입니다 (용어 '복구'→'확장', 2026-10-28). 먼지·거미줄·깨진 타일은 넣지 않습니다.
- 사람은 넣지 않습니다(손님은 코드가 `cust` 이미지를 따로 얹음). 카운터 뒤 가로 3군데(손님 머리 자리, 3-1 그림 참고)는 **큰 물건으로 가리지 않게** 고릅니다.
- 위쪽 112px은 HUD가 덮으니 천장·형광등 정도만 오게 합니다.
- 고를 때 확인: 나무 창살 미닫이, 종이문, 다다미, 노렌, 종이 등롱이 없는가. 가정집 거실처럼 보이지 않고 **손님이 와서 밥 먹는 곳**으로 보이는가 (둥근 상, 빨간 의자, 큰 솥, 메뉴판).

### 8-3. 새로 필요한 이미지 (코드 연결 필요 표시가 있는 것은 그림을 넣은 뒤 코드에 연결)

| # | 구분 | 파일명 | 크기(px) | 배경 | 우선 | 코드 |
|---|---|---|---|---|---|---|
| 34 | 닫힌 칸 덮개 (자물쇠 칸) | ui_lock.png | 128×128 | 투명 | ☆ | 연결 필요 (지금은 코드로 어둡게 + 자물쇠) |
| 35 | 스토리 1 배경: 새벽 어시장 | bg_story1.png | 1080×1920 | 있음 | ○ | 연결 필요 (지금은 모든 스토리가 bg_memory) |
| 36 | 스토리 2·마무리 배경: 간판 다는 가게 앞 | bg_story2.png | 1080×1920 | 있음 | ○ | 연결 필요 |
| 37 | 생선 상자 생성기 (등롱 뺀 것) | gen_oden.png | 256×256 | 투명 | ○ | 덮어쓰기만 |

※ 35·36은 이야기 장면마다 배경이 달라 보이게 하는 것으로, 없어도 데모는 돌아갑니다. 34는 닫힌 칸이 30칸 넘게 보이는 처음 화면의 인상을 좌우해서 ☆로 두었습니다.

**ui_lock — 닫힌 칸 덮개**
```
a single square tile covered by a closed wooden crate lid with two metal
straps and a small brass padlock in the center, seen from directly above,
rounded corners, slightly darker brown so it reads as unavailable, simple,
flat, plain white background, isolated, centered
```
메모: 63칸 중 최대 33칸에 반복해서 깔리므로 **무늬가 단순하고 어두운 편**이 좋습니다. `ui_cell`(쟁반)과 같은 크기·같은 모서리 둥글기로 맞춥니다.

**bg_story1 — 새벽 어시장 (스토리 1: 태자가 새벽마다 다녀오는 곳)**
```
vertical scene, a Busan fish market at dawn in 1990, wet concrete floor,
rows of styrofoam fish boxes and red rubber basins with fish and squid, blue
tarpaulin awnings, bare light bulbs still on, a pale blue and soft pink dawn
sky over the harbor with fishing boats and cranes, rising mist, quiet and
calm before the market opens, empty center and lower half for characters,
no people
```

**bg_story2 — 가게 앞, 간판 다는 날 (스토리 2·마무리)**
```
vertical scene, the front of a small Korean restaurant in a 1990 Busan
market street in the evening, aluminum-framed sliding glass doors with warm
light inside, a large empty blank signboard frame above the entrance, a
wooden ladder leaning against the wall, a striped canvas awning, red round
plastic stools stacked outside, a huge stainless steel stock pot steaming by
the door, neighboring stalls with shutters half down, warm orange evening
sky fading to indigo, empty center and lower half for characters, no people
```
메모: 간판에는 글자를 넣지 않습니다. '황가상점' 글자는 필요하면 코드(폰트)로 얹습니다.

**gen_oden — 생선 상자 (등롱 빼고 다시)** ○
```
a wooden fish crate overflowing with fresh fish and crushed ice, a soft
lantern-yellow glow around the crate edge, Busan fish market style, no
lantern, no paper lantern, game item icon, 3/4 top-down angle, plain white
background, isolated, centered
```
메모: 지금 게임은 생성기 뒤에 코드로 노란 빛을 그리므로, 그림 자체의 빛은 약해도 됩니다.

### 8-4. 3장 전체 표에 추가
3장 표의 #15~17, #30은 이 장의 프롬프트로 다시 그립니다 (같은 파일 이름으로 덮어쓰기). #34~37은 8-3 표를 보세요.

---

## 9. 3차 이미지 요청 (2026-10-29, 2차 이미지를 게임에 넣어 본 뒤)

> 근거: 사용자 요청 (2026-10-29)
> 1. 마무리 장면 간판에 **'황가상점'** 글씨 — 먼저 이미지 생성으로 시도, 잘 안 나오면 코드로 씀 (코드 대신 쓰기는 이미 준비됨, 9-1)
> 2. 가십하버처럼 **손님 바로 밑에 접시**, 그 위에 음식 → 접시 이미지 (게임 화면은 이미 접시 방식으로 바뀜, 9-2)
> 3. `shop_0`·`shop_1`이 `shop_2`의 가운데만 오려 붙인 것처럼 보임 → **각각 자연스러운 한 장**으로 다시 (9-3)

| # | 구분 | 파일명 | 크기(px) | 배경 | 우선 | 코드 |
|---|---|---|---|---|---|---|
| 38 | 마무리 배경: '황가상점' 간판이 걸린 가게 앞 | bg_ending.png | 1080×1920 | 있음 | — 안 만듦 | 코드 글씨로 결정 (2026-10-29) |
| 39 | 주문 접시 | ui_plate.png | 256×128 | 투명 | ★ | 연결됨 (없으면 코드로 그린 흰 접시) |
| 15~17 | 가게 3단계 다시 | shop_0 ~ shop_2.png | 1080×660 | 있음 | ★ | 덮어쓰기만 |

### 9-1. 마무리 배경 `bg_ending` — 간판에 '황가상점' ☆
> **2026-10-29 사용자 결정: `bg_ending`은 만들지 않습니다.** 마무리 장면은 `bg_story2`의 빈 간판 위에 코드(폰트)로 '황가상점'을 씁니다. 아래 프롬프트는 기록용입니다.


**AI가 한글을 쓰게 하는 요령 (확인 못 한 부분은 표시)**
- 대부분의 그림 모델(SD 1.5·SDXL 계열)은 **한글을 거의 못 씁니다.** 글자를 비교적 잘 쓰는 모델(예: FLUX 계열)을 쓰면 가능성이 있지만, **한글 네 글자가 정확히 나올지는 확인하지 못했습니다.** 모델마다 라이선스도 다르니(예: FLUX.1 [dev]는 비상업 라이선스로 알려져 있음) **모델 페이지에서 직접 확인**하세요.
- 글자는 프롬프트에서 **큰따옴표로 감싸고**, 간판 위치·모양을 구체적으로 적습니다. 4장 이상 뽑아 글자가 맞는 것만 고릅니다.
- 그림 전체를 다시 뽑기보다 **`bg_story2`를 바탕으로 간판 부분만 인페인트**하는 것이 같은 가게로 보이기 쉽습니다. 이때는 9-3처럼 경계가 티 나지 않게 마스크 가장자리를 부드럽게(feather) 합니다.
- 글자가 틀리면 그 그림은 쓰지 않습니다. **`bg_ending.png`가 없으면 게임은 `bg_story2`의 빈 간판 위에 코드(폰트)로 '황가상점'을 씁니다** (`data.js`의 `story.sign`).

```
vertical scene, the front of a small Korean restaurant in a 1990 Busan market
street at dusk, a large white rectangular signboard above the entrance with
bold dark navy Korean hangul letters "황가상점" written in the center, the
sign lit warmly, aluminum-framed sliding glass doors with warm light inside,
a striped canvas awning, red round plastic stools stacked outside, a huge
stainless steel stock pot steaming by the door, two pairs of rubber boots
standing side by side next to the door, neighboring stalls with shutters half
down, warm orange evening sky fading to indigo, empty center and lower half
for characters, no people
```
네거티브에 8-0의 일본풍 네거티브 + `chinese characters, kanji, katakana, gibberish text, misspelled text, extra letters` 추가.
메모
- **장화 두 켤레**는 이야기의 상징(아버지의 장화, 태자의 장화)입니다 (2026-10-29 켄터키 루트 제로 참고 반영). 작게 보여도 괜찮습니다.
- 가짜 글자가 다른 간판에 생기기 쉬우니 **간판은 하나만** 보이게 고릅니다 (2차 `bg_story2`의 좌우 가짜 글자 문제).

### 9-2. 주문 접시 `ui_plate` ★

화면에서 손님 얼굴 바로 아래에 접시가 놓이고, 그 위에 요리 아이콘(1~2개)을 코드가 얹습니다. 첨부한 가십하버 화면처럼 **손님 앞 카운터에 놓인 접시**로 보이면 됩니다.
```
an empty wide oval white ceramic serving plate with a thin blue rim, seen
from a 3/4 top-down angle, simple and clean, soft shadow under the plate,
Korean 1990 diner tableware, thick dark brown outline, game UI asset,
plain white background, isolated, centered
```
메모
- 가로로 긴 타원(가로:세로 약 2:1). 요리가 2개 올라가는 주문도 있으니 **가운데가 넓고 비어 있어야** 합니다.
- 접시 위에 음식·무늬를 넣지 않습니다. 파란 테두리는 1990년 식당 그릇 느낌이고, 빼도 됩니다.
- 크기 256×128로 잘라 배경을 지웁니다.

### 9-3. 가게 3단계 `shop_0~2` 다시 — 자연스러운 한 장씩 ★

**왜 오려 붙인 것처럼 보였나**
- 2차 때 제가 권한 순서(8-2)는 `shop_2`의 **일부만 마스크로 다시 그리는 인페인트**였습니다. 마스크 경계가 딱딱하면 바뀐 부분과 안 바뀐 부분의 빛·선·흐림이 달라 **경계에 띠**가 생기고, 바뀐 부분만 떠 보입니다. 게임에서는 많이 가려지지만, 그림 자체로는 어색합니다.

**이번 순서 (부분이 아니라 그림 전체를 다시 그림)**
1. **`shop_0`을 먼저, 처음부터(txt2img) 한 장으로** 뽑습니다. 아래 `shop_0` 프롬프트 전체를 씁니다.
2. 고른 `shop_0`을 바탕으로 **그림 전체를 img2img**(마스크 없이)로 다시 그리며 `shop_1` 프롬프트를 씁니다. 다시 그리는 세기(denoise)는 **0.55~0.7에서 시작**해 봅니다 **[직접 확인 필요]**. 낮으면 거의 안 바뀌고, 높으면 구도까지 바뀝니다.
3. 고른 `shop_1`을 바탕으로 같은 방법으로 `shop_2`를 만듭니다.
4. 그림 전체를 한 번에 다시 그리므로 **경계 띠가 생기지 않고**, 바탕 그림 덕분에 카운터·바닥·천장 위치는 비슷하게 유지됩니다.
- 위치가 너무 많이 흔들리면: 바탕 그림의 **선(lineart/canny)이나 깊이(depth)를 ControlNet으로 약하게(0.3~0.5)** 걸어 구도만 잡아 주는 방법이 있습니다. 쓸 수 있는 노드·모델은 설치 환경마다 다르니 **직접 확인**하세요.
- 어느 방법이든 **4장 이상** 뽑고, 세 장을 나란히 놓고 "같은 가게가 넓어지는가"로 고릅니다.

**세 프롬프트는 각각 혼자서도 완성된 장면**입니다 (앞 그림을 가리키는 'same restaurant' 같은 말을 쓰지 않음). 앞에 2장 스타일 블록, 네거티브에 8-0 일본풍 네거티브 + `collage, patchwork, visible seams, mismatched lighting, blurry patches, split image` 추가.

**shop_0 — 처음: 시장 골목 사이에 낀 작은 한 칸 가게**
```
front view of the inside of a tiny one-room Korean restaurant in a 1990 Busan
traditional market, seen from behind the customer counter, a long worn wooden
counter with a stainless steel top edge across the bottom third of the image,
a narrow space behind the counter, on both side walls the corrugated metal
shutters of the neighboring closed stalls, a plain back wall of small square
white and mint-green tiles with one small window, one huge steaming stainless
steel stock pot on a gas burner, two red round plastic stools, a single bare
light bulb and one fluorescent tube light on a low ceiling, a small blank
wooden menu board, modest but clean, a fresh new start, one consistent light
source, no people, wide horizontal composition
```

**shop_1 — 확장 1단계: 양옆 이웃 칸까지 넓어진 가게**
```
front view of the inside of a small Korean restaurant in a 1990 Busan
traditional market, seen from behind the customer counter, a long worn wooden
counter with a stainless steel top edge across the bottom third of the image,
the room now wider on both sides with the neighboring stall walls removed,
two round stainless steel tables with red round plastic stools on the left
and right, a plain back wall of small square white and mint-green tiles with
one small window, a huge steaming stainless steel stock pot on a gas burner,
blank wooden menu boards on the wall, a wall-mounted electric fan, a row of
fluorescent tube lights on the ceiling, clean and cheerful, one consistent
light source, no people, wide horizontal composition
```

**shop_2 — 확장 2단계: 안쪽 방과 큰 창까지 넓어진 가게**
```
front view of the inside of a lively Korean restaurant in a 1990 Busan
traditional market, seen from behind the customer counter, a long worn wooden
counter with a stainless steel top edge across the bottom third of the image,
a wide room with the back wall opened into a second dining room, several round
stainless steel tables with red round plastic stools, a big window at the back
showing the Busan harbor with fishing boats and cranes, a huge steaming
stainless steel stock pot on a gas burner, blank wooden menu boards, a wall
calendar, a small CRT television on a wall bracket, a wall-mounted electric
fan, a large empty blank signboard frame above the back room, rows of
fluorescent tube lights, warm and bright, inviting, one consistent light
source, no people, wide horizontal composition
```
메모
- **게임 화면에서 보이는 곳**: 위쪽 112px는 HUD, 그 아래 가운데에 손님 3명과 접시(2026-10-29부터 말풍선 대신 접시)가 가로로 놓입니다. 손님 머리 뒤(가운데 높이)에 큰 물건이 몰리지 않게 고릅니다.
- 고를 때 확인: 경계 띠·흐린 사각형이 없는가, 빛 방향이 한 장 안에서 같은가, 세 장의 카운터 높이가 비슷한가.

### 9-4. 3차 결과 확인 (2026-10-29)
- `ui_plate`: 규격(256×128, 투명) 그대로, 게임의 손님 앞 접시로 바로 쓰임
- `shop_0~2`: **각각 자연스러운 한 장**이 되었고, 시장 셔터 사이 작은 가게 → 양옆이 넓어진 가게 → 항구 창이 있는 큰 가게로 확장이 잘 보임. 경계 띠도 없어짐
- 남은 점: 메뉴판·벽 간판에 **한자 비슷한 가짜 글자**가 조금 있음 (`shop_0` 오른쪽 위, `shop_1` 메뉴판, `shop_2` 왼쪽 벽). 게임에서는 작게 보여 급하지 않음. 고친다면 그 부분만 지우거나 빈 판으로 칠함
- `bg_ending`은 아직 없음 → 게임은 `bg_story2` + 코드 간판 글씨로 나옴

---

## 10. 4차 이미지 요청 — 타이틀 화면 (2026-10-29)

> 근거: 사용자 결정 (2026-10-29) "타이틀 화면 + 이어하기/처음부터", 타이틀 그림 프롬프트도 추가. 대표 이미지(키 아트)는 여전히 '나중에'이고, 이것은 **게임 첫 화면 배경**입니다.
> 그림이 없으면 게임은 `bg_memory`(밤 시장 골목) 위에 제목을 씁니다.

| # | 구분 | 파일명 | 크기(px) | 배경 | 우선 | 코드 |
|---|---|---|---|---|---|---|
| 40 | 타이틀 배경 | bg_title.png | 1080×1920 | 있음 | ○ | 연결됨 (없으면 bg_memory) |

**화면에서 가려지는 자리 (1080×1920 기준)** — 제목 글자와 버튼은 코드가 얹습니다.
```
y    0 ┌──────────────────────┐
       │ 하늘·전구 줄 (그림)   │
  500  │ ── 제목 글자 (코드) ──│ 500~800: 차분하게 비워 둠
  800  │                      │
 1200  │   [ 이어하기 ] (코드) │ 1200~1480: 가운데 버튼 자리
 1480  │   [ 처음부터 ] (코드) │
       │ 인물은 양옆 아래쪽    │
 1920  └──────────────────────┘
```

**bg_title**
```
vertical scene, dusk in a Busan traditional market alley in 1990, a small
Korean restaurant with aluminum-framed sliding glass doors glowing warmly in
the background, bare warm light bulbs strung across the alley, a cute chibi
young Korean man in a pink shirt and green overalls standing at the lower
left and a cute chibi young Korean woman with a low ponytail, cream blouse and
dark red apron standing at the lower right, both turned slightly toward each
other, two pairs of rubber boots by the restaurant door, a steaming stainless
steel stock pot, soft purple and orange evening sky, nostalgic memory mood,
calm empty area in the upper middle for the title, open center for buttons,
no text
```
네거티브: 2장 공통 + 8-0 일본풍 네거티브 + `text, letters, signboard text, gibberish`.
메모
- 인물은 이미 만든 `char_father`, `char_mother`를 **참조 이미지(IP-Adapter 계열)** 로 넣어 같은 사람으로 보이게 합니다. 배우를 닮지 않았는지 다시 확인합니다 (0-2).
- 버튼 자리(가운데 1200~1480)에 인물 얼굴이 오지 않게 고릅니다.
- 상징(장화 두 켤레, 육수 솥)은 작게 보여도 됩니다.
