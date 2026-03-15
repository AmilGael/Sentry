"use client";

import { useRouter } from "next/navigation";

const CREATE_PASS_URL = "/api/demo/create-pass";
const REFRESH_DELAY_MS = 1800;

type Props = {
  /** When true, refresh the current page after creating the pass so it appears in Scheduled on Front Desk. */
  refreshDashboard?: boolean;
  className?: string;
  children?: React.ReactNode;
};

/**
 * Demo-only button: opens create-pass in a new tab (resident can take a pic),
 * and optionally refreshes the current tab so the new pass appears in Scheduled data card and list.
 */
export function DemoQRPassButton({
  refreshDashboard = true,
  className = "rounded-md bg-amber-500 px-3 py-1.5 text-xs font-semibold text-gray-950 hover:bg-amber-400 transition-colors",
  children = "Demo: QR Pass",
}: Props) {
  const router = useRouter();

  function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    window.open(CREATE_PASS_URL, "_blank", "noopener,noreferrer");
    if (refreshDashboard) {
      setTimeout(() => {
        router.refresh();
      }, REFRESH_DELAY_MS);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={className}
    >
      {children}
    </button>
  );
}
