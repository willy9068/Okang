# 오캉과 엄마: 아빠의 기억 — 아트 스타일 · 이미지 목록 · AI 이미지 프롬프트 (ComfyUI용)

> 2026-10-28 · 양식은 `스톱앤스케치_AI이미지_프롬프트_ComfyUI.md`를 따랐습니다. 프롬프트는 영어로 썼습니다(대부분의 모델이 영어에서 안정적).
> 아트 기준 이미지: `따뜻한 한식당 요리 게임 화면-3.png`(기본 톤), `전통 시장 경매 게임 UI-2.png`·`등불이 빛나는 유령 던전 퍼즐 UI-1.png`(UI 틀, 밤 장면).
> 저는 이미지를 직접 만들 수 없고 ComfyUI도 실행해 보지 못했습니다. **결과가 어떻게 나오는지는 확인하지 못했으니** 첫날 3장 시험(0-1)으로 먼저 확인하세요.
> 게임 안 파일 이름은 3장 표와 `abba_memory/README.md`의 이름 규칙이 같습니다. 파일이 없으면 게임은 색 블록으로 돌아갑니다.

---

## 0. 먼저 읽을 것

### 0-1. 사용 순서
1. 2장 **스타일 블록**을 모든 프롬프트 앞에 한 글자도 바꾸지 말고 붙입니다.
2. **먼저 3장만** 만듭니다: ① 아버지 정면(`char_father`) ② 어묵 1단계 아이콘(`oden_1`) ③ 낡은 가게(`shop_0`). 세 장이 한 게임처럼, 그리고 참고 이미지 3번(한식당)과 같은 게임처럼 보이면 나머지를 진행합니다. 안 맞으면 모델·LoRA·스타일 참조부터 바꿉니다.
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
| 기억(스토리) 장면 | **밤 + 등불 빛** (참고 1번): 남보라 밤하늘, 노란 등불. 대화창 뒤 배경만 이 톤 |
| 인물 | 2~2.5등신 귀여운 캐릭터, 굵은 진갈색 외곽선, 큰 머리, 점 눈에 가까운 둥근 눈 |
| 아버지 | 참고 1번의 **젊은 남자** 기준: 20대 후반 한국 남성, 짧은 검은 머리, 콧수염 없음, 분홍 셔츠 + 초록 멜빵바지 |
| 어머니(태자) | **20대 중반 한국 여성** (원작 김태자, 현재 57세 → 1990년 기준). 부산 시장 상인 집안의 씩씩한 인상. 배우와 닮지 않게 |
| 시대·장소 | 1990년 부산 시장 골목, 바다가 가까운 동네. 함석·나무·타일·연탄난로·브라운관 TV 같은 소재 |
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

## 3. 이미지 목록과 파일 규격 (총 33장, 최소 구성 19장)

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
| 15 | 가게: 낡은 상태 | shop_0.png | 1080×660 | 있음 | ★ |
| 16 | 가게: 1단계 복구 | shop_1.png | 1080×660 | 있음 | ★ |
| 17 | 가게: 2단계 복구 | shop_2.png | 1080×660 | 있음 | ★ |
| 18~21 | 손님 4명 (상반신) | cust_1 ~ cust_4.png | 256×256 | 투명 | ★ |
| 22 | 주문 말풍선 | ui_order.png | 256×256 | 투명 | ☆ |
| 23 | 돈 아이콘 (동전) | ui_coin.png | 96×96 | 투명 | ☆ |
| 24 | 상단 HUD 틀 | ui_hud.png | 1080×112 | 투명 | ☆ |
| 25 | 버튼 (청록, 금테) | ui_button.png | 384×128 | 투명 | ☆ |
| 26 | 복구 아이콘 (망치) | ui_restore.png | 128×128 | 투명 | ☆ |
| 27 | 아버지 기본 (상반신) | char_father.png | 768×1024 | 투명 | ☆ (최소) |
| 28 | 어머니(태자) 기본 (상반신) | char_mother.png | 768×1024 | 투명 | ☆ (최소) |
| 29 | 대화창 (9분할용) | ui_dialog.png | 1024×384 | 투명 | ☆ (최소) |
| 30 | 기억 장면 배경 (밤 시장 골목) | bg_memory.png | 1080×1920 | 있음 | ☆ |
| 31 | 합성 반짝 효과 | fx_merge.png | 256×256 | 투명 | ○ |
| 32 | 아버지 웃음 (표정 차분) | char_father_smile.png | 768×1024 | 투명 | ○ |
| 33 | 어머니 웃음 (표정 차분) | char_mother_smile.png | 768×1024 | 투명 | ○ |

※ 숫자(돈, 주문 보상), 이름표, 간판 글자, 길게 누르기 원형 게이지, 합칠 수 있음 노란 테두리는 **코드로** 그립니다.
※ 아이템 단계 이름은 개발 가이드 4-1의 **임시** 이름입니다. 이름이 바뀌면 프롬프트 묘사만 바꾸고 파일명(단계 번호)은 그대로 둡니다.

### 3-1. 화면에서 이미지가 놓이는 자리 (세로 1080×1920 기준)

```
y    0 ┌──────────────────────────┐
       │ ui_hud (돈, 복구 단계)      │ 0~112
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
**구도는 세 장 모두 같게** (같은 시드, 묘사만 바꿈). 정면에서 본 작은 식당 안쪽, 아래 1/3에 카운터, 뒤쪽 벽에 창문과 선반.
```
(shop_0 낡은 상태)
interior of a small old Korean eatery in a 1990 Busan market, front view, a long
wooden counter across the bottom third, behind it an empty dusty room, cracked
cream tiles, faded wallpaper peeling, a broken wooden shelf, dim light from a
dirty window, a few cardboard boxes, cobwebs in the corner, still cozy and cute,
empty blank signboard above, no people, wide horizontal composition

(shop_1 1단계 복구)
same interior and same composition, cleaned and repaired, fresh cream tiles,
mended wooden shelf with aluminum pots and bowls, a clean window with afternoon
sunlight, a small potted plant, two wooden stools at the counter, warm hanging
lamp, empty blank signboard, no people

(shop_2 2단계 복구)
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
(ui_restore) a small wooden hammer with a red handle tie, thick outline
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
- 가게 3장이 같은 구도인가, 복구 차이가 한눈에 보이는가
- 1990년에 없던 물건이 섞이지 않았는가
- 어머니가 특정 배우를 닮지 않았는가

## 7. 선택 기록표 (제출 리소스 + "본인 경험 및 의견" 근거)
| 파일 | 모델/LoRA(버전·라이선스 확인일) | 프롬프트 수정 | 시드 | 뽑은 수 | 고른 이유 | 직접 고친 내용 |
|---|---|---|---|---|---|---|
| char_father | | | | | | |
| oden_1 | | | | | | |
| shop_0 | | | | | | |
(이후 행 추가)
