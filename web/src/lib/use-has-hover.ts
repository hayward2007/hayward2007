"use client";

import { useSyncExternalStore } from "react";

const QUERY = "(hover: hover) and (pointer: fine)";

function subscribe(callback: () => void) {
  const mq = window.matchMedia(QUERY);
  mq.addEventListener("change", callback);
  return () => mq.removeEventListener("change", callback);
}

function getSnapshot() {
  return window.matchMedia(QUERY).matches;
}

function getServerSnapshot() {
  return false;
}

// Mirrors the reference site's window.__hasHover gate: prevents hover styles
// from sticking after a tap on touch/hybrid devices.
export function useHasHover() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
