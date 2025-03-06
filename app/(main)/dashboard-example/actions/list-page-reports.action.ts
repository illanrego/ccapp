'use server'

import { getUser } from "@/lib/auth";
import { listPageReportsService } from "../services/list-page-reports.service";

export async function listPageReports(pageId: string) {
    const { user } = await getUser();
    if (!user) {
        throw new Error('Unauthorized');
    }

    try {
        return await listPageReportsService(pageId);
    } catch (error) {
        console.error('Error fetching page reports:', error);
        throw new Error('Failed to fetch page reports');
    }
} 