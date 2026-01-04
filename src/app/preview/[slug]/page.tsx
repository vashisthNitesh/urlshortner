import Link from "next/link";

async function fetchPreview(slug: string) {
  const res = await fetch(`${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/redirect/${slug}?status=preview`, {
    next: { revalidate: 30 }
  });
  if (!res.ok) return null;
  return res.json();
}

export default async function PreviewPage({ params, searchParams }: { params: { slug: string }; searchParams: { domain?: string } }) {
  const data = await fetchPreview(params.slug);
  if (!data) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-slate-500">Link not found.</p>
      </div>
    );
  }
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 dark:bg-slate-950">
      <div className="card max-w-xl space-y-4 text-center">
        <p className="text-sm uppercase tracking-wide text-slate-500">Safety preview</p>
        <h1 className="text-3xl font-bold">{data.safe ? "This link looks safe" : "Link under review"}</h1>
        <p className="text-sm text-slate-500">Destination: {data.url}</p>
        <div className="flex items-center justify-center gap-3">
          <Link className="btn" href="/">
            Go home
          </Link>
          {data.safe && (
            <Link className="btn-primary" href={`/r/${params.slug}?domain=${searchParams.domain || ""}`}>
              Continue
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
