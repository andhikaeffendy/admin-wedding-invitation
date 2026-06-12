"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Plus, Search, Eye, Edit, Calendar, Users, Image, X, Heart, Palette, Check, Trash2, AlertTriangle, ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";
import { templatePresets } from "@/lib/templates";

export default function InvitationsPage() {
  const [invitations, setInvitations] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [step, setStep] = useState<'form' | 'template' | 'details'>('form');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('modern-organic-luxury');
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: '', slug: '',
    bride_name: '', groom_name: '',
    bride_full_name: '', groom_full_name: '',
    bride_parents: '', groom_parents: '',
    bride_ig: '', groom_ig: '',
    event_date: '', timezone: 'Asia/Jakarta',
    venue_akad: 'Masjid Agung Al-Muhajirin',
    venue_resepsi: 'Gedung Graha Wedding Garden',
    address_akad: 'Jl. Ahmad Yani No. 15, Bandung',
    address_resepsi: 'Jl. Sukajadi No. 200, Bandung',
    // Bank accounts
    bank_name_1: 'BCA', bank_number_1: '', bank_holder_1: '',
    bank_name_2: 'Mandiri', bank_number_2: '', bank_holder_2: '',
    bank_name_3: '', bank_number_3: '', bank_holder_3: '',
  });

  const fetchInvitations = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/data/invitations');
      const data = await res.json();
      setInvitations(Array.isArray(data) ? data : []);
    } catch { setInvitations([]); }
    setLoading(false);
  };

  useEffect(() => { fetchInvitations(); }, []);

  const handleCreate = async () => {
    if (!form.title || !form.slug) return;
    setSaving(true);
    const selectedPreset = templatePresets.find(t => t.id === selectedTemplate);

    // Build bank accounts array
    const bankAccounts: any[] = [];
    if (form.bank_name_1 && form.bank_number_1) bankAccounts.push({ bank_name: form.bank_name_1, account_number: form.bank_number_1, account_holder: form.bank_holder_1 });
    if (form.bank_name_2 && form.bank_number_2) bankAccounts.push({ bank_name: form.bank_name_2, account_number: form.bank_number_2, account_holder: form.bank_holder_2 });
    if (form.bank_name_3 && form.bank_number_3) bankAccounts.push({ bank_name: form.bank_name_3, account_number: form.bank_number_3, account_holder: form.bank_holder_3 });

    const payload = {
      ...form,
      theme: { id: selectedTemplate, ...selectedPreset },
      settings: {
        venue_akad: form.venue_akad,
        venue_resepsi: form.venue_resepsi,
        address_akad: form.address_akad,
        address_resepsi: form.address_resepsi,
      },
      bank_accounts: bankAccounts,
      status: 'published',
    };

    const res = await fetch('/api/data/invitations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      setShowCreate(false);
      setStep('form');
      setForm({
        title: '', slug: '',
        bride_name: '', groom_name: '',
        bride_full_name: '', groom_full_name: '',
        bride_parents: '', groom_parents: '',
        bride_ig: '', groom_ig: '',
        event_date: '', timezone: 'Asia/Jakarta',
        venue_akad: 'Masjid Agung Al-Muhajirin',
        venue_resepsi: 'Gedung Graha Wedding Garden',
        address_akad: 'Jl. Ahmad Yani No. 15, Bandung',
        address_resepsi: 'Jl. Sukajadi No. 200, Bandung',
        bank_name_1: 'BCA', bank_number_1: '', bank_holder_1: '',
        bank_name_2: 'Mandiri', bank_number_2: '', bank_holder_2: '',
        bank_name_3: '', bank_number_3: '', bank_holder_3: '',
      });
      setSelectedTemplate('modern-organic-luxury');
      fetchInvitations();
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await fetch(`/api/data/invitations/${deleteId}`, { method: 'DELETE' });
      setDeleteId(null);
      fetchInvitations();
    } catch { alert('Gagal menghapus undangan'); }
  };

  const filtered = invitations.filter((inv: any) =>
    !search || inv.title?.toLowerCase().includes(search.toLowerCase()) || inv.slug?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return (
    <div className="animate-pulse space-y-4 max-w-6xl mx-auto">
      <div className="h-8 w-48 bg-gray-100 rounded" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[1,2,3,4].map(i => <div key={i} className="h-32 bg-gray-100 rounded-xl" />)}
      </div>
    </div>
  );

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#22382D]">Invitations</h1>
          <p className="text-[#6F7F55] text-sm">{invitations.length} undangan aktif</p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A9B89B]" />
            <input className="input-admin pl-9 pr-4 w-48 sm:w-64" placeholder="Cari undangan..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <button onClick={() => setShowCreate(true)} className="btn-primary-admin flex items-center gap-1 text-xs"><Plus size={14} /> Buat Baru</button>
        </div>
      </div>

      {/* Invitation List */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-[#C9A86A]/20 rounded-2xl">
          <Heart size={40} className="mx-auto mb-3 text-[#A9B89B]" />
          <p className="text-[#A9B89B]">Belum ada undangan. Klik "Buat Baru" untuk memulai.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((inv: any) => (
            <div key={inv.id} className="card-admin flex items-center justify-between gap-4 group">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="badge badge-success text-xs">{inv.status || 'draft'}</span>
                  <span className="text-xs text-[#A9B89B]">{inv.slug}</span>
                </div>
                <h3 className="font-semibold text-[#22382D]">{inv.title}</h3>
                <p className="text-xs text-[#A9B89B]">
                  {inv.bride_name} & {inv.groom_name}
                  {inv.event_date && ` • ${new Date(inv.event_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`}
                </p>
                <p className="text-[10px] text-[#A9B89B] mt-1">
                  🔗 /i/{inv.slug}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <Link href={`/admin/invitations/${inv.id}/builder`} className="p-2 text-[#6F7F55] hover:bg-[#6F7F55]/10 rounded-lg transition-colors" title="Edit">
                  <Edit size={16} />
                </Link>
                <Link href={`/admin/invitations/${inv.id}/guests`} className="p-2 text-[#6F7F55] hover:bg-[#6F7F55]/10 rounded-lg transition-colors" title="Tamu">
                  <Users size={16} />
                </Link>
                <Link href={`/admin/invitations/${inv.id}/media`} className="p-2 text-[#6F7F55] hover:bg-[#6F7F55]/10 rounded-lg transition-colors" title="Media">
                  <Image size={16} />
                </Link>
                <a href={`${typeof window !== 'undefined' ? (window.location.origin.includes('admin') ? 'https://wedding-invitation-liart-alpha.vercel.app' : window.location.origin) : 'https://wedding-invitation-liart-alpha.vercel.app'}/i/${inv.slug}`} target="_blank" className="p-2 text-[#C9A86A] hover:bg-[#C9A86A]/10 rounded-lg transition-colors" title="Preview">
                  <ExternalLink size={16} />
                </a>
                <button onClick={() => setDeleteId(inv.id)} className="p-2 text-[#B86B4B] hover:bg-[#B86B4B]/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100" title="Hapus">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      <AnimatePresence>
        {showCreate && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}>
              <div className="sticky top-0 bg-white border-b px-6 py-4 rounded-t-2xl flex items-center justify-between z-10">
                <div>
                  <h2 className="text-lg font-bold text-[#22382D]">
                    {step === 'form' ? 'Buat Undangan Baru' : step === 'template' ? 'Pilih Template' : 'Detail Tambahan'}
                  </h2>
                  <p className="text-xs text-[#A9B89B]">Step {step === 'form' ? 1 : step === 'template' ? 2 : 3} dari 3</p>
                </div>
                <button onClick={() => { setShowCreate(false); setStep('form'); }} className="p-2 text-[#A9B89B] hover:text-[#22382D]"><X size={20} /></button>
              </div>

              <div className="p-6">
                {/* Step 1: Basic Info */}
                {step === 'form' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div><label className="label-admin">Judul Undangan *</label><input className="input-admin" placeholder="Andhika & Laila" value={form.title} onChange={e => setForm({...form, title: e.target.value, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '').replace(/-+/g, '-').replace(/^-|-$/g, '')})} /></div>
                      <div><label className="label-admin">Slug URL *</label><input className="input-admin" placeholder="andhika-laila" value={form.slug} onChange={e => setForm({...form, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '').replace(/-+/g, '-').replace(/^-|-$/g, '')})} /></div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div><label className="label-admin">Pengantin Wanita</label><input className="input-admin" placeholder="Nama panggilan" value={form.bride_name} onChange={e => setForm({...form, bride_name: e.target.value})} /></div>
                      <div><label className="label-admin">Pengantin Pria</label><input className="input-admin" placeholder="Nama panggilan" value={form.groom_name} onChange={e => setForm({...form, groom_name: e.target.value})} /></div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div><label className="label-admin">Nama Lengkap Wanita</label><input className="input-admin" placeholder="beserta gelar" value={form.bride_full_name} onChange={e => setForm({...form, bride_full_name: e.target.value})} /></div>
                      <div><label className="label-admin">Nama Lengkap Pria</label><input className="input-admin" placeholder="beserta gelar" value={form.groom_full_name} onChange={e => setForm({...form, groom_full_name: e.target.value})} /></div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div><label className="label-admin">Orang Tua Wanita</label><textarea className="input-admin" rows={2} placeholder="Putri dari..." value={form.bride_parents} onChange={e => setForm({...form, bride_parents: e.target.value})} /></div>
                      <div><label className="label-admin">Orang Tua Pria</label><textarea className="input-admin" rows={2} placeholder="Putra dari..." value={form.groom_parents} onChange={e => setForm({...form, groom_parents: e.target.value})} /></div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div><label className="label-admin">Tanggal Acara</label><input type="date" className="input-admin" value={form.event_date} onChange={e => setForm({...form, event_date: e.target.value})} /></div>
                      <div><label className="label-admin">IG Wanita</label><input className="input-admin" placeholder="@username" value={form.bride_ig} onChange={e => setForm({...form, bride_ig: e.target.value})} /></div>
                      <div><label className="label-admin">IG Pria</label><input className="input-admin" placeholder="@username" value={form.groom_ig} onChange={e => setForm({...form, groom_ig: e.target.value})} /></div>
                    </div>
                    <button onClick={() => setStep('template')} disabled={!form.title || !form.slug} className="btn-primary-admin w-full">
                      Lanjut → Pilih Template
                    </button>
                  </div>
                )}

                {/* Step 2: Template */}
                {step === 'template' && (
                  <div className="space-y-4">
                    <p className="text-sm text-[#6F7F55]">Pilih tema undangan:</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-64 overflow-y-auto">
                      {templatePresets.map((tpl) => (
                        <div key={tpl.id}
                          onClick={() => setSelectedTemplate(tpl.id)}
                          className={`p-3 rounded-xl border-2 cursor-pointer transition-all text-center ${selectedTemplate === tpl.id ? 'border-[#C9A86A] bg-[#C9A86A]/5' : 'border-gray-100 hover:border-gray-200'}`}>
                          <span className="text-2xl block mb-1">{tpl.thumbnail}</span>
                          <p className="text-xs font-medium text-[#22382D]">{tpl.name}</p>
                          {tpl.isPremium && <span className="text-[10px] bg-[#C9A86A]/10 text-[#C9A86A] px-1.5 py-0.5 rounded-full">Premium</span>}
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => setStep('form')} className="btn-outline-admin flex-1"><ChevronLeft size={14} /> Kembali</button>
                      <button onClick={() => setStep('details')} className="btn-primary-admin flex-1">Lanjut → Detail</button>
                    </div>
                  </div>
                )}

                {/* Step 3: Details & Bank */}
                {step === 'details' && (
                  <div className="space-y-4">
                    <div>
                      <label className="label-admin font-semibold">📍 Venue Akad</label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <input className="input-admin" placeholder="Nama venue" value={form.venue_akad} onChange={e => setForm({...form, venue_akad: e.target.value})} />
                        <input className="input-admin" placeholder="Alamat lengkap" value={form.address_akad} onChange={e => setForm({...form, address_akad: e.target.value})} />
                      </div>
                    </div>
                    <div>
                      <label className="label-admin font-semibold">🎉 Venue Resepsi</label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <input className="input-admin" placeholder="Nama venue" value={form.venue_resepsi} onChange={e => setForm({...form, venue_resepsi: e.target.value})} />
                        <input className="input-admin" placeholder="Alamat lengkap" value={form.address_resepsi} onChange={e => setForm({...form, address_resepsi: e.target.value})} />
                      </div>
                    </div>

                    <div className="border-t pt-4">
                      <label className="label-admin font-semibold">💝 Rekening Hadiah (Opsional)</label>
                      <p className="text-xs text-[#A9B89B] mb-3">Isi minimal 1 rekening jika ingin menampilkan Wedding Gift</p>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-[#F7F1E6] rounded-xl">
                        <input className="input-admin bg-white" placeholder="Nama Bank" value={form.bank_name_1} onChange={e => setForm({...form, bank_name_1: e.target.value})} />
                        <input className="input-admin bg-white" placeholder="Nomor Rekening" value={form.bank_number_1} onChange={e => setForm({...form, bank_number_1: e.target.value})} />
                        <input className="input-admin bg-white" placeholder="Nama Pemilik" value={form.bank_holder_1} onChange={e => setForm({...form, bank_holder_1: e.target.value})} />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 mt-2 bg-[#F7F1E6] rounded-xl">
                        <input className="input-admin bg-white" placeholder="Nama Bank" value={form.bank_name_2} onChange={e => setForm({...form, bank_name_2: e.target.value})} />
                        <input className="input-admin bg-white" placeholder="Nomor Rekening" value={form.bank_number_2} onChange={e => setForm({...form, bank_number_2: e.target.value})} />
                        <input className="input-admin bg-white" placeholder="Nama Pemilik" value={form.bank_holder_2} onChange={e => setForm({...form, bank_holder_2: e.target.value})} />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 mt-2 bg-[#F7F1E6] rounded-xl">
                        <input className="input-admin bg-white" placeholder="Nama Bank (opsional)" value={form.bank_name_3} onChange={e => setForm({...form, bank_name_3: e.target.value})} />
                        <input className="input-admin bg-white" placeholder="Nomor (opsional)" value={form.bank_number_3} onChange={e => setForm({...form, bank_number_3: e.target.value})} />
                        <input className="input-admin bg-white" placeholder="Pemilik (opsional)" value={form.bank_holder_3} onChange={e => setForm({...form, bank_holder_3: e.target.value})} />
                      </div>
                    </div>

                    <div className="p-3 bg-[#F7F1E6] rounded-xl">
                      <p className="text-xs text-[#6F7F55]">
                        📎 URL: <code className="text-[#C9A86A]">/i/{form.slug || '...'}</code> &nbsp;|&nbsp;
                        {form.event_date && `${new Date(form.event_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <button onClick={() => setStep('template')} className="btn-outline-admin flex-1"><ChevronLeft size={14} /> Kembali</button>
                      <button onClick={handleCreate} disabled={saving} className="btn-primary-admin flex-1 flex items-center justify-center gap-2">
                        {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Check size={14} />}
                        {saving ? 'Menyimpan...' : 'Buat Undangan'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteId && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center" initial={{ scale: 0.9 }} animate={{ scale: 1 }}>
              <AlertTriangle size={40} className="mx-auto mb-3 text-[#B86B4B]" />
              <h3 className="text-lg font-bold text-[#22382D] mb-2">Hapus Undangan?</h3>
              <p className="text-sm text-[#A9B89B] mb-6">Data tamu, wishes, galeri, dan semua data terkait akan dihapus permanen.</p>
              <div className="flex gap-2">
                <button onClick={() => setDeleteId(null)} className="btn-outline-admin flex-1">Batal</button>
                <button onClick={handleDelete} className="btn-danger-admin flex-1 flex items-center justify-center gap-1">
                  <Trash2 size={14} /> Hapus
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
