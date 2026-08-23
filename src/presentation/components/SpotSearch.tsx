"use client";

import { useRouter } from "next/navigation";
import { useId, useState } from "react";
import type { Category } from "@/domain/spot/category";
import { exploreHref } from "@/presentation/lib/explore-href";

/**
 * 이름으로 좁히는 칸.
 *
 * **필터를 대신하지 않는다.** 지금 고른 분류·지역을 그대로 들고 검색어만 얹는다 —
 * 실측 2026-08-23, 국문 관광지에서 "박물관" 은 22건이고 서울로 좁히면 2건이다.
 * 검색어를 넣는 순간 지역이 풀리면 사용자는 방금 고른 조건을 잃는다.
 *
 * **타이핑마다 찾지 않는다.** 공급자 응답이 10초를 넘는 일이 흔해서, 글자를 칠
 * 때마다 부르면 화면이 끊임없이 스켈레톤으로 되돌아간다. 제출할 때 한 번 간다 —
 * 검색은 "지금 이걸 찾겠다" 는 분명한 동작이고, 그 순간이 언제인지는 사용자가 안다.
 *
 * `more` 를 넘기지 않으므로 검색하면 더보기가 떨어진다. 다른 조건의 스물일곱 개를
 * 보다가 검색했는데 스물일곱 개가 그대로 오면, 더 눌렀던 상태가 조건을 넘어
 * 살아남는 것이다 (`explore-href.ts` 규칙 3).
 */
export function SpotSearch({
  locale,
  category,
  areaCode,
  districtCode,
  current,
  label,
  placeholder,
  action,
  clearLabel,
}: {
  locale: string;
  category: Category;
  areaCode?: number;
  districtCode?: number;
  /** URL 에 담긴 지금의 검색어. 새로고침해도 칸에 남아 있어야 한다 */
  current?: string;
  label: string;
  placeholder: string;
  action: string;
  clearLabel: string;
}) {
  const router = useRouter();
  const inputId = useId();
  const [value, setValue] = useState(current ?? "");

  /*
    주소가 바뀌면 칸도 따라간다. 뒤로가기로 검색 전 상태에 돌아왔는데 칸에 검색어가
    남아 있으면, 보이는 목록과 칸이 서로 다른 말을 한다.

    **effect 가 아니라 렌더 중에 맞춘다.** effect 로 하면 한 번 그린 뒤 다시 그리게
    되어 옛 값이 한 프레임 비치고, 린트도 그것을 연쇄 렌더로 잡는다. 이 자리에서
    바꾸면 React 가 그리기 전에 다시 계산한다 — 공식이 권하는 "prop 이 바뀔 때
    state 조정" 패턴이다.

    부모에서 `key` 를 주는 방법도 있지만 그러면 컴포넌트가 새로 마운트되어 포커스가
    빠진다. 연달아 검색할 때 칸에서 커서가 사라진다.
  */
  const [seen, setSeen] = useState(current);
  if (seen !== current) {
    setSeen(current);
    setValue(current ?? "");
  }

  function go(keyword: string) {
    router.push(exploreHref(locale, { category, areaCode, districtCode, keyword }));
  }

  return (
    <form
      role="search"
      className="flex min-w-0 items-center gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        go(value);
      }}
    >
      <label htmlFor={inputId} className="sr-only">
        {label}
      </label>

      {/*
        칸과 아이콘이 한 테두리 안에 있다. 돋보기를 밖에 두면 그것대로 컨트롤이
        하나 더 선 것처럼 보여, 필터 바에 나란한 것이 셋이 아니라 넷이 된다.
      */}
      <div
        className={
          "flex min-w-0 flex-1 items-center gap-2 rounded-btn border border-line bg-canvas " +
          "px-4 py-2.5 transition-colors duration-200 ease-[var(--ease-signature)] " +
          "focus-within:border-ink/25"
        }
      >
        <svg
          viewBox="0 0 24 24"
          className="size-4 shrink-0 text-muted"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>

        <input
          id={inputId}
          type="search"
          name="q"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          /*
            브라우저가 그리는 `type="search"` 의 기본 지우기 버튼을 감춘다.
            웹킷에서만 나오고 생김새를 맞출 수 없어, 이 칸만 다른 앱에서 온 것처럼
            보인다. 지우는 길은 아래 버튼으로 하나만 둔다.
          */
          className={
            "min-w-0 flex-1 bg-transparent text-[15px] text-ink outline-none " +
            "placeholder:text-muted [&::-webkit-search-cancel-button]:appearance-none"
          }
        />

        {/*
          지우기. **검색어가 있을 때만 있다** — 빈 칸 옆의 X 는 누를 것이 없다.
          누르면 칸만 비우는 것이 아니라 목록도 함께 돌아간다. 칸이 비었는데 목록이
          검색 결과 그대로면 둘이 어긋난다.
        */}
        {value && (
          <button
            type="button"
            aria-label={clearLabel}
            onClick={() => {
              setValue("");
              go("");
            }}
            className="-mr-1 shrink-0 cursor-pointer rounded-btn p-1 text-muted transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
          >
            <svg
              viewBox="0 0 24 24"
              className="size-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        )}
      </div>

      {/*
        제출 버튼은 화면에 두지 않는다. Enter 로 충분하고, 필터 바에 버튼이 하나 더
        서면 옆의 컨트롤들과 무게가 겹친다. 다만 폼에 제출 수단이 아예 없으면
        일부 보조기술에서 Enter 제출이 노출되지 않으므로, 숨긴 버튼을 남긴다.
      */}
      <button type="submit" className="sr-only">
        {action}
      </button>
    </form>
  );
}
