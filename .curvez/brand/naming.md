# naming: 한국 여행 웹앱

회의 진행 상태: **종결. 브랜드명 확정 — `Life is Nearby` (2026-08-25).**
8 라운드 · 후보 44개 · 참가자 5명 · 사용자 거부 5회를 거쳐 확정했다.
남은 것은 사람이 할 일 둘이다 — **도메인 취득**과 **상표 조회(KIPRIS·USPTO)**. `## 확정 이후` 를 읽어라.

## brief

> **R8 개정 (2026-08-25) — 사용자가 처음으로 자기 쪽에서 형태를 제안했다.**
> 원문: "이런건 어떠냐? **life is OOO** 이런걸로 하고싶어"
> 낱말 하나가 아니라 **영어 구문 템플릿**이다. R7 까지의 "아름다운 낱말 하나" 방향이 아니었다는 뜻이고,
> 다섯 번의 거부·보류에 깔려 있던 변수가 이것일 가능성이 높다. R7 브리프는 아래 이력으로 내린다.

- essence: `.curvez/brand/positioning.md` 의 코어 5줄을 읽어라
- **패턴: `Life is ___`.** 빈칸에 낱말 하나가 들어간다. 이 패턴 안에서만 후보를 만든다

### 표기 형태 — R8 에서 값으로 확정한다

**브랜드명은 전체 구문이다. 축약형이나 빈칸 낱말 단독을 브랜드로 쓰지 않는다.**

근거는 취향이 아니라 이번 라운드의 실측이다. **빈칸 낱말은 의미가 좋을수록 단독으로 이미 점유돼 있다.**

| 빈칸 낱말 | 단독 가용성 | 구문 가용성 |
|---|---|---|
| Detour | `.com`·`.app`·npm 전부 선점. 앱스토어 정확 일치 **9건** — Bose 가 인수한 도보 투어 앱 `Detour`, `Detour - Scenic Navigation`, `Detour: Hidden Stops` | `lifeisdetour` **전부 비어 있음**, 앱스토어 0건 |
| Meander | `.com`·`.app`·npm 전부 선점. 앱스토어 **7건** — `Meander: Trip Feedback Rewards` 포함 | `lifeismeander` 전부 비어 있음 |
| Nearby | `.com`·`.app`·npm 전부 선점. 앱스토어 **5건** | `lifeisnearby` **전부 비어 있음**, 앱스토어 0건 |

**가용성이 구문에만 있다.** 단독어 축약을 브랜드로 삼으면 일곱 라운드 내내 발목을 잡은 그 문제로 되돌아간다.

| 자리 | 확정값 (A 안을 예로) |
|---|---|
| 브랜드 정식 표기 | `Life is Nearby` — 문장형 대소문자, `is` 는 소문자 |
| 앱스토어 표시명 | `Life is Nearby` (14자 / 30자 제한 이내) |
| 도메인 | `lifeisnearby.com` (하이픈 없는 결합형) |
| `package.json` name · npm | `lifeisnearby` |
| 환경변수 접두사 | `LIFEIS_` |
| **앱 아이콘·파비콘** | **구문이 들어가지 않는다. 심볼 또는 모노그램이 별도로 필요하다** — `Life is Good` 이 Jake(막대 인물)를 쓰는 것과 같은 구조다. `curvez-designer` 의 과제다 |
| 본문 내 지칭 | 축약하지 않고 매번 전체 구문 |

- constraints:
  - **[R8 개정] 낱말 결합형을 허용한다.** 기존 "하이픈·숫자 없이 소문자 ASCII" 는 유지하되, 구문을 붙여 쓴 `lifeisnearby` 형태를 식별자로 인정한다. 구문 브랜드에 낱말 하나 제약을 그대로 적용하면 패턴 자체가 불가능해진다
  - **[R8 신설] 빈칸은 `Life is ___` 뒤에서 문법적으로 서야 한다.** 형용사·부사가 자연스럽고, 명사는 관사가 필요하다(`a Day`). 관사를 생략한 명사형(`Life is Detour`)은 영어권 독자에게 어색해 감점한다
  - **[R8 신설] 빈칸이 `Good` 과 가까우면 안 된다** — `Great` `Better` `Fine` 류. 아래 패턴 리스크 1번 참조
  - **[유지] 향토·전통·식품 연상 금지** — `Todam`·`Jabak`·`Gomgom` 이 이 축에서 죽었다
  - **[유지] 한 문장 테스트** — 다만 이 패턴에서는 **이름 자체가 이미 한 문장이다.** 아래 패턴 리스크 6번 참조
  - **[유지] 코어 모순 금지** — 특히 promise 는 R3 에서 날짜 수를 뺐다. 빈칸이 그것을 되돌리는지 본다
  - **[유지] 카테고리어·포털 조어 금지**
- criteria: 의미30 발음20 철자15 충돌25 확장10 — 가중치·정의 모두 R4 판 그대로
  - 의미(30)는 ① 첫 접촉 즉시 이해 ② 타 업종 연상 없음 ③ 코어 모순 없음. **①②가 ③보다 앞이다**
  - `total` = `의미×15 + 발음×10 + 철자×7.5 + 충돌×12.5 + 확장×5`
- **후보 표기 규약:** `## candidates` 와 `check:` 의 이름은 기계 파싱을 위해 `Life-is-Nearby` 처럼 하이픈으로 묶는다. **실제 표기는 언제나 `Life is Nearby` 다**

### 패턴 자체의 평가 — "이런건 어떠냐?" 에 대한 답

사용자가 의견도 물었으므로 정직하게 답한다. **결론부터: 이 패턴을 채택할 만하다. 다만 리스크 셋이 있다.**

**1. 원형 소유자가 방어적이다.** `Life is Good`(1994 창업, 1996 상표 등록)이 약 **200건**의 상표를
갖고 있고 대부분 의류 클래스다. ooShirts/TeeChip 를 상대로 수백만 달러를 청구하는 소송을 실제로 걸었다.
**다만 클래스가 다르면 공존한다** — Square Enix 의 `Life is Strange`(게임), LG 의 `Life's Good`(전자)이
그 증거이고, 조사 자료가 "different product categories, which helps them coexist" 라고 명시한다.
우리는 여행·소프트웨어 클래스라 공존 가능성이 높다.
**단, 티셔츠·모자 같은 의류 굿즈를 만들 계획이 있으면 클래스가 겹친다. 그때는 이 패턴을 다시 검토해야 한다.**

**2. 차용된 형식이다.** 처음 보는 사람이 "Life is Good 을 따라한 것" 으로 읽을 수 있다.
브랜드의 고유성이 **빈칸 한 낱말에만** 걸리고, 나머지 두 낱말은 남의 것과 같다.

**3. 로고·아이콘에 안 들어간다.** 세 낱말이라 파비콘·앱 아이콘에 넣을 수 없다.
심볼을 따로 만들어야 하고, 그 심볼이 브랜드 인지의 대부분을 지게 된다.

**4. 구어로 길다.** "라이프이즈니어바이" 는 한 호흡에 부르기 어렵다.
사람들이 자연히 빈칸 낱말로 줄여 부를 텐데, 그 낱말이 단독으로는 이미 점유돼 있다(위 표).

**5. 감성 방향과의 관계.** R7 에서 사용자가 요구한 "감성적으로 어떤 느낌" 은 이 패턴에서
**낱말이 아니라 문장이 담는다.** `Life is ___` 는 선언이라 정서가 낱말 하나보다 직접적이다.
이 점에서는 오히려 R7 방향의 상위 호환이다.

**6. 그리고 이것이 가장 큰 강점이다 — 이름이 곧 설명이다.**
이 회의에서 사용자가 거부한 네 이름의 사유는 전부 의미였고, 그 형태는 늘 **"왜 그 이름이 이 제품인가"** 였다
(`눈치는 왜???`). `Life is ___` 는 **이름 자체가 이미 완결된 문장**이라 그 질문이 구조적으로 생기지 않는다.
설명 문장을 따로 붙일 필요가 없다. 일곱 라운드를 무너뜨린 실패 모드를 형태가 제거한다.

### 이력 — R4 브리프 (의태어 축) 는 R7 에서 대체됐다

R4 판 브리프 본문은 R7 개정으로 효력을 잃어 삭제했다. **무엇을 왜 바꿨는지는 지우지 않고
아래 `### R4 개정 내역` 에 그대로 남긴다** — 그 절이 "의태어를 1순위 축으로 올린" 판단의 기록이고,
그 판단이 왜 기각됐는지는 위 `## brief` 의 R7 항목에 있다. 재소집 상한은 R4 에서 소진됐다.

### R4 개정 내역 — 무엇을 왜 바꿨나

사용자 원문은 이것이 전부다.

> "토탐은 된장 브랜드 같아. 눈치는 왜???...... 의성어 의태어도 괜찮으니까. 다시 추천해줘"

세 문장이 각각 다른 층위를 가리킨다. **두 개는 후보의 문제가 아니라 기준표의 문제였다.**

| # | 사용자가 말한 것 | 무엇의 결함인가 | 고친 곳 |
|---|---|---|---|
| 1 | "토탐은 된장 브랜드 같아" | **평가자(`curvez-marketer`)의 채점 오류.** 후보의 결함이 아니다 | constraints 신설 — 향토·전통·식품 연상 금지 |
| 2 | "눈치는 왜???" | **기준표 `의미` 항목의 정의 오류** | criteria 의 의미 항목 재정의 + 한 문장 테스트 신설 |
| 3 | "의성어 의태어도 괜찮으니까" | 탐색 범위가 좁았다 | 어원 범위 확장, 1순위 축으로 승격 |

**1번은 내 오류다.** R3 충돌 검증에서 토담집(대구·한남동·태안)·토담골(청담·애틀랜타)·`todamfood.com` 을
**내가 직접 찾아 놓고도** `check:` 줄에 "분야가 다르고 en 검색에서는 희소" 라고 적으며 충돌 항목에서만
1점 감점했다. 의미는 2점 만점을 줬다. 사용자는 같은 사실을 **의미로 읽었다.**

상표법상 지정상품이 다른 것과, 소비자가 이름을 듣고 어느 카테고리를 먼저 떠올리는가는 **다른 문제다.**
전자는 등록 가능성이고 후자는 브랜드가 실제로 무엇으로 읽히는가다. 나는 전자만 봤다.
**데이터는 이미 손에 있었고 해석이 틀렸다.**

**2번도 내 오류다.** 나는 `의미 30` 을 "브랜드 코어와 맞는가" 로 읽고 **문서 정합**으로 채점했다.
`Nunchi` 에 의미 2점을 준 근거는 `GOAL.md` §1 의 "부족한 건 정보가 아니라 맥락이다" 였다.
그건 사실이지만 **사용자가 이름만 보고 복원할 수 있는 연결이 아니다.** 사용자에게 의미는
문서 정합이 아니라 **첫 접촉의 즉시 이해**다. 그래서 의미 항목의 정의를 바꾸고, 후보 제출 형식에
"사용자에게 그대로 보여줄 한 문장" 을 넣었다 — 내부 문서를 인용할 수 없게 만드는 장치다.

