export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-950 text-white">
      <div className="text-center space-y-6 px-6">
        <h1 className="text-5xl font-bold tracking-tight">Re-Entry</h1>
        <p className="text-lg text-gray-400 max-w-xl mx-auto">
          Resident Management &amp; Employment Pass System
        </p>
        <div className="flex gap-4 justify-center pt-4">
          <a
            href="/login"
            className="rounded-lg bg-white px-6 py-3 text-sm font-semibold text-gray-950 hover:bg-gray-200 transition-colors"
          >
            Staff Login
          </a>
        </div>
        <p className="text-xs text-gray-600 pt-8">
          Phase 1 — Project scaffold complete. Database schema defined.
        </p>
      </div>
    </main>
  );
}
