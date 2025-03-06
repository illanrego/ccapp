'use server'

import { getUser } from "@/lib/auth";
import { deletePageService } from "../services/delete-page.service";
import { revalidatePath } from "next/cache";

export async function deletePage(pageId: string) {
  const { user } = await getUser();
  
  if (!user) {
    throw new Error('Unauthorized');
  }

  try {
    await deletePageService(pageId);
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error) {
    console.error('Error deleting page:', error);
    throw new Error('Failed to delete page');
  }
} 