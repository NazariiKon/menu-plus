ALTER TABLE public.venues 
RENAME COLUMN owner_id TO owner_id_old;

ALTER TABLE public.venues 
ADD COLUMN owner_id UUID;

UPDATE public.venues 
SET owner_id = owner_id_old 
WHERE owner_id_old IS NOT NULL;

ALTER TABLE public.venues 
ADD CONSTRAINT venues_owner_id_fkey 
FOREIGN KEY (owner_id) REFERENCES auth.users(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_venues_owner_id ON public.venues(owner_id);

ALTER TABLE public.venues 
ALTER COLUMN owner_id SET NOT NULL;

ALTER TABLE public.venues DROP COLUMN owner_id_old;
