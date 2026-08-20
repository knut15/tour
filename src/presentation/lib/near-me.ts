"use client";

import { useCallback, useSyncExternalStore } from "react";
import type { Coordinate } from "@/domain/spot/coordinate";

/**
 * 브라우저에만 사는 "지금 내 위치".
 *
 * **한 번만 받아 모든 카드가 나눠 쓴다.** 카드마다 `getCurrentPosition` 을 부르면
 * 화면에 보이는 수만큼 위치 요청이 나가고, 그 각각이 GPS 를 깨운다.
 *
 * **먼저 묻지 않는다.** 페이지를 열자마자 권한 창을 띄우면 아직 이 앱이 뭘 하는지도
 * 모르는 사람에게 위치부터 요구하는 꼴이다. 사용자가 켠 적이 있고(`선호도`)
 * 브라우저가 이미 허가한 상태(`granted`)일 때만 조용히 다시 받는다.
 * 그 외에는 사용자가 직접 켤 때까지 아무 일도 하지 않는다.
 */
export type NearMeStatus =
  /** 꺼져 있다. 사용자가 켠 적이 없거나 껐다 */
  | "off"
  /** 위치를 받는 중 */
  | "asking"
  /** 위치를 갖고 있다 */
  | "on"
  /** 사용자가 브라우저 권한 창에서 거부했다. 다시 물어도 창이 뜨지 않는다 */
  | "denied"
  /** 이 브라우저에 geolocation 이 없다 */
  | "unsupported";

const PREFERENCE_KEY = "seoul-tour:near-me";
const EVENT = "seoul-tour:near-me-changed";

let status: NearMeStatus = "off";
let position: Coordinate | null = null;
let autoStarted = false;

/**
 * `useSyncExternalStore` 에 줄 스냅샷.
 *
 * **문자열이어야 한다.** 매번 새 객체를 만들면 참조가 달라져 무한 렌더가 된다
 * (`personal-set.ts` 가 같은 이유로 원문 문자열을 돌려준다).
 */
let snapshot = "off||";

const listeners = new Set<() => void>();

function publish() {
  snapshot = `${status}|${position?.lng ?? ""}|${position?.lat ?? ""}`;
  for (const l of listeners) l();
  // 다른 컴포넌트 트리(있다면)도 따라오도록 창 이벤트로도 알린다
  window.dispatchEvent(new Event(EVENT));
}

function setStatus(next: NearMeStatus, coord: Coordinate | null = null) {
  status = next;
  position = coord;
  publish();
}

function readPreference(): boolean {
  try {
    return window.localStorage.getItem(PREFERENCE_KEY) === "1";
  } catch {
    return false;
  }
}

function writePreference(on: boolean) {
  try {
    window.localStorage.setItem(PREFERENCE_KEY, on ? "1" : "0");
  } catch {
    // 저장 실패는 이번 방문에만 영향을 준다. 기능 자체는 계속 동작한다
  }
}

function acquire() {
  if (!("geolocation" in navigator)) {
    setStatus("unsupported");
    return;
  }
  setStatus("asking");
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      setStatus("on", { lng: pos.coords.longitude, lat: pos.coords.latitude });
    },
    (err) => {
      // 거부는 되돌릴 수 없다(브라우저가 다시 묻지 않는다). 그래서 상태를 구분해 둔다
      setStatus(err.code === err.PERMISSION_DENIED ? "denied" : "off");
    },
    {
      /*
        거리를 100m 단위로 보여 주는 데 고정밀 GPS 는 필요 없다. 켜면 실내에서
        수 초씩 걸리고 배터리를 쓴다. 5분 안에 받아 둔 값이 있으면 그대로 쓴다.
      */
      enableHighAccuracy: false,
      timeout: 10_000,
      maximumAge: 300_000,
    },
  );
}

/**
 * 이전 방문에 켜 뒀고 브라우저 권한이 아직 살아 있으면 조용히 다시 받는다.
 *
 * `permissions` 조회를 먼저 하는 것이 핵심이다. 바로 `getCurrentPosition` 을 부르면
 * 권한이 `prompt` 상태일 때 **창이 뜬다** — 사용자가 켠 적 없는데 묻는 셈이 된다.
 */
function autoStart() {
  if (autoStarted) return;
  autoStarted = true;
  if (!readPreference()) return;
  if (!("geolocation" in navigator)) {
    setStatus("unsupported");
    return;
  }
  if (!navigator.permissions?.query) {
    // 조회할 방법이 없는 브라우저. 켠 적이 있다는 기록을 믿는다
    acquire();
    return;
  }
  navigator.permissions
    .query({ name: "geolocation" })
    .then((p) => {
      if (p.state === "granted") acquire();
      else if (p.state === "denied") setStatus("denied");
    })
    .catch(() => acquire());
}

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  window.addEventListener(EVENT, onChange);
  autoStart();
  return () => {
    listeners.delete(onChange);
    window.removeEventListener(EVENT, onChange);
  };
}

/** 서버에는 위치가 없다. 꺼진 상태로 그리고 hydration 후 맞춘다 */
const readServer = () => "off||";

function parse(raw: string): { status: NearMeStatus; position: Coordinate | null } {
  const [s, lng, lat] = raw.split("|");
  return {
    status: s as NearMeStatus,
    position: lng && lat ? { lng: Number(lng), lat: Number(lat) } : null,
  };
}

export function useNearMe() {
  const raw = useSyncExternalStore(subscribe, () => snapshot, readServer);
  const parsed = parse(raw);

  const enable = useCallback(() => {
    writePreference(true);
    acquire();
  }, []);

  const disable = useCallback(() => {
    writePreference(false);
    setStatus("off");
  }, []);

  return { ...parsed, enable, disable };
}
