"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import type { NavItemWithAccess } from "@/lib/auth-utils";

type Props = {
  items: NavItemWithAccess[];
  unreadCount: number;
};

export function SidebarNav({ items, unreadCount }: Props) {
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!message) return;
    const id = setTimeout(() => setMessage(null), 3000);
    return () => clearTimeout(id);
  }, [message]);

  return (
    <>
      <ul className="space-y-1">
        {items.map((item) => {
          const isNotifications = item.href === "/dashboard/notifications";
          const disabled = item.disabled;

          const baseClasses =
            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors";
          const enabledClasses = "text-gray-300 hover:bg-gray-800 hover:text-white";
          const disabledClasses = "text-gray-600 cursor-not-allowed bg-transparent";

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={(e) => {
                  if (!disabled) return;
                  e.preventDefault();
                  setMessage("You are not authorized to access this section.");
                }}
                className={`${baseClasses} ${disabled ? disabledClasses : enabledClasses}`}
                aria-disabled={disabled}
              >
                <span className="text-base">{item.icon}</span>
                <span>{item.label}</span>
                {isNotifications && unreadCount > 0 && !disabled && (
                  <span className="ml-auto inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1.5 text-xs font-bold text-white">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>

      {message && (
        <div className="fixed bottom-4 left-64 z-50 -translate-x-1/2 rounded-md border border-red-700 bg-red-950/90 px-4 py-2 text-xs text-red-100 shadow-lg">
          {message}
        </div>
      )}
    </>
  );
}

