import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Plus, ExternalLink, Calendar } from "lucide-react";
import { Key, ReactElement, JSXElementConstructor, ReactNode, ReactPortal } from "react";
import DeleteInvitationButton from "./components/DeleteInvitationButton";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const invitations = await prisma.invitation.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-serif tracking-tight text-[#222] mb-2">Invitations</h2>
          <p className="text-gray-500 text-sm">Manage your clients' digital wedding invitations.</p>
        </div>
        <Link
          href="/admin/invitations/create"
          className="flex items-center space-x-2 bg-[#677359] hover:bg-[#58634c] text-white px-6 py-3 rounded-full text-sm font-medium transition-all shadow-sm"
        >
          <Plus size={18} strokeWidth={2.5} />
          <span>New Invitation</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {invitations.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center p-12 border border-[#E6DFD1] border-dashed rounded-3xl bg-white shadow-sm">
            <p className="text-gray-500 text-lg mb-4">No invitations found.</p>
            <Link href="/admin/invitations/create" className="text-[#677359] hover:text-[#58634c] font-medium underline underline-offset-4">
              Create your first invitation &rarr;
            </Link>
          </div>
        ) : (
          invitations.map((inv: any) => (
            <div key={inv.id} className="group relative flex flex-col border border-[#E6DFD1] bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-md hover:border-[#D4C4B7] transition-all">
              
              {/* Live Thumbnail using Iframe */}
              <div className="relative w-full h-48 bg-[#F0EBE1] border-b border-[#E6DFD1] overflow-hidden">
                {/* 
                  By setting the iframe size to 4x (400%) and scaling it down to 25%, 
                  we get a nice miniature preview of the actual webpage.
                */}
                <iframe
                  src={`/${inv.slug}`}
                  className="absolute top-0 left-0 w-[400%] h-[400%] origin-top-left scale-[0.25] pointer-events-none border-0"
                  tabIndex={-1}
                  aria-hidden="true"
                />
                
                {/* Gradient overlay to make text/UI over it readable and look sleek */}
                <div className="absolute inset-0 bg-gradient-to-t from-white/90 to-transparent opacity-80 pointer-events-none"></div>
                
                {/* Status Badge floating on top right of thumbnail */}
                <div className="absolute top-4 left-4 z-10 flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-[#E6DFD1] text-[10px] font-bold text-[#333] shadow-sm uppercase tracking-wider">
                  <span className={`w-1.5 h-1.5 rounded-full ${inv.status === 'PUBLISHED' ? 'bg-[#677359]' : 'bg-[#D4C4B7]'}`}></span>
                  <span>{inv.status}</span>
                </div>
              </div>

              {/* Card Details Content */}
              <div className="p-6 relative flex flex-col flex-grow">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-serif font-bold text-[#222] line-clamp-1 pr-4">{inv.title}</h3>
                  <div className="shrink-0 -mt-1 -mr-2">
                    <DeleteInvitationButton id={inv.id as string} title={inv.title as string} />
                  </div>
                </div>

                <div className="flex items-center space-x-2 text-gray-500 text-xs mb-6">
                  <Calendar size={14} />
                  <span>{new Date(inv.createdAt).toLocaleDateString()}</span>
                </div>

                <div className="flex items-center justify-between border-t border-[#E6DFD1] pt-4 mt-auto">
                  <div className="text-xs text-gray-400 font-mono truncate max-w-[200px]">
                    /{inv.slug}
                  </div>
                  <div className="flex items-center space-x-4">
                    <Link
                      href={`/admin/invitations/${String(inv.id)}`}
                      className="flex items-center space-x-1 text-[#677359] hover:text-[#58634c] text-xs font-bold uppercase tracking-wider transition-colors"
                    >
                      <span>Manage</span>
                    </Link>
                    <a
                      href={`/${inv.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-1 text-gray-500 hover:text-[#333] text-xs font-bold uppercase tracking-wider transition-colors"
                    >
                      <span>Preview</span>
                      <ExternalLink size={14} />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
