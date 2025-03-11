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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SelectComic } from "@/db/schema";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { X } from "lucide-react";
import { addShow } from "../actions/add-dia.action";
import { updateShow } from "../actions/update-dia.action";
import { ComicSearch } from "./comic-search";

interface CalendarDialogProps {
  selectedDate?: Date;
  show?: {
    id: number;
    date: Date;
    startTime?: string | null;
    showName?: string | null;
    ticketsSold?: number | null;
    ticketsRevenue?: number | null;
    barRevenue?: number | null;
    showQuality?: string | null;
  };
  comics?: SelectComic[];
  onClose?: () => void;
}

// Portuguese weekday names
const weekDays = {
  0: 'Domingo',
  1: 'Segunda-feira',
  2: 'Terça-feira',
  3: 'Quarta-feira',
  4: 'Quinta-feira',
  5: 'Sexta-feira',
  6: 'Sábado'
};

export function CalendarDialog({
  selectedDate,
  show,
  comics = [],
  onClose,
}: CalendarDialogProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedComics, setSelectedComics] = useState<SelectComic[]>(comics);

  const handleAddComic = (comic: SelectComic | undefined) => {
    if (comic && !selectedComics.find(c => c.id === comic.id)) {
      setSelectedComics([...selectedComics, comic]);
    }
  };

  const handleRemoveComic = (comicId: string) => {
    setSelectedComics(selectedComics.filter(c => c.id !== comicId));
  };

  const formatDateBR = (date: Date) => {
    const weekDay = weekDays[date.getDay() as keyof typeof weekDays];
    return `${weekDay}, ${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      formData.set('date', selectedDate?.toISOString() || '');
      formData.set('comicIds', JSON.stringify(selectedComics.map(c => c.id)));

      let result;
      if (show) {
        result = await updateShow(show.id, formData);
      } else {
        result = await addShow(formData);
      }

      if (!result.success) {
        console.error("Failed to save show:", result.error);
        // You could add a toast notification here
        return;
      }

      router.refresh();
      onClose?.();
    } catch (error) {
      console.error("Failed to save show:", error);
      // You could add a toast notification here
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={!!selectedDate} onOpenChange={() => onClose?.()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {show ? "Edit Show Details" : "Add New Show"}
          </DialogTitle>
          <DialogDescription className="text-xl font-medium">
            {selectedDate && formatDateBR(selectedDate)}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="showName" className="text-right">
                Show Name
              </Label>
              <Input
                id="showName"
                name="showName"
                defaultValue={show?.showName || ""}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="startTime" className="text-right">
                Start Time
              </Label>
              <Input
                id="startTime"
                name="startTime"
                type="time"
                defaultValue={show?.startTime || ""}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label className="text-right mt-2">Comics</Label>
              <div className="col-span-3 space-y-2">
                {selectedComics.map((comic) => (
                  <div key={comic.id} className="flex items-center gap-2">
                    <div className="flex-1">{comic.name}</div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveComic(comic.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <ComicSearch
                  onComicSelect={handleAddComic}
                  excludeComicIds={selectedComics.map(c => c.id)}
                />
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="ticketsSold" className="text-right">
                Tickets Sold
              </Label>
              <Input
                id="ticketsSold"
                name="ticketsSold"
                type="number"
                defaultValue={show?.ticketsSold || ""}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="ticketsRevenue" className="text-right">
                Tickets Revenue
              </Label>
              <Input
                id="ticketsRevenue"
                name="ticketsRevenue"
                type="number"
                step="0.01"
                defaultValue={show?.ticketsRevenue || ""}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="barRevenue" className="text-right">
                Bar Revenue
              </Label>
              <Input
                id="barRevenue"
                name="barRevenue"
                type="number"
                step="0.01"
                defaultValue={show?.barRevenue || ""}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="showQuality" className="text-right">
                Show Quality
              </Label>
              <Input
                id="showQuality"
                name="showQuality"
                defaultValue={show?.showQuality || ""}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {show ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 