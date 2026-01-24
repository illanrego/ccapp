'use client'

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { openBarSession } from "../actions/bar-session.action";
import { ShowForBar } from "../actions/list-shows.action";
import { useState } from "react";
import { Calendar, Clock } from "lucide-react";

interface OpenSessionDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    shows: ShowForBar[];
    onSessionOpened: () => void;
}

export function OpenSessionDialog({ open, onOpenChange, shows, onSessionOpened }: OpenSessionDialogProps) {
    const [selectedShowId, setSelectedShowId] = useState<string>('');
    const [loading, setLoading] = useState(false);

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr + 'T00:00:00');
        return date.toLocaleDateString('pt-BR', {
            weekday: 'short',
            day: '2-digit',
            month: '2-digit',
        });
    };

    async function handleSubmit() {
        if (!selectedShowId) return;

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('showId', selectedShowId);
            await openBarSession(formData);
            onOpenChange(false);
            onSessionOpened();
        } catch (error) {
            console.error('Error opening session:', error);
        } finally {
            setLoading(false);
        }
    }

    const availableShows = shows.filter(s => !s.hasOpenSession);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Abrir Bar</DialogTitle>
                    <DialogDescription>
                        Selecione o show para iniciar a sessão do bar.
                        Serão criadas 50 comandas automaticamente.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="show">Show</Label>
                        <Select value={selectedShowId} onValueChange={setSelectedShowId}>
                            <SelectTrigger>
                                <SelectValue placeholder="Selecione um show" />
                            </SelectTrigger>
                            <SelectContent>
                                {availableShows.length === 0 ? (
                                    <SelectItem value="none" disabled>
                                        Nenhum show disponível
                                    </SelectItem>
                                ) : (
                                    availableShows.map((show) => (
                                        <SelectItem key={show.id} value={show.id.toString()}>
                                            <div className="flex items-center gap-2">
                                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                                <span>{formatDate(show.date)}</span>
                                                {show.startTime && (
                                                    <>
                                                        <Clock className="h-4 w-4 text-muted-foreground ml-2" />
                                                        <span>{show.startTime.slice(0, 5)}</span>
                                                    </>
                                                )}
                                                {show.showName && (
                                                    <span className="text-muted-foreground">
                                                        - {show.showName}
                                                    </span>
                                                )}
                                            </div>
                                        </SelectItem>
                                    ))
                                )}
                            </SelectContent>
                        </Select>
                    </div>

                    <Button 
                        onClick={handleSubmit} 
                        disabled={!selectedShowId || loading}
                        className="w-full"
                    >
                        {loading ? 'Abrindo...' : 'Abrir Bar'}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

