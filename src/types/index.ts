export interface NavLink {
    name: string;
    path: string;
  }
  
  export interface GalleryImage {
    src: string;
    alt?: string;
    category?: string;
  }
  
  export interface TestimonialProps {
    stars: number;
    quote: string;
    author: string;
    role: string;
  }
  
  export interface ServiceCardProps {
    title: string;
    description: string;
    linkPath: string;
    linkText?: string;
  }