**3번은 요청이자 신호로 읽었다.** 단순 허용 확장으로 처리하지 않았다. 사용자가 거부한 둘은
**설명이 필요한 추상 개념어**(`Nunchi`)와 **무겁고 향토적인 명사**(`Todam`)다.
의성어·의태어는 그 두 실패의 정확한 반대편에 있다 — 뜻을 몰라도 소리가 움직임을 전달하고, 가볍고,
설명이 필요 없다. 그래서 허용이 아니라 **1순위 탐색 축**으로 올렸다.

**바꾸지 않은 것:** 가중치(의미30 발음20 철자15 충돌25 확장10)는 그대로 뒀다.
R3 점수와 R6 점수를 비교할 수 없게 되면 무엇이 나아졌는지 판정할 수 없다.
바꾼 것은 의미 항목이 무엇을 재는가이지 얼마나 무겁게 재는가가 아니다.

### MARU 의 지위

코드에 이미 `MARU` 가 있다 — `src/presentation/components/BrandMark.tsx` 의 산봉우리 SVG 로고,
`src/presentation/i18n/*.json` 6개 파일의 `"brand": "MARU"`, 커밋 `d3f2031`.

**그럼에도 MARU 는 확정 브랜드가 아니라 후보 풀의 한 항목**(`by: user`)이고 같은 기준표로 평가했다.
기존 구현이 있다는 사실은 기준표 다섯 항목 어디에도 들어가지 않는다. 교체 비용은 이름의 좋고 나쁨과
다른 축이며, 그 축이 필요하면 사용자가 최종 선택에서 쓴다.

## candidates

걷힌 후보 전부다. 줄이거나 요약하지 않았다.
`Gyeol` 은 `curvez-nextjs` 와 `curvez-designer` 가 **독립적으로 같은 이름을 냈다.** 둘 다 남기고
점수는 하나로 매겼다 — 수렴 신호이지만 designer 가 같은 이름에 발음 결격을 명시했다.

- candidate: MARU | by: user | why: 산마루(꼭대기)이자 대청마루(사람이 모여 앉는 자리). 로고의 봉우리 심볼과 이름이 같은 것을 가리킨다 | score: 의미1 발음2 철자1 충돌0 확장1 | total: 47.5 | R4: 재점검 대상(기준A) — 대청마루가 전통 건축 어휘다. 다만 식품 업종 상호를 확인하지 않았고 사용자도 지목하지 않았다. 기존 충돌 0점(npm 사용중·앱스토어 정확 일치)은 그대로
- candidate: Damda | by: curvez-marketer | why: 한국어 "담다". essence 의 액자 은유와 직결되고 제품 안에 이미 있는 동사다 — `ko.json` 의 `frame.save` 가 "담기" 다 | score: 의미2 발음2 철자2 충돌0 확장2 | total: 75 | R4: **결격(기준A 향토·식품)** — R3 충돌 검증에서 damdafnb.co.kr(F&B), DAMDA Market(식품), DAMDA Beauty 를 실제로 확인했다. Todam 과 같은 사유이고 근거도 같은 실측이다. 사용자가 지목하지 않았으나 같은 기준에 걸린다
- candidate: Nunchi | by: curvez-marketer | why: 한국어 "눈치" — 맥락을 읽는 능력. `GOAL.md` §1 의 문제 정의 "부족한 건 정보가 아니라 맥락이다" 를 이름이 그대로 가리킨다. 영어권에 이미 알려진 낱말이라 뜻이 전달되고 철자가 고정된다 | score: 의미2 발음2 철자1 충돌1 확장2 | total: 80 | R4: **결격(기준B 한 문장 테스트)** — 사용자가 "눈치는 왜???" 로 직접 거부. 연결 근거가 GOAL.md §1 안에서만 성립했다. 부활 불가
- candidate: Nadeuri | by: curvez-marketer | why: 한국어 "나들이" — 당일 외출. 초안 promise 의 "하루 하나" 를 어원이 그대로 담았으나, **R3 의 promise 개정으로 그 근거가 무너졌다**(`positioning.md` 개정 이력 1). 제안자 자신의 후보이고 개정에 따라 의미를 낮췄다 | score: 의미1 발음1 철자0 충돌1 확장0 | total: 37.5 | R4: 재점검 대상(기준A) — 향토 연상이 있으나 **식품 업종 상호를 실제로 확인하지 않았다.** 근거 없이 결격으로 찍지 않는다
- candidate: Gyeol | by: curvez-nextjs | why: 한국어 "결"(결이 맞다 — 정취·성향의 결). 장소를 건수가 아니라 개인적 결로 보여준다는 축. 코드 식별자 관점 결격 없음 — grep 0건, `GYEOL_` 접두사 사용 가능 | score: 의미1 발음0 철자1 충돌0 확장2 | total: 32.5 | R4: 재점검 대상(기준B) — 추상 개념어다. R6 에서 한 문장 테스트를 다시 받아야 한다. 발음 0점은 그대로 유효
- candidate: Chaeum | by: curvez-nextjs | why: 한국어 "채움"(빈칸을 채우다). 초안 differentiator 의 "빈칸 메우기" 와 어휘가 정확히 겹쳤다. **그런데 R3 에서 그 문장이 틀렸음이 확인됐다** — `GOAL.md:294` 는 빈칸을 채우는 게 아니라 "정보 없음" 으로 표시한다. 이름이 v1 이 하지 않는 일을 가리킨다 | score: 의미0 발음1 철자1 충돌1 확장1 | total: 35 | R4: 재점검 대상(기준B) + 의미 0점 유지 — differentiator 개정 사유는 그대로다
- candidate: Yeoyu | by: curvez-nextjs | why: 한국어 "여유"(여백·편안함). 선택지가 좁혀지며 생기는 심리적 여유로 promise 의 결과를 가리킨다. 제안자 스스로 `yeoyu`/`yeoyou` 철자 갈림 리스크를 미리 밝혔다 | score: 의미2 발음0 철자0 충돌1 확장2 | total: 52.5 | R4: 재점검 대상(기준B) — 추상 개념어. 발음·철자 0점이 이미 하위권
- candidate: Dulle | by: curvez-designer | why: 둘레(길) — 하루를 한 바퀴 도는 순환 동선. 제안자가 결격을 명시했다: 로마자 `ll` 이 영어권에 `dull`(따분한)로 먼저 읽혀 부정 함의가 생기고, 로고에서 l-l 두 세로획이 붙어 좌우 무게가 오른쪽으로 쏠린다 | score: 의미1 발음1 철자1 충돌0 확장1 | total: 37.5 | R4: 유지 — 제안자가 밝힌 dull 부정 함의가 기준B(첫 접촉 이해)에서 오히려 악화된다
- candidate: Gyeol | by: curvez-designer | why: 결(무늬·흐름) — 흩어진 것에 결을 잡아 준다는 뜻으로 differentiator 와 잇는다. 제안자가 결격을 명시했다: `gy` 자음군과 `eo` 이중모음이 영어·독어·불어에 고정 발음 규칙이 없어 `gee-ol`/`jee-yol` 로 갈리고, 5글자 중 앞 두 글자만 시각적으로 뭉쳐 자수 균형이 깨진다 | score: 의미1 발음0 철자1 충돌0 확장2 | total: 32.5 | R4: 재점검 대상(기준B) — 추상 개념어다. R6 에서 한 문장 테스트를 다시 받아야 한다. 발음 0점은 그대로 유효
- candidate: Nooka | by: curvez-designer | why: 영어 nook(아늑한 구석)의 조어 — "한 화면에 6~9개만 편집해 건다" 는 좁게 편집된 개인 공간을 그대로 가리킨다. 시각 관점 결격 없음: 상승선 글자가 k 하나뿐이라 실루엣이 낮고 안정적이며 이중 o 가 대칭축을 만든다 | score: 의미2 발음2 철자2 충돌0 확장2 | total: 75 | R4: 유지 — 기준A·B 무관. 탈락 사유는 그대로 Nooka Inc. 의 살아 있는 등록 상표다
- candidate: Golla | by: curvez-requirements | why: 한국어 "골라"(고르다의 명령형). differentiator 의 편집 행위를 동사 하나로 압축한다 — 제품이 사용자 대신 하는 일이 곧 이름이다. v1 4기능 어느 것도 이름 밖으로 밀려나지 않고 v1 제외 항목을 암시하지도 않는다. 제안자가 핀란드 브랜드 Golla 충돌 가능성을 미리 밝혔다 | score: 의미2 발음2 철자1 충돌0 확장2 | total: 67.5 | R4: 유지 — 기준A·B 무관. 탈락 사유는 그대로 활성 상용 브랜드 golla.com
- candidate: Framea | by: curvez-requirements | why: 라틴어 어원 조어. essence 의 "벽에 건 액자" 이고 `GOAL.md` §0.5 장치 1(액자/Frame)이 이 제품의 판정 기준 그 자체다. 제안자가 두 가지를 disclose 했다 — 라틴어 원뜻이 게르만족 투창이고 `fr` `de` 에 역사 용어로 남아 있으며, `frame` 이 UI 일반어라 상표 식별력이 낮다 | score: 의미1 발음1 철자1 충돌1 확장2 | total: 55 | R4: 유지 — 기준A 무관. 기준B 는 통과에 가깝다(액자→시각적 범주가 선다). 탈락 사유는 상표 식별력이었다
- candidate: Todam | by: curvez-requirements | why: 한국어 "토담"(흙으로 쌓은 담). essence 의 "벽에 건 액자" 에서 벽 쪽을 잡는다 — `GOAL.md` §0.5 의 판정 기준 "이 화면이 누군가의 벽처럼 보이는가" 와 같은 말이다. 로마자가 a/o 모음뿐이라 1순위 타깃인 영어권 독자가 첫눈에 읽는다. 제안자가 국내 요식업 상호 충돌과 Damda 와의 음절 공유를 미리 밝혔다 | score: 의미2 발음2 철자1 충돌1 확장2 | total: 80 | R4: **결격(기준A 향토·식품)** — 사용자가 "된장 브랜드 같아" 로 직접 거부. R3 실측(토담집·토담골·todamfood.com)이 그 직관을 뒷받침한다. 부활 불가
- candidate: Doran | by: curvez-requirements | why: 한국어 "도란도란"(조용하고 사적인 말소리)의 앞 두 음절. tone 의 금지 항목 "기관 공지체" 의 정확히 반대편에 있는 낱말이다. 제안자가 충돌을 크게 보고 우선순위를 스스로 낮췄다 — LoL 아이템 `Doran's Blade` 가 en 검색을 지배하고 Doran 은 아일랜드계 흔한 성씨다 | score: 의미2 발음2 철자0 충돌0 확장2 | total: 60 | R4: **방향 유효** — 의성어·의태어(도란도란)라 R4 의 1순위 축에 정확히 맞는다. 의미·발음·확장이 모두 2점이었고 죽은 이유는 철자·충돌뿐이다. 재소집의 출발점으로 삼는다

