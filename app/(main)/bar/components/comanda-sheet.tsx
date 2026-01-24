'use client'

import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { SelectComanda, SelectStockItem } from "@/db/schema";
import { ComandaWithItems } from "../actions/comanda.action";
import {
    openComanda,
    addItemToComanda,
    removeItemFromComanda,
    updateItemQuantity,
    applyDiscount,
    closeComanda,
    updateComandaClientName,
} from "../actions/comanda.action";
import { useState, useEffect, useRef } from "react";
import { Plus, Minus, Trash2, User, Percent, CreditCard, Banknote, Smartphone } from "lucide-react";

interface ComandaSheetProps {
    comanda: SelectComanda | null;
    comandaDetails: ComandaWithItems | null;
    stockItems: SelectStockItem[];
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onUpdate: () => void;
}

const paymentMethods = [
    { value: 'dinheiro', label: 'Dinheiro', icon: Banknote },
    { value: 'cartao', label: 'Cartão', icon: CreditCard },
    { value: 'pix', label: 'PIX', icon: Smartphone },
] as const;

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

export function ComandaSheet({ 
    comanda, 
    comandaDetails, 
    stockItems, 
    open, 
    onOpenChange, 
    onUpdate 
}: ComandaSheetProps) {
    const [clientName, setClientName] = useState('');
    const [discount, setDiscount] = useState('');
    const [showPaymentDialog, setShowPaymentDialog] = useState(false);
    const [loading, setLoading] = useState(false);
    const autoOpenedRef = useRef<number | null>(null);

    useEffect(() => {
        if (comanda) {
            setClientName(comanda.clientName || '');
            setDiscount(comanda.discount ? parseFloat(comanda.discount).toString() : '');
        }
    }, [comanda]);

    // Auto-open comanda when sheet opens and comanda is "disponivel"
    useEffect(() => {
        if (open && comanda?.status === 'disponivel' && autoOpenedRef.current !== comanda.id) {
            autoOpenedRef.current = comanda.id;
            const formData = new FormData();
            formData.append('comandaId', comanda.id.toString());
            openComanda(formData).then(() => onUpdate());
        }
        if (!open) {
            autoOpenedRef.current = null;
        }
    }, [open, comanda?.id, comanda?.status, onUpdate]);

    const details = comandaDetails;

    // Group stock items by category
    const itemsByCategory = stockItems
        .filter(item => item.isActive && parseFloat(item.currentQuantity) > 0)
        .reduce((acc, item) => {
            const cat = item.category;
            if (!acc[cat]) acc[cat] = [];
            acc[cat].push(item);
            return acc;
        }, {} as Record<string, SelectStockItem[]>);

    async function handleAddItem(stockItemId: number) {
        if (!comanda) return;
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('comandaId', comanda.id.toString());
            formData.append('stockItemId', stockItemId.toString());
            formData.append('quantity', '1');
            await addItemToComanda(formData);
            onUpdate();
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    async function handleUpdateQuantity(itemId: number, newQuantity: number) {
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('itemId', itemId.toString());
            formData.append('quantity', newQuantity.toString());
            await updateItemQuantity(formData);
            onUpdate();
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    async function handleRemoveItem(itemId: number) {
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('itemId', itemId.toString());
            await removeItemFromComanda(formData);
            onUpdate();
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    async function handleApplyDiscount() {
        if (!comanda) return;
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('comandaId', comanda.id.toString());
            formData.append('discount', discount || '0');
            await applyDiscount(formData);
            onUpdate();
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    async function handleUpdateClientName() {
        if (!comanda) return;
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('comandaId', comanda.id.toString());
            formData.append('clientName', clientName);
            await updateComandaClientName(formData);
            onUpdate();
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    async function handleCloseComanda(paymentMethod: 'dinheiro' | 'cartao' | 'pix') {
        if (!comanda) return;
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('comandaId', comanda.id.toString());
            formData.append('paymentMethod', paymentMethod);
            await closeComanda(formData);
            setShowPaymentDialog(false);
            onOpenChange(false);
            onUpdate();
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    const formatCurrency = (value: string | number | null) => {
        const num = typeof value === 'string' ? parseFloat(value) : (value || 0);
        return `R$ ${num.toFixed(2).replace('.', ',')}`;
    };

    if (!comanda) return null;

    return (
        <>
            <Sheet open={open} onOpenChange={onOpenChange}>
                <SheetContent className="w-[450px] sm:w-[540px] flex flex-col">
                    <SheetHeader>
                        <SheetTitle className="flex items-center gap-2">
                            Comanda #{comanda.number}
                            <Badge variant={comanda.status === 'aberta' ? 'default' : 'secondary'}>
                                {comanda.status === 'disponivel' ? 'Nova' : 'Aberta'}
                            </Badge>
                        </SheetTitle>
                    </SheetHeader>

                    <ScrollArea className="flex-1 -mx-6 px-6">
                        {/* Client Name */}
                        <div className="space-y-2 mt-4">
                            <Label className="flex items-center gap-2">
                                <User className="h-4 w-4" />
                                Nome do Cliente (opcional)
                            </Label>
                            <div className="flex gap-2">
                                <Input
                                    value={clientName}
                                    onChange={(e) => setClientName(e.target.value)}
                                    placeholder="Nome do cliente"
                                    onBlur={handleUpdateClientName}
                                />
                            </div>
                        </div>

                        {/* Current Items */}
                        {details && details.items.length > 0 && (
                            <div className="mt-6">
                                <h3 className="font-medium mb-3">Itens na Comanda</h3>
                                <div className="space-y-2">
                                    {details.items.map((item) => (
                                        <div 
                                            key={item.id}
                                            className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
                                        >
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium truncate">
                                                    {item.stockItem.name}
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    {formatCurrency(item.unitPrice)} cada
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    size="icon"
                                                    variant="outline"
                                                    className="h-8 w-8"
                                                    onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                                                    disabled={loading}
                                                >
                                                    <Minus className="h-4 w-4" />
                                                </Button>
                                                <span className="w-8 text-center font-medium">
                                                    {item.quantity}
                                                </span>
                                                <Button
                                                    size="icon"
                                                    variant="outline"
                                                    className="h-8 w-8"
                                                    onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                                                    disabled={loading}
                                                >
                                                    <Plus className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="h-8 w-8 text-destructive"
                                                    onClick={() => handleRemoveItem(item.id)}
                                                    disabled={loading}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                                <span className="w-20 text-right font-medium">
                                                    {formatCurrency(item.total)}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <Separator className="my-4" />

                        {/* Add Items */}
                        <div>
                            <h3 className="font-medium mb-3">Adicionar Itens</h3>
                            <div className="space-y-4">
                                {Object.entries(itemsByCategory).map(([category, items]) => (
                                    <div key={category}>
                                        <p className="text-sm text-muted-foreground mb-2">
                                            {categoryLabels[category] || category}
                                        </p>
                                        <div className="grid grid-cols-2 gap-2">
                                            {items.map((item) => (
                                                <Button
                                                    key={item.id}
                                                    variant="outline"
                                                    className="h-auto py-2 px-3 justify-start"
                                                    onClick={() => handleAddItem(item.id)}
                                                    disabled={loading}
                                                >
                                                    <div className="text-left">
                                                        <p className="font-medium truncate">
                                                            {item.name}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {formatCurrency(item.salePrice)}
                                                        </p>
                                                    </div>
                                                </Button>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                                {Object.keys(itemsByCategory).length === 0 && (
                                    <p className="text-muted-foreground text-center py-4">
                                        Nenhum item disponível em estoque
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Discount */}
                        <div className="mt-6 mb-4">
                            <Label className="flex items-center gap-2">
                                <Percent className="h-4 w-4" />
                                Desconto (R$)
                            </Label>
                            <div className="flex gap-2 mt-2">
                                <Input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={discount}
                                    onChange={(e) => setDiscount(e.target.value)}
                                    placeholder="0.00"
                                />
                                <Button 
                                    variant="outline" 
                                    onClick={handleApplyDiscount}
                                    disabled={loading}
                                >
                                    Aplicar
                                </Button>
                            </div>
                        </div>
                    </ScrollArea>

                    {/* Footer with totals and buttons */}
                    <div className="border-t pt-4 mt-4 space-y-3">
                        <div className="flex justify-between text-sm">
                            <span>Subtotal</span>
                            <span>{formatCurrency(details?.subtotal || '0')}</span>
                        </div>
                        {details && parseFloat(details.discount || '0') > 0 && (
                            <div className="flex justify-between text-sm text-green-600">
                                <span>Desconto</span>
                                <span>- {formatCurrency(details.discount)}</span>
                            </div>
                        )}
                        <div className="flex justify-between text-lg font-bold">
                            <span>Total</span>
                            <span>{formatCurrency(details?.total || '0')}</span>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                className="flex-1"
                                size="lg"
                                onClick={() => onOpenChange(false)}
                            >
                                OK
                            </Button>
                            <Button
                                className="flex-1"
                                size="lg"
                                onClick={() => setShowPaymentDialog(true)}
                                disabled={loading || !details || parseFloat(details.subtotal || '0') === 0}
                            >
                                Pagar / Fechar
                            </Button>
                        </div>
                    </div>
                </SheetContent>
            </Sheet>

            {/* Payment Method Dialog */}
            <AlertDialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Forma de Pagamento</AlertDialogTitle>
                        <AlertDialogDescription>
                            Total: {details && formatCurrency(details.total)}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="grid grid-cols-3 gap-3 py-4">
                        {paymentMethods.map((method) => (
                            <Button
                                key={method.value}
                                variant="outline"
                                className="h-24 flex-col gap-2"
                                onClick={() => handleCloseComanda(method.value)}
                                disabled={loading}
                            >
                                <method.icon className="h-8 w-8" />
                                <span>{method.label}</span>
                            </Button>
                        ))}
                    </div>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}

