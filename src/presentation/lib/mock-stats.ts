/**
 * 카드에 붙는 좋아요·조회 수 — **목 데이터다.**
 *
 * 실제 출처가 없다. 확인한 것:
 * - TourAPI `areaBasedList2` · `detailCommon2` 응답에 조회수·좋아요 필드가 없다
 * - Supabase 는 `.env.local` 에 값만 있고 패키지도 테이블도 없다
 *
 * 그래서 스팟 키에서 만든 값을 쓴다. **같은 스팟은 늘 같은 수를 보인다** —
 * 난수를 쓰면 새로고침마다 숫자가 바뀌어 목이라는 사실이 티가 나기 전에
 * 화면이 고장 난 것처럼 보인다. 서버와 클라이언트가 같은 값을 내야 하는 이유도 같다.
 *
 * 실제 카운트를 붙일 때 이 파일을 지우고 `SpotView` 에 값을 실어 오면 된다.
 * 지금 화면이 참조하는 곳은 `SpotFrame` 한 곳뿐이다.
 */

/** 문자열 → 32비트 정수. FNV-1a. 짧고 결과가 고르게 퍼진다 */
function hash(input: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

export type SpotStats = {
  likes: number;
  views: number;
};

/**
 * 좋아요는 12~999, 조회는 그 40~120배.
 *
 * 조회가 좋아요보다 훨씬 큰 것은 실제 서비스의 비율을 흉내 낸 것이다.
 * 둘이 비슷하면 숫자 두 개를 나란히 둘 이유가 없어 보인다.
 */
export function mockStats(spotKey: string): SpotStats {
  const h = hash(spotKey);
  const likes = 12 + (h % 988);
  const ratio = 40 + ((h >>> 10) % 81);
  return { likes, views: likes * ratio };
}
