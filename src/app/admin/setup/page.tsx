"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Database, Check, X, ExternalLink, RefreshCw, Copy, CheckCircle } from "lucide-react";

export default function SetupPage() {
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [initializing, setInitializing] = useState(false);
  const [copied, setCopied] = useState(false);

  const checkStatus = async () => {
    setLoading(true);
    const res = await fetch('/api/data/setup');
    const data = await res.json();
    setStatus(data);
    setLoading(false);
  };

  useEffect(() => { checkStatus(); }, []);

  const handleInit = async () => {
    setInitializing(true);
    await fetch('/api/data/setup', { method: 'POST' });
    await checkStatus();
    setInitializing(false);
  };

  const copySql = () => {
    navigator.clipboard.writeText(`-- Copy from database/migration.sql`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return <div className="animate-pulse space-y-4"><div className="h-8 w-48 bg-gray-100 rounded" /><div className="h-64 bg-gray-100 rounded-xl" /></div>;

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#22382D]">Database Setup</h1>
          <p className="text-[#6F7F55] text-sm">Konfigurasi Supabase untuk production</p>
        </div>
        <button onClick={checkStatus} className="btn-ghost-admin"><RefreshCw size={16} /></button>
      </div>

      {/* Current Status */}
      <div className={`card-admin ${status?.configured ? 'border-[#6F7F55]/30' : 'border-[#C9A86A]/30'}`}>
        <div className="flex items-center gap-3 mb-4">
          <Database size={24} className={status?.configured ? 'text-[#6F7F55]' : 'text-[#C9A86A]'} />
          <div>
            <h2 className="font-semibold text-[#22382D]">
              Status: {status?.configured ? 'Terhubung' : 'Belum Terhubung'}
            </h2>
            <p className="text-xs text-[#A9B89B]">Mode: {status?.mode || 'local'}</p>
          </div>
          {status?.configured ? (
            <span className="ml-auto badge-success"><Check size={12} className="mr-1" /> Active</span>
          ) : (
            <span className="ml-auto badge-warning"><X size={12} className="mr-1" /> Local Only</span>
          )}
        </div>
        <p className="text-sm text-[#6F7F55]">{status?.message}</p>
      </div>

      {!status?.configured && status?.howto && (
        <motion.div className="card-admin" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h3 className="font-semibold text-[#22382D] mb-4">📋 Cara Setup Supabase (5 Langkah)</h3>
          <ol className="space-y-3">
            {Object.entries(status.howto).map(([key, value], i) => (
              <li key={key} className="flex items-start gap-3 text-sm">
                <span className="w-6 h-6 rounded-full bg-[#6F7F55] text-white flex items-center justify-center text-xs flex-shrink-0">{i + 1}</span>
                <div>
                  <span className="text-[#22382D]">{value as string}</span>
                  {(key === 'step3' || key === 'step4') && (
                    <code className="block text-xs bg-[#F7F1E6] p-1.5 rounded mt-1 text-[#C9A86A]">
                      {key === 'step3' ? 'NEXT_PUBLIC_SUPABASE_URL' : 'NEXT_PUBLIC_SUPABASE_ANON_KEY'}
                    </code>
                  )}
                </div>
              </li>
            ))}
          </ol>

          <div className="mt-5 p-4 bg-[#F7F1E6] rounded-xl">
            <p className="text-sm font-medium text-[#22382D] mb-2">📄 Migration SQL</p>
            <p className="text-xs text-[#6F7F55] mb-3">Copy SQL berikut ke Supabase SQL Editor:</p>
            <div className="flex items-center gap-2">
              <button onClick={copySql} className="btn-outline-admin text-xs flex items-center gap-1">
                {copied ? <CheckCircle size={12} /> : <Copy size={12} />}
                {copied ? 'Tersalin' : 'Copy SQL'}
              </button>
              <span className="text-xs text-[#A9B89B]">atau buka file database/migration.sql</span>
            </div>
          </div>

          <div className="mt-5">
            <a
              href="https://supabase.com/dashboard/projects"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary-admin inline-flex items-center gap-2 text-sm"
            >
              <ExternalLink size={14} /> Buka Supabase Dashboard
            </a>
          </div>
        </motion.div>
      )}

      {status?.configured && status?.seed?.success && (
        <div className="card-admin border-[#6F7F55]/30">
          <div className="flex items-center gap-3">
            <CheckCircle size={24} className="text-[#6F7F55]" />
            <div>
              <h3 className="font-semibold text-[#22382D]">✅ Database Siap!</h3>
              <p className="text-xs text-[#A9B89B]">Demo data sudah di-seed. Admin siap digunakan.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
