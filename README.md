# Natalie Makeup Artist Website

A modern, elegant website for a makeup artist business built with Next.js (App Router), TypeScript, and Supabase integration for image storage.

## Features

- Next.js 14 with App Router architecture
- TypeScript for type safety
- Responsive design with Tailwind CSS
- Image gallery with lightbox functionality
- Category filtering for gallery images
- Supabase integration for image storage and authentication
- Admin dashboard for image management

## Getting Started

### Prerequisites

- Node.js 16.x or later
- npm or yarn
- Supabase account (for image storage and authentication)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/simple-beauty-makeup.git
cd simple-beauty-makeup
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Create a `.env.local` file in the project root and add your Supabase credentials:
```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

4. Start the development server:
```bash
npm run dev
# or
yarn dev
```

5. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Supabase Setup

1. Create a new Supabase project
2. Create a storage bucket named `gallery-images` with public access
3. Set up authentication to allow email/password sign-in for the admin area
4. Create an admin user in the Authentication section of Supabase

## Project Structure

```
├── src/                  # Source directory
│   ├── app/              # Next.js App Router pages
│   │   ├── admin/        # Admin section
│   │   │   ├── gallery/  # Gallery management page
│   │   │   └── login/    # Admin login page
│   │   └── gallery/      # Public gallery page
│   ├── components/       # React components
│   │   ├── admin/        # Admin dashboard components
│   │   │   ├── GalleryManager.tsx
│   │   │   └── ImageUploader.tsx
│   │   ├── Footer.tsx
│   │   ├── Gallery.tsx   # Gallery component with lightbox
│   │   └── Navigation.tsx
│   ├── styles/           # CSS styles
│   │   └── globals.css   # Global styles with Tailwind
│   ├── types/            # TypeScript type definitions
│   │   └── index.ts
│   └── utils/            # Utility functions
│       └── supabase.ts   # Supabase client and helper functions
├── public/               # Static assets
│   └── images/           # Local images (fallback)
├── middleware.ts         # Next.js middleware for auth
├── tailwind.config.ts    # Tailwind CSS configuration
├── tsconfig.json         # TypeScript configuration
└── package.json          # Project dependencies
```

## Customization

### Colors

Edit the color scheme in the `tailwind.config.ts` file:

```typescript
colors: {
  'beauty-brown': '#a68674',
  'beauty-beige': '#f5f1ed',
  'beauty-gold': '#d4b88c',
},
```

### Fonts

The site uses Next.js Font Optimization for loading the following fonts:
- Montserrat (sans-serif)
- Playfair Display (serif)
- Great Vibes (script)

You can modify these in `src/app/layout.tsx`.

## Deployment

The site can be deployed to Vercel, Netlify, or any other Next.js-compatible hosting platform.

### Vercel Deployment

For the easiest deployment experience:

```bash
npm install -g vercel
vercel
```

### Environment Variables

Make sure to set the following environment variables on your deployment platform:

```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

## License

This project is licensed under the MIT License.