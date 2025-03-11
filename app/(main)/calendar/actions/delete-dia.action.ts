'use server'

import { getUser } from "@/lib/auth";
import { db } from "@/db";
import { showsTable, comicsShowsTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function deleteShow(id: number) {
    try {
        const { user } = await getUser();
        if (!user) {
            throw new Error('Unauthorized');
        }

        // Delete all comic relationships first
        await db.delete(comicsShowsTable)
            .where(eq(comicsShowsTable.showId, id));

        // Then delete the show
        await db.delete(showsTable)
            .where(eq(showsTable.id, id));

        // Revalidate both the calendar page and the main page
        revalidatePath('/calendar');
        revalidatePath('/');
        
        return { success: true };
    } catch (error) {
        console.error('Error deleting show:', error);
        return { 
            success: false, 
            error: error instanceof Error ? error.message : 'Failed to delete show' 
        };
    }
}

// Keep the old function for backward compatibility
export async function deleteDia(id: number) {
    return deleteShow(id);
} 