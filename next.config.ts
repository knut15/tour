import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /*
   * 커버 렌더가 `assets/fonts/` 의 한글 서브셋을 fs 로 읽는다. 경로를 런타임에
   * 만들기 때문에 Next 의 파일 트레이싱이 스스로 찾지 못한다 — 명시하지 않으면
   * 배포된 함수에 폰트가 빠져 커버가 네모(tofu)로 그려진다.
   */
  outputFileTracingIncludes: {
    "/api/og": ["./assets/fonts/**"],
  },
};

export default nextConfig;
