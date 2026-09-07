import { Suspense } from 'react';
import { getTemplateById } from '@/lib/data';
import CheckoutClient from './CheckoutClient';

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ template?: string, draftId?: string }>;
}) {
  const params = await searchParams;
  const slug = params.template || 'agung';
  const draftId = params.draftId || null;

  const templateData = await getTemplateById(slug);

  return (
    <Suspense fallback={<div className="container" style={{ paddingTop: '150px', textAlign: 'center' }}>Memuat checkout...</div>}>
      <CheckoutClient
        templateId={slug}
        draftId={draftId}
        initialTemplate={templateData}
      />
    </Suspense>
  );
}
