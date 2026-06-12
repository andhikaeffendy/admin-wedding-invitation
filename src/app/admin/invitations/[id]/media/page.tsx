"use client";
import { useState, useRef, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Upload, Trash2, Eye, X, RefreshCw, Loader2, CheckCircle } from 'lucide-react';
import CoverSlot from '@/components/CoverSlot';

const roleLabels: Record<string, string> = { cover: 'Cover', hero: 'Hero', video: 'Video Hero', bride: 'Pengantin Wanita', groom: 'Pengantin Pria', gallery: 'Galeri', background: 'Background' };
const VIDEO_MAX_SIZE = 50 * 1024 * 1024; // 50MB for video

export default function MediaPage() {
  const params = useParams();
  const invitationId = params.id as string;
  const [assets, setAssets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterRole, setFilterRole] = useState("");
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [heroImage, setHeroImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchGallery = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/data/gallery?invitation_id=${invitationId}`);
      if (res.ok) {
        const data = await res.json();
        setAssets(Array.isArray(data) ? data : []);
      } else {
        // API failed — fall back to localStorage
        try {
          const saved = localStorage.getItem(`invitation-media-${invitationId}`);
          if (saved) setAssets(JSON.parse(saved));
          else setAssets([]);
        } catch { setAssets([]); }
      }
    } catch {
      // Network error — fall back to localStorage
      try {
        const saved = localStorage.getItem(`invitation-media-${invitationId}`);
        if (saved) setAssets(JSON.parse(saved));
        else setAssets([]);
      } catch { setAssets([]); }
    }
    setLoading(false);
  }, [invitationId]);

  // Fetch invitation settings for cover/hero images
  const fetchInvitationSettings = useCallback(async () => {
    try {
      const res = await fetch(`/api/data/invitations/${invitationId}`);
      if (res.ok) {
        const inv = await res.json();
        const settings = typeof inv.settings === 'string' ? JSON.parse(inv.settings) : (inv.settings || {});
        setCoverImage(settings.coverImage || null);
        setHeroImage(settings.heroImage || null);
      }
    } catch { /* Silently fail */ }
  }, [invitationId]);

  const handleCoverUpdate = (url: string | null) => { setCoverImage(url); fetchGallery(); };
  const handleHeroUpdate = (url: string | null) => { setHeroImage(url); fetchGallery(); };

  useEffect(() => { fetchGallery(); fetchInvitationSettings(); }, [fetchGallery]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const isVideo = file.type.startsWith('video/');
    const maxSize = isVideo ? VIDEO_MAX_SIZE : 5 * 1024 * 1024;
    if (file.size > maxSize) { setError(isVideo ? 'Video terlalu besar (max 50MB)' : 'File terlalu besar (max 5MB)'); return; }
    setUploading(true);
    setError(null);

    try {
      // Convert to base64 data URL
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const role = filterRole || 'gallery';
      // Save to Supabase gallery API
      const res = await fetch('/api/data/gallery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invitation_id: invitationId,
          role,
          public_url: dataUrl,
          alt_text: file.name.replace(/\.[^.]+$/, ''),
          sort_order: assets.length,
        }),
      });

      if (res.ok) {
        const newAsset = await res.json();
        setAssets(prev => [...prev, newAsset]);
      } else {
        // API failed — save to localStorage as fallback
        const newAsset = {
          id: `med-${Date.now()}`,
          invitation_id: invitationId,
          role,
          public_url: dataUrl,
          alt_text: file.name.replace(/\.[^.]+$/, ''),
          sort_order: assets.length,
          created_at: new Date().toISOString(),
        };
        const updated = [...assets, newAsset];
        setAssets(updated);
        localStorage.setItem(`invitation-media-${invitationId}`, JSON.stringify(updated));
      }
    } catch {
      setError('Upload gagal. Coba lagi.');
    }
    setUploading(false);
    e.target.value = '';
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/data/gallery?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setAssets(prev => prev.filter(a => a.id !== id));
      } else {
        // Fallback: remove from localStorage
        const updated = assets.filter(a => a.id !== id);
        setAssets(updated);
        localStorage.setItem(`invitation-media-${invitationId}`, JSON.stringify(updated));
      }
    } catch {
      const updated = assets.filter(a => a.id !== id);
      setAssets(updated);
      localStorage.setItem(`invitation-media-${invitationId}`, JSON.stringify(updated));
    }
  };

  // When role changes to 'cover' or 'hero', also update invitation settings
  const handleRoleChange = async (id: string, newRole: string) => {
    try {
      const res = await fetch('/api/data/gallery', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, role: newRole }),
      });
      const asset = assets.find(a => a.id === id);
      const imageUrl = asset?.public_url || '';
      if (res.ok) {
        const updated = assets.map(a => a.id === id ? { ...a, role: newRole } : a);
        setAssets(updated);
        // If role is 'cover' or 'hero', update invitation settings too
        if ((newRole === 'cover' || newRole === 'hero') && imageUrl) {
          updateInvitationCoverImage(newRole, imageUrl);
        }
      } else {
        const updated = assets.map(a => a.id === id ? { ...a, role: newRole } : a);
        setAssets(updated);
        localStorage.setItem(`invitation-media-${invitationId}`, JSON.stringify(updated));
        if ((newRole === 'cover' || newRole === 'hero') && imageUrl) {
          updateInvitationCoverImage(newRole, imageUrl);
        }
      }
    } catch {
      const asset = assets.find(a => a.id === id);
      const imageUrl = asset?.public_url || '';
      const updated = assets.map(a => a.id === id ? { ...a, role: newRole } : a);
      setAssets(updated);
      localStorage.setItem(`invitation-media-${invitationId}`, JSON.stringify(updated));
      if ((newRole === 'cover' || newRole === 'hero') && imageUrl) {
        updateInvitationCoverImage(newRole, imageUrl);
      }
    }
  };

  // Update invitation settings.coverImage or settings.heroImage
  const updateInvitationCoverImage = async (role: string, imageUrl: string) => {
    try {
      const invRes = await fetch(`/api/data/invitations/${invitationId}`);
      if (!invRes.ok) return;
      const inv = await invRes.json();
      const settings = typeof inv.settings === 'string' ? JSON.parse(inv.settings) : (inv.settings || {});
      if (role === 'cover') settings.coverImage = imageUrl;
      if (role === 'hero') settings.heroImage = imageUrl;
      await fetch(`/api/data/invitations/${invitationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings }),
      });
    } catch (e) {
      console.error('Failed to update invitation cover image:', e);
    }
  };

  const filtered = filterRole ? assets.filter(a => a.role === filterRole) : assets;
  const roles = [...new Set(assets.map((a: any) => a.role))];

  if (loading) return (
    <div className="animate-pulse space-y-4">
      <div className="h-8 w-48 bg-gray-100 rounded" />
      <div className="grid grid-cols-4 gap-4">{[1,2,3,4].map(i => <div key={i} className="aspect-square bg-gray-100 rounded-xl" />)}</div>
    </div>
  );

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#22382D]">Media Library</h1>
          <p className="text-[#6F7F55] text-sm">
            {assets.length > 0
              ? `${assets.length} file — Undangan ${invitationId}`
              : `Belum ada media — Undangan ${invitationId}`}
          </p>
          {error && <p className="text-red-600 text-xs mt-1">{error}</p>}
        </div>
        <div className="flex gap-2">
          {assets.length > 0 && (
            <button onClick={fetchGallery} className="btn-ghost-admin flex items-center gap-1 text-xs text-[#6F7F55]">
              <RefreshCw size={14} /> Refresh
            </button>
          )}
          <label className={`btn-primary-admin flex items-center gap-2 text-xs cursor-pointer ${uploading ? 'opacity-50' : ''}`}>
            {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
            {uploading ? 'Uploading...' : 'Upload Gambar'}
            <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp,video/mp4,video/webm" onChange={handleUpload} className="hidden" />
          </label>
        </div>
      </div>

      {/* Cover & Hero Photo Slots */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <CoverSlot
          role="cover"
          currentImage={coverImage}
          invitationId={invitationId}
          onUpdate={handleCoverUpdate}
        />
        <CoverSlot
          role="hero"
          currentImage={heroImage}
          invitationId={invitationId}
          onUpdate={handleHeroUpdate}
        />
      </div>

      {/* Role filter */}
      {roles.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => setFilterRole("")} className={`px-3 py-1.5 rounded-full text-xs font-medium ${!filterRole ? 'bg-[#22382D] text-white' : 'bg-white border text-[#6F7F55]'}`}>
            Semua ({assets.length})
          </button>
          {roles.map((role: string) => (
            <button key={role} onClick={() => setFilterRole(role)} className={`px-3 py-1.5 rounded-full text-xs font-medium ${filterRole === role ? 'bg-[#22382D] text-white' : 'bg-white border text-[#6F7F55]'}`}>
              {roleLabels[role] || role} ({assets.filter((a: any) => a.role === role).length})
            </button>
          ))}
        </div>
      )}

      {/* Empty state */}
      {assets.length === 0 && (
        <div className="text-center py-20 border-2 border-dashed border-[#C9A86A]/20 rounded-2xl">
          <Upload size={40} className="mx-auto mb-4 text-[#A9B89B]" />
          <h3 className="text-lg font-semibold text-[#22382D] mb-2">Belum ada media</h3>
          <p className="text-sm text-[#A9B89B] max-w-sm mx-auto mb-4">
            Upload gambar atau video untuk undangan ini. Pilih role (Cover, Hero, Video Hero, Bride, Groom, Gallery) lalu klik Upload.
          </p>
          <p className="text-xs text-[#A9B89B]">
            Gambar/video akan tersimpan di database dan muncul di undangan publik. Video Hero akan diputar sebagai background di halaman utama.
          </p>
        </div>
      )}

      {/* Media grid */}
      {filtered.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filtered.map((asset: any) => (
            <motion.div key={asset.id} className="card-admin group relative p-2" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <div className="relative aspect-square rounded-lg overflow-hidden bg-[#F7F1E6] mb-2">
                {asset.public_url && (asset.public_url.includes('video') || asset.public_url.endsWith('.mp4') || asset.public_url.endsWith('.webm') || asset.role === 'video') ? (
                  <video src={asset.public_url} className="w-full h-full object-cover" muted loop playsInline preload="metadata" />
                ) : (
                  <img src={asset.public_url} alt={asset.alt_text || ''} className="w-full h-full object-cover" loading="lazy" />
                )}
                <div className="absolute top-1 left-1 px-1.5 py-0.5 text-[10px] font-medium rounded bg-black/50 text-white">
                  {roleLabels[asset.role] || asset.role}
                </div>
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <button onClick={() => setPreviewUrl(asset.public_url)} className="p-2 bg-white rounded-full shadow"><Eye size={14} /></button>
                </div>
              </div>
              <select
                value={asset.role}
                onChange={(e) => handleRoleChange(asset.id, e.target.value)}
                className="w-full text-xs border border-[#C9A86A]/20 rounded-lg px-2 py-1 bg-white text-[#22382D] mb-1"
              >
                {Object.entries(roleLabels).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
              <p className="text-xs text-[#22382D] truncate mb-1">{asset.alt_text || 'Image'}</p>
              {/* Quick actions */}
              <div className="flex gap-1">
                <button
                  onClick={() => handleRoleChange(asset.id, 'cover')}
                  className={`flex-1 text-[10px] px-1.5 py-0.5 rounded ${asset.role === 'cover' ? 'bg-[#22382D] text-white' : 'bg-[#F7F1E6] text-[#6F7F55] hover:bg-[#E8E0D0]'} transition-colors`}
                  title="Set as Cover image"
                >
                  Cover
                </button>
                <button
                  onClick={() => handleRoleChange(asset.id, 'hero')}
                  className={`flex-1 text-[10px] px-1.5 py-0.5 rounded ${asset.role === 'hero' ? 'bg-[#22382D] text-white' : 'bg-[#F7F1E6] text-[#6F7F55] hover:bg-[#E8E0D0]'} transition-colors`}
                  title="Set as Hero image"
                >
                  Hero
                </button>
                <button
                  onClick={() => handleRoleChange(asset.id, 'gallery')}
                  className={`flex-1 text-[10px] px-1.5 py-0.5 rounded ${asset.role === 'gallery' ? 'bg-[#22382D] text-white' : 'bg-[#F7F1E6] text-[#6F7F55] hover:bg-[#E8E0D0]'} transition-colors`}
                  title="Set as Gallery image"
                >
                  Galeri
                </button>
              </div>
              <button onClick={() => handleDelete(asset.id)} className="absolute top-3 right-3 p-1 bg-white/80 rounded-full opacity-0 group-hover:opacity-100 text-[#B86B4B]">
                <Trash2 size={12} />
              </button>
            </motion.div>
          ))}
        </div>
      )}

      {/* Preview modal */}
      {previewUrl && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={() => setPreviewUrl(null)}>
          <button onClick={() => setPreviewUrl(null)} className="absolute top-6 right-6 text-white"><X size={28} /></button>
          <img src={previewUrl} alt="Preview" className="max-h-[85vh] max-w-[90vw] object-contain rounded-lg" onClick={e => e.stopPropagation()} />
        </div>
      )}
    </div>
  );
}