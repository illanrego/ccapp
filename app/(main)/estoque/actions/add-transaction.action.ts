'use server'

import { getUser } from "@/lib/auth";
import { addTransactionService } from "../services/add-transaction.service";
import { revalidatePath } from "next/cache";
import { transactionTypeEnum } from "@/db/schema";

export async function addTransaction(formData: FormData) {
    const { user } = await getUser();
    if (!user) {
        throw new Error('Unauthorized');
    }

    const itemId = parseInt(formData.get('itemId') as string);
    const type = formData.get('type') as typeof transactionTypeEnum.enumValues[number];
    const quantity = formData.get('quantity') as string;
    const unitCost = formData.get('unitCost') as string;
    const notes = formData.get('notes') as string;

    if (!itemId || !type || !quantity) {
        throw new Error('Item ID, type, and quantity are required');
    }

    const quantityNum = parseFloat(quantity);
    const unitCostNum = unitCost ? parseFloat(unitCost) : null;

    // Calculate total cost
    const totalCost = unitCostNum ? (quantityNum * unitCostNum).toFixed(2) : null;

    try {
        await addTransactionService({
            itemId,
            type,
            quantity,
            unitCost: unitCost || null,
            totalCost,
            notes: notes || null,
        });
        revalidatePath('/estoque');
    } catch (error) {
        console.error('Error adding transaction:', error);
        throw new Error('Failed to add transaction');
    }
}

