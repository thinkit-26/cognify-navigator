import { useCallback } from "react";

const FLAG = "viva_test_active";

// Keys that belong to the viva session
const VIVA_KEYS = [
  "sessionId",
  "selectedChapters",
  "selectedTopics",
  FLAG,
];

function clearAll() {
  VIVA_KEYS.forEach((k) => localStorage.removeItem(k));

  try {
    if (document.fullscreenElement) {
      document.exitFullscreen?.();
    }
  } catch {
    /* ignore */
  }
}

/**
 * Returns lock/unlock/terminate helpers for the exam flow.
 *
 * - `lockExam()`     – sets the flag, requests fullscreen
 * - `unlockExam()`   – clears all viva state, exits fullscreen
 * - `terminateExam()` – clears state, exits fullscreen, hard-navigates to gate
 */
export function useExamLock() {
  const lockExam = useCallback(() => {
    localStorage.setItem(FLAG, "1");

    try {
      document.documentElement.requestFullscreen?.();
    } catch {
      /* fullscreen not supported or denied */
    }
  }, []);

  const unlockExam = useCallback(() => {
    clearAll();
  }, []);

  const terminateExam = useCallback(() => {
    clearAll();
    window.location.href = "/viva/gate";
  }, []);

  return { lockExam, unlockExam, terminateExam };
}

export function isExamLocked(): boolean {
  return localStorage.getItem(FLAG) === "1";
}
