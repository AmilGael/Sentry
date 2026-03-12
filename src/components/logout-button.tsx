"use client";

import { logoutAction } from "@/lib/actions/auth";

export function LogoutButton() {
  return (
    <form action={logoutAction}>
      <button
        type="submit"
        className="w-full rounded-lg border border-gray-700 px-3 py-2 text-xs text-gray-400 hover:border-gray-600 hover:text-white transition-colors"
      >
        Sign out
      </button>
    </form>
  );
}
