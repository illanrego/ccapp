"use server";
import { lucia, getUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export async function signOut(): Promise<ActionResult> {

    const { session } = await getUser();
    if (!session) {
        return {
            error: "Unauthorized"
        };
    }

    await lucia.invalidateSession(session.id);

    const sessionCookie = lucia.createBlankSessionCookie();
    cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
    return redirect("/auth/signin");
}

interface ActionResult {
    error: string;
}