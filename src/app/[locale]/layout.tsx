import type { Metadata } from "next";
import { Newsreader } from "next/font/google";
import Script from "next/script";
import { notFound } from "next/navigation";
import { LOCALES, isLocale } from "@/domain/shared/locale";
import { THEME_INIT_SCRIPT } from "@/presentation/components/ThemeToggle";
import "../globals.css";

/**
 * Direction A 의 콘텐츠 헤드라인 서체.
 *
 * 컨트롤 서체는 Toss Product Sans 지만 **재배포 권리가 확인되지 않아 호스팅하지 않는다.**
 * 폰트 스택에 선언만 해 두고 설치된 환경에서만 쓰이며 나머지는 Pretendard 로 폴백한다.
 */
const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Your Seoul",
  description: "A small, edited selection of Seoul. Not a directory.",
};

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export default async function LocaleLayout({ children, params }: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  return (
    <html
      lang={locale}
      className={`${newsreader.variable} h-full antialiased`}
      /*
        theme-init 스크립트가 하이드레이션 **전에** data-theme 를 붙인다.
        서버 HTML 에는 그 속성이 없으므로 React 가 불일치로 잡는데, 이건 의도된 것이다.
        suppressHydrationWarning 은 이 엘리먼트의 속성 한 겹만 덮으므로 자식의 진짜
        불일치는 그대로 드러난다.
      */
      suppressHydrationWarning
    >
      <head>
        {/* 본문·컨트롤은 Pretendard 폴백. Toss Product Sans 는 재배포 권리 미확인이라 싣지 않는다 */}
        <link rel="preconnect" href="https://cdn.jsdelivr.net" crossOrigin="" />
        {/*
          저장된 테마 선택을 첫 페인트 전에 적용해 깜빡임을 막는다.
          **맨 <script> 태그를 쓰지 않는다** — React 가 클라이언트 렌더에서 실행하지 않아
          Next.js 16 이 콘솔 에러로 잡는다. 인라인 스크립트는 next/script 로 넣고
          `id` 를 반드시 준다 (문서: "An id property must be assigned for inline scripts").
        */}
        <Script
          id="theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }}
        />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
      </head>
      <body className="flex min-h-full flex-col bg-canvas text-ink">{children}</body>
    </html>
  );
}
