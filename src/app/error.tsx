"use client";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-full items-center justify-center px-4">
      <div className="card max-w-lg p-6">
        <h1 className="text-xl font-semibold">This page could not load</h1>
        <p className="mt-2 text-sm text-slate-600">
          {error.message || "A server error occurred. Check the Vercel environment variables and run the Supabase SQL file."}
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-5 rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
