import { Suspense } from 'react';
import { getTemplateById } from '@/lib/data';
import ResultContent from './ResultContent';

/**
 * Server Component wrapper untuk halaman Result.
 * Pre-fetch template config langsung via Prisma → dikirim ke client component.
 */
export default async function ResultPage({
  searchParams,
}: {
  searchParams: Promise<{ template?: string; draftId?: string }>;
}) {
  const { template: templateId, draftId } = await searchParams;
  const slug = templateId || 'agung';

  const templateData = await getTemplateById(slug);

  return (
    <Suspense fallback={<div className="container" style={{ paddingTop: '150px', textAlign: 'center' }}>Memuat...</div>}>
      <ResultContent
        templateId={slug}
        draftId={draftId || null}
        initialTemplate={templateData}
      />
    </Suspense>
  );
}
