import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import EditCategoryForm from "./EditCategoryForm";

export default async function EditCategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  const category = await prisma.category.findUnique({
    where: { slug }
  });

  if (!category) {
    notFound();
  }

  return <EditCategoryForm category={category} />;
}
