# Natalie Makeup Artist Website

A modern, elegant website for a makeup artist business built with Next.js and TypeScript. Features a responsive design, image gallery with Supabase storage integration, and an admin dashboard for content management.

## Features

- Responsive design with Tailwind CSS
- Image gallery with lightbox functionality
- Category filtering for gallery images
- Supabase integration for image storage
- Admin dashboard for image management
- TypeScript for type safety

## Getting Started

### Prerequisites

- Node.js 14.x or later
- npm or yarn
- Supabase account (for image storage)

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
├── components/            # React components
│   ├── admin/             # Admin dashboard components
│   │   ├── GalleryManager.tsx
│   │   └── ImageUploader.tsx
│   ├── Footer.tsx
│   ├── Gallery.tsx        # Gallery component with lightbox
│   ├── Layout.tsx
│   └── Navbar.tsx
├── pages/                 # Next.js pages
│   ├── admin/             # Admin pages
│   │   ├── gallery.tsx    # Gallery management page
│   │   └── login.tsx      # Admin login page
│   ├── _app.tsx           # App component
│   ├── gallery.tsx        # Public gallery page
│   └── index.tsx          # Homepage
├── public/                # Static assets
│   └── images/            # Local images (fallback)
├── styles/                # CSS styles
│   └── globals.css        # Global styles with Tailwind
├── types/                 # TypeScript type definitions
│   └── index.ts
├── utils/                 # Utility functions
│   └── supabase.ts        # Supabase client and helper functions
├── .env.local.example     # Example environment variables
├── tailwind.config.ts     # Tailwind CSS configuration
├── tsconfig.json          # TypeScript configuration
└── package.json           # Project dependencies
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

Edit the font configuration in the `tailwind.config.ts` file:

```typescript
fontFamily: {
  'sans': ['Montserrat', 'sans-serif'],
  'serif': ['Playfair Display', 'serif'],
  'script': ['Great Vibes', 'cursive'],
},
```

## Deployment

The site can be deployed to Vercel, Netlify, or any other Next.js-compatible hosting platform.

### Vercel Deployment

```bash
npm install -g vercel
vercel
```

### Static Export

```bash
npm run build
npm run export
```

The static export will be in the `out` directory, which can be deployed to any static hosting service.

## License

This project is licensed under the MIT License.