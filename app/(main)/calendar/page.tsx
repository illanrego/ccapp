"use client";

import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { formatDate } from "@/lib/utils";
import { CalendarDialog } from "./components/calendar-dialog";
import { ViewDiaDialog } from "./components/view-dia-dialog";
import { getDias } from "./actions/get-dias.action";

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

  useEffect(() => {
    getDias().then(setDias);
  }, []);

  // Create a map of dates to events for easier lookup
  const eventDates = dias.reduce((acc, { dia }) => {
    const date = new Date(dia.date);
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
    const date = new Date(dia.date);
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

  return (
    <div className="container py-10">
      <h1 className="text-4xl font-bold mb-8">Calendar</h1>
      <div className="grid md:grid-cols-[1fr_300px] gap-8">
        <Card>
          <CardContent className="pt-6">
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
                  const comics = eventComics[dateStr];
                  const hasEvent = !!eventDates[dateStr];
                  
                  return (
                    <div className="w-full h-full flex flex-col items-center justify-center">
                      <div className={hasEvent ? "font-bold" : ""}>{date.getDate()}</div>
                      {comics && comics.length > 0 && (
                        <div className="text-xs text-muted-foreground mt-1 text-center">
                          {comics.length} {comics.length === 1 ? "comic" : "comics"}
                        </div>
                      )}
                      {hasEvent && eventDates[dateStr].showName && (
                        <div className="text-xs text-muted-foreground truncate max-w-full px-1">
                          {eventDates[dateStr].showName}
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
          {dias
            .filter(({ dia }) => new Date(dia.date) >= new Date())
            .sort((a, b) => new Date(a.dia.date).getTime() - new Date(b.dia.date).getTime())
            .map(({ dia, comics }) => (
              <Card 
                key={dia.id} 
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => {
                  const date = new Date(dia.date);
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
                    {formatDate(dia.date)}
                  </div>
                  {dia.showName && (
                    <div className="text-sm text-muted-foreground mt-1">
                      {dia.showName}
                    </div>
                  )}
                  {comics && comics.length > 0 && (
                    <div className="text-sm text-muted-foreground mt-1">
                      Featuring: {comics.map(c => c.name).join(", ")}
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
    </div>
  );
}
