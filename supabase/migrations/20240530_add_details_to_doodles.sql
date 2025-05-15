-- Add a details column to the doodles table to store additional information
ALTER TABLE public.doodles
ADD COLUMN IF NOT EXISTS details JSONB DEFAULT NULL;

-- Update the database type definition
COMMENT ON COLUMN public.doodles.details IS 'Additional details for the doodle, such as original image URL, AI image URL, etc.';
