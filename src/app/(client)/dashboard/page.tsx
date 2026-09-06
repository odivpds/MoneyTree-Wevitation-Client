"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { TEMPLATES } from "@/config/templates";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faPen, faEye, faTrash, faCalendar, faMapMarkerAlt } from '@fortawesome/free-solid-svg-icons';

interface InvitationDraft {
  id: string; // The draftId
  templateId: string;
  templateName: string;
  groomName: string;
  brideName: string;
  weddingDate: string;
  mainVenue: string;
  updatedAt: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, isLoggedIn, isInitialized } = useAuth();
  const [drafts, setDrafts] = useState<InvitationDraft[]>([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    // Redirect if not logged in
    if (isInitialized && !isLoggedIn) {
      router.push('/login');
    }
  }, [isInitialized, isLoggedIn, router]);

  useEffect(() => {
    if (isLoggedIn && user?.email) {
      const masterKey = `undanganBali_user_drafts_${user.email}`;
      const masterData = localStorage.getItem(masterKey);
      
      if (masterData) {
        try {
          const rawDrafts = JSON.parse(masterData);
          const loadedDrafts = rawDrafts.map((d: any) => {
            const template = TEMPLATES.find(t => t.id === d.templateId);
            return {
              id: d.draftId,
              templateId: d.templateId,
              templateName: template ? template.name : d.templateId,
              groomName: d.groomName || 'Pria',
              brideName: d.brideName || 'Wanita',
              weddingDate: d.weddingDate || 'Belum diatur',
              mainVenue: d.mainVenue || 'Belum diatur',
              updatedAt: d.updatedAt || Date.now()
            };
          });

          loadedDrafts.sort((a: any, b: any) => b.updatedAt - a.updatedAt);
          setDrafts(loadedDrafts);
        } catch (error) {
          console.error("Error parsing master drafts from localStorage", error);
        }
      }
    }
  }, [isLoggedIn, user]);

  const handleDelete = (draftId: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus undangan ini?")) {
      const userKey = user?.email ? `${user.email}_` : '';
      localStorage.removeItem(`undanganBali_data_${userKey}${draftId}`);
      localStorage.removeItem(`undanganBali_photo_${userKey}${draftId}`);
      localStorage.removeItem(`undanganBali_overrides_${userKey}${draftId}`);

      if (user?.email) {
        const masterKey = `undanganBali_user_drafts_${user.email}`;
        const masterData = localStorage.getItem(masterKey);
        if (masterData) {
          const rawDrafts = JSON.parse(masterData);
          const newDrafts = rawDrafts.filter((d: any) => d.draftId !== draftId);
          localStorage.setItem(masterKey, JSON.stringify(newDrafts));
        }
      }

      setDrafts(drafts.filter(d => d.id !== draftId));
    }
  };

  if (!isClient || !isInitialized || !isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500 flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-[#677359] border-t-transparent rounded-full animate-spin"></div>
          <p className="font-medium">Memuat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-12 max-w-7xl">
      <div className="mb-10">
        <div>
          <h1 className="text-4xl font-bold font-serif text-[#222]">Halo, {user?.name}</h1>
          <p className="text-gray-500 mt-2">Kelola undangan pernikahan digital Anda di sini.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Create New Card */}
        <Link href="/templates" className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-[#D4C4B7] rounded-3xl bg-[#faf7f2] hover:bg-white transition-all text-center cursor-pointer group hover:border-[#677359]">
          <FontAwesomeIcon icon={faPlus} className="text-4xl text-[#D4C4B7] mb-4 group-hover:text-[#677359] group-hover:scale-110 transition-all duration-300" />
          <h3 className="text-xl font-bold font-serif text-[#222] group-hover:text-[#677359] transition-colors">Buat Undangan Baru</h3>
          <p className="mt-2 text-sm text-gray-500">Pilih dari koleksi template eksklusif kami</p>
        </Link>

        {/* Draft Cards */}
        {drafts.map((draft) => (
          <div key={draft.id} className="bg-white border border-[#E6DFD1] rounded-3xl p-6 shadow-sm flex flex-col hover:shadow-md transition-all">
            <div className="flex justify-between items-start mb-4">
              <h3 className="font-serif font-bold text-xl text-[#222] leading-tight flex-1 pr-2">{draft.groomName} & {draft.brideName}</h3>
              <span className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-[#faf7f2] text-xs font-bold text-[#677359] border border-[#E6DFD1] whitespace-nowrap">{draft.templateName}</span>
            </div>

            <div className="flex-1 mb-6 space-y-3 text-sm text-gray-600">
              <div className="flex items-center space-x-3">
                <FontAwesomeIcon icon={faCalendar} className="text-[#D4C4B7] w-4" />
                <span>{draft.weddingDate}</span>
              </div>
              <div className="flex items-center space-x-3">
                <FontAwesomeIcon icon={faMapMarkerAlt} className="text-[#D4C4B7] w-4" />
                <span className="truncate">{draft.mainVenue}</span>
              </div>
            </div>

            <div className="flex items-center space-x-2 pt-4 border-t border-[#E6DFD1]">
              <Link href={`/setup?template=${draft.templateId}&draftId=${draft.id}`} className="flex-1 inline-flex items-center justify-center space-x-2 px-4 py-2.5 rounded-full text-sm font-medium transition-colors bg-[#677359] text-white hover:bg-[#58634c]">
                <FontAwesomeIcon icon={faPen} /> <span>Edit</span>
              </Link>
              <Link href={`/preview?template=${draft.templateId}&draftId=${draft.id}`} className="flex-1 inline-flex items-center justify-center space-x-2 px-4 py-2.5 rounded-full text-sm font-medium transition-colors bg-[#faf7f2] text-[#333] border border-[#E6DFD1] hover:bg-[#F0EBE1]">
                <FontAwesomeIcon icon={faEye} /> <span>Preview</span>
              </Link>
              <button onClick={() => handleDelete(draft.id)} className="inline-flex items-center justify-center px-4 py-2.5 rounded-full text-sm font-medium transition-colors bg-white text-red-500 border border-red-200 hover:bg-red-50" title="Hapus">
                <FontAwesomeIcon icon={faTrash} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
