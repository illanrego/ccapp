"use client";

import { Input } from "@/components/ui/input";
import { SelectComic } from "@/db/schema";
import { useEffect, useState } from "react";
import { getComics } from "../actions/get-comics.action";
import { ComicSelect } from "./comic-select";

interface ComicSearchProps {
  onComicSelect: (comic: SelectComic | undefined) => void;
  excludeComicIds?: string[];
}

export function ComicSearch({ onComicSelect, excludeComicIds = [] }: ComicSearchProps) {
  const [comics, setComics] = useState<SelectComic[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredComics, setFilteredComics] = useState<SelectComic[]>([]);

  useEffect(() => {
    const fetchComics = async () => {
      try {
        const data = await getComics();
        setComics(data);
        setFilteredComics(data.filter(comic => !excludeComicIds.includes(comic.id)));
      } catch (error) {
        console.error("Failed to fetch comics:", error);
      }
    };

    fetchComics();
  }, [excludeComicIds]);

  useEffect(() => {
    const filtered = comics
      .filter(comic => 
        !excludeComicIds.includes(comic.id) &&
        comic.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    setFilteredComics(filtered);
  }, [searchQuery, comics, excludeComicIds]);

  return (
    <div className="space-y-2">
      <Input
        placeholder="Search comics by name..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      <div className="relative">
        {searchQuery && filteredComics.length > 0 && (
          <div className="absolute z-50 w-full bg-background border rounded-md shadow-lg mt-1">
            <div className="p-2 space-y-1">
              {filteredComics.map((comic) => (
                <button
                  key={comic.id}
                  className="w-full text-left px-3 py-2 hover:bg-muted rounded-sm text-sm"
                  onClick={() => {
                    onComicSelect(comic);
                    setSearchQuery("");
                  }}
                >
                  {comic.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      <div className="flex items-center gap-2">
        <div className="flex-1">
          <ComicSelect
            onChange={onComicSelect}
            excludeComicIds={excludeComicIds}
          />
        </div>
      </div>
    </div>
  );
} 