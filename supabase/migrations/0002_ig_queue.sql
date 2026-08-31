-- 인스타 발행 큐.
--
-- **발행 경로에는 판단을 넣지 않는다.** cron 은 미리 승인된 줄을 꺼내 그대로
-- 실행할 뿐이고, 무엇을 어떤 문구로 올릴지는 사람이 미리 정해 여기 넣는다.
-- 정해진 시각에 무엇이 나갈지 발행 전에 눈으로 볼 수 있어야 하고, 나간 뒤에는
-- 인스타에서 캡션도 사진도 고칠 수 없기 때문이다(실측 2026-08-31).
--
-- 키가 contentid 인 이유:
--   spot_stats 는 로케일을 넘나들어야 해서 한글 원명을 키로 쓰지만, 발행은
--   국문 카탈로그 한 벌만 본다. 같은 장소를 두 번 올리지 않는 것이 목적이므로
--   국문 contentid 로 충분하고, 이름이 바뀌어도 이력이 끊기지 않는다.

create table if not exists public.ig_queue (
  id            bigint generated always as identity primary key,

  -- 어느 장소인가. 국문 TourAPI contentid
  content_id    text not null,

  -- 커버에 실리는 값. 앱의 카테고리 이름을 그대로 쓴다
  chip          text not null,
  -- 두 줄 기본, 최대 세 줄. 줄바꿈은 개행 문자로 넣는다
  headline      text not null,
  -- 시·도 + 시·군·구 까지. 앱의 지역 필터와 같은 단위다
  pin           text not null,
  category      text not null check (category in ('attraction','culture','food','festival')),

  -- 캐러셀에 실을 사진 id. **첫 번째가 커버 바탕이 된다**
  photo_ids     text[] not null check (array_length(photo_ids, 1) between 1 and 9),

  -- 한국어와 영어를 한 덩어리로 담는다. 발행 route 가 규약을 검사한다
  caption       text not null,

  -- draft: 사람이 아직 안 봤다 / approved: 나가도 된다 / published: 나갔다 / failed: 실패
  status        text not null default 'draft'
                check (status in ('draft','approved','published','failed')),

  -- 이 시각 이후에 나간다. 비어 있으면 순서가 오는 대로
  scheduled_for timestamptz,

  published_at  timestamptz,
  media_id      text,
  -- 실패했으면 왜인지. 조용히 사라지지 않게 남긴다
  last_error    text,

  created_at    timestamptz not null default now()
);

-- **같은 장소를 두 번 올리지 않는다.** 나간 것만 막는다 — 초안이 여러 벌 있는 것은
-- 괜찮고, 그중 하나만 나가면 된다
create unique index if not exists ig_queue_published_once
  on public.ig_queue (content_id) where status = 'published';

-- cron 이 매번 묻는 질문 하나 — "지금 나갈 수 있는 것 중 가장 오래된 것"
create index if not exists ig_queue_ready_idx
  on public.ig_queue (status, scheduled_for, created_at);

-- ─────────────────────────────────────────────────────────────
-- 큐는 공개 키로 읽거나 쓰지 않는다.
--
-- spot_stats 는 브라우저가 직접 부르지만 이것은 서버(cron)만 본다. 정책을 하나도
-- 두지 않으면 anon·authenticated 로는 아무 줄도 보이지 않고, service role 만
-- RLS 를 우회해 읽고 쓴다.
-- ─────────────────────────────────────────────────────────────
alter table public.ig_queue enable row level security;
