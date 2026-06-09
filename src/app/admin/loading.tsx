export default function Loading() {
  return (
    <div className="min-h-screen bg-[#f8f7f4] flex items-center justify-center">
      <div className="text-center">
        <div className="w-14 h-14 border-2 border-[#C9A86A] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-[#6F7F55] text-sm font-medium">Memuat panel admin...</p>
      </div>
    </div>
  );
}
