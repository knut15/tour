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
  children,
}: {
  href: string;
  variant?: "primary" | "weak";
  fullWidth?: boolean;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
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
