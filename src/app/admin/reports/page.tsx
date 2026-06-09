"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Download, Users, Check, X, Gift, TrendingUp } from "lucide-react";

const INV_ID = 'inv-001';

export default function ReportsPage() {
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/data/reports?invitation_id=${INV_ID}`).then(r => r.json()).then(d => { setReport(d); setLoading(false); });
  }, []);

  if (loading || !report) return <div className="animate-pulse space-y-4"><div className="h-8 w-48 bg-gray-100 rounded" /></div>;

  const handlePrint = () => window.print();

  return (
    <div className="space-y-6 max-w-4xl mx-auto" id="report-print">
      <div className="flex justify-between items-center print:hidden">
        <div><h1 className="text-2xl font-bold text-[#22382D]">Post-Event Report</h1><p className="text-[#6F7F55] text-sm">Laporan lengkap acara</p></div>
        <button onClick={handlePrint} className="btn-primary-admin flex items-center gap-2 text-xs"><Download size={14} /> Cetak / PDF</button>
      </div>

      {/* Summary */}
      <div className="card-admin">
        <h2 className="font-display text-xl text-[#22382D] mb-4">{report.invitation?.title}</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { label: 'Total Tamu', value: report.totalGuests, icon: Users, color: 'text-[#22382D]' },
            { label: 'RSVP Hadir', value: report.rsvpYes, icon: Check, color: 'text-[#6F7F55]' },
            { label: 'Tidak Hadir', value: report.rsvpNo, icon: X, color: 'text-[#B86B4B]' },
            { label: 'Check-in', value: report.checkedIn, icon: TrendingUp, color: 'text-[#C9A86A]' },
            { label: 'Souvenir', value: report.souvenirClaimed, icon: Gift, color: 'text-[#6F7F55]' },
          ].map((s, i) => (
            <div key={i} className="text-center p-3 bg-[#F7F1E6] rounded-lg">
              <s.icon size={18} className={`${s.color} mx-auto mb-1`} />
              <p className="text-xl font-bold text-[#22382D]">{s.value}</p>
              <p className="text-xs text-[#A9B89B]">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="card-admin">
          <h3 className="font-semibold text-[#22382D] mb-3">Kehadiran</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-[#6F7F55]">No-Show</span><span className="font-bold text-[#B86B4B]">{report.noShow} tamu</span></div>
            <div className="flex justify-between"><span className="text-[#6F7F55]">Belum Response</span><span className="font-bold">{report.noResponse}</span></div>
            <div className="flex justify-between"><span className="text-[#6F7F55]">Peak Hour</span><span className="font-bold">{report.peakHour}</span></div>
          </div>
        </div>
        <div className="card-admin">
          <h3 className="font-semibold text-[#22382D] mb-3">Budget</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-[#6F7F55]">Total Budget</span><span className="font-bold">Rp {(report.budget?.total / 1000000 || 0).toFixed(1)}M</span></div>
            <div className="flex justify-between"><span className="text-[#6F7F55]">Vendor</span><span className="font-bold">{report.vendors?.length || 0} vendor</span></div>
            <div className="flex justify-between"><span className="text-[#6F7F55]">Ucapan Tamu</span><span className="font-bold">{report.wishes?.length || 0} pesan</span></div>
          </div>
        </div>
      </div>

      {/* Souvenir Stock */}
      <div className="card-admin">
        <h3 className="font-semibold text-[#22382D] mb-3">Souvenir Status</h3>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div><p className="text-2xl font-bold">{report.souvenirStock?.total || 0}</p><p className="text-xs text-[#A9B89B]">Total Stok</p></div>
          <div><p className="text-2xl font-bold text-[#6F7F55]">{report.souvenirStock?.claimed || 0}</p><p className="text-xs text-[#A9B89B]">Diklaim</p></div>
          <div><p className="text-2xl font-bold text-[#C9A86A]">{report.souvenirStock?.remaining || 0}</p><p className="text-xs text-[#A9B89B]">Sisa</p></div>
        </div>
      </div>

      <p className="text-xs text-[#A9B89B] text-center">Laporan dibuat: {new Date(report.generatedAt).toLocaleString('id-ID')}</p>
    </div>
  );
}
