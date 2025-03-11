"use client";

import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { formatDate } from "@/lib/utils";
import { CalendarDialog } from "./components/calendar-dialog";
import { ViewShowDialog } from "./components/view-dia-dialog";
import { CalendarPreviewDialog } from "./components/calendar-preview-dialog";
import { getShows } from "./actions/get-dias.action";
import { deleteShow } from "./actions/delete-dia.action";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Badge } from "@/components/ui/badge";
import { SelectComic } from "@/db/schema";

interface ShowWithDateObject {
  id: number;
  date: Date;
  startTime?: string | null;
  showName?: string | null;
  ticketsSold?: number | null;
  ticketsRevenue?: number | null;
  barRevenue?: number | null;
  showQuality?: string | null;
  isFiftyFifty?: boolean | null;
}

export default function CalendarPage() {
  const [shows, setShows] = useState<Awaited<ReturnType<typeof getShows>>>([]);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedShow, setSelectedShow] = useState<ShowWithDateObject>();
  const [isEditing, setIsEditing] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  useEffect(() => {
    getShows().then(setShows);
  }, []);

  // Create a map of dates to shows for easier lookup
  const eventDates = shows.reduce((acc, { show }) => {
    // Create date preserving the local date values
    const [year, month, day] = show.date.split('T')[0].split('-').map(Number);
    const date = new Date(year, month - 1, day);
    const dateStr = date.toISOString().split('T')[0];
    
    if (!acc[dateStr]) {
      acc[dateStr] = [];
    }
    
    acc[dateStr].push({
      ...show,
      date,
      ticketsSold: show.ticketsSold,
      ticketsRevenue: Number(show.ticketsRevenue),
      barRevenue: Number(show.barRevenue),
    });
    
    return acc;
  }, {} as Record<string, ShowWithDateObject[]>);

  // Create a map of dates to comics for easier lookup
  const eventComics = shows.reduce((acc, { show, comics }) => {
    const [year, month, day] = show.date.split('T')[0].split('-').map(Number);
    const date = new Date(year, month - 1, day);
    const dateStr = date.toISOString().split('T')[0];
    
    if (!acc[dateStr]) {
      acc[dateStr] = {};
    }
    
    acc[dateStr][show.id] = comics || [];
    return acc;
  }, {} as Record<string, Record<number, (SelectComic & { comicShow?: { comicId: string; showId: number; position?: string | null } })[]>>);

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    setIsEditing(false);
    setSelectedShow(undefined);
    
    // When selecting a date with multiple shows, don't auto-select any show
    // The user will need to click on a specific show
  };

  const handleShowSelect = (show: ShowWithDateObject) => {
    setSelectedShow(show);
    setIsEditing(false);
  };

  const handleDialogClose = () => {
    setSelectedDate(undefined);
    setSelectedShow(undefined);
    setIsEditing(false);
    getShows().then(setShows);
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleDelete = async () => {
    if (!selectedShow) return;
    
    const result = await deleteShow(selectedShow.id);
    if (result.success) {
      handleDialogClose();
    }
  };

  return (
    <div className="container max-w-[2000px] py-10">
      <div className="flex flex-col gap-4 mb-8">
        <div className="flex items-center justify-between">
          <h1 className="text-4xl font-bold">Calendar</h1>
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
                    <div className="w-full h-full min-h-[120px] p-2">
                      <div className={`text-right mb-2 ${hasEvent ? "font-bold" : ""}`}>
                        {date.getDate()}
                      </div>
                      {hasEvent && (
                        <div className="space-y-2">
                          {showsOnDate.map((show) => (
                            <div 
                              key={show.id} 
                              className="border border-border rounded-md p-2 cursor-pointer hover:bg-muted/50 transition-colors"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedDate(date);
                                handleShowSelect(show);
                              }}
                            >
                              <HoverCard>
                                <HoverCardTrigger asChild>
                                  <div>
                                    <div className="flex items-center justify-between flex-col">
                                      {show.showName && (
                                        <div className="flex flex-col w-full px-1">
                                          <div className="text-[13px] text-muted-foreground truncate mb-1">
                                            {show.showName}
                                          </div>
                                          {show.startTime && (
                                            <Badge variant="outline" className="text-[10px] h-5 w-fit">
                                              {show.startTime} 
                                            </Badge>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                    {eventComics[dateStr]?.[show.id] && (
                                      <div className="grid grid-cols-2 gap-1 justify-items-center mt-1">
                                        {eventComics[dateStr][show.id].slice(0, 4).map((comic) => (
                                          <Avatar key={comic.id} className="w-8 h-8 border border-border">
                                            <AvatarImage src={comic.picUrl || undefined} alt={comic.name} />
                                            <AvatarFallback className="text-xs">
                                              {comic.name.split(' ').map((n) => n[0]).join('')}
                                            </AvatarFallback>
                                          </Avatar>
                                        ))}
                                        {eventComics[dateStr][show.id].length > 4 && (
                                          <div className="col-span-2 mt-1 text-center">
                                            <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-muted text-[11px] font-medium">
                                              +{eventComics[dateStr][show.id].length - 4}
                                            </div>
                                          </div>
                                        )}
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
                            </div>
                          ))}
                          
                          {/* Add new show button */}
                          <div 
                            className="mt-2 text-center cursor-pointer text-[12px] text-muted-foreground hover:text-foreground transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedDate(date);
                              setSelectedShow(undefined);
                              setIsEditing(true);
                            }}
                          >
                            + Add show
                          </div>
                        </div>
                      )}
                    </div>
                  );
                },
              }}
            />
          </CardContent>
        </Card>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Upcoming Shows</h2>
          {shows
            .filter(({ show }) => {
              const [year, month, day] = show.date.split('T')[0].split('-').map(Number);
              const date = new Date(year, month - 1, day);
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              return date >= today;
            })
            .sort((a, b) => {
              const [yearA, monthA, dayA] = a.show.date.split('T')[0].split('-').map(Number);
              const [yearB, monthB, dayB] = b.show.date.split('T')[0].split('-').map(Number);
              const dateA = new Date(yearA, monthA - 1, dayA);
              const dateB = new Date(yearB, monthB - 1, dayB);
              
              // First sort by date
              const dateDiff = dateA.getTime() - dateB.getTime();
              if (dateDiff !== 0) return dateDiff;
              
              // If same date, sort by start time
              if (a.show.startTime && b.show.startTime) {
                return a.show.startTime.localeCompare(b.show.startTime);
              } else if (a.show.startTime) {
                return -1;
              } else if (b.show.startTime) {
                return 1;
              }
              
              return 0;
            })
            .map(({ show, comics }) => (
              <Card 
                key={show.id} 
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => {
                  const [year, month, day] = show.date.split('T')[0].split('-').map(Number);
                  const date = new Date(year, month - 1, day);
                  setSelectedDate(date);
                  setSelectedShow({
                    ...show,
                    date,
                    ticketsRevenue: Number(show.ticketsRevenue),
                    barRevenue: Number(show.barRevenue),
                  });
                  setIsEditing(false);
                }}
              >
                <CardContent className="pt-6">
                  <div className="font-medium">
                    {formatDate(show.date.split('T')[0])}
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    {show.showName && (
                      <div className="text-sm text-muted-foreground">
                        {show.showName}
                      </div>
                    )}
                    {show.startTime && (
                      <Badge variant="outline" className="text-xs">
                        {show.startTime}
                      </Badge>
                    )}
                  </div>
                  {comics && comics.length > 0 && (
                    <div className="text-sm text-muted-foreground mt-1">
                      With: {comics.map((c) => c.name).join(", ")}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
        </div>
      </div>

      {/* Show the appropriate dialog based on whether we're creating, viewing, or editing */}
      {selectedDate && (
        selectedShow && !isEditing ? (
          <ViewShowDialog
            selectedDate={selectedDate}
            show={selectedShow}
            comics={selectedShow ? eventComics[selectedDate.toISOString().split('T')[0]]?.[selectedShow.id] || [] : []}
            onClose={handleDialogClose}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ) : (
          <CalendarDialog
            selectedDate={selectedDate}
            show={selectedShow}
            comics={selectedShow ? eventComics[selectedDate.toISOString().split('T')[0]]?.[selectedShow.id] || [] : []}
            onClose={handleDialogClose}
          />
        )
      )}

      {isPreviewOpen && (
        <CalendarPreviewDialog
          isOpen={isPreviewOpen}
          onClose={() => setIsPreviewOpen(false)}
          eventDates={eventDates}
          eventComics={eventComics}
        />
      )}
    </div>
  );
}
