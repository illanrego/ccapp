import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { SelectComic } from "@/db/schema";
import { deleteComic } from "../actions/delete-comic.action";

interface ComicCardProps {
  comic: SelectComic;
}

export function ComicCard({ comic }: ComicCardProps) {
  return (
    <Card>
      <CardHeader className="relative">
        {comic.picUrl && (
          <img
            src={comic.picUrl}
            alt={comic.name}
            className="w-full h-48 object-cover rounded-t-lg"
          />
        )}
        <div className="absolute top-2 right-2">
          <form action={deleteComic}>
            <input type="hidden" name="id" value={comic.id} />
            <Button variant="destructive" size="icon">
              <Trash2 className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <h3 className="text-xl font-semibold mb-2">{comic.name}</h3>
        <div className="space-y-1 text-sm text-muted-foreground">
          <p>City: {comic.city || "Not specified"}</p>
          <p>Social Media Followers: {comic.socialMedia?.toLocaleString() || "Not specified"}</p>
          <p>Class: {comic.class || "Not specified"}</p>
          <p>Stage Time: {comic.time ? `${comic.time} minutes` : "Not specified"}</p>
        </div>
      </CardContent>
      <CardFooter>
        {/* We can add more actions here later if needed */}
      </CardFooter>
    </Card>
  );
} 