'use server'

import { getUser } from "@/lib/auth";
import { listComicsService } from "../services/list-comics.service";
import { SelectComic } from "@/db/schema";

export interface ComicWithAvgTickets extends SelectComic {
    avgTicketsSold: number;
    avgBarRevenue: number;
}

export async function listComics(): Promise<ComicWithAvgTickets[]> {
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