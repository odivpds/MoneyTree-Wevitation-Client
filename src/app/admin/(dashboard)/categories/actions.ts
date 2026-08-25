"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createCategory(formData: FormData) {
  const name = formData.get("name") as string;
  const slug = formData.get("slug") as string;
  const description = formData.get("description") as string;
  const minPrice = formData.get("minPrice") as string;
  const maxPrice = formData.get("maxPrice") as string;
  const priceText = `${minPrice} - ${maxPrice} RB`;

  if (!name || !slug) {
    throw new Error("Name and slug are required");
  }

  await prisma.category.create({
    data: {
      name,
      slug: slug.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      description,
      priceText,
    },
  });

  revalidatePath("/admin/categories");
  redirect("/admin/categories");
}

export async function updateCategory(originalSlug: string, formData: FormData) {
  const name = formData.get("name") as string;
  const slug = formData.get("slug") as string;
  const description = formData.get("description") as string;
  const minPrice = formData.get("minPrice") as string;
  const maxPrice = formData.get("maxPrice") as string;
  const priceText = `${minPrice} - ${maxPrice} RB`;

  if (!name || !slug) {
    throw new Error("Name and slug are required");
  }

  if (originalSlug !== slug) {
    const existing = await prisma.category.findUnique({
      where: { slug }
    });
    if (existing) {
      throw new Error("Slug sudah digunakan oleh kategori lain.");
    }
  }

  await prisma.category.update({
    where: { slug: originalSlug },
    data: {
      name,
      slug: slug.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      description,
      priceText,
    },
  });

  revalidatePath("/admin/categories");
  redirect("/admin/categories");
}

export async function deleteCategory(id: string) {
  try {
    await prisma.category.delete({
      where: { id },
    });
    revalidatePath("/admin/categories");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to delete category:", error);
    return { success: false, error: error.message || "Failed to delete category" };
  }
}
