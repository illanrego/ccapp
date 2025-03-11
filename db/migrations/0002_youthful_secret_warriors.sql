ALTER TABLE "comics_dias" RENAME TO "comics_shows";--> statement-breakpoint
ALTER TABLE "dias" RENAME TO "shows";--> statement-breakpoint
ALTER TABLE "comics_shows" RENAME COLUMN "dia_id" TO "show_id";--> statement-breakpoint
ALTER TABLE "comics_shows" DROP CONSTRAINT "comics_dias_comic_id_comics_id_fk";
--> statement-breakpoint
ALTER TABLE "comics_shows" DROP CONSTRAINT "comics_dias_dia_id_dias_id_fk";
--> statement-breakpoint
ALTER TABLE "comics_shows" DROP CONSTRAINT "comics_dias_comic_id_dia_id_pk";--> statement-breakpoint
ALTER TABLE "comics_shows" ADD CONSTRAINT "comics_shows_comic_id_show_id_pk" PRIMARY KEY("comic_id","show_id");--> statement-breakpoint
ALTER TABLE "shows" ADD COLUMN "start_time" time;--> statement-breakpoint
ALTER TABLE "comics_shows" ADD CONSTRAINT "comics_shows_comic_id_comics_id_fk" FOREIGN KEY ("comic_id") REFERENCES "public"."comics"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comics_shows" ADD CONSTRAINT "comics_shows_show_id_shows_id_fk" FOREIGN KEY ("show_id") REFERENCES "public"."shows"("id") ON DELETE cascade ON UPDATE no action;