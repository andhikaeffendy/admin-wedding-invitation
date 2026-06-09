"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Clock, MapPin, User } from "lucide-react";

const INV_ID = 'inv-001';

export default function TimelinePage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/data/timeline?invitation_id=${INV_ID}`).then(r => r.json()).then(d => { setItems(d); setLoading(false); });
  }, []);

  if (loading) return <div className="animate-pulse space-y-4"><div className="h-8 w-48 bg-gray-100 rounded" /></div>;

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex justify-between items-center">
        <div><h1 className="text-2xl font-bold text-[#22382D]">Timeline Rundown</h1><p className="text-[#6F7F55] text-sm">Jadwal detail hari-H</p></div>
        <button onClick={() => window.print()} className="btn-outline-admin text-xs">🖨️ Cetak</button>
      </div>

      <div className="relative pl-8 border-l-2 border-[#C9A86A]/30 space-y-6">
        {items.map((item: any, i: number) => (
          <motion.div key={i} className="relative" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
            <div className="absolute -left-[2.35rem] top-1 w-4 h-4 rounded-full bg-[#C9A86A] border-2 border-[#F7F1E6]" />
            <div className="card-admin">
              <div className="flex items-center gap-2 mb-2">
                <Clock size={14} className="text-[#C9A86A]" />
                <span className="font-bold text-[#C9A86A] text-lg">{item.time}</span>
              </div>
              <h3 className="font-semibold text-[#22382D] mb-1">{item.activity}</h3>
              <div className="flex gap-4 text-xs text-[#6F7F55]">
                <span className="flex items-center gap-1"><MapPin size={10} /> {item.location}</span>
                <span className="flex items-center gap-1"><User size={10} /> {item.pic}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
