"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SelectComic } from "@/db/schema";
import { useEffect, useState } from "react";
import { getComics } from "../actions/get-comics.action";

interface ComicSelectProps {
  value?: SelectComic;
  onChange: (comic: SelectComic | undefined) => void;
  excludeComicIds?: string[];
}

export function ComicSelect({ value, onChange, excludeComicIds = [] }: ComicSelectProps) {
  const [comics, setComics] = useState<SelectComic[]>([]);

  useEffect(() => {
    const fetchComics = async () => {
      try {
        const data = await getComics();
        setComics(data);
      } catch (error) {
        console.error("Failed to fetch comics:", error);
      }
    };

    fetchComics();
  }, []);

  const availableComics = comics.filter(comic => !excludeComicIds.includes(comic.id));

  return (
    <Select
      value={value?.id}
      onValueChange={(id) => {
        const comic = comics.find((c) => c.id === id);
        onChange(comic);
      }}
    >
      <SelectTrigger>
        <SelectValue placeholder="Select a comic">
          {value?.name || "Select a comic"}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {availableComics.map((comic) => (
          <SelectItem key={comic.id} value={comic.id}>
            {comic.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
} 