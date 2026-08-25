"use client";

import { useState } from "react";
import Link from "next/link";
import { Edit, Trash2, Loader2 } from "lucide-react";
import { deleteCategory } from "../actions";

export default function CategoryActions({ id, slug, name }: { id: string, slug: string, name: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    const res = await deleteCategory(id);
    if (!res.success) {
      alert(res.error);
      setDeleting(false);
    } else {
      setIsOpen(false);
    }
  };

  return (
    <div className="flex items-center justify-end space-x-2">
      <Link 
        href={`/admin/categories/${slug}/edit`}
        title="Edit Kategori"
        className="text-gray-400 hover:text-[#677359] transition-colors p-2"
      >
        <Edit size={18} />
      </Link>
      
      <button 
        onClick={() => setIsOpen(true)}
        title="Hapus Kategori"
        className="text-gray-400 hover:text-red-500 transition-colors p-2"
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
          <div className="relative z-50 grid w-full max-w-lg scale-100 gap-4 border border-[#E6DFD1] bg-white p-6 shadow-lg sm:rounded-2xl md:w-full animate-in fade-in-90 zoom-in-95 duration-200">
            <div className="flex flex-col space-y-2 text-center sm:text-left">
              <h2 className="text-xl font-serif font-bold text-[#222]">
                Anda yakin ingin menghapus?
              </h2>
              <p className="text-sm text-gray-500">
                Tindakan ini tidak dapat dibatalkan. Ini akan menghapus permanen kategori 
                <strong className="text-[#333] font-bold ml-1">"{name}"</strong> dari sistem.
              </p>
            </div>
            
            <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-3 mt-4">
              <button
                onClick={() => setIsOpen(false)}
                disabled={deleting}
                className="mt-3 sm:mt-0 inline-flex h-11 items-center justify-center rounded-full border border-[#E6DFD1] bg-white px-6 text-sm font-medium text-[#333] hover:bg-[#faf7f2] transition-colors disabled:opacity-50 shadow-sm"
              >
                Batal
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="inline-flex h-11 items-center justify-center space-x-2 rounded-full bg-red-500 px-6 text-sm font-medium text-white hover:bg-red-600 transition-colors disabled:opacity-50 shadow-sm"
              >
                {deleting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Menghapus...</span>
                  </>
                ) : (
                  <span>Ya, Hapus</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
