"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  LayoutDashboard, Heart, Users, Image, QrCode, FileSpreadsheet,
  Settings, LogOut, Menu, X, ChevronLeft, Bell, Crown, Shield, Eye,
  MapPin, ShoppingBag, Clock, Wallet, FileText, Send, Building, Database as DbIcon
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { roleLabels } from "@/lib/accounts";

const allNavItems = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ['super_admin', 'editor', 'scanner', 'viewer'] },
  { href: "/admin/clients", label: "Multi-Event", icon: Building, roles: ['super_admin'] },
  { href: "/admin/invitations", label: "Undangan", icon: Heart, roles: ['super_admin', 'editor', 'viewer'] },
  { href: "/admin/invitations/inv-001/guests", label: "Tamu", icon: Users, roles: ['super_admin', 'editor', 'scanner'] },
  { href: "/admin/invitations/inv-001/send", label: "Kirim", icon: Send, roles: ['super_admin', 'editor'] },
  { href: "/admin/seating", label: "Seating Plan", icon: MapPin, roles: ['super_admin', 'editor'] },
  { href: "/admin/invitations/inv-001/media", label: "Media", icon: Image, roles: ['super_admin', 'editor'] },
  { href: "/admin/scanner", label: "QR Scanner", icon: QrCode, roles: ['super_admin', 'editor', 'scanner'] },
  { href: "/admin/followup", label: "Follow-up", icon: Send, roles: ['super_admin', 'editor'] },
  { href: "/admin/vendors", label: "Vendor", icon: ShoppingBag, roles: ['super_admin', 'editor'] },
  { href: "/admin/timeline", label: "Timeline", icon: Clock, roles: ['super_admin', 'editor', 'viewer'] },
  { href: "/admin/budget", label: "Budget", icon: Wallet, roles: ['super_admin', 'editor'] },
  { href: "/admin/reports", label: "Report", icon: FileText, roles: ['super_admin', 'editor'] },
  { href: "/admin/exports", label: "Export", icon: FileSpreadsheet, roles: ['super_admin', 'editor', 'viewer'] },
  { href: "/admin/setup", label: "Database", icon: DbIcon, roles: ['super_admin'] },
];

const roleIcons: Record<string, any> = {
  super_admin: Crown, editor: Shield, scanner: QrCode, viewer: Eye,
};

const roleColors: Record<string, string> = {
  super_admin: 'bg-[#C9A86A] text-[#22382D]',
  editor: 'bg-[#6F7F55] text-white',
  scanner: 'bg-[#A9B89B] text-[#22382D]',
  viewer: 'bg-[#22382D]/10 text-[#22382D]',
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [authReady, setAuthReady] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { account, logout, isLoggedIn } = useAuth();

  const isLoginPage = pathname === "/admin/login";

  // Wait for auth to initialize before redirecting
  useEffect(() => {
    // Small delay to ensure AuthProvider has finished restoring from localStorage
    const timer = setTimeout(() => setAuthReady(true), 50);
    return () => clearTimeout(timer);
  }, []);

  // Redirect unauthenticated users to login (only after auth is ready)
  useEffect(() => {
    if (authReady && !isLoggedIn && !isLoginPage) {
      router.replace("/admin/login");
    }
  }, [authReady, isLoggedIn, isLoginPage, router]);

  const handleLogout = () => {
    logout();
    router.replace("/admin/login");
  };

  // Login page — render without admin shell
  if (isLoginPage) {
    return <>{children}</>;
  }

  // Auth not ready yet — show loading without redirecting
  if (!authReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f7f4]">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-[#C9A86A] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-[#A9B89B] text-sm">Memuat...</p>
        </div>
      </div>
    );
  }

  // Not authenticated after init — show loading while redirecting
  if (!isLoggedIn || !account) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f7f4]">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-[#C9A86A] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-[#A9B89B] text-sm">Mengarahkan ke login...</p>
        </div>
      </div>
    );
  }

  const navItems = allNavItems.filter(item => item.roles.includes(account.role));
  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');
  const RoleIcon = roleIcons[account.role];

  return (
    <div className="min-h-screen flex bg-[#f8f7f4]">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          role="presentation"
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        id="admin-sidebar"
        className={`
          fixed lg:static inset-y-0 left-0 z-50 w-64 bg-[#22382D] text-white flex flex-col
          transition-transform duration-300 lg:translate-x-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
        role="navigation"
        aria-label="Navigasi utama"
      >
        {/* Logo */}
        <div className="p-5 border-b border-white/10">
          <div className="flex items-center justify-between">
            <Link href="/admin/dashboard" className="flex items-center gap-3" aria-label="Dashboard">
              <div className="w-9 h-9 rounded-lg bg-[#C9A86A] flex items-center justify-center" aria-hidden="true">
                <Heart size={18} className="text-white" />
              </div>
              <div>
                <p className="font-semibold text-sm">Wedding CMS</p>
                <p className="text-[#A9B89B] text-xs">Admin Panel</p>
              </div>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-white/60 hover:text-white"
              aria-label="Tutup menu navigasi"
            >
              <X size={20} aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto" aria-label="Menu halaman">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              aria-current={isActive(item.href) ? 'page' : undefined}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                isActive(item.href)
                  ? 'bg-[#C9A86A]/20 text-[#C9A86A] font-medium'
                  : 'text-[#A9B89B] hover:bg-white/5 hover:text-white'
              }`}
            >
              <item.icon size={18} aria-hidden="true" />
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Bottom */}
        <div className="p-3 border-t border-white/10 space-y-1">
          <Link
            href="/admin/settings"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-[#A9B89B] hover:bg-white/5 hover:text-white transition-all"
          >
            <Settings size={18} /> Pengaturan
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-[#B86B4B] hover:bg-white/5 transition-all"
          >
            <LogOut size={18} /> Keluar
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-[#22382D]/5 px-4 md:px-6 py-3 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-[#22382D]"
            aria-label="Buka menu navigasi"
            aria-expanded={sidebarOpen}
            aria-controls="admin-sidebar"
          >
            <Menu size={22} aria-hidden="true" />
          </button>

          <div className="hidden lg:flex items-center gap-2 text-sm text-[#A9B89B]">
            <button onClick={() => router.back()} className="hover:text-[#22382D] transition-colors">
              <ChevronLeft size={16} />
            </button>
          </div>

          <div className="flex items-center gap-4">
            <button
              className="relative text-[#6F7F55] hover:text-[#22382D] transition-colors"
              aria-label="Notifikasi"
            >
              <Bell size={20} aria-hidden="true" />
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#B86B4B] text-white text-xs flex items-center justify-center">1</span>
            </button>

            {/* User Info */}
            <div className="flex items-center gap-2.5 pl-4 border-l border-[#22382D]/10">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-[#22382D] leading-tight">{account.fullName}</p>
                <div className="flex items-center gap-1">
                  <RoleIcon size={10} className="text-[#A9B89B]" />
                  <span className="text-xs text-[#A9B89B]">{roleLabels[account.role]}</span>
                </div>
              </div>
              <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-white text-sm font-medium ${
                account.role === 'super_admin' ? 'bg-[#C9A86A]' :
                account.role === 'editor' ? 'bg-[#6F7F55]' :
                account.role === 'scanner' ? 'bg-[#A9B89B]' : 'bg-gray-400'
              }`}>
                {account.avatar}
              </span>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-4 md:p-6 overflow-auto" id="admin-content" tabIndex={-1}>
          {children}
        </main>
      </div>
    </div>
  );
}
