'use server'

import { getUser } from "@/lib/auth";
import { listStockService, StockItemWithStats } from "../services/list-stock.service";

export type { StockItemWithStats };

export async function listStock(): Promise<StockItemWithStats[]> {
    const { user } = await getUser();
    if (!user) {
        throw new Error('Unauthorized');
    }

    try {
        return await listStockService();
    } catch (error) {
        console.error('Error fetching stock items:', error);
        throw new Error('Failed to fetch stock items');
    }
}

