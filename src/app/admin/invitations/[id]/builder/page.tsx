"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Save, Eye, Palette, Layout, Image, Settings, Users, Check, ChevronLeft, ChevronRight } from "lucide-react";
import { dummyInvitations, updateInvitation } from "@/lib/dummy-data";
import { templatePresets, applyTemplateToTheme } from "@/lib/templates";

const steps = [
  { id: 1, label: 'Basic Info', icon: Settings },
  { id: 2, label: 'Theme', icon: Palette },
  { id: 3, label: 'Sections', icon: Layout },
  { id: 4, label: 'Event Details', icon: Settings },
  { id: 5, label: 'Media', icon: Image },
  { id: 6, label: 'Guests', icon: Users },
  { id: 7, label: 'Publish', icon: Check },
];

export default function BuilderPage() {
  const invId = 'inv-001-andhika-laila';
  const [inv, setInv] = useState(() => dummyInvitations.find(i => i.id === invId)!);
  const [step, setStep] = useState(1);
  const [saved, setSaved] = useState(false);

  const [form, setForm] = useState({
    title: inv.title,
    slug: inv.slug,
    bride_name: inv.bride_name,
    groom_name: inv.groom_name,
    event_date: inv.event_date,
    status: inv.status,
  });

  const handleSave = () => {
    updateInvitation(invId, form as any);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const colors = [
    { name: 'Forest Green', hex: '#22382D' },
    { name: 'Olive', hex: '#6F7F55' },
    { name: 'Sage', hex: '#A9B89B' },
    { name: 'Cream', hex: '#F7F1E6' },
    { name: 'Gold', hex: '#C9A86A' },
    { name: 'Terracotta', hex: '#B86B4B' },
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#22382D]">Invitation Builder</h1>
          <p className="text-[#6F7F55] text-sm">{inv.title} • Step {step}/7</p>
        </div>
        <div className="flex gap-2">
          <a href={`/i/${inv.slug}`} target="_blank" className="btn-outline-admin flex items-center gap-1 text-xs">
            <Eye size={14} /> Preview
          </a>
          <button onClick={handleSave} className="btn-primary-admin flex items-center gap-1 text-xs">
            {saved ? <Check size={14} /> : <Save size={14} />} {saved ? 'Tersimpan' : 'Simpan'}
          </button>
        </div>
      </div>

      {/* Step Navigation */}
      <div className="flex items-center gap-1 overflow-x-auto pb-2">
        {steps.map((s, i) => (
          <div key={s.id} className="flex items-center">
            <button
              onClick={() => setStep(s.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                step === s.id ? 'bg-[#22382D] text-white' : step > s.id ? 'bg-[#6F7F55]/10 text-[#6F7F55]' : 'bg-white border border-[#22382D]/10 text-[#A9B89B]'
              }`}
            >
              {step > s.id ? <Check size={14} /> : <s.icon size={14} />}
              {s.label}
            </button>
            {i < steps.length - 1 && <ChevronRight size={14} className="text-[#A9B89B] mx-1 flex-shrink-0" />}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <motion.div
        key={step}
        className="card-admin"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Step 1: Basic Info */}
        {step === 1 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-lg text-[#22382D]">Basic Information</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="label-admin">Judul Undangan</label>
                <input className="input-admin" value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
              </div>
              <div>
                <label className="label-admin">Slug URL</label>
                <input className="input-admin" value={form.slug} onChange={e => setForm({...form, slug: e.target.value})} />
              </div>
              <div>
                <label className="label-admin">Nama Pengantin Wanita</label>
                <input className="input-admin" value={form.bride_name} onChange={e => setForm({...form, bride_name: e.target.value})} />
              </div>
              <div>
                <label className="label-admin">Nama Pengantin Pria</label>
                <input className="input-admin" value={form.groom_name} onChange={e => setForm({...form, groom_name: e.target.value})} />
              </div>
              <div>
                <label className="label-admin">Tanggal Acara</label>
                <input type="date" className="input-admin" value={form.event_date} onChange={e => setForm({...form, event_date: e.target.value})} />
              </div>
              <div>
                <label className="label-admin">Status</label>
                <select className="input-admin" value={form.status} onChange={e => setForm({...form, status: e.target.value as any})}>
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Theme */}
        {step === 2 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-lg text-[#22382D]">Theme Editor</h3>
            <p className="text-sm text-[#A9B89B]">Pilih template preset atau custom warna:</p>

            {/* Template Presets */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {templatePresets.map(tpl => (
                <button
                  key={tpl.id}
                  onClick={() => {
                    const theme = applyTemplateToTheme(tpl);
                    updateInvitation(invId, { theme: theme as any });
                  }}
                  className={`p-3 rounded-xl border-2 text-left transition-all hover:shadow-md ${
                    tpl.id === 'modern-organic-luxury'
                      ? 'border-[#6F7F55] bg-[#6F7F55]/5'
                      : 'border-[#22382D]/10 hover:border-[#C9A86A]/50'
                  }`}
                >
                  <div className="text-2xl mb-2">{tpl.thumbnail}</div>
                  <p className="text-sm font-semibold text-[#22382D]">{tpl.name}</p>
                  <p className="text-xs text-[#A9B89B] mt-1">{tpl.description.slice(0, 60)}...</p>
                  {tpl.isPremium && <span className="inline-block mt-1 badge badge-warning text-xs">Premium</span>}
                  <div className="flex gap-1 mt-2">
                    {Object.values(tpl.colors).slice(0, 4).map((c, i) => (
                      <div key={i} className="w-4 h-4 rounded-full border border-white shadow-sm" style={{ backgroundColor: c }} />
                    ))}
                  </div>
                </button>
              ))}
            </div>

            <div className="border-t border-[#22382D]/10 pt-4">
              <p className="text-sm font-medium text-[#22382D] mb-3">Aktif: Modern Organic Luxury</p>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                {colors.map(c => (
                  <div key={c.hex} className="text-center">
                    <div className="w-full aspect-square rounded-xl shadow-md mb-2" style={{ backgroundColor: c.hex }} />
                    <p className="text-xs text-[#22382D]">{c.name}</p>
                    <p className="text-xs text-[#A9B89B]">{c.hex}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Sections */}
        {step === 3 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-lg text-[#22382D]">Section Manager</h3>
            <p className="text-sm text-[#A9B89B]">Enable/disable dan atur urutan section undangan</p>
            {['Opening Cover', 'Hero Section', 'Couple Profile', 'Event Details', 'Love Story', 'Gallery', 'RSVP', 'QR Guest Pass', 'Digital Gift', 'Wishes', 'Closing'].map((s, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-[#F7F1E6] rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="text-xs text-[#A9B89B] w-6">{String(i + 1).padStart(2, '0')}</span>
                  <span className="text-sm font-medium text-[#22382D]">{s}</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked className="sr-only peer" />
                  <div className="w-9 h-5 bg-[#A9B89B] rounded-full peer peer-checked:bg-[#6F7F55] peer-focus:ring-2 peer-focus:ring-[#6F7F55]/30 after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full" />
                </label>
              </div>
            ))}
          </div>
        )}

        {/* Step 4: Event Details */}
        {step === 4 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-lg text-[#22382D]">Event Details</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <p className="font-medium text-sm text-[#6F7F55]">Akad Nikah</p>
                <input className="input-admin" placeholder="Judul" defaultValue="Akad Nikah" />
                <input className="input-admin" placeholder="Waktu" defaultValue="08:00 - 10:00 WIB" />
                <input className="input-admin" placeholder="Venue" defaultValue="Masjid Agung Al-Muhajirin" />
                <input className="input-admin" placeholder="Alamat" defaultValue="Jl. Ahmad Yani No. 15, Bandung" />
              </div>
              <div className="space-y-3">
                <p className="font-medium text-sm text-[#6F7F55]">Resepsi</p>
                <input className="input-admin" placeholder="Judul" defaultValue="Resepsi" />
                <input className="input-admin" placeholder="Waktu" defaultValue="11:00 - 17:00 WIB" />
                <input className="input-admin" placeholder="Venue" defaultValue="Gedung Graha Wedding Garden" />
                <input className="input-admin" placeholder="Alamat" defaultValue="Jl. Sukajadi No. 200, Bandung" />
              </div>
            </div>
          </div>
        )}

        {/* Step 5: Media Quick */}
        {step === 5 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-lg text-[#22382D]">Media Quick Setup</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {['Cover', 'Hero', 'Bride', 'Groom'].map(role => (
                <div key={role} className="text-center p-4 bg-[#F7F1E6] rounded-xl">
                  <div className="w-full aspect-square bg-[#A9B89B]/20 rounded-lg mb-2 flex items-center justify-center">
                    <Image size={32} className="text-[#A9B89B]" />
                  </div>
                  <p className="text-sm font-medium text-[#22382D]">{role}</p>
                  <button className="text-xs text-[#C9A86A] hover:underline mt-1">Replace</button>
                </div>
              ))}
            </div>
            <p className="text-xs text-[#A9B89B]">Kelola lengkap di halaman Media Library</p>
          </div>
        )}

        {/* Step 6: Guests Quick */}
        {step === 6 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-lg text-[#22382D]">Guest Setup</h3>
            <p className="text-sm text-[#A9B89B]">8 tamu sudah terdaftar. Kelola lengkap di halaman Manajemen Tamu.</p>
            <a href={`/admin/invitations/${invId}/guests`} className="btn-primary-admin inline-flex items-center gap-2 text-xs">
              <Users size={14} /> Kelola Tamu →
            </a>
          </div>
        )}

        {/* Step 7: Publish */}
        {step === 7 && (
          <div className="space-y-4 text-center py-8">
            <div className="w-16 h-16 rounded-full bg-[#6F7F55]/10 flex items-center justify-center mx-auto mb-4">
              <Check size={32} className="text-[#6F7F55]" />
            </div>
            <h3 className="font-semibold text-xl text-[#22382D]">Siap Publish!</h3>
            <p className="text-[#6F7F55] text-sm max-w-sm mx-auto">
              Undangan Anda siap dipublikasikan. Pastikan semua konten, gambar, dan tamu sudah benar.
            </p>
            <div className="flex justify-center gap-3 mt-4">
              <button onClick={() => { setForm({...form, status: 'published'}); handleSave(); }} className="btn-secondary-admin text-sm">
                Publish Undangan
              </button>
              <a href={`/i/${form.slug}`} target="_blank" className="btn-outline-admin text-sm flex items-center gap-1">
                <Eye size={14} /> Preview
              </a>
            </div>
          </div>
        )}
      </motion.div>

      {/* Navigation */}
      <div className="flex justify-between">
        <button onClick={() => setStep(Math.max(1, step - 1))} disabled={step === 1} className="btn-outline-admin flex items-center gap-1 text-xs disabled:opacity-40">
          <ChevronLeft size={14} /> Sebelumnya
        </button>
        <button onClick={() => setStep(Math.min(7, step + 1))} disabled={step === 7} className="btn-primary-admin flex items-center gap-1 text-xs disabled:opacity-40">
          Selanjutnya <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}
