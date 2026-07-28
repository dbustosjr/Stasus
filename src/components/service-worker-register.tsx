"use client";

import { useEffect } from "react";

/** Registers the service worker for Add to Home Screen / offline shell. No install UI. */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      window.localStorage.removeItem("stasus-theme");
    } catch {
      // ignore
    }

    if (!("serviceWorker" in navigator)) {
      return;
    }

    // Dev: never register — cached "/" + HMR was causing landing hydration flips.
    if (process.env.NODE_ENV === "development") {
      navigator.serviceWorker.getRegistrations().then((regs) => {
        for (const reg of regs) {
          void reg.unregister();
        }
      });
      return;
    }

    const register = () => {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // Silent failure — browsing still works without SW.
      });
    };

    if (document.readyState === "complete") {
      register();
    } else {
      window.addEventListener("load", register, { once: true });
    }
  }, []);

  return null;
}
