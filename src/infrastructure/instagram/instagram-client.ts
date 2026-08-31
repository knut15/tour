import "server-only";

import type { InstagramConfig } from "@/infrastructure/config/env";

/**
 * 인스타 콘텐츠 발행 API.
 *
 * **발행은 2단계다.** 컨테이너를 만들고(`POST /{ig-id}/media`), 그것을 발행한다
 * (`POST /{ig-id}/media_publish`). 캐러셀은 3단계 — 장마다 컨테이너를 만들고,
 * 그것들을 묶는 컨테이너를 하나 더 만든 뒤, 그 묶음을 발행한다.
 *
 * 문서에서 확인한 제약(2026-08-31):
 * - 이미지는 **JPEG 만**, **공개 URL** 이어야 한다. 업로드가 없다
 * - 캐러셀은 **최대 10장**
 * - 24시간에 **100건**
 * - 컨테이너는 **24시간** 안에 발행하지 않으면 만료된다
 * - **예약 발행이 없다.** 언제 부를지는 부르는 쪽이 정한다
 */

const BASE = "https://graph.instagram.com/v23.0";

/** 캐러셀 상한. 넘겨 보내면 API 가 거절하므로 부르기 전에 자른다 */
export const MAX_CAROUSEL_ITEMS = 10;

export class InstagramError extends Error {
  constructor(
    message: string,
    readonly operation: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "InstagramError";
  }
}

type ContainerId = string;

export class InstagramClient {
  constructor(private readonly config: InstagramConfig) {}

  private async post(path: string, params: Record<string, string>, operation: string) {
    const body = new URLSearchParams({ ...params, access_token: this.config.accessToken });
    const res = await fetch(`${BASE}/${path}`, { method: "POST", body });
    const text = await res.text();

    let json: { id?: string; error?: { message?: string } };
    try {
      json = JSON.parse(text) as typeof json;
    } catch {
      throw new InstagramError(text.slice(0, 300), operation, res.status);
    }
    if (!res.ok || json.error || !json.id) {
      throw new InstagramError(json.error?.message ?? text.slice(0, 300), operation, res.status);
    }
    return json.id;
  }

  /**
   * 24시간 안에 몇 건을 썼는지. **발행 전에 확인한다** —
   * 문서가 앱이 직접 한도를 지키라고 요구한다.
   */
  async quotaUsage(): Promise<{ used: number; total: number } | null> {
    const url = new URL(`${BASE}/${this.config.userId}/content_publishing_limit`);
    url.searchParams.set("fields", "config,quota_usage");
    url.searchParams.set("access_token", this.config.accessToken);
    const res = await fetch(url);
    if (!res.ok) return null;
    const json = (await res.json()) as {
      data?: { config?: { quota_total?: number }; quota_usage?: number }[];
    };
    const row = json.data?.[0];
    if (!row) return null;
    return { used: row.quota_usage ?? 0, total: row.config?.quota_total ?? 100 };
  }

  /**
   * 캐러셀 한 장. `isCarouselItem` 이 붙은 컨테이너는 혼자 발행되지 않는다.
   *
   * `altText` 를 채운다 — 화면을 읽어 주는 사람에게 사진이 무엇인지 남기는 값이고,
   * 이 계정은 장소를 설명하는 곳이라 비워 둘 이유가 없다.
   */
  async createImageItem(imageUrl: string, altText?: string): Promise<ContainerId> {
    return this.post(
      `${this.config.userId}/media`,
      {
        image_url: imageUrl,
        is_carousel_item: "true",
        ...(altText ? { alt_text: altText } : {}),
      },
      "createImageItem",
    );
  }

  /** 장들을 묶는 컨테이너. 캡션은 **여기** 붙는다 — 낱장이 아니다 */
  async createCarousel(children: ContainerId[], caption: string): Promise<ContainerId> {
    if (children.length < 2) {
      throw new InstagramError("캐러셀은 2장 이상이다", "createCarousel", 0);
    }
    if (children.length > MAX_CAROUSEL_ITEMS) {
      throw new InstagramError(
        `캐러셀은 ${MAX_CAROUSEL_ITEMS}장이 상한인데 ${children.length}장이 왔다`,
        "createCarousel",
        0,
      );
    }
    return this.post(
      `${this.config.userId}/media`,
      { media_type: "CAROUSEL", children: children.join(","), caption },
      "createCarousel",
    );
  }

  /** 발행. 여기서부터 되돌릴 수 없다 */
  async publish(containerId: ContainerId): Promise<{ mediaId: string }> {
    const id = await this.post(
      `${this.config.userId}/media_publish`,
      { creation_id: containerId },
      "publish",
    );
    return { mediaId: id };
  }

  /**
   * 사진 여러 장을 캐러셀 한 건으로 발행한다.
   *
   * **장 컨테이너를 순서대로 만든다.** 병렬로 만들면 완성 순서가 뒤섞여 캐러셀
   * 순서가 흐트러질 수 있다 — 발행은 주 2회뿐이라 몇 초를 아낄 이유가 없다.
   */
  async publishCarousel(
    images: { url: string; alt?: string }[],
    caption: string,
  ): Promise<{ mediaId: string; children: ContainerId[] }> {
    const children: ContainerId[] = [];
    for (const image of images) {
      children.push(await this.createImageItem(image.url, image.alt));
    }
    const carousel = await this.createCarousel(children, caption);
    const { mediaId } = await this.publish(carousel);
    return { mediaId, children };
  }
}
