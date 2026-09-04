import { getTemplates, getCategories } from '@/lib/data';
import TemplatesClient from './TemplatesClient';

/**
 * Server Component: Fetches templates and categories from the database
 * at render time (on the server), then passes them to the Client Component.
 * 
 * Benefits:
 * - No loading spinner — data is already in the HTML
 * - No client-side fetch race conditions
 * - SEO friendly — Google can index all templates
 * - Faster Time-to-First-Byte (TTFB) 
 */
export default async function TemplatesPage() {
  const [templates, categories] = await Promise.all([
    getTemplates(),
    getCategories(),
  ]);

  return (
    <TemplatesClient 
      initialTemplates={templates}
      initialCategories={categories}
    />
  );
}