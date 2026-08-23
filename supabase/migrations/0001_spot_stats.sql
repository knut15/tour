-- 장소의 반응 — 좋아요와 조회.
--
-- 키가 한글 원명인 이유:
--   TourAPI 는 로케일마다 contentid 공간이 분리돼 있다. 실측 2026-08-19 에
--   국문 2031668("초안산")을 영문 서비스에 물으면 빈 결과가 온다. contentid 로
--   세면 같은 장소가 언어 수만큼 갈라져, 영어로 누른 좋아요가 한국어 화면에서
--   0 이 된다. 두 카탈로그를 잇는 값은 한글 원명뿐이다.
--
-- 방문자 구분:
--   로그인이 없으므로 브라우저가 만든 익명 id 를 쓴다. 계정이 생기면 그 id 를
--   계정에 붙여 옮기면 되고, 그때까지도 같은 브라우저에서는 중복이 막힌다.

create table if not exists public.spot_stats (
  -- 한글 원명. 공백을 다듬은 값이 들어온다 (domain/spot/spot-stats.ts)
  key         text primary key,
  like_count  integer not null default 0 check (like_count >= 0),
  view_count  integer not null default 0 check (view_count >= 0),
  updated_at  timestamptz not null default now()
);

-- 누가 무엇에 눌렀는지. 같은 사람이 여러 번 눌러도 하나로 센다
create table if not exists public.spot_like (
  key         text not null,
  visitor_id  text not null,
  created_at  timestamptz not null default now(),
  primary key (key, visitor_id)
);

-- 내가 누른 목록을 뽑을 때 쓴다. 목록 한 화면이 한 번에 묻는다
create index if not exists spot_like_visitor_idx on public.spot_like (visitor_id);

-- 조회는 하루에 한 번만 센다. 새로고침마다 오르면 사람이 아니라 새로고침을 센다
create table if not exists public.spot_view (
  key         text not null,
  visitor_id  text not null,
  viewed_on   date not null default (now() at time zone 'utc')::date,
  primary key (key, visitor_id, viewed_on)
);

-- ─────────────────────────────────────────────────────────────
-- 세는 일은 전부 서버 함수 안에서 한다.
--
-- 클라이언트가 "읽고 + 1 하고 쓰는" 식이면 두 사람이 같은 순간에 누를 때 하나가
-- 사라진다. 함수 안에서 upsert 로 처리하면 그 경합이 없다.
-- ─────────────────────────────────────────────────────────────

-- 좋아요를 켜거나 끈다. 바뀐 뒤의 총수와 내 상태를 돌려준다
create or replace function public.toggle_spot_like(p_key text, p_visitor text)
returns table (like_count integer, liked boolean)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_existed boolean;
begin
  delete from public.spot_like where key = p_key and visitor_id = p_visitor;
  v_existed := found;

  if not v_existed then
    insert into public.spot_like (key, visitor_id) values (p_key, p_visitor);
  end if;

  insert into public.spot_stats (key, like_count)
  values (p_key, case when v_existed then 0 else 1 end)
  on conflict (key) do update
    set like_count = greatest(0, public.spot_stats.like_count + case when v_existed then -1 else 1 end),
        updated_at = now();

  return query
    select s.like_count, not v_existed from public.spot_stats s where s.key = p_key;
end;
$$;

-- 조회를 기록한다. 오늘 이미 봤으면 아무 일도 하지 않는다
create or replace function public.record_spot_view(p_key text, p_visitor text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.spot_view (key, visitor_id) values (p_key, p_visitor)
  on conflict do nothing;

  if not found then
    return;
  end if;

  insert into public.spot_stats (key, view_count)
  values (p_key, 1)
  on conflict (key) do update
    set view_count = public.spot_stats.view_count + 1,
        updated_at = now();
end;
$$;

-- ─────────────────────────────────────────────────────────────
-- RLS.
--
-- 수는 누구나 읽는다. 쓰기는 위 두 함수로만 열어 둔다 — 테이블에 직접 쓰게 두면
-- 아무나 like_count 에 임의의 수를 넣을 수 있다.
-- ─────────────────────────────────────────────────────────────

alter table public.spot_stats enable row level security;
alter table public.spot_like  enable row level security;
alter table public.spot_view  enable row level security;

drop policy if exists spot_stats_read on public.spot_stats;
create policy spot_stats_read on public.spot_stats for select using (true);

drop policy if exists spot_like_read on public.spot_like;
create policy spot_like_read on public.spot_like for select using (true);

-- 함수는 security definer 라 정책을 우회한다. 직접 쓰기는 어떤 역할에도 열지 않는다
grant execute on function public.toggle_spot_like(text, text) to anon, authenticated;
grant execute on function public.record_spot_view(text, text) to anon, authenticated;
