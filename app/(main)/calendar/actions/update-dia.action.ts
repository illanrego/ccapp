'use server'

import { getUser } from "@/lib/auth";
import { updateShowService } from "../services/update-show.service";
import { revalidatePath } from "next/cache";
import { InsertShow } from "@/db/schema";

interface ComicWithPosition {
    id: string;
    position: string | null;
}

export async function updateShow(id: number, formData: FormData) {
    try {
        const { user } = await getUser();
        if (!user) {
            throw new Error('Unauthorized');
        }

        const date = formData.get('date') as string;
        const startTime = formData.get('startTime') as string;
        const showName = formData.get('showName') as string;
        const ticketsSold = formData.get('ticketsSold') ? parseInt(formData.get('ticketsSold') as string) : null;
        const ticketsRevenue = formData.get('ticketsRevenue') ? parseFloat(formData.get('ticketsRevenue') as string) : null;
        const barRevenue = formData.get('barRevenue') ? parseFloat(formData.get('barRevenue') as string) : null;
        const showQuality = formData.get('showQuality') as string;
        const comicsWithPositions = JSON.parse(formData.get('comicIds') as string || '[]') as ComicWithPosition[];
        const isFiftyFifty = formData.get('isFiftyFifty') === 'true';

        if (!date) {
            throw new Error('Date is required');
        }

        // Create the show object with the correct types
        const showData: Omit<InsertShow, 'id'> = {
            date,
            startTime: startTime || null,
            showName: showName || null,
            ticketsSold,
            ticketsRevenue: ticketsRevenue as any, // Using any as a workaround for the type mismatch
            barRevenue: barRevenue as any, // Using any as a workaround for the type mismatch
            showQuality: showQuality || null,
            isFiftyFifty,
        };

        const result = await updateShowService(id, showData, comicsWithPositions);

        // Revalidate both the calendar page and the main page
        revalidatePath('/calendar');
        revalidatePath('/');
        
        return { success: true, data: result };
    } catch (error) {
        console.error('Error updating show:', error);
        return { 
            success: false, 
            error: error instanceof Error ? error.message : 'Failed to update show' 
        };
    }
}

// Keep the old function for backward compatibility
export async function updateDia(id: number, formData: FormData) {
    return updateShow(id, formData);
} 