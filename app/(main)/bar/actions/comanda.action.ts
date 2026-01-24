'use server'

import { getUser } from "@/lib/auth";
import {
    getComandasBySessionService,
    getComandaWithItemsService,
    openComandaService,
    addItemToComandaService,
    removeItemFromComandaService,
    updateItemQuantityService,
    applyDiscountService,
    closeComandaService,
    updateComandaClientNameService,
    ComandaWithItems,
} from "../services/comanda.service";
import { SelectComanda } from "@/db/schema";
import { revalidatePath } from "next/cache";

export type { ComandaWithItems };

export async function getComandas(sessionId: number): Promise<SelectComanda[]> {
    const { user } = await getUser();
    if (!user) throw new Error('Unauthorized');

    try {
        return await getComandasBySessionService(sessionId);
    } catch (error) {
        console.error('Error getting comandas:', error);
        throw new Error('Falha ao buscar comandas');
    }
}

export async function getComandaWithItems(comandaId: number): Promise<ComandaWithItems | null> {
    const { user } = await getUser();
    if (!user) throw new Error('Unauthorized');

    try {
        return await getComandaWithItemsService(comandaId);
    } catch (error) {
        console.error('Error getting comanda:', error);
        throw new Error('Falha ao buscar comanda');
    }
}

export async function openComanda(formData: FormData) {
    const { user } = await getUser();
    if (!user) throw new Error('Unauthorized');

    const comandaId = parseInt(formData.get('comandaId') as string);
    const clientName = formData.get('clientName') as string;

    if (!comandaId) throw new Error('Comanda ID é obrigatório');

    try {
        await openComandaService(comandaId, clientName || undefined);
        revalidatePath('/bar');
    } catch (error) {
        console.error('Error opening comanda:', error);
        throw new Error('Falha ao abrir comanda');
    }
}

export async function addItemToComanda(formData: FormData) {
    const { user } = await getUser();
    if (!user) throw new Error('Unauthorized');

    const comandaId = parseInt(formData.get('comandaId') as string);
    const stockItemId = parseInt(formData.get('stockItemId') as string);
    const quantity = parseInt(formData.get('quantity') as string) || 1;

    if (!comandaId || !stockItemId) {
        throw new Error('Comanda ID e Item ID são obrigatórios');
    }

    try {
        await addItemToComandaService(comandaId, stockItemId, quantity);
        revalidatePath('/bar');
    } catch (error) {
        console.error('Error adding item to comanda:', error);
        throw new Error('Falha ao adicionar item');
    }
}

export async function removeItemFromComanda(formData: FormData) {
    const { user } = await getUser();
    if (!user) throw new Error('Unauthorized');

    const itemId = parseInt(formData.get('itemId') as string);
    if (!itemId) throw new Error('Item ID é obrigatório');

    try {
        await removeItemFromComandaService(itemId);
        revalidatePath('/bar');
    } catch (error) {
        console.error('Error removing item from comanda:', error);
        throw new Error('Falha ao remover item');
    }
}

export async function updateItemQuantity(formData: FormData) {
    const { user } = await getUser();
    if (!user) throw new Error('Unauthorized');

    const itemId = parseInt(formData.get('itemId') as string);
    const quantity = parseInt(formData.get('quantity') as string);

    if (!itemId) throw new Error('Item ID é obrigatório');

    try {
        await updateItemQuantityService(itemId, quantity);
        revalidatePath('/bar');
    } catch (error) {
        console.error('Error updating item quantity:', error);
        throw new Error('Falha ao atualizar quantidade');
    }
}

export async function applyDiscount(formData: FormData) {
    const { user } = await getUser();
    if (!user) throw new Error('Unauthorized');

    const comandaId = parseInt(formData.get('comandaId') as string);
    const discount = parseFloat(formData.get('discount') as string) || 0;

    if (!comandaId) throw new Error('Comanda ID é obrigatório');

    try {
        await applyDiscountService(comandaId, discount);
        revalidatePath('/bar');
    } catch (error) {
        console.error('Error applying discount:', error);
        throw new Error('Falha ao aplicar desconto');
    }
}

export async function closeComanda(formData: FormData) {
    const { user } = await getUser();
    if (!user) throw new Error('Unauthorized');

    const comandaId = parseInt(formData.get('comandaId') as string);
    const paymentMethod = formData.get('paymentMethod') as 'dinheiro' | 'cartao' | 'pix';

    if (!comandaId || !paymentMethod) {
        throw new Error('Comanda ID e método de pagamento são obrigatórios');
    }

    try {
        await closeComandaService(comandaId, paymentMethod);
        revalidatePath('/bar');
    } catch (error) {
        console.error('Error closing comanda:', error);
        throw new Error('Falha ao fechar comanda');
    }
}

export async function updateComandaClientName(formData: FormData) {
    const { user } = await getUser();
    if (!user) throw new Error('Unauthorized');

    const comandaId = parseInt(formData.get('comandaId') as string);
    const clientName = formData.get('clientName') as string;

    if (!comandaId) throw new Error('Comanda ID é obrigatório');

    try {
        await updateComandaClientNameService(comandaId, clientName || null);
        revalidatePath('/bar');
    } catch (error) {
        console.error('Error updating client name:', error);
        throw new Error('Falha ao atualizar nome');
    }
}

