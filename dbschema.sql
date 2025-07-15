create table public.images (
  id uuid not null default extensions.uuid_generate_v4 (),
  title text not null,
  image_url text not null,
  alt_text text not null,
  category public.image_category not null,
  created_at timestamp with time zone null default now(),
  constraint images_pkey primary key (id)
) TABLESPACE pg_default;

create table public.faqs (
  id uuid not null default extensions.uuid_generate_v4 (),
  question text not null,
  answer text not null,
  category text not null,
  display_order integer null default 0,
  created_at timestamp with time zone null default now(),
  constraint faqs_pkey primary key (id)
) TABLESPACE pg_default;

create index IF not exists faqs_category_idx on public.faqs using btree (category) TABLESPACE pg_default;

create table public.services (
  id uuid not null default extensions.uuid_generate_v4 (),
  title text not null,
  description text not null,
  price numeric(10, 2) not null,
  duration integer not null,
  category public.service_category not null,
  image_url text null,
  featured boolean null default false,
  created_at timestamp with time zone null default now(),
  constraint services_pkey primary key (id)
) TABLESPACE pg_default;

create index IF not exists services_category_idx on public.services using btree (category) TABLESPACE pg_default;

-- Create admin_users table
CREATE TABLE public.admin_users (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  email text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  bio text NULL,
  about_image_1 text NULL,
  about_image_2 text NULL,
  CONSTRAINT admin_users_pkey PRIMARY KEY (id),
  CONSTRAINT admin_users_user_id_key UNIQUE (user_id),
  CONSTRAINT admin_users_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users (id)
) TABLESPACE pg_default;

-- 1. First, check if the bucket already exists
SELECT * FROM storage.buckets WHERE id = 'portfolio-images';

-- 2. Create the storage bucket (run this if the bucket doesn't exist)
INSERT INTO storage.buckets (id, name, public)
VALUES ('portfolio-images', 'portfolio-images', true)
ON CONFLICT (id) DO NOTHING;

-- 3. Verify the bucket was created
SELECT * FROM storage.buckets WHERE id = 'portfolio-images';

-- 4. Set up storage policies for authenticated uploads
CREATE POLICY "Allow authenticated users to upload images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'portfolio-images' 
  AND auth.role() = 'authenticated'
);

-- 5. Allow public access to view images
CREATE POLICY "Allow public access to view images" ON storage.objects
FOR SELECT USING (bucket_id = 'portfolio-images');

-- 6. Allow authenticated users to delete images (for admin management)
CREATE POLICY "Allow authenticated users to delete images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'portfolio-images' 
  AND auth.role() = 'authenticated'
);

-- 7. Allow authenticated users to update images
CREATE POLICY "Allow authenticated users to update images" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'portfolio-images' 
  AND auth.role() = 'authenticated'
);

-- 8. Verify policies were created
SELECT * FROM storage.policies WHERE bucket_id = 'portfolio-images';

-- 1. Check what storage-related tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'storage';

-- 2. Check if storage schema exists
SELECT schema_name 
FROM information_schema.schemata 
WHERE schema_name = 'storage';

-- 3. Check storage buckets table specifically
SELECT * FROM storage.buckets LIMIT 5;

-- 4. Check if the storage extension is enabled
SELECT * FROM pg_extension WHERE extname = 'storage';

-- 5. Alternative way to check policies (if they exist in a different location)
SELECT schemaname, tablename 
FROM pg_tables 
WHERE tablename LIKE '%polic%';

-- 6. Check what storage functions are available
SELECT routine_name, routine_type
FROM information_schema.routines 
WHERE routine_schema = 'storage'
ORDER BY routine_name;

-- 1. First, let's check the current structure of your images table
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'images' 
AND table_schema = 'public';

-- 2. Add the image_path column (if it doesn't exist)
ALTER TABLE public.images 
ADD COLUMN IF NOT EXISTS image_path text;

-- 3. Make image_url nullable since we might use image_path instead
ALTER TABLE public.images 
ALTER COLUMN image_url DROP NOT NULL;

-- 4. Verify the changes
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'images' 
AND table_schema = 'public'
ORDER BY ordinal_position;