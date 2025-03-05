'use client';

import { signup } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useFormState } from "react-dom";

export default function Page() {
    const [state, formAction] = useFormState(signup, { error: null });

    return (
        <div className="mx-auto grid w-[350px] gap-6">
            <div className="grid gap-2 text-center">
                <h1 className="text-3xl font-bold">Create an account</h1>
                <p className="text-balance text-muted-foreground">
                    Enter your details below to create your account
                </p>
            </div>
            <form action={formAction} className="grid gap-4">
                {state.error && (
                    <div className="text-red-500 text-sm">{state.error}</div>
                )}
                <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input name="email" id="email" placeholder="Enter your email" required />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="password">Password</Label>
                    <Input type="password" name="password" id="password" placeholder="Enter your password" required />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input type="password" name="confirmPassword" id="confirmPassword" placeholder="Confirm your password" required />
                </div>
                <Button type="submit" className="w-full">Sign Up</Button>
            </form>
            <div className="mt-4 text-center text-sm">
                Already have an account?{" "}
                <Link href="/auth/signin" className="underline">
                    Sign in
                </Link>
            </div>
        </div>
    );
}

