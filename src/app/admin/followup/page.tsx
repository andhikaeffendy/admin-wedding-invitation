"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Send, Phone, AlertTriangle } from "lucide-react";

const INV_ID = 'inv-001';

export default function FollowUpPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sent, setSent] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetch(`/api/data/followup?invitation_id=${INV_ID}`).then(r => r.json()).then(d => { setData(d); setLoading(false); });
  }, []);

  if (loading) return <div className="animate-pulse space-y-4"><div className="h-8 w-48 bg-gray-100 rounded" /></div>;

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex justify-between items-center">
        <div><h1 className="text-2xl font-bold text-[#22382D]">Auto Follow-up</h1><p className="text-[#6F7F55] text-sm">{data?.total || 0} tamu belum RSVP</p></div>
        {data?.total > 0 && (
          <span className="badge badge-warning flex items-center gap-1"><AlertTriangle size={12} /> {data.total} pending</span>
        )}
      </div>

      {data?.total === 0 ? (
        <div className="card-admin text-center py-8">
          <Send size={32} className="text-[#6F7F55] mx-auto mb-2" />
          <p className="text-[#6F7F55]">Semua tamu sudah RSVP! 🎉</p>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-[#6F7F55]">Klik tombol WhatsApp untuk mengirim pesan follow-up ke masing-masing tamu:</p>
          {data?.messages?.map((item: any, i: number) => (
            <motion.div key={i} className="card-admin flex items-center justify-between" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
              <div className="flex items-center gap-3">
                <Phone size={16} className="text-[#C9A86A]" />
                <div>
                  <p className="font-medium text-[#22382D] text-sm">{item.guest_name}</p>
                  <p className="text-xs text-[#A9B89B]">{item.phone}</p>
                </div>
              </div>
              <a
                href={item.waLink}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setSent(new Set([...sent, item.guest_name]))}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  sent.has(item.guest_name) ? 'bg-[#6F7F55]/10 text-[#6F7F55]' : 'bg-[#25D366] text-white hover:bg-[#1fa855]'
                }`}
              >
                <Send size={12} /> {sent.has(item.guest_name) ? 'Terkirim' : 'WhatsApp'}
              </a>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
