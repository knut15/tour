import Image from "next/image";

/**
 * lifeisnearby 브랜드 로고 — 정본은 docs/brand/ 의 refined-v2 계열이고,
 * public/brand/ 의 투명 배경 사본을 그대로 렌더링한다.
 *
 * PNG 라 워드마크 색이 파일에 박혀 있어 라이트용(짙은 네이비)과 다크용(밝은 잉크,
 * 워드마크만 재채색·심볼 동일) 두 변형을 함께 그리고, 어느 쪽을 보일지는
 * globals.css 의 `--brand-logo-light` / `--brand-logo-dark` 변수(테마 세 갈래에서
 * 재선언)가 정한다. 원본 캔버스에 여백이 커서 표시 높이를 글자 크기보다 크게 잡는다.
 */
const LOGO_LIGHT = "/brand/lifeisnearby-logo-refined-v2.png";
const LOGO_DARK = "/brand/lifeisnearby-logo-refined-v2-dark.png";
const LOGO_W = 1672;
const LOGO_H = 941;

function LogoPair({ className }: { className: string }) {
  return (
    <>
      <Image
        src={LOGO_LIGHT}
        alt=""
        width={LOGO_W}
        height={LOGO_H}
        priority
        className={`brand-logo-light ${className}`}
      />
      <Image
        src={LOGO_DARK}
        alt=""
        width={LOGO_W}
        height={LOGO_H}
        priority
        className={`brand-logo-dark ${className}`}
      />
    </>
  );
}

export function BrandMark({ className = "" }: { className?: string }) {
  return <LogoPair className={`h-[1.9em] w-auto ${className}`} />;
}

export function BrandSymbol({ className = "" }: { className?: string }) {
  return <LogoPair className={className} />;
}
