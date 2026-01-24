'use server'

import { getUser } from "@/lib/auth";
import { listTransactionsService, TransactionWithItem } from "../services/list-transactions.service";

export type { TransactionWithItem };

export async function listTransactions(itemId?: number): Promise<TransactionWithItem[]> {
    const { user } = await getUser();
    if (!user) {
        throw new Error('Unauthorized');
    }

    try {
        return await listTransactionsService(itemId);
    } catch (error) {
        console.error('Error fetching transactions:', error);
        throw new Error('Failed to fetch transactions');
    }
}

