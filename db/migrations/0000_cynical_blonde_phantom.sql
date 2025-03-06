CREATE TYPE "public"."comic_class" AS ENUM('A', 'B', 'C', 'S');--> statement-breakpoint
CREATE TABLE "comics_dias" (
	"comic_id" uuid NOT NULL,
	"dia_id" integer NOT NULL,
	CONSTRAINT "comics_dias_comic_id_dia_id_pk" PRIMARY KEY("comic_id","dia_id")
);
--> statement-breakpoint
CREATE TABLE "comics" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"pic_url" text,
	"city" text,
	"social_media" integer,
	"class" "comic_class",
	"time" integer
);
--> statement-breakpoint
CREATE TABLE "consumiveis" (
	"id" serial PRIMARY KEY NOT NULL,
	"item" text NOT NULL,
	"type" text,
	"quantity" integer,
	"last_buy" date,
	"cost" numeric,
	"value" numeric
);
--> statement-breakpoint
CREATE TABLE "dias" (
	"id" serial PRIMARY KEY NOT NULL,
	"date" date NOT NULL,
	"show_name" text,
	"tickets_sold" integer,
	"tickets_revenue" numeric,
	"bar_revenue" numeric,
	"show_quality" text
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users_table" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_table_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "comics_dias" ADD CONSTRAINT "comics_dias_comic_id_comics_id_fk" FOREIGN KEY ("comic_id") REFERENCES "public"."comics"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comics_dias" ADD CONSTRAINT "comics_dias_dia_id_dias_id_fk" FOREIGN KEY ("dia_id") REFERENCES "public"."dias"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_users_table_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users_table"("id") ON DELETE no action ON UPDATE no action;