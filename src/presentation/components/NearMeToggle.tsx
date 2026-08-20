"use client";

import { useNearMe } from "@/presentation/lib/near-me";
import { FILTER_CONTROL } from "@/presentation/components/tds";

/**
 * 카드에 거리를 켜고 끄는 스위치.
 *
 * **거리를 보여주려면 위치가 필요하고, 위치는 물어야 얻는다.** 페이지를 열자마자
 * 권한 창을 띄우는 대신 이 컨트롤을 두어 사용자가 원할 때 켜게 한다. 한 번 켜면
 * 다음 방문에는 조용히 다시 받는다 (`near-me.ts`).
 *
 * 거부당한 뒤에는 **버튼을 지우지 않고 눌리지 않게만 둔다.** 사라지면 방금 누른
 * 것이 어디 갔는지 알 수 없고, 다시 켜려면 브라우저 설정을 만져야 한다는 사실도
 * 전할 자리가 없어진다.
 */
export function NearMeToggle({
  labelOn,
  labelOff,
  labelAsking,
  labelDenied,
}: {
  labelOn: string;
  labelOff: string;
  labelAsking: string;
  labelDenied: string;
}) {
  const { status, enable, disable } = useNearMe();

  // 이 브라우저에 geolocation 이 없으면 켤 방법이 아예 없다. 자리를 차지하지 않는다
  if (status === "unsupported") return null;

  const denied = status === "denied";
  const busy = status === "asking";
  const on = status === "on";

  const text = denied ? labelDenied : busy ? labelAsking : on ? labelOn : labelOff;

  return (
    <button
      type="button"
      onClick={on ? disable : enable}
      disabled={denied || busy}
      aria-pressed={on}
      title={denied ? labelDenied : undefined}
      className={
        FILTER_CONTROL +
        " disabled:cursor-default disabled:opacity-60" +
        // 켜진 상태를 색으로도 알린다. 아이콘 모양만으로는 켜짐/꺼짐이 구분되지 않는다
        (on ? " border-ink/25 text-ink" : " text-muted")
      }
    >
      <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" aria-hidden="true">
        <path
          d="M12 21s7-6.1 7-11a7 7 0 1 0-14 0c0 4.9 7 11 7 11Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
        <circle cx="12" cy="10" r="2.4" fill="none" stroke="currentColor" strokeWidth="1.6" />
      </svg>
      {text}
    </button>
  );
}
