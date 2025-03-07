"use client";

import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useState, useEffect } from "react";
import { formatDate } from "@/lib/utils";
import { CalendarDialog } from "./components/calendar-dialog";
import { ViewDiaDialog } from "./components/view-dia-dialog";
import { CalendarPreviewDialog } from "./components/calendar-preview-dialog";
import { getDias } from "./actions/get-dias.action";
import { deleteDia } from "./actions/delete-dia.action";
import { CalendarSearch } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";

interface DiaWithDateObject {
  id: number;
  date: Date;
  showName?: string | null;
  ticketsSold?: number | null;
  ticketsRevenue?: number | null;
  barRevenue?: number | null;
  showQuality?: string | null;
}

export default function CalendarPage() {
  const [dias, setDias] = useState<Awaited<ReturnType<typeof getDias>>>([]);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedDia, setSelectedDia] = useState<DiaWithDateObject>();
  const [isEditing, setIsEditing] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  useEffect(() => {
    getDias().then(setDias);
  }, []);

  // Create a map of dates to events for easier lookup
  const eventDates = dias.reduce((acc, { dia }) => {
    // Create date preserving the local date values
    const [year, month, day] = dia.date.split('T')[0].split('-').map(Number);
    const date = new Date(year, month - 1, day);
    acc[date.toISOString().split('T')[0]] = {
      ...dia,
      date,
      ticketsSold: dia.ticketsSold,
      ticketsRevenue: Number(dia.ticketsRevenue),
      barRevenue: Number(dia.barRevenue),
    };
    return acc;
  }, {} as Record<string, DiaWithDateObject>);

  // Create a map of dates to comics for easier lookup
  const eventComics = dias.reduce((acc, { dia, comics }) => {
    const [year, month, day] = dia.date.split('T')[0].split('-').map(Number);
    const date = new Date(year, month - 1, day);
    const dateStr = date.toISOString().split('T')[0];
    acc[dateStr] = comics || [];
    return acc;
  }, {} as Record<string, NonNullable<(typeof dias)[number]["comics"]>>);

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    setIsEditing(false);
    if (date) {
      const dateStr = date.toISOString().split('T')[0];
      setSelectedDia(eventDates[dateStr]);
    } else {
      setSelectedDia(undefined);
    }
  };

  const handleDialogClose = () => {
    setSelectedDate(undefined);
    setSelectedDia(undefined);
    setIsEditing(false);
    getDias().then(setDias);
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleDelete = async () => {
    if (!selectedDia) return;
    
    const result = await deleteDia(selectedDia.id);
    if (result.success) {
      handleDialogClose();
    }
  };

  return (
    <div className="container max-w-[2000px] py-10">
      <div className="flex flex-col gap-4 mb-8">
        <div className="flex items-center justify-between">
          <h1 className="text-4xl font-bold">Calendar</h1>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="default"
                  size="default"
                  className="flex items-center gap-2"
                  onClick={() => setIsPreviewOpen(true)}
                >
                  <CalendarSearch className="h-4 w-4" />
                  <span>View All Shows</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>See all shows with comic photos in a calendar view</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-[5fr_1fr] xl:grid-cols-[6fr_1fr] gap-8">
        <Card className="w-full overflow-x-auto">
          <CardContent className="pt-6 w-full min-w-[1120px]">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
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
                  const hasEvent = !!eventDates[dateStr];
                  
                  return (
                    <div className="w-full h-full min-h-[120px] p-2">
                      <div className={`text-right mb-2 ${hasEvent ? "font-bold" : ""}`}>
                        {date.getDate()}
                      </div>
                      {hasEvent && (
                        <HoverCard>
                          <HoverCardTrigger asChild>
                            <div className="flex flex-col gap-1.5 items-center">
                              {eventDates[dateStr]?.showName && (
                                <div className="text-[15px] text-muted-foreground truncate w-full px-1 mb-1 text-center">
                                  {eventDates[dateStr].showName}
                                </div>
                              )}
                              <div className="flex flex-wrap gap-2 justify-center">
                                {comics.slice(0, 4).map((comic) => (
                                  <Avatar key={comic.id} className="w-14 h-14 border border-border">
                                    <AvatarImage src={comic.picUrl || undefined} alt={comic.name} />
                                    <AvatarFallback className="text-xs">
                                      {comic.name.split(' ').map(n => n[0]).join('')}
                                    </AvatarFallback>
                                  </Avatar>
                                ))}
                                {comics.length > 4 && (
                                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
                                    +{comics.length - 4}
                                  </div>
                                )}
                              </div>
                            </div>
                          </HoverCardTrigger>
                          <HoverCardContent className="w-64 p-2" side="right">
                            <div className="space-y-2">
                              <div className="font-medium">{formatDate(date.toISOString())}</div>
                              {eventDates[dateStr]?.showName && (
                                <div className="text-sm font-medium">{eventDates[dateStr].showName}</div>
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
          </CardContent>
        </Card>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Próximos Shows</h2>
          {dias
            .filter(({ dia }) => {
              const [year, month, day] = dia.date.split('T')[0].split('-').map(Number);
              const date = new Date(year, month - 1, day);
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              return date >= today;
            })
            .sort((a, b) => {
              const [yearA, monthA, dayA] = a.dia.date.split('T')[0].split('-').map(Number);
              const [yearB, monthB, dayB] = b.dia.date.split('T')[0].split('-').map(Number);
              return new Date(yearA, monthA - 1, dayA).getTime() - new Date(yearB, monthB - 1, dayB).getTime();
            })
            .map(({ dia, comics }) => (
              <Card 
                key={dia.id} 
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => {
                  const [year, month, day] = dia.date.split('T')[0].split('-').map(Number);
                  const date = new Date(year, month - 1, day);
                  setSelectedDate(date);
                  setSelectedDia({
                    ...dia,
                    date,
                    ticketsRevenue: Number(dia.ticketsRevenue),
                    barRevenue: Number(dia.barRevenue),
                  });
                  setIsEditing(false);
                }}
              >
                <CardContent className="pt-6">
                  <div className="font-medium">
                    {formatDate(dia.date.split('T')[0])}
                  </div>
                  {dia.showName && (
                    <div className="text-sm text-muted-foreground mt-1">
                      {dia.showName}
                    </div>
                  )}
                  {comics && comics.length > 0 && (
                    <div className="text-sm text-muted-foreground mt-1">
                      Com: {comics.map(c => c.name).join(", ")}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
        </div>
      </div>

      {/* Show the appropriate dialog based on whether we're creating, viewing, or editing */}
      {selectedDate && (
        selectedDia && !isEditing ? (
          <ViewDiaDialog
            isOpen={true}
            dia={selectedDia}
            comics={eventComics[selectedDate.toISOString().split('T')[0]] || []}
            onClose={handleDialogClose}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ) : (
          <CalendarDialog
            selectedDate={selectedDate}
            dia={selectedDia}
            comics={eventComics[selectedDate.toISOString().split('T')[0]] || []}
            onClose={handleDialogClose}
          />
        )
      )}

      {/* Preview dialog */}
      <CalendarPreviewDialog
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        eventDates={eventDates}
        eventComics={eventComics}
      />
    </div>
  );
}
