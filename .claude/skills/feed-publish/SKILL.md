---
name: feed-publish
description: 인스타 피드를 발행하기 전에 커버를 먼저 그려 `assets/spot/<contentId>.jpg` 로 저장하고 사람에게 컨펌을 받는다. 컨펌이 떨어진 건만 `approved` 로 올려 발행한다. "피드 올려줘", "발행해줘", "인스타 올려줘", "커버 뽑아줘", "커버 보여줘", "초안 만들어줘", "큐 확인해줘", "publish the feed", "instagram post" 라고 하거나 `ig_queue`·`/api/instagram/*`·`ig-cover.tsx` 를 건드릴 때 실행한다.
---

# 피드는 커버를 컨펌받고 올린다

## 왜 컨펌이 먼저인가

**나간 뒤에는 못 고친다.** 인스타 API 에는 게시물의 이미지·캡션을 바꾸는 수단이
없다. 잘못 나가면 지우고 다시 올리는 것뿐이고 그때 좋아요·저장·도달은 사라진다.

큐를 `draft` 와 `approved` 로 나눈 것이 그래서다(`ig-queue-repository.ts`). 초안
생성기는 절대 `approved` 를 만들지 않는다. **그 문턱을 넘기는 것은 사람의 OK 하나뿐이다.**

## 절차

### 1. 큐를 본다

```bash
node --env-file=.env.local scripts/ig-cover.mjs list
```

`draft` 가 없으면 초안부터 만든다. dev 서버가 떠 있어야 한다.

```bash
SECRET=$(grep '^CRON_SECRET=' .env.local | cut -d= -f2-)
curl -s -H "Authorization: Bearer $SECRET" "http://localhost:3000/api/instagram/draft"
```

카테고리는 UTC 일수로 돌아간다. 특정 분류를 채우려면 `?category=attraction|culture|food|festival`.

### 2. 제목을 소개글에서 짓는다

커버 헤드라인은 **두 줄, 각 줄 8자 이하**다. 초안 생성기가 상세 설명을 읽고 지어
넣지만, 나온 두 줄이 마음에 안 들면 다시 뽑는다.

```bash
node --env-file=.env.local scripts/ig-cover.mjs headline <큐id>
```

`draft` 인 줄만 바뀐다. 컨펌 전에는 몇 번이든 다시 부를 수 있다.

모델이 없거나 답이 형식에 안 맞으면 **손으로 정한다.** 이 절차는 모델 없이도 돈다.

```bash
node --env-file=.env.local scripts/ig-cover.mjs set-headline 16 $'물길 굽이마다\n정자가 있는 곳'
```

두 줄이 아니거나 한 줄이 8자를 넘으면 거절한다 — 넘치면 `fitFontSize` 가 글자를
줄여 제목이 조용히 작아진다.

#### 같은 제목이 되풀이되는 것을 본다

**이 계정의 실제 문제였다.** 실측 2026-08-31: 발행된 5건 중 3건이
`닫는 시간이 / 따로 없는 곳`, 2건이 `가기 전에 / 요일부터 확인` 이었다. 지역이
달라도 성격이 같으면 같은 글자가 걸린다 — 성격별 고정 문구가 여덟 개뿐이기 때문이다
(`draft-copy.ts` 의 `COPY`).

`list` 가 겹치는 제목을 세어 맨 아래 모아 보여 준다. 초안 생성 응답에도
`headlineDuplicate: true` 가 붙는다. **막지는 않는다** — 장소는 멀쩡한데 제목만
겹치는 것이므로 위 두 명령으로 다시 지으면 된다.

`ANTHROPIC_API_KEY` 가 없으면 초안은 고정 문구로 떨어지고 `headline` 명령은 502 다.
그때는 `set-headline` 으로 직접 쓴다.

### 3. 커버를 그려 파일로 남긴다

```bash
node --env-file=.env.local scripts/ig-cover.mjs make <큐id>
```

`assets/spot/<contentId>.jpg` 로 저장된다. **장소마다 한 장**이고, 다시 그리면
덮어쓴다 — 컨펌 대상은 늘 최신 한 장이다.

dev 서버가 3000 이 아니면 `COVER_BASE=http://localhost:3200` 을 앞에 붙인다.

### 4. 사람에게 보여준다

저장한 JPEG 을 Read 로 열어 **그림을 직접 확인한 뒤** 이 넷을 함께 올린다.

