'use server'

import { getUser } from "@/lib/auth";
import {
    getShowsFinancialSummaryService,
    getOverallSummaryService,
    getPaymentMethodSummaryService,
    getTopSellingItemsService,
    getStockPurchaseCostsService,
    ShowFinancialSummary,
    OverallSummary,
    PaymentMethodSummary,
    TopSellingItem,
} from "../services/financial.service";

export type { ShowFinancialSummary, OverallSummary, PaymentMethodSummary, TopSellingItem };

export async function getShowsFinancialSummary(
    startDate?: string,
    endDate?: string
): Promise<ShowFinancialSummary[]> {
    const { user } = await getUser();
    if (!user) throw new Error('Unauthorized');

    try {
        return await getShowsFinancialSummaryService(startDate, endDate);
    } catch (error) {
        console.error('Error getting shows financial summary:', error);
        throw new Error('Falha ao buscar resumo financeiro');
    }
}

export async function getOverallSummary(
    startDate?: string,
    endDate?: string
): Promise<OverallSummary> {
    const { user } = await getUser();
    if (!user) throw new Error('Unauthorized');

    try {
        return await getOverallSummaryService(startDate, endDate);
    } catch (error) {
        console.error('Error getting overall summary:', error);
        throw new Error('Falha ao buscar resumo geral');
    }
}

export async function getPaymentMethodSummary(
    startDate?: string,
    endDate?: string
): Promise<PaymentMethodSummary> {
    const { user } = await getUser();
    if (!user) throw new Error('Unauthorized');

    try {
        return await getPaymentMethodSummaryService(startDate, endDate);
    } catch (error) {
        console.error('Error getting payment method summary:', error);
        throw new Error('Falha ao buscar resumo de pagamentos');
    }
}

export async function getTopSellingItems(
    limit: number = 10,
    startDate?: string,
    endDate?: string
): Promise<TopSellingItem[]> {
    const { user } = await getUser();
    if (!user) throw new Error('Unauthorized');

    try {
        return await getTopSellingItemsService(limit, startDate, endDate);
    } catch (error) {
        console.error('Error getting top selling items:', error);
        throw new Error('Falha ao buscar itens mais vendidos');
    }
}

export async function getStockPurchaseCosts(
    startDate?: string,
    endDate?: string
): Promise<number> {
    const { user } = await getUser();
    if (!user) throw new Error('Unauthorized');

    try {
        return await getStockPurchaseCostsService(startDate, endDate);
    } catch (error) {
        console.error('Error getting stock purchase costs:', error);
        throw new Error('Falha ao buscar custos de compras');
    }
}

