import { getCategories } from '@/lib/data';
import HomeClient from './HomeClient';

/**
 * Server Component: Fetches templates and categories from the database
 * at render time (on the server), then passes them to the Client Component.
 * 
 * Benefits:
 * - No loading spinner for categories/templates — data is already in the HTML
 * - SEO friendly — Google can index the home page content
 * - Faster Time-to-First-Byte (TTFB)
 */
export default async function Home() {
  const categories = await getCategories();

  return (
    <HomeClient 
      initialCategories={categories}
    />
  );
}
