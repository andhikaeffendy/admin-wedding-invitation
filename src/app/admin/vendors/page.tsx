"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Phone, Wallet } from "lucide-react";

const INV_ID = 'inv-001';

export default function VendorsPage() {
  const [vendors, setVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: '', category: 'Katering', contact: '', cost: 0, paid: 0, status: 'Belum Bayar', notes: '' });
  const [showAdd, setShowAdd] = useState(false);

  const refresh = async () => {
    const res = await fetch(`/api/data/vendors?invitation_id=${INV_ID}`);
    setVendors(await res.json()); setLoading(false);
  };
  useEffect(() => { refresh(); }, []);

  const handleAdd = async () => {
    await fetch('/api/data/vendors', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ invitation_id: INV_ID, ...form }) });
    setForm({ name: '', category: 'Katering', contact: '', cost: 0, paid: 0, status: 'Belum Bayar', notes: '' }); setShowAdd(false); refresh();
  };

  const totalCost = vendors.reduce((s: number, v: any) => s + v.cost, 0);
  const totalPaid = vendors.reduce((s: number, v: any) => s + v.paid, 0);

  if (loading) return <div className="animate-pulse space-y-4"><div className="h-8 w-48 bg-gray-100 rounded" /></div>;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center">
        <div><h1 className="text-2xl font-bold text-[#22382D]">Vendor Management</h1><p className="text-[#6F7F55] text-sm">{vendors.length} vendor</p></div>
        <button onClick={() => setShowAdd(!showAdd)} className="btn-primary-admin flex items-center gap-1"><Plus size={14} /> Tambah</button>
      </div>

      {showAdd && (
        <div className="card-admin grid grid-cols-2 md:grid-cols-4 gap-3">
          <input className="input-admin text-xs" placeholder="Nama Vendor" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
          <select className="input-admin text-xs" value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
            <option>Venue</option><option>Katering</option><option>Dekorasi</option><option>Dokumentasi</option><option>Busana</option><option>Hiburan</option><option>Lainnya</option>
          </select>
          <input className="input-admin text-xs" placeholder="Kontak" value={form.contact} onChange={e => setForm({...form, contact: e.target.value})} />
          <button onClick={handleAdd} className="btn-primary-admin text-xs">Simpan</button>
        </div>
      )}

      <div className="grid grid-cols-3 gap-4 text-sm mb-4">
        <div className="card-admin text-center"><p className="text-2xl font-bold text-[#22382D]">Rp {(totalCost / 1000000).toFixed(1)}M</p><p className="text-xs text-[#A9B89B]">Total Budget</p></div>
        <div className="card-admin text-center"><p className="text-2xl font-bold text-[#6F7F55]">Rp {(totalPaid / 1000000).toFixed(1)}M</p><p className="text-xs text-[#A9B89B]">Sudah Dibayar</p></div>
        <div className="card-admin text-center"><p className="text-2xl font-bold text-[#B86B4B]">Rp {((totalCost - totalPaid) / 1000000).toFixed(1)}M</p><p className="text-xs text-[#A9B89B]">Sisa</p></div>
      </div>

      <div className="space-y-3">
        {vendors.map((v: any) => (
          <motion.div key={v.id} className="card-admin flex items-center justify-between" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div>
              <h3 className="font-semibold text-[#22382D] text-sm">{v.name}</h3>
              <span className="badge-info text-xs">{v.category}</span>
              {v.contact && <span className="flex items-center gap-1 text-xs text-[#A9B89B] mt-1"><Phone size={10} /> {v.contact}</span>}
            </div>
            <div className="text-right">
              <p className="font-semibold text-[#22382D]">Rp {(v.cost / 1000000).toFixed(1)}M</p>
              <p className="text-xs text-[#6F7F55]">Dibayar: Rp {(v.paid / 1000000).toFixed(1)}M</p>
              <span className={`badge text-xs mt-1 ${v.status === 'Lunas' ? 'badge-success' : v.status.includes('DP') ? 'badge-warning' : 'badge-danger'}`}>{v.status}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
