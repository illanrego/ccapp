"use server";

import { db } from "@/db/index";
import { hash } from "@node-rs/argon2";
import { cookies } from "next/headers";
import { lucia } from "@/lib/auth";
import { redirect } from "next/navigation";
import { generateIdFromEntropySize } from "lucia";
import { usersTable } from "@/db/schema";


export async function signup(prevState: ActionResult, formData: FormData): Promise<ActionResult> {

    const email = formData.get("email");
    if (
        typeof email !== "string" ||
        !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)
    ) {
        return {
            error: "Invalid email format"
        };
    }
    const password = formData.get("password");
    if (typeof password !== "string" || password.length < 6 || password.length > 255) {
        return {
            error: "Invalid password"
        };
    }
    const confirmPassword = formData.get("confirmPassword");
    if (password !== confirmPassword) {
        return {
            error: "Passwords do not match"
        };
    }

    const passwordHash = await hash(password, {
        memoryCost: 19456,
        timeCost: 2,
        outputLen: 32,
        parallelism: 1
    });
    const userId = generateIdFromEntropySize(10);

    try {
        await db.insert(usersTable).values({
            id: userId,
            email: email,
            passwordHash: passwordHash
        });
    } catch {
        return {
            error: "Email already taken"
        };
    }

    const session = await lucia.createSession(userId, {});
    const sessionCookie = lucia.createSessionCookie(session.id);
    cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
    return redirect("/");
}

interface ActionResult {
    error: string | null;
}
