import Link from "next/link";
import { prisma } from "@/lib/prisma";
import TemplateActions from "./components/TemplateActions";
import { Plus } from "lucide-react";

export default async function TemplatesPage() {
  const templates = await prisma.template.findMany({
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-serif tracking-tight text-[#222] mb-2">Manajemen Template</h2>
          <p className="text-gray-500 text-sm">Kelola template desain undangan untuk klien Anda.</p>
        </div>
        <Link 
          href="/admin/templates/create" 
          className="flex items-center space-x-2 bg-[#677359] hover:bg-[#58634c] text-white px-6 py-3 rounded-full text-sm font-medium transition-all shadow-sm"
        >
          <Plus size={18} strokeWidth={2.5} />
          <span>Tambah Template</span>
        </Link>
      </div>

      <div className="bg-white rounded-3xl border border-[#E6DFD1] overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead className="bg-[#F0EBE1] border-b border-[#E6DFD1]">
            <tr>
              <th className="p-5 font-bold text-[#333] text-sm uppercase tracking-wider">Info Template</th>
              <th className="p-5 font-bold text-[#333] text-sm uppercase tracking-wider">Tipe</th>
              <th className="p-5 font-bold text-[#333] text-sm uppercase tracking-wider">Kategori</th>
              <th className="p-5 font-bold text-[#333] text-sm uppercase tracking-wider">Harga</th>
              <th className="p-5 font-bold text-[#333] text-sm uppercase tracking-wider text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E6DFD1]">
            {templates.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-12 text-center text-gray-500">
                  Belum ada template yang ditambahkan.
                </td>
              </tr>
            ) : (
              templates.map((tpl) => (
                <tr key={tpl.id} className="hover:bg-[#faf7f2] transition-colors">
                  <td className="p-5">
                    <div className="font-serif font-bold text-[#222] text-lg">{tpl.name}</div>
                    <div className="text-xs text-gray-400 font-mono mt-1">/{tpl.slug}</div>
                  </td>
                  <td className="p-5">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                      tpl.type === 'react' 
                        ? 'bg-[#E6DFD1] text-[#222] border-[#D4C4B7]' 
                        : tpl.type === 'html-js' 
                          ? 'bg-[#677359]/10 text-[#677359] border-[#677359]/20'
                          : 'bg-[#faf7f2] text-gray-600 border-[#E6DFD1]'
                    }`}>
                      {tpl.type.toUpperCase()}
                    </span>
                  </td>
                  <td className="p-5 text-gray-600 capitalize text-sm font-medium">{tpl.category}</td>
                  <td className="p-5 text-gray-600 text-sm font-medium">{tpl.price}</td>
                  <td className="p-5 text-right">
                    <TemplateActions id={tpl.id} slug={tpl.slug} title={tpl.name} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
