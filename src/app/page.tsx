export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-950 text-white">
      <div className="text-center space-y-6 px-6">
        <h1 className="text-5xl font-bold tracking-tight">Re-Entry</h1>
        <p className="text-lg text-gray-400 max-w-xl mx-auto">
          Resident Management &amp; Employment Pass System
        </p>
        <div className="flex flex-wrap gap-4 justify-center pt-4">
          <a
            href="/login"
            className="rounded-lg bg-white px-6 py-3 text-sm font-semibold text-gray-950 hover:bg-gray-200 transition-colors"
          >
            Staff Login
          </a>
          <a
            href="/api/demo/setup-front-desk"
            className="rounded-lg bg-red-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-500 transition-colors"
          >
            Demo: Start Front Desk
          </a>
          <a
            href="/api/demo/create-pass"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-md bg-amber-500 px-3 py-1.5 text-xs font-semibold text-gray-950 hover:bg-amber-400 transition-colors"
          >
            Demo: QR Pass
          </a>
        </div>
        <p className="text-xs text-gray-600 pt-8">
          Phase 1 — Project scaffold complete. Database schema defined.
        </p>
      </div>
    </main>
  );
}
