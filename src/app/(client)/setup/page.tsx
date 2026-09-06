import { getTemplateById } from '@/lib/data';
import SetupPageClient from './SetupClient';

/**
 * Server Component wrapper untuk halaman Setup.
 * Membaca ?template=xxx dari searchParams lalu fetch data template
 * langsung via Prisma — tidak perlu API round-trip dari browser.
 */
export default async function SetupPage({
  searchParams,
}: {
  searchParams: Promise<{ template?: string; draftId?: string }>;
}) {
  const { template: templateId, draftId } = await searchParams;

  // Fetch template features di server sebelum render
  const templateData = templateId ? await getTemplateById(templateId) : null;

  return (
    <SetupPageClient
      templateId={templateId || null}
      draftId={draftId || null}
      initialFeatures={templateData?.features ?? null}
    />
  );
}
