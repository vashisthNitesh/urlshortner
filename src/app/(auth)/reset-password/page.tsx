"use client";

import { FormEvent, useState } from "react";

export default function ResetPasswordPage() {
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage(null);
    setError(null);
    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/auth/reset", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: form.get("email") })
    });
    if (res.ok) {
      setMessage("If the email exists, a reset link was sent.");
    } else {
      setError("Unable to send reset instructions");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 dark:bg-slate-950">
      <form onSubmit={onSubmit} className="card w-full max-w-md space-y-4">
        <h1 className="text-2xl font-bold">Reset password</h1>
        <input name="email" required type="email" placeholder="Email" className="w-full rounded-lg border px-3 py-2" />
        {message && <p className="text-sm text-green-600">{message}</p>}
        {error && <p className="text-sm text-red-500">{error}</p>}
        <button className="btn-primary w-full" type="submit">
          Send reset link
        </button>
      </form>
    </div>
  );
}
