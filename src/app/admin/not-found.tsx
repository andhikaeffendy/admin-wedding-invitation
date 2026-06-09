import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#f8f7f4] flex items-center justify-center p-6">
      <div className="max-w-md text-center">
        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-[#F7F1E6] flex items-center justify-center">
          <span className="text-4xl font-serif text-[#C9A86A]">404</span>
        </div>
        <h2 className="text-2xl font-bold text-[#22382D] mb-2">Halaman Tidak Ditemukan</h2>
        <p className="text-[#6F7F55] text-sm mb-6">
          Halaman yang Anda cari tidak tersedia atau telah dipindahkan.
        </p>
        <Link href="/admin/dashboard" className="btn-primary-admin inline-flex items-center gap-2">
          Kembali ke Dashboard
        </Link>
      </div>
    </div>
  );
}
