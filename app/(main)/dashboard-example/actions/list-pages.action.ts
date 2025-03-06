'use server'

import { getUser } from "@/lib/auth";
import { listPagesService, SortField, SortOrder } from "../services/list-pages.service"

export async function listPages(sortField: SortField = 'createdAt', sortOrder: SortOrder = 'desc') {
    const { user } = await getUser();
    if (!user) {
        throw new Error('Unauthorized');
    }

    try {
        return await listPagesService(user.id, sortField, sortOrder);
    } catch (error) {
        console.error('Error fetching pages:', error);
        throw new Error('Failed to fetch pages');
    }
}