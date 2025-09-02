-- Update the category check constraint to include 'landing'
ALTER TABLE public.poupeja_settings 
DROP CONSTRAINT poupeja_settings_category_check;

ALTER TABLE public.poupeja_settings 
ADD CONSTRAINT poupeja_settings_category_check 
CHECK (category = ANY (ARRAY['branding'::text, 'stripe'::text, 'pricing'::text, 'contact'::text, 'system'::text, 'landing'::text]));