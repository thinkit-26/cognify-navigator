/**
 * "abhayishandsome" easter-egg.
 *
 * Type the magic word anywhere on the site and the app switches into
 * "alt mode": cream hero, flat gradient buttons, no shadows/hover
 * animations, login + dashboards available. Persists in localStorage.
 *
 * Type it again to turn it back off.
 */
import { useEffect, useSyncExternalStore } from "react";

const KEY = "cognify_alt_mode";
const SECRET = "7488admin";

function read(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
}

function apply(on: boolean) {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle("alt", on);
}

const listeners = new Set<() => void>();
function notify() {
  listeners.forEach((l) => l());
}

export function setAltMode(on: boolean) {
  try {
    window.localStorage.setItem(KEY, on ? "1" : "0");
  } catch {}
  apply(on);
  notify();
}

export function useAltMode(): boolean {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => read(),
    () => false,
  );
}

/** Mount once at the root. Applies persisted alt mode on load. */
export function AltModeListener() {
  useEffect(() => {
    apply(read());
  }, []);
  return null;
}