- candidate: Jabak | by: curvez-designer | why: 오늘 하루치 동선을 자박자박 걸어서 다 채운다. 시각 결격 없음 — 모음 a-a 가 대칭을 잡고 상승·하강선이 b·k 둘뿐이라 로고 실루엣의 리듬이 고르다 | score: 의미2 발음2 철자2 충돌2 확장1 | total: 95 | R6: **3명 전원이 독립 제안.** 평가는 한 번만 했다
- candidate: Jabak | by: curvez-nextjs | why: "오늘 하루, 발끝이 이끄는 대로 한 곳 한 곳 걸어서 이어 붙인 길." 식별자 결격 없음 — grep 0건, `JABAK_` 접두사 가능, 된소리 겹자음 없어 j·b·k 를 영어권 독자가 그대로 읽는다 | score: 의미2 발음2 철자2 충돌2 확장1 | total: 95 | R6: 위와 동일 이름
- candidate: Jabak | by: curvez-requirements | why: "Jabak — from the Korean sound of soft footsteps; it lays out today's places in the order you'll walk them." v1 4기능 어느 것도 밀려나지 않고 날짜 수를 함의하지 않아 개정 promise 와 맞는다. **제안자가 '자박하게'의 조리 용법을 스스로 disclose 했다** | score: 의미2 발음2 철자2 충돌2 확장1 | total: 95 | R6: 위와 동일 이름. disclose 가 정확했고 R6 에서 실검색으로 검증했다
- candidate: Chagok | by: curvez-requirements | why: "Chagok(차곡) — 차곡차곡 쌓는다는 뜻으로, 흩어진 갈 곳들을 하나씩 쌓아 오늘 걸을 길 한 줄로 만들어 준다." 쌓기가 코스 담기·일자별 편집 기능과 그대로 겹치고, 하루치를 쌓든 사흘치를 쌓든 참이라 개정 promise 와 같은 단위를 쓴다 | score: 의미2 발음2 철자2 충돌1 확장2 | total: 87.5 | R6: **final:B.** 식품 연상 0건
- candidate: Georeum | by: curvez-nextjs | why: "오늘 갈 곳을 정하고 나면, 그 걸음이 다음 장소까지 자연스럽게 이어진다." 의태어가 아닌 평범한 명사로 어원 축을 갈라 두려고 함께 냈다 | score: 의미2 발음0 철자1 충돌2 확장2 | total: 72.5 | R6: 충돌은 최상급인데 `eo`·`eu` 이중모음 둘이 겹쳐 Gyeol·Yeoyu 와 같은 발음 실패
- candidate: Sogon | by: curvez-designer | why: 여행지의 소문을 소곤소곤 귀띔받아 오늘 갈 곳을 정한다. 시각 결격 없음 — o 가 두 번 반복돼 대칭축을 만들고 g 하강선 하나만 있어 실루엣이 낮고 안정적이다 | score: 의미1 발음2 철자2 충돌0 확장2 | total: 60 | R6: 무신사 등록 의류 브랜드 SOGONSOGON 실재 + `.app` 선점
- candidate: Sabujak | by: curvez-nextjs | why: "정하지 않고 나섰다가, 한 곳씩 들르다 보면 어느새 하루의 동선이 되어 있다." 식별자 결격 없음. 3음절이라 Nadeuri 와 같은 상한 리스크를 제안자가 미리 밝혔다 | score: 의미1 발음1 철자2 충돌0 확장2 | total: 50 | R6: 활성 창작 브랜드 다수 점유
- candidate: Sabujak | by: curvez-requirements | why: "Sabujak(사부작) — 서두르지 않고 사부작사부작 움직인다는 뜻으로, 무리하지 않고 딱 걸을 수 있는 만큼만 오늘의 길을 짜 준다." 속도·태도라 4기능 전부에 걸린다. 제안자가 7자 3음절 부담과 낯선 낱말이라는 결격을 밝혔다 | score: 의미1 발음1 철자2 충돌0 확장2 | total: 50 | R6: 위와 동일 이름
- candidate: Dureon | by: curvez-designer | why: 낯선 동네를 두런두런 걸어 다니며 하루의 동선을 잡는다. 제안자가 결격을 명시했다 — `eo` 이중모음이 두-레-온으로 갈리고 로고 상승선이 d 하나뿐이라 좌우 무게가 왼쪽으로 쏠린다 | score: 의미2 발음0 철자1 충돌0 확장2 | total: 47.5 | R6: DUREÒN® 등 활성 브랜드 다수
- candidate: Gomgom | by: curvez-nextjs | why: "왜 이 장소를 골랐는지, 그 이유까지 곰곰이 챙겨서 함께 건넨다." differentiator 의 '고른 이유를 붙인다' 와 직결. 제안자가 『원피스』 Gomu Gomu 근접을 미리 밝혔다 | score: 의미0 발음2 철자0 충돌0 확장2 | total: 30 | R6: **결격(기준A 식품).** 실검색 결과 곰곰은 쿠팡 PB 신선식품 브랜드다 — 제안자가 짚은 원피스보다 훨씬 큰 충돌
- candidate: Yonder | by: curvez-requirements | why: "'저 너머' 라는 뜻의 영어 낱말로, 지금 서 있는 곳에서 저기까지 오늘 갈 곳과 그 길을 하나로 정해 준다." 어원 축을 갈라 두려고 넣은 후보이지 단독 1순위로 밀지 않는다고 제안자가 밝혔다. 영국 신용카드 Yonder·파우치 브랜드 Yondr 충돌도 스스로 disclose | score: 의미0 발음2 철자0 충돌0 확장2 | total: 30 | R6: yonder.com 이 활성 여행 브랜드다 — 동종 업종 직격

- candidate: Mirinae | by: curvez-marketer | why: "Mirinae(미리내) — 은하수를 뜻하는 옛말. 흩어진 별이 길게 이어져 하나의 내가 되듯, 오늘 갈 곳들을 걸어갈 길 하나로 이어 준다." 어원이 미르(용)+내(시내), 곧 **"용처럼 길게 이어진 내"** 라 동선 은유가 이름 안에 내장돼 있다. 국어문화원연합회가 "가장 아름다운 순우리말" 로 소개하는 낱말이다 | score: 의미2 발음2 철자1 충돌1 확장2 | total: 80 | R7: **final:A**
- candidate: Mangata | by: curvez-marketer | why: "Mangata(mångata) — 달빛이 물 위에 놓는 길을 뜻하는 스웨덴 말. 흩어진 장소들 사이에 오늘 걸을 길 하나를 놓는다." 영어 대응어가 moon glade 이고 원뜻 설명에 **lit lane(빛이 난 길)** 이 들어간다 — 감성 어휘인데 길 은유를 이미 갖고 있다 | score: 의미2 발음2 철자2 충돌0 확장2 | total: 75 | R7: **final:B.** npm `mangata` 가 사용중이라 브리프의 식별자 제약을 위반해 충돌 0
- candidate: Dasom | by: curvez-marketer | why: "Dasom(다솜) — 사랑을 뜻하는 옛말." **가용성은 31개 중 최상이다**(`.app` 미등록·npm 미사용·앱스토어 0건). 그러나 한 문장을 놓아도 여행·장소·동선이 서지 않는다 — 사랑이 왜 여행 앱인지 사용자가 되물을 자리가 Nunchi 와 같다 | score: 의미1 발음2 철자2 충돌2 확장2 | total: 85 | R7: **점수 1위이나 최종에서 뺐다. 사유는 아래 `### 왜 85점을 제치고 80점을 A 로 올렸는가`**
- candidate: Ongi | by: curvez-marketer | why: "Ongi(온기) — 낯선 도시에서 보낸 하루가 남기는 따뜻함." 감정 그 자체를 가리켜 R7 축에 맞고 발음이 4자 2음절로 가장 쉽다. 다만 낱말만으로는 여행이 서지 않아 한 문장이 전부를 짊어진다 | score: 의미1 발음2 철자2 충돌1 확장2 | total: 72.5 | R7: 의미에서 Dasom 과 같은 약점
- candidate: Resfeber | by: curvez-marketer | why: "Resfeber — 떠나기 직전 여행자의 심장이 뛰는 느낌을 가리키는 스웨덴 말. 설렘과 불안이 뒤섞인 그 상태." **뜻으로는 이번 조사 전체의 1위다** — 사용자가 앱을 여는 순간의 감정과 정확히 같다 | score: 의미2 발음1 철자1 충돌0 확장1 | total: 52.5 | R7: **뜻이 완벽해서 죽었다.** Calgary·UK·India·Sweden 여행사가 이미 쓴다
- candidate: Fernweh | by: curvez-marketer | why: "Fernweh — 가 본 적 없는 곳을 그리워하는 마음을 뜻하는 독일 말." wanderlust 보다 깊은 층위의 그리움이다 | score: 의미2 발음1 철자0 충돌0 확장1 | total: 45 | R7: fernweh.com 이 Fernweh Group 으로 활성. 앱스토어 정확 일치 6건. `de` 가 지원 로케일이라 그쪽에선 일반 명사로 묻힌다
- candidate: Sonder | by: curvez-marketer | why: "Sonder — 스쳐 지나가는 모든 사람이 각자의 삶을 산다는 깨달음." 여행자의 시선을 정확히 가리킨다 | score: 의미1 발음2 철자0 충돌0 확장2 | total: 45 | R7: **Sonder 가 숙박 대기업이다** — "A Better Way To Stay". 동종 업종 직격이고 앱스토어 정확 일치 15건
- candidate: Meraki | by: curvez-marketer | why: "Meraki — 영혼과 사랑을 담아 무언가를 한다는 그리스 말." 편집하는 태도와 이어진다 | score: 의미1 발음2 철자0 충돌0 확장2 | total: 45 | R7: Cisco Meraki 가 지배한다. 앱스토어 정확 일치 14건
- candidate: Saudade | by: curvez-marketer | why: "Saudade — 없는 것을 향한 달콤씁쓸한 그리움을 뜻하는 포르투갈 말." | score: 의미1 발음1 철자0 충돌0 확장2 | total: 35 | R7: 너무 유명해 검색이 포르투갈 문화로 채워진다. 앱스토어 정확 일치 4건
- candidate: Kilig | by: curvez-marketer | why: "Kilig — 설렘으로 배 속이 간질거리는 느낌을 뜻하는 타갈로그 말." | score: 의미1 발음2 철자1 충돌0 확장2 | total: 52.5 | R7: `.app`·npm 모두 선점, 앱스토어 정확 일치 1건. 여행보다 연애 감정 쪽으로 읽힌다


