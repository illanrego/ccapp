"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { signIn } from "./actions";
import { useFormState } from "react-dom";

export default function Page() {
	const [state, formAction] = useFormState(signIn, { error: null });

	return (
		<div className="mx-auto grid w-[350px] gap-6">
            <div className="grid gap-2 text-center">
                <h1 className="text-3xl font-bold">Sign in to your account</h1>
                <p className="text-balance text-muted-foreground">
                    Enter your details below to sign in
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
					<div className="flex items-center">
						<Label htmlFor="password">Password</Label>
						<Link href="/forgot-password" className="ml-auto inline-block text-sm underline">
							Forgot your password?
						</Link>
					</div>
					<Input type="password" name="password" id="password" placeholder="Enter your password" required />
				</div>
				<Button type="submit" className="w-full">Sign in</Button>

			</form>
			<div className="mt-4 text-center text-sm">
				Don&apos;t have an account?{" "}
				<Link href="/auth/signup" className="underline">
					Sign up
				</Link>
			</div>
		</div>
	);
}
