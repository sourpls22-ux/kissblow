// Utility functions for managing likes in localStorage (for unauthenticated users)

const LIKES_STORAGE_KEY = 'kissblow_likes';

export interface LikedProfile {
  profile_id: number;
  liked_at: string;
}

/**
 * Get all liked profile IDs from localStorage
 */
export function getLikedProfilesFromStorage(): number[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem(LIKES_STORAGE_KEY);
    if (!stored) return [];
    
    const likes: LikedProfile[] = JSON.parse(stored);
    return likes.map(like => like.profile_id);
  } catch (error) {
    console.error('Error reading likes from localStorage:', error);
    return [];
  }
}

/**
 * Check if a profile is liked (from localStorage)
 */
export function isProfileLiked(profileId: number): boolean {
  const likedProfiles = getLikedProfilesFromStorage();
  return likedProfiles.includes(profileId);
}

/**
 * Add a profile to likes in localStorage
 */
export function addLikeToStorage(profileId: number): void {
  if (typeof window === 'undefined') return;
  
  try {
    const stored = localStorage.getItem(LIKES_STORAGE_KEY);
    const likes: LikedProfile[] = stored ? JSON.parse(stored) : [];
    
    // Check if already liked
    if (likes.some(like => like.profile_id === profileId)) {
      return;
    }
    
    likes.push({
      profile_id: profileId,
      liked_at: new Date().toISOString(),
    });
    
    localStorage.setItem(LIKES_STORAGE_KEY, JSON.stringify(likes));
  } catch (error) {
    console.error('Error adding like to localStorage:', error);
  }
}

/**
 * Remove a profile from likes in localStorage
 */
export function removeLikeFromStorage(profileId: number): void {
  if (typeof window === 'undefined') return;
  
  try {
    const stored = localStorage.getItem(LIKES_STORAGE_KEY);
    if (!stored) return;
    
    const likes: LikedProfile[] = JSON.parse(stored);
    const filtered = likes.filter(like => like.profile_id !== profileId);
    
    localStorage.setItem(LIKES_STORAGE_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Error removing like from localStorage:', error);
  }
}

/**
 * Clear all likes from localStorage
 */
export function clearLikesFromStorage(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(LIKES_STORAGE_KEY);
}

/**
 * Get all liked profiles data from localStorage
 */
export function getAllLikedProfilesFromStorage(): LikedProfile[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem(LIKES_STORAGE_KEY);
    if (!stored) return [];
    
    return JSON.parse(stored);
  } catch (error) {
    console.error('Error reading likes from localStorage:', error);
    return [];
  }
}


