import type { ReactNode } from "react";
import Link from "next/link";
import {
  TDS_BUTTON,
  TDS_BUTTON_PRIMARY,
  TDS_BUTTON_WEAK,
} from "@/presentation/components/tds";

/**
 * TDS Mobile Button (xlarge) — 56px / 16px 반경 / 17px 600 / `#3182f6`.
 * 기하와 상태 계약은 토스 문서를 따른다. 마케팅 CTA(40px / 7px)와 **합치지 않는다.**
 */
export function ButtonLink({
  href,
  variant = "primary",
  fullWidth = false,
  scroll,
  transitionTypes,
  testId,
  children,
}: {
  href: string;
  variant?: "primary" | "weak";
  fullWidth?: boolean;
  /**
   * `false` 면 이동 후 스크롤 위치를 지킨다.
   * 목록이 아래로 늘어나는 더보기처럼, 화면이 바뀌는 게 아니라 이어지는 경우에 쓴다.
   */
  scroll?: boolean;
  /**
   * 이 이동이 **어느 방향인지** 전환에 알린다 (`to-explore` / `to-home`).
   *
   * 방향을 모르면 화면 사이를 오갈 때 어느 쪽 스냅샷을 남길지 정할 수 없다.
   * 규칙은 `globals.css` 의 `::view-transition-*(.morph-*)` 가 갖는다.
   */
  transitionTypes?: string[];
  /**
   * QA 가 이 버튼을 집는 이름. **이 컴포넌트는 여러 자리에 서므로 기본값이 없다** —
   * 붙이지 않은 버튼에는 속성 자체가 나가지 않아, 한 이름이 여러 버튼에 걸리는 일이 없다.
   */
  testId?: string;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      scroll={scroll}
      transitionTypes={transitionTypes}
      data-testid={testId}
      className={
        TDS_BUTTON +
        " " +
        (variant === "weak" ? TDS_BUTTON_WEAK : TDS_BUTTON_PRIMARY) +
        (fullWidth ? " w-full" : "")
      }
    >
      {children}
    </Link>
  );
}
