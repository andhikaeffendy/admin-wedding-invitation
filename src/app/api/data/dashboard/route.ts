import { NextRequest, NextResponse } from 'next/server';
import { getDashboardStats } from '@/lib/shared-store';

export async function GET() {
  return NextResponse.json(getDashboardStats());
}
