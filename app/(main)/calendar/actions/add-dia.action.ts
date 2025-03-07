'use server'

import { getUser } from "@/lib/auth";
import { addDiaService } from "../services/add-dia.service";
import { revalidatePath } from "next/cache";
import { InsertDia } from "@/db/schema";

export async function addDia(formData: FormData) {
    try {
        const { user } = await getUser();
        if (!user) {
            throw new Error('Unauthorized');
        }

        const date = formData.get('date') as string;
        const showName = formData.get('showName') as string;
        const ticketsSold = formData.get('ticketsSold') ? parseInt(formData.get('ticketsSold') as string) : null;
        const ticketsRevenue = formData.get('ticketsRevenue') ? parseFloat(formData.get('ticketsRevenue') as string) : null;
        const barRevenue = formData.get('barRevenue') ? parseFloat(formData.get('barRevenue') as string) : null;
        const showQuality = formData.get('showQuality') as string;
        const comicIds = JSON.parse(formData.get('comicIds') as string || '[]') as string[];

        if (!date) {
            throw new Error('Date is required');
        }

        // Create the dia object with the correct types
        const diaData: Omit<InsertDia, 'id'> = {
            date,
            showName: showName || null,
            ticketsSold,
            ticketsRevenue: ticketsRevenue as any, // Using any as a workaround for the type mismatch
            barRevenue: barRevenue as any, // Using any as a workaround for the type mismatch
            showQuality: showQuality || null,
        };

        const result = await addDiaService(diaData, comicIds);

        // Revalidate both the calendar page and the main page
        revalidatePath('/calendar');
        revalidatePath('/');
        
        return { success: true, data: result };
    } catch (error) {
        console.error('Error adding dia:', error);
        return { 
            success: false, 
            error: error instanceof Error ? error.message : 'Failed to add dia' 
        };
    }
} 