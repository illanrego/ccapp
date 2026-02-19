'use server'

import { getUser } from "@/lib/auth";
import { 
    getActiveBarSessionService, 
    getUnclosedPreviousSessionService,
    openBarSessionService, 
    closeBarSessionService,
    BarSessionWithShow 
} from "../services/bar-session.service";
import { revalidatePath } from "next/cache";

export type { BarSessionWithShow };

export async function getActiveBarSession(): Promise<BarSessionWithShow | null> {
    const { user } = await getUser();
    if (!user) throw new Error('Unauthorized');

    try {
        return await getActiveBarSessionService();
    } catch (error) {
        console.error('Error getting active bar session:', error);
        throw new Error('Falha ao buscar sessão do bar');
    }
}

export async function getUnclosedPreviousSession(currentShowId?: number): Promise<BarSessionWithShow | null> {
    const { user } = await getUser();
    if (!user) throw new Error('Unauthorized');

    try {
        return await getUnclosedPreviousSessionService(currentShowId);
    } catch (error) {
        console.error('Error getting unclosed session:', error);
        throw new Error('Falha ao buscar sessão anterior');
    }
}

export async function openBarSession(formData: FormData) {
    const { user } = await getUser();
    if (!user) throw new Error('Unauthorized');

    const showId = parseInt(formData.get('showId') as string);
    if (!showId) throw new Error('Show ID é obrigatório');

    try {
        await openBarSessionService(showId);
        revalidatePath('/bar');
    } catch (error) {
        console.error('Error opening bar session:', error);
        throw new Error('Falha ao abrir sessão do bar');
    }
}

export async function closeBarSession(formData: FormData) {
    const { user } = await getUser();
    if (!user) throw new Error('Unauthorized');

    const sessionId = parseInt(formData.get('sessionId') as string);
    if (!sessionId) throw new Error('Session ID é obrigatório');

    try {
        await closeBarSessionService(sessionId);
        revalidatePath('/bar');
        revalidatePath('/calendario');
        revalidatePath('/financeiro');
        revalidatePath('/');
    } catch (error) {
        console.error('Error closing bar session:', error);
        throw new Error('Falha ao fechar sessão do bar');
    }
}

