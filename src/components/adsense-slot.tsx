"use client";

import { useEffect } from "react";

type Props = {
  slot: string;
  className?: string;
};

export function AdSenseSlot({ slot, className }: Props) {
  useEffect(() => {
    try {
      // @ts-ignore
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      // ignore
    }
  }, []);

  return (
    <ins
      className={`adsbygoogle block rounded-lg bg-slate-100 text-center text-xs text-slate-500 dark:bg-slate-800 ${className || ""}`}
      style={{ display: "block" }}
      data-ad-client={process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || "ca-pub-xxxxx"}
      data-ad-slot={slot}
      data-full-width-responsive="true"
    >
      <span className="block p-4">Ad slot</span>
    </ins>
  );
}
