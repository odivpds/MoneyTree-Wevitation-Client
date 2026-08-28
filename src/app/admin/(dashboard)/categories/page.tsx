import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Plus, Tag, Banknote, ChevronRight, Layers, LayoutGrid } from "lucide-react";
import CategoryActions from "./components/CategoryActions";

const PRIORITY_ORDER = ["Basic", "Premium", "Exclusive"];

export default async function CategoriesPage() {
  const fetchedCategories = await prisma.category.findMany({
    orderBy: { createdAt: "asc" },
    include: {
      _count: {
        select: { templates: true }
      }
    }
  });

  const categories = [...fetchedCategories].sort((a, b) => {
    const indexA = PRIORITY_ORDER.indexOf(a.name);
    const indexB = PRIORITY_ORDER.indexOf(b.name);

    const weightA = indexA === -1 ? 99 : indexA;
    const weightB = indexB === -1 ? 99 : indexB;

    return weightA - weightB;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="text-3xl font-serif tracking-tight text-[#222] mb-1">Kategori Undangan</h2>
          <p className="text-gray-500 text-sm">
            Kelola klasifikasi desain dan rentang harga undangan.
          </p>
        </div>
        <Link
          href="/admin/categories/create"
          className="flex items-center space-x-2 bg-[#677359] hover:bg-[#58634c] text-white px-5 py-2.5 rounded-full text-sm font-semibold transition-all shadow-sm active:scale-95"
        >
          <Plus size={16} strokeWidth={2.5} />
          <span>Tambah Kategori</span>
        </Link>
      </div>

      {/* Grid Section - 2 Columns for spacious feel */}
      {categories.length === 0 ? (
        <div className="bg-white rounded-3xl border border-dashed border-[#D4C4B7] p-20 text-center">
          <LayoutGrid className="mx-auto text-[#D4C4B7] mb-4" size={48} strokeWidth={1} />
          <p className="text-gray-500 text-sm">Belum ada kategori yang ditambahkan.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {categories.map((cat) => (
            <div key={cat.id} className="relative group">
              {/* Menu Aksi (Edit/Hapus) - Positioned Absolutely */}
              <div className="absolute top-6 right-6 z-10">
                <CategoryActions id={cat.id} slug={cat.slug} name={cat.name} />
              </div>

              {/* Main Card Link */}
              <Link
                href={`/admin/templates/${cat.slug}`}
                className="block bg-white rounded-[32px] border border-[#E6DFD1] p-8 transition-all duration-300 hover:shadow-lg hover:border-[#D4C4B7] active:scale-[0.99]"
              >
                <div className="flex flex-col h-full">
                  {/* Top: Icon & Title */}
                  <div className="flex items-center gap-5 mb-6">
                    <div className="w-14 h-14 bg-[#faf7f2] rounded-2xl flex items-center justify-center group-hover:bg-[#F0EBE1] transition-colors">
                      <Tag size={24} className="text-[#677359]" strokeWidth={1.5} />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">{cat.slug}</span>
                      <h3 className="font-serif font-bold text-[#222] text-xl group-hover:text-[#677359] transition-colors">
                        {cat.name}
                      </h3>
                    </div>
                  </div>

                  {/* Middle: Description */}
                  <p className="text-gray-500 text-sm leading-relaxed mb-8 line-clamp-2 pr-6">
                    {cat.description || "Kelola koleksi desain undangan terbaik untuk kategori ini."}
                  </p>

                  {/* Bottom: Info Bar */}
                  <div className="mt-auto flex items-center justify-between border-t border-[#f8f5f0] pt-6">
                    <div className="flex flex-col gap-1">
                      <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Rentang Harga</span>
                      <div className="flex items-center text-[#333] font-semibold text-sm">
                        <Banknote size={16} className="mr-2 text-[#677359]" />
                        <span>{cat.priceText || "Belum diatur"}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 bg-[#faf7f2] px-4 py-2 rounded-xl border border-[#E6DFD1] group-hover:bg-white transition-colors">
                      <Layers size={16} className="text-[#677359]" />
                      <span className="text-[#677359] font-bold text-sm">
                        {cat._count.templates} <span className="font-medium opacity-70">Desain</span>
                      </span>
                      <ChevronRight size={14} className="text-[#677359]/30 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}