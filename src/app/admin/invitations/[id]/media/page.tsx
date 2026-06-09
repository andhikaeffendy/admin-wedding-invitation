"use client";
import { useState, useRef, useEffect } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { Upload, Trash2, Eye, X } from "lucide-react";

const roleLabels: Record<string, string> = { cover: 'Cover', hero: 'Hero', bride: 'Pengantin Wanita', groom: 'Pengantin Pria', gallery: 'Galeri', background: 'Background' };

export default function MediaPage() {
  const params = useParams();
  const invitationId = params.id as string;
  const [assets, setAssets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterRole, setFilterRole] = useState("");
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem(`media-${invitationId}`) : null;
    const defaults = [
      { id: 'med-001', role: 'cover', public_url: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=400&q=80', alt_text: 'Cover', sort_order: 0 },
      { id: 'med-002', role: 'hero', public_url: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=400&q=80', alt_text: 'Hero', sort_order: 0 },
      { id: 'med-003', role: 'bride', public_url: 'https://images.unsplash.com/photo-1594552073388-6e3f45e83df6?w=200&q=80', alt_text: 'Bride', sort_order: 0 },
      { id: 'med-004', role: 'groom', public_url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&q=80', alt_text: 'Groom', sort_order: 0 },
      { id: 'med-005', role: 'gallery', public_url: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=300&q=80', alt_text: 'Gallery 1', sort_order: 1 },
      { id: 'med-006', role: 'gallery', public_url: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=300&q=80', alt_text: 'Gallery 2', sort_order: 2 },
      { id: 'med-007', role: 'gallery', public_url: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=300&q=80', alt_text: 'Gallery 3', sort_order: 3 },
      { id: 'med-008', role: 'gallery', public_url: 'https://images.unsplash.com/photo-1507504031003-b417219a0fde?w=300&q=80', alt_text: 'Gallery 4', sort_order: 4 },
    ];
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const merged = defaults.map(d => parsed.find((p: any) => p.id === d.id) || d);
        const extra = parsed.filter((p: any) => !defaults.find(d => d.id === p.id));
        setAssets([...merged, ...extra]);
      } catch { setAssets(defaults); }
    } else { setAssets(defaults); }
    setLoading(false);
  }, [invitationId]);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { alert('File terlalu besar (max 5MB)'); return; }
    setUploading(true);
    const reader = new FileReader();
    reader.onload = () => {
      const newAsset = { id: `med-${Date.now()}`, role: filterRole || 'gallery', public_url: reader.result as string, alt_text: file.name.replace(/\.[^.]+$/, ''), sort_order: assets.length };
      const updated = [...assets, newAsset];
      setAssets(updated);
      localStorage.setItem(`media-${invitationId}`, JSON.stringify(updated));
      setUploading(false);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleDelete = (id: string) => {
    const updated = assets.filter(a => a.id !== id);
    setAssets(updated);
    localStorage.setItem(`media-${invitationId}`, JSON.stringify(updated));
  };

  const filtered = filterRole ? assets.filter(a => a.role === filterRole) : assets;
  const roles = [...new Set(assets.map((a: any) => a.role))];

  if (loading) return <div className="animate-pulse space-y-4"><div className="h-8 w-48 bg-gray-100 rounded" /><div className="grid grid-cols-4 gap-4">{[1,2,3,4].map(i => <div key={i} className="aspect-square bg-gray-100 rounded-xl" />)}</div></div>;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#22382D]">Media Library</h1>
          <p className="text-[#6F7F55] text-sm">{assets.length} file — undangan {invitationId}</p>
        </div>
        <label className={`btn-primary-admin flex items-center gap-2 text-xs cursor-pointer ${uploading ? 'opacity-50' : ''}`}>
          {uploading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Upload size={14} />}
          {uploading ? 'Uploading...' : 'Upload Gambar'}
          <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleUpload} className="hidden" />
        </label>
      </div>

      <div className="flex gap-2 flex-wrap">
        <button onClick={() => setFilterRole("")} className={`px-3 py-1.5 rounded-full text-xs font-medium ${!filterRole ? 'bg-[#22382D] text-white' : 'bg-white border text-[#6F7F55]'}`}>Semua ({assets.length})</button>
        {roles.map((role: string) => (
          <button key={role} onClick={() => setFilterRole(role)} className={`px-3 py-1.5 rounded-full text-xs font-medium ${filterRole === role ? 'bg-[#22382D] text-white' : 'bg-white border text-[#6F7F55]'}`}>{roleLabels[role] || role} ({assets.filter((a: any) => a.role === role).length})</button>
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {filtered.map((asset: any) => (
          <motion.div key={asset.id} className="card-admin group relative p-2" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div className="relative aspect-square rounded-lg overflow-hidden bg-[#F7F1E6] mb-2">
              <img src={asset.public_url} alt={asset.alt_text} className="w-full h-full object-cover" loading="lazy" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                <button onClick={() => setPreviewUrl(asset.public_url)} className="p-2 bg-white rounded-full shadow"><Eye size={14} /></button>
              </div>
              <span className="absolute top-2 left-2 badge bg-white/90 text-[#22382D] text-xs">{roleLabels[asset.role] || asset.role}</span>
            </div>
            <p className="text-xs text-[#22382D] truncate">{asset.alt_text}</p>
            <button onClick={() => handleDelete(asset.id)} className="absolute top-3 right-3 p-1 bg-white/80 rounded-full opacity-0 group-hover:opacity-100 text-[#B86B4B]"><Trash2 size={12} /></button>
          </motion.div>
        ))}
      </div>

      {previewUrl && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={() => setPreviewUrl(null)}>
          <button onClick={() => setPreviewUrl(null)} className="absolute top-6 right-6 text-white"><X size={28} /></button>
          <img src={previewUrl} alt="Preview" className="max-h-[85vh] max-w-[90vw] object-contain rounded-lg" onClick={e => e.stopPropagation()} />
        </div>
      )}
    </div>
  );
}
