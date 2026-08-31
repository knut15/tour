import type { Metadata } from "next";
import { DM_Sans, Newsreader } from "next/font/google";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { LOCALES, LOCALE_HTML_LANG, isLocale } from "@/domain/shared/locale";
import { THEME_COOKIE, isTheme, type Theme } from "@/presentation/lib/theme";
import { DismissOnOutside } from "@/presentation/components/DismissOnOutside";
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

/**
 * 로고 전용 서체. 시안 04 의 스탬프가 DM Sans 로 짜여 있어 다른 서체로 그리면
 * 모노그램의 글자 폭이 달라져 원 안에서 균형이 무너진다. **본문에는 쓰지 않는다.**
 */
const dmSans = DM_Sans({
  variable: "--font-stamp",
  subsets: ["latin"],
  weight: ["600"],
  display: "swap",
});

export const metadata: Metadata = {
  /*
    브랜드명 하나만 둔다. 탭에는 열 몇 자만 보이므로 설명을 붙이면 이름이 잘린다.
  */
  title: "Life is Nearby",
  description: "A small, edited selection of Korea. Not a directory.",
};

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export default async function LocaleLayout({ children, params }: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  /*
    테마 선택을 서버에서 읽어 `<html data-theme>` 로 심는다.
    인라인 스크립트를 쓰지 않으므로 React 의 "script 태그" 경고도,
    첫 페인트 깜빡임도, 하이드레이션 불일치도 없다.
    대가: `cookies()` 는 이 라우트를 동적 렌더링으로 만든다.
  */
  const stored = (await cookies()).get(THEME_COOKIE)?.value;
  /*
    **고르지 않았으면 라이트다.** 값을 비워 두면 `prefers-color-scheme` 이 정하는데,
    이 앱의 그림과 사진은 크림 바탕을 전제로 골라져 있어 OS 설정이 다크인 사람에게
    처음부터 다른 앱으로 보인다. 고른 사람의 선택은 그대로 따른다.
  */
  const theme: Theme = isTheme(stored) ? stored : "light";

  return (
    <html
      lang={LOCALE_HTML_LANG[locale]}
      className={`${newsreader.variable} ${dmSans.variable} h-full antialiased`}
      data-theme={theme}
    >
      <head>
        {/* 본문·컨트롤은 Pretendard 폴백. Toss Product Sans 는 재배포 권리 미확인이라 싣지 않는다 */}
        <link rel="preconnect" href="https://cdn.jsdelivr.net" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
      </head>
      <body
        // overflow-x: clip 은 화면 폭을 덮는 필터 바가 만드는 가로 넘침을 자른다.
        // hidden 을 쓰면 스크롤 컨테이너가 생겨 sticky 의 기준이 뷰포트에서 벗어난다
        className="flex min-h-full flex-col overflow-x-clip bg-canvas text-ink"
      >
        {children}
        {/* 열린 드롭다운을 바깥 클릭·Esc 로 닫는다. 라우트당 한 번만 얹는다 */}
        <DismissOnOutside />
      </body>
    </html>
  );
}