- candidate: Life-is-Nearby | by: curvez-marketer | why: 표기는 `Life is Nearby`. "멀리 갈 것 없이, 오늘 걸어서 닿을 수 있는 곳들로 하루를 만든다." **promise 의 '그대로 걸을 수 있는 동선' 과 같은 말이고**, v1 기능 2(지도 기반 주변 탐색)가 문자 그대로 nearby 다. 여행사 광고체("세상 끝까지")의 정확한 반대편이라 tone 의 금지 항목과도 맞선다. `Life is ___` 뒤에서 문법이 완벽하다 | score: 의미2 발음2 철자2 충돌2 확장2 | total: 100 | R8: **final:A**
- candidate: Life-is-a-Day | by: curvez-marketer | why: 표기는 `Life is a Day`. "삶은 결국 하루들이다. 그 하루 하나를 걸을 수 있는 길로 놓아 준다." 제품이 이미 이 언어를 쓴다 — `ko.json` 의 `explore.subtitle` 이 "기분 좋은 하루를 만들어보세요" 이고 제목이 "오늘 만난 한국, 오래도록 마음에 남기를" 이다. 관사가 있어 문법이 완벽하다 | score: 의미2 발음2 철자2 충돌2 확장1 | total: 95 | R8: **final:B.** 코어 긴장 1건을 아래 별도 절에 적었다
- candidate: Life-is-Detour | by: curvez-marketer | why: 표기는 `Life is Detour`. 샛길·우회 — 여행의 예정 밖 발견이고 differentiator 의 편집 방침과 결이 같다 | score: 의미1 발음2 철자2 충돌2 확장2 | total: 85 | R8: 구문 가용성은 완전한데 **관사 없는 명사형이라 영어권 독자에게 어색하고**(`Life is a Detour` 가 정상), 단독어 `Detour` 가 도보 투어 앱으로 같은 업종에 점유돼 있어 구어 축약이 막힌다
- candidate: Life-is-Somewhere | by: curvez-marketer | why: 표기는 `Life is Somewhere`. "삶은 어딘가에 있다" | score: 의미1 발음2 철자2 충돌2 확장2 | total: 85 | R8: 가용성은 완전하나 "어딘가" 가 모호해 한 문장이 제품 설명을 전부 짊어진다. 그리고 **지금 여기를 부정하는 정서**라 한국에 와 있는 여행자를 위한 앱과 어긋난다
- candidate: Life-is-Anywhere | by: curvez-marketer | why: 표기는 `Life is Anywhere`. "삶은 어디에나 있다" — Somewhere 와 달리 긍정형이다 | score: 의미1 발음2 철자2 충돌2 확장2 | total: 85 | R8: 가용성 완전. 다만 "어디에나" 는 **한 지역을 편집해 보여주는 제품과 방향이 반대**다
- candidate: Life-is-Onward | by: curvez-marketer | why: 표기는 `Life is Onward`. "삶은 앞으로 나아간다" | score: 의미1 발음2 철자2 충돌2 확장2 | total: 85 | R8: 가용성 완전하나 여행보다 자기계발 쪽으로 읽히고 문법도 약간 어색하다
- candidate: Life-is-Slow | by: curvez-marketer | why: 표기는 `Life is Slow`. slow travel 정서를 그대로 가리키고 tone 의 '차분하다' 와 직결한다 | score: 의미2 발음2 철자2 충돌0 확장2 | total: 75 | R8: **의미는 A·B 급인데 앱스토어에 정확 일치 앱 `Life is Slow` 가 이미 있다**
- candidate: Life-is-Unhurried | by: curvez-marketer | why: 표기는 `Life is Unhurried`. "서두르지 않아도 되는 하루" — tone 과 differentiator(무리하지 않는 분량) 양쪽에 닿는다 | score: 의미2 발음1 철자1 충돌1 확장2 | total: 70 | R8: 구문 도메인은 전부 비었으나 **`lifeunhurried.com` 이 에코 여행·슬로우 스테이 업체로 실재한다** — 한 낱말 차이로 동종 인접이라 Resfeber·Yonder 와 같은 실패다. 게다가 비영어권 여행자에게 어휘 난도가 높다
- candidate: Life-is-Unplanned | by: curvez-marketer | why: 표기는 `Life is Unplanned`. "계획하지 않아도 하루가 된다" | score: 의미0 발음2 철자2 충돌2 확장2 | total: 70 | R8: **promise 와 정면으로 어긋난다.** 우리 약속은 "갈 곳을 못 정한 채로 들어와서 **동선 하나를 갖고 나간다**" 인데, 이 이름은 사용자가 들어올 때의 상태를 가리킬 뿐 나갈 때의 상태를 가리키지 않는다
- candidate: Life-is-Wandering | by: curvez-marketer | why: 표기는 `Life is Wandering`. 정처 없이 걷는 여행의 정서 | score: 의미0 발음2 철자1 충돌2 확장2 | total: 62.5 | R8: Unplanned 와 같은 사유. 이름이 문제 상태를 가리키고 해결을 가리키지 않는다
- candidate: Life-is-Walkable | by: curvez-marketer | why: 표기는 `Life is Walkable`. 걸을 수 있다는 뜻이 promise 와 직결한다 | score: 의미1 발음1 철자1 충돌2 확장1 | total: 62.5 | R8: 뜻은 정확한데 "삶은 걸을 수 있다" 가 영어로 어색하다
- candidate: Life-is-Meander | by: curvez-marketer | why: 표기는 `Life is Meander`. 굽이굽이 거니는 여정 | score: 의미1 발음1 철자1 충돌1 확장2 | total: 55 | R8: 관사 없는 명사형이 어색하고 단독어 `Meander` 는 앱스토어 7건(여행 앱 포함)이다
- candidate: Life-is-Elsewhere | by: curvez-marketer | why: 표기는 `Life is Elsewhere`. 여행자의 마음 그 자체 | score: 의미1 발음2 철자1 충돌0 확장2 | total: 52.5 | R8: **밀란 쿤데라의 1969년 소설 제목**이라 검색이 문학으로 채워지고, `lifeiselsewhere.com` 도 2010년부터 선점돼 있다


### 충돌 검증 — 실제로 돌린 것만 적는다

도메인은 권위 RDAP 서버(Verisign `.com` / Google `.app`), 앱스토어는 Apple iTunes Search API,
npm 은 registry.npmjs.org 에 직접 질의했다. **세 엔드포인트 모두 무의미한 대조군 이름에 404 를
돌려주는 것을 먼저 확인해** 판별이 실제로 동작함을 검증한 뒤 결과를 채택했다.

**SNS 는 전 후보 "확인 불가" 다.** instagram.com 핸들 조회가 존재하지 않는 대조군 핸들에도 HTTP 200 을
돌려준다(로그인월). 판별하지 못하는 도구의 출력을 점수로 쓰지 않았다.

**상표는 부분 확인이다.** Justia 검색 페이지가 403, USPTO 검색 API 가 405 를 돌려줘 2회 재시도 후
포기했다. 아래 `trademark=` 값은 전수 조사가 아니라 웹 검색으로 확인된 건에 한한다.

check: MARU domain=.com 등록(1999-09-17, 웹 응답 없음) .app 등록 / appstore=정확 일치 있음 "MARU: Learn Japanese Hiragana" / trademark=확인 불가(여행 분야 마크 미발견, MARU-HI·MARUKAI 는 무관·취소) / npm=`maru` 사용중 → 브리프의 npm 제약 위반 / sns=확인 불가
check: Damda domain=.com 등록(2005-11-25) .app 등록 / appstore=정확 일치 다수 "Damda", "Damda Managers", "Damda - 설문앱" / trademark=확인 불가. 다만 damda.com·kr.damda.com·company.damda.com·thedamda.co.uk·damdaexpress.com 등 활성 상용 사업체 다수 확인 / npm=`damda` 사용중 / sns=확인 불가
check: Nunchi domain=.com 등록(2002-03-24, 최소 페이지) .app 등록 / appstore=정확 일치 0건 / trademark=US #4251108 (e.Digital Corp, 모바일 앱 소프트웨어) **CANCELLED/DEAD** — 차단 없음. 전수 조사는 아니다 / npm=미사용 / sns=확인 불가
check: Nadeuri domain=**.com 미등록 — 전 후보 중 유일** .app 등록 / appstore=정확 일치 1건 "Nadeuri" / trademark=확인 불가 / npm=미사용 / sns=확인 불가
check: Gyeol domain=.com 등록(2010-09-02) .app 등록 / appstore=정확 일치 있음 "GYEOL - Movement into a Line" / trademark=확인 불가 / npm=미사용 / sns=확인 불가
check: Chaeum domain=.com 등록(2022-08-13) / appstore=정확 일치 0건 / trademark=확인 불가 / npm=미사용 / sns=확인 불가
check: Yeoyu domain=.com 등록(2001-12-22) / appstore=정확 일치 0건 / trademark=확인 불가 / npm=미사용 / sns=확인 불가
check: Dulle domain=.com 등록(2007-11-21) / appstore=정확 일치 "Dulle: Family Locator" 외 / trademark=확인 불가 / npm=미사용 / sns=확인 불가
check: Nooka domain=.com 등록(2003-08-05) **활성 사이트 "NOOKA"** .app 등록 / appstore=정확 일치 4건 "Nooka: Your Insight Feed", "Nooka: Scrapbook & Collage", "Nooka Space", "Nooka:Chat" / trademark=**살아 있는 등록 상표** — Nooka Inc.(뉴욕, 시계·액세서리·향수 라이프스타일 브랜드) / npm=미사용 / sns=확인 불가
check: Golla domain=.com 등록(2000-03-01) **활성 상용 사이트 "Golla Official Store | Carrying tech since 1995"** .app 등록 / appstore=정확 일치 0건 / trademark=확인 불가. 다만 1995년부터 영업 중인 테크 액세서리 브랜드 실재 확인 / npm=미사용 / sns=확인 불가
check: Framea domain=.com 등록(2012-08-17) **HugeDomains 매물 — 구매 가능** .app 등록 / appstore=정확 일치 0건(근접 "Frameo") / trademark=확인 불가 / npm=미사용 / sns=확인 불가
check: Todam domain=.com 등록(2002-04-04, 114바이트 빈 응답) .app 등록 / appstore=정확 일치 0건 / trademark=확인 불가. 국내 요식업 상호 다수 실재(토담집 대구·한남동·태안, 토담골 청담·애틀랜타, 식품제조 TODAM Co. Ltd / todamfood.com) — 분야가 다르고 en 검색에서는 희소 / npm=미사용 / sns=확인 불가
check: Doran domain=.com 등록(1996-06-03) .app 등록 / appstore=정확 일치 "Doran TPMS", "Doran Gadget" / trademark=확인 불가 / npm=`doran` 사용중 / sns=확인 불가

