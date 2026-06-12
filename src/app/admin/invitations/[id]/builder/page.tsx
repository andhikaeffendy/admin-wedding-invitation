"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import NextLink from "next/link";
import { motion } from "framer-motion";
import { Save, Eye, Palette, Layout, Settings, Check, ExternalLink, QrCode, Users, Link as LinkIcon, MessageCircle, Download, Copy } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { templatePresets, type TemplatePreset } from "@/lib/templates";

const WEDDING_URL = process.env.NEXT_PUBLIC_WEDDING_URL || 'https://wedding-invitation-liart-alpha.vercel.app';

export default function BuilderPage() {
  const params = useParams();
  const invitationId = params.id as string;

  const [inv, setInv] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [tab, setTab] = useState<'info' | 'theme' | 'details' | 'guests' | 'story'>('info');
  const [guests, setGuests] = useState<any[]>([]);
  const [stories, setStories] = useState<any[]>([]);
  const [musicUrl, setMusicUrl] = useState('');
  const [copiedGuest, setCopiedGuest] = useState<string | null>(null);
  const [showQrGuest, setShowQrGuest] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: '', slug: '',
    bride_name: '', groom_name: '',
    bride_full_name: '', groom_full_name: '',
    bride_parents: '', groom_parents: '',
    event_date: '', status: 'published',
  });

  // Fetch invitation data
  useEffect(() => {
    fetch(`/api/data/invitations/${invitationId}`)
      .then(r => r.json())
      .then(data => {
        setInv(data);
        setForm({
          title: data.title || '', slug: data.slug || '',
          bride_name: data.bride_name || '', groom_name: data.groom_name || '',
          bride_full_name: data.bride_full_name || '', groom_full_name: data.groom_full_name || '',
          bride_parents: data.bride_parents || '', groom_parents: data.groom_parents || '',
          event_date: data.event_date || '', status: data.status || 'published',
        });
        setSelectedTemplate(data.template_id || data.theme?.id || 'modern-organic-luxury');
        setLoading(false);
      })
      .catch(() => setLoading(false));
    fetch(`/api/data/guests?invitation_id=${invitationId}`)
      .then(r => r.json())
      .then(data => setGuests(data))
      .catch(() => {});
    fetch(`/api/data/love-stories?invitation_id=${invitationId}`)
      .then(r => r.json())
      .then(data => setStories(data))
      .catch(() => {});
  }, [invitationId]);

  // Load settings.musicUrl
  useEffect(() => {
    if (inv) {
      const settings = typeof inv.settings === 'string' ? JSON.parse(inv.settings) : (inv.settings || {});
      setMusicUrl(settings.musicUrl || '');
    }
  }, [inv]);

  const handleSave = async () => {
    setSaving(true);
    const payload: any = {
      ...form,
      template_id: selectedTemplate,
      theme: { id: selectedTemplate },
      settings: { musicUrl },
    };
    await fetch(`/api/data/invitations/${invitationId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    setSaved(true);
    setSaving(false);
    setTimeout(() => setSaved(false), 2000);
  };

  if (loading) return (
    <div className="animate-pulse space-y-4 max-w-4xl mx-auto">
      <div className="h-8 w-48 bg-gray-100 rounded" />
      <div className="h-64 bg-gray-100 rounded-xl" />
    </div>
  );

  if (!inv) return (
    <div className="text-center py-20">
      <p className="text-lg text-[#A9B89B]">Undangan tidak ditemukan</p>
    </div>
  );

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#22382D]">Invitation Builder</h1>
          <p className="text-[#6F7F55] text-sm">{form.title} • {invitationId}</p>
        </div>
        <div className="flex gap-2">
          <a href={`${WEDDING_URL}/i/${form.slug}`} target="_blank" className="btn-outline-admin flex items-center gap-1 text-xs">
            <ExternalLink size={14} /> Preview
          </a>
          <button onClick={handleSave} disabled={saving} className="btn-primary-admin flex items-center gap-1 text-xs">
            {saved ? <Check size={14} /> : <Save size={14} />}
            {saving ? 'Menyimpan...' : saved ? 'Tersimpan!' : 'Simpan'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b pb-2 overflow-x-auto">
        {[
          { id: 'info', label: '📝 Basic Info', icon: Settings },
          { id: 'theme', label: '🎨 Template', icon: Palette },
          { id: 'details', label: '📋 Details', icon: Layout },
          { id: 'story', label: `💕 Story (${stories.length})`, icon: MessageCircle },
          { id: 'guests', label: `👥 Tamu (${guests.length})`, icon: Users },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id as any)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${tab === t.id ? 'bg-[#22382D] text-white' : 'text-[#6F7F55] hover:bg-gray-100'}`}>
            {t.icon && <t.icon size={16} className="inline mr-1.5" />}
            {t.label}
          </button>
        ))}
      </div>

      {/* Info Tab */}
      {tab === 'info' && (
        <div className="card-admin space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className="label-admin">Judul</label><input className="input-admin" value={form.title} onChange={e => setForm({...form, title: e.target.value})} /></div>
            <div><label className="label-admin">Slug</label><input className="input-admin" value={form.slug} onChange={e => setForm({...form, slug: e.target.value})} /></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className="label-admin">Pengantin Wanita</label><input className="input-admin" value={form.bride_name} onChange={e => setForm({...form, bride_name: e.target.value})} /></div>
            <div><label className="label-admin">Pengantin Pria</label><input className="input-admin" value={form.groom_name} onChange={e => setForm({...form, groom_name: e.target.value})} /></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className="label-admin">Nama Lengkap Wanita</label><input className="input-admin" value={form.bride_full_name} onChange={e => setForm({...form, bride_full_name: e.target.value})} /></div>
            <div><label className="label-admin">Nama Lengkap Pria</label><input className="input-admin" value={form.groom_full_name} onChange={e => setForm({...form, groom_full_name: e.target.value})} /></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className="label-admin">Tanggal Acara</label><input type="date" className="input-admin" value={form.event_date} onChange={e => setForm({...form, event_date: e.target.value})} /></div>
            <div><label className="label-admin">Status</label>
              <select className="input-admin" value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>
          </div>
          <div><label className="label-admin">🎵 Music URL</label><input className="input-admin" value={musicUrl} onChange={e => setMusicUrl(e.target.value)} placeholder="https://example.com/music.mp3" /><p className="text-[10px] text-[#A9B89B] mt-1">URL file MP3 untuk background music</p></div>
        </div>
      )}

      {/* Theme Tab — Visual Preview Gallery */}
      {tab === 'theme' && (
        <div className="card-admin">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-[#6F7F55]">Pilih template — perubahan langsung tersimpan setelah klik Simpan</p>
            <div className="flex items-center gap-2 text-[10px] text-[#6F7F55]">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#C9A86A]"></span> Premium</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#22382D]"></span> Gratis</span>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {templatePresets.map((tpl) => (
              <motion.div
                key={tpl.id}
                onClick={() => setSelectedTemplate(tpl.id)}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className={`relative overflow-hidden rounded-xl border-2 cursor-pointer transition-all ${selectedTemplate === tpl.id ? 'border-[#C9A86A] ring-2 ring-[#C9A86A]/20' : 'border-gray-100 hover:border-gray-200'}`}
                style={{ borderRadius: `${tpl.cardRadius}px` }}
              >
                {/* Color Palette Bar */}
                <div className="flex h-3">
                  <div className="flex-1" style={{ backgroundColor: tpl.colors.primary }} />
                  <div className="flex-1" style={{ backgroundColor: tpl.colors.bg }} />
                  <div className="flex-1" style={{ backgroundColor: tpl.colors.gold }} />
                  <div className="flex-1" style={{ backgroundColor: tpl.colors.terracotta }} />
                </div>

                {/* Preview Area */}
                <div className="p-4 text-center" style={{ backgroundColor: tpl.colors.bg }}>
                  {/* Ornament */}
                  <div className="flex justify-center gap-1 mb-2">
                    {[...Array(tpl.ornamentDensity === 'high' ? 3 : 1)].map((_, i) => (
                      <span key={i} className="text-lg opacity-60">{tpl.thumbnail}</span>
                    ))}
                  </div>

                  {/* Mock card */}
                  <div className="mx-auto mb-3 p-3 rounded-lg border max-w-[140px]" style={{ borderColor: `${tpl.colors.gold}30`, backgroundColor: `${tpl.colors.bg}`, borderRadius: `${tpl.cardRadius * 0.6}px` }}>
                    <div className="h-1 w-8 mx-auto mb-2 rounded-full" style={{ backgroundColor: tpl.colors.gold }} />
                    <div className="h-2 w-12 mx-auto mb-1 rounded-full" style={{ backgroundColor: `${tpl.colors.primary}20` }} />
                    <div className="h-1.5 w-16 mx-auto rounded-full" style={{ backgroundColor: `${tpl.colors.primary}15` }} />
                  </div>

                  {/* Name */}
                  <p className="text-xs font-medium mb-0.5" style={{ color: tpl.colors.primary, fontFamily: tpl.fontHeading }}>
                    {tpl.name}
                  </p>
                  <p className="text-[10px] opacity-50" style={{ color: tpl.colors.primary }}>
                    {tpl.fontHeading} • {tpl.fontBody}
                  </p>

                  {/* Premium Badge */}
                  {tpl.isPremium && (
                    <span className="absolute top-2 right-2 text-[9px] bg-[#C9A86A]/20 text-[#C9A86A] px-2 py-0.5 rounded-full font-medium">
                      ★ Premium
                    </span>
                  )}

                  {/* Selected Checkmark */}
                  {selectedTemplate === tpl.id && (
                    <div className="absolute top-2 left-2 w-5 h-5 rounded-full bg-[#C9A86A] flex items-center justify-center">
                      <Check size={12} className="text-white" />
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Details Tab */}
      {tab === 'details' && (
        <div className="card-admin space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className="label-admin">Orang Tua Wanita</label><textarea className="input-admin" rows={2} value={form.bride_parents} onChange={e => setForm({...form, bride_parents: e.target.value})} /></div>
            <div><label className="label-admin">Orang Tua Pria</label><textarea className="input-admin" rows={2} value={form.groom_parents} onChange={e => setForm({...form, groom_parents: e.target.value})} /></div>
          </div>
          <div className="p-4 bg-[#F7F1E6] rounded-xl text-xs text-[#6F7F55]">
            📎 Public URL: <code className="text-[#C9A86A]">{WEDDING_URL}/i/{form.slug}</code>
            <br />🎨 Template: <strong>{templatePresets.find(t => t.id === selectedTemplate)?.name || selectedTemplate}</strong>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-6 p-6 bg-white rounded-xl border">
            <div id="invitation-qr" className="flex-shrink-0 p-3 bg-white rounded-xl shadow-inner border">
              <QRCodeSVG
                value={`${WEDDING_URL}/i/${form.slug}`}
                size={150}
                level="H"
                fgColor="#22382D"
                bgColor="#FFFFFF"
              />
            </div>
            <div className="text-center sm:text-left">
              <div className="flex items-center gap-2 mb-2">
                <QrCode size={18} className="text-[#C9A86A]" />
                <h3 className="font-semibold text-[#22382D]">QR Code Undangan</h3>
              </div>
              <p className="text-xs text-[#6F7F55] mb-3">Scan untuk membuka undangan. QR ini bisa di download dan disebarkan ke tamu.</p>
              <button
                onClick={() => {
                  const svg = document.querySelector('#invitation-qr svg');
                  if (svg) {
                    const svgData = new XMLSerializer().serializeToString(svg);
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    const img = new Image();
                    img.onload = () => {
                      canvas.width = 300; canvas.height = 300;
                      ctx?.drawImage(img, 0, 0);
                      const link = document.createElement('a');
                      link.download = `QR-Undangan-${form.slug}.png`;
                      link.href = canvas.toDataURL();
                      link.click();
                    };
                    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
                  }
                }}
                className="btn-outline-admin text-xs flex items-center gap-1"
              >
                <ExternalLink size={12} /> Download QR
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Story Tab — Love Story Timeline */}
      {tab === 'story' && (
        <div className="card-admin">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-[#22382D]">💕 Our Story — Kisah Cinta</h3>
            <button onClick={() => setStories([...stories, { id: `new-${Date.now()}`, title: '', date: '', description: '', image_url: '', sort_order: stories.length, is_visible: true }])}
              className="btn-primary-admin text-xs px-3 py-1.5">+ Tambah Cerita</button>
          </div>
          <p className="text-xs text-[#A9B89B] mb-4">Klik Save setelah menambah/mengubah cerita. Data akan tersimpan ke database.</p>
          <div className="space-y-3">
            {stories.map((s: any, i: number) => (
              <div key={s.id || i} className="p-4 rounded-xl border border-[#C9A86A]/15 bg-white">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-[#22382D]">Cerita #{i + 1}</span>
                  <button onClick={() => {
                    const updated = stories.filter((_:any,j:number) => j !== i);
                    setStories(updated);
                    if (s.id && !String(s.id).startsWith('new-')) {
                      fetch(`/api/data/love-stories?id=${s.id}`, { method: 'DELETE' }).catch(()=>{});
                    }
                  }} className="text-[10px] text-red-500 hover:text-red-600">Hapus</button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div><label className="text-[10px] text-[#6F7F55]">Judul</label><input className="input-admin text-sm" value={s.title || ''} onChange={e => { const u = [...stories]; u[i] = {...u[i], title: e.target.value}; setStories(u); }} placeholder="First Meet" /></div>
                  <div><label className="text-[10px] text-[#6F7F55]">Tahun/Tanggal</label><input className="input-admin text-sm" value={s.date || ''} onChange={e => { const u = [...stories]; u[i] = {...u[i], date: e.target.value}; setStories(u); }} placeholder="2023" /></div>
                </div>
                <div className="mt-2"><label className="text-[10px] text-[#6F7F55]">Deskripsi</label><textarea className="input-admin text-sm" rows={2} value={s.description || ''} onChange={e => { const u = [...stories]; u[i] = {...u[i], description: e.target.value}; setStories(u); }} placeholder="Ceritakan momen spesial..." /></div>
                <div className="mt-2"><label className="text-[10px] text-[#6F7F55]">URL Gambar (opsional)</label><input className="input-admin text-sm" value={s.image_url || ''} onChange={e => { const u = [...stories]; u[i] = {...u[i], image_url: e.target.value}; setStories(u); }} placeholder="https://images.unsplash.com/..." /></div>
                <div className="flex gap-2 mt-3">
                  <button onClick={async () => {
                    try {
                      const method = String(s.id).startsWith('new-') ? 'POST' : 'PATCH';
                      const body: any = { invitation_id: invitationId, title: s.title, date: s.date, description: s.description, image_url: s.image_url, sort_order: i, is_visible: true };
                      if (method === 'PATCH') body.id = s.id;
                      const res = await fetch('/api/data/love-stories', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
                      if (res.ok) { const saved = await res.json(); const u = [...stories]; u[i] = saved; setStories(u); }
                    } catch {}
                  }} className="btn-primary-admin text-[10px] px-3 py-1">💾 Simpan Cerita</button>
                </div>
              </div>
            ))}
            {stories.length === 0 && <p className="text-center text-xs text-[#A9B89B] py-8">Belum ada cerita. Klik "+ Tambah Cerita" untuk memulai.</p>}
          </div>
        </div>
      )}

      {/* Guests Tab — Per-guest QR & Share Links */}
      {tab === 'guests' && (
        <div className="card-admin">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-[#22382D]">Daftar Tamu & QR</h3>
            <NextLink
              href={`/admin/invitations/${invitationId}/guests`}
              className="text-xs text-[#C9A86A] hover:underline"
            >
              Kelola Semua Tamu →
            </NextLink>
          </div>
          {guests.length === 0 ? (
            <div className="text-center py-8 text-[#A9B89B] text-sm">
              <Users size={32} className="mx-auto mb-2 opacity-40" />
              <p>Belum ada tamu. Tambah tamu di halaman Manajemen Tamu.</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
              {guests.map((g: any) => (
                <motion.div
                  key={g.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-4 p-3 rounded-xl bg-[#F7F1E6]/50 border border-[#C9A86A]/10 hover:border-[#C9A86A]/30 transition-all"
                >
                  {/* Small QR */}
                  <div
                    id={`builder-qr-${g.id}`}
                    className="flex-shrink-0 p-1.5 bg-white rounded-lg shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => setShowQrGuest(showQrGuest === g.id ? null : g.id)}
                    title="Klik untuk perbesar"
                  >
                    <QRCodeSVG
                      value={`${WEDDING_URL}/i/${form.slug}?guest=${g.guest_token}`}
                      size={48}
                      level="M"
                      fgColor="#22382D"
                      bgColor="#FFFFFF"
                    />
                  </div>

                  {/* Guest details */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-[#22382D] truncate">{g.guest_name}</p>
                    <p className="text-[10px] text-[#A9B89B]">
                      {g.category} • {g.pax_allocated} pax
                      {g.rsvp_status && (
                        <span className={`ml-1 ${g.rsvp_status === 'Hadir' ? 'text-[#6F7F55]' : 'text-[#B86B4B]'}`}>
                          • {g.rsvp_status}
                        </span>
                      )}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(`${WEDDING_URL}/i/${form.slug}?guest=${g.guest_token}`);
                        setCopiedGuest(g.id);
                        setTimeout(() => setCopiedGuest(null), 1500);
                      }}
                      className={`p-2 rounded-lg text-[10px] transition-all ${copiedGuest === g.id ? 'bg-[#6F7F55]/10 text-[#6F7F55]' : 'hover:bg-[#22382D]/10 text-[#6F7F55]'}`}
                      title="Salin link tamu"
                    >
                      {copiedGuest === g.id ? <Check size={14} /> : <Copy size={14} />}
                    </button>
                    <a
                      href={`https://wa.me/?text=${encodeURIComponent(`Undangan Pernikahan ${form.groom_name} & ${form.bride_name}\n\nLink: ${WEDDING_URL}/i/${form.slug}?guest=${g.guest_token}`)}`}
                      target="_blank"
                      className="p-2 rounded-lg hover:bg-[#25D366]/10 text-[#25D366]"
                      title="Kirim via WhatsApp"
                    >
                      <MessageCircle size={14} />
                    </a>
                    <button
                      onClick={() => {
                        const svg = document.querySelector(`#builder-qr-${CSS.escape(g.id)} svg`);
                        if (svg) {
                          const svgData = new XMLSerializer().serializeToString(svg);
                          const canvas = document.createElement('canvas');
                          const ctx = canvas.getContext('2d');
                          const img = new Image();
                          img.onload = () => {
                            canvas.width = 150; canvas.height = 150;
                            ctx?.drawImage(img, 0, 0);
                            const link = document.createElement('a');
                            link.download = `QR-${g.guest_name.replace(/\s+/g, '-')}.png`;
                            link.href = canvas.toDataURL();
                            link.click();
                          };
                          img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
                        }
                      }}
                      className="p-2 rounded-lg hover:bg-[#C9A86A]/10 text-[#C9A86A]"
                      title="Download QR"
                    >
                      <Download size={14} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Enlarged QR preview */}
          {showQrGuest && (() => {
            const g = guests.find(x => x.id === showQrGuest);
            if (!g) return null;
            return (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-4 p-6 bg-white rounded-xl border text-center"
              >
                <p className="font-medium text-[#22382D] text-sm mb-1">{g.guest_name}</p>
                <p className="text-[10px] text-[#6F7F55] mb-3">Scan QR untuk check-in atau buka undangan</p>
                <div className="flex justify-center mb-3" id={`builder-qr-big-${g.id}`}>
                  <div className="p-3 bg-white rounded-xl shadow-inner border">
                    <QRCodeSVG
                      value={`${WEDDING_URL}/i/${form.slug}?guest=${g.guest_token}`}
                      size={160}
                      level="H"
                      fgColor="#22382D"
                      bgColor="#FFFFFF"
                    />
                  </div>
                </div>
                <p className="text-[10px] text-[#6F7F55] mb-2 break-all">
                  {WEDDING_URL}/i/{form.slug}?guest={g.guest_token}
                </p>
                <button
                  onClick={() => setShowQrGuest(null)}
                  className="text-xs text-[#A9B89B] hover:text-[#6F7F55]"
                >
                  Tutup
                </button>
              </motion.div>
            );
          })()}
        </div>
      )}
    </div>
  );
}
