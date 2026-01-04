"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";

export default function NewLinkPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [passwordEnabled, setPasswordEnabled] = useState(false);
  const [utm, setUtm] = useState({ source: "", medium: "", campaign: "", term: "", content: "" });

  const utmQuery = useMemo(() => {
    const params = new URLSearchParams();
    Object.entries(utm).forEach(([k, v]) => v && params.append(`utm_${k}`, v));
    return params.toString();
  }, [utm]);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const form = new FormData(e.currentTarget);
    const url = `${form.get("url")}${utmQuery ? (String(form.get("url")).includes("?") ? "&" : "?") + utmQuery : ""}`;
    const res = await fetch("/api/links", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        url,
        slug: form.get("slug"),
        title: form.get("title"),
        password: passwordEnabled ? form.get("password") : undefined,
        expiresAt: form.get("expiresAt"),
        utm,
        recaptcha: form.get("recaptcha")
      })
    });
    if (res.ok) {
      router.push("/dashboard");
    } else {
      const data = await res.json();
      setError(data.error || "Failed to create link");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 dark:bg-slate-950">
      <form onSubmit={onSubmit} className="card w-full max-w-3xl space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">New link</h1>
          <button type="button" className="btn" onClick={() => router.back()}>
            Close
          </button>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <input name="url" required placeholder="Destination URL" className="rounded-lg border px-3 py-2" />
          <input name="slug" required placeholder="Custom slug" className="rounded-lg border px-3 py-2" />
          <input name="title" placeholder="Title" className="rounded-lg border px-3 py-2" />
          <input name="expiresAt" type="datetime-local" className="rounded-lg border px-3 py-2" />
        </div>
        <div className="grid gap-3 md:grid-cols-5">
          {(["source", "medium", "campaign", "term", "content"] as const).map((key) => (
            <input
              key={key}
              value={utm[key]}
              onChange={(e) => setUtm((prev) => ({ ...prev, [key]: e.target.value }))}
              placeholder={`utm_${key}`}
              className="rounded-lg border px-3 py-2"
            />
          ))}
        </div>
        <div className="flex items-center gap-2">
          <input type="checkbox" id="passwordEnabled" checked={passwordEnabled} onChange={(e) => setPasswordEnabled(e.target.checked)} />
          <label htmlFor="passwordEnabled">Password protect</label>
          {passwordEnabled && <input name="password" type="password" placeholder="Password" className="rounded-lg border px-3 py-2" />}
        </div>
        <input name="recaptcha" placeholder="reCAPTCHA token for free tier" className="rounded-lg border px-3 py-2" />
        {error && <p className="text-sm text-red-500">{error}</p>}
        <div className="flex flex-wrap items-center gap-2">
          <button className="btn-primary" type="submit">
            Create link
          </button>
          {utmQuery && <span className="rounded bg-slate-100 px-3 py-1 text-xs font-semibold dark:bg-slate-800">UTM Preview: {utmQuery}</span>}
        </div>
      </form>
    </div>
  );
}