check: Jabak domain=.com 등록(2009-12-01)이나 **웹 응답 없음(연결 실패)**. **`.app` 미등록 — 취득 가능** / appstore=정확 일치 0건 / trademark=확인 불가. en 검색 지형은 사실상 비어 있다 — 희귀 아랍계 성씨(1/1100만, 세계 501,935위)뿐이고 기업 브랜드 0건 / npm=미사용 / sns=확인 불가 / **식품 연상 재검: 국어사전 2차 의미가 "건더기가 겨우 잠길 정도로 물이 찬 모양"이고 예문이 된장찌개다. 다만 상호로 점유된 사례는 검색되지 않았다 — Todam(토담집·토담골·todamfood.com 실재)과 층위가 다르다**
check: Chagok domain=.com 등록(2024-06-20, 웹 응답 없음) **`.app` 등록됨** / appstore=정확 일치 2건 "Chagok: Shared Expense Tracker", "Chagok: Learn Any Language" / trademark=확인 불가 / npm=미사용 / sns=확인 불가 / 식품 연상 재검: 0건
check: Georeum domain=.com 등록(2025-03-01, 웹 응답 없음) **`.app` 미등록** / appstore=정확 일치 0건 / trademark=확인 불가. 브랜드 0건, 김종국 곡 제목 "Jejari Georeum" 뿐 / npm=미사용 / sns=확인 불가
check: Sogon domain=.com 등록(2009-11-03, 웹 응답 없음) `.app` 등록됨 / appstore=정확 일치 0건 / trademark=확인 불가. **무신사 등록 의류 브랜드 SOGONSOGON 실재** / npm=미사용 / sns=확인 불가
check: Sabujak domain=.com 등록(2025-10-10, 114바이트 빈 응답) `.app` 미등록 / appstore=정확 일치 0건 / trademark=확인 불가. **활성 사용자 다수 — sabujak.art(양평 사부작이음스튜디오 예술가 레지던시), Etsy 샵 Sabujak, 인스타 @sabujak_studio·@sabujak_factory_official, 유튜브 @SABUJAK_0, Webudding "Sabujak Sisters"** / npm=미사용 / sns=확인 불가
check: Dureon domain=.com 등록(2015-07-28, Cloudflare 403) `.app` 미등록 / appstore=정확 일치 0건 / trademark=확인 불가. **DUREÒN®(® 표기 사용), dureoncapital.com(범아프리카 투자운용), dureon.net, 미국 공구 브랜드, dureon.com 은 BrandBucket 매물** / npm=미사용 / sns=확인 불가
check: Gomgom domain=.com 등록(2006-04-22, 웹 응답 없음) `.app` 미등록 / appstore=정확 일치 1건 "Gomgom - Purchase Decision" / trademark=확인 불가. **쿠팡 PB 신선식품 브랜드 '곰곰' 실재 — GomGom 프로틴바 공급사 매출이 2억→30억으로 증가한 규모다** / npm=미사용 / sns=확인 불가
check: Yonder domain=.com 등록(1995-10-05) **활성 사이트 "Yonder Rewards Cards | Dining, Travel & Curated Experiences" — 동종 업종** `.app` 등록됨 / appstore=정확 일치 9건 / trademark=확인 불가 / npm=`yonder` 사용중 / sns=확인 불가
check: Nadeuri [R6 식품 재검 완료] **결격 확정** — 나들이김밥(군산·광주 두암동 실제 식당), 나들이도시락(이마트몰 상품군). 기준A 에 걸린다. R3 도메인 결과(.com 미등록)는 그대로 유효하나 의미에서 죽었다
check: MARU [R6 식품 재검 완료] **결격 확정** — 마루식당, 마루코리안바베큐&그릴, 마루 레스토랑 앤 바, 정마루푸드(도시락 제조), 마루에이티(신선식품 도매). 요식·식품 상호로 폭넓게 점유돼 있어 기준A 에 걸린다. 기존 충돌 0점(npm 사용중·앱스토어 정확 일치)과 겹쳐 이중 결격이다


check: Mirinae domain=.com 등록(1999-01-31, **114바이트 빈 응답 — 실사용 사이트 없음**) / `.app` 등록됨 / appstore=정확 일치 1건 "Mirinae - Learn Korean with AI" — **한국어 학습 앱이라 타깃(한국에 관심 있는 외국인)이 겹친다** / trademark=확인 불가. 상호는 미리내로·미리생활·미리내글로벌·미리내컴·농업회사법인 미리내산림 / npm=**미사용** / sns=확인 불가 / **지명 재검: 미리내성지(경기 안성, 천주교 성지)가 visitkorea 등재 여행지다 — 우리 앱의 데이터 출처(TourAPI=한국관광공사)에 항목으로 들어 있을 가능성이 높다.** 다만 낱말의 1차 의미는 은하수이고 성지는 "불빛이 은하수처럼 보였다" 는 데서 붙은 파생 명명이다 / 식품 연상: 미리내산림(농산물) 1건 외 없음
check: Mangata domain=.com 등록(2008-08-01, 실사용 사이트 없음) / `.app` 등록됨 / appstore=정확 일치 1건 "Mangata" / trademark=**부분 확인** — MANGATA(Mangata Networks, 통신, 2021 출원)는 **2024-07-29 포기(abandoned)**. MANGATALITES(Mangata LLC, 장갑), MANGATA CASA, MANGATA(Mangata Lifestyle LLC) 는 의류·라이프스타일이고 여행업 아님 / npm=**`mangata` 사용중 — 브리프의 npm 제약 위반** / sns=확인 불가 / 식품 연상: 없음
check: Dasom domain=.com 등록(1998-11-07, 실사용 사이트 없음) / **`.app` 미등록 — 취득 가능** / appstore=정확 일치 0건 / trademark=확인 불가 / npm=미사용 / sns=확인 불가 / 식품 연상: 없음
check: Ongi domain=.com 등록(2002-04-27, 실사용 사이트 없음) / `.app` 등록됨 / appstore=정확 일치 0건 / trademark=확인 불가 / npm=미사용 / sns=확인 불가
check: Resfeber domain=.com 등록(1997-12-15, 실사용 사이트 없음) / `.app` 미등록 / appstore=정확 일치 0건 / trademark=확인 불가 / npm=미사용 / sns=확인 불가 / **업종 충돌 확정: Resfeber Travels(캘거리, 여행 기획사 — 고객용 여행 앱까지 제공), Resfeber Travel Ltd(영국, 2024 해산), Resfeberr(인도, 2017~), Resfeber(스웨덴 여행 예약사), Devpost 의 Resfeber 앱**
check: Fernweh domain=.com 등록(1996-11-07) **활성 사이트 "Home | Fernweh Group"** / `.app` 등록됨 / appstore=정확 일치 6건 / trademark=확인 불가 / npm=미사용 / sns=확인 불가
check: Sonder domain=.com 등록(1999-02-15, 403) / `.app` 등록됨 / appstore=**정확 일치 15건** — 선두가 "Sonder - A Better Way To Stay"(숙박업) / trademark=확인 불가 / npm=사용중 / sns=확인 불가
check: Meraki domain=.com 등록(2003-01-06, 403 Access Denied) / `.app` 등록됨 / appstore=**정확 일치 14건** — "Meraki", "Meraki Systems Manager", "Meraki Go"(Cisco) / trademark=확인 불가 / npm=사용중 / sns=확인 불가
check: Saudade domain=.com 등록(1996-10-02) / `.app` 등록됨 / appstore=정확 일치 4건 / trademark=확인 불가 / npm=미사용 / sns=확인 불가
check: Kilig domain=.com 등록(2002-11-14, 실사용 사이트 없음) / `.app` 등록됨 / appstore=정확 일치 1건 "Kilig" / trademark=확인 불가 / npm=사용중 / sns=확인 불가
check: Sillage/Serein/Eunoia/Alba/Nuri [R7 조사 중 탈락] appstore 정확 일치 각 8·5·6·9·10건, npm 대부분 사용중 — 감성 어휘 중 점유가 가장 심한 군이라 후보로 올리지 않았다
check: Lontano/Altrove/Vagary/Querencia/Mireu [R7 조사 중 탈락] 가용성은 나쁘지 않으나(앱스토어 정확 일치 0~1건) 한 문장 테스트에서 여행·장소·동선이 서지 않아 올리지 않았다. Mireu(미르=용)는 `.app`·npm 모두 비어 있었으나 미르재단 연상이 있어 뺐다


check: Life-is-Nearby domain=**`lifeisnearby.com` 미등록 — 취득 가능.** 하이픈형 `life-is-nearby.com` 도 미등록. `.app` 미등록 / appstore=구문 정확 일치 0건 / npm=`lifeisnearby` 미사용 / trademark=확인 불가. 웹 검색에서 이 구문을 쓰는 기존 브랜드가 발견되지 않았다 / sns=확인 불가 / **참고: 단독어 `Nearby` 는 앱스토어 5건(`Nearby App`, `Nearby - Chat, Meet, Friend` 등)으로 점유돼 있다 — 그래서 축약형을 브랜드로 쓰지 않는다**
check: Life-is-a-Day domain=**`lifeisaday.com` 미등록 — 취득 가능.** `.app` 미등록(429 재시도 후 404 확인) / appstore=구문 정확 일치 0건 / npm=`lifeisaday` 미사용 / trademark=확인 불가 / sns=확인 불가
check: Life-is-Detour domain=`lifeisdetour.com` 미등록 / `.app` 미등록 / appstore=구문 0건 / npm=미사용 / trademark=확인 불가 / **단독어 충돌 큼: Bose 가 인수한 도보 투어 앱 `Detour`(Andrew Mason), 앱스토어 정확 일치 9건, `detour.com`·`.app`·npm 전부 선점**
check: Life-is-Somewhere domain=`lifeissomewhere.com` 미등록 / `.app` 미등록 / appstore=구문 0건 / npm=미사용 / trademark=확인 불가
check: Life-is-Anywhere domain=`lifeisanywhere.com` 미등록 / `.app` 미등록 / appstore=구문 0건 / npm=미사용 / trademark=확인 불가
check: Life-is-Onward domain=`lifeisonward.com` 미등록 / `.app` 미등록 / appstore=구문 0건 / npm=미사용 / trademark=확인 불가
check: Life-is-Slow domain=`lifeisslow.com` 미등록 / `.app` 미등록 / npm=미사용 / **appstore=정확 일치 1건 `Life is Slow` — 구문형에서 앱이 이미 존재하는 유일한 사례** / trademark=확인 불가
check: Life-is-Unhurried domain=`lifeisunhurried.com` 미등록 / `.app` 미등록 / appstore=구문 0건 / npm=미사용 / **근접 브랜드 실재: `lifeunhurried.com` — "Slow Stays, and eco travel" 을 내건 웰니스·에코 여행 업체. 한 낱말 차이의 동종 인접** / trademark=확인 불가
check: Life-is-Unplanned domain=`lifeisunplanned.com` 미등록 / `.app` 미등록 / appstore=구문 0건 / npm=미사용
check: Life-is-Wandering domain=`lifeiswandering.com` 미등록 / `.app` 미등록 / appstore=구문 0건 / npm=미사용
check: Life-is-Walkable domain=`lifeiswalkable.com` 미등록 / `.app` 미등록 / npm=미사용
check: Life-is-Meander domain=`lifeismeander.com` 미등록 / `.app` 미등록 / npm=미사용 / **단독어 `Meander` 앱스토어 7건(`Meander: Trip Feedback Rewards` 포함), `.com`·`.app`·npm 전부 선점**
check: Life-is-Elsewhere domain=**`lifeiselsewhere.com` 등록됨(2010-01-11)** / `.app` 미등록 / npm=미사용 / 밀란 쿤데라 소설 『Life Is Elsewhere』(1969)가 검색을 지배
check: [패턴 선행 점유] `Life is Good` — 1994 창업, 1996 상표 등록, 약 200건 보유(대부분 의류 클래스), ooShirts/TeeChip 상대 소송 실제 제기. `Life is Strange` — Square Enix, 게임 클래스. `Life's Good` — LG Corp/LG Electronics, 전자 클래스. **셋이 클래스를 달리해 공존 중이라는 것이 조사 자료의 명시적 판단이다**


