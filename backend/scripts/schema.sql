-- DB schema helper for local/dev
-- Run this manually in Supabase SQL editor or via the provided apply script.

-- Ensure pgcrypto for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Categories
CREATE TABLE IF NOT EXISTS public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  slug text,
  created_at timestamptz DEFAULT now()
);

-- Brands
CREATE TABLE IF NOT EXISTS public.brands (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  slug text,
  created_at timestamptz DEFAULT now()
);

-- Reviews
CREATE TABLE IF NOT EXISTS public.reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL,
  user_id uuid,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  body text,
  created_at timestamptz DEFAULT now()
);

-- Add FK constraints if products/categories/brands exist
DO $$
BEGIN
  -- Only attempt to add FK if both tables and the product_id column exist
  IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'reviews')
     AND EXISTS (SELECT 1 FROM pg_class WHERE relname = 'products') THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_constraint WHERE conname = 'reviews_product_id_fkey'
    ) THEN
      IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'reviews' AND column_name = 'product_id'
      ) THEN
        ALTER TABLE public.reviews
          ADD CONSTRAINT reviews_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;
      END IF;
    END IF;
  END IF;
END$$;

-- Ensure products has category_id, brand_id, rating columns
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS category_id uuid;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS brand_id uuid;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS rating numeric(3,1);

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'products') THEN
    -- category_id FK only if the column exists
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'products_category_id_fkey') THEN
      IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'products' AND column_name = 'category_id'
      ) THEN
        BEGIN
          ALTER TABLE public.products
            ADD CONSTRAINT products_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id) ON DELETE SET NULL;
        EXCEPTION WHEN others THEN
          -- ignore
        END;
      END IF;
    END IF;

    -- brand_id FK only if the column exists
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'products_brand_id_fkey') THEN
      IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'products' AND column_name = 'brand_id'
      ) THEN
        BEGIN
          ALTER TABLE public.products
            ADD CONSTRAINT products_brand_id_fkey FOREIGN KEY (brand_id) REFERENCES public.brands(id) ON DELETE SET NULL;
        EXCEPTION WHEN others THEN
          -- ignore
        END;
      END IF;
    END IF;
  END IF;
END$$;

-- Add body/rating columns to reviews if missing (safe additive)
ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS body text;
ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS rating integer;
