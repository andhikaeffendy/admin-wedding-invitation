"use client";
import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { Upload, X, ImageIcon, CheckCircle, Loader2 } from "lucide-react";

interface CoverSlotProps {
  role: "cover" | "hero";
  currentImage?: string | null;
  invitationId: string;
  onUpdate: (imageUrl: string | null) => void;
}

/**
 * Admin Cover/Hero Photo Slot
 *
 * States: default, hover, active (file picker), focus, loading, empty, error, success
 */
export default function CoverSlot({
  role,
  currentImage,
  invitationId,
  onUpdate,
}: CoverSlotProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const label = role === "cover" ? "Cover Photo" : "Hero Photo";
  const description =
    role === "cover"
      ? "Foto utama di halaman pembuka undangan"
      : "Foto di bagian hero utama undangan";

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setError("File terlalu besar (max 5MB)");
      return;
    }
    setUploading(true);
    setError(null);
    setSuccess(false);

    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      // Upload to gallery
      const galleryRes = await fetch("/api/data/gallery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invitation_id: invitationId,
          role,
          public_url: dataUrl,
          alt_text: file.name.replace(/\.[^.]+$/, ""),
          sort_order: 0,
        }),
      });

      if (galleryRes.ok) {
        const asset = await galleryRes.json();
        const imageUrl = asset.public_url || dataUrl;

        // Update invitation settings
        await fetch(`/api/data/invitations/${invitationId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            settings: { [role === "cover" ? "coverImage" : "heroImage"]: imageUrl },
          }),
        });

        onUpdate(imageUrl);
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        // Fallback: save to localStorage
        const fallbackAsset = {
          id: `cov-${Date.now()}`,
          invitation_id: invitationId,
          role,
          public_url: dataUrl,
          alt_text: file.name.replace(/\.[^.]+$/, ""),
          sort_order: 0,
          created_at: new Date().toISOString(),
        };
        const saved = localStorage.getItem(`invitation-media-${invitationId}`);
        const existing = saved ? JSON.parse(saved) : [];
        localStorage.setItem(
          `invitation-media-${invitationId}`,
          JSON.stringify([fallbackAsset, ...existing])
        );
        onUpdate(dataUrl);
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch {
      setError("Upload gagal. Coba lagi.");
    }
    setUploading(false);
    e.target.value = "";
  };

  const handleRemove = async () => {
    try {
      await fetch(`/api/data/invitations/${invitationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          settings: { [role === "cover" ? "coverImage" : "heroImage"]: null },
        }),
      });
    } catch {
      // Silently fail for localStorage fallback
    }
    onUpdate(null);
    setSuccess(false);
  };

  const handleClick = () => {
    if (!uploading) fileInputRef.current?.click();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h3 className="text-sm font-semibold text-[#22382D]">{label}</h3>
          <p className="text-[10px] text-[#6F7F55]">{description}</p>
        </div>
        {currentImage && (
          <button
            onClick={handleRemove}
            className="text-[10px] text-red-500 hover:text-red-600 flex items-center gap-1"
            aria-label={`Hapus ${label}`}
          >
            <X size={12} /> Hapus
          </button>
        )}
      </div>

      {/* Slot */}
      <div
        role="button"
        tabIndex={0}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        aria-label={currentImage ? `${label}: terpasang` : `Atur ${label}`}
        className={`relative aspect-[16/10] rounded-xl overflow-hidden cursor-pointer transition-all duration-300 group ${
          uploading ? "opacity-60 pointer-events-none" : ""
        } ${error ? "ring-2 ring-red-400" : ""} ${
          success ? "ring-2 ring-green-400" : ""
        }`}
        style={{
          border: currentImage ? "none" : "2px dashed #D4AF37",
          background: currentImage ? "transparent" : "rgba(247,241,230,0.5)",
        }}
      >
        {currentImage ? (
          <>
            <img
              src={currentImage}
              alt={`${label} preview`}
              className="w-full h-full object-cover"
            />
            {/* Hover overlay */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-all duration-300 flex items-center justify-center">
              <span className="text-white text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center gap-1">
                <Upload size={12} /> Ganti
              </span>
            </div>
            {/* Current badge */}
            <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#D4AF37] text-[#22382D]">
              <CheckCircle size={10} />
              {role === "cover" ? "Cover" : "Hero"}
            </div>
            {/* Success flash */}
            {success && (
              <motion.div
                className="absolute inset-0 bg-green-500/20 flex items-center justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <CheckCircle size={24} className="text-green-600" />
              </motion.div>
            )}
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-[#C9A86A] group-hover:text-[#D4AF37] transition-colors">
            {uploading ? (
              <Loader2 size={32} className="animate-spin" />
            ) : (
              <ImageIcon size={32} className="opacity-50" />
            )}
            <span className="text-[11px] font-medium opacity-60">
              {uploading ? "Uploading..." : "Klik untuk atur foto"}
            </span>
          </div>
        )}
      </div>

      {error && (
        <p className="text-[10px] text-red-500 mt-1">{error}</p>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileChange}
        className="hidden"
        aria-hidden="true"
      />
    </div>
  );
}
