export interface Invitation {
  id: string; owner_id: string; title: string; slug: string;
  status: 'draft' | 'published' | 'archived';
  bride_name: string; groom_name: string; event_date: string;
  theme: Record<string, any>; settings: Record<string, any>;
  created_at: string; updated_at: string;
}
export interface Guest {
  id: string; invitation_id: string; guest_name: string; phone?: string;
  category: string; pax_allocated: number; invitation_given_status: string;
  guest_token: string; qr_hash: string; notes?: string;
  rsvp_status?: string | null; pax_confirmed?: number;
  is_checked_in?: boolean; is_souvenir_claimed?: boolean;
}
export interface MediaAsset {
  id: string; invitation_id: string; role: string; public_url: string;
  alt_text: string; sort_order: number;
}
export interface Wish { id: string; sender_name: string; message: string; is_visible: boolean; created_at: string; }
export interface AttendanceScan {
  id: string; guest_id: string; scan_type: 'checkin' | 'souvenir' | 'blocked';
  scanned_at: string; scanned_by?: string;
}
export interface ScanResult {
  status: 'SUCCESS_CHECKIN' | 'SUCCESS_SOUVENIR' | 'ALREADY_COMPLETED' | 'INVALID_QR';
  guest_name: string; category: string; pax: number; message: string;
}
export interface DashboardStats {
  totalInvitations: number; totalGuests: number; totalRsvpYes: number;
  totalCheckedIn: number; totalSouvenir: number; totalPax: number;
  paxCheckedIn: number; progressPercent: number;
}
export interface ThemeConfig {
  primaryColor: string; secondaryColor: string; accentColor: string;
  bgColor: string; textColor: string; goldColor: string;
  fontHeading: string; fontBody: string; cardRadius: number;
  ornamentDensity: 'low' | 'medium' | 'high';
  animationIntensity: 'subtle' | 'medium' | 'vibrant';
}
