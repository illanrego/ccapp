'use server'

import { getUser } from "@/lib/auth";
import { db } from "@/db";
import { showsTable, barSessionsTable } from "@/db/schema";
import { desc, eq, isNull, or } from "drizzle-orm";

export interface ShowForBar {
    id: number;
    date: string;
    startTime: string | null;
    showName: string | null;
    hasOpenSession: boolean;
}

export async function listShowsForBar(): Promise<ShowForBar[]> {
    const { user } = await getUser();
    if (!user) throw new Error('Unauthorized');

    try {
        // Get recent shows (last 30 days) that either have no session or have an open session
        const shows = await db
            .select({
                id: showsTable.id,
                date: showsTable.date,
                startTime: showsTable.startTime,
                showName: showsTable.showName,
                sessionStatus: barSessionsTable.status,
            })
            .from(showsTable)
            .leftJoin(barSessionsTable, eq(showsTable.id, barSessionsTable.showId))
            .where(
                or(
                    isNull(barSessionsTable.id), // No session
                    eq(barSessionsTable.status, 'aberto') // Open session
                )
            )
            .orderBy(desc(showsTable.date), desc(showsTable.startTime))
            .limit(20);

        return shows.map(show => ({
            id: show.id,
            date: show.date,
            startTime: show.startTime,
            showName: show.showName,
            hasOpenSession: show.sessionStatus === 'aberto',
        }));
    } catch (error) {
        console.error('Error listing shows for bar:', error);
        throw new Error('Falha ao buscar shows');
    }
}

