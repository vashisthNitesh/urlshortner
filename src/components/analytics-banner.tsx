"use client";

import Link from "next/link";
import { useState } from "react";

export function AnalyticsBanner() {
  const [visible, setVisible] = useState(true);
  if (!visible) return null;
  return (
    <div className="bg-gradient-to-r from-primary to-secondary px-4 py-2 text-sm text-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-2">
        <p className="font-medium">
          GDPR-friendly analytics with bot filtering and privacy-first defaults. Learn how we keep data safe.
        </p>
        <div className="flex items-center gap-2">
          <Link href="/privacy" className="underline">
            Privacy
          </Link>
          <button className="rounded bg-white/20 px-2 py-1 text-white" onClick={() => setVisible(false)}>
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}
