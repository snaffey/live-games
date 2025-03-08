import { supabase } from './supabase';

interface ProfileUpdateData {
  display_name?: string;
  avatar_url?: string;
  // Add more profile fields as needed
}

/**
 * Updates a user's profile metadata in Supabase
 * @param userId The user's ID
 * @param profileData The profile data to update
 * @returns Object containing data and error properties
 */
export async function updateUserProfile(userId: string, profileData: ProfileUpdateData) {
  try {
    const { data, error } = await supabase.auth.updateUser({
      data: profileData
    });

    if (error) {
      console.error('Error updating user profile:', error);
    }

    return { data, error };
  } catch (error) {
    console.error('Unexpected error in updateUserProfile:', error);
    return { 
      data: null, 
      error: error instanceof Error ? error : new Error(String(error)) 
    };
  }
}

/**
 * Uploads a profile avatar image to Supabase storage
 * @param userId The user's ID
 * @param file The image file to upload
 * @returns The URL of the uploaded image or null if there was an error
 */
export async function uploadProfileAvatar(userId: string, file: File) {
  try {
    // Create a unique file path for the avatar
    const filePath = `avatars/${userId}/${Date.now()}-${file.name}`;
    
    // Upload the file to Supabase storage
    const { data, error } = await supabase.storage
      .from('user-avatars')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (error) {
      console.error('Error uploading avatar:', error);
      return null;
    }

    // Get the public URL for the uploaded file
    const { data: { publicUrl } } = supabase.storage
      .from('user-avatars')
      .getPublicUrl(data.path);

    return publicUrl;
  } catch (error) {
    console.error('Unexpected error in uploadProfileAvatar:', error);
    return null;
  }
}