## shortlist

chosen: Life is Nearby (2026-08-25)

> **확정.** 사용자가 R8 의 `final:A` 를 선택했다. 정식 표기는 `Life is Nearby` 다 —
> 문장형 대소문자이고 `is` 는 소문자다. **축약하지 않는다.**
> 표기 자리별 확정값은 `## brief` 의 `### 표기 형태` 표에 있고, 그 표가 이제 이력이 아니라 **정본**이다.
> 아래 `final:`·`rejected-final:` 줄은 결정에 이르는 이력이며 지우지 않는다.


rejected-final:A Todam — essence 의 명사가 그대로 이름이다. 그 벽 은유가 `GOAL.md` §0.5 의 판정 기준("이 화면이 누군가의 벽처럼 보이는가")이고, 상위권에서 유일하게 실사용 도메인·앱스토어 정확 일치·살아 있는 상표가 **모두** 비어 있다
rejected-final:B Nunchi — 같은 80점이지만 반대편 선택이다. Todam 은 영어권 독자에게 뜻이 비어 있어 우리가 의미를 채워 넣는 이름이고, Nunchi 는 이미 뜻이 통해 첫 접촉에서 제품을 설명해 주는 대신 그 유명세를 검색에서 되갚는 이름이다

- 탈락: Damda — 비충돌 4개 항목 만점(75점)인데 충돌에서 무너졌다. damda.com 계열 활성 사업체 다수, npm 사용중, 앱스토어 정확 일치 다수. `curvez-marketer` 자신의 후보다
- 탈락: Nooka — 역시 비충돌 만점(75점). Nooka Inc. 의 **살아 있는 등록 상표**가 라이프스타일 상품군에 걸려 있고 앱스토어 정확 일치가 4건이다. 좋은 이름이지만 쓸 수 없는 이름이다
- 탈락: Golla — 67.5점. 1995년부터 영업 중인 테크 액세서리 브랜드가 golla.com 을 활성 운영한다
- 탈락: Doran — 60점. 발음·의미는 상위권이나 `Doran's Blade` 가 en 검색을 지배하고 npm 도 사용중이라 철자·검색과 충돌이 동시에 0점이다
- 탈락: Framea — 55점. 충돌은 상위권에서 가장 깨끗하나(도메인 구매 가능) `frame` 이 UI 일반어라 상표 식별력이 낮고 `fr`·`de` 에 다른 뜻이 남아 있다

### 왜 이 둘인가 — tie-break 기록

`Todam` 과 `Nunchi` 가 80점 동점이고, `Damda`·`Nooka` 가 75점으로 뒤따랐다.

**① 충돌 회피 우선.** `Damda`·`Nooka` 는 비충돌 4항목이 만점이지만 충돌이 0점이다.
좋은 이름보다 **쓸 수 있는 이름이 먼저다.** 두 이름을 여기서 잘랐다.

**② essence 근접도로 A/B 순서를 갈랐다.** 동점인 둘 중 `Todam`(토담=벽)은 essence 문장의 명사
"벽에 건 액자" 를 직접 가리킨다. `Nunchi` 는 essence 가 아니라 `GOAL.md` §1 의 문제 정의에 붙는다.
그래서 `Todam` 이 A 다. **다만 이것은 근소한 차이이고 두 안의 실질 우열이 아니다** — 아래 표가
사용자가 실제로 고를 축이다.

| | final:A `Todam` | final:B `Nunchi` |
|---|---|---|
| 코어의 어디에 붙나 | essence — 벽 | 문제 정의 — 맥락 |
| 첫 접촉의 영어권 독자 | 읽을 수 있으나 뜻은 모른다. **빈 그릇** | 뜻이 통한다. 이름이 제품을 설명한다 |
| 그래서 좋은 점 | 우리가 의미를 정의한다. 기능이 늘어도 이름이 안 좁아진다 | 마케팅 설명 비용이 낮다. "눈치 있는 여행 앱" 이 한 문장으로 선다 |
| 그래서 나쁜 점 | 의미를 심는 비용을 우리가 낸다 | 2019년 Penguin 刊 *The Power of Nunchi* 가 15개 언어로 en 검색을 지배한다. **브랜드가 책에 묻힌다** |
| 확인된 충돌 | 국내 요식업 상호 다수(분야 다름). 도메인·앱스토어·상표 실사용 없음 | 앱스토어·npm 깨끗, 미국 상표 취소됨. 검색 지배가 유일한 약점 |
| 기존 로고와의 관계 | 벽/담 → 현재 산봉우리 SVG 를 **다시 그려야 한다** | 마찬가지로 다시 그려야 한다 |

**둘 다 `.com` 과 `.app` 이 이미 등록돼 있다.** 브리프의 도메인 1·2순위가 모두 막혔다는 뜻이고,
이것이 두 최종안 공통의 비용이다. 전 후보 13개 중 `.com` 이 비어 있는 것은 `Nadeuri` 하나뿐이었는데
그 이름은 나머지 네 항목에서 37.5점으로 하위권이었다. **도메인이 비어 있다는 이유만으로 하위 후보를
올리지 않았다** — 이름이 먼저이고 도메인은 그다음이다.

### R4 — 사용자가 A/B 를 모두 거부했다 (2026-08-25)

위 `rejected-final:A Todam` / `rejected-final:B Nunchi` 두 줄은 **거부됐다.** 이력으로 남겨 두고 지우지 않는다 —
지우면 같은 실패를 반복한다. R6 에서 새 최종안으로 교체한다.

> "토탐은 된장 브랜드 같아. 눈치는 왜???...... 의성어 의태어도 괜찮으니까. 다시 추천해줘"

**후보만 다시 뽑지 않았다.** 두 거부 사유가 후보가 아니라 기준표를 가리켰기 때문이다.
개정 내용과 그 근거는 `## brief` 의 `### R4 개정 내역` 에 있다. 요지는 셋이다.

1. 향토·전통·식품 연상을 결격 기준으로 신설했다 — `Todam` 뿐 아니라 `Damda` 도 같은 기준에 걸린다
2. `의미(30)` 의 정의를 문서 정합에서 **첫 접촉의 즉시 이해**로 바꾸고 한 문장 테스트를 넣었다
3. 의성어·의태어를 1순위 탐색 축으로 올렸다

**A/B 가 동시에 거부된 구조적 원인이 하나 더 있다.** 두 최종안이 **모두 한국어 명사 어원**이었다.
사용자에게 주어진 선택은 실질적으로 "한국어 낱말 A 대 한국어 낱말 B" 였고, 어원 축이 갈리지 않아
한쪽이 싫으면 다른 쪽도 싫을 확률이 높았다. tie-break 를 점수로만 돌린 결과다.
**R6 의 최종 2개는 어원 축이 서로 갈리게 뽑는다.**

**재소집 상한을 이번에 쓴다.** 규정상 전 후보 기준 미달 시 재소집은 1회까지다.
R6 에서 다시 미달이면 상위 2개를 미달 사실과 함께 올리고 사용자 판단을 받는다.

### R6 — 재평가와 새 최종안 (2026-08-25)

신규 8개가 합류해 후보는 이름 21개 / 25줄이 됐다. R4 재정의 기준표로 다시 매겼다.

rejected-final:A Jabak — 자박자박(가볍게 발소리를 내며 가만가만 걷는 소리). **95점으로 풀 전체 1위이고 충돌이 가장 비어 있다.** 발소리가 곧 동선이라 이름과 한 문장이 나란히 서면 여행·장소·동선이 즉시 잡힌다. 참가자 3명이 독립적으로 같은 이름에 도달했다
rejected-final:B Chagok — 차곡차곡(가지런히 쌓다). 87.5점. A 가 **걷는 움직임**을 이름으로 삼는다면 B 는 **쌓아 모으는 정리**를 이름으로 삼는다 — 코스에 스팟을 담고 일자별로 편집하는 기능 축이고, **식품 연상이 0건이라 A 가 그 축에서 거부돼도 독립적으로 살아남는다**

- 탈락: Gomgom — 87.5점으로 B 와 동점이었으나 실검색에서 무너졌다. **곰곰은 쿠팡 PB 신선식품 브랜드다.** 사용자가 Todam 을 거부한 축이 그대로 재발하고, 규모는 지역 식당이 아니라 전국 이커머스 PB 다. 의미·철자·충돌 세 항목이 동시에 0이 됐다
- 탈락: Georeum — 72.5점. 충돌은 Jabak 과 함께 최상급인데(.app 미등록·npm 미사용·앱스토어 0·브랜드 0) `eo`·`eu` 이중모음이 겹쳐 발음 0점이다. Gyeol·Yeoyu 를 죽인 것과 같은 실패다
- 탈락: Sogon — 60점. 무신사 등록 의류 브랜드 SOGONSOGON 이 실재하고 `.app` 도 선점됐다
- 탈락: Sabujak — 50점. 이름이 이미 활성 사용자 다수에게 점유돼 있다(예술가 레지던시·Etsy·인스타 2계정·유튜브)
- 탈락: Dureon — 47.5점. DUREÒN® 이 ® 표기를 쓰고 dureoncapital.com 등 활성 사업체가 여럿이다
- 탈락: Yonder — 30점. yonder.com 이 "Dining, Travel & Curated Experiences" 를 내건 **활성 여행 브랜드**다. 동종 업종 직격이라 다른 항목을 볼 필요가 없다

### Jabak 을 A 로 올리며 반드시 함께 읽어야 할 것

**국어사전에서 `자박자박` 의 두 번째 뜻은 "건더기나 절이는 물건 따위가 겨우 잠길 정도로 물이 차 있는 모양" 이고, `자박하다` 의 용례로 흔히 쓰이는 예문이 된장찌개다.**
사용자가 `Todam` 을 거부한 문장이 "된장 브랜드 같아" 였으므로 이 사실을 감추지 않고 올린다.

`curvez-requirements` 가 제출 시점에 이 점을 스스로 disclose 했고, R6 에서 실검색으로 검증했다.
**검증 결과 Todam 과는 층위가 다르다.**

