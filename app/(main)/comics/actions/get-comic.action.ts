'use server'

import { getUser } from "@/lib/auth";
import { getComicWithShowsService } from "../services/get-comic.service";

export async function getComicWithShows(id: string) {
    const { user } = await getUser();
    if (!user) {
        throw new Error('Unauthorized');
    }

    try {
        return await getComicWithShowsService(id);
    } catch (error) {
        console.error('Error fetching comic:', error);
        throw new Error('Failed to fetch comic');
    }
} 