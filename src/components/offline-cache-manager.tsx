"use client";

import { useEffect, useState, useCallback } from "react";

const CACHE_KEY = "reentry_frontdesk_passes";
const CACHE_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

type CachedPass = {
  id: string;
  passDisplayId: string;
  residentFullName: string;
  residentInmateNumber: string;
  employerName: string;
  scheduledDeparture: string;
  scheduledReturn: string;
  status: string;
  qrCodeData: string;
};

type CacheData = {
  passes: CachedPass[];
  cachedAt: string;
};

export function OfflineCacheManager() {
  const [cacheStatus, setCacheStatus] = useState<"online" | "offline" | "stale">("online");
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [passCount, setPassCount] = useState(0);

  const syncCache = useCallback(async () => {
    try {
      const res = await fetch("/api/front-desk/cache");
      if (!res.ok) throw new Error("Failed to fetch");
      const data: CacheData = await res.json();
      localStorage.setItem(CACHE_KEY, JSON.stringify(data));
      setLastSync(data.cachedAt);
      setPassCount(data.passes.length);
      setCacheStatus("online");
    } catch {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const data = JSON.parse(cached) as CacheData;
        setPassCount(data.passes.length);
        setLastSync(data.cachedAt);
        setCacheStatus("stale");
      } else {
        setCacheStatus("offline");
      }
    }
  }, []);

  useEffect(() => {
    syncCache();
    const interval = setInterval(syncCache, CACHE_INTERVAL_MS);

    function handleOnline() { syncCache(); }
    function handleOffline() { setCacheStatus("offline"); }

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      clearInterval(interval);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [syncCache]);

  const statusColors = {
    online: "bg-green-900 text-green-300",
    offline: "bg-red-900 text-red-300",
    stale: "bg-yellow-900 text-yellow-300",
  };

  const statusLabels = {
    online: "Online",
    offline: "Offline — No Cache",
    stale: "Offline — Using Cache",
  };

  return (
    <div className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs ${statusColors[cacheStatus]}`}>
      <span className={`inline-block h-2 w-2 rounded-full ${
        cacheStatus === "online" ? "bg-green-400" :
        cacheStatus === "stale" ? "bg-yellow-400" : "bg-red-400"
      }`} />
      <span>{statusLabels[cacheStatus]}</span>
      {passCount > 0 && (
        <span className="opacity-70">· {passCount} passes cached</span>
      )}
      {lastSync && (
        <span className="opacity-50">
          · {new Date(lastSync).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </span>
      )}
    </div>
  );
}

export function getOfflinePassByQR(qrData: string): CachedPass | null {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;
    const data = JSON.parse(cached) as CacheData;

    const parsed = JSON.parse(qrData);
    return data.passes.find((p) => p.passDisplayId === parsed.pid) ?? null;
  } catch {
    return null;
  }
}
