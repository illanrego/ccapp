'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { 
    Calendar,
    Users,
    Package,
    Beer,
    DollarSign,
    TrendingUp,
    AlertTriangle,
    Ticket,
    ArrowRight,
    Sparkles,
    BarChart3,
    Star,
    Laugh,
} from "lucide-react";
import { useState, useEffect } from "react";
import { getDashboardStats, DashboardStats } from "./(main)/home/actions/dashboard.action";

export default function HomePage() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [greeting, setGreeting] = useState('');

    useEffect(() => {
        const hour = new Date().getHours();
        if (hour < 12) setGreeting('Bom dia');
        else if (hour < 18) setGreeting('Boa tarde');
        else setGreeting('Boa noite');

        getDashboardStats()
            .then(setStats)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const formatCurrency = (value: number) => {
        return `R$ ${value.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`;
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr + 'T00:00:00');
        return date.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
        });
    };

    if (loading) {
        return (
            <div className="container py-8 flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <Laugh className="h-16 w-16 text-primary animate-bounce mx-auto mb-4" />
                    <p className="text-muted-foreground">Carregando dashboard...</p>
                </div>
            </div>
        );
    }

    if (!stats) {
        return (
            <div className="container py-8">
                <p className="text-muted-foreground">Erro ao carregar dados</p>
            </div>
        );
    }

    // Get max revenue for chart scaling
    const maxRevenue = Math.max(...stats.recentShows.map(s => s.totalRevenue), 1);

    return (
        <div className="container py-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-4xl font-bold flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5">
                        <Laugh className="h-10 w-10 text-primary" />
                    </div>
                    <div>
                        <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                            {greeting}!
                        </span>
                        <p className="text-base font-normal text-muted-foreground mt-1">
                            Comedy Club Dashboard
                        </p>
                    </div>
                </h1>
            </div>

            {/* Active Bar Session Alert */}
            {stats.hasActiveSession && (
                <Card className="mb-6 border-amber-500/50 bg-gradient-to-r from-amber-500/10 to-orange-500/10">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-3 rounded-xl bg-amber-500/20 animate-pulse">
                                    <Beer className="h-6 w-6 text-amber-500" />
                                </div>
                                <div>
                                    <p className="font-semibold text-lg">🍺 Bar Aberto!</p>
                                    <p className="text-sm text-muted-foreground">
                                        {stats.activeSessionShow}
                                    </p>
                                </div>
                            </div>
                            <Link href="/bar">
                                <Button size="lg" className="bg-amber-500 hover:bg-amber-600">
                                    Ir para o Bar
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Low Stock Alert */}
            {stats.lowStockCount > 0 && (
                <Card className="mb-6 border-yellow-500/50 bg-gradient-to-r from-yellow-500/10 to-yellow-600/5">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-yellow-500/20">
                                    <AlertTriangle className="h-5 w-5 text-yellow-500" />
                                </div>
                                <div>
                                    <p className="font-medium">⚠️ Estoque Baixo</p>
                                    <p className="text-sm text-muted-foreground">
                                        {stats.lowStockCount} {stats.lowStockCount === 1 ? 'item precisa' : 'itens precisam'} de reposição
                                    </p>
                                </div>
                            </div>
                            <Link href="/estoque">
                                <Button variant="outline">
                                    Ver Estoque
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Main Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <Card className="overflow-hidden relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 via-green-500/10 to-transparent" />
                    <CardContent className="pt-6 relative">
                        <div className="flex items-center justify-between mb-2">
                            <div className="p-2 rounded-lg bg-green-500/20">
                                <DollarSign className="h-5 w-5 text-green-500" />
                            </div>
                            <Badge variant="secondary" className="text-xs">30 dias</Badge>
                        </div>
                        <p className="text-2xl font-bold">{formatCurrency(stats.last30DaysRevenue)}</p>
                        <p className="text-sm text-muted-foreground">Receita Total</p>
                    </CardContent>
                </Card>

                <Card className="overflow-hidden relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-blue-500/10 to-transparent" />
                    <CardContent className="pt-6 relative">
                        <div className="flex items-center justify-between mb-2">
                            <div className="p-2 rounded-lg bg-blue-500/20">
                                <Ticket className="h-5 w-5 text-blue-500" />
                            </div>
                            <TrendingUp className="h-4 w-4 text-green-500" />
                        </div>
                        <p className="text-2xl font-bold">{stats.last30DaysTickets}</p>
                        <p className="text-sm text-muted-foreground">Ingressos Vendidos</p>
                    </CardContent>
                </Card>

                <Card className="overflow-hidden relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-amber-500/20 via-amber-500/10 to-transparent" />
                    <CardContent className="pt-6 relative">
                        <div className="flex items-center justify-between mb-2">
                            <div className="p-2 rounded-lg bg-amber-500/20">
                                <Beer className="h-5 w-5 text-amber-500" />
                            </div>
                            <span className="text-xs text-green-500 font-medium">
                                +{formatCurrency(stats.last30DaysBarProfit)}
                            </span>
                        </div>
                        <p className="text-2xl font-bold">{formatCurrency(stats.last30DaysBarRevenue)}</p>
                        <p className="text-sm text-muted-foreground">Receita Bar</p>
                    </CardContent>
                </Card>

                <Card className="overflow-hidden relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 via-purple-500/10 to-transparent" />
                    <CardContent className="pt-6 relative">
                        <div className="flex items-center justify-between mb-2">
                            <div className="p-2 rounded-lg bg-purple-500/20">
                                <BarChart3 className="h-5 w-5 text-purple-500" />
                            </div>
                        </div>
                        <p className="text-2xl font-bold">{formatCurrency(stats.averagePerShow)}</p>
                        <p className="text-sm text-muted-foreground">Média por Show</p>
                    </CardContent>
                </Card>
            </div>

            {/* Secondary Grid */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
                {/* Recent Shows Chart */}
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Calendar className="h-5 w-5 text-primary" />
                            Últimos Shows
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {stats.recentShows.length === 0 ? (
                            <div className="text-center py-12">
                                <Laugh className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                                <p className="text-muted-foreground">
                                    Nenhum show nos últimos 30 dias
                                </p>
                                <Link href="/calendario">
                                    <Button variant="outline" className="mt-4">
                                        Agendar Show
                                    </Button>
                                </Link>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {stats.recentShows.slice(0, 6).map((show, i) => (
                                    <div key={i} className="group">
                                        <div className="flex items-center gap-4">
                                            <div className="w-14 text-sm font-medium text-muted-foreground">
                                                {formatDate(show.date)}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between mb-1.5">
                                                    <span className="font-medium truncate">
                                                        {show.showName || 'Show'}
                                                    </span>
                                                    <span className="text-sm font-semibold">
                                                        {formatCurrency(show.totalRevenue)}
                                                    </span>
                                                </div>
                                                <div className="flex gap-0.5 h-3 rounded-full overflow-hidden bg-muted">
                                                    <div 
                                                        className="bg-gradient-to-r from-blue-500 to-blue-400 transition-all group-hover:brightness-110"
                                                        style={{ 
                                                            width: `${(show.ticketsRevenue / maxRevenue) * 100}%`,
                                                            minWidth: show.ticketsRevenue > 0 ? '8px' : '0'
                                                        }}
                                                    />
                                                    <div 
                                                        className="bg-gradient-to-r from-amber-500 to-amber-400 transition-all group-hover:brightness-110"
                                                        style={{ 
                                                            width: `${(show.barRevenue / maxRevenue) * 100}%`,
                                                            minWidth: show.barRevenue > 0 ? '8px' : '0'
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                <div className="flex items-center justify-center gap-6 pt-3 text-xs text-muted-foreground border-t">
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-3 rounded bg-gradient-to-r from-blue-500 to-blue-400" />
                                        Ingressos
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-3 rounded bg-gradient-to-r from-amber-500 to-amber-400" />
                                        Bar
                                    </div>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Quick Navigation */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Star className="h-5 w-5 text-primary" />
                            Acesso Rápido
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <Link href="/calendario" className="block">
                            <div className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-muted/80 to-muted/40 hover:from-primary/10 hover:to-primary/5 transition-all group">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-background group-hover:bg-primary/10 transition-colors">
                                        <Calendar className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                                    </div>
                                    <span className="font-medium">Shows</span>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold">{stats.totalShows}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {stats.upcomingShows} próximos
                                    </p>
                                </div>
                            </div>
                        </Link>

                        <Link href="/comics" className="block">
                            <div className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-muted/80 to-muted/40 hover:from-primary/10 hover:to-primary/5 transition-all group">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-background group-hover:bg-primary/10 transition-colors">
                                        <Users className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                                    </div>
                                    <span className="font-medium">Comediantes</span>
                                </div>
                                <p className="font-bold">{stats.totalComics}</p>
                            </div>
                        </Link>

                        <Link href="/estoque" className="block">
                            <div className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-muted/80 to-muted/40 hover:from-primary/10 hover:to-primary/5 transition-all group">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-background group-hover:bg-primary/10 transition-colors">
                                        <Package className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                                    </div>
                                    <span className="font-medium">Estoque</span>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold">{stats.totalStockItems}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {formatCurrency(stats.stockValue)}
                                    </p>
                                </div>
                            </div>
                        </Link>

                        <Link href="/financeiro" className="block">
                            <div className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-green-500/10 to-green-500/5 hover:from-green-500/20 hover:to-green-500/10 transition-all group border border-green-500/20">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-green-500/10 group-hover:bg-green-500/20 transition-colors">
                                        <DollarSign className="h-5 w-5 text-green-500" />
                                    </div>
                                    <span className="font-medium">Financeiro</span>
                                </div>
                                <ArrowRight className="h-5 w-5 text-green-500" />
                            </div>
                        </Link>
                    </CardContent>
                </Card>
            </div>

            {/* Bottom Grid */}
            <div className="grid md:grid-cols-2 gap-6">
                {/* Top Comics */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Users className="h-5 w-5 text-primary" />
                            Top Comediantes
                            <Badge variant="secondary" className="ml-auto text-xs">por média de público</Badge>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {stats.topComics.length === 0 ? (
                            <div className="text-center py-8">
                                <Users className="h-10 w-10 text-muted-foreground/30 mx-auto mb-2" />
                                <p className="text-muted-foreground text-sm">
                                    Nenhum comediante com shows
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {stats.topComics.map((comic, i) => (
                                    <div key={i} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <span className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold
                                                ${i === 0 ? 'bg-yellow-500/20 text-yellow-600' : 
                                                  i === 1 ? 'bg-slate-300/30 text-slate-500' : 
                                                  i === 2 ? 'bg-amber-700/20 text-amber-700' : 
                                                  'bg-muted text-muted-foreground'}`}>
                                                {i + 1}
                                            </span>
                                            <span className="font-medium">{comic.name}</span>
                                            {comic.class && (
                                                <Badge variant="outline" className="text-xs">
                                                    {comic.class}
                                                </Badge>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-1.5 text-sm">
                                            <Ticket className="h-4 w-4 text-muted-foreground" />
                                            <span className="font-semibold">{Math.round(comic.avgTickets)}</span>
                                            <span className="text-muted-foreground">avg</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Top Selling Items */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Beer className="h-5 w-5 text-amber-500" />
                            Mais Vendidos no Bar
                            <Badge variant="secondary" className="ml-auto text-xs">30 dias</Badge>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {stats.topSellingItems.length === 0 ? (
                            <div className="text-center py-8">
                                <Beer className="h-10 w-10 text-muted-foreground/30 mx-auto mb-2" />
                                <p className="text-muted-foreground text-sm">
                                    Nenhuma venda registrada
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {stats.topSellingItems.map((item, i) => (
                                    <div key={i} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <span className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold
                                                ${i === 0 ? 'bg-amber-500/20 text-amber-600' : 
                                                  i === 1 ? 'bg-amber-400/20 text-amber-500' : 
                                                  i === 2 ? 'bg-amber-300/20 text-amber-600' : 
                                                  'bg-muted text-muted-foreground'}`}>
                                                {i + 1}
                                            </span>
                                            <span className="font-medium">{item.name}</span>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-semibold">{item.quantity} un</p>
                                            <p className="text-xs text-muted-foreground">
                                                {formatCurrency(item.revenue)}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
