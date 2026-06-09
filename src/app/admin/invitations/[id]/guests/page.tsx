"use client";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Search, Pencil, Trash2, Upload, MessageCircle, Download, FileSpreadsheet, Check, X } from "lucide-react";
import { parseExcelFile, downloadTemplate } from "@/lib/excel/import-export";
import { generateWhatsAppLink } from "@/lib/whatsapp-share";

const INV_ID = 'inv-001';

export default function GuestsPage() {
  const [guests, setGuests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [importResult, setImportResult] = useState<{count: number; errors: string[]} | null>(null);
  const [newGuest, setNewGuest] = useState({ guest_name: '', category: 'Keluarga', pax_allocated: 1, phone: '' });
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchGuests = async () => {
    const res = await fetch(`/api/data/guests?invitation_id=${INV_ID}`);
    const data = await res.json();
    setGuests(data);
    setLoading(false);
  };

  useEffect(() => { fetchGuests(); }, []);

  const handleAdd = async () => {
    if (!newGuest.guest_name) return;
    setSaving(true);
    await fetch('/api/data/guests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ invitation_id: INV_ID, ...newGuest }),
    });
    setNewGuest({ guest_name: '', category: 'Keluarga', pax_allocated: 1, phone: '' });
    setShowAdd(false);
    await fetchGuests();
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus tamu ini?')) return;
    await fetch(`/api/data/guests?id=${id}`, { method: 'DELETE' });
    await fetchGuests();
  };

  const handleFileImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const rows = await parseExcelFile(file);
      let count = 0;
      for (const row of rows) {
        if (!row.guest_name) continue;
        await fetch('/api/data/guests', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ invitation_id: INV_ID, ...row }),
        });
        count++;
      }
      setImportResult({ count, errors: [] });
      await fetchGuests();
    } catch (err: any) {
      setImportResult({ count: 0, errors: [err.message] });
    }
    e.target.value = '';
  };

  const categories = [...new Set(guests.map((g: any) => g.category))];
  const filtered = guests.filter((g: any) =>
    g.guest_name.toLowerCase().includes(search.toLowerCase()) &&
    (!filterCategory || g.category === filterCategory)
  );

  const statusBadge = (s: string) => ({
    'Sudah Diberikan': 'badge-success', 'Belum Diberikan': 'badge-warning'
  } as Record<string, string>)[s] || 'badge-neutral';

  if (loading) return <div className="animate-pulse space-y-4"><div className="h-8 w-48 bg-gray-100 rounded" /><div className="h-10 w-full bg-gray-100 rounded" /><div className="h-64 bg-gray-100 rounded-xl" /></div>;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#22382D]">Manajemen Tamu</h1>
          <p className="text-[#6F7F55] text-sm">{guests.length} tamu terdaftar</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={downloadTemplate} className="btn-ghost-admin flex items-center gap-1 text-xs"><Download size={14} /> Template</button>
          <label className="btn-outline-admin flex items-center gap-1 text-xs cursor-pointer">
            <Upload size={14} /> Import Excel
            <input ref={fileInputRef} type="file" accept=".xlsx,.xls,.csv" onChange={handleFileImport} className="hidden" />
          </label>
          <button className="btn-primary-admin flex items-center gap-1 text-xs" onClick={() => setShowAdd(!showAdd)}>
            <Plus size={14} /> Tambah Tamu
          </button>
        </div>
      </div>

      {importResult && (
        <div className={`p-3 rounded-lg text-sm ${importResult.errors.length > 0 ? 'bg-[#C9A86A]/10' : 'bg-[#6F7F55]/10 text-[#6F7F55]'}`}>
          ✅ Import {importResult.count} tamu berhasil.
          {importResult.errors.length > 0 && <span className="block text-xs text-[#B86B4B]">{importResult.errors.join(', ')}</span>}
        </div>
      )}

      <AnimatePresence>
        {showAdd && (
          <motion.div className="card-admin" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
            <h3 className="font-semibold text-[#22382D] mb-3">Tambah Tamu Baru</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <input className="input-admin text-xs" placeholder="Nama Tamu *" value={newGuest.guest_name} onChange={e => setNewGuest({...newGuest, guest_name: e.target.value})} />
              <select className="input-admin text-xs" value={newGuest.category} onChange={e => setNewGuest({...newGuest, category: e.target.value})}>
                {categories.map((c: string) => <option key={c}>{c}</option>)}
                <option>VIP</option><option>Vendor</option>
              </select>
              <input className="input-admin text-xs" type="number" min={1} value={newGuest.pax_allocated} onChange={e => setNewGuest({...newGuest, pax_allocated: parseInt(e.target.value) || 1})} />
              <input className="input-admin text-xs" placeholder="Phone" value={newGuest.phone} onChange={e => setNewGuest({...newGuest, phone: e.target.value})} />
              <div className="flex gap-2">
                <button onClick={handleAdd} disabled={saving} className="btn-primary-admin text-xs flex-1">{saving ? '...' : 'Simpan'}</button>
                <button onClick={() => setShowAdd(false)} className="btn-ghost-admin text-xs">Batal</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 max-w-xs">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A9B89B]" />
          <input className="input-admin pl-9 text-xs" placeholder="Cari nama..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="input-admin w-auto text-xs" value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
          <option value="">Semua Kategori</option>
          {categories.map((c: string) => <option key={c}>{c}</option>)}
        </select>
      </div>

      <div className="flex gap-4 flex-wrap text-sm">
        <span className="badge-info">Total: {guests.length}</span>
        <span className="badge-success">Hadir: {guests.filter((g: any) => g.rsvp_status === 'Hadir').length}</span>
        <span className="badge-warning">Belum RSVP: {guests.filter((g: any) => !g.rsvp_status).length}</span>
        <span className="badge-info">Check-in: {guests.filter((g: any) => g.is_checked_in).length}</span>
      </div>

      <div className="card-admin overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#22382D]/10">
              <th className="text-left py-3 px-2 font-medium text-[#A9B89B] text-xs">No</th>
              <th className="text-left py-3 px-2 font-medium text-[#A9B89B] text-xs">Nama</th>
              <th className="text-left py-3 px-2 font-medium text-[#A9B89B] text-xs">Kategori</th>
              <th className="text-left py-3 px-2 font-medium text-[#A9B89B] text-xs">Pax</th>
              <th className="text-left py-3 px-2 font-medium text-[#A9B89B] text-xs">RSVP</th>
              <th className="text-left py-3 px-2 font-medium text-[#A9B89B] text-xs">Check-in</th>
              <th className="text-right py-3 px-2 font-medium text-[#A9B89B] text-xs">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((g: any, i: number) => (
              <tr key={g.id} className="border-b border-[#22382D]/5 hover:bg-[#F7F1E6]/50">
                <td className="py-3 px-2 text-[#A9B89B]">{i + 1}</td>
                <td className="py-3 px-2 font-medium text-[#22382D]">{g.guest_name}</td>
                <td className="py-3 px-2"><span className="badge-info">{g.category}</span></td>
                <td className="py-3 px-2">{g.pax_allocated}</td>
                <td className="py-3 px-2">{g.rsvp_status === 'Hadir' ? <span className="badge-success">Hadir</span> : g.rsvp_status || <span className="badge-neutral">-</span>}</td>
                <td className="py-3 px-2">{g.is_checked_in ? <span className="badge-success">✓</span> : '-'}</td>
                <td className="py-3 px-2 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <a href={generateWhatsAppLink(g.guest_name, g.guest_token)} target="_blank" className="p-1.5 rounded hover:bg-[#25D366]/10 text-[#25D366]"><MessageCircle size={14} /></a>
                    <button onClick={() => handleDelete(g.id)} className="p-1.5 rounded hover:bg-[#B86B4B]/10 text-[#B86B4B]"><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <div className="text-center py-8 text-[#A9B89B] text-sm">Tidak ada tamu</div>}
      </div>
    </div>
  );
}
