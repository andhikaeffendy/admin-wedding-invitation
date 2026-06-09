import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#f8f7f4] flex items-center justify-center p-6">
      <div className="text-center max-w-sm">
        <span className="text-5xl text-[#C9A86A] font-serif">404</span>
        <h2 className="text-xl font-bold text-[#22382D] mt-4 mb-2">Halaman Tidak Ditemukan</h2>
        <Link href="/admin/dashboard" className="btn-primary-admin inline-flex items-center gap-2 mt-4">
          Kembali ke Dashboard
        </Link>
      </div>
    </div>
  );
}
