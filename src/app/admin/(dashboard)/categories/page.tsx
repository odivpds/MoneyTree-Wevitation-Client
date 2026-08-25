import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Plus } from "lucide-react";
import CategoryActions from "./components/CategoryActions";

export default async function CategoriesPage() {
  const categories = await prisma.category.findMany({
    orderBy: { createdAt: "asc" }
  });

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-serif tracking-tight text-[#222] mb-2">Manajemen Kategori</h2>
          <p className="text-gray-500 text-sm">Kelola kategori desain undangan secara dinamis.</p>
        </div>
        <Link 
          href="/admin/categories/create" 
          className="flex items-center space-x-2 bg-[#677359] hover:bg-[#58634c] text-white px-6 py-3 rounded-full text-sm font-medium transition-all shadow-sm"
        >
          <Plus size={18} strokeWidth={2.5} />
          <span>Tambah Kategori</span>
        </Link>
      </div>

      <div className="bg-white rounded-3xl border border-[#E6DFD1] overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead className="bg-[#F0EBE1] border-b border-[#E6DFD1]">
            <tr>
              <th className="p-5 font-bold text-[#333] text-sm uppercase tracking-wider">Nama Kategori</th>
              <th className="p-5 font-bold text-[#333] text-sm uppercase tracking-wider">Slug</th>
              <th className="p-5 font-bold text-[#333] text-sm uppercase tracking-wider">Rentang Harga</th>
              <th className="p-5 font-bold text-[#333] text-sm uppercase tracking-wider text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E6DFD1]">
            {categories.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-12 text-center text-gray-500">
                  Belum ada kategori yang ditambahkan.
                </td>
              </tr>
            ) : (
              categories.map((cat) => (
                <tr key={cat.id} className="hover:bg-[#faf7f2] transition-colors">
                  <td className="p-5 font-serif font-bold text-[#222] text-lg">{cat.name}</td>
                  <td className="p-5 text-gray-500 font-mono text-sm">{cat.slug}</td>
                  <td className="p-5 text-gray-600 font-medium text-sm">{cat.priceText || '-'}</td>
                  <td className="p-5">
                    <CategoryActions id={cat.id} slug={cat.slug} name={cat.name} />
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
