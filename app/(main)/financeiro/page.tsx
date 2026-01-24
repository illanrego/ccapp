'use client'

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { 
    DollarSign, 
    TrendingUp, 
    CreditCard,
    Banknote,
    Smartphone,
    Ticket,
    Beer,
} from "lucide-react";
import { useState, useEffect } from "react";
import {
    getShowsFinancialSummary,
    getOverallSummary,
    getPaymentMethodSummary,
    getTopSellingItems,
    ShowFinancialSummary,
    OverallSummary,
    PaymentMethodSummary,
    TopSellingItem,
} from "./actions/financial.action";

export default function FinanceiroPage() {
    const [shows, setShows] = useState<ShowFinancialSummary[]>([]);
    const [summary, setSummary] = useState<OverallSummary | null>(null);
    const [payments, setPayments] = useState<PaymentMethodSummary | null>(null);
    const [topItems, setTopItems] = useState<TopSellingItem[]>([]);
    const [loading, setLoading] = useState(true);
    
    // Date filters
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const loadData = async () => {
        setLoading(true);
        try {
            const [showsData, summaryData, paymentsData, topItemsData] = await Promise.all([
                getShowsFinancialSummary(startDate || undefined, endDate || undefined),
                getOverallSummary(startDate || undefined, endDate || undefined),
                getPaymentMethodSummary(startDate || undefined, endDate || undefined),
                getTopSellingItems(10, startDate || undefined, endDate || undefined),
            ]);
            
            setShows(showsData);
            setSummary(summaryData);
            setPayments(paymentsData);
            setTopItems(topItemsData);
        } catch (error) {
            console.error('Error loading financial data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleFilter = () => {
        loadData();
    };

    const formatCurrency = (value: number) => {
        return `R$ ${value.toFixed(2).replace('.', ',')}`;
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr + 'T00:00:00');
        return date.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: '2-digit',
        });
    };

    const totalPayments = payments 
        ? payments.dinheiro + payments.cartao + payments.pix 
        : 0;

    return (
        <div className="container py-8">
            <div className="flex justify-between items-start mb-8">
                <div>
                    <h1 className="text-3xl font-bold">Financeiro</h1>
                    <p className="text-muted-foreground mt-1">
                        Acompanhe o desempenho financeiro do seu negócio
                    </p>
                </div>
            </div>

            {/* Date Filters */}
            <Card className="mb-6">
                <CardContent className="pt-6">
                    <div className="flex flex-wrap gap-4 items-end">
                        <div className="space-y-2">
                            <Label>Data Inicial</Label>
                            <Input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Data Final</Label>
                            <Input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                            />
                        </div>
                        <Button onClick={handleFilter} disabled={loading}>
                            {loading ? 'Carregando...' : 'Filtrar'}
                        </Button>
                        {(startDate || endDate) && (
                            <Button 
                                variant="outline" 
                                onClick={() => {
                                    setStartDate('');
                                    setEndDate('');
                                    setTimeout(loadData, 0);
                                }}
                            >
                                Limpar
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <p className="text-muted-foreground">Carregando...</p>
                </div>
            ) : (
                <>
                    {/* Summary Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Receita Total</p>
                                        <p className="text-2xl font-bold">
                                            {formatCurrency(summary?.totalRevenue || 0)}
                                        </p>
                                    </div>
                                    <div className="p-2 rounded-lg bg-green-500/10">
                                        <DollarSign className="h-5 w-5 text-green-500" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Ingressos</p>
                                        <p className="text-2xl font-bold">
                                            {formatCurrency(summary?.totalTicketsRevenue || 0)}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {summary?.totalTicketsSold || 0} vendidos
                                        </p>
                                    </div>
                                    <div className="p-2 rounded-lg bg-blue-500/10">
                                        <Ticket className="h-5 w-5 text-blue-500" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Bar</p>
                                        <p className="text-2xl font-bold">
                                            {formatCurrency(summary?.totalBarRevenue || 0)}
                                        </p>
                                        <p className="text-xs text-green-600">
                                            Lucro: {formatCurrency(summary?.totalBarProfit || 0)}
                                        </p>
                                    </div>
                                    <div className="p-2 rounded-lg bg-amber-500/10">
                                        <Beer className="h-5 w-5 text-amber-500" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Média/Show</p>
                                        <p className="text-2xl font-bold">
                                            {formatCurrency(summary?.averagePerShow || 0)}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {summary?.totalShows || 0} shows
                                        </p>
                                    </div>
                                    <div className="p-2 rounded-lg bg-purple-500/10">
                                        <TrendingUp className="h-5 w-5 text-purple-500" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Payment Methods & Top Items */}
                    <div className="grid md:grid-cols-2 gap-6 mb-6">
                        {/* Payment Methods */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Formas de Pagamento</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Banknote className="h-4 w-4 text-green-500" />
                                            <span>Dinheiro</span>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-medium">{formatCurrency(payments?.dinheiro || 0)}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {totalPayments > 0 
                                                    ? ((payments?.dinheiro || 0) / totalPayments * 100).toFixed(0)
                                                    : 0}%
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <CreditCard className="h-4 w-4 text-blue-500" />
                                            <span>Cartão</span>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-medium">{formatCurrency(payments?.cartao || 0)}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {totalPayments > 0 
                                                    ? ((payments?.cartao || 0) / totalPayments * 100).toFixed(0)
                                                    : 0}%
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Smartphone className="h-4 w-4 text-purple-500" />
                                            <span>PIX</span>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-medium">{formatCurrency(payments?.pix || 0)}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {totalPayments > 0 
                                                    ? ((payments?.pix || 0) / totalPayments * 100).toFixed(0)
                                                    : 0}%
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Top Selling Items */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Itens Mais Vendidos</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {topItems.length === 0 ? (
                                    <p className="text-muted-foreground text-center py-4">
                                        Nenhuma venda registrada
                                    </p>
                                ) : (
                                    <div className="space-y-3">
                                        {topItems.slice(0, 5).map((item, index) => (
                                            <div key={item.itemId} className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm text-muted-foreground w-4">
                                                        {index + 1}.
                                                    </span>
                                                    <span className="truncate">{item.itemName}</span>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-medium">{item.totalQuantity} un</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {formatCurrency(item.totalRevenue)}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Shows Table */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Detalhes por Show</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {shows.length === 0 ? (
                                <p className="text-muted-foreground text-center py-8">
                                    Nenhum show encontrado no período
                                </p>
                            ) : (
                                <div className="rounded-md border">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Data</TableHead>
                                                <TableHead>Show</TableHead>
                                                <TableHead className="text-right">Ingressos</TableHead>
                                                <TableHead className="text-right">Receita Ingr.</TableHead>
                                                <TableHead className="text-right">Bar</TableHead>
                                                <TableHead className="text-right">Lucro Bar</TableHead>
                                                <TableHead className="text-right">Total</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {shows.map((show) => (
                                                <TableRow key={show.showId}>
                                                    <TableCell>{formatDate(show.date)}</TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            {show.showName || '-'}
                                                            {show.isFiftyFifty && (
                                                                <Badge variant="secondary" className="text-xs">
                                                                    50/50
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        {show.ticketsSold}
                                                        {show.freeTickets > 0 && (
                                                            <span className="text-muted-foreground">
                                                                {' '}(+{show.freeTickets})
                                                            </span>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        {formatCurrency(show.ticketsRevenue)}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        {formatCurrency(show.barRevenue)}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <span className={show.barProfit >= 0 ? 'text-green-600' : 'text-red-600'}>
                                                            {formatCurrency(show.barProfit)}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell className="text-right font-medium">
                                                        {formatCurrency(show.totalRevenue)}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </>
            )}
        </div>
    );
}

