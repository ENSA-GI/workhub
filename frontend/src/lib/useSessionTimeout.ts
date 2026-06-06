import { useEffect, useCallback } from "react";
import { clearAuthSession, touchActivity, refreshTokenIfNeeded } from "./identityApi";

const INACTIVITY_MS = 30 * 60 * 1000;
const CHECK_INTERVAL_MS = 60 * 1000;

export function useSessionTimeout(onTimeout: () => void) {
  const checkTimeout = useCallback(async () => {
    const token = localStorage.getItem("workhub.token");
    if (!token) return;

    const lastActivity = Number(localStorage.getItem("workhub.lastActivity") || "0");
    const elapsed = Date.now() - lastActivity;

    if (elapsed >= INACTIVITY_MS) {
      clearAuthSession();
      onTimeout();
      return;
    }

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      const exp = payload.exp * 1000;
      if (Date.now() >= exp - 60000) {
        const refreshed = await refreshTokenIfNeeded();
        if (!refreshed) onTimeout();
      }
    } catch {
      clearAuthSession();
      onTimeout();
    }
  }, [onTimeout]);

  useEffect(() => {
    const onActivity = () => touchActivity();
    const events = ["mousedown", "keydown", "scroll", "touchstart"] as const;
    events.forEach((e) => window.addEventListener(e, onActivity));

    const interval = setInterval(checkTimeout, CHECK_INTERVAL_MS);
    checkTimeout();

    return () => {
      events.forEach((e) => window.removeEventListener(e, onActivity));
      clearInterval(interval);
    };
  }, [checkTimeout]);
}
