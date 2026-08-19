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
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      scroll={scroll}
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
