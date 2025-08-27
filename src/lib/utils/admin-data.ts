import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
);

// Mock data as fallback
export const MOCK_ADMIN_DATA = {
  bio: 'With over 10 years of experience in the beauty industry, I am dedicated to enhancing your natural beauty. My passion for makeup artistry began at a young age, and I have honed my skills through extensive training and hands-on experience. I specialize in creating timeless looks for brides, photo shoots, special events, quinceneras and everyday glamour that make you feel confident and beautiful.',
  bio_2: 'My commitment to excellence and attention to detail ensures that every client receives personalized service tailored to their unique features and preferences. Whether you\'re preparing for your wedding day, a special event, or just want to enhance your everyday look, I\'m here to help you feel your most beautiful self.',
  about_image_1: 'https://res.cloudinary.com/dzrlbq2wf/image/upload/v1746067204/IMG_2972_htx11w.jpg',
  about_image_2: 'https://res.cloudinary.com/dzrlbq2wf/image/upload/v1746067227/IMG_2974_t0paza.jpg',
  about_image_1_path: null,
  about_image_2_path: null,
  email: '4hisglorymakeup@gmail.com'
};

export interface AdminData {
  bio: string;
  bio_2?: string;
  about_image_1: string;
  about_image_2?: string;
  about_image_1_path?: string | null;
  about_image_2_path?: string | null;
  email: string;
}

/**
 * Fetches admin data specifically for the email "4hisglorymakeup@gmail.com" for public display
 * This ensures only the primary admin's data is shown on the website
 * Falls back to mock data if the specific user is not found or if there's an error
 */
export async function fetchAdminData(): Promise<AdminData> {
  try {
    console.log('Fetching admin data for 4hisglorymakeup@gmail.com...');
    
    // Use array query to handle multiple users with the same email
    const { data: allUsers, error: primaryError } = await supabase
      .from('admin_users')
      .select('bio, bio_2, about_image_1, about_image_2, about_image_1_path, about_image_2_path, email')
      .eq('email', '4hisglorymakeup@gmail.com');

    // Take the first user found with the specific email
    const primaryUser = allUsers && allUsers.length > 0 ? allUsers[0] : null;

    if (primaryUser && !primaryError) {
      console.log('Found primary user with specific email:', primaryUser.email);
      
      // Clean any extra quotes from the image URLs in case there is unclean data
      const cleanImage1 = primaryUser.about_image_1?.replace(/^["']|["']$/g, '') || MOCK_ADMIN_DATA.about_image_1;
      const cleanImage2 = primaryUser.about_image_2?.replace(/^["']|["']$/g, '') || MOCK_ADMIN_DATA.about_image_2;
      
      return {
        bio: primaryUser.bio || MOCK_ADMIN_DATA.bio,
        bio_2: primaryUser.bio_2 || MOCK_ADMIN_DATA.bio_2,
        about_image_1: cleanImage1,
        about_image_2: cleanImage2,
        about_image_1_path: primaryUser.about_image_1_path,
        about_image_2_path: primaryUser.about_image_2_path,
        email: primaryUser.email
      };
    } else {
      console.log('Primary user not found, using mock data');
      console.log('Primary error:', primaryError);
      return MOCK_ADMIN_DATA;
    }
  } catch (error) {
    console.error('Error fetching admin data:', error);
    console.log('Using mock data as fallback');
    return MOCK_ADMIN_DATA;
  }
}

/**
 * Fetches admin data for a specific user ID (for admin panel use)
 * This is used when an admin is logged in and managing their own data
 * Both bduran04@gmail.com and 4hisglorymakeup@gmail.com can access their own data in the admin panel
 */
export async function fetchAdminDataByUserId(userId: string): Promise<AdminData | null> {
  try {
    const { data: adminUsers, error } = await supabase
      .from('admin_users')
      .select('bio, bio_2, about_image_1, about_image_2, about_image_1_path, about_image_2_path, email')
      .eq('user_id', userId);

    const adminUser = adminUsers && adminUsers.length > 0 ? adminUsers[0] : null;

    if (error || !adminUser) {
      console.error('Error fetching admin data by user ID:', error);
      return null;
    }

    return {
      bio: adminUser.bio || '',
      bio_2: adminUser.bio_2 || '',
      about_image_1: adminUser.about_image_1 || '',
      about_image_2: adminUser.about_image_2 || '',
      about_image_1_path: adminUser.about_image_1_path,
      about_image_2_path: adminUser.about_image_2_path,
      email: adminUser.email
    };
  } catch (error) {
    console.error('Error fetching admin data by user ID:', error);
    return null;
  }
}
