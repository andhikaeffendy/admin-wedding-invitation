"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Users, Calendar, TrendingUp, ExternalLink } from "lucide-react";
import Link from "next/link";

export default function ClientsPage() {
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/data/invitations').then(r => r.json()).then(async (invs) => {
      // Enrich with guest counts from dashboard API
      const enriched = await Promise.all((Array.isArray(invs) ? invs : []).map(async (inv: any) => {
        const res = await fetch(`/api/data/dashboard`);
        const stats = await res.json();
        return { ...inv, guestCount: stats.totalGuests || 0, rsvpCount: stats.totalRsvpYes || 0, checkinCount: stats.totalCheckedIn || 0, progressPercent: stats.progressPercent || 0 };
      }));
      setClients(enriched);
      setLoading(false);
    });
  }, []);

  const upcoming = clients.filter((c: any) => new Date(c.event_date) >= new Date());
  const past = clients.filter((c: any) => new Date(c.event_date) < new Date());

  if (loading) return <div className="animate-pulse space-y-4"><div className="h-8 w-48 bg-gray-100 rounded" /></div>;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div><h1 className="text-2xl font-bold text-[#22382D]">Multi-Event Dashboard</h1><p className="text-[#6F7F55] text-sm">{clients.length} wedding client</p></div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="card-admin text-center"><p className="text-3xl font-bold text-[#22382D]">{clients.length}</p><p className="text-xs text-[#A9B89B]">Total Client</p></div>
        <div className="card-admin text-center"><p className="text-3xl font-bold text-[#6F7F55]">{upcoming.length}</p><p className="text-xs text-[#A9B89B]">Upcoming</p></div>
        <div className="card-admin text-center"><p className="text-3xl font-bold text-[#C9A86A]">{past.length}</p><p className="text-xs text-[#A9B89B]">Past Events</p></div>
        <div className="card-admin text-center"><p className="text-3xl font-bold text-[#B86B4B]">{clients.reduce((s: number, c: any) => s + (c.checkinCount || 0), 0)}</p><p className="text-xs text-[#A9B89B]">Total Check-in</p></div>
      </div>

      {upcoming.length > 0 && (
        <div>
          <h2 className="font-semibold text-[#22382D] mb-3">📅 Upcoming Events</h2>
          <div className="space-y-3">
            {upcoming.map((c: any) => (
              <motion.div key={c.id} className="card-admin flex items-center justify-between" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
                <div className="flex items-center gap-4">
                  <Calendar size={20} className="text-[#C9A86A]" />
                  <div>
                    <h3 className="font-semibold text-[#22382D]">{c.title}</h3>
                    <p className="text-xs text-[#A9B89B]">{c.event_date} • {c.guestCount || 0} tamu</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right"><p className="text-sm font-bold text-[#6F7F55]">{c.progressPercent}%</p><p className="text-xs text-[#A9B89B]">RSVP</p></div>
                  <Link href={`/admin/invitations/${c.id}/guests`} className="btn-ghost-admin text-xs"><ExternalLink size={12} /></Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {past.length > 0 && (
        <div>
          <h2 className="font-semibold text-[#22382D] mb-3">✅ Past Events</h2>
          <div className="space-y-3">
            {past.map((c: any) => (
              <div key={c.id} className="card-admin flex items-center justify-between opacity-70">
                <div className="flex items-center gap-4">
                  <Calendar size={20} className="text-[#A9B89B]" />
                  <div>
                    <h3 className="font-semibold text-[#22382D]">{c.title}</h3>
                    <p className="text-xs text-[#A9B89B]">{c.event_date}</p>
                  </div>
                </div>
                <Link href={`/admin/reports?invitation_id=${c.id}`} className="btn-ghost-admin text-xs">📊 Report</Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
