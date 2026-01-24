'use server'

import { getUser } from "@/lib/auth";
import { getDashboardStatsService, DashboardStats } from "../services/dashboard.service";

export type { DashboardStats };

export async function getDashboardStats(): Promise<DashboardStats> {
    const { user } = await getUser();
    if (!user) throw new Error('Unauthorized');

    try {
        return await getDashboardStatsService();
    } catch (error) {
        console.error('Error getting dashboard stats:', error);
        throw new Error('Falha ao carregar dashboard');
    }
}

