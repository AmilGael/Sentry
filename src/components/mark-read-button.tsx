"use client";

import { useTransition } from "react";
import { markAsRead } from "@/lib/actions/notifications";

export function MarkReadButton({ notificationId }: { notificationId: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      onClick={() => startTransition(() => markAsRead(notificationId))}
      disabled={isPending}
      className="shrink-0 text-xs text-gray-400 hover:text-white transition-colors disabled:opacity-50"
    >
      {isPending ? "…" : "Mark read"}
    </button>
  );
}
