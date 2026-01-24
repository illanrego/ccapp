import { relations } from 'drizzle-orm';
import { pgTable, text, timestamp, uuid, serial, integer, date, pgEnum, primaryKey, decimal, time, boolean } from 'drizzle-orm/pg-core';

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
    freeTickets: integer('free_tickets').default(0), // New field to track free tickets
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

// Enum for stock item category
export const stockCategoryEnum = pgEnum('stock_category', [
    'cerveja',      // beer
    'vinho',        // wine
    'destilado',    // spirits
    'refrigerante', // soft drinks
    'agua',         // water
    'suco',         // juice
    'energetico',   // energy drinks
    'petisco',      // snacks
    'ingrediente',  // ingredients (for cocktails)
    'descartavel',  // disposables (cups, napkins)
    'outro'         // other
]);

// Enum for stock unit types
export const stockUnitEnum = pgEnum('stock_unit', [
    'unidade',  // unit (bottles, cans)
    'ml',       // milliliters
    'litro',    // liters
    'kg',       // kilograms
    'g',        // grams
    'pacote',   // package
    'caixa'     // box
]);

// Enum for transaction types
export const transactionTypeEnum = pgEnum('transaction_type', [
    'compra',       // purchase (increases stock)
    'venda',        // sale (decreases stock) - will be used by bar feature
    'ajuste',       // manual adjustment
    'perda',        // waste/loss
    'transferencia' // transfer
]);

// Stock items table (enhanced consumiveis)
export const stockItemsTable = pgTable('stock_items', {
    id: serial('id').primaryKey(),
    name: text('name').notNull(),
    category: stockCategoryEnum('category').notNull(),
    unit: stockUnitEnum('unit').notNull().default('unidade'),
    currentQuantity: decimal('current_quantity', { precision: 10, scale: 2 }).notNull().default('0'),
    minQuantity: decimal('min_quantity', { precision: 10, scale: 2 }).default('0'), // Alert threshold
    costPrice: decimal('cost_price', { precision: 10, scale: 2 }).notNull(), // Purchase cost per unit
    salePrice: decimal('sale_price', { precision: 10, scale: 2 }).notNull(), // Sale price per unit
    supplier: text('supplier'),
    barcode: text('barcode'),
    isActive: boolean('is_active').default(true).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type InsertStockItem = typeof stockItemsTable.$inferInsert;
export type SelectStockItem = typeof stockItemsTable.$inferSelect;

// Stock transactions table (for tracking all stock movements)
export const stockTransactionsTable = pgTable('stock_transactions', {
    id: serial('id').primaryKey(),
    itemId: integer('item_id').notNull().references(() => stockItemsTable.id, { onDelete: 'cascade' }),
    type: transactionTypeEnum('type').notNull(),
    quantity: decimal('quantity', { precision: 10, scale: 2 }).notNull(), // Positive for in, negative for out
    unitCost: decimal('unit_cost', { precision: 10, scale: 2 }), // Cost at time of transaction
    totalCost: decimal('total_cost', { precision: 10, scale: 2 }), // Total cost of transaction
    showId: integer('show_id').references(() => showsTable.id, { onDelete: 'set null' }), // Link to show for bar sales
    notes: text('notes'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type InsertStockTransaction = typeof stockTransactionsTable.$inferInsert;
export type SelectStockTransaction = typeof stockTransactionsTable.$inferSelect;

// Relations for stock
export const stockItemsRelations = relations(stockItemsTable, ({ many }) => ({
    transactions: many(stockTransactionsTable),
}));

export const stockTransactionsRelations = relations(stockTransactionsTable, ({ one }) => ({
    item: one(stockItemsTable, {
        fields: [stockTransactionsTable.itemId],
        references: [stockItemsTable.id],
    }),
    show: one(showsTable, {
        fields: [stockTransactionsTable.showId],
        references: [showsTable.id],
    }),
}));

// Junction table for Comics and Shows
export const comicsShowsTable = pgTable('comics_shows', {
    comicId: uuid('comic_id').notNull().references(() => comicsTable.id, { onDelete: 'cascade' }),
    showId: integer('show_id').notNull().references(() => showsTable.id, { onDelete: 'cascade' }),
    position: text('position'), // New field to track the comic's position in the lineup (headliner, opening act, middle, mc, etc.)
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