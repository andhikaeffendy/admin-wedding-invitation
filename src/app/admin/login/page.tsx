"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Eye, EyeOff, Shield, Users, QrCode, Eye as ViewIcon, Crown, ChevronDown, ChevronUp, ArrowRight } from "lucide-react";
import { accounts, authenticateAccount, roleLabels, roleDescriptions } from "@/lib/accounts";
import { useAuth } from "@/lib/auth-context";

const roleIcons: Record<string, any> = {
  super_admin: Crown,
  editor: Shield,
  scanner: QrCode,
  viewer: ViewIcon,
};

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showAccounts, setShowAccounts] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { setError("Email dan password wajib diisi"); return; }
    setLoading(true);
    setError("");
    await new Promise(r => setTimeout(r, 600));

    const account = authenticateAccount(email, password);
    if (account) {
      login(account);
      router.push("/admin/dashboard");
    } else {
      setError("Email atau password salah. Coba gunakan akun demo di bawah.");
      setLoading(false);
    }
  };

  const handleQuickLogin = async (account: typeof accounts[0]) => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 400));
    login(account);
    router.push("/admin/dashboard");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F7F1E6] via-[#F7F1E6] to-[#A9B89B]/10 flex items-center justify-center p-6">
      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Logo */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[#22382D] flex items-center justify-center shadow-lg shadow-[#22382D]/20">
            <Heart size={28} className="text-[#C9A86A]" />
          </div>
          <h1 className="font-serif text-2xl text-[#22382D] mb-1">Wedding CMS</h1>
          <p className="text-[#6F7F55] text-sm">Login ke panel administrasi</p>
        </motion.div>

        {/* Form */}
        <motion.form
          onSubmit={handleLogin}
          className="bg-white rounded-2xl shadow-xl border border-[#C9A86A]/10 p-6 md:p-8 space-y-5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div>
            <label className="label-admin">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(""); }}
              className="input-admin"
              placeholder="Masukkan email"
              autoComplete="email"
            />
          </div>
          <div>
            <label className="label-admin">Password</label>
            <div className="relative">
              <input
                type={showPw ? "text" : "password"}
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(""); }}
                className="input-admin pr-10"
                placeholder="Masukkan password"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A9B89B] hover:text-[#22382D] transition-colors"
              >
                {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div
                className="p-3 bg-[#B86B4B]/10 border border-[#B86B4B]/20 rounded-lg text-[#B86B4B] text-sm"
                initial={{ opacity: 0, y: -10, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary-admin w-full flex items-center justify-center gap-2 py-3"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>Masuk <ArrowRight size={16} /></>
            )}
          </button>
        </motion.form>

        {/* Demo Accounts */}
        <motion.div
          className="mt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <button
            onClick={() => setShowAccounts(!showAccounts)}
            className="w-full flex items-center justify-between px-4 py-3 bg-white/50 rounded-xl text-sm text-[#6F7F55] hover:bg-white/80 transition-colors border border-[#C9A86A]/10"
          >
            <span className="flex items-center gap-2">
              <Users size={16} className="text-[#C9A86A]" />
              Akun Demo Tersedia (4 akun)
            </span>
            {showAccounts ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          <AnimatePresence>
            {showAccounts && (
              <motion.div
                className="mt-3 space-y-2"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                {accounts.map((acc, i) => {
                  const Icon = roleIcons[acc.role];
                  return (
                    <motion.button
                      key={acc.id}
                      onClick={() => handleQuickLogin(acc)}
                      disabled={loading}
                      className="w-full flex items-center gap-4 p-4 bg-white rounded-xl border border-[#C9A86A]/10 hover:border-[#C9A86A]/40 hover:shadow-md transition-all text-left group"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * i }}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="w-10 h-10 rounded-xl bg-[#22382D] flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                        {acc.avatar}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-[#22382D] text-sm">{acc.fullName}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className={`badge text-xs ${
                            acc.role === 'super_admin' ? 'badge-success' :
                            acc.role === 'editor' ? 'badge-info' :
                            acc.role === 'scanner' ? 'badge-warning' : 'badge-neutral'
                          }`}>
                            <Icon size={10} className="mr-1 inline" />
                            {roleLabels[acc.role]}
                          </span>
                          <span className="text-xs text-[#A9B89B]">— {acc.email}</span>
                        </div>
                        <p className="text-xs text-[#A9B89B] mt-1">{roleDescriptions[acc.role]}</p>
                      </div>
                      <ArrowRight size={16} className="text-[#C9A86A] opacity-0 group-hover:opacity-100 transition-opacity" />
                    </motion.button>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <motion.p
          className="text-center text-xs text-[#A9B89B] mt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          Password: "admin123", "editor123", "scanner123", "viewer123"
        </motion.p>
      </motion.div>
    </div>
  );
}
