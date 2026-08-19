"use client";

import { useEffect, useRef, useState } from "react";
import { NoImage, type NoImageSize } from "@/presentation/components/NoImage";

/**
 * 사진을 띄우되, **실패하면 깨진 아이콘 대신 `NoImage` 로 갈아탄다.**
 *
 * URL 이 없는 경우는 서버에서 곧바로 `NoImage` 를 그리면 되므로 여기 오지 않는다.
 * 이 컴포넌트가 맡는 것은 **URL 은 있는데 안 뜨는 경우**다 — TourAPI 의
 * `firstimage` 는 원본이 내려간 뒤에도 값이 남아 있어서 404 가 흔하다.
 */
export function SpotImage({
  src,
  alt,
  noImageLabel,
  size = "sm",
  priority = false,
}: {
  src: string;
  alt: string;
  noImageLabel: string;
  size?: NoImageSize;
  priority?: boolean;
}) {
  const [failed, setFailed] = useState(false);
  const ref = useRef<HTMLImageElement>(null);

  /**
   * `onError` 만으로는 못 잡는 구멍이 있다. 서버가 그린 `<img>` 는 하이드레이션
   * 전에 로드를 끝내기도 하는데, 그때 발생한 error 이벤트는 리스너가 붙기 전에
   * 지나가 버린다. 이미 끝난 이미지는 `complete && naturalWidth === 0` 으로
   * 실패를 되짚을 수 있다.
   */
  useEffect(() => {
    const el = ref.current;
    if (el?.complete && el.naturalWidth === 0) setFailed(true);
  }, []);

  if (failed) return <NoImage label={noImageLabel} size={size} />;

  return (
    // 크롭하지 않는다. 이미지의 82% 가 변경금지(cpyrhtDivCd=Type3)다
    // eslint-disable-next-line @next/next/no-img-element
    <img
      ref={ref}
      src={src}
      alt={alt}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      onError={() => setFailed(true)}
      className="h-full w-full object-contain"
    />
  );
}
