import { prisma } from "@/lib/prisma";
import CreateTemplateForm from "./CreateTemplateForm";

export default async function CreateTemplatePage({ params }: { params: Promise<{ categorySlug: string }> }) {
  const { categorySlug } = await params;
  
  const categories = await prisma.category.findMany({
    orderBy: { createdAt: "asc" }
  });

  return <CreateTemplateForm categories={categories} categorySlug={categorySlug} />;
}
