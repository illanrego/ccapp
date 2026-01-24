-- Create stock category enum
DO $$ BEGIN
    CREATE TYPE "stock_category" AS ENUM('cerveja', 'vinho', 'destilado', 'refrigerante', 'agua', 'suco', 'energetico', 'petisco', 'ingrediente', 'descartavel', 'outro');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create stock unit enum
DO $$ BEGIN
    CREATE TYPE "stock_unit" AS ENUM('unidade', 'ml', 'litro', 'kg', 'g', 'pacote', 'caixa');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create transaction type enum
DO $$ BEGIN
    CREATE TYPE "transaction_type" AS ENUM('compra', 'venda', 'ajuste', 'perda', 'transferencia');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Drop old consumiveis table if it exists and has no data we need to preserve
DROP TABLE IF EXISTS "consumiveis";

-- Create stock_items table
CREATE TABLE IF NOT EXISTS "stock_items" (
    "id" serial PRIMARY KEY NOT NULL,
    "name" text NOT NULL,
    "category" "stock_category" NOT NULL,
    "unit" "stock_unit" NOT NULL DEFAULT 'unidade',
    "current_quantity" numeric(10, 2) NOT NULL DEFAULT '0',
    "min_quantity" numeric(10, 2) DEFAULT '0',
    "cost_price" numeric(10, 2) NOT NULL,
    "sale_price" numeric(10, 2) NOT NULL,
    "supplier" text,
    "barcode" text,
    "is_active" boolean NOT NULL DEFAULT true,
    "created_at" timestamp DEFAULT now() NOT NULL,
    "updated_at" timestamp DEFAULT now() NOT NULL
);

-- Create stock_transactions table
CREATE TABLE IF NOT EXISTS "stock_transactions" (
    "id" serial PRIMARY KEY NOT NULL,
    "item_id" integer NOT NULL,
    "type" "transaction_type" NOT NULL,
    "quantity" numeric(10, 2) NOT NULL,
    "unit_cost" numeric(10, 2),
    "total_cost" numeric(10, 2),
    "show_id" integer,
    "notes" text,
    "created_at" timestamp DEFAULT now() NOT NULL
);

-- Add foreign key constraints
DO $$ BEGIN
    ALTER TABLE "stock_transactions" ADD CONSTRAINT "stock_transactions_item_id_stock_items_id_fk" FOREIGN KEY ("item_id") REFERENCES "stock_items"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "stock_transactions" ADD CONSTRAINT "stock_transactions_show_id_shows_id_fk" FOREIGN KEY ("show_id") REFERENCES "shows"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

