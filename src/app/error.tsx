"use client";
export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="min-h-screen bg-[#f8f7f4] flex items-center justify-center p-6">
      <div className="text-center max-w-sm">
        <div className="text-4xl mb-4">⚠️</div>
        <h2 className="text-xl font-bold text-[#22382D] mb-2">Terjadi Kesalahan</h2>
        <p className="text-[#6F7F55] text-sm mb-6">Silakan coba lagi dalam beberapa saat.</p>
        <button onClick={reset} className="btn-primary-admin">Coba Lagi</button>
      </div>
    </div>
  );
}
