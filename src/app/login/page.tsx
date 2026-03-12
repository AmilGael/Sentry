"use client";

import { useActionState, useState } from "react";
import { loginAction } from "@/lib/actions/auth";

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(loginAction, {
    error: null,
  });
  const [showPassword, setShowPassword] = useState(false);

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-950 px-4">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white">Re-Entry</h1>
          <p className="mt-2 text-sm text-gray-400">
            Resident Management &amp; Employment Pass System
          </p>
        </div>

        <form action={formAction} className="space-y-5">
          {state.error && (
            <div className="rounded-lg border border-red-800 bg-red-950/50 px-4 py-3 text-sm text-red-300">
              {state.error}
            </div>
          )}

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-300"
            >
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="mt-1 block w-full rounded-lg border border-gray-700 bg-gray-900 px-4 py-2.5 text-white placeholder-gray-500 focus:border-white focus:outline-none focus:ring-1 focus:ring-white"
              defaultValue="fd.jackson@reentry.local"
              placeholder="you@reentry.local"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-300"
            >
              Password
            </label>
            <div className="mt-1 flex items-center rounded-lg border border-gray-700 bg-gray-900 px-3 py-1.5 focus-within:border-white focus-within:ring-1 focus-within:ring-white">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                className="w-full bg-transparent px-1 py-1.5 text-sm text-white placeholder-gray-500 focus:outline-none"
                defaultValue="Password123!"
                placeholder="••••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="ml-2 text-xs font-medium text-gray-400 hover:text-gray-200"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-gray-950 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-950 disabled:opacity-50 transition-colors"
          >
            {isPending ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="text-center text-xs text-gray-600">
          Staff access only. Contact your administrator for credentials.
        </p>
      </div>
    </main>
  );
}
