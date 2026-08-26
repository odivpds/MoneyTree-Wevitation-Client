import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { LayoutGrid, Layers, HelpCircle } from "lucide-react";

export default async function TemplatesCategoriesPage() {
  const categories = await prisma.category.findMany({
    orderBy: { createdAt: "asc" },
    include: {
      _count: {
        select: { templates: true }
      }
    }
  });

  const uncategorizedCount = await prisma.template.count({
    where: { categoryId: null }
  });

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-4xl font-serif tracking-tight text-[#222] mb-2">Pilih Kategori Template</h2>
        <p className="text-gray-500 text-sm">Pilih kategori untuk melihat, menambah, atau mengedit template di dalamnya.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={`/admin/templates/${cat.slug}`}
            className="group block bg-white rounded-3xl border border-[#E6DFD1] p-6 hover:shadow-md transition-all hover:border-[#D4C4B7]"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-[#faf7f2] rounded-2xl group-hover:bg-[#F0EBE1] transition-colors">
                <LayoutGrid size={24} className="text-[#677359]" />
              </div>
              <span className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-[#faf7f2] text-xs font-bold text-[#677359] border border-[#E6DFD1]">
                {cat._count.templates} Template
              </span>
            </div>
            <h3 className="font-serif font-bold text-[#222] text-xl mb-1 group-hover:text-[#677359] transition-colors">{cat.name}</h3>
            <p className="text-sm text-gray-500 line-clamp-2">{cat.description || "Tidak ada deskripsi."}</p>
          </Link>
        ))}

        {/* Uncategorized Card
        <Link
          href={`/admin/templates/uncategorized`}
          className="group block bg-white/50 border border-dashed border-[#D4C4B7] rounded-3xl p-6 hover:bg-white hover:shadow-sm transition-all hover:border-solid"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-gray-50 rounded-2xl group-hover:bg-gray-100 transition-colors">
              <HelpCircle size={24} className="text-gray-400" />
            </div>
            <span className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-gray-50 text-xs font-bold text-gray-500 border border-gray-200">
              {uncategorizedCount} Template
            </span>
          </div>
          <h3 className="font-serif font-bold text-gray-700 text-xl mb-1 transition-colors">Belum Berkategori</h3>
          <p className="text-sm text-gray-400">Template yang belum dimasukkan ke dalam kategori apapun.</p>
        </Link> */}
      </div>
    </div>
  );
}
