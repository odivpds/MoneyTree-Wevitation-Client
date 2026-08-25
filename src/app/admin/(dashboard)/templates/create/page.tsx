import { prisma } from "@/lib/prisma";
import CreateTemplateForm from "./CreateTemplateForm";

export default async function CreateTemplatePage() {
  const categories = await prisma.category.findMany({
    orderBy: { createdAt: "asc" }
  });

  return <CreateTemplateForm categories={categories} />;
}
