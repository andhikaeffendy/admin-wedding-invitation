"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Users, MapPin } from "lucide-react";

const INV_ID = 'inv-001';

export default function SeatingPage() {
  const [tables, setTables] = useState<any[]>([]);
  const [guests, setGuests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`/api/data/seating?invitation_id=${INV_ID}`).then(r => r.json()),
      fetch(`/api/data/guests?invitation_id=${INV_ID}`).then(r => r.json()),
    ]).then(([t, g]) => { setTables(t); setGuests(g); setLoading(false); });
  }, []);

  const sections = [...new Set(tables.map((t: any) => t.section))];

  if (loading) return <div className="animate-pulse space-y-4"><div className="h-8 w-48 bg-gray-100 rounded" /></div>;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div><h1 className="text-2xl font-bold text-[#22382D]">Seating Plan</h1><p className="text-[#6F7F55] text-sm">{tables.length} meja • {guests.length} tamu</p></div>

      {sections.map((section: string) => {
        const sectionTables = tables.filter((t: any) => t.section === section);
        return (
          <div key={section}>
            <h2 className="font-display text-xl text-[#22382D] mb-3 flex items-center gap-2"><MapPin size={18} className="text-[#C9A86A]" /> {section}</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {sectionTables.map((table: any) => {
                const tableGuests = guests.filter((g: any) => g.table_name === table.name);
                return (
                  <motion.div key={table.id} className="card-admin" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-[#22382D]">{table.name}</h3>
                      <span className={`badge ${table.seats_taken >= table.capacity ? 'badge-danger' : table.seats_taken > table.capacity * 0.7 ? 'badge-warning' : 'badge-success'}`}>
                        {table.seats_taken}/{table.capacity}
                      </span>
                    </div>
                    <div className="w-full bg-[#F7F1E6] h-1.5 rounded-full mb-3 overflow-hidden">
                      <div className="h-full bg-[#6F7F55] rounded-full" style={{ width: `${(table.seats_taken / table.capacity) * 100}%` }} />
                    </div>
                    {tableGuests.map((g: any) => (
                      <div key={g.id} className="flex items-center gap-2 text-xs py-1 border-b border-[#22382D]/5 last:border-0">
                        <Users size={12} className="text-[#A9B89B]" />
                        <span className="text-[#22382D]">{g.guest_name}</span>
                        <span className="text-[#A9B89B] ml-auto">{g.pax_allocated}p</span>
                      </div>
                    ))}
                    {tableGuests.length === 0 && <p className="text-xs text-[#A9B89B] py-2">Kosong</p>}
                  </motion.div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
