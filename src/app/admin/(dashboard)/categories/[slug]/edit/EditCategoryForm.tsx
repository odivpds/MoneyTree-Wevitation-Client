"use client";

import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";
import { updateCategory } from "../../actions";
import { Category } from "@prisma/client";

export default function EditCategoryForm({ category }: { category: Category }) {
  // Parse min and max from priceText if it follows the "min - max RB" format
  let defaultMinPrice = "";
  let defaultMaxPrice = "";
  if (category.priceText && category.priceText.includes(" - ")) {
    const parts = category.priceText.split(" - ");
    if (parts.length === 2) {
      const isOldFormat = category.priceText.includes("RB");
      
      let minStr = parts[0].replace(/[^0-9]/g, "");
      let maxStr = parts[1].replace(/[^0-9]/g, "");
      
      if (isOldFormat) {
        minStr = minStr ? (Number(minStr) * 1000).toString() : "";
        maxStr = maxStr ? (Number(maxStr) * 1000).toString() : "";
      }
      
      defaultMinPrice = minStr;
      defaultMaxPrice = maxStr;
    }
  }

  const updateCategoryWithSlug = updateCategory.bind(null, category.slug);

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <Link href="/admin/categories" className="text-gray-500 hover:text-[#222] transition-colors font-medium text-sm underline underline-offset-4">
          <ArrowLeft size={16} className="inline mr-1" />
          Kembali ke Kategori
        </Link>
        <h2 className="text-4xl font-serif tracking-tight text-[#222] mt-4 mb-2">Edit Kategori: {category.name}</h2>
        <p className="text-gray-500 text-sm">Ubah detail kategori desain undangan Anda.</p>
      </div>

      <form action={updateCategoryWithSlug} className="bg-white rounded-3xl border border-[#E6DFD1] p-8 space-y-6 shadow-sm">
        <div className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-bold text-[#333] mb-2 uppercase tracking-wide">Nama Kategori</label>
            <input
              type="text"
              id="name"
              name="name"
              defaultValue={category.name}
              required
              placeholder="Contoh: Basic"
              className="w-full px-4 py-3 bg-[#faf7f2] border border-[#D4C4B7] rounded-xl text-[#333] focus:outline-none focus:ring-2 focus:ring-[#677359] focus:border-transparent transition-all"
            />
          </div>

          <div>
            <label htmlFor="slug" className="block text-sm font-bold text-[#333] mb-2 uppercase tracking-wide">Slug (URL)</label>
            <input
              type="text"
              id="slug"
              name="slug"
              defaultValue={category.slug}
              required
              placeholder="Contoh: basic"
              className="w-full px-4 py-3 bg-[#faf7f2] border border-[#D4C4B7] rounded-xl text-[#333] focus:outline-none focus:ring-2 focus:ring-[#677359] focus:border-transparent transition-all"
            />
            <p className="text-xs text-gray-500 mt-1">Harus unik, huruf kecil, tanpa spasi (gunakan tanda hubung -).</p>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-bold text-[#333] mb-2 uppercase tracking-wide">Deskripsi Kategori</label>
            <textarea
              id="description"
              name="description"
              defaultValue={category.description || ""}
              rows={3}
              placeholder="Desain elegan sederhana untuk acara pernikahan Anda..."
              className="w-full px-4 py-3 bg-[#faf7f2] border border-[#D4C4B7] rounded-xl text-[#333] focus:outline-none focus:ring-2 focus:ring-[#677359] focus:border-transparent transition-all"
            ></textarea>
          </div>
          {/* Price Range Section */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="minPrice" className="block text-sm font-bold text-[#333] mb-2 uppercase tracking-wide">Harga Minimum</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">Rp</span>
                <input
                  type="text"
                  id="minPrice"
                  name="minPrice"
                  defaultValue={defaultMinPrice}
                  placeholder="100000"
                  required
                  onInput={(e) => {
                    e.currentTarget.value = e.currentTarget.value.replace(/[^0-9]/g, '');
                  }}
                  className="w-full pl-12 pr-4 py-3 bg-[#faf7f2] border border-[#D4C4B7] rounded-xl text-[#333] focus:outline-none focus:ring-2 focus:ring-[#677359] focus:border-transparent transition-all"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="maxPrice" className="block text-sm font-bold text-[#333] mb-2 uppercase tracking-wide">Harga Maximum</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">Rp</span>
                <input
                  type="text"
                  id="maxPrice"
                  name="maxPrice"
                  defaultValue={defaultMaxPrice}
                  placeholder="300000"
                  required
                  onInput={(e) => {
                    e.currentTarget.value = e.currentTarget.value.replace(/[^0-9]/g, '');
                  }}
                  className="w-full pl-12 pr-4 py-3 bg-[#faf7f2] border border-[#D4C4B7] rounded-xl text-[#333] focus:outline-none focus:ring-2 focus:ring-[#677359] focus:border-transparent transition-all"
                />
              </div>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-1">Masukkan angka penuh tanpa titik. Contoh: 100000 dan 300000 akan menjadi "Rp.100.000 - Rp.300.000"</p>
        </div>

        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            className="flex items-center space-x-2 bg-[#677359] hover:bg-[#58634c] text-white px-8 py-3 rounded-full text-sm font-medium transition-all shadow-sm"
          >
            <Save size={18} />
            <span>Simpan Perubahan</span>
          </button>
        </div>
      </form>
    </div>
  );
}
