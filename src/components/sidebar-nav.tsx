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
  const [passesOpen, setPassesOpen] = useState(false);

  useEffect(() => {
    if (!message) return;
    const id = setTimeout(() => setMessage(null), 3000);
    return () => clearTimeout(id);
  }, [message]);

  const baseClasses =
    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors";
  const enabledClasses = "text-gray-300 hover:bg-gray-800 hover:text-white";
  const disabledClasses = "text-gray-600 cursor-not-allowed bg-transparent";

  return (
    <>
      <ul className="space-y-1">
        {items.map((item) => {
          if (item.href === "/dashboard/passes") {
            return (
              <li key={item.href}>
                <button
                  type="button"
                  onClick={() => setPassesOpen((o) => !o)}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                    item.disabled
                      ? "cursor-not-allowed text-gray-600"
                      : "text-gray-300 hover:bg-gray-800 hover:text-white"
                  }`}
                >
                  <span className="text-base">{item.icon}</span>
                  <span className="flex-1 text-left">{item.label}</span>
                  <span
                    className={`text-gray-500 transition-transform ${passesOpen ? "rotate-180" : ""}`}
                    aria-hidden
                  >
                    ▼
                  </span>
                </button>
                {passesOpen && (
                  <ul className="ml-6 mt-0.5 space-y-0.5 border-l border-gray-800 pl-3">
                    <li>
                      <Link
                        href="/dashboard/passes"
                        onClick={(e) => {
                          if (item.disabled) {
                            e.preventDefault();
                            setMessage("You are not authorized to access this section.");
                          }
                        }}
                        className={`block rounded-lg px-2 py-1.5 text-xs transition-colors ${
                          item.disabled
                            ? "text-gray-600 cursor-not-allowed"
                            : "text-gray-400 hover:bg-gray-800 hover:text-white"
                        }`}
                      >
                        All passes
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/dashboard/passes?view=scheduled"
                        onClick={(e) => {
                          if (item.disabled) {
                            e.preventDefault();
                            setMessage("You are not authorized to access this section.");
                          }
                        }}
                        className={`block rounded-lg px-2 py-1.5 text-xs transition-colors ${
                          item.disabled
                            ? "text-gray-600 cursor-not-allowed"
                            : "text-gray-400 hover:bg-gray-800 hover:text-white"
                        }`}
                      >
                        Scheduled passes
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/dashboard/passes?view=expired"
                        onClick={(e) => {
                          if (item.disabled) {
                            e.preventDefault();
                            setMessage("You are not authorized to access this section.");
                          }
                        }}
                        className={`block rounded-lg px-2 py-1.5 text-xs transition-colors ${
                          item.disabled
                            ? "text-gray-600 cursor-not-allowed"
                            : "text-gray-400 hover:bg-gray-800 hover:text-white"
                        }`}
                      >
                        Expired / past
                      </Link>
                    </li>
                  </ul>
                )}
              </li>
            );
          }

          const isNotifications = item.href === "/dashboard/notifications";
          const disabled = item.disabled;

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

