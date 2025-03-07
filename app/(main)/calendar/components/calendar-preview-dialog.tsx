"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { SelectComic } from "@/db/schema";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { formatDate } from "@/lib/utils";

interface CalendarPreviewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  eventDates: Record<string, {
    id: number;
    date: Date;
    showName?: string | null;
    ticketsSold?: number | null;
    ticketsRevenue?: number | null;
    barRevenue?: number | null;
    showQuality?: string | null;
  }>;
  eventComics: Record<string, SelectComic[]>;
}

export function CalendarPreviewDialog({
  isOpen,
  onClose,
  eventDates,
  eventComics,
}: CalendarPreviewDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle className="text-2xl">Calendar Overview</DialogTitle>
        </DialogHeader>
        
        <div className="p-4">
          <Calendar
            mode="single"
            selected={undefined}
            onSelect={() => {}}
            modifiers={{
              event: (date) => {
                const dateStr = date.toISOString().split('T')[0];
                return !!eventDates[dateStr];
              },
            }}
            modifiersStyles={{
              event: {
                fontWeight: "bold",
                backgroundColor: "hsl(var(--primary) / 0.15)",
                color: "hsl(var(--primary))",
                borderRadius: "4px",
              },
            }}
            className="w-full"
            components={{
              DayContent: ({ date }) => {
                const dateStr = date.toISOString().split('T')[0];
                const comics = eventComics[dateStr] || [];
                const dia = eventDates[dateStr];
                const hasEvent = !!dia;

                return (
                  <div className="w-full h-full min-h-[80px] p-1">
                    <div className={`text-right mb-1 ${hasEvent ? "font-bold" : ""}`}>
                      {date.getDate()}
                    </div>
                    {hasEvent && (
                      <HoverCard>
                        <HoverCardTrigger asChild>
                          <div className="flex flex-wrap gap-1 justify-center">
                            {comics.slice(0, 4).map((comic) => (
                              <Avatar key={comic.id} className="w-6 h-6 border border-border">
                                <AvatarImage src={comic.picUrl || undefined} alt={comic.name} />
                                <AvatarFallback className="text-[10px]">
                                  {comic.name.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                              </Avatar>
                            ))}
                            {comics.length > 4 && (
                              <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-[10px] font-medium">
                                +{comics.length - 4}
                              </div>
                            )}
                          </div>
                        </HoverCardTrigger>
                        <HoverCardContent className="w-64 p-2" side="right">
                          <div className="space-y-2">
                            <div className="font-medium">{formatDate(dia.date.toISOString())}</div>
                            {dia.showName && (
                              <div className="text-sm font-medium">{dia.showName}</div>
                            )}
                            <div className="text-sm text-muted-foreground">
                              {comics.length} {comics.length === 1 ? 'comic' : 'comics'}
                            </div>
                            <div className="space-y-1">
                              {comics.map((comic) => (
                                <div key={comic.id} className="flex items-center gap-2">
                                  <Avatar className="w-6 h-6">
                                    <AvatarImage src={comic.picUrl || undefined} alt={comic.name} />
                                    <AvatarFallback className="text-[10px]">
                                      {comic.name.split(' ').map(n => n[0]).join('')}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="text-sm">{comic.name}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </HoverCardContent>
                      </HoverCard>
                    )}
                  </div>
                );
              },
            }}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
} 