"use client";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Admin error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#f8f7f4] flex items-center justify-center p-6">
      <div className="max-w-md text-center">
        <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-[#B86B4B]/10 flex items-center justify-center">
          <span className="text-3xl">⚠️</span>
        </div>
        <h2 className="text-xl font-bold text-[#22382D] mb-2">Terjadi Kesalahan</h2>
        <p className="text-[#6F7F55] text-sm mb-6">
          Maaf, terjadi kesalahan saat memuat halaman. Silakan coba lagi.
        </p>
        <button
          onClick={reset}
          className="btn-primary-admin inline-flex items-center gap-2"
        >
          Coba Lagi
        </button>
      </div>
    </div>
  );
}
