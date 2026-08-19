import type { Locale } from "@/domain/shared/locale";
import type { Category } from "@/domain/spot/category";
import type { Coordinate } from "@/domain/spot/coordinate";
import type { DistrictCode } from "@/domain/spot/district";
import type { SpotImage } from "@/domain/spot/image";

/**
 * 스팟의 이름. **영문과 한글을 함께 갖는다.**
 *
 * 화면에서 조합하지 않고 엔티티가 두 값을 함께 들고 있는다. 외국인 여행자가
 * 택시 기사에게 보여주거나 표지판과 대조해야 하므로 한글명은 보조가 아니라 동급이다.
 * 근거: GOAL.md §5-2, .curvez/architecture.md ## 권고
 */
export type SpotName = {
  /** 로케일에 맞는 표기. ko 로케일에서는 한글, en 로케일에서는 로마자 */
  readonly primary: string;
  /** 한글 원명. 영문 로케일에서도 반드시 노출한다. 없으면 null */
  readonly korean: string | null;
};

/**
 * 스팟 식별자.
 *
 * **국문과 영문의 contentid 공간은 분리돼 있다.** 같은 장소도 로케일마다 ID 가 다르고
 * 서로를 조회할 수 없다. 그래서 식별자에 로케일을 함께 담는다 — 이걸 빼면
 * 다른 로케일의 ID 로 조회를 시도하는 버그가 조용히 생긴다.
 * 근거: .curvez/research/tourapi-english-coverage.md 사실 9
 */
export type SpotId = {
  readonly contentId: string;
  readonly locale: Locale;
};

export function spotIdKey(id: SpotId): string {
  return `${id.locale}:${id.contentId}`;
}

export type Spot = {
  readonly id: SpotId;
  readonly name: SpotName;
  readonly category: Category;
  readonly address: string | null;
  readonly districtCode: DistrictCode | null;
  readonly coordinate: Coordinate | null;
  readonly image: SpotImage | null;
  readonly tel: string | null;
  /** 신분류체계 소분류. 의료관광 배제 판정에 쓴다 */
  readonly classification: string | null;
  readonly modifiedAt: string | null;
};

/**
 * 끝에 붙은 괄호 한 쌍을 **중첩까지 고려해** 잘라낸다.
 *
 * 정규식으로는 중첩을 다룰 수 없다. `金仙寺（ソウル）（금선사（서울））` 처럼
 * 한글 부분 안에 또 괄호가 있으면 매칭에 실패해 원명이 통째로 사라진다.
 * 뒤에서부터 깊이를 세며 짝을 찾는다.
 */
function splitTrailingParenthetical(
  title: string,
): { head: string; inner: string } | null {
  const t = title.trimEnd();
  const close = t[t.length - 1];
  const open = close === ")" ? "(" : close === "）" ? "（" : null;
  if (!open) return null;

  let depth = 0;
  for (let i = t.length - 1; i >= 0; i--) {
    if (t[i] === close) depth++;
    else if (t[i] === open) {
      depth--;
      if (depth === 0) {
        return {
          head: t.slice(0, i).trim(),
          inner: t.slice(i + 1, t.length - 1).trim(),
        };
      }
    }
  }
  return null;
}

const HANGUL = /[가-힣]/;

/**
 * 다국어 `title` 은 `현지어 (한글)` 형태로 번역명과 한글 원명을 함께 담는다.
 *
 * **괄호 문자가 언어마다 다르고 중첩되기도 한다.**
 *   ja  `スパレイ（스파레이）`                  ← 전각 （）
 *   ja  `金仙寺（ソウル）（금선사（서울））`        ← 전각 + 중첩
 *   ja  `崔赫(チェヒョク)韓医院 (최혁한의원)`      ← 앞쪽에 다른 괄호
 *   zh  `首爾遊覽船(서울크루즈)`                 ← 반각 ()
 *   fr  `세종마을 음식문화거리`                  ← 번역이 없으면 한글만 온다
 *
 * 끝에 붙은 괄호 한 쌍만 원명으로 본다. 그 안에 한글이 없거나 앞이 비면 원명이 아니다.
 * 근거: .curvez/research/tourapi-english-coverage.md 사실 12, 다국어 서비스 실측
 */
export function parseSpotName(rawTitle: string, locale: Locale): SpotName {
  const title = rawTitle.trim();
  if (locale === "ko") {
    return { primary: title, korean: title };
  }
  const split = splitTrailingParenthetical(title);
  if (!split) return { primary: title, korean: null };
  if (!split.head || !HANGUL.test(split.inner)) {
    return { primary: title, korean: null };
  }
  return { primary: split.head, korean: split.inner };
}

/**
 * 벽에 걸 수 있는 스팟인가.
 *
 * 두 조건을 모두 만족해야 한다.
 * 1. 이미지가 있다 — 액자 디자인의 전제다. 영문 관광지는 34%만 이미지를 갖는다
 * 2. 배제 분류가 아니다 — 의료관광(EX050800)은 관광지가 아니다
 *
 * 상세 화면은 이 판정을 적용하지 않는다. 직접 링크로 들어온 스팟은 보여준다.
 * 근거: GOAL.md §0.5, .curvez/design/index.md ## 데이터 조회 규약
 */
export function isDisplayableOnWall(spot: Spot, excluded: (c: string | null) => boolean): boolean {
  if (!spot.image) return false;
  if (excluded(spot.classification)) return false;
  return true;
}
