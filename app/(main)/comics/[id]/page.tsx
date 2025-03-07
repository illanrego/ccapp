import { notFound } from "next/navigation";
import { getComicWithDias } from "../actions/get-comic.action";
import { ArrowLeft, Calendar, MapPin, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import { SelectDia } from "@/db/schema";

interface ComicPageProps {
  params: {
    id: string;
  };
}

interface DiaWithComicDia extends SelectDia {
  comicDia: {
    comicId: string;
    diaId: number;
  };
}

export default async function ComicPage({ params }: ComicPageProps) {
  const comic = await getComicWithDias(params.id);

  if (!comic) {
    notFound();
  }

  return (
    <div className="container py-8">
      <div className="mb-6">
        <Link href="/comics">
          <Button variant="ghost" size="sm" className="gap-1">
            <ArrowLeft className="h-4 w-4" />
            Back to Comics
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left column - Image */}
        <div className="md:col-span-1">
          {comic.picUrl ? (
            <img
              src={comic.picUrl}
              alt={comic.name}
              className="w-full aspect-square object-cover rounded-lg shadow-md"
            />
          ) : (
            <div className="w-full aspect-square bg-muted rounded-lg flex items-center justify-center shadow-md">
              <Users className="h-24 w-24 text-muted-foreground" />
            </div>
          )}
        </div>

        {/* Right column - Info */}
        <div className="md:col-span-2">
          <div className="space-y-6">
            <div>
              <h1 className="text-4xl font-bold">{comic.name}</h1>
              <div className="flex flex-wrap gap-3 mt-3">
                {comic.class && (
                  <Badge variant="secondary" className="text-sm">
                    Classe {comic.class}
                  </Badge>
                )}
                {comic.city && (
                  <div className="flex items-center text-muted-foreground">
                    <MapPin className="h-4 w-4 mr-1" />
                    {comic.city}
                  </div>
                )}
                {comic.socialMedia && (
                  <div className="flex items-center text-muted-foreground">
                    <Users className="h-4 w-4 mr-1" />
                    {comic.socialMedia.toLocaleString()} seguidores
                  </div>
                )}
                {comic.time && (
                  <div className="flex items-center text-muted-foreground">
                    <Calendar className="h-4 w-4 mr-1" />
                    {comic.time} minutos
                  </div>
                )}
              </div>
            </div>

            {/* Dias Section */}
            <div className="mt-8">
              <h2 className="text-2xl font-bold mb-4">Histórico de Shows</h2>
              {comic.dias && comic.dias.length > 0 ? (
                <div className="space-y-4">
                  {comic.dias.map((dia: DiaWithComicDia) => (
                    <Card key={dia.id}>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">
                          {formatDate(dia.date)}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-sm text-muted-foreground">
                          {dia.showName && <p>Show: {dia.showName}</p>}
                          {dia.ticketsSold && <p>Ingressos Vendidos: {dia.ticketsSold}</p>}
                          {dia.showQuality && <p>Show Quality: {dia.showQuality}</p>}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">Sem shows</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