| | Todam (거부됨) | Jabak |
|---|---|---|
| 무엇이 식품을 부르나 | 낱말 자체가 향토 명사 | 의태어의 **2차** 사전 의미 (1차는 발소리) |
| 시장 점유 | 토담집·토담골 실제 식당 다수, `todamfood.com` 식품 제조사 | **상호로 쓰인 사례가 검색되지 않는다** |
| 1차 타깃(en)에서 | 중립 | 중립 — 검색 지형이 비어 있다 |

그럼에도 **판단은 사용자 몫이다.** R3 의 실패는 내가 같은 종류의 데이터를 손에 쥐고
"분야가 다르니 괜찮다" 고 혼자 정리해 버린 것이었다. 같은 일을 반복하지 않기 위해
점수(의미 2점)와 그 근거, 그리고 반대 근거를 함께 올린다.

### 어원 축 규칙에 대하여 — R4 에서 내가 박은 규칙을 이번에 지키지 못했다

R4 에서 "A/B 가 둘 다 한국어 명사여서 축이 안 갈렸다" 를 동반 거부의 구조적 원인으로 지목하고
**R6 의 최종 2개는 어원 축이 갈리게 뽑는다**고 적었다. 이번 A/B 는 **둘 다 한국어 의태어다.**

지키지 못한 이유는 사용자가 "의성어 의태어도 괜찮으니까" 를 직접 요청했기 때문이다.
그 축을 따르면 상위권이 의태어로 몰리는 것이 필연이다. **사용자의 명시 요청이 내가 스스로 세운
보조 규칙보다 앞이라고 판단했다.**

축을 억지로 갈랐다면 B 는 `Georeum`(72.5, 평범한 명사)이 됐을 텐데, 그 이름은 **발음 0점이라는
확인된 결격**을 갖고 있다. 결격이 있는 이름을 B 에 세우는 것은 A 를 위한 들러리를 세우는 것이고,
그건 "1안만 올리면 사용자의 결정이 승인 도장이 된다" 는 것과 같은 실패다.

**대신 규칙의 목적은 지켰다.** 그 규칙이 막으려던 것은 "한쪽이 싫으면 다른 쪽도 같은 이유로 싫어지는 것"
이다. 두 안이 갈리는 지점을 어원이 아니라 **개념과 위험**에서 확보했다.

| | final:A `Jabak` | final:B `Chagok` |
|---|---|---|
| 이름이 가리키는 동작 | 걷는다 (움직임·발소리) | 쌓는다 (정리·수집) |
| 제품의 어느 기능에 붙나 | 동선·탐색 | 코스 담기·일자별 편집 |
| 첫 인상의 질감 | 동적·바깥 | 정돈된·모으는 |
| **식품 연상** | **2차 사전 의미에 있다 (위 표 참조)** | **0건** |
| 확인된 충돌 | `.app` 취득 가능, npm 미사용, 앱스토어 0, 브랜드 0 — **풀 전체 최상** | `.app` 선점, 앱스토어 정확 일치 2건 |
| 약점 | 걷기 은유라 시도 간 장거리 이동이 섞이면 이름이 실제보다 작게 읽힌다 | 동적 인상이 A 보다 약하고, 영어권 독자가 앞 음절을 `cha`(차/tea)로 읽을 수 있다 |

**A 가 식품 축에서 거부되면 B 는 그 이유로 함께 죽지 않는다.** 규칙이 지키려던 것이 이것이다.

### 참가자가 스스로 잘라낸 이름 (curvez-requirements)

후보로 올라오지 않았으나 R4 기준이 실제로 작동했다는 기록이라 남긴다 —
`Golmok`(골목: 골목식당 연상으로 기준A), `Chorong`(초롱: 청사초롱이 전통 소품이라 기준A 재발 위험),
`Sabak`(사박사박: 말레이시아 지명 Sabah·Sabak Bernam 과 혼동 — 여행 앱에서 다른 여행지로 읽히는 것은 치명적),
`훌쩍`·`뚜벅`(의미로는 최상위이나 로마자가 `huljjeok`·`ttubeok` 이 되어 된소리 겹자음 금지에 정면 위반).

### R7 — 감성 축 재수립과 새 최종안 (2026-08-25)

`Jabak` 은 거부됐다. 내가 disclose 했던 2차 사전 의미(국물이 자박하다)가 **사용자에게는 1차 연상**이었고,
내가 세운 "Todam 과 층위가 다르다" 는 구분은 기각됐다. `rejected-final:` 두 줄은 이력으로 남긴다.

리서치 기반으로 감성 어휘 21개를 조사해 10개를 후보로 올렸다. 최종 2개는 사용자가 이번에
어원 방향을 열어 준 데 따라 **한국어 1 + 외국어 1** 로 갈랐다.

rejected-final:A Mirinae — 은하수를 뜻하는 옛말. 어원이 미르(용)+내(시내), 곧 **"용처럼 길게 이어진 내"** 라 흩어진 별이 하나의 길이 되는 그림이 이름 자체에 들어 있다. 감성 축이면서 동선 은유를 갖는 유일한 한국어 후보이고, 한국 여행 앱이 한국어 이름을 갖는 정합도 함께 온다
rejected-final:B Mangata — 달빛이 물 위에 놓는 길을 뜻하는 스웨덴 말. A 와 같은 그림(빛이 만든 길)을 **바깥 언어로** 말한다. 1차 타깃이 영어권 독자라는 점에서 A 와 정확히 반대편 선택이고, 철자·발음이 A 보다 안정적이다

- 탈락: Dasom — **85점으로 전체 1위였다.** 사유는 아래 별도 절
- 탈락: Ongi — 72.5점. 발음은 가장 쉬우나(4자 2음절) 낱말만으로 여행이 서지 않아 한 문장이 전부를 짊어진다
- 탈락: Resfeber — 52.5점. **뜻으로는 조사 전체의 1위였다** — "떠나기 직전 심장이 뛰는 느낌" 은 사용자가 앱을 여는 순간 그 자체다. 그래서 이미 여행사 네 곳이 쓰고 있다
- 탈락: Kilig — 52.5점. 여행보다 연애 감정으로 읽힌다
- 탈락: Sonder / Meraki / Fernweh — 각 45점. Sonder 는 숙박 대기업(동종 직격), Meraki 는 Cisco, Fernweh 는 Fernweh Group 이 점유했다
- 탈락: Saudade — 35점. 검색이 포르투갈 문화로 채워진다

### 이번 조사의 핵심 발견 — 뜻이 좋을수록 이미 팔렸다

여행 감성 외국어는 **의미가 강한 순서대로 점유돼 있었다.**

| 이름 | 뜻 | 왜 죽었나 |
|---|---|---|
| Resfeber | 떠나기 직전 심장이 뛰는 느낌 | 여행사 4곳 + 여행 앱 1개가 이미 쓴다 |
| Sonder | 스쳐 지나가는 각자의 삶 | Sonder = 숙박 대기업. 앱스토어 정확 일치 15건 |
| Fernweh | 가 본 적 없는 곳에 대한 그리움 | Fernweh Group 활성 + 앱 6건 |
| Meraki | 영혼을 담아 하는 일 | Cisco Meraki |

**의미가 좋다는 것이 충돌 위험의 예측 변수다.** 그래서 이번 최종 2개는 "가장 아름다운 낱말" 이 아니라
**"충분히 아름다우면서 아직 비어 있는 낱말"** 이다. 이 상충을 푸는 것이 R7 작업의 실체였다.

### 왜 85점을 제치고 80점을 A 로 올렸는가

`Dasom`(다솜, 사랑)이 85점으로 31개 중 1위다. 가용성이 압도적이다 — `.app` 취득 가능,
npm 미사용, 앱스토어 정확 일치 0건. 그런데도 최종에서 뺐다.

**근거는 취향이 아니라 이 회의의 기록이다.**

| 라운드 | 거부된 이름 | 사용자가 댄 사유 | 어느 항목의 실패인가 |
|---|---|---|---|
| R3 | Todam | "된장 브랜드 같아" | 의미 |
| R3 | Nunchi | "눈치는 왜???" | 의미 |
| R6 | Jabak | "요리할 때 물 자박자박하게 하라고 한다" | 의미 |

**네 번의 거부가 전부 의미에서 났다. 가용성 때문에 거부된 이름은 한 번도 없다.**
`Dasom` 의 약점은 정확히 의미다 — "사랑" 과 여행 사이에 사용자가 "왜?" 를 넣을 자리가 있고,
그 자리는 `Nunchi` 가 죽은 자리와 같다. 85점의 출처가 **가용성 만점(충돌 2·확장 2)** 이라는 것도
같은 이야기다. 이 사용자에게 한 번도 문제가 된 적 없는 항목이 총점을 끌어올린 것이다.

기준표는 그대로 두고 점수도 그대로 적었다. **점수를 고쳐 결론을 맞추지 않았다.**
대신 최종을 고르는 일이 argmax 가 아니라 추리는 일이라는 것을 여기 적어 둔다.

### A/B 가 어떻게 갈리는가

| | final:A `Mirinae` | final:B `Mangata` |
|---|---|---|
| 어원 | 한국어 (은하수) | 스웨덴어 (물 위 달빛 길) |
| 한국 여행 앱과의 정합 | 이름이 한국어라 브랜드가 제품과 같은 말을 쓴다 | 무관 — "왜 스웨덴어인가" 에 답이 필요하다 |
| 1차 타깃(영어권)에게 | 낯선 고유어. 뜻을 우리가 설명해야 한다 | 낯설지만 유럽어라 진입이 부드럽다 |
| 철자·검색 | ko 검색에서 **미리내성지**가 앞선다 | 안정적. 동명 상표는 의류·라이프스타일뿐 |
| 코드 식별자 | npm 사용 가능 | **npm `mangata` 선점 — 브리프 제약 위반** |
| 확인된 최대 약점 | 우리 앱 데이터(TourAPI)에 "미리내성지" 항목이 들어 있을 가능성 | npm 이 막혀 패키지명을 그대로 못 쓴다 |

**두 안의 약점이 서로 다른 종류다** — A 는 의미·검색 쪽, B 는 기술·식별자 쪽이다.
한쪽이 걸려도 다른 쪽이 같은 이유로 죽지 않는다. R4 에서 세운 규칙이 요구한 것이 이것이다.

**공통 한계 하나는 숨기지 않는다.** 둘 다 "빛이 만든 길" 이라는 같은 그림을 쓴다.
어원과 위험은 갈라 놓았지만 **미감은 한 갈래다.** 이 감성 자체가 아니라면 둘 다 어긋난다.

### R8 — "Life is ___" 패턴 (2026-08-25)

사용자가 처음으로 자기 쪽에서 형태를 제안했다. R7 의 `Mirinae`/`Mangata` 는 거부됐고
`rejected-final:` 로 남긴다. 패턴 평가는 `## brief` 의 `### 패턴 자체의 평가` 에 있다.

