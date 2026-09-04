"use client";

import { useState } from "react";
import Link from "next/link";
import { updateTemplate } from "../../../actions";
import { Template, Category } from "@prisma/client";
import ThumbnailUpload from "../../../components/ThumbnailUpload";

export default function EditTemplateForm({ template, categories, categorySlug }: { template: Template, categories: Category[], categorySlug: string }) {
  const [type, setType] = useState(template.type);
  const [features, setFeatures] = useState<any>(
    template.features && Object.keys(template.features).length > 0 ? template.features : {
      showAkad: true,
      showResepsi: true,
      showAkadMap: true,
      showResepsiMap: true,
      showInstagram: true,
      showGift: true,
      showBank2: true,
      showGallery: true,
      showMusic: true,
      showCountdown: true,
      showRSVP: true
    }
  );

  // We bind the categorySlug and the original slug to the server action
  const updateTemplateWithSlug = updateTemplate.bind(null, categorySlug, template.slug);

  const addRequiredImage = () => {
    const currentImages = features.requiredImages || [];
    setFeatures({ ...features, requiredImages: [...currentImages, { key: '', label: '' }] });
  };

  const updateRequiredImage = (index: number, field: string, value: string) => {
    const currentImages = [...(features.requiredImages || [])];
    currentImages[index] = { ...currentImages[index], [field]: value };
    setFeatures({ ...features, requiredImages: currentImages });
  };

  const removeRequiredImage = (index: number) => {
    const currentImages = [...(features.requiredImages || [])];
    currentImages.splice(index, 1);
    setFeatures({ ...features, requiredImages: currentImages });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-serif tracking-tight text-[#222] mb-2">Edit Template: {template.name}</h2>
          <p className="text-gray-500 text-sm">Perbarui data atau kode template ini.</p>
        </div>
        <Link href={`/admin/templates/${categorySlug}`} className="text-gray-500 hover:text-[#222] transition-colors font-medium text-sm underline underline-offset-4">
          Batal & Kembali
        </Link>
      </div>

      <form action={updateTemplateWithSlug} className="bg-white rounded-3xl border border-[#E6DFD1] shadow-sm p-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold text-[#333] uppercase tracking-wider mb-2">Nama Template</label>
            <input type="text" name="name" defaultValue={template.name} required className="w-full border border-[#E6DFD1] bg-[#faf7f2] rounded-xl p-3 text-[#222] placeholder-gray-400 focus:outline-none focus:border-[#677359] focus:ring-1 focus:ring-[#677359] transition-all" placeholder="Contoh: Agung" />
          </div>
          <div>
            <label className="block text-sm font-bold text-[#333] uppercase tracking-wider mb-2">Slug (ID Unik)</label>
            <input type="text" name="slug" defaultValue={template.slug} required className="w-full border border-[#E6DFD1] bg-[#faf7f2] rounded-xl p-3 text-[#222] placeholder-gray-400 focus:outline-none focus:border-[#677359] focus:ring-1 focus:ring-[#677359] transition-all" placeholder="contoh: agung-v2" />
          </div>
        </div>

        <ThumbnailUpload defaultValue={template.image?.replace("http://localhost:3001", "") || ""} />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-bold text-[#333] uppercase tracking-wider mb-2">Tipe Template</label>
            <select name="type" className="w-full border border-[#E6DFD1] bg-[#faf7f2] rounded-xl p-3 text-[#222] focus:outline-none focus:border-[#677359] focus:ring-1 focus:ring-[#677359] transition-all" value={type} onChange={(e) => setType(e.target.value)}>
              <option value="html">Vanilla HTML (Platform-Driven)</option>
              <option value="html-js">Advanced HTML + JS (Iframe)</option>
              <option value="react">React Component (Internal)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-[#333] uppercase tracking-wider mb-2">Kategori</label>
            <input type="hidden" name="categoryId" value={template.categoryId || ""} />
            <select disabled value={template.categoryId || ""} className="w-full border border-[#E6DFD1] bg-[#f0ebe1] rounded-xl p-3 text-gray-500 cursor-not-allowed">
              <option value="">Belum Berkategori</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
            <p className="text-xs text-gray-400 mt-1">Kategori dikunci. Pindahkan dari daftar kategori jika perlu.</p>
          </div>
          <div>
            <label className="block text-sm font-bold text-[#333] uppercase tracking-wider mb-2">Harga / Paket</label>
            <input type="text" name="price" defaultValue={template.price || ""} className="w-full border border-[#E6DFD1] bg-[#faf7f2] rounded-xl p-3 text-[#222] placeholder-gray-400 focus:outline-none focus:border-[#677359] focus:ring-1 focus:ring-[#677359] transition-all" placeholder="Rp 350.000 atau Gratis" />
          </div>
        </div>

        {(type === 'html' || type === 'html-js') && (
          <div className="space-y-6 pt-4 border-t border-[#E6DFD1]">
            <div>
              <label className="block text-sm font-bold text-[#333] uppercase tracking-wider mb-1">HTML Content</label>
              <p className="text-xs text-gray-500 mb-3">Gunakan tag kurung kurawal ganda, cth: {'{{groomName}}'}</p>
              <textarea name="htmlContent" defaultValue={template.htmlContent || ""} rows={8} className="w-full border border-[#E6DFD1] bg-[#faf7f2] rounded-xl p-4 font-mono text-sm text-[#222] placeholder-gray-400 focus:outline-none focus:border-[#677359] focus:ring-1 focus:ring-[#677359] transition-all" placeholder="<div class='undangan'>...</div>"></textarea>
            </div>
            <div>
              <label className="block text-sm font-bold text-[#333] uppercase tracking-wider mb-2">CSS Content</label>
              <textarea name="cssContent" defaultValue={template.cssContent || ""} rows={6} className="w-full border border-[#E6DFD1] bg-[#faf7f2] rounded-xl p-4 font-mono text-sm text-[#222] placeholder-gray-400 focus:outline-none focus:border-[#677359] focus:ring-1 focus:ring-[#677359] transition-all" placeholder=".undangan { color: red; }"></textarea>
            </div>
          </div>
        )}

        {type === 'html-js' && (
          <div className="pt-4 border-t border-[#E6DFD1]">
            <label className="block text-sm font-bold text-[#333] uppercase tracking-wider mb-1">JavaScript Content (Opsional)</label>
            <p className="text-xs text-gray-500 mb-3">Skrip ini akan berjalan di dalam Sandbox Iframe terpisah.</p>
            <textarea name="jsContent" defaultValue={template.jsContent || ""} rows={6} className="w-full border border-[#E6DFD1] bg-[#faf7f2] rounded-xl p-4 font-mono text-sm text-[#222] placeholder-gray-400 focus:outline-none focus:border-[#677359] focus:ring-1 focus:ring-[#677359] transition-all" placeholder="console.log('Template loaded');"></textarea>
          </div>
        )}

        <div className="pt-4 border-t border-[#E6DFD1]">
          <label className="block text-sm font-bold text-[#333] uppercase tracking-wider mb-4">Fitur Template</label>
          <input type="hidden" name="features" value={JSON.stringify(features)} />
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            {[
              { id: 'showAkad', label: 'Akad / Pemberkatan' },
              { id: 'showAkadMap', label: 'Maps Akad' },
              { id: 'showResepsi', label: 'Resepsi' },
              { id: 'showResepsiMap', label: 'Maps Resepsi' },
              { id: 'showInstagram', label: 'Instagram IG' },
              { id: 'showGift', label: 'Amplop Digital' },
              { id: 'showBank2', label: 'Bank ke-2' },
              { id: 'showGallery', label: 'Galeri Foto' },
              { id: 'showMusic', label: 'Musik Latar' },
              { id: 'showCountdown', label: 'Hitung Mundur' },
              { id: 'showRSVP', label: 'Form Kehadiran' }
            ].map(feature => (
              <label key={feature.id} className="flex items-center space-x-3 cursor-pointer bg-[#faf7f2] p-3 rounded-xl border border-[#E6DFD1] hover:bg-[#f3eedd] transition-colors">
                <input 
                  type="checkbox" 
                  className="form-checkbox h-5 w-5 text-[#677359] rounded focus:ring-[#677359] border-gray-300"
                  checked={features[feature.id] !== false && features[feature.id] !== 'false'}
                  onChange={(e) => setFeatures({ ...features, [feature.id]: e.target.checked })}
                />
                <span className="text-sm font-medium text-[#333]">{feature.label}</span>
              </label>
            ))}
          </div>

          <div className="mt-8 border-t border-[#E6DFD1] pt-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <label className="block text-sm font-bold text-[#333] uppercase tracking-wider mb-1">Kebutuhan Foto Klien</label>
                <p className="text-xs text-gray-500">Tambahkan daftar foto yang wajib diupload klien (misal: Foto Sampul, Galeri).</p>
              </div>
              <button type="button" onClick={addRequiredImage} className="text-xs bg-[#E6DFD1] hover:bg-[#d6cfbe] text-[#333] px-4 py-2 rounded-lg font-medium transition-colors">
                + Tambah Foto
              </button>
            </div>
            
            {(features.requiredImages || []).length === 0 ? (
              <div className="text-center py-6 bg-[#faf7f2] border border-dashed border-[#E6DFD1] rounded-xl">
                <p className="text-sm text-gray-400">Belum ada kebutuhan foto dinamis yang ditambahkan.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {(features.requiredImages || []).map((img: any, idx: number) => (
                  <div key={idx} className="flex gap-4 items-start bg-[#faf7f2] p-4 rounded-xl border border-[#E6DFD1]">
                    <div className="flex-1">
                      <label className="block text-xs font-bold text-gray-500 mb-1">Variabel Kode (Key)</label>
                      <input 
                        type="text" 
                        required
                        className="w-full border border-[#E6DFD1] bg-white rounded-lg p-2 text-sm focus:outline-none focus:border-[#677359] focus:ring-1 focus:ring-[#677359]" 
                        placeholder="Contoh: coverPhoto" 
                        value={img.key} 
                        onChange={(e) => updateRequiredImage(idx, 'key', e.target.value)} 
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs font-bold text-gray-500 mb-1">Label Form (Dilihat Klien)</label>
                      <input 
                        type="text" 
                        required
                        className="w-full border border-[#E6DFD1] bg-white rounded-lg p-2 text-sm focus:outline-none focus:border-[#677359] focus:ring-1 focus:ring-[#677359]" 
                        placeholder="Contoh: Foto Sampul Depan" 
                        value={img.label} 
                        onChange={(e) => updateRequiredImage(idx, 'label', e.target.value)} 
                      />
                    </div>
                    <button type="button" onClick={() => removeRequiredImage(idx)} className="mt-6 text-red-400 hover:text-red-600 p-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="pt-8 border-t border-[#E6DFD1] flex justify-end">
          <button type="submit" className="cursor-pointer bg-[#677359] hover:bg-[#58634c] text-white px-8 py-3 rounded-full text-sm font-medium transition-all shadow-sm w-full sm:w-auto">
            Update Template
          </button>
        </div>
      </form>
    </div>
  );
}
