'use client'

import { SelectComanda } from "@/db/schema";
import { cn } from "@/lib/utils";
import { User, Check, Clock } from "lucide-react";

interface ComandaGridProps {
    comandas: SelectComanda[];
    onComandaClick: (comanda: SelectComanda) => void;
}

export function ComandaGrid({ comandas, onComandaClick }: ComandaGridProps) {
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'disponivel':
                return 'bg-muted hover:bg-muted/80 border-muted-foreground/20';
            case 'aberta':
                return 'bg-amber-500/20 hover:bg-amber-500/30 border-amber-500 text-amber-700 dark:text-amber-300';
            case 'paga':
                return 'bg-green-500/20 border-green-500 text-green-700 dark:text-green-300 cursor-default';
            default:
                return 'bg-muted';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'aberta':
                return <Clock className="h-3 w-3" />;
            case 'paga':
                return <Check className="h-3 w-3" />;
            default:
                return null;
        }
    };

    return (
        <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2">
            {comandas.map((comanda) => (
                <button
                    key={comanda.id}
                    onClick={() => comanda.status !== 'paga' && onComandaClick(comanda)}
                    disabled={comanda.status === 'paga'}
                    className={cn(
                        "aspect-square rounded-lg border-2 flex flex-col items-center justify-center gap-1 transition-all",
                        "text-sm font-medium",
                        getStatusColor(comanda.status),
                        comanda.status !== 'paga' && "cursor-pointer active:scale-95"
                    )}
                >
                    <div className="flex items-center gap-1">
                        {getStatusIcon(comanda.status)}
                        <span className="text-lg font-bold">{comanda.number}</span>
                    </div>
                    {comanda.clientName && (
                        <div className="flex items-center gap-0.5 text-[10px] truncate max-w-full px-1">
                            <User className="h-2.5 w-2.5" />
                            <span className="truncate">{comanda.clientName}</span>
                        </div>
                    )}
                    {comanda.status !== 'disponivel' && parseFloat(comanda.total || '0') > 0 && (
                        <span className="text-[10px]">
                            R$ {parseFloat(comanda.total || '0').toFixed(0)}
                        </span>
                    )}
                </button>
            ))}
        </div>
    );
}

