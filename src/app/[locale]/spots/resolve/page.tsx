import { notFound, redirect } from "next/navigation";
import { isLocale } from "@/domain/shared/locale";
import { findSpotInLocale } from "@/presentation/lib/container";

/**
 * 상세 화면에서 언어를 바꿀 때 거쳐 가는 자리.
 *
 * **로케일마다 `contentid` 공간이 분리돼 있어** 보던 스팟의 ID 를 그대로 쓸 수 없다.
 * 실측 2026-08-19: 국문 `2031668`("초안산")을 영문 서비스에 물으면 빈 결과,
 * 영문 `3566510`("Seoul Cruise")을 국문·일문에 물어도 빈 결과다.
 *
 * 그래서 두 카탈로그를 잇는 유일한 값인 **한글 원명**을 들고 와 그 언어의
 * 카탈로그에서 다시 찾는다. 찾으면 그 스팟으로, 못 찾으면 목록으로 보낸다.
 *
 * 이 화면은 아무것도 그리지 않는다. 리다이렉트만 한다 —
 * "찾는 중입니다" 를 보여줄 만큼 오래 걸리지 않고, 보여줘 봤자 할 일이 없다.
 *
 * 정적 세그먼트 `resolve` 가 형제인 `[id]` 보다 먼저 매칭된다. 스팟 ID 는 숫자라
 * `resolve` 라는 ID 와 부딪히지 않는다.
 */
export default async function ResolveSpotPage({
  params,
  searchParams,
}: PageProps<"/[locale]/spots/resolve">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const sp = await searchParams;
  const raw = Array.isArray(sp.ko) ? sp.ko[0] : sp.ko;
  const koreanName = raw?.trim();

  const listHref = `/${locale}/explore`;
  if (!koreanName) redirect(listHref);

  // 실패는 못 찾은 것과 같이 다룬다. 언어를 바꾸려던 사람에게 에러 화면을 주지 않는다
  let contentId: string | null = null;
  try {
    contentId = await findSpotInLocale(locale, koreanName);
  } catch {
    contentId = null;
  }

  redirect(contentId ? `/${locale}/spots/${contentId}` : listHref);
}
