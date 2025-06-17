'use server'

import { getUser } from "@/lib/auth";
import { addShowService } from "../../calendar/services/add-show.service";
import { updateShowService } from "../../calendar/services/update-show.service";
import { revalidatePath } from "next/cache";
import { InsertShow } from "@/db/schema";

interface ComicWithPosition {
    id: string;
    position: string | null;
}

interface ScheduledShowData {
    id: string;
    date: string;
    startTime?: string;
    showName?: string;
    comics: ComicWithPosition[];
    isNew: boolean;
}

export async function applySchedule(shows: ScheduledShowData[]) {
    try {
        const { user } = await getUser();
        if (!user) {
            throw new Error('Unauthorized');
        }

        const results = [];

        for (const show of shows) {
            if (show.isNew) {
                // Create new show
                const showData: Omit<InsertShow, 'id'> = {
                    date: show.date,
                    startTime: show.startTime || null,
                    showName: show.showName || null,
                    ticketsSold: null,
                    ticketsRevenue: null,
                    barRevenue: null,
                    showQuality: null,
                    isFiftyFifty: false,
                    freeTickets: 0,
                };

                const result = await addShowService(showData, show.comics);
                results.push({ success: true, data: result, showId: show.id });
            } else {
                // Update existing show
                const showData: Omit<InsertShow, 'id'> = {
                    date: show.date,
                    startTime: show.startTime || null,
                    showName: show.showName || null,
                    ticketsSold: null,
                    ticketsRevenue: null,
                    barRevenue: null,
                    showQuality: null,
                    isFiftyFifty: false,
                    freeTickets: 0,
                };

                const result = await updateShowService(parseInt(show.id), showData, show.comics);
                results.push({ success: true, data: result, showId: show.id });
            }
        }

        // Revalidate both the calendar page and the schedule page
        revalidatePath('/calendar');
        revalidatePath('/schedule');
        
        return { success: true, data: results };
    } catch (error) {
        console.error('Error applying schedule:', error);
        return { 
            success: false, 
            error: error instanceof Error ? error.message : 'Failed to apply schedule' 
        };
    }
} 