final:A Life-is-Nearby (표기: `Life is Nearby`) — **100점. 이 회의에서 나온 44개 이름 중 처음으로 다섯 항목이 전부 만점이다.** promise 의 "그대로 걸을 수 있는 동선" 과 같은 말이고, v1 기능 2(지도 기반 주변 탐색)가 문자 그대로 nearby 다. `lifeisnearby.com`·`.app`·npm·앱스토어가 **동시에 비어 있다**
final:B Life-is-a-Day (표기: `Life is a Day`) — 95점. A 가 **공간**(걸어 닿는 거리)으로 좁힌다면 B 는 **시간**(하루라는 단위)으로 좁힌다. 제품이 이미 이 언어를 쓴다 — `ko.json` 의 "기분 좋은 하루를 만들어보세요". 가용성은 A 와 같이 완전하다

- 탈락: Life is Detour / Somewhere / Anywhere / Onward — 각 85점. **넷 다 가용성은 완전한데 의미가 1점이다.** Detour 는 관사 없는 명사형이 어색하고 단독어가 같은 업종(Bose 도보 투어 앱)에 점유됐다. Somewhere 는 지금 여기를 부정하고, Anywhere 는 한 지역을 편집하는 제품과 방향이 반대이며, Onward 는 자기계발로 읽힌다
- 탈락: Life is Slow — 75점. **의미는 A·B 급이었다.** 앱스토어에 정확 일치 앱 `Life is Slow` 가 이미 있다
- 탈락: Life is Unhurried — 70점. 역시 의미 2점이었으나 `lifeunhurried.com` 이 "Slow Stays, eco travel" 업체로 실재한다. 한 낱말 차이의 동종 인접이라 Resfeber·Yonder 와 같은 실패다
- 탈락: Life is Unplanned / Wandering — 70·62.5점. **promise 와 정면으로 어긋난다** — 우리 약속은 "못 정한 채로 들어와서 동선 하나를 갖고 나간다" 인데 두 이름은 들어올 때의 상태만 가리킨다
- 탈락: Life is Walkable / Meander / Elsewhere — 62.5·55·52.5점. 각각 영어 어색·단독어 점유·쿤데라 소설

### 이번 라운드에서 처음 일어난 일

**일곱 라운드 동안 `.com` 이 비어 있는 후보는 단 두 개였다**(`nadeuri`, 그리고 실사용 없는 등록 도메인들).
R8 의 구문형은 **13개 중 12개가 `.com`·`.app`·npm 이 모두 비어 있다.**

낱말 하나로 브랜드를 만들려던 일곱 라운드가 가용성에서 계속 깎였던 이유가 여기서 드러난다 —
**좋은 낱말은 이미 다 팔렸고, 좋은 문장은 아직 안 팔렸다.**

동시에 이것이 R7 에서 발견한 규칙("의미가 좋을수록 이미 점유돼 있다")의 해법이기도 하다.
`Detour` 도 `Meander` 도 `Nearby` 도 단독으로는 전부 막혀 있는데, `Life is ___` 안에 넣으면 열린다.

### final:B 의 코어 긴장 — 숨기지 않는다

`Life is a Day` 는 이름에 **"하루"** 가 들어간다. R3 에서 `curvez-requirements` 의 이의를 받아
promise 에서 날짜 수를 뺐는데(`GOAL.md:168`·`:169`·`:210`·`:324` 의 일자별 다일 코스 때문),
이 이름이 그것을 부분적으로 되돌린다.

**그럼에도 의미를 2점으로 매긴 근거:** 기준표의 의미 항목은 `①②가 ③보다 앞이다` 로 정의돼 있다.
`Life is a Day` 는 ①(첫 접촉 즉시 이해)이 강하고 ②(타 업종 연상)가 없으며 ③에서만 긴장이 있다.
그리고 그 긴장은 R2 때만큼 크지 않다 — **"삶은 하루다" 는 약속이 아니라 관점이고,
3박4일은 하루 넷이지 하루의 부정이 아니다.**

**되돌리려면:** `curvez-requirements` 가 이 해석에 동의하지 않으면 B 의 의미를 1점(총 80점)으로 내려야 하고,
그러면 85점 넷(Detour·Somewhere·Anywhere·Onward)이 B 자리를 다투게 된다. `blocked_on` 으로 올렸다.

### A/B 가 어떻게 갈리는가

| | final:A `Life is Nearby` | final:B `Life is a Day` |
|---|---|---|
| 무엇으로 좁히나 | **공간** — 걸어서 닿는 거리 | **시간** — 하루라는 단위 |
| 코어의 어디에 붙나 | promise "그대로 걸을 수 있는" + v1 기능 2(주변 탐색) | 제품이 쓰는 기존 카피 "기분 좋은 하루를 만들어보세요" |
| 문법 | 완벽 (부사·형용사형) | 완벽 (관사 포함) |
| 정서 | 조용한 반전 — "삶은 멀리 있지 않다" | 담담한 선언 — "삶은 결국 하루들이다" |
| 가용성 | `.com`·`.app`·npm·앱스토어 전부 비어 있음 | 동일 |
| 확인된 약점 | `Nearby` 가 기능어라 감성 강도가 B 보다 낮다. 단독 축약 불가(앱스토어 5건) | **다일차 코스와 긴장**(위 절). 확장성 1점 |

**두 안의 약점이 서로 다르다** — A 는 정서의 세기, B 는 코어 정합이다. 한쪽이 걸려도 다른 쪽은 산다.
**공통 한계는 패턴 자체다** — 둘 다 `Life is Good` 의 형식을 빌리고, 둘 다 아이콘에 들어가지 않는다.
패턴이 아니라면 둘 다 어긋난다.

## 확정 이후

### 1. 급한 것 — 도메인은 지금 잡아야 한다

**`lifeisnearby.com` 과 `lifeisnearby.app` 은 2026-08-25 검증 시점에 미등록이었다.**
이것은 상태이지 예약이 아니다. 여덟 라운드 동안 확인한 44개 이름 중 `.com`·`.app`·npm·앱스토어가
동시에 비어 있던 것은 이 이름과 `Life is a Day` 둘뿐이었고, **그 희소성 자체가 이 이름을 A 로 만든 이유의 절반**이다.
확정과 취득 사이의 시간이 그 근거를 무효로 만들 수 있다.

| 항목 | 값 | 검증 시점 상태 |
|---|---|---|
| 도메인 1순위 | `lifeisnearby.com` | 미등록 |
| 도메인 2순위 | `lifeisnearby.app` | 미등록 |
| 하이픈형(방어용) | `life-is-nearby.com` | 미등록 |
| npm 패키지명 | `lifeisnearby` | 미사용 |

### 2. 사람이 해야 하는 것 — 상표 조회

**이 문서의 상표 정보는 웹 검색 범위이고 전수 조사가 아니다.** 여덟 라운드 내내 Justia 는 HTTP 403,
USPTO 검색 API 는 HTTP 405 를 돌려줬고 2회 재시도 후 포기했다. `check:` 줄의 `trademark=확인 불가` 는
"비어 있다" 가 아니라 **"확인하지 못했다"** 는 뜻이다.

- **KIPRIS**(한국) 와 **USPTO**(미국)에서 `Life is Nearby` 를 사람이 직접 조회해야 한다
- 조회 클래스: 여행·소프트웨어 (9류·39류·42류 계열)
- **`Life is Good` 조건부 리스크를 함께 검토하라** — 그 회사는 약 200건의 상표를 갖고 있고 대부분 의류 클래스이며,
  ooShirts/TeeChip 상대로 실제 소송을 걸었다. 여행·앱 클래스에서는 공존 가능성이 높지만
  (`Life is Strange`=게임, LG `Life's Good`=전자가 그렇게 공존한다), **티셔츠·모자 같은 의류 굿즈를 만들면
  클래스가 겹친다.** 굿즈 계획이 생기는 시점에 이 항목을 다시 열어야 한다

### 3. curvez-designer 에게 넘기는 것

| 항목 | 값 |
|---|---|
| 확정 네임 | `Life is Nearby` (축약 금지, `is` 소문자) |
| 브랜드 코어 | `.curvez/brand/positioning.md` 의 `## 코어` 5줄. **R3 개정판이 정본**이고 `## 개정 이력` 을 함께 읽어라 |
| tone | 차분하다 · 사적이다 · 편집자적이다 / 금지: 기관 공지체, 여행사 광고체, 과장된 감탄, 이모지 |
| 표기 규칙 | `## brief` 의 `### 표기 형태` 표 |

**과제의 성격이 지금까지와 다르다.** 세 낱말이라 파비콘·앱 아이콘·좁은 헤더에 브랜드명이 들어가지 않는다.
따라서 이번 작업은 **"이름을 시각화한다" 가 아니라 "이름을 대신할 심볼을 만든다"** 이다.
`Life is Good` 이 Jake 라는 막대 인물을 쓰는 것과 같은 구조이고, **그 심볼이 브랜드 인지의 대부분을 진다.**

- `src/presentation/components/BrandMark.tsx` 의 산봉우리 SVG 는 폐기한다. MARU 의 산마루 은유 전용이었고
  MARU 는 R6 에서 결격 확정됐다(요식·식품 상호 다수 + npm 선점 + 앱스토어 정확 일치)
- 심볼이 담아야 할 뜻은 **"가까움"** 이다 — 멀리 가지 않아도 되는 것, 걸어서 닿는 거리.
  `essence` 의 "벽에 건 액자" 와 `differentiator` 의 "한 화면에 6~9개만" 이 같은 방향을 가리킨다
- `Life is Good` 의 낙천적·캐주얼한 시각 언어를 따라가면 형식 차용이 시각까지 번진다. **톤은 차분한 쪽이다**

### 4. 코드에 반영해야 하는 것 (구현 에이전트 몫, 이 문서는 값만 넘긴다)

- `src/presentation/i18n/*.json` 6개 파일의 `"brand": "MARU"` → `"Life is Nearby"`
- `package.json` 의 `name` (현재 `tour`) → `lifeisnearby`
- 환경변수 접두사가 필요하면 `LIFEIS_`
- `src/presentation/components/BrandMark.tsx` — 디자이너 산출물이 나온 뒤에 교체한다

### 5. 이 회의가 남긴 것

8 라운드, 후보 44개, 참가자 5명, 사용자 거부 5회. 거부 사유는 **전부 의미였고 가용성이 사유가 된 적은 한 번도 없다.**
그 사실이 마지막 두 라운드의 판단 기준이었다 — R7 에서 85점 `Dasom` 을, R8 에서 85점 넷을
각각 의미 1점을 이유로 최종에서 뺐다. 총점이 아니라 총점의 출처를 봐야 했다.

두 번은 내 채점 오류였다. `Todam`(R3)과 `Jabak`(R6)은 **자료를 손에 쥐고도 "분야가 다르니 괜찮다" 로
정리해 버린** 같은 형태의 실패다. 사전의 표제 순서와 사용자의 연상 순서는 다른 것이고,
브랜드에서 의미 있는 것은 후자뿐이다.

마지막 답은 사용자가 형태로 줬다. `Life is ___` 는 **이름이 곧 설명**이라
"왜 그 이름이 이 제품인가" 라는 질문이 구조적으로 생기지 않는다 — 다섯 번의 거부를 만든 그 질문이다.
