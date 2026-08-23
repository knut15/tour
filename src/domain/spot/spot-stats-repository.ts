import type { SpotStats, SpotStatsKey } from "@/domain/spot/spot-stats";

/**
 * 반응을 세고 기록하는 곳.
 *
 * **여러 장소를 한 번에 읽는다.** 목록 한 화면에 열두 장이 서므로 카드마다 한 번씩
 * 물으면 열두 번이 된다. 카드가 스스로 자기 수를 가져오게 두면 그 구조가 되기
 * 쉬워서, 읽기는 아예 묶음으로만 열어 둔다.
 *
 * 쓰기는 **누가 눌렀는지**를 함께 받는다. 같은 사람이 여러 번 눌러도 하나로
 * 세려면 방문자를 구분해야 한다. 로그인 전에는 브라우저가 만든 익명 id 다.
 */
export interface SpotStatsRepository {
  /**
   * 주어진 장소들의 반응. **없는 장소는 결과에서 빠진다.**
   *
   * 0 을 채워 돌려주지 않는 이유는 "아무도 안 눌렀다" 와 "저장소가 답을 못 했다" 를
   * 부르는 쪽이 구분할 수 있어야 해서다.
   */
  findMany(keys: readonly SpotStatsKey[]): Promise<Map<SpotStatsKey, SpotStats>>;

  /**
   * 반응이 가장 많은 장소의 키를 **많은 순서대로** 돌려준다.
   *
   * **좋아요가 먼저다.** 조회는 지나간 것만으로도 오르지만 좋아요는 누른 것이다 —
   * 둘을 더하면 조회 수가 훨씬 커서 좋아요는 사실상 반영되지 않는다. 좋아요로 세우고
   * 같으면 조회로 가른다.
   *
   * 아직 아무도 누르지 않은 장소는 저장소에 행이 없으므로 여기 나오지 않는다.
   */
  findTopKeys(limit: number): Promise<SpotStatsKey[]>;

  /** 이 방문자가 좋아요를 누른 장소들 */
  findLikedBy(visitorId: string, keys: readonly SpotStatsKey[]): Promise<Set<SpotStatsKey>>;

  /**
   * 좋아요를 켜거나 끈다. 결과는 **바뀐 뒤의 총수와 내 상태**다.
   *
   * 눌린 상태를 인자로 받지 않는다 — 화면이 아는 상태와 저장소의 상태가 어긋날 수
   * 있고(다른 기기에서 눌렀다면), 그때 화면 말을 믿으면 수가 틀어진다.
   */
  toggleLike(key: SpotStatsKey, visitorId: string): Promise<{ likes: number; liked: boolean }>;

  /**
   * 조회를 기록한다. **같은 방문자의 같은 날 조회는 한 번만 센다.**
   *
   * 새로고침마다 오르면 수가 사람이 아니라 새로고침을 세게 된다. 하루로 묶는
   * 것은 임의의 값이지만, "며칠에 걸쳐 여러 번 본 장소" 는 실제로 더 본 것이 맞다.
   */
  recordView(key: SpotStatsKey, visitorId: string): Promise<void>;
}
