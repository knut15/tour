# 디자인 토큰

이름 규칙: `--<category>-<role>-<variant>` (소문자 kebab-case).
`category` ∈ `color` | `space` | `font` | `radius` | `elevation` | `motion`.
**값 이름을 토큰 이름에 넣지 않는다** — `--color-blue-500` 금지. 다크에서 이름이 거짓말을 하게 된다.

## 색

바탕은 조용하게, 포인트는 큰 면으로. **`#FFFFFF` 를 배경으로 쓰지 않는다** (`GOAL.md` §2.3).

| 토큰 | 라이트 | 다크 | 용도 |
|---|---|---|---|
| --color-bg-canvas | #EFEEE7 | #15171A | 화면 최하단 배경 (페일 본 페이퍼) |
| --color-bg-surface | #F8F7F1 | #1F2225 | 카드·시트·액자 바탕 |
| --color-bg-sunken | #E4E2D8 | #0F1113 | 레인 트랙 홈, 스켈레톤 바탕 |
| --color-text-primary | #1A1C1E | #ECEBE4 | 본문·제목 |
| --color-text-muted | #5A5D57 | #9DA098 | 보조 설명·메타 |
| --color-text-on-accent | #FFFFFF | #101318 | 액센트 면 위 글자 |
| --color-text-on-warm | #1A1C1E | #101318 | 로즈·머스터드·민트 면 위 글자 |
| --color-border-subtle | #DCD9CD | #2E3236 | 구분선·액자 테두리 |
| --color-focus-ring | #1F49C4 | #86A6F2 | 키보드 포커스 링 |
| --color-accent-primary | #1F49C4 | #86A6F2 | 1차 CTA. 관광지 카테고리 (코발트 레인) |
| --color-accent-primary-hover | #1A3EA8 | #9DB4F4 | 1차 CTA 호버 |
| --color-accent-primary-disabled | #A8B6DF | #3E4A63 | 1차 CTA 비활성 |
| --color-accent-place | #0E7F8C | #4FC8D6 | 위치·지도 (시안 레인) |
| --color-accent-culture | #57C9A8 | #57C9A8 | 문화시설 카테고리 (민트 레인) |
| --color-accent-food | #E8779A | #F0A0B8 | 음식점 카테고리 (로즈 레인) |
| --color-accent-festival | #E9B23C | #E9B23C | 축제·행사 카테고리 (머스터드 레인) |
| --color-accent-danger | #C43B2A | #F08878 | 삭제·파괴적 행동 |

**색 사용 규칙 (`GOAL.md` §2.3):** 한 화면에 지배적인 액센트는 **하나뿐**이다.
색은 1px 테두리가 아니라 **면**으로 쓴다. 카테고리 색은 전 화면에서 고정이다.

## 간격 — 4pt 그리드

| 토큰 | 라이트 | 다크 | 용도 |
|---|---|---|---|
| --space-1 | 4 | 4 | 아이콘·라벨 밀착 |
| --space-2 | 8 | 8 | 밀착 간격 |
| --space-3 | 12 | 12 | 캡션과 이미지 사이 |
| --space-4 | 16 | 16 | 카드 내부 패딩 |
| --space-6 | 24 | 24 | 컴포넌트 사이 |
| --space-8 | 32 | 32 | 레인 사이 |
| --space-12 | 48 | 48 | 섹션 사이 (모바일) |
| --space-20 | 80 | 80 | 섹션 사이 (데스크톱) |

## 타이포

**디스플레이와 본문 모두 Pretendard 다.**

초안은 디스플레이에 Jost(Futura 계열)를 썼는데, **라틴 전용 서체라 한국어 제목은 폴백되어**
로케일마다 헤드라인 서체가 달라지고 있었다. 이 앱은 영·한을 나란히 쓰므로 한 서체로 가야 한다.

Pretendard 는 가변 서체(100~900)라 굵기 축만으로 위계를 만들 수 있고,
supanova 금지 목록(Inter, Noto Sans KR, Roboto 등)에 없다. 위계는 굵기와 자간으로 만든다 —
헤드라인 `font-semibold` + `tracking-[-0.035em]`, 라벨 `font-medium` + `tracking-[0.18em]` 대문자.

