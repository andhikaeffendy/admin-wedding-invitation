"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";

const INV_ID = 'inv-001';

export default function BudgetPage() {
  const [budget, setBudget] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/data/budget?invitation_id=${INV_ID}`).then(r => r.json()).then(d => { setBudget(d); setLoading(false); });
  }, []);

  if (loading || !budget) return <div className="animate-pulse space-y-4"><div className="h-8 w-48 bg-gray-100 rounded" /></div>;

  const totalSpent = (budget.categories || []).reduce((s: number, c: any) => s + (c.spent || 0), 0);
  const spentPercent = budget.total > 0 ? Math.round((totalSpent / budget.total) * 100) : 0;

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div><h1 className="text-2xl font-bold text-[#22382D]">Budget Tracker</h1><p className="text-[#6F7F55] text-sm">Pantau pengeluaran realtime</p></div>

      <div className="grid grid-cols-3 gap-4">
        <div className="card-admin text-center"><p className="text-2xl font-bold text-[#22382D]">Rp {(budget.total / 1000000).toFixed(1)}M</p><p className="text-xs text-[#A9B89B]">Total Budget</p></div>
        <div className="card-admin text-center"><p className="text-2xl font-bold text-[#6F7F55]">Rp {(totalSpent / 1000000).toFixed(1)}M</p><p className="text-xs text-[#A9B89B]">Terpakai</p></div>
        <div className="card-admin text-center"><p className="text-2xl font-bold text-[#B86B4B]">Rp {((budget.total - totalSpent) / 1000000).toFixed(1)}M</p><p className="text-xs text-[#A9B89B]">Sisa</p></div>
      </div>

      <div className="card-admin">
        <div className="flex justify-between text-sm mb-2"><span className="text-[#6F7F55]">Progress Pengeluaran</span><span className="font-medium">{spentPercent}%</span></div>
        <div className="w-full bg-[#F7F1E6] h-3 rounded-full overflow-hidden">
          <motion.div className={`h-full rounded-full ${spentPercent > 90 ? 'bg-[#B86B4B]' : spentPercent > 60 ? 'bg-[#C9A86A]' : 'bg-[#6F7F55]'}`} initial={{ width: 0 }} animate={{ width: `${spentPercent}%` }} transition={{ duration: 1 }} />
        </div>
      </div>

      <div className="space-y-3">
        {(budget.categories || []).map((cat: any, i: number) => {
          const pct = cat.budget > 0 ? Math.round((cat.spent / cat.budget) * 100) : 0;
          return (
            <motion.div key={i} className="card-admin" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <div className="flex justify-between mb-1">
                <span className="font-medium text-[#22382D] text-sm">{cat.name}</span>
                <span className="text-xs text-[#6F7F55]">Rp {(cat.spent / 1000000).toFixed(1)}M / Rp {(cat.budget / 1000000).toFixed(1)}M</span>
              </div>
              <div className="w-full bg-[#F7F1E6] h-2 rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${pct > 90 ? 'bg-[#B86B4B]' : 'bg-[#6F7F55]'}`} style={{ width: `${pct}%` }} />
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
