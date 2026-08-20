/// <reference types="react/canary" />

/*
 * `<ViewTransition>` 의 타입을 켠다.
 *
 * App Router 는 React canary 채널로 돌아가고 (`next/dist/compiled/react` 에
 * `ViewTransition` 이 실제로 있다 — 실측 2026-08-20), `react@19.2.8` 의 공개
 * 타입에는 그것이 안정 API 로 올라와 있지 않다. `@types/react` 는 canary 전용
 * 선언을 `react/canary` 에 따로 두고, 프로젝트 어디든 한 번 참조하면 켜지게 해 뒀다.
 *
 * **파일 안에 `import`/`export` 를 두지 않는다.** 하나라도 있으면 이 파일이 모듈이
 * 되어 전역 선언이 아니라 그 모듈 안의 선언이 되고, 참조가 프로젝트에 퍼지지 않는다.
 */
