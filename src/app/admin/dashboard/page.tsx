"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Heart, Users, UserCheck, Gift, TrendingUp, Activity, ArrowUpRight, Eye, Palette } from "lucide-react";

const WEDDING_URL = process.env.NEXT_PUBLIC_WEDDING_URL || 'https://wedding-invitation-liart-alpha.vercel.app';

// Template demo list
const TEMPLATE_DEMOS = [
  { id: 'modern-organic-luxury', name: 'Modern Organic', emoji: '🎋', color: '#22382D' },
  { id: 'classic-rose-gold', name: 'Classic Rose Gold', emoji: '🌹', color: '#8B5E63' },
  { id: 'minimal-monochrome', name: 'Minimal Mono', emoji: '⬜', color: '#2D2D2D' },
  { id: 'tropical-paradise', name: 'Tropical', emoji: '🌴', color: '#1B4332' },
  { id: 'royal-purple', name: 'Royal Purple', emoji: '💜', color: '#2D1B4E' },
  { id: 'sakura-pink', name: 'Sakura', emoji: '🌸', color: '#FFB7C5' },
  { id: 'vintage-kraft', name: 'Vintage Kraft', emoji: '📜', color: '#6B4226' },
  { id: 'aureum-gold', name: 'Aureum Gold', emoji: '👑', color: '#C9A86A' },
  { id: 'celestial-night', name: 'Celestial', emoji: '🌙', color: '#0B1930' },
  { id: 'terracotta-bloom', name: 'Terracotta', emoji: '🏵️', color: '#C7734B' },
  { id: 'ocean-breeze', name: 'Ocean Breeze', emoji: '🌊', color: '#1B2A4A' },
  { id: 'jasmine-white', name: 'Jasmine Pure', emoji: '🤍', color: '#C0C4CC' },
  { id: 'dream-garden', name: 'Dream Garden', emoji: '🪷', color: '#E8B4C8' },
  { id: 'javanese-elegance', name: 'Javanese', emoji: '🏮', color: '#D4AF37' },
  { id: 'aire-royale', name: 'Aire Royale', emoji: '💎', color: '#550979' },
  { id: 'premium-blush', name: 'Premium Blush', emoji: '💗', color: '#F63854' },
  { id: 'luxury-lavender', name: 'Luxury Lavender', emoji: '🦋', color: '#6B3FA0' },
  { id: 'exclusive-noir', name: 'Exclusive Noir', emoji: '🖤', color: '#1A1A24' },
  { id: 'sage-dream', name: 'Sage Dream', emoji: '🌱', color: '#4A6741' },
  { id: 'eternal-sage-luxury', name: 'Eternal Sage Luxury', emoji: '🌿', color: '#22382D' },
  { id: 'wekita-elegance', name: 'Wekita Elegance', emoji: '🍃', color: '#0d2518' },
  { id: 'blush-romance', name: 'Blush Romance', emoji: '💕', color: '#D4A9A7' },
];

