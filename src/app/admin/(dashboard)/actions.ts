"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function deleteInvitation(id: string) {
  try {
    await prisma.invitation.delete({
      where: { id },
    });
    revalidatePath("/admin");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to delete invitation:", error);
    return { success: false, error: error.message || "Failed to delete invitation" };
  }
}
