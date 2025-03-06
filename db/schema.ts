import { relations } from 'drizzle-orm';
import { pgTable, text, timestamp, uuid, serial, integer, date, numeric, pgEnum, primaryKey } from 'drizzle-orm/pg-core';

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

// Dias (Days/Shows) table
export const diasTable = pgTable('dias', {
    id: serial('id').primaryKey(),
    date: date('date').notNull(),
    showName: text('show_name'),
    ticketsSold: integer('tickets_sold'),
    ticketsRevenue: numeric('tickets_revenue'),
    barRevenue: numeric('bar_revenue'),
    showQuality: text('show_quality'),
});

export type InsertDia = typeof diasTable.$inferInsert;
export type SelectDia = typeof diasTable.$inferSelect;

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

// Junction table for Comics and Dias
export const comicsDiasTable = pgTable('comics_dias', {
    comicId: uuid('comic_id').notNull().references(() => comicsTable.id, { onDelete: 'cascade' }),
    diaId: integer('dia_id').notNull().references(() => diasTable.id, { onDelete: 'cascade' }),
}, (table) => {
    return {
        pk: primaryKey({ columns: [table.comicId, table.diaId] }),
    };
});

export type InsertComicDia = typeof comicsDiasTable.$inferInsert;
export type SelectComicDia = typeof comicsDiasTable.$inferSelect;

// Relations
export const diasRelations = relations(diasTable, ({ many }) => ({
    comicsDias: many(comicsDiasTable),
}));

export const comicsRelations = relations(comicsTable, ({ many }) => ({
    comicsDias: many(comicsDiasTable),
}));

export const comicsDiasRelations = relations(comicsDiasTable, ({ one }) => ({
    comic: one(comicsTable, {
        fields: [comicsDiasTable.comicId],
        references: [comicsTable.id],
    }),
    dia: one(diasTable, {
        fields: [comicsDiasTable.diaId],
        references: [diasTable.id],
    }),
}));