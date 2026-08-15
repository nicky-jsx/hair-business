"use client";

import { useEffect, useState } from "react";

export function SplashScreen() {
  const [show, setShow] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Check if this is a standalone PWA launch
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as Navigator & { standalone?: boolean }).standalone;

    if (!isStandalone) {
      setShow(false);
      return;
    }

    // Show splash for 1.5 seconds, then fade out
    const fadeTimer = setTimeout(() => setFadeOut(true), 1200);
    const hideTimer = setTimeout(() => setShow(false), 1500);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  if (!show) return null;

  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-brand-600 transition-opacity duration-300 ${
        fadeOut ? "opacity-0" : "opacity-100"
      }`}
    >
      <div className="flex flex-col items-center gap-4">
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white text-4xl font-bold text-brand-600 shadow-lg">
          S
        </div>
        <h1 className="text-2xl font-semibold text-white">Strand</h1>
        <p className="text-sm text-brand-100">Find your perfect professional</p>
      </div>
      <div className="absolute bottom-12">
        <div className="h-1 w-16 overflow-hidden rounded-full bg-brand-500">
          <div className="h-full w-full animate-pulse bg-white" />
        </div>
      </div>
    </div>
  );
}
