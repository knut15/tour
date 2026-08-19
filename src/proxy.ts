import { NextResponse, type NextRequest } from "next/server";
import { DEFAULT_LOCALE, LOCALES } from "@/domain/shared/locale";

/**
 * 로케일이 없는 경로를 로케일 경로로 보낸다.
 *
 * **파일명이 `middleware` 가 아니라 `proxy` 다.** Next.js 16 에서 `middleware` 규약이
 * deprecated 되고 `proxy` 로 rename 됐다. 런타임은 `nodejs` 고정이며 edge 를 쓸 수 없다.
 * 근거: .curvez/research/nextjs16-i18n-routing.md 사실 6·7
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasLocale = LOCALES.some((l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`));
  if (hasLocale) return;

  const accepted = request.headers.get("accept-language") ?? "";
  // 한국어 사용자만 ko 로 보내고 나머지는 영어다. 영어가 1급 시민이다 (GOAL.md §5-1)
  const locale = /(^|,)\s*ko\b/i.test(accepted) ? "ko" : DEFAULT_LOCALE;

  const url = request.nextUrl.clone();
  url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!_next|favicon.ico|.*\\..*).*)"],
};
