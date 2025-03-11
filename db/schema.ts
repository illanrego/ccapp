import { relations } from 'drizzle-orm';
import { pgTable, text, timestamp, uuid, serial, integer, date, numeric, pgEnum, primaryKey, decimal, time, boolean } from 'drizzle-orm/pg-core';

export const usersTable = pgTable('users_table', {
    id: text('id').primaryKey(),
    email: text('email').notNull().unique(),
    passwordHash: text('password_hash').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type InsertUser = typeof usersTable.$inferInsert;
export type SelectUser = typeof usersTable.$inferSelect;

export const sessionTable = pgTable("session", {
    id: text("id").primaryKey(),
    userId: text("user_id")
        .notNull()
        .references(() => usersTable.id),
    expiresAt: timestamp("expires_at", {
        withTimezone: true,
        mode: "date"
    }).notNull()
});

export type InsertSession = typeof sessionTable.$inferInsert;
export type SelectSession = typeof sessionTable.$inferSelect;

// New tables for the comedy club app

// Enum for comic class
export const comicClassEnum = pgEnum('comic_class', ['A', 'B', 'C', 'S']);

// Shows table (renamed from diasTable)
export const showsTable = pgTable('shows', {
    id: serial('id').primaryKey(),
    date: date('date').notNull(),
    startTime: time('start_time'), // New field to differentiate shows on the same date
    showName: text('show_name'),
    ticketsSold: integer('tickets_sold'),
    ticketsRevenue: decimal('tickets_revenue', { precision: 10, scale: 2 }),
    barRevenue: decimal('bar_revenue', { precision: 10, scale: 2 }),
    showQuality: text('show_quality'),
    isFiftyFifty: boolean('is_fifty_fifty').default(false), // New field to indicate if revenue is split 50/50
});

export type InsertShow = typeof showsTable.$inferInsert;
export type SelectShow = typeof showsTable.$inferSelect;

// Comics table
export const comicsTable = pgTable('comics', {
    id: uuid('id').defaultRandom().primaryKey(),
    name: text('name').notNull(),
    picUrl: text('pic_url'),
    city: text('city'),
    socialMedia: integer('social_media'),
    class: comicClassEnum('class'),
    time: integer('time'),
});

export type InsertComic = typeof comicsTable.$inferInsert;
export type SelectComic = typeof comicsTable.$inferSelect;

// Consumiveis (Consumables) table
export const consumiveisTable = pgTable('consumiveis', {
    id: serial('id').primaryKey(),
    item: text('item').notNull(),
    type: text('type'),
    quantity: integer('quantity'),
    lastBuy: date('last_buy'),
    cost: numeric('cost'),
    value: numeric('value'),
    // Revenue margin will be calculated in the application logic
});

export type InsertConsumivel = typeof consumiveisTable.$inferInsert;
export type SelectConsumivel = typeof consumiveisTable.$inferSelect;

// Junction table for Comics and Shows
export const comicsShowsTable = pgTable('comics_shows', {
    comicId: uuid('comic_id').notNull().references(() => comicsTable.id, { onDelete: 'cascade' }),
    showId: integer('show_id').notNull().references(() => showsTable.id, { onDelete: 'cascade' }),
}, (table) => {
    return {
        pk: primaryKey({ columns: [table.comicId, table.showId] }),
    };
});

export type InsertComicShow = typeof comicsShowsTable.$inferInsert;
export type SelectComicShow = typeof comicsShowsTable.$inferSelect;

// Relations
export const showsRelations = relations(showsTable, ({ many }) => ({
    comicsShows: many(comicsShowsTable),
}));

export const comicsRelations = relations(comicsTable, ({ many }) => ({
    comicsShows: many(comicsShowsTable),
}));

export const comicsShowsRelations = relations(comicsShowsTable, ({ one }) => ({
    comic: one(comicsTable, {
        fields: [comicsShowsTable.comicId],
        references: [comicsTable.id],
    }),
    show: one(showsTable, {
        fields: [comicsShowsTable.showId],
        references: [showsTable.id],
    }),
}));