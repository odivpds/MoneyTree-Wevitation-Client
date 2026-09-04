import { getTemplates, getCategories } from '@/lib/data';
import CategoryTemplatesClient from './CategoryTemplatesClient';

/**
 * Server Component: Fetches templates and categories from the database
 * at render time (on the server), then passes them to the Client Component.
 */
export default async function CategoryTemplatesPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  const currentCategory = category.toLowerCase();

  const [templates, categories] = await Promise.all([
    getTemplates(),
    getCategories(),
  ]);

  return (
    <CategoryTemplatesClient
      initialTemplates={templates}
      initialCategories={categories}
      currentCategory={currentCategory}
    />
  );
}