- 커버 그림
- 헤드라인 두 줄(각 8자 이하)과 카테고리 라벨
- 캡션 전문 — `[여기에 한 문장 …]` 같은 **채워야 할 자리가 남아 있으면 그것부터 짚는다**
- 액자 크기와 사진 장수

### 5. OK 를 받는다

**여기서 멈춘다.** 사용자가 명시적으로 OK 하기 전에는 다음으로 넘어가지 않는다.
"괜찮아 보인다" 는 내 판단이지 컨펌이 아니다.

고칠 곳이 나오면 큐를 고치고 2~3번으로 돌아간다.

### 6. 승인하고 발행한다

```bash
node --env-file=.env.local scripts/ig-cover.mjs approve <큐id>
```

발행은 `/api/instagram/cron` 이 집어 간다. 정해진 시각을 기다리거나, 지금 올리려면
**배포된 주소로** 부른다.

```bash
curl -s -H "Authorization: Bearer $SECRET" "https://tour-theta-opal.vercel.app/api/instagram/cron"
```

주소는 GitHub 저장소의 homepage 에 있다 — `gh repo view knut15/tour --json homepageUrl`.

**localhost 로 부르면 안 된다.** 메타가 이미지 URL 을 직접 가져가는데 로컬 주소는
바깥에서 열리지 않는다. 커버 코드를 고쳤다면 **배포가 먼저다** — 배포 전에 부르면
예전 코드로 그려진 커버가 나간다.

## 발행이 실패했다고 응답을 믿지 않는다

**이것이 이 문서에서 가장 비싸게 배운 것이다.**

실측 2026-09-01: `media_publish` 가 `403 Application request limit reached` 를
돌려주면서 **게시물은 실제로 만들어졌다.** 그 응답을 믿고 15분 간격으로 재시도해
같은 글이 **20건** 올라갔다. 인스타 API 에는 삭제가 없어 사람이 앱에서 하나씩 지웠다.

그래서 순서가 이렇다.

1. 발행이 실패로 보이면 **재시도하기 전에** 계정을 본다

```bash
node --env-file=.env.local scripts/ig-cover.mjs posted
```

2. 같은 글이 이미 있으면 **재시도가 아니라 중복이다.** 큐를 `published` 로 맞추고
   끝낸다 — 응답이 아니라 계정이 사실이다
3. 없을 때만 다시 시도한다

`publishCarousel` 도 같은 검사를 한다(`instagram-client.ts`). 시작 전에 같은 캡션이
있으면 거절하고, 발행이 실패로 끝나면 계정을 조회해 실제로 올라갔으면 그 `mediaId`
를 답으로 준다. 그래도 **사람이 눈으로 확인하는 절차를 없애지는 않는다** — 두 겹이다.

### 실패를 반복해서 두드리지 않는다

같은 실측에서 오류가 이렇게 옮겨 갔다.

```
[publish]   403  Application request limit reached      ← 발행 호출만 막힘
[item 7/9]  400  User is performing too many actions    ← 컨테이너 생성까지 번짐
```

**두드릴수록 제한이 넓어진다.** 두세 번 실패하면 멈추고 몇 시간 뒤에 다시 한다.
정기 cron(`vercel.json`, 월·화 10:00 UTC)이 어차피 한 건씩 집어 간다.

## 하지 말 것

- 컨펌 없이 `approve` 하지 않는다. 이 스크립트에서 되돌리기가 되는 마지막 지점이다.
- 컨펌 없이 `/api/instagram/cron` 이나 `/api/instagram/publish` 를 부르지 않는다.
- 커버를 보지 않고 "잘 나왔습니다" 라고 하지 않는다. 파일을 Read 로 열어 본다.
- **발행 결과를 API 응답만 보고 말하지 않는다.** `posted` 로 계정을 확인한 뒤 말한다.
- 실패한 발행을 자동 루프로 반복하지 않는다. 사람이 보고 정한다.

## 액자 규칙은 두 곳에 있다

`scripts/ig-cover.mjs` 의 `PORTRAIT_RATIO` 와 액자 계산은
`src/app/api/instagram/cron/route.ts` 와 **같아야 한다.** 갈리면 컨펌한 그림과
나가는 그림이 달라져 이 절차 전체가 무의미해진다. 한쪽을 고치면 다른 쪽도 고친다.

커버를 그리는 코드는 `/api/og` 하나뿐이므로(`src/presentation/lib/ig-cover.tsx`)
그림 자체는 갈릴 일이 없다.
