-- migrations/20260201012546_add_order_items_items_rel.sql

-- Добавляем Foreign Key constraint для product_id → items.id
ALTER TABLE public.order_items 
ADD CONSTRAINT order_items_product_id_fkey 
FOREIGN KEY (product_id) REFERENCES public.items(id) 
ON DELETE RESTRICT;

CREATE INDEX IF NOT EXISTS idx_order_items_product_id 
ON public.order_items (product_id);

ANALYZE public.order_items;

COMMENT ON CONSTRAINT order_items_product_id_fkey ON public.order_items 
IS 'Foreign key to items table - links order item to menu item';

COMMENT ON INDEX idx_order_items_product_id 
IS 'Index for fast lookups by item_id in order_items';
