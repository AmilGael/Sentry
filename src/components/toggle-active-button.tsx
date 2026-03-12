"use client";

import { useTransition } from "react";
import { toggleUserActive } from "@/lib/actions/users";

export function ToggleActiveButton({
  userId,
  isActive,
}: {
  userId: string;
  isActive: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      onClick={() => startTransition(() => toggleUserActive(userId))}
      disabled={isPending}
      className={`text-xs transition-colors disabled:opacity-50 ${
        isActive
          ? "text-red-400 hover:text-red-300"
          : "text-green-400 hover:text-green-300"
      }`}
    >
      {isPending ? "…" : isActive ? "Deactivate" : "Activate"}
    </button>
  );
}
