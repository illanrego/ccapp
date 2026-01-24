'use server'

import { getUser } from "@/lib/auth";
import { deleteStockService } from "../services/delete-stock.service";
import { revalidatePath } from "next/cache";

export async function deleteStock(formData: FormData) {
    const { user } = await getUser();
    if (!user) {
        throw new Error('Unauthorized');
    }

    const id = parseInt(formData.get('id') as string);
    if (!id) {
        throw new Error('Stock item ID is required');
    }

    try {
        await deleteStockService(id);
        revalidatePath('/estoque');
    } catch (error) {
        console.error('Error deleting stock item:', error);
        throw new Error('Failed to delete stock item');
    }
}

