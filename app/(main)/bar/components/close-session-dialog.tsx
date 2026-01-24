'use client'

import { Button } from "@/components/ui/button";
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { closeBarSession, BarSessionWithShow } from "../actions/bar-session.action";
import { useState } from "react";
import { AlertTriangle } from "lucide-react";

interface CloseSessionDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    session: BarSessionWithShow;
    openComandasCount: number;
    onSessionClosed: () => void;
    isPreviousSession?: boolean;
}

export function CloseSessionDialog({ 
    open, 
    onOpenChange, 
    session, 
    openComandasCount,
    onSessionClosed,
    isPreviousSession = false
}: CloseSessionDialogProps) {
    const [loading, setLoading] = useState(false);

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr + 'T00:00:00');
        return date.toLocaleDateString('pt-BR', {
            weekday: 'long',
            day: '2-digit',
            month: 'long',
        });
    };

    async function handleClose() {
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('sessionId', session.id.toString());
            await closeBarSession(formData);
            onOpenChange(false);
            onSessionClosed();
        } catch (error) {
            console.error('Error closing session:', error);
        } finally {
            setLoading(false);
        }
    }

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2">
                        {isPreviousSession && <AlertTriangle className="h-5 w-5 text-yellow-500" />}
                        {isPreviousSession ? 'Sessão Anterior Aberta' : 'Fechar Bar'}
                    </AlertDialogTitle>
                    <AlertDialogDescription asChild>
                        <div className="space-y-3">
                            <p>
                                {isPreviousSession 
                                    ? 'Existe uma sessão do bar que não foi fechada:'
                                    : 'Deseja realmente fechar a sessão do bar?'
                                }
                            </p>
                            <div className="p-3 rounded-lg bg-muted">
                                <p className="font-medium">
                                    {session.show.showName || 'Show'} - {formatDate(session.show.date)}
                                </p>
                                <p className="text-sm text-muted-foreground mt-1">
                                    Faturamento: R$ {parseFloat(session.totalRevenue || '0').toFixed(2).replace('.', ',')}
                                </p>
                            </div>
                            {openComandasCount > 0 && (
                                <p className="text-yellow-600 flex items-center gap-2">
                                    <AlertTriangle className="h-4 w-4" />
                                    Atenção: {openComandasCount} comanda(s) ainda aberta(s)!
                                </p>
                            )}
                        </div>
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <Button 
                        onClick={handleClose}
                        disabled={loading}
                        variant={openComandasCount > 0 ? "destructive" : "default"}
                    >
                        {loading ? 'Fechando...' : 'Fechar Bar'}
                    </Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

