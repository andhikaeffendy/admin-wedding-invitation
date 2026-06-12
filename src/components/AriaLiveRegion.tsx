"use client";
import { useEffect, useRef, useState } from "react";

/**
 * AriaLiveRegion — accessible live region for dynamic content announcements.
 *
 * Usage:
 *   const [announce] = useAriaLive();
 *   announce("Tamu berhasil ditambahkan");
 */

let globalAnnounce: ((msg: string) => void) | null = null;
let globalClear: (() => void) | null = null;

export function AriaLiveRegion() {
  const [message, setMessage] = useState("");
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    globalAnnounce = (msg: string) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      setMessage("");
      requestAnimationFrame(() => {
        setMessage(msg);
        setVisible(true);
        timerRef.current = setTimeout(() => setVisible(false), 5000);
      });
    };
    globalClear = () => {
      setMessage("");
      setVisible(false);
    };
    return () => {
      globalAnnounce = null;
      globalClear = null;
    };
  }, []);

  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className={`fixed bottom-4 left-1/2 -translate-x-1/2 z-[150] pointer-events-none transition-all duration-300 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
      }`}
    >
      <span className="inline-block bg-[#22382D] text-white px-4 py-2 rounded-full text-sm shadow-lg">
        {message}
      </span>
    </div>
  );
}

export function useAriaLive() {
  const announce = (msg: string) => {
    if (globalAnnounce) globalAnnounce(msg);
  };
  const clear = () => {
    if (globalClear) globalClear();
  };
  return { announce, clear };
}
