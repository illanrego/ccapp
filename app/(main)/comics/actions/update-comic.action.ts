'use server'

import { getUser } from "@/lib/auth";
import { updateComicService } from "../services/update-comic.service";
import { revalidatePath } from "next/cache";
import { comicClassEnum } from "@/db/schema";

export async function updateComic(formData: FormData) {
    const { user } = await getUser();
    if (!user) {
        throw new Error('Unauthorized');
    }

    const id = formData.get('id') as string;
    const name = formData.get('name') as string;
    const picUrl = formData.get('picUrl') as string;
    const city = formData.get('city') as string;
    const socialMedia = formData.get('socialMedia') ? parseInt(formData.get('socialMedia') as string) : null;
    const comicClass = formData.get('class') as typeof comicClassEnum.enumValues[number];
    const time = formData.get('time') ? parseInt(formData.get('time') as string) : null;

    if (!id || !name) {
        throw new Error('ID and Name are required');
    }

    try {
        await updateComicService(id, {
            name,
            picUrl: picUrl || null,
            city: city || null,
            socialMedia,
            class: comicClass || null,
            time,
        });
        revalidatePath('/comics');
    } catch (error) {
        console.error('Error updating comic:', error);
        throw new Error('Failed to update comic');
    }
} 