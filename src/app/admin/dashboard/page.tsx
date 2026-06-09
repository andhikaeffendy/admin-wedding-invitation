"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Heart, Users, UserCheck, Gift, TrendingUp, Activity, ArrowUpRight } from "lucide-react";

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
        <a href="/i/andhika-laila" target="_blank" className="btn-outline-admin text-xs flex items-center gap-1">
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
    </div>
  );
}