export default function DashboardPage() {
  const [stats, setStats] = useState<any | null>(null);
  // Use lazy initial state to avoid flash
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    fetch('/api/data/dashboard')
      .then(r => r.json())
      .then(data => { setStats(data); setMounted(true); })
      .catch(() => { setMounted(true); });
  }, []);

  if (!mounted || !stats) {
    return (
      <div className="space-y-6 max-w-6xl mx-auto animate-pulse">
        <div className="h-8 w-48 bg-gray-200 rounded-lg" />
        <div className="h-5 w-64 bg-gray-100 rounded-lg" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="h-28 bg-gray-100 rounded-xl" />)}
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="h-48 bg-gray-100 rounded-xl" />
          <div className="h-48 bg-gray-100 rounded-xl" />
        </div>
      </div>
    );
  }

  const statCards = [
    { label: 'Total Undangan', value: stats.totalInvitations, icon: Heart, color: 'bg-[#22382D]', change: '+1' },
    { label: 'Total Tamu', value: stats.totalGuests, icon: Users, color: 'bg-[#6F7F55]', change: '+8' },
    { label: 'RSVP Hadir', value: stats.totalRsvpYes, icon: UserCheck, color: 'bg-[#C9A86A]', change: `${stats.progressPercent}%` },
    { label: 'Sudah Check-in', value: stats.totalCheckedIn, icon: Gift, color: 'bg-[#B86B4B]', change: '+1' },
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#22382D]">Dashboard</h1>
          <p className="text-[#6F7F55] text-sm">Ringkasan undangan Andhika & Laila</p>
        </div>
        <a href={`${WEDDING_URL}/i/andhika-laila`} target="_blank" className="btn-outline-admin text-xs flex items-center gap-1">
          Preview Undangan <ArrowUpRight size={14} />
        </a>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map((card, i) => (
          <motion.div
            key={card.label}
            className="card-admin"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <div className="flex items-start justify-between mb-3">
              <div className={`w-10 h-10 rounded-lg ${card.color} flex items-center justify-center`}>
                <card.icon size={20} className="text-white" />
              </div>
              <span className="text-xs text-[#6F7F55] font-medium bg-[#6F7F55]/10 px-2 py-0.5 rounded-full">{card.change}</span>
            </div>
            <p className="text-3xl font-bold text-[#22382D]">{card.value}</p>
            <p className="text-sm text-[#A9B89B]">{card.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Progress & Activity */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Progress Bar */}
        <div className="card-admin">
          <h3 className="font-semibold text-[#22382D] mb-4 flex items-center gap-2">
            <TrendingUp size={18} className="text-[#C9A86A]" /> Progress RSVP
          </h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-[#6F7F55]">Kehadiran</span>
                <span className="font-medium text-[#22382D]">{stats.totalRsvpYes}/{stats.totalGuests} tamu</span>
              </div>
              <div className="w-full h-2 bg-[#F7F1E6] rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-[#6F7F55] rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${stats.progressPercent}%` }}
                  transition={{ duration: 1, delay: 0.5 }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-[#6F7F55]">Check-in</span>
                <span className="font-medium text-[#22382D]">{stats.totalCheckedIn}/{stats.totalRsvpYes} hadir</span>
              </div>
              <div className="w-full h-2 bg-[#F7F1E6] rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-[#C9A86A] rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${stats.totalRsvpYes > 0 ? (stats.totalCheckedIn / stats.totalRsvpYes) * 100 : 0}%` }}
                  transition={{ duration: 1, delay: 0.7 }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-[#6F7F55]">Souvenir</span>
                <span className="font-medium text-[#22382D]">{stats.totalSouvenir}/{stats.totalCheckedIn} claimed</span>
              </div>
              <div className="w-full h-2 bg-[#F7F1E6] rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-[#B86B4B] rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${stats.totalCheckedIn > 0 ? (stats.totalSouvenir / stats.totalCheckedIn) * 100 : 0}%` }}
                  transition={{ duration: 1, delay: 0.9 }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="card-admin">
          <h3 className="font-semibold text-[#22382D] mb-4 flex items-center gap-2">
            <Activity size={18} className="text-[#6F7F55]" /> Ringkasan Cepat
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-[#F7F1E6] rounded-xl">
              <p className="text-2xl font-bold text-[#22382D]">{stats.totalPax}</p>
              <p className="text-xs text-[#6F7F55]">Total Pax Dialokasikan</p>
            </div>
            <div className="p-4 bg-[#F7F1E6] rounded-xl">
              <p className="text-2xl font-bold text-[#22382D]">{stats.paxCheckedIn}</p>
              <p className="text-xs text-[#6F7F55]">Pax Check-in</p>
            </div>
            <div className="p-4 bg-[#F7F1E6] rounded-xl">
              <p className="text-2xl font-bold text-[#22382D]">{stats.totalGuests - stats.totalRsvpYes}</p>
              <p className="text-xs text-[#6F7F55]">Belum RSVP</p>
            </div>
            <div className="p-4 bg-[#F7F1E6] rounded-xl">
              <p className="text-2xl font-bold text-[#22382D]">{stats.totalGuests - stats.totalCheckedIn}</p>
              <p className="text-xs text-[#6F7F55]">Belum Check-in</p>
            </div>
          </div>
        </div>
      </div>

      {/* Template Demo Preview */}
      <div className="card-admin">
        <h3 className="font-semibold text-[#22382D] mb-4 flex items-center gap-2">
          <Palette size={18} className="text-[#C9A86A]" /> Template Demo ({TEMPLATE_DEMOS.length} Tema)
        </h3>
        <p className="text-xs text-[#A9B89B] mb-4">Klik untuk preview undangan dengan tema berbeda. Setiap tema bisa diakses langsung oleh tamu.</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {TEMPLATE_DEMOS.map((tmpl) => (
            <a
              key={tmpl.id}
              href={`${WEDDING_URL}/demo/${tmpl.id}`}
              target="_blank"
              className="p-3 rounded-xl border border-[#C9A86A]/10 hover:border-[#C9A86A]/40 hover:shadow-md transition-all text-center group"
            >
              <span className="text-2xl block mb-2">{tmpl.emoji}</span>
              <p className="text-xs font-medium text-[#22382D] group-hover:text-[#C9A86A] transition-colors">{tmpl.name}</p>
              <Eye size={12} className="inline-block mt-1 text-[#A9B89B] group-hover:text-[#C9A86A]" />
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
