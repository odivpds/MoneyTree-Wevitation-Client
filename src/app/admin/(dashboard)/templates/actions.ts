"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createTemplate(categorySlug: string, formData: FormData) {
  const name = formData.get("name") as string;
  const slug = formData.get("slug") as string;
  const type = formData.get("type") as string;
  const categoryId = formData.get("categoryId") as string;
  const price = formData.get("price") as string;
  const htmlContent = formData.get("htmlContent") as string;
  const cssContent = formData.get("cssContent") as string;
  const jsContent = formData.get("jsContent") as string;
  const image = formData.get("image") as string;
  const featuresStr = formData.get("features") as string;

  if (!name || !slug || !type) {
    throw new Error("Data wajib tidak boleh kosong.");
  }

  let features = null;
  if (featuresStr) {
    try {
      features = JSON.parse(featuresStr);
    } catch (e) {
      throw new Error("Format JSON fitur tidak valid.");
    }
  }

  // Cek duplicate slug
  const existing = await prisma.template.findUnique({
    where: { slug }
  });

  if (existing) {
    throw new Error("Slug sudah digunakan.");
  }

  await prisma.template.create({
    data: {
      name,
      slug,
      type,
      categoryId: categoryId || null,
      price: price || "Gratis",
      image: image || null,
      htmlContent: (type === 'html' || type === 'html-js') ? htmlContent : null,
      cssContent: (type === 'html' || type === 'html-js') ? cssContent : null,
      jsContent: type === 'html-js' ? jsContent : null,
      features: features,
    }
  });

  revalidatePath(`/admin/templates/${categorySlug}`);
  redirect(`/admin/templates/${categorySlug}`);
}

export async function updateTemplate(categorySlug: string, originalSlug: string, formData: FormData) {
  const name = formData.get("name") as string;
  const slug = formData.get("slug") as string;
  const type = formData.get("type") as string;
  const categoryId = formData.get("categoryId") as string;
  const price = formData.get("price") as string;
  const htmlContent = formData.get("htmlContent") as string;
  const cssContent = formData.get("cssContent") as string;
  const jsContent = formData.get("jsContent") as string;
  const image = formData.get("image") as string;
  const featuresStr = formData.get("features") as string;

  if (!name || !slug || !type) {
    throw new Error("Data wajib tidak boleh kosong.");
  }

  let features = null;
  if (featuresStr) {
    try {
      features = JSON.parse(featuresStr);
    } catch (e) {
      throw new Error("Format JSON fitur tidak valid.");
    }
  }

  // Jika slug diubah, pastikan tidak bentrok dengan template lain
  if (originalSlug !== slug) {
    const existing = await prisma.template.findUnique({
      where: { slug }
    });
    if (existing) {
      throw new Error("Slug sudah digunakan oleh template lain.");
    }
  }

  await prisma.template.update({
    where: { slug: originalSlug },
    data: {
      name,
      slug,
      type,
      categoryId: categoryId || null,
      price: price || "Gratis",
      image: image || null,
      htmlContent: (type === 'html' || type === 'html-js') ? htmlContent : null,
      cssContent: (type === 'html' || type === 'html-js') ? cssContent : null,
      jsContent: type === 'html-js' ? jsContent : null,
      features: features,
    }
  });

  revalidatePath(`/admin/templates/${categorySlug}`);
  redirect(`/admin/templates/${categorySlug}`);
}

export async function deleteTemplate(id: string) {
  try {
    await prisma.template.delete({
      where: { id },
    });
    revalidatePath("/admin/templates");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to delete template:", error);
    return { success: false, error: error.message || "Failed to delete template" };
  }
}
