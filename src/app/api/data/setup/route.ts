import { NextResponse } from 'next/server';
import { initDatabase, seedDatabase } from '@/lib/supabase/init';
import { isSupabaseMode } from '@/lib/supabase/client';

export async function GET() {
  if (!isSupabaseMode()) {
    return NextResponse.json({
      configured: false,
      mode: 'local',
      message: 'Supabase belum dikonfigurasi. Tambahkan NEXT_PUBLIC_SUPABASE_URL dan NEXT_PUBLIC_SUPABASE_ANON_KEY di environment variables.',
      howto: {
        step1: 'Buat akun gratis di https://supabase.com',
        step2: 'Buat project baru',
        step3: 'Copy Project URL ke NEXT_PUBLIC_SUPABASE_URL',
        step4: 'Copy anon key ke NEXT_PUBLIC_SUPABASE_ANON_KEY',
        step5: 'Jalankan database/migration.sql di Supabase SQL Editor',
        step6: 'Refresh halaman ini',
      }
    });
  }

  const result = await initDatabase();
  if (result.success) {
    const seed = await seedDatabase();
    return NextResponse.json({ configured: true, mode: 'supabase', init: result, seed });
  }
  return NextResponse.json({ configured: false, mode: 'supabase', error: result });
}
