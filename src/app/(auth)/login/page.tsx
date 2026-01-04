"use client";

import { signIn } from "next-auth/react";
import { FormEvent, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const params = useSearchParams();

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const form = new FormData(e.currentTarget);
    const res = await signIn("credentials", {
      email: form.get("email"),
      password: form.get("password"),
      otp: form.get("otp"),
      callbackUrl: "/dashboard",
      redirect: false
    });
    if (res?.error) {
      setError(res.error);
    } else {
      window.location.href = "/dashboard";
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 dark:bg-slate-950">
      <form onSubmit={onSubmit} className="card w-full max-w-md space-y-4">
        <h1 className="text-2xl font-bold">Sign in</h1>
        {params.get("registered") && <p className="text-sm text-green-600">Account created. Check email for verification.</p>}
        <input name="email" required type="email" placeholder="Email" className="w-full rounded-lg border px-3 py-2" />
        <input name="password" required type="password" placeholder="Password" className="w-full rounded-lg border px-3 py-2" />
        <input name="otp" placeholder="2FA code (premium)" className="w-full rounded-lg border px-3 py-2" />
        {error && <p className="text-sm text-red-500">{error}</p>}
        <button className="btn-primary w-full" type="submit">
          Sign in
        </button>
        <button
          type="button"
          className="btn w-full border border-slate-200 dark:border-slate-700"
          onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
        >
          Continue with Google
        </button>
      </form>
    </div>
  );
}
