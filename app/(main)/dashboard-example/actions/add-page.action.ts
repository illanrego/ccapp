// add-page.action.ts
'use server'

import { getUser } from "@/lib/auth";
import { z } from "zod";
import { addPageService } from "../services/add-page.service";

const addPageSchema = z.object({
  url: z.string().url("Please enter a valid URL"),
  keyword: z.string().min(1, "Keyword is required"),
});

export type AddPageInput = z.infer<typeof addPageSchema>;

export async function addPage(input: AddPageInput) {
  const { user } = await getUser();
  if (!user) {
    throw new Error('Unauthorized');
  }

  try {
    // Validate input
    const validatedInput = addPageSchema.parse(input);

    // Call the service to add the page
    const newPage = await addPageService(user.id, validatedInput);

    return newPage;
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(error.errors[0].message);
    }
    console.error('Error adding page:', error);
    throw new Error('Failed to add page');
  }
}