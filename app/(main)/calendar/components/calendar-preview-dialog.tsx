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
import { Badge } from "@/components/ui/badge";

interface ShowWithDateObject {
  id: number;
  date: Date;
  startTime?: string | null;
  showName?: string | null;
  ticketsSold?: number | null;
  ticketsRevenue?: number | null;
  barRevenue?: number | null;
  showQuality?: string | null;
}

interface CalendarPreviewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  eventDates?: Record<string, ShowWithDateObject[]>;
  eventComics?: Record<string, Record<number, SelectComic[]>>;
}

export function CalendarPreviewDialog({
  isOpen,
  onClose,
  eventDates = {},
  eventComics = {},
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
                return !!eventDates[dateStr]?.length;
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
                const showsOnDate = eventDates[dateStr] || [];
                const hasEvent = showsOnDate.length > 0;

                return (
                  <div className="w-full h-full min-h-[80px] p-1">
                    <div className={`text-right mb-1 ${hasEvent ? "font-bold" : ""}`}>
                      {date.getDate()}
                    </div>
                    {hasEvent && (
                      <div className="flex flex-wrap gap-1 justify-center">
                        {showsOnDate.map((show) => (
                          <HoverCard key={show.id}>
                            <HoverCardTrigger asChild>
                              <div className="flex items-center gap-1">
                                {show.startTime && (
                                  <Badge variant="outline" className="text-[8px] h-4 px-1">
                                    {show.startTime}
                                  </Badge>
                                )}
                                {eventComics[dateStr]?.[show.id] && eventComics[dateStr][show.id].length > 0 && (
                                  <Avatar className="w-6 h-6 border border-border">
                                    <AvatarImage 
                                      src={eventComics[dateStr][show.id][0].picUrl || undefined} 
                                      alt={eventComics[dateStr][show.id][0].name} 
                                    />
                                    <AvatarFallback className="text-[10px]">
                                      {eventComics[dateStr][show.id][0].name.split(' ').map((n) => n[0]).join('')}
                                    </AvatarFallback>
                                  </Avatar>
                                )}
                                {eventComics[dateStr]?.[show.id] && eventComics[dateStr][show.id].length > 1 && (
                                  <div className="w-4 h-4 rounded-full bg-muted flex items-center justify-center text-[8px] font-medium">
                                    +{eventComics[dateStr][show.id].length - 1}
                                  </div>
                                )}
                              </div>
                            </HoverCardTrigger>
                            <HoverCardContent className="w-64 p-2" side="right">
                              <div className="space-y-2">
                                <div className="font-medium">{formatDate(date.toISOString())}</div>
                                {show.showName && (
                                  <div className="text-sm font-medium">{show.showName}</div>
                                )}
                                {show.startTime && (
                                  <div className="text-sm text-muted-foreground">
                                    Start time: {show.startTime}
                                  </div>
                                )}
                                {eventComics[dateStr]?.[show.id] && (
                                  <div className="text-sm text-muted-foreground">
                                    {eventComics[dateStr][show.id].length} {eventComics[dateStr][show.id].length === 1 ? 'comic' : 'comics'}
                                  </div>
                                )}
                                {eventComics[dateStr]?.[show.id] && (
                                  <div className="space-y-1">
                                    {eventComics[dateStr][show.id].map((comic) => (
                                      <div key={comic.id} className="flex items-center gap-2">
                                        <Avatar className="w-6 h-6">
                                          <AvatarImage src={comic.picUrl || undefined} alt={comic.name} />
                                          <AvatarFallback className="text-[10px]">
                                            {comic.name.split(' ').map((n) => n[0]).join('')}
                                          </AvatarFallback>
                                        </Avatar>
                                        <div className="text-sm">{comic.name}</div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </HoverCardContent>
                          </HoverCard>
                        ))}
                      </div>
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