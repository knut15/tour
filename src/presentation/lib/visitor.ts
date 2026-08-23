"use client";

/**
 * 이 브라우저를 가리키는 익명 id.
 *
 * 로그인이 없으므로 "같은 사람이 두 번 누른 것" 을 이것으로 가른다. 계정이
 * 생기면 이 값을 계정에 붙여 옮기면 되고, 그때까지도 같은 브라우저에서는
 * 중복이 막힌다.
 *
 * **추적용이 아니다.** 무작위로 만들어 이 브라우저에만 두고, 서버는 그것이
 * 누구인지 알 방법이 없다. 사용자가 저장소를 비우면 새 id 가 되고, 그때
 * 이전에 누른 좋아요는 "내가 누른 것" 목록에서 빠진다 — 총수는 그대로다.
 */
const KEY = "seoul-tour:visitor";

export function visitorId(): string {
  try {
    const saved = localStorage.getItem(KEY);
    if (saved) return saved;
    const fresh = crypto.randomUUID();
    localStorage.setItem(KEY, fresh);
    return fresh;
  } catch {
    /*
      사생활 모드 등 저장소를 못 쓰는 환경. 빈 문자열을 돌려주면 부르는 쪽이
      요청을 보내지 않는다 — 매번 새 id 를 만들어 보내면 한 사람이 새로고침할
      때마다 다른 사람으로 세어져 수가 부풀려진다.
    */
    return "";
  }
}
