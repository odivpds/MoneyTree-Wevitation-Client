"use client";

import { useState } from "react";
import { Trash2, Loader2, AlertCircle } from "lucide-react";
import { deleteInvitation } from "../actions";

export default function DeleteInvitationButton({ id, title }: { id: string, title: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    const res = await deleteInvitation(id);
    if (!res.success) {
      alert(res.error);
      setDeleting(false);
    } else {
      setIsOpen(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        title="Hapus Undangan"
        className="text-gray-400 hover:text-red-500 transition-colors"
      >
        <Trash2 size={18} />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
            onClick={() => !deleting && setIsOpen(false)}
          ></div>

          {/* Dialog */}
          <div className="relative z-50 grid w-full max-w-lg scale-100 gap-4 border border-[#E6DFD1] bg-white p-6 shadow-xl sm:rounded-2xl md:w-full">
            <div className="flex flex-col space-y-2 text-center sm:text-left">
              <h2 className="text-lg font-serif font-bold text-[#333]">
                Ahh yang bener nii klee?
              </h2>
              <p className="text-sm text-gray-500">
                Kalau mu dah hapus ni, berarti tar gabisa balik lagi dia cuk, kehapus permanen dah
                <strong className="text-[#333] font-medium ml-1">"{title}"</strong> Gapapaa?.
              </p>
            </div>

            <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 mt-4">
              <button
                onClick={() => setIsOpen(false)}
                disabled={deleting}
                className="mt-2 inline-flex h-10 items-center justify-center rounded-full border border-[#E6DFD1] bg-white px-4 py-2 text-sm font-semibold text-[#333] hover:bg-[#F9F7F2] transition-colors sm:mt-0 disabled:opacity-50"
              >
                Gajadi
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="inline-flex h-10 items-center justify-center space-x-2 rounded-full bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600 transition-colors disabled:opacity-50"
              >
                {deleting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Menghapus...</span>
                  </>
                ) : (
                  <span>Lanjut</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
