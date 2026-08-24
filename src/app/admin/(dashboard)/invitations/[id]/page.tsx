import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import GuestManager from "./GuestManager";
import InvitationEditor from "./InvitationEditor";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function InvitationManagePage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const invitation = await prisma.invitation.findUnique({
    where: { id: params.id },
  });

  if (!invitation) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center space-x-4">
        <Link href="/admin" className="p-2 rounded-lg bg-white border border-[#E6DFD1] text-[#677359] hover:bg-[#F0EBE1] transition-colors shadow-sm">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h2 className="text-4xl font-serif font-bold tracking-tight text-[#222] mb-1">{invitation.title}</h2>
          <p className="text-gray-500 text-sm">Manage invitation details, guests, and WhatsApp links.</p>
        </div>
      </div>

      {/* Invitation Editor Section */}
      <InvitationEditor
        invitation={{
          id: invitation.id,
          title: invitation.title,
          slug: invitation.slug,
          status: invitation.status,
        }}
      />

      {/* Guest Manager Section */}
      <GuestManager invitationId={invitation.id} slug={invitation.slug} initialWaTemplate={invitation.waTemplate} />
    </div>
  );
}
