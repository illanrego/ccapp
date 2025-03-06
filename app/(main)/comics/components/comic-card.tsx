import { Card, CardContent } from "@/components/ui/card";
import { SelectComic } from "@/db/schema";
import { Users, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { AddComicDialog } from "./add-comic-dialog";

interface ComicCardProps {
  comic: SelectComic;
  onComicUpdated?: () => void;
}

export function ComicCard({ comic, onComicUpdated }: ComicCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Card 
      className="overflow-hidden relative group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardContent className="p-6 flex gap-6">
        <div className="relative shrink-0">
          {comic.picUrl ? (
            <img
              src={comic.picUrl}
              alt={comic.name}
              className="w-24 h-24 object-cover rounded-lg"
            />
          ) : (
            <div className="w-24 h-24 rounded-lg bg-muted flex items-center justify-center">
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
          )}
        </div>
        <div className="flex-1">
          <h3 className="text-2xl font-bold tracking-tight mb-2">{comic.name}</h3>
          <div className="flex items-center gap-3 mb-3">
            {comic.class && (
              <div className="inline-block px-2 py-1 rounded-md bg-primary/10 text-primary text-sm font-medium">
                Class {comic.class}
              </div>
            )}
            {comic.city && (
              <span className="text-sm text-muted-foreground">
                {comic.city}
              </span>
            )}
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            <Users className="h-4 w-4 mr-1" />
            {comic.socialMedia?.toLocaleString() || "No followers"}
          </div>
        </div>
      </CardContent>
      
      <div className={`absolute top-2 right-2 transition-opacity duration-200 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
        <AddComicDialog 
          comic={comic} 
          onComicAdded={onComicUpdated}
          mode="edit"
        >
          <Button size="icon" variant="ghost">
            <Pencil className="h-4 w-4" />
          </Button>
        </AddComicDialog>
      </div>
    </Card>
  );
} 