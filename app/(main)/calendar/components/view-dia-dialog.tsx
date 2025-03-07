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
import { Edit } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

interface ViewDiaDialogProps {
  isOpen: boolean;
  dia: {
    id: number;
    date: Date;
    showName?: string | null;
    ticketsSold?: number | null;
    ticketsRevenue?: number | null;
    barRevenue?: number | null;
    showQuality?: string | null;
  };
  comics: SelectComic[];
  onClose: () => void;
  onEdit: () => void;
}

export function ViewDiaDialog({
  isOpen,
  dia,
  comics = [],
  onClose,
  onEdit,
}: ViewDiaDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span className="text-2xl">{dia.showName || "Show Details"}</span>
            <Button 
              variant="outline" 
              size="icon" 
              onClick={onEdit}
            >
              <Edit className="h-4 w-4" />
            </Button>
          </DialogTitle>
          <DialogDescription className="text-lg">
            {formatDate(dia.date.toISOString())}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Show details */}
          <div className="grid grid-cols-2 gap-4">
            <Card className="border-l-4 border-l-primary">
              <CardHeader className="pb-2">
                <CardTitle>Tickets</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{dia.ticketsSold || 0}</div>
                <div className="text-muted-foreground">
                  Revenue: {dia.ticketsRevenue ? `$${Number(dia.ticketsRevenue).toFixed(2)}` : '$0.00'}
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-l-4 border-l-primary">
              <CardHeader className="pb-2">
                <CardTitle>Bar</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">${Number(dia.barRevenue || 0).toFixed(2)}</div>
                <div className="text-muted-foreground">
                  Total Revenue: ${(Number(dia.ticketsRevenue || 0) + Number(dia.barRevenue || 0)).toFixed(2)}
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Comics */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center justify-between">
                <span>Comics</span>
                <Badge variant="outline" className="ml-2">
                  {comics.length} {comics.length === 1 ? "comic" : "comics"}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {comics.map((comic) => (
                  <div key={comic.id} className="flex items-center justify-between p-3 border rounded-md hover:bg-muted/50 transition-colors">
                    <div>
                      <div className="font-medium">{comic.name}</div>
                      <div className="text-sm text-muted-foreground flex items-center gap-2">
                        {comic.city && <span>{comic.city}</span>}
                        {comic.time && <span>{comic.time} min</span>}
                        {comic.socialMedia && <span>{comic.socialMedia} followers</span>}
                      </div>
                    </div>
                    <Badge variant={comic.class === 'S' ? "destructive" : 
                            comic.class === 'A' ? "default" : 
                            comic.class === 'B' ? "secondary" : 
                            "outline"}>
                      {comic.class || "N/A"}
                    </Badge>
                  </div>
                ))}
                
                {comics.length === 0 && (
                  <div className="text-center py-6 text-muted-foreground">
                    No comics assigned to this show
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          {/* Show Quality */}
          {dia.showQuality && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Show Quality</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-lg italic">&ldquo;{dia.showQuality}&rdquo;</div>
              </CardContent>
            </Card>
          )}
        </div>
        
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button variant="default" onClick={onEdit}>
            Edit Details
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 