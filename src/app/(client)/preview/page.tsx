import { Suspense } from 'react';
import { getTemplateById } from '@/lib/data';
import PreviewContent from './PreviewContent';

/**
 * Server Component wrapper untuk halaman Preview.
 * Pre-fetch template config langsung via Prisma → dikirim ke client component.
 */
export default async function PreviewPage({
  searchParams,
}: {
  searchParams: Promise<{ template?: string, pure?: string, draftId?: string }>;
}) {
  const params = await searchParams;
  const slug = params.template || 'agung';
  const isPure = params.pure === 'true';

  const templateData = await getTemplateById(slug);

  return (
    <Suspense fallback={<div className="container" style={{ paddingTop: '150px', textAlign: 'center' }}>Memuat preview...</div>}>
      <PreviewContent
        templateId={slug}
        draftId={params.draftId || null}
        initialTemplate={templateData}
        isPure={isPure}
      />
    </Suspense>
  );
}
