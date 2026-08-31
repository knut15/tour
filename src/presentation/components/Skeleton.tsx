import { BATCH } from "@/presentation/lib/explore-paging";

/**
 * 로딩 표시.
 *
 * **실제 카드와 같은 골격을 그린다.** 크기가 다르면 데이터가 도착할 때 레이아웃이 튀고,
 * 그 점프가 로딩 자체보다 더 거슬린다. 카드의 사진 비율·줄 수·헤어라인 위치를 그대로 따른다.
 *
 * 스켈레톤 전체는 `.skeleton-root` 로 감싸 200ms 이후에만 보인다.
 */
function Block({ className }: { className: string }) {
  return <div className={"skeleton-block " + className} aria-hidden="true" />;
}

function SpotFrameSkeleton() {
  return (
    <article className="flex h-full min-w-0 flex-col">
      {/* 사진 자리. 실제 카드와 같은 3:2 */}
      <Block className="aspect-[3/2] w-full !rounded-[10px]" />

      <div className="flex items-baseline justify-between gap-3 pt-[18px]">
        <Block className="h-[22px] w-1/2" />
        <Block className="h-[10px] w-14 shrink-0" />
      </div>

      {/* 한글 원명 줄. 값이 없어도 자리를 지키는 것과 같은 높이다 */}
      <Block className="mt-1.5 h-[13px] w-1/3" />

      <div className="mt-auto border-t border-line pt-3">
        <Block className="h-[11px] w-4/5" />
      </div>
    </article>
  );
}

/**
 * 실제 목록과 **같은 열 수·같은 개수·같은 배치**로 그린다.
 *
 * 이것이 어긋나면 데이터가 도착할 때 문서 높이가 널뛴다. 그러면 그 순간 화면에
 * 머물러 있던 스크롤 위치가 잘려 나가고, 목록으로 돌아오거나 탭을 옮길 때
 * 원래 가려던 자리에 서지 못한다 — 실제로 그래서 탭을 눌러도 맨 위에 머물렀다.
 *
 * 목록이 grid 에서 multi-column 으로 바뀌고 한 묶음이 아홉에서 열둘로 늘었는데
 * 여기만 옛 값(3열 grid · 9개)에 남아 있었다. 셋을 따로 적어 두면 또 갈린다.
 * 열 수와 간격은 `Wall.tsx` 와, 개수는 `explore-paging.ts` 의 `BATCH` 와 같아야 한다.
 */
export function WallSkeleton({ count = BATCH, label }: { count?: number; label: string }) {
  return (
    <div className="skeleton-root" role="status" aria-live="polite" aria-label={label}>
      <ul className="columns-1 gap-x-[34px] sm:columns-2 md:columns-3 lg:columns-4">
        {Array.from({ length: count }, (_, i) => (
          <li key={i} className="mb-16 break-inside-avoid">
            <SpotFrameSkeleton />
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * 마스트헤드의 날씨 칩 자리.
 *
 * **실제 칩과 같은 36px 높이·같은 폭이다.** 여기가 어긋나면 날씨가 도착하는 순간
 * 테마 버튼과 언어 선택이 옆으로 밀린다 — 헤더에서 가장 눈에 띄는 점프다.
 * 날씨 조회가 실패하면 칩이 아예 사라지므로 이 자리도 비워진다.
 */
export function WeatherChipSkeleton() {
  return (
    <div className="skeleton-root">
      <Block className="h-9 w-[68px] !rounded-[6px]" />
    </div>
  );
}

/** 자치구 선택 컨트롤 자리 */
export function RegionPickerSkeleton() {
  return (
    <div className="skeleton-root">
      <Block className="h-[42px] w-56 !rounded-[16px]" />
    </div>
  );
}