| 토큰 | 라이트 | 다크 | 용도 |
|---|---|---|---|
| --font-family-display | Pretendard | Pretendard | 제목·에이브로우 |
| --font-family-body | Pretendard | Pretendard | 본문·UI |
| --font-size-eyebrow | 11 | 11 | 에이브로우 라벨 (대문자, 자간 0.15em) |
| --font-size-caption | 13 | 13 | 캡션·메타 |
| --font-size-body | 16 | 16 | 본문 |
| --font-size-title | 22 | 22 | 카드 제목 |
| --font-size-heading | 32 | 32 | 화면 제목 (모바일) |
| --font-size-display | 56 | 56 | 화면 제목 (데스크톱) |
| --font-weight-body | 400 | 400 | 본문 |
| --font-weight-emphasis | 600 | 600 | 강조 |
| --font-weight-display | 500 | 500 | Jost 디스플레이 (굵게 쓰지 않는다) |
| --line-height-ko | 1.6 | 1.6 | 한글 블록. `word-break: keep-all` 필수 |
| --line-height-display | 1.1 | 1.1 | 디스플레이 |
| --letter-spacing-eyebrow | 0.15em | 0.15em | 에이브로우 자간 |

**한글 타이포 규칙:** 한글 문단에 `word-break: keep-all` 을 반드시 건다. 줄높이는 `--line-height-ko`
이하로 내리지 않는다 — 한글은 라틴보다 세로 공간이 더 필요하다.

## radius

| 토큰 | 라이트 | 다크 | 용도 |
|---|---|---|---|
| --radius-sm | 4 | 4 | 배지·칩 |
| --radius-inner | 10 | 10 | 카드 안쪽 창. **동심원 반경: 바깥 − 패딩(20−10)** |
| --radius-frame | 20 | 20 | 카드 바깥 |
| --radius-full | 999 | 999 | 버튼·아바타 |

## elevation

그림자를 거의 쓰지 않는다. 깊이는 **색면의 대비**로 만든다 (`GOAL.md` §2.3).

| 토큰 | 라이트 | 다크 | 용도 |
|---|---|---|---|
| --elevation-flat | none | none | 기본. 대부분의 면 |
| --elevation-raised | 0 1px 0 #DCD9CD | 0 1px 0 #2E3236 | 액자 바닥선만 |
| --elevation-overlay | 0 12px 32px -12px rgba(26,28,30,0.18) | 0 12px 32px -12px rgba(0,0,0,0.5) | 바텀시트·모달 |

**스크롤에 고정된 바의 아래 경계는 드랍쉐도우다.** `elevation-overlay` 와 별도로 둔다 —
그쪽은 바텀시트·모달용이고 이건 바 하나의 경계다.

| 토큰 | 라이트 | 다크 | 용도 |
|---|---|---|---|
| --filter-bar-shadow-alpha | 0.2 | 0.4 | 붙어 있는 필터 바 아래 |

`box-shadow: 0 12px 12px -12px rgb(0 0 0 / var(--filter-bar-shadow-alpha))`.
spread 를 -12 로 두면 그림자 사각형의 아래 변이 바의 아래 변과 겹쳐 **위로는 새지 않고
아래로만 12px** 퍼진다. 다크에서 알파가 두 배인 이유는 어두운 바탕 위의 검은 그림자가
같은 값으로는 보이지 않기 때문이다. 구현은 `globals.css` 의 `.filter-sticky` 다.

## motion

| 토큰 | 라이트 | 다크 | 용도 |
|---|---|---|---|
| --motion-ease | cubic-bezier(0.16,1,0.3,1) | cubic-bezier(0.16,1,0.3,1) | 전 인터랙션 공통. linear·ease-in-out 금지 |
| --motion-fast | 180ms | 180ms | 호버·포커스 |
| --motion-base | 320ms | 320ms | 상태 전환 |
| --motion-lane | 520ms | 520ms | 레인 진입 |

`transform` 과 `opacity` 만 애니메이션한다. `prefers-reduced-motion: reduce` 면 전부 0ms 로 낮춘다.

## 대비 검증

- fg=#1A1C1E bg=#EFEEE7 mode=light min=4.5
- fg=#5A5D57 bg=#F8F7F1 mode=light min=4.5
- fg=#FFFFFF bg=#1F49C4 mode=light min=4.5
- fg=#FFFFFF bg=#0E7F8C mode=light min=4.5
- fg=#1A1C1E bg=#E8779A mode=light min=4.5
- fg=#1A1C1E bg=#E9B23C mode=light min=4.5
- fg=#1A1C1E bg=#57C9A8 mode=light min=4.5
- fg=#ECEBE4 bg=#15171A mode=dark min=4.5
- fg=#9DA098 bg=#1F2225 mode=dark min=4.5
- fg=#101318 bg=#86A6F2 mode=dark min=4.5
- fg=#101318 bg=#4FC8D6 mode=dark min=4.5
- fg=#101318 bg=#F0A0B8 mode=dark min=4.5
