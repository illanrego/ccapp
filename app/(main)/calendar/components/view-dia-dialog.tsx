"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SelectComic } from "@/db/schema";
import { formatDate } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { deleteShow } from "../actions/delete-dia.action";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Calendar, Clock, DollarSign, Ticket, Users, Star, BarChart, SplitSquareVertical } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface ViewShowDialogProps {
  selectedDate?: Date;
  show: {
    id: number;
    date: Date;
    startTime?: string | null;
    showName?: string | null;
    ticketsSold?: number | null;
    ticketsRevenue?: number | null;
    barRevenue?: number | null;
    showQuality?: string | null;
    isFiftyFifty?: boolean | null;
  };
  comics?: SelectComic[];
  onClose?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function ViewShowDialog({
  selectedDate,
  show,
  comics = [],
  onClose,
  onEdit,
  onDelete,
}: ViewShowDialogProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const result = await deleteShow(show.id);
      if (result.success) {
        router.refresh();
        onDelete?.();
        onClose?.();
      } else {
        console.error("Failed to delete show:", result.error);
      }
    } catch (error) {
      console.error("Failed to delete show:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const formatCurrency = (value: number | null | undefined) => {
    if (value === null || value === undefined) return "—";
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const getQualityColor = (quality: string | null | undefined) => {
    if (!quality) return "bg-gray-200 text-gray-700";
    
    switch (quality.toLowerCase()) {
      case "excellent":
        return "bg-green-100 text-green-800";
      case "good":
        return "bg-blue-100 text-blue-800";
      case "average":
        return "bg-yellow-100 text-yellow-800";
      case "poor":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Calculate total revenue based on 50/50 split if applicable
  const calculateTotalRevenue = () => {
    const ticketsRevenue = show.ticketsRevenue || 0;
    const barRevenue = show.barRevenue || 0;
    
    // If 50/50 split is enabled, only count 50% of ticket revenue
    if (show.isFiftyFifty) {
      return (ticketsRevenue / 2) + barRevenue;
    }
    
    // Otherwise, count 100% of ticket revenue
    return ticketsRevenue + barRevenue;
  };

  return (
    <Dialog open={!!selectedDate} onOpenChange={() => onClose?.()}>
      <DialogContent className="sm:max-w-[550px] p-0 overflow-hidden">
        <div className="bg-primary/10 p-6">
          <DialogHeader className="mb-2">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              <DialogTitle className="text-xl">Show Details</DialogTitle>
            </div>
            <DialogDescription className="text-2xl font-bold mt-2">
              {show.showName || "Untitled Show"}
            </DialogDescription>
            <div className="flex items-center gap-2 mt-1 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>{formatDate(selectedDate?.toISOString() || '')}</span>
            </div>
            {show.startTime && (
              <div className="flex items-center gap-2 mt-1 text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>{show.startTime}</span>
              </div>
            )}
          </DialogHeader>
        </div>
        
        <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
          {/* 50/50 Split Option */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <SplitSquareVertical className="h-5 w-5 text-primary" />
                  <Label htmlFor="fifty-fifty" className="font-medium">50/50 Revenue Split</Label>
                </div>
                <Switch 
                  id="fifty-fifty" 
                  checked={!!show.isFiftyFifty} 
                  disabled={true} // Read-only in view mode
                />
              </div>
              {show.isFiftyFifty && (
                <p className="text-sm text-muted-foreground mt-2">
                  This show has a 50/50 revenue split. Only 50% of ticket revenue is counted in the total.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Comics Section */}
          {comics.length > 0 && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3 text-primary font-medium">
                  <Users className="h-5 w-5" />
                  <h3>Lineup</h3>
                </div>
                <div className="space-y-3">
                  {comics.map((comic) => (
                    <div key={comic.id} className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/50 transition-colors">
                      <Avatar className="h-10 w-10 border">
                        <AvatarImage src={comic.picUrl || undefined} alt={comic.name} />
                        <AvatarFallback className="text-xs bg-primary/10">
                          {comic.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{comic.name}</div>
                        {comic.city && <div className="text-xs text-muted-foreground">{comic.city}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Performance Metrics */}
          {(show.ticketsSold !== null || show.ticketsRevenue !== null || show.barRevenue !== null) && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3 text-primary font-medium">
                  <BarChart className="h-5 w-5" />
                  <h3>Performance</h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {show.ticketsSold !== null && (
                    <div className="flex flex-col p-3 rounded-md bg-muted/30">
                      <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                        <Ticket className="h-3 w-3" /> Tickets Sold
                      </div>
                      <div className="text-xl font-semibold">{show.ticketsSold}</div>
                    </div>
                  )}
                  
                  {show.ticketsRevenue !== null && (
                    <div className="flex flex-col p-3 rounded-md bg-muted/30">
                      <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                        <DollarSign className="h-3 w-3" /> Ticket Revenue
                      </div>
                      <div className="text-xl font-semibold">{formatCurrency(show.ticketsRevenue)}</div>
                      {show.isFiftyFifty && show.ticketsRevenue && (
                        <div className="text-xs text-muted-foreground mt-1">
                          50% share: {formatCurrency(show.ticketsRevenue / 2)}
                        </div>
                      )}
                    </div>
                  )}
                  
                  {show.barRevenue !== null && (
                    <div className="flex flex-col p-3 rounded-md bg-muted/30">
                      <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                        <BarChart className="h-3 w-3" /> Bar Revenue
                      </div>
                      <div className="text-xl font-semibold">{formatCurrency(show.barRevenue)}</div>
                    </div>
                  )}
                  
                  {show.ticketsRevenue !== null && show.barRevenue !== null && (
                    <div className="flex flex-col p-3 rounded-md bg-primary/10">
                      <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                        <DollarSign className="h-3 w-3" /> Total Revenue
                      </div>
                      <div className="text-xl font-semibold">
                        {formatCurrency(calculateTotalRevenue())}
                      </div>
                      {show.isFiftyFifty && (
                        <div className="text-xs text-amber-600 mt-1 font-medium">
                          50/50 split applied
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Show Quality */}
          {show.showQuality && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3 text-primary font-medium">
                  <Star className="h-5 w-5" />
                  <h3>Quality Rating</h3>
                </div>
                <Badge className={`text-sm px-3 py-1 ${getQualityColor(show.showQuality)}`}>
                  {show.showQuality}
                </Badge>
              </CardContent>
            </Card>
          )}
        </div>
        
        <Separator />
        
        <DialogFooter className="p-4 flex justify-between">
          <div className="flex gap-2">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm" disabled={isDeleting}>
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the show
                    and all associated data.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete}>
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onClose}>
              Close
            </Button>
            <Button size="sm" onClick={onEdit}>
              Edit
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Keep the old component for backward compatibility
export function ViewDiaDialog(props: ViewShowDialogProps) {
  return <ViewShowDialog {...props} />;
} 