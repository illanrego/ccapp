'use client'

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Pencil, Trash2, Plus, AlertTriangle, TrendingUp, History } from "lucide-react";
import { StockItemWithStats } from "../actions/list-stock.action";
import { AddStockDialog } from "./add-stock-dialog";
import { AddTransactionDialog } from "./add-transaction-dialog";
import { deleteStock } from "../actions/delete-stock.action";
import { useState } from "react";
import { TransactionsSheet } from "./transactions-sheet";

interface StockTableProps {
    items: StockItemWithStats[];
    onUpdate: () => void;
}

const categoryLabels: Record<string, string> = {
    cerveja: 'Cerveja',
    vinho: 'Vinho',
    destilado: 'Destilado',
    refrigerante: 'Refrigerante',
    agua: 'Água',
    suco: 'Suco',
    energetico: 'Energético',
    petisco: 'Petisco',
    ingrediente: 'Ingrediente',
    descartavel: 'Descartável',
    outro: 'Outro',
};

const unitLabels: Record<string, string> = {
    unidade: 'un',
    ml: 'mL',
    litro: 'L',
    kg: 'kg',
    g: 'g',
    pacote: 'pct',
    caixa: 'cx',
};

export function StockTable({ items, onUpdate }: StockTableProps) {
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [transactionsItem, setTransactionsItem] = useState<StockItemWithStats | null>(null);

    const handleDelete = async (id: number) => {
        setDeletingId(id);
        try {
            const formData = new FormData();
            formData.append('id', id.toString());
            await deleteStock(formData);
            onUpdate();
        } catch (error) {
            console.error('Failed to delete item:', error);
        } finally {
            setDeletingId(null);
        }
    };

    const formatCurrency = (value: string | null) => {
        if (!value) return 'R$ 0,00';
        return `R$ ${parseFloat(value).toFixed(2).replace('.', ',')}`;
    };

    return (
        <>
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[250px]">Produto</TableHead>
                            <TableHead>Categoria</TableHead>
                            <TableHead className="text-right">Estoque</TableHead>
                            <TableHead className="text-right">Custo</TableHead>
                            <TableHead className="text-right">Venda</TableHead>
                            <TableHead className="text-right">Margem</TableHead>
                            <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {items.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="h-24 text-center">
                                    <p className="text-muted-foreground">
                                        Nenhum item cadastrado. Adicione seu primeiro item!
                                    </p>
                                </TableCell>
                            </TableRow>
                        ) : (
                            items.map((item) => (
                                <TableRow 
                                    key={item.id} 
                                    className={!item.isActive ? 'opacity-50' : ''}
                                >
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <div>
                                                <p className="font-medium">{item.name}</p>
                                                {item.supplier && (
                                                    <p className="text-xs text-muted-foreground">
                                                        {item.supplier}
                                                    </p>
                                                )}
                                            </div>
                                            {!item.isActive && (
                                                <Badge variant="secondary" className="text-xs">
                                                    Inativo
                                                </Badge>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline">
                                            {categoryLabels[item.category] || item.category}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            {item.isLowStock && (
                                                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                                            )}
                                            <span className={item.isLowStock ? 'text-yellow-600 font-medium' : ''}>
                                                {parseFloat(item.currentQuantity).toFixed(2)} {unitLabels[item.unit] || item.unit}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {formatCurrency(item.costPrice)}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {formatCurrency(item.salePrice)}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            <TrendingUp className={`h-3 w-3 ${item.margin > 50 ? 'text-green-500' : item.margin > 20 ? 'text-yellow-500' : 'text-red-500'}`} />
                                            <span className={item.margin > 50 ? 'text-green-600' : item.margin > 20 ? 'text-yellow-600' : 'text-red-600'}>
                                                {item.margin.toFixed(0)}%
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            <AddTransactionDialog 
                                                item={item} 
                                                onTransactionAdded={onUpdate}
                                            >
                                                <Button size="icon" variant="ghost" title="Nova movimentação">
                                                    <Plus className="h-4 w-4" />
                                                </Button>
                                            </AddTransactionDialog>
                                            
                                            <Button 
                                                size="icon" 
                                                variant="ghost" 
                                                title="Histórico"
                                                onClick={() => setTransactionsItem(item)}
                                            >
                                                <History className="h-4 w-4" />
                                            </Button>

                                            <AddStockDialog
                                                item={item}
                                                onStockAdded={onUpdate}
                                                mode="edit"
                                            >
                                                <Button size="icon" variant="ghost" title="Editar">
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                            </AddStockDialog>

                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button 
                                                        size="icon" 
                                                        variant="ghost" 
                                                        className="text-destructive hover:text-destructive"
                                                        title="Excluir"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Excluir Item</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            Tem certeza que deseja excluir &quot;{item.name}&quot;? 
                                                            Isso também removerá todo o histórico de movimentações deste item.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                        <AlertDialogAction
                                                            onClick={() => handleDelete(item.id)}
                                                            disabled={deletingId === item.id}
                                                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                        >
                                                            {deletingId === item.id ? "Excluindo..." : "Excluir"}
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
            
            <TransactionsSheet 
                item={transactionsItem} 
                open={!!transactionsItem}
                onOpenChange={(open) => !open && setTransactionsItem(null)}
            />
        </>
    );
}

