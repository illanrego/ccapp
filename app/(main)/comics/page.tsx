'use client'

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import { listComics, ComicWithAvgTickets } from "./actions/list-comics.action";
import { ComicCard } from "./components/comic-card";
import { AddComicDialog } from "./components/add-comic-dialog";
import { useState, useEffect, useMemo } from "react";
import { comicClassEnum } from "@/db/schema";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function ComicsPage() {
  const [comics, setComics] = useState<ComicWithAvgTickets[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'avgTickets' | 'name'>('avgTickets');
  
  useEffect(() => {
    const fetchComics = async () => {
      const fetchedComics = await listComics();
      setComics(fetchedComics);
    };
    fetchComics();
  }, []);

  // Get unique cities from comics
  const uniqueCities = useMemo(() => {
    const cities = comics
      .map(comic => comic.city)
      .filter((city): city is string => city !== null)
      .sort();
    return Array.from(new Set(cities));
  }, [comics]);

  const filteredComics = useMemo(() => {
    return comics.filter(comic => {
      const matchesSearch = comic.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesClass = selectedClass === 'all' || !selectedClass || comic.class === selectedClass;
      const matchesCity = selectedCity === 'all' || !selectedCity || comic.city === selectedCity;
      return matchesSearch && matchesClass && matchesCity;
    });
  }, [comics, searchQuery, selectedClass, selectedCity]);

  // Group comics by class
  const comicsByClass = useMemo(() => {
    const grouped = filteredComics.reduce((acc, comic) => {
      const comicClass = comic.class || 'Unclassified';
      if (!acc[comicClass]) {
        acc[comicClass] = [];
      }
      acc[comicClass].push(comic);
      return acc;
    }, {} as Record<string, ComicWithAvgTickets[]>);

    // Sort comics within each class
    Object.keys(grouped).forEach(classKey => {
      grouped[classKey].sort((a, b) => {
        if (sortBy === 'avgTickets') {
          return b.avgTicketsSold - a.avgTicketsSold;
        }
        return a.name.localeCompare(b.name);
      });
    });

    // Return classes in order: S, A, B, C, Unclassified
    const orderedClasses = ['S', 'A', 'B', 'C', 'Unclassified'];
    return orderedClasses.reduce((acc, classKey) => {
      if (grouped[classKey]?.length > 0) {
        acc[classKey] = grouped[classKey];
      }
      return acc;
    }, {} as Record<string, ComicWithAvgTickets[]>);
  }, [filteredComics, sortBy]);

  const handleComicUpdate = async () => {
    const updatedComics = await listComics();
    setComics(updatedComics);
  };

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Comics</h1>
        <AddComicDialog onComicAdded={handleComicUpdate}>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Comic
          </Button>
        </AddComicDialog>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="flex-1">
          <Input
            placeholder="Search by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-sm"
          />
        </div>
        <Select value={selectedCity || undefined} onValueChange={setSelectedCity}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by city" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Cities</SelectItem>
            {uniqueCities.map((city) => (
              <SelectItem key={city} value={city}>
                {city}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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
        <Select value={sortBy} onValueChange={(value: 'avgTickets' | 'name') => setSortBy(value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="avgTickets">Average Tickets Sold</SelectItem>
            <SelectItem value="name">Name</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-8">
        {Object.entries(comicsByClass).map(([classKey, classComics]) => (
          <div key={classKey} className="space-y-4">
            <div className="flex items-center gap-4">
              <h2 className="text-2xl font-semibold">
                Class {classKey}
              </h2>
              <div className="h-px flex-1 bg-border" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {classComics.map((comic) => (
                <ComicCard 
                  key={comic.id} 
                  comic={comic}
                  avgTicketsSold={comic.avgTicketsSold}
                  onComicUpdated={handleComicUpdate}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
