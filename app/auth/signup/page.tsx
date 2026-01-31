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
                <h1 className="text-3xl font-bold">Criar uma conta</h1>
                <p className="text-balance text-muted-foreground">
                    Digite seus dados abaixo para criar sua conta
                </p>
            </div>
            <form action={formAction} className="grid gap-4">
                {state.error && (
                    <div className="text-red-500 text-sm">{state.error}</div>
                )}
                <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input name="email" id="email" placeholder="Digite seu email" required />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="password">Senha</Label>
                    <Input type="password" name="password" id="password" placeholder="Digite sua senha" required />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                    <Input type="password" name="confirmPassword" id="confirmPassword" placeholder="Confirme sua senha" required />
                </div>
                <Button type="submit" className="w-full">Cadastrar</Button>
            </form>
            <div className="mt-4 text-center text-sm">
                Já tem uma conta?{" "}
                <Link href="/auth/signin" className="underline">
                    Entrar
                </Link>
            </div>
        </div>
    );
}

