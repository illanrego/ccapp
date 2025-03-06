'use client'

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import { listComics } from "./actions/list-comics.action";
import { ComicCard } from "./components/comic-card";
import { AddComicDialog } from "./components/add-comic-dialog";
import { useState, useEffect } from "react";
import { SelectComic, comicClassEnum } from "@/db/schema";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function ComicsPage() {
  const [comics, setComics] = useState<SelectComic[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchComics = async () => {
      const fetchedComics = await listComics();
      setComics(fetchedComics);
    };
    fetchComics();
  }, []);

  const filteredComics = comics.filter(comic => {
    const matchesSearch = comic.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesClass = selectedClass === 'all' || !selectedClass || comic.class === selectedClass;
    return matchesSearch && matchesClass;
  });

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Comics</h1>
        <AddComicDialog onComicAdded={() => listComics().then(setComics)}>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Comic
          </Button>
        </AddComicDialog>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="flex-1">
          <Input
            placeholder="Search comics..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-sm"
          />
        </div>
        <Select value={selectedClass || undefined} onValueChange={setSelectedClass}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by class" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Classes</SelectItem>
            {(Object.values(comicClassEnum.enumValues) as string[]).map((classType) => (
              <SelectItem key={classType} value={classType}>
                Class {classType}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredComics.map((comic) => (
          <ComicCard 
            key={comic.id} 
            comic={comic}
            onComicUpdated={() => listComics().then(setComics)}
          />
        ))}
      </div>
    </div>
  );
}
