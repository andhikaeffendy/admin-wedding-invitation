"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Plus, Search, Eye, Edit, Calendar, Users, Image, X, Heart, Palette, Check } from "lucide-react";
import { templatePresets } from "@/lib/templates";

export default function InvitationsPage() {
  const [invitations, setInvitations] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [step, setStep] = useState<'form' | 'template'>('form');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('modern-organic-luxury');
  const [form, setForm] = useState({ title: '', slug: '', bride_name: '', groom_name: '', event_date: '' });
  const [saving, setSaving] = useState(false);

  const fetchInvitations = async () => {
    setLoading(true);
    const res = await fetch('/api/data/invitations');
    const data = await res.json();
    setInvitations(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  useState(() => { fetchInvitations(); });

  const handleCreate = async () => {
    if (!form.title || !form.slug) return;
    setSaving(true);
    const res = await fetch('/api/data/invitations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, theme: { id: selectedTemplate, ...templatePresets.find(t => t.id === selectedTemplate) } }),
    });
    if (res.ok) {
      setShowCreate(false);
      setStep('form');
      setForm({ title: '', slug: '', bride_name: '', groom_name: '', event_date: '' });
      setSelectedTemplate('modern-organic-luxury');
      await fetchInvitations();
    }
    setSaving(false);
  };

  const filtered = invitations.filter((i: any) =>
    i.title?.toLowerCase().includes(search.toLowerCase()) ||
    i.slug?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return (
    <div className="space-y-4 animate-pulse max-w-5xl mx-auto">
      <div className="h-10 w-48 bg-gray-100 rounded-lg" />
      <div className="h-10 w-full bg-gray-100 rounded-lg" />
      <div className="grid md:grid-cols-3 gap-4">{[1,2,3].map(i => <div key={i} className="h-48 bg-gray-100 rounded-xl" />)}</div>
    </div>
  );

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#22382D]">Undangan</h1>
          <p className="text-[#6F7F55] text-sm">{invitations.length} undangan</p>
        </div>
        <button onClick={() => { setShowCreate(true); setStep('template'); }} className="btn-primary-admin flex items-center gap-2">
          <Plus size={18} /> Buat Undangan Baru
        </button>
      </div>

      {/* Create Modal — Step 1: Choose Template, Step 2: Details */}
      <AnimatePresence>
        {showCreate && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-black/40" onClick={() => setShowCreate(false)} />
            <motion.div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6" initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-lg text-[#22382D] flex items-center gap-2">
                  <Heart size={18} className="text-[#C9A86A]" />
                  {step === 'template' ? 'Pilih Template' : 'Detail Undangan'}
                </h3>
                <button onClick={() => setShowCreate(false)} className="text-[#A9B89B] hover:text-[#22382D]"><X size={20} /></button>
              </div>

              {step === 'template' && (
                <div>
                  <p className="text-sm text-[#6F7F55] mb-4">Pilih tema undangan Anda. Bisa dikustomisasi nanti.</p>
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    {templatePresets.map(tpl => (
                      <button
                        key={tpl.id}
                        onClick={() => setSelectedTemplate(tpl.id)}
                        className={`p-3 rounded-xl border-2 text-left transition-all ${
                          selectedTemplate === tpl.id
                            ? 'border-[#6F7F55] bg-[#6F7F55]/5 ring-2 ring-[#6F7F55]/20'
                            : 'border-[#22382D]/10 hover:border-[#C9A86A]/50'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <span className="text-2xl">{tpl.thumbnail}</span>
                          {selectedTemplate === tpl.id && <Check size={16} className="text-[#6F7F55]" />}
                        </div>
                        <p className="text-sm font-semibold text-[#22382D]">{tpl.name}</p>
                        <p className="text-xs text-[#A9B89B] mt-0.5 line-clamp-2">{tpl.description}</p>
                        <div className="flex gap-1 mt-2">
                          {Object.values(tpl.colors).slice(0, 4).map((c, i) => (
                            <div key={i} className="w-4 h-4 rounded-full border border-white shadow-sm" style={{ backgroundColor: c }} />
                          ))}
                        </div>
                        {tpl.isPremium && <span className="inline-block mt-1 badge badge-warning text-xs">Premium</span>}
                      </button>
                    ))}
                  </div>
                  <button onClick={() => setStep('form')} className="btn-primary-admin w-full">
                    Lanjutkan → Isi Detail
                  </button>
                </div>
              )}

              {step === 'form' && (
                <div>
                  <button onClick={() => setStep('template')} className="text-sm text-[#C9A86A] hover:underline mb-4 inline-block">← Kembali pilih template</button>
                  <div className="space-y-3">
                    <div><label className="label-admin">Judul Undangan *</label><input className="input-admin" placeholder="cth: Andhika & Laila" value={form.title} onChange={e => setForm({...form, title: e.target.value})} /></div>
                    <div><label className="label-admin">Slug URL *</label><input className="input-admin" placeholder="cth: andhika-laila" value={form.slug} onChange={e => setForm({...form, slug: e.target.value.toLowerCase().replace(/\s+/g, '-')})} /></div>
                    <div className="grid grid-cols-2 gap-3">
                      <div><label className="label-admin">Pengantin Wanita</label><input className="input-admin" placeholder="Nama" value={form.bride_name} onChange={e => setForm({...form, bride_name: e.target.value})} /></div>
                      <div><label className="label-admin">Pengantin Pria</label><input className="input-admin" placeholder="Nama" value={form.groom_name} onChange={e => setForm({...form, groom_name: e.target.value})} /></div>
                    </div>
                    <div><label className="label-admin">Tanggal Acara</label><input type="date" className="input-admin" value={form.event_date} onChange={e => setForm({...form, event_date: e.target.value})} /></div>
                    <div className="p-3 bg-[#F7F1E6] rounded-lg">
                      <p className="text-xs text-[#6F7F55]">
                        📎 Link undangan: <code className="text-[#C9A86A]">/i/{form.slug || '...'}/[nama-tamu]</code>
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3 mt-5">
                    <button onClick={() => setShowCreate(false)} className="btn-outline-admin flex-1">Batal</button>
                    <button onClick={handleCreate} disabled={saving || !form.title || !form.slug} className="btn-primary-admin flex-1 flex items-center justify-center gap-2">
                      {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Plus size={16} />}
                      Buat Undangan
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative"><Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A9B89B]" /><input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari..." className="input-admin pl-10" /></div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((inv: any, i: number) => (
          <motion.div key={inv.id} className="card-admin hover:shadow-md" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <div className="flex items-start justify-between mb-3">
              <div><h3 className="font-semibold text-[#22382D]">{inv.title}</h3><p className="text-xs text-[#A9B89B]">/{inv.slug}</p></div>
              <span className={`badge ${inv.status === 'published' ? 'badge-success' : 'badge-warning'}`}>{inv.status}</span>
            </div>
            <div className="flex items-center gap-4 text-xs text-[#6F7F55] mb-4"><Calendar size={12} /> {inv.event_date || 'Belum diatur'}</div>
            <div className="flex gap-2 flex-wrap">
              <Link href={`/admin/invitations/${inv.id}/builder`} className="btn-ghost-admin flex items-center gap-1 text-xs"><Edit size={14} /> Edit</Link>
              <Link href={`/admin/invitations/${inv.id}/guests`} className="btn-ghost-admin flex items-center gap-1 text-xs"><Users size={14} /> Tamu</Link>
              <Link href={`/admin/invitations/${inv.id}/media`} className="btn-ghost-admin flex items-center gap-1 text-xs"><Image size={14} /> Media</Link>
              <a href={`http://localhost:3000/i/${inv.slug}`} target="_blank" className="btn-ghost-admin flex items-center gap-1 text-xs"><Eye size={14} /> Preview</a>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
