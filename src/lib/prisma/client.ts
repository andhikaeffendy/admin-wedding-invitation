// Prisma client — only initializes when DATABASE_URL is available
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

const hasDbUrl = typeof process !== 'undefined' && process.env?.DATABASE_URL?.includes('supabase');

export const prisma = hasDbUrl
  ? (globalForPrisma.prisma ?? new PrismaClient())
  : null as unknown as PrismaClient;

if (hasDbUrl && process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;
