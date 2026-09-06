import { Suspense } from 'react';
import { getTemplateById } from '@/lib/data';
import EditorContent from './EditorContent';

/**
 * Server Component wrapper untuk halaman Editor.
 * Pre-fetch template config langsung via Prisma → dikirim ke client component.
 */
export default async function EditorPage({
  searchParams,
}: {
  searchParams: Promise<{ template?: string; draftId?: string }>;
}) {
  const params = await searchParams;
  const slug = params.template || 'agung';

  const templateData = await getTemplateById(slug);

  return (
    <Suspense fallback={<div className="container" style={{ paddingTop: '150px', textAlign: 'center' }}>Memuat editor...</div>}>
      <EditorContent
        templateId={slug}
        draftId={params.draftId || null}
        initialTemplate={templateData}
      />
    </Suspense>
  );
}
