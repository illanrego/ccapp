"use server";
import { verify } from "@node-rs/argon2";
import { cookies } from "next/headers";
import { lucia } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/db/index";
import { usersTable } from "@/db/schema";
import { eq } from "drizzle-orm";


export async function signIn(prevState: ActionResult,formData: FormData): Promise<ActionResult> {

    const email = formData.get("email");
    if (
        typeof email !== "string" ||
        !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)
    ) {
        return {
            error: "Invalid email"
        };
    }

    const existingUsers = await db.select().from(usersTable).where(eq(usersTable.email, email.toLowerCase()));
    if (existingUsers.length === 0) {
        return {
            error: "Incorrect email or password"
        };
    }
    const existingUser = existingUsers[0];

    const password = formData.get("password");
    if (typeof password !== "string" || password.length < 6 || password.length > 255) {
        return {
            error: "Invalid password"
        };
    }

    const validPassword = await verify(existingUser.passwordHash, password, {
        memoryCost: 19456,
        timeCost: 2,
        outputLen: 32,
        parallelism: 1
    });
    if (!validPassword) {
        return {
            error: "Incorrect email or password"
        };
    }

    const session = await lucia.createSession(existingUser.id, {});
    const sessionCookie = lucia.createSessionCookie(session.id);
    cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
    return redirect("/");
}

interface ActionResult {
    error: string | null;
}
