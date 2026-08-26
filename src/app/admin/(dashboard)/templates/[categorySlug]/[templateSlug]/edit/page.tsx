import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import EditTemplateForm from "./EditTemplateForm";

export default async function EditTemplatePage({ params }: { params: Promise<{ categorySlug: string, templateSlug: string }> }) {
  const { categorySlug, templateSlug } = await params;
  
  const template = await prisma.template.findUnique({
    where: { slug: templateSlug }
  });

  if (!template) {
    notFound();
  }

  const categories = await prisma.category.findMany({
    orderBy: { createdAt: "asc" }
  });

  return <EditTemplateForm template={template} categories={categories} categorySlug={categorySlug} />;
}
