"use client";

import { useEffect, useRef, useState } from "react";

export function QRScanner({
  onScan,
  onError,
}: {
  onScan: (data: string) => void;
  onError?: (error: string) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scannerRef = useRef<{ stop: () => Promise<void> } | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  async function startScanner() {
    if (scannerRef.current) return;

    try {
      const { Html5Qrcode } = await import("html5-qrcode");
      const scanner = new Html5Qrcode("qr-reader");
      scannerRef.current = scanner;
      setIsActive(true);
      setCameraError(null);

      await scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          onScan(decodedText);
          stopScanner();
        },
        () => {}
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : "Camera access denied";
      setCameraError(message);
      onError?.(message);
      setIsActive(false);
    }
  }

  async function stopScanner() {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
      } catch {
        // ignore
      }
      scannerRef.current = null;
      setIsActive(false);
    }
  }

  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, []);

  return (
    <div className="space-y-4">
      <div
        ref={containerRef}
        id="qr-reader"
        className="mx-auto overflow-hidden rounded-xl border border-gray-700 bg-black"
        style={{ width: 320, height: isActive ? 320 : 0 }}
      />

      {cameraError && (
        <p className="text-sm text-red-400 text-center">{cameraError}</p>
      )}

      <div className="flex justify-center gap-3">
        {!isActive ? (
          <button
            onClick={startScanner}
            className="rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-black hover:bg-gray-200 transition-colors"
          >
            Start Camera
          </button>
        ) : (
          <button
            onClick={stopScanner}
            className="rounded-lg border border-gray-600 px-5 py-2.5 text-sm text-gray-300 hover:bg-gray-800 transition-colors"
          >
            Stop Camera
          </button>
        )}
      </div>
    </div>
  );
}
