"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Save, Music, MapPin, Globe, Shield } from "lucide-react";

export default function SettingsPage() {
  const [saved, setSaved] = useState(false);

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#22382D]">Pengaturan</h1>
          <p className="text-[#6F7F55] text-sm">Konfigurasi sistem dan undangan</p>
        </div>
        <button onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 2000); }} className="btn-primary-admin flex items-center gap-2 text-xs">
          <Save size={14} /> {saved ? 'Tersimpan' : 'Simpan'}
        </button>
      </div>

      <div className="space-y-4">
        {/* Music */}
        <div className="card-admin">
          <h3 className="font-semibold text-[#22382D] mb-3 flex items-center gap-2"><Music size={18} className="text-[#C9A86A]" /> Musik Latar</h3>
          <input className="input-admin" defaultValue="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" placeholder="URL file MP3" />
        </div>

        {/* Maps */}
        <div className="card-admin">
          <h3 className="font-semibold text-[#22382D] mb-3 flex items-center gap-2"><MapPin size={18} className="text-[#C9A86A]" /> Link Peta</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="label-admin">Google Maps - Akad</label>
              <input className="input-admin" defaultValue="https://maps.google.com/?q=Masjid+Agung" />
            </div>
            <div>
              <label className="label-admin">Google Maps - Resepsi</label>
              <input className="input-admin" defaultValue="https://maps.google.com/?q=Gedung+Graha" />
            </div>
          </div>
        </div>

        {/* Domain */}
        <div className="card-admin">
          <h3 className="font-semibold text-[#22382D] mb-3 flex items-center gap-2"><Globe size={18} className="text-[#C9A86A]" /> Domain</h3>
          <input className="input-admin" defaultValue="andhika-laila" placeholder="Slug undangan" />
        </div>

        {/* Roles */}
        <div className="card-admin">
          <h3 className="font-semibold text-[#22382D] mb-3 flex items-center gap-2"><Shield size={18} className="text-[#C9A86A]" /> Role & Akses</h3>
          <div className="space-y-2">
            {[
              { role: 'super_admin', desc: 'Akses penuh semua fitur' },
              { role: 'editor', desc: 'Edit konten, tamu, media' },
              { role: 'scanner', desc: 'Hanya scan QR & lihat tamu' },
              { role: 'viewer', desc: 'Hanya lihat dashboard' },
            ].map(r => (
              <div key={r.role} className="flex items-center justify-between p-3 bg-[#F7F1E6] rounded-lg">
                <div>
                  <p className="text-sm font-medium text-[#22382D] capitalize">{r.role.replace('_', ' ')}</p>
                  <p className="text-xs text-[#A9B89B]">{r.desc}</p>
                </div>
                <span className="badge-info">Active</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
