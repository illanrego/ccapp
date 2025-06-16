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
import { SelectComic } from "@/db/schema";
import { Beer, Ticket } from "lucide-react";

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
  freeTickets?: number | null;
}

export default function CalendarPage() {
  const [shows, setShows] = useState<Awaited<ReturnType<typeof getShows>>>([]);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedShow, setSelectedShow] = useState<ShowWithDateObject>();
  const [isEditing, setIsEditing] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());

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

  // Filter shows for the current month
  const currentMonthShows = shows.filter(({ show }) => {
    const [year, month] = show.date.split('T')[0].split('-').map(Number);
    const showDate = new Date(year, month - 1, 1);
    const currentMonthDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    
    return showDate.getTime() === currentMonthDate.getTime();
  });

  // Calculate shows count for each ticket range (only for current month)
  const ticketRangeCounts = currentMonthShows.reduce((acc, { show }) => {
    const ticketsSold = show.ticketsSold || 0;
    if (ticketsSold >= 41) {
      acc['41+'] = (acc['41+'] || 0) + 1;
    } else if (ticketsSold >= 31) {
      acc['31-40'] = (acc['31-40'] || 0) + 1;
    } else if (ticketsSold >= 21) {
      acc['21-30'] = (acc['21-30'] || 0) + 1;
    } else if (ticketsSold >= 11) {
      acc['11-20'] = (acc['11-20'] || 0) + 1;
    } else {
      acc['0-10'] = (acc['0-10'] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  // Function to get background color based on ticket sales
  const getTicketSalesColor = (ticketsSold: number) => {
    if (ticketsSold >= 41) {
      return "rgba(43, 255, 0, 0.83)"; // Bright fluorescent green (Spring Green)
    } else if (ticketsSold >= 31) {
      return "rgba(11, 128, 40, 0.67)"; // Dark green
    } else if (ticketsSold >= 21) {
      return "rgba(255, 153, 0, 0.84)"; // Sunny yellow
    } else if (ticketsSold >= 11) {
      return "rgba(240, 0, 0, 0.75)"; // Orange
    } else {
      return "rgba(255, 0, 0, 0.25)"; // Red
    }
  };

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

  // Function to get number of beer icons
  const getBeerIcons = (barRevenue: number | null) => {
    if (!barRevenue) return 0;
    return Math.floor(barRevenue / 200);
  };

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
      <div className="flex flex-col gap-6 mb-8">
        <div className="flex items-center justify-center">
          <h1 className="text-6xl font-bold">Calendar</h1>
        </div>
        <div className="flex flex-col items-center gap-2">
          <span className="text-3xl font-medium">Ticket Sales</span>
          <span className="text-lg text-muted-foreground">
            {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </span>
          <div className="flex items-center gap-6 flex-wrap justify-center">
            <div className="flex items-center gap-2">
              <div className="w-12 h-12 rounded-md flex items-center justify-center text-xl font-medium" style={{ backgroundColor: "rgba(255, 0, 0, 0.25)" }}>
                {ticketRangeCounts['0-10'] || 0}
              </div>
              <span>0-10</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-12 h-12 rounded-md flex items-center justify-center text-xl font-medium" style={{ backgroundColor: "rgba(240, 0, 0, 0.75)" }}>
                {ticketRangeCounts['11-20'] || 0}
              </div>
              <span>11-20</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-12 h-12 rounded-md flex items-center justify-center text-xl font-medium" style={{ backgroundColor: "rgba(255, 153, 0, 0.84)" }}>
                {ticketRangeCounts['21-30'] || 0}
              </div>
              <span>21-30</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-12 h-12 rounded-md flex items-center justify-center text-xl font-medium" style={{ backgroundColor: "rgba(11, 128, 40, 0.67)" }}>
                {ticketRangeCounts['31-40'] || 0}
              </div>
              <span>31-40</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-12 h-12 rounded-md flex items-center justify-center text-xl font-medium" style={{ backgroundColor: "rgba(11, 200, 0, 0.71)" }}>
                {ticketRangeCounts['41+'] || 0}
              </div>
              <span>41+</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="w-full">
        <Card className="w-full overflow-x-auto">
          <CardContent className="pt-6 w-full">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              onMonthChange={setCurrentMonth}
              modifiers={{
                event: (date) => {
                  const dateStr = date.toISOString().split('T')[0];
                  return !!eventDates[dateStr]?.length;
                },
              }}
              modifiersStyles={{
                event: {
                  fontWeight: "bold",
                  color: "hsl(var(--primary))",
                  borderRadius: "4px",
                  // Background color is now set in the DayContent component
                },
              }}
              className="w-full"
              components={{
                DayContent: ({ date }) => {
                  const dateStr = date.toISOString().split('T')[0];
                  const showsOnDate = eventDates[dateStr] || [];
                  const hasEvent = showsOnDate.length > 0;
                  
                  return (
                    <div 
                      className="w-full h-full min-h-[120px] p-2"
                    >
                      <div className={`text-right mb-2 ${hasEvent ? "font-bold" : ""}`}>
                        {date.getDate()}
                      </div>
                      {hasEvent && (
                        <div className="space-y-2">
                          {showsOnDate.map((show) => (
                            <div 
                              key={show.id} 
                              className="border border-border rounded-md p-2 cursor-pointer hover:bg-muted/50 transition-colors"
                              style={{ backgroundColor: getTicketSalesColor(show.ticketsSold || 0) }}
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
                                          <div className="text-[16px] truncate mb-1 font-medium text-white">
                                            {show.showName}
                                          </div>
                                          {show.ticketsSold !== null && (
                                            <div className="flex items-center justify-center gap-2 text-base font-medium mt-1 text-white">
                                              <Ticket className="h-4 w-4" />
                                              {show.ticketsSold}
                                            </div>
                                          )}
                                          {show.barRevenue && getBeerIcons(show.barRevenue) > 0 && (
                                            <div className="flex items-center justify-center gap-1 mt-1">
                                              {Array.from({ length: getBeerIcons(show.barRevenue) }).map((_, i) => (
                                                <Beer 
                                                  key={i} 
                                                  className="h-4 w-4 text-white"
                                                />
                                              ))}
                                            </div>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                    {eventComics[dateStr]?.[show.id] && (
                                      <div className="grid grid-cols-3 gap-1 justify-items-center mt-1">
                                        {eventComics[dateStr][show.id].slice(0, 6).map((comic) => (
                                          <Avatar key={comic.id} className="w-10 h-10 border border-border">
                                            <AvatarImage src={comic.picUrl || undefined} alt={comic.name} />
                                            <AvatarFallback className="text-xs">
                                              {comic.name.split(' ').map((n) => n[0]).join('')}
                                            </AvatarFallback>
                                          </Avatar>
                                        ))}
                                        {eventComics[dateStr][show.id].length > 6 && (
                                          <div className="col-span-3 mt-1 text-center">
                                            <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-muted text-[11px] font-medium">
                                              +{eventComics[dateStr][show.id].length - 6}
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
                                    {show.ticketsSold !== null && (
                                      <div className="text-sm text-muted-foreground">
                                        {show.ticketsSold} tickets sold
                                        {show.freeTickets ? ` + ${show.freeTickets} free tickets` : ''}
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
