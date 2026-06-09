// Pre-configured accounts for Wedding CMS
export interface AdminAccount {
  id: string;
  email: string;
  password: string;
  fullName: string;
  role: 'super_admin' | 'editor' | 'scanner' | 'viewer';
  avatar: string;
  lastLogin?: string;
}

export const accounts: AdminAccount[] = [
  {
    id: 'user-001',
    email: 'admin@wedding.com',
    password: 'admin123',
    fullName: 'Andhika Pratama',
    role: 'super_admin',
    avatar: 'AP',
    lastLogin: '2026-06-09 08:30',
  },
  {
    id: 'user-002',
    email: 'editor@wedding.com',
    password: 'editor123',
    fullName: 'Laila Nur Azizah',
    role: 'editor',
    avatar: 'LA',
    lastLogin: '2026-06-08 14:15',
  },
  {
    id: 'user-003',
    email: 'scanner@wedding.com',
    password: 'scanner123',
    fullName: 'Panitia Scanner',
    role: 'scanner',
    avatar: 'PS',
    lastLogin: '2026-06-07 10:00',
  },
  {
    id: 'user-004',
    email: 'viewer@wedding.com',
    password: 'viewer123',
    fullName: 'Guest Viewer',
    role: 'viewer',
    avatar: 'GV',
  },
];

export function authenticateAccount(email: string, password: string): AdminAccount | null {
  const account = accounts.find(
    a => a.email.toLowerCase() === email.toLowerCase() && a.password === password
  );
  return account || null;
}

export function getAccountByEmail(email: string): AdminAccount | undefined {
  return accounts.find(a => a.email.toLowerCase() === email.toLowerCase());
}

export const roleLabels: Record<string, string> = {
  super_admin: 'Super Admin',
  editor: 'Editor',
  scanner: 'Scanner',
  viewer: 'Viewer',
};

export const roleDescriptions: Record<string, string> = {
  super_admin: 'Akses penuh — kelola semua undangan, tamu, media, scan, dan pengaturan',
  editor: 'Kelola konten — edit undangan, tamu, media, dan export',
  scanner: 'Scan QR — hanya scan check-in & souvenir tamu',
  viewer: 'Lihat saja — monitoring dashboard tanpa edit',
};
