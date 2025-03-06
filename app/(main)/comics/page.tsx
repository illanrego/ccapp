import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { listComics } from "./actions/list-comics.action";
import { ComicCard } from "./components/comic-card";
import { AddComicDialog } from "./components/add-comic-dialog";

export default async function ComicsPage() {
  const comics = await listComics();

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Comics</h1>
        <AddComicDialog>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Comic
          </Button>
        </AddComicDialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {comics.map((comic) => (
          <ComicCard key={comic.id} comic={comic} />
        ))}
      </div>
    </div>
  );
}
