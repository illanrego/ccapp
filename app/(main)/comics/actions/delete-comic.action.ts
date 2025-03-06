'use server'

import { getUser } from "@/lib/auth";
import { deleteComicService } from "../services/delete-comic.service";
import { revalidatePath } from "next/cache";

export async function deleteComic(formData: FormData) {
    const { user } = await getUser();
    if (!user) {
        throw new Error('Unauthorized');
    }

    const id = formData.get('id') as string;
    if (!id) {
        throw new Error('Comic ID is required');
    }

    try {
        await deleteComicService(id);
        revalidatePath('/comics');
    } catch (error) {
        console.error('Error deleting comic:', error);
        throw new Error('Failed to delete comic');
    }
} 