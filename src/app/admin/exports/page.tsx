"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Download, FileSpreadsheet, Check, Users, Gift, FileText } from "lucide-react";
import { getGuests } from "@/lib/dummy-data";
import { exportToCsv, exportToExcel } from "@/lib/excel/import-export";

export default function ExportsPage() {
  const invId = 'inv-001-andhika-laila';
  const guests = getGuests(invId);
  const [exporting, setExporting] = useState(false);
  const [done, setDone] = useState(false);

  const stats = {
    total: guests.length,
    given: guests.filter(g => g.invitation_given_status === 'Sudah Diberikan').length,
    rsvpYes: guests.filter(g => g.rsvp_status === 'Hadir').length,
    checkedIn: guests.filter(g => g.is_checked_in).length,
    souvenir: guests.filter(g => g.is_souvenir_claimed).length,
  };

  const handleExportCsv = async () => {
    setExporting(true);
    await new Promise(r => setTimeout(r, 800));
    const data = guests.map((g, i) => ({
      No: i + 1,
      'Nama Tamu': g.guest_name,
      'Phone': g.phone || '',
      'Kategori': g.category,
      'Pax Allocated': g.pax_allocated,
      'Status Undangan': g.invitation_given_status,
      'RSVP': g.rsvp_status || '-',
      'Pax Confirmed': g.pax_confirmed || 0,
      'Hadir': g.is_checked_in ? 'Ya' : 'Tidak',
      'Jam Hadir': g.is_checked_in ? '14:30 WIB' : '-',
      'Souvenir': g.is_souvenir_claimed ? 'Ya' : 'Tidak',
      'Jam Souvenir': g.is_souvenir_claimed ? '15:00 WIB' : '-',
      'Link Personal': `${typeof window !== 'undefined' ? window.location.origin : ''}/i/andhika-laila?guest=${g.guest_token}`,
      'Notes': g.notes || '',
    }));
    exportToCsv(data, 'export-tamu-andhika-laila');
    setExporting(false);
    setDone(true);
    setTimeout(() => setDone(false), 3000);
  };

  const handleExportXlsx = async () => {
    setExporting(true);
    await new Promise(r => setTimeout(r, 800));
    const data = guests.map((g, i) => ({
      No: i + 1,
      'Nama Tamu': g.guest_name,
      Phone: g.phone || '',
      Kategori: g.category,
      'Pax': g.pax_allocated,
      'Status Undangan': g.invitation_given_status,
      RSVP: g.rsvp_status || '-',
      'Pax Hadir': g.pax_confirmed || 0,
      Hadir: g.is_checked_in ? 'Ya' : 'Tidak',
      Souvenir: g.is_souvenir_claimed ? 'Ya' : 'Tidak',
      Notes: g.notes || '',
    }));
    exportToExcel(data, 'export-tamu-andhika-laila');
    setExporting(false);
    setDone(true);
    setTimeout(() => setDone(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-[#22382D]">Export & Report</h1>
        <p className="text-[#6F7F55] text-sm">Download data tamu lengkap dalam format Excel/CSV</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: 'Total Tamu', value: stats.total, icon: Users },
          { label: 'Undangan Diberikan', value: stats.given, icon: FileSpreadsheet },
          { label: 'RSVP Hadir', value: stats.rsvpYes, icon: Check },
          { label: 'Check-in', value: stats.checkedIn, icon: Users },
          { label: 'Souvenir', value: stats.souvenir, icon: Gift },
        ].map((s, i) => (
          <div key={i} className="card-admin text-center">
            <s.icon size={18} className="text-[#C9A86A] mx-auto mb-1" />
            <p className="text-xl font-bold text-[#22382D]">{s.value}</p>
            <p className="text-xs text-[#A9B89B]">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Export Actions */}
      <div className="card-admin">
        <h3 className="font-semibold text-[#22382D] mb-4">Download Report</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="p-5 bg-[#F7F1E6] rounded-xl">
            <FileSpreadsheet size={24} className="text-[#6F7F55] mb-2" />
            <h4 className="font-medium text-[#22382D] mb-1">Export Lengkap (CSV)</h4>
            <p className="text-xs text-[#A9B89B] mb-3">Semua kolom: nama, phone, kategori, pax, status undangan, RSVP, hadir, souvenir, link personal</p>
            <button onClick={handleExportCsv} disabled={exporting} className="btn-primary-admin flex items-center gap-2 text-xs">
              {exporting ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> :
               done ? <Check size={14} /> : <Download size={14} />}
              {done ? 'Terexport!' : 'Download CSV'}
            </button>
          </div>
          <div className="p-5 bg-[#F7F1E6] rounded-xl">
            <FileText size={24} className="text-[#6F7F55] mb-2" />
            <h4 className="font-medium text-[#22382D] mb-1">Export Excel (XLSX)</h4>
            <p className="text-xs text-[#A9B89B] mb-3">Format Excel dengan kolom rapi, siap cetak</p>
            <button onClick={handleExportXlsx} disabled={exporting} className="btn-outline-admin text-xs flex items-center gap-2">
              <Download size={14} /> Download XLSX
            </button>
          </div>
        </div>
      </div>

      {/* Preview Table */}
      <div className="card-admin overflow-x-auto">
        <h3 className="font-semibold text-[#22382D] mb-3">Preview Data Export</h3>
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-[#22382D]/10">
              <th className="text-left py-2 px-2 font-medium text-[#A9B89B]">No</th>
              <th className="text-left py-2 px-2 font-medium text-[#A9B89B]">Nama</th>
              <th className="text-left py-2 px-2 font-medium text-[#A9B89B]">Pax</th>
              <th className="text-left py-2 px-2 font-medium text-[#A9B89B]">Status</th>
              <th className="text-left py-2 px-2 font-medium text-[#A9B89B]">RSVP</th>
              <th className="text-left py-2 px-2 font-medium text-[#A9B89B]">Hadir</th>
              <th className="text-left py-2 px-2 font-medium text-[#A9B89B]">Souvenir</th>
            </tr>
          </thead>
          <tbody>
            {guests.slice(0, 5).map((g, i) => (
              <tr key={g.id} className="border-b border-[#22382D]/5">
                <td className="py-2 px-2">{i + 1}</td>
                <td className="py-2 px-2 font-medium">{g.guest_name}</td>
                <td className="py-2 px-2">{g.pax_allocated}</td>
                <td className="py-2 px-2"><span className={`badge ${g.invitation_given_status === 'Sudah Diberikan' ? 'badge-success' : 'badge-warning'}`}>{g.invitation_given_status}</span></td>
                <td className="py-2 px-2">{g.rsvp_status || '-'}</td>
                <td className="py-2 px-2">{g.is_checked_in ? '✓' : '-'}</td>
                <td className="py-2 px-2">{g.is_souvenir_claimed ? '✓' : '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="text-xs text-[#A9B89B] mt-3">Menampilkan 5 dari {guests.length} tamu</p>
      </div>
    </div>
  );
}
