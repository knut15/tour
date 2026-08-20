"use client";

import { useCallback, useSyncExternalStore } from "react";
import type { Coordinate } from "@/domain/spot/coordinate";

/**
 * 브라우저에만 사는 "지금 내 위치".
 *
 * **한 번만 받아 모든 카드가 나눠 쓴다.** 카드마다 `getCurrentPosition` 을 부르면
 * 화면에 보이는 수만큼 위치 요청이 나가고, 그 각각이 GPS 를 깨운다.
 *
 * **탐색 화면에 들어오면 한 번 묻는다.** 처음에는 사용자가 토글을 누를 때까지
 * 기다렸는데, 그러면 거리가 기본으로 보이지 않아 기능이 있다는 것 자체가 전달되지
 * 않았다 — 실제로 "붙였다는데 왜 안 보이냐" 는 말을 들었다. 마찰이 기능을 숨긴 셈이다.
 *
 * 대신 **직접 끈 사람에게는 다시 묻지 않는다.** 그래서 선호도가 세 값이다.
 * 없음(아직 정하지 않음) / 켬 / 끔. "없음" 과 "끔" 을 같게 취급하면 껐는데도
 * 방문할 때마다 권한 창이 뜬다.
 *
 * 홈 화면에서는 묻지 않는다. 이 store 는 `useNearMe` 를 부르는 컴포넌트가 붙을 때만
 * 깨어나고, 그것을 쓰는 것은 탐색 화면의 카드와 토글뿐이다.
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

/** 아직 정하지 않음 / 켬 / 끔. 셋을 구분해야 "껐다" 를 존중할 수 있다 */
type Preference = "unset" | "on" | "off";

function readPreference(): Preference {
  try {
    const v = window.localStorage.getItem(PREFERENCE_KEY);
    return v === "1" ? "on" : v === "0" ? "off" : "unset";
  } catch {
    // 저장소를 못 읽는 환경(사생활 모드 등)에서는 물어보지 않는다.
    // 껐다는 기록도 못 읽으므로, 물으면 방문할 때마다 창이 뜬다
    return "off";
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
 * 탐색 화면이 뜨면 위치를 받는다. 권한이 아직 없으면 **브라우저 창이 뜬다.**
 *
 * `permissions` 조회를 먼저 하는 이유는 이제 창을 피하기 위해서가 아니라,
 * 이미 거부된 상태를 **창 없이** 알아내기 위해서다. 거부된 뒤 `getCurrentPosition`
 * 을 부르면 콜백이 올 때까지 토글이 "위치 확인 중…" 에 머문다 — 사용자가 이미
 * 답을 준 질문에 로딩을 보여 주는 셈이다.
 */
function autoStart() {
  if (autoStarted) return;
  autoStarted = true;
  // 직접 끈 사람에게는 다시 묻지 않는다. 그것만이 자동 요청을 막는 조건이다
  if (readPreference() === "off") return;
  if (!("geolocation" in navigator)) {
    setStatus("unsupported");
    return;
  }
  if (!navigator.permissions?.query) {
    acquire();
    return;
  }
  navigator.permissions
    .query({ name: "geolocation" })
    .then((p) => {
      if (p.state === "denied") setStatus("denied");
      else acquire();
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
