"use client";

import { useEffect } from "react";

/** Captures ?ref=CODE from the URL into a cookie for use at signup. */
export function RefCapture() {
  useEffect(() => {
    const ref = new URLSearchParams(window.location.search).get("ref");
    if (ref && /^[A-Za-z0-9]{4,12}$/.test(ref)) {
      document.cookie = `floby_ref=${encodeURIComponent(ref)}; path=/; max-age=2592000; samesite=lax`;
    }
  }, []);
  return null;
}
