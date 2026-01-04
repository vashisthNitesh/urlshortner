"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({
        email: form.get("email"),
        password: form.get("password"),
        name: form.get("name"),
        recaptcha: form.get("recaptcha")
      }),
      headers: { "Content-Type": "application/json" }
    });
    setLoading(false);
    if (res.ok) {
      router.push("/login?registered=1");
    } else {
      const data = await res.json();
      setError(data.error || "Failed to register");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 dark:bg-slate-950">
      <form onSubmit={onSubmit} className="card w-full max-w-md space-y-4">
        <h1 className="text-2xl font-bold">Create your account</h1>
        <input name="name" required placeholder="Name" className="w-full rounded-lg border px-3 py-2" />
        <input name="email" required type="email" placeholder="Email" className="w-full rounded-lg border px-3 py-2" />
        <input name="password" required type="password" placeholder="Password (min 8 chars)" className="w-full rounded-lg border px-3 py-2" />
        <input name="recaptcha" placeholder="reCAPTCHA token (if enabled)" className="w-full rounded-lg border px-3 py-2" />
        {error && <p className="text-sm text-red-500">{error}</p>}
        <button type="submit" className="btn-primary w-full" disabled={loading}>
          {loading ? "Creating..." : "Create account"}
        </button>
      </form>
    </div>
  );
}
