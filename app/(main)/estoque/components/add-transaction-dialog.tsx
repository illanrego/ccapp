'use client'

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { SelectStockItem } from "@/db/schema";
import { addTransaction } from "../actions/add-transaction.action";
import { useState } from "react";

interface AddTransactionDialogProps {
    children: React.ReactNode;
    item: SelectStockItem;
    onTransactionAdded?: () => void;
}

// Transaction types (must match schema enum values)
const transactionTypes = ['compra', 'venda', 'ajuste', 'perda', 'transferencia'] as const;

const typeLabels: Record<string, { label: string; description: string }> = {
    compra: { label: 'Compra', description: 'Entrada de mercadoria (aumenta estoque)' },
    venda: { label: 'Venda', description: 'Venda no bar (diminui estoque)' },
    ajuste: { label: 'Ajuste', description: 'Correção manual de inventário' },
    perda: { label: 'Perda', description: 'Quebra, vencimento ou extravio' },
    transferencia: { label: 'Transferência', description: 'Movimentação entre locais' },
};

export function AddTransactionDialog({ children, item, onTransactionAdded }: AddTransactionDialogProps) {
    const [open, setOpen] = useState(false);
    const [selectedType, setSelectedType] = useState<string>('compra');

    async function onSubmit(formData: FormData) {
        formData.append('itemId', item.id.toString());
        await addTransaction(formData);
        setOpen(false);
        onTransactionAdded?.();
    }

    const showCostField = selectedType === 'compra';

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="sm:max-w-[450px]">
                <DialogHeader>
                    <DialogTitle>
                        Nova Movimentação - {item.name}
                    </DialogTitle>
                </DialogHeader>
                <form action={onSubmit} className="space-y-4">
                    <div className="p-3 rounded-lg bg-muted/50 text-sm">
                        <span className="text-muted-foreground">Estoque atual: </span>
                        <span className="font-medium">{parseFloat(item.currentQuantity).toFixed(2)} {item.unit}</span>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="type">Tipo de Movimentação *</Label>
                        <Select 
                            name="type" 
                            defaultValue="compra" 
                            onValueChange={setSelectedType}
                            required
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Selecione o tipo" />
                            </SelectTrigger>
                            <SelectContent>
                                {transactionTypes.map((type) => (
                                    <SelectItem key={type} value={type}>
                                        <div className="flex flex-col">
                                            <span>{typeLabels[type]?.label || type}</span>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">
                            {typeLabels[selectedType]?.description}
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="quantity">
                            Quantidade ({item.unit}) *
                        </Label>
                        <Input
                            id="quantity"
                            name="quantity"
                            type="number"
                            step="0.01"
                            min="0.01"
                            required
                            placeholder={`Quantidade em ${item.unit}`}
                        />
                        {selectedType === 'ajuste' && (
                            <p className="text-xs text-muted-foreground">
                                Use valor positivo para adicionar, negativo para remover
                            </p>
                        )}
                    </div>

                    {showCostField && (
                        <div className="space-y-2">
                            <Label htmlFor="unitCost">Custo Unitário (R$)</Label>
                            <Input
                                id="unitCost"
                                name="unitCost"
                                type="number"
                                step="0.01"
                                min="0"
                                defaultValue={item.costPrice}
                                placeholder="0.00"
                            />
                            <p className="text-xs text-muted-foreground">
                                Deixe em branco para usar o custo padrão do item
                            </p>
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="notes">Observações</Label>
                        <Textarea
                            id="notes"
                            name="notes"
                            placeholder="Nota fiscal, motivo da perda, etc."
                            rows={2}
                        />
                    </div>

                    <Button type="submit" className="w-full">
                        Registrar Movimentação
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}

