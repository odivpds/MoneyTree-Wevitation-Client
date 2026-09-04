import { prisma } from '@/lib/prisma';
import { TemplateConfig } from '@/config/templates';

/**
 * Shared server-side data fetching functions.
 * These functions call Prisma directly and are meant to be used
 * ONLY in Server Components (no "use client" directive).
 * 
 * By calling the database directly on the server, we avoid:
 * - Extra HTTP round-trips (no fetch to /api/templates)
 * - Client-side loading spinners
 * - Race conditions and fallback to dummy data
 * 
 * Resilience:
 * - Each function has a timeout (5 seconds) so the page still renders
 *   even if the database is unreachable (Supabase down, network issues).
 * - On failure, returns empty arrays so the UI can show an empty state
 *   instead of crashing entirely.
 */

const DB_TIMEOUT_MS = 5000; // 5 seconds max wait

export interface CategoryData {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  priceText?: string | null;
}

/**
 * Wraps a promise with a timeout. If the promise doesn't resolve
 * within the given time, returns the fallback value instead of hanging.
 */
function withTimeout<T>(promise: Promise<T>, fallback: T, ms: number = DB_TIMEOUT_MS): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((resolve) => setTimeout(() => {
      console.warn(`[withTimeout] Database query timed out after ${ms}ms, using fallback`);
      resolve(fallback);
    }, ms))
  ]);
}

/**
 * Fetches all active templates from the database, formatted
 * in the shape the client components expect.
 */
export async function getTemplates(): Promise<TemplateConfig[]> {
  try {
    const templates = await withTimeout(
      prisma.template.findMany({
        orderBy: { createdAt: 'desc' },
        include: { category: true }
      }),
      [] // fallback: empty array if timeout
    );

    if (templates.length > 0) {
      return templates.map((t: any) => ({
        id: t.slug,
        name: t.name,
        type: t.type === 'html' ? 'html-js' : t.type,
        category: t.category?.name || 'Basic',
        desc: t.desc || '',
        price: t.price || 'Rp 0',
        image: (t.image || '/images/templates/agung.png').replace("http://localhost:3001", ""),
        badge: t.badge || undefined,
        htmlContent: t.htmlContent,
        cssContent: t.cssContent,
        jsContent: t.jsContent,
      }));
    }

    return [];
  } catch (error) {
    console.error('[getTemplates] Database error:', error);
    return [];
  }
}

/**
 * Fetches a single template by its slug (id).
 * Used to pass template features/content to internal builder pages.
 */
export async function getTemplateById(slug: string): Promise<TemplateConfig | null> {
  try {
    const template = await withTimeout(
      prisma.template.findFirst({
        where: { slug },
        include: { category: true }
      }),
      null
    );

    if (!template) return null;

    const t = template as any;
    return {
      id: t.slug,
      name: t.name,
      type: t.type === 'html' ? 'html-js' : t.type,
      category: t.category?.name || 'Basic',
      desc: t.desc || '',
      price: t.price || 'Rp 0',
      image: (t.image || '/images/templates/agung.png').replace('http://localhost:3001', ''),
      badge: t.badge || undefined,
      htmlContent: t.htmlContent,
      cssContent: t.cssContent,
      jsContent: t.jsContent,
      features: t.features,
    };
  } catch (error) {
    console.error('[getTemplateById] Database error:', error);
    return null;
  }
}

/**
 * Fetches all categories from the database.
 */
export async function getCategories(): Promise<CategoryData[]> {
  try {
    const categories = await withTimeout(
      prisma.category.findMany({
        orderBy: { createdAt: 'asc' }
      }),
      [] // fallback: empty array if timeout
    );

    if (categories.length === 0) return [];

    return categories.map((c: any) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      description: c.description,
      priceText: c.priceText,
    }));
  } catch (error) {
    console.error('[getCategories] Database error:', error);
    return [];
  }
}
