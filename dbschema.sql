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