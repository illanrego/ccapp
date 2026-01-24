'use client'

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, AlertTriangle, Package, DollarSign, TrendingDown } from "lucide-react";
import { listStock, StockItemWithStats } from "./actions/list-stock.action";
import { AddStockDialog } from "./components/add-stock-dialog";
import { StockTable } from "./components/stock-table";
import { useState, useEffect, useMemo } from "react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

// Stock categories (must match schema enum values)
const stockCategories = [
    'cerveja', 'vinho', 'destilado', 'refrigerante', 'agua', 
    'suco', 'energetico', 'petisco', 'ingrediente', 'descartavel', 'outro'
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

export default function EstoquePage() {
    const [items, setItems] = useState<StockItemWithStats[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [showLowStockOnly, setShowLowStockOnly] = useState(false);
    const [showActiveOnly, setShowActiveOnly] = useState(true);

    const fetchItems = async () => {
        const fetchedItems = await listStock();
        setItems(fetchedItems);
    };

    useEffect(() => {
        fetchItems();
    }, []);

    const filteredItems = useMemo(() => {
        return items.filter(item => {
            const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.supplier?.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCategory = selectedCategory === 'all' || !selectedCategory || item.category === selectedCategory;
            const matchesLowStock = !showLowStockOnly || item.isLowStock;
            const matchesActive = !showActiveOnly || item.isActive;
            return matchesSearch && matchesCategory && matchesLowStock && matchesActive;
        });
    }, [items, searchQuery, selectedCategory, showLowStockOnly, showActiveOnly]);

    // Calculate summary stats
    const stats = useMemo(() => {
        const activeItems = items.filter(i => i.isActive);
        const lowStockCount = activeItems.filter(i => i.isLowStock).length;
        const totalValue = activeItems.reduce((sum, item) => {
            return sum + parseFloat(item.currentQuantity) * parseFloat(item.salePrice);
        }, 0);
        const totalCost = activeItems.reduce((sum, item) => {
            return sum + parseFloat(item.currentQuantity) * parseFloat(item.costPrice);
        }, 0);
        
        return {
            totalItems: activeItems.length,
            lowStockCount,
            totalValue,
            totalCost,
            potentialProfit: totalValue - totalCost,
        };
    }, [items]);

    return (
        <div className="container py-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold">Estoque</h1>
                    <p className="text-muted-foreground mt-1">
                        Gerencie o inventário do bar
                    </p>
                </div>
                <AddStockDialog onStockAdded={fetchItems}>
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Adicionar Item
                    </Button>
                </AddStockDialog>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-primary/10">
                                <Package className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Total de Itens</p>
                                <p className="text-2xl font-bold">{stats.totalItems}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-yellow-500/10">
                                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Estoque Baixo</p>
                                <p className="text-2xl font-bold">{stats.lowStockCount}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-green-500/10">
                                <DollarSign className="h-5 w-5 text-green-500" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Valor em Estoque</p>
                                <p className="text-2xl font-bold">
                                    R$ {stats.totalValue.toFixed(2).replace('.', ',')}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-blue-500/10">
                                <TrendingDown className="h-5 w-5 text-blue-500" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Custo do Estoque</p>
                                <p className="text-2xl font-bold">
                                    R$ {stats.totalCost.toFixed(2).replace('.', ',')}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-4 mb-6">
                <div className="flex-1 min-w-[200px]">
                    <Input
                        placeholder="Buscar por nome ou fornecedor..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="max-w-sm"
                    />
                </div>
                
                <Select value={selectedCategory || undefined} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Categoria" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todas as Categorias</SelectItem>
                        {stockCategories.map((category) => (
                            <SelectItem key={category} value={category}>
                                {categoryLabels[category] || category}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <div className="flex items-center gap-2 px-3 py-2 border rounded-md">
                    <Switch
                        id="lowStock"
                        checked={showLowStockOnly}
                        onCheckedChange={setShowLowStockOnly}
                    />
                    <Label htmlFor="lowStock" className="text-sm cursor-pointer">
                        Estoque baixo
                    </Label>
                </div>

                <div className="flex items-center gap-2 px-3 py-2 border rounded-md">
                    <Switch
                        id="activeOnly"
                        checked={showActiveOnly}
                        onCheckedChange={setShowActiveOnly}
                    />
                    <Label htmlFor="activeOnly" className="text-sm cursor-pointer">
                        Apenas ativos
                    </Label>
                </div>
            </div>

            {/* Table */}
            <StockTable items={filteredItems} onUpdate={fetchItems} />
        </div>
    );
}

