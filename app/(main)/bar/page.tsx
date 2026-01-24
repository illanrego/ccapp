'use client'

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
    Beer, 
    Power, 
    PowerOff, 
    Calendar, 
    Clock, 
    DollarSign,
    Users,
    CheckCircle,
    Clock3
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { 
    getActiveBarSession, 
    getUnclosedPreviousSession,
    BarSessionWithShow 
} from "./actions/bar-session.action";
import { getComandas, getComandaWithItems, ComandaWithItems } from "./actions/comanda.action";
import { listShowsForBar, ShowForBar } from "./actions/list-shows.action";
import { listStock } from "../estoque/actions/list-stock.action";
import { SelectComanda, SelectStockItem } from "@/db/schema";
import { OpenSessionDialog } from "./components/open-session-dialog";
import { CloseSessionDialog } from "./components/close-session-dialog";
import { ComandaGrid } from "./components/comanda-grid";
import { ComandaSheet } from "./components/comanda-sheet";

export default function BarPage() {
    const [session, setSession] = useState<BarSessionWithShow | null>(null);
    const [unclosedSession, setUnclosedSession] = useState<BarSessionWithShow | null>(null);
    const [comandas, setComandas] = useState<SelectComanda[]>([]);
    const [shows, setShows] = useState<ShowForBar[]>([]);
    const [stockItems, setStockItems] = useState<SelectStockItem[]>([]);
    const [loading, setLoading] = useState(true);
    
    // Dialogs
    const [showOpenDialog, setShowOpenDialog] = useState(false);
    const [showCloseDialog, setShowCloseDialog] = useState(false);
    const [showUnclosedDialog, setShowUnclosedDialog] = useState(false);
    
    // Comanda sheet
    const [selectedComanda, setSelectedComanda] = useState<SelectComanda | null>(null);
    const [comandaDetails, setComandaDetails] = useState<ComandaWithItems | null>(null);
    const [showComandaSheet, setShowComandaSheet] = useState(false);

    const loadData = useCallback(async () => {
        try {
            const [activeSession, showsList, stock] = await Promise.all([
                getActiveBarSession(),
                listShowsForBar(),
                listStock(),
            ]);
            
            setSession(activeSession);
            setShows(showsList);
            setStockItems(stock);

            if (activeSession) {
                const comandasList = await getComandas(activeSession.id);
                setComandas(comandasList);
                
                // Check for unclosed previous sessions
                const unclosed = await getUnclosedPreviousSession(activeSession.showId);
                if (unclosed) {
                    setUnclosedSession(unclosed);
                    setShowUnclosedDialog(true);
                }
            } else {
                setComandas([]);
                
                // Check for any unclosed sessions
                const unclosed = await getUnclosedPreviousSession();
                if (unclosed) {
                    setUnclosedSession(unclosed);
                    setShowUnclosedDialog(true);
                }
            }
        } catch (error) {
            console.error('Error loading bar data:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleComandaClick = async (comanda: SelectComanda) => {
        setSelectedComanda(comanda);
        if (comanda.status !== 'disponivel') {
            const details = await getComandaWithItems(comanda.id);
            setComandaDetails(details);
        } else {
            setComandaDetails(null);
        }
        setShowComandaSheet(true);
    };

    const handleComandaUpdate = async () => {
        if (session) {
            const [comandasList, details] = await Promise.all([
                getComandas(session.id),
                selectedComanda ? getComandaWithItems(selectedComanda.id) : null,
            ]);
            setComandas(comandasList);
            if (details) {
                setComandaDetails(details);
                // Update selectedComanda with fresh data
                const updated = comandasList.find(c => c.id === selectedComanda?.id);
                if (updated) setSelectedComanda(updated);
            }
            // Reload session for updated totals
            const updatedSession = await getActiveBarSession();
            setSession(updatedSession);
        }
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr + 'T00:00:00');
        return date.toLocaleDateString('pt-BR', {
            weekday: 'long',
            day: '2-digit',
            month: 'long',
        });
    };

    // Stats
    const stats = {
        disponivel: comandas.filter(c => c.status === 'disponivel').length,
        aberta: comandas.filter(c => c.status === 'aberta').length,
        paga: comandas.filter(c => c.status === 'paga').length,
    };

    if (loading) {
        return (
            <div className="container py-8 flex items-center justify-center min-h-[400px]">
                <p className="text-muted-foreground">Carregando...</p>
            </div>
        );
    }

    return (
        <div className="container py-8">
            {/* Header */}
            <div className="flex justify-between items-start mb-8">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        <Beer className="h-8 w-8" />
                        Bar
                    </h1>
                    {session ? (
                        <div className="mt-2 flex items-center gap-4 text-muted-foreground">
                            <span className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                {formatDate(session.show.date)}
                            </span>
                            {session.show.startTime && (
                                <span className="flex items-center gap-1">
                                    <Clock className="h-4 w-4" />
                                    {session.show.startTime.slice(0, 5)}
                                </span>
                            )}
                            {session.show.showName && (
                                <Badge variant="secondary">{session.show.showName}</Badge>
                            )}
                        </div>
                    ) : (
                        <p className="text-muted-foreground mt-1">
                            Nenhuma sessão ativa
                        </p>
                    )}
                </div>
                
                <div className="flex gap-2">
                    {session ? (
                        <Button 
                            variant="destructive" 
                            onClick={() => setShowCloseDialog(true)}
                        >
                            <PowerOff className="mr-2 h-4 w-4" />
                            Fechar Bar
                        </Button>
                    ) : (
                        <Button onClick={() => setShowOpenDialog(true)}>
                            <Power className="mr-2 h-4 w-4" />
                            Abrir Bar
                        </Button>
                    )}
                </div>
            </div>

            {session ? (
                <>
                    {/* Stats Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-muted">
                                        <Users className="h-5 w-5 text-muted-foreground" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Disponíveis</p>
                                        <p className="text-2xl font-bold">{stats.disponivel}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-amber-500/10">
                                        <Clock3 className="h-5 w-5 text-amber-500" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Abertas</p>
                                        <p className="text-2xl font-bold">{stats.aberta}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-green-500/10">
                                        <CheckCircle className="h-5 w-5 text-green-500" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Pagas</p>
                                        <p className="text-2xl font-bold">{stats.paga}</p>
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
                                        <p className="text-sm text-muted-foreground">Faturamento</p>
                                        <p className="text-2xl font-bold">
                                            R$ {parseFloat(session.totalRevenue || '0').toFixed(0)}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Legend */}
                    <div className="flex gap-4 mb-4 text-sm">
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded bg-muted border-2 border-muted-foreground/20" />
                            <span>Disponível</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded bg-amber-500/20 border-2 border-amber-500" />
                            <span>Aberta</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded bg-green-500/20 border-2 border-green-500" />
                            <span>Paga</span>
                        </div>
                    </div>

                    {/* Comanda Grid */}
                    <ComandaGrid 
                        comandas={comandas} 
                        onComandaClick={handleComandaClick}
                    />
                </>
            ) : (
                /* No Active Session */
                <div className="flex flex-col items-center justify-center py-20">
                    <Beer className="h-16 w-16 text-muted-foreground mb-4" />
                    <h2 className="text-xl font-semibold mb-2">Bar Fechado</h2>
                    <p className="text-muted-foreground mb-6 text-center max-w-md">
                        Abra uma nova sessão do bar para começar a vender. 
                        Selecione um show para vincular as vendas.
                    </p>
                    <Button onClick={() => setShowOpenDialog(true)} size="lg">
                        <Power className="mr-2 h-5 w-5" />
                        Abrir Bar
                    </Button>
                </div>
            )}

            {/* Dialogs */}
            <OpenSessionDialog
                open={showOpenDialog}
                onOpenChange={setShowOpenDialog}
                shows={shows}
                onSessionOpened={loadData}
            />

            {session && (
                <CloseSessionDialog
                    open={showCloseDialog}
                    onOpenChange={setShowCloseDialog}
                    session={session}
                    openComandasCount={stats.aberta}
                    onSessionClosed={loadData}
                />
            )}

            {unclosedSession && (
                <CloseSessionDialog
                    open={showUnclosedDialog}
                    onOpenChange={setShowUnclosedDialog}
                    session={unclosedSession}
                    openComandasCount={0}
                    onSessionClosed={() => {
                        setUnclosedSession(null);
                        loadData();
                    }}
                    isPreviousSession
                />
            )}

            {/* Comanda Sheet */}
            <ComandaSheet
                comanda={selectedComanda}
                comandaDetails={comandaDetails}
                stockItems={stockItems}
                open={showComandaSheet}
                onOpenChange={setShowComandaSheet}
                onUpdate={handleComandaUpdate}
            />
        </div>
    );
}

