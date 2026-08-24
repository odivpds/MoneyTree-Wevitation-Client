"use client";

import { useState } from "react";
import Link from "next/link";
import { createTemplate } from "../actions";
import ThumbnailUpload from "../components/ThumbnailUpload";

export default function CreateTemplatePage() {
  const [type, setType] = useState('html');

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-serif tracking-tight text-[#222] mb-2">Tambah Template Baru</h2>
          <p className="text-gray-500 text-sm">Tambahkan desain undangan baru ke dalam sistem.</p>
        </div>
        <Link href="/admin/templates" className="text-gray-500 hover:text-[#222] transition-colors font-medium text-sm underline underline-offset-4">
          Batal & Kembali
        </Link>
      </div>

      <form action={createTemplate} className="bg-white rounded-3xl border border-[#E6DFD1] shadow-sm p-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold text-[#333] uppercase tracking-wider mb-2">Nama Template</label>
            <input type="text" name="name" required className="w-full border border-[#E6DFD1] bg-[#faf7f2] rounded-xl p-3 text-[#222] placeholder-gray-400 focus:outline-none focus:border-[#677359] focus:ring-1 focus:ring-[#677359] transition-all" placeholder="Contoh: Agung" />
          </div>
          <div>
            <label className="block text-sm font-bold text-[#333] uppercase tracking-wider mb-2">Slug (ID Unik)</label>
            <input type="text" name="slug" required className="w-full border border-[#E6DFD1] bg-[#faf7f2] rounded-xl p-3 text-[#222] placeholder-gray-400 focus:outline-none focus:border-[#677359] focus:ring-1 focus:ring-[#677359] transition-all" placeholder="contoh: agung-v2" />
          </div>
        </div>

        <ThumbnailUpload />

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
            <select name="category" className="w-full border border-[#E6DFD1] bg-[#faf7f2] rounded-xl p-3 text-[#222] focus:outline-none focus:border-[#677359] focus:ring-1 focus:ring-[#677359] transition-all">
              <option value="tradisional">Tradisional</option>
              <option value="modern">Modern</option>
              <option value="minimalis">Minimalis</option>
              <option value="romantis">Romantis</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-[#333] uppercase tracking-wider mb-2">Harga / Paket</label>
            <input type="text" name="price" className="w-full border border-[#E6DFD1] bg-[#faf7f2] rounded-xl p-3 text-[#222] placeholder-gray-400 focus:outline-none focus:border-[#677359] focus:ring-1 focus:ring-[#677359] transition-all" placeholder="Rp 350.000 atau Gratis" />
          </div>
        </div>

        {(type === 'html' || type === 'html-js') && (
          <div className="space-y-6 pt-4 border-t border-[#E6DFD1]">
            <div>
              <label className="block text-sm font-bold text-[#333] uppercase tracking-wider mb-1">HTML Content</label>
              <p className="text-xs text-gray-500 mb-3">Gunakan tag kurung kurawal ganda, cth: {'{{groomName}}'}</p>
              <textarea name="htmlContent" rows={8} className="w-full border border-[#E6DFD1] bg-[#faf7f2] rounded-xl p-4 font-mono text-sm text-[#222] placeholder-gray-400 focus:outline-none focus:border-[#677359] focus:ring-1 focus:ring-[#677359] transition-all" placeholder="<div class='undangan'>...</div>"></textarea>
            </div>
            <div>
              <label className="block text-sm font-bold text-[#333] uppercase tracking-wider mb-2">CSS Content</label>
              <textarea name="cssContent" rows={6} className="w-full border border-[#E6DFD1] bg-[#faf7f2] rounded-xl p-4 font-mono text-sm text-[#222] placeholder-gray-400 focus:outline-none focus:border-[#677359] focus:ring-1 focus:ring-[#677359] transition-all" placeholder=".undangan { color: red; }"></textarea>
            </div>
          </div>
        )}

        {type === 'html-js' && (
          <div className="pt-4 border-t border-[#E6DFD1]">
            <label className="block text-sm font-bold text-[#333] uppercase tracking-wider mb-1">JavaScript Content (Opsional)</label>
            <p className="text-xs text-gray-500 mb-3">Skrip ini akan berjalan di dalam Sandbox Iframe terpisah.</p>
            <textarea name="jsContent" rows={6} className="w-full border border-[#E6DFD1] bg-[#faf7f2] rounded-xl p-4 font-mono text-sm text-[#222] placeholder-gray-400 focus:outline-none focus:border-[#677359] focus:ring-1 focus:ring-[#677359] transition-all" placeholder="console.log('Template loaded');"></textarea>
          </div>
        )}

        <div className="pt-8 border-t border-[#E6DFD1] flex justify-end">
          <button type="submit" className="bg-[#677359] hover:bg-[#58634c] text-white px-8 py-3 rounded-full text-sm font-medium transition-all shadow-sm w-full sm:w-auto">
            Simpan Template
          </button>
        </div>
      </form>
    </div>
  );
}
