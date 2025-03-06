'use server'

import { getUser } from "@/lib/auth";
import { listComicsService } from "../services/list-comics.service";

export async function listComics() {
    const { user } = await getUser();
    if (!user) {
        throw new Error('Unauthorized');
    }

    try {
        return await listComicsService();
    } catch (error) {
        console.error('Error fetching comics:', error);
        throw new Error('Failed to fetch comics');
    }
} 