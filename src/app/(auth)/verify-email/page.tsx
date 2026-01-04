"use client";

import { FormEvent, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function VerifyEmailPage() {
  const params = useSearchParams();
  const token = params.get("token") || "";
  const [message, setMessage] = useState<string | null>(token ? null : "Enter your verification token.");
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/auth/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: form.get("token") })
    });
    if (res.ok) {
      setMessage("Email verified. You can sign in now.");
    } else {
      setError("Invalid or expired token.");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 dark:bg-slate-950">
      <form onSubmit={onSubmit} className="card w-full max-w-md space-y-4">
        <h1 className="text-2xl font-bold">Verify email</h1>
        <input name="token" defaultValue={token} required placeholder="Verification token" className="w-full rounded-lg border px-3 py-2" />
        {message && <p className="text-sm text-green-600">{message}</p>}
        {error && <p className="text-sm text-red-500">{error}</p>}
        <button className="btn-primary w-full" type="submit">
          Verify
        </button>
      </form>
    </div>
  );
}
