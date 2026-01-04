"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "pulselink-cookie-consent";

export function CookieBanner() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      setOpen(true);
    }
  }, []);

  if (!open) return null;

  return (
    <div className="fixed bottom-4 right-4 z-40 max-w-md rounded-2xl border border-slate-200 bg-white p-4 shadow-lg dark:border-slate-800 dark:bg-slate-900">
      <h3 className="text-lg font-semibold">Cookies & Ads</h3>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
        We use cookies for authentication, analytics, and AdSense. Accept to continue using the platform with ad-supported
        experience on free plans.
      </p>
      <div className="mt-3 flex items-center gap-2">
        <button
          className="btn-primary"
          onClick={() => {
            localStorage.setItem(STORAGE_KEY, "accepted");
            setOpen(false);
          }}
        >
          Accept
        </button>
        <button
          className="btn"
          onClick={() => {
            localStorage.setItem(STORAGE_KEY, "declined");
            setOpen(false);
          }}
        >
          Decline
        </button>
      </div>
    </div>
  );
}
