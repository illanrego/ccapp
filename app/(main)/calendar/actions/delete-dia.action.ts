'use server'

import { getUser } from "@/lib/auth";
import { deleteDiaService } from "../services/delete-dia.service";
import { revalidatePath } from "next/cache";

export async function deleteDia(id: number) {
    try {
        const { user } = await getUser();
        if (!user) {
            throw new Error('Unauthorized');
        }

        await deleteDiaService(id);

        // Revalidate both the calendar page and the main page
        revalidatePath('/calendar');
        revalidatePath('/');
        
        return { success: true };
    } catch (error) {
        console.error('Error deleting dia:', error);
        return { 
            success: false, 
            error: error instanceof Error ? error.message : 'Failed to delete dia' 
        };
    }
} 