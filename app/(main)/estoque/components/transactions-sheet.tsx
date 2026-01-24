'use client'

import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SelectStockItem } from "@/db/schema";
import { listTransactions, TransactionWithItem } from "../actions/list-transactions.action";
import { useEffect, useState } from "react";
import { ArrowUpCircle, ArrowDownCircle, RefreshCw, AlertCircle, ArrowRightLeft } from "lucide-react";

interface TransactionsSheetProps {
    item: SelectStockItem | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const typeConfig: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
    compra: { label: 'Compra', icon: <ArrowUpCircle className="h-4 w-4" />, color: 'text-green-500' },
    venda: { label: 'Venda', icon: <ArrowDownCircle className="h-4 w-4" />, color: 'text-blue-500' },
    ajuste: { label: 'Ajuste', icon: <RefreshCw className="h-4 w-4" />, color: 'text-yellow-500' },
    perda: { label: 'Perda', icon: <AlertCircle className="h-4 w-4" />, color: 'text-red-500' },
    transferencia: { label: 'Transferência', icon: <ArrowRightLeft className="h-4 w-4" />, color: 'text-purple-500' },
};

export function TransactionsSheet({ item, open, onOpenChange }: TransactionsSheetProps) {
    const [transactions, setTransactions] = useState<TransactionWithItem[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (item && open) {
            setLoading(true);
            listTransactions(item.id)
                .then(setTransactions)
                .catch(console.error)
                .finally(() => setLoading(false));
        }
    }, [item, open]);

    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        }).format(new Date(date));
    };

    const formatCurrency = (value: string | null) => {
        if (!value) return '-';
        return `R$ ${parseFloat(value).toFixed(2).replace('.', ',')}`;
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-[400px] sm:w-[540px]">
                <SheetHeader>
                    <SheetTitle>
                        Histórico de Movimentações
                        {item && (
                            <span className="block text-sm font-normal text-muted-foreground mt-1">
                                {item.name}
                            </span>
                        )}
                    </SheetTitle>
                </SheetHeader>
                
                <ScrollArea className="h-[calc(100vh-120px)] mt-6 pr-4">
                    {loading ? (
                        <div className="flex items-center justify-center h-32">
                            <p className="text-muted-foreground">Carregando...</p>
                        </div>
                    ) : transactions.length === 0 ? (
                        <div className="flex items-center justify-center h-32">
                            <p className="text-muted-foreground">
                                Nenhuma movimentação registrada
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {transactions.map((tx) => {
                                const config = typeConfig[tx.type] || typeConfig.ajuste;
                                const quantity = parseFloat(tx.quantity);
                                const isPositive = tx.type === 'compra' || (tx.type === 'ajuste' && quantity > 0);
                                
                                return (
                                    <div 
                                        key={tx.id} 
                                        className="flex items-start gap-3 p-3 rounded-lg border bg-card"
                                    >
                                        <div className={`mt-0.5 ${config.color}`}>
                                            {config.icon}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between gap-2">
                                                <Badge variant="outline" className={config.color}>
                                                    {config.label}
                                                </Badge>
                                                <span className={`text-sm font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                                                    {isPositive ? '+' : ''}{quantity.toFixed(2)}
                                                </span>
                                            </div>
                                            
                                            {tx.totalCost && (
                                                <p className="text-sm text-muted-foreground mt-1">
                                                    Total: {formatCurrency(tx.totalCost)}
                                                    {tx.unitCost && (
                                                        <span className="ml-2">
                                                            ({formatCurrency(tx.unitCost)}/un)
                                                        </span>
                                                    )}
                                                </p>
                                            )}
                                            
                                            {tx.notes && (
                                                <p className="text-sm text-muted-foreground mt-1 truncate">
                                                    {tx.notes}
                                                </p>
                                            )}
                                            
                                            <p className="text-xs text-muted-foreground mt-2">
                                                {formatDate(tx.createdAt)}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </ScrollArea>
            </SheetContent>
        </Sheet>
    );
}

