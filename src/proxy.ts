import { NextResponse, type NextRequest } from "next/server";
import { DEFAULT_LOCALE, LOCALES, type Locale } from "@/domain/shared/locale";

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

  // Accept-Language 를 q 값 순으로 훑어 지원 로케일 중 첫 매치를 고른다.
  // 매치가 없으면 영어다 — 영어가 1급 시민이다 (GOAL.md §5-1)
  const locale = pickLocale(request.headers.get("accept-language"));

  const url = request.nextUrl.clone();
  url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(url);
}

/**
 * `ko-KR,ko;q=0.9,en;q=0.8` 같은 헤더에서 지원 로케일을 고른다.
 * `zh-Hant`·`zh-TW`·`zh-HK` 는 번체로, 그 외 `zh` 는 지원 목록에 없으므로 건너뛴다.
 */
function pickLocale(header: string | null): Locale {
  if (!header) return DEFAULT_LOCALE;
  const tags = header
    .split(",")
    .map((part) => {
      const [tag, ...params] = part.trim().split(";");
      const q = params.find((p) => p.trim().startsWith("q="));
      return { tag: tag.trim().toLowerCase(), q: q ? Number(q.split("=")[1]) : 1 };
    })
    .filter((t) => t.tag && Number.isFinite(t.q))
    .sort((a, b) => b.q - a.q);

  for (const { tag } of tags) {
    if (tag === "*") break;
    const exact = LOCALES.find((l) => l.toLowerCase() === tag);
    if (exact) return exact;
    if (/^zh\b/.test(tag)) {
      // 번체를 쓰는 지역 태그만 받는다. 간체(ChsService2)는 아직 활용신청 전이다
      if (/hant|tw|hk|mo/.test(tag)) return "zh-Hant";
      continue;
    }
    const base = tag.split("-")[0];
    const byBase = LOCALES.find((l) => l.split("-")[0] === base);
    if (byBase) return byBase;
  }
  return DEFAULT_LOCALE;
}

export const config = {
  /*
    `api` 를 뺀다. **API 에는 로케일이 없다.**

    없으면 `/api/...` 요청이 `/ko/api/...` 로 307 되어 라우트에 닿지 않는다.
    화면 주소는 언어별로 갈리지만 데이터를 주고받는 자리는 그렇지 않다 —
    좋아요는 어느 언어에서 눌러도 같은 곳에 쌓인다.
  */
  matcher: ["/((?!api|_next|favicon.ico|.*\\..*).*)"],
};
