export interface NavLink {
    name: string;
    path: string;
  }
  
export interface GalleryImage {
  id: string;
  title: string;
  category: string;
  image_url?: string;
  image_path?: string;
  alt_text: string;
  created_at: string;
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