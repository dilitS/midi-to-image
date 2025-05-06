// Local storage for saving generated images with expiry
export type SavedImage = {
  id: string;
  imageUrl: string;
  prompt: string;
  style: string;
  timestamp: number; // Unix timestamp
  name?: string;
  notes?: string[]; // Optional array of notes used
};

const STORAGE_KEY = 'midi-to-image:gallery';
const EXPIRY_DAYS = 3; // Images expire after 3 days

/**
 * Save an image to local storage
 */
export const saveImage = (image: Omit<SavedImage, 'id' | 'timestamp'>) => {
  try {
    // Get existing images
    const existingImages = getImages();
    
    // Create new image object with ID and timestamp
    const newImage: SavedImage = {
      ...image,
      id: generateId(),
      timestamp: Date.now(),
    };
    
    // Add to existing images
    const updatedImages = [newImage, ...existingImages];
    
    // Save back to local storage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedImages));
    
    return newImage;
  } catch (error) {
    console.error('Error saving image to local storage:', error);
    return null;
  }
};

/**
 * Get all images from local storage, removing any expired ones
 */
export const getImages = (): SavedImage[] => {
  try {
    // Get from local storage
    const imageData = localStorage.getItem(STORAGE_KEY);
    if (!imageData) return [];
    
    const images: SavedImage[] = JSON.parse(imageData);
    
    // Filter out expired images
    const now = Date.now();
    const expiryTime = EXPIRY_DAYS * 24 * 60 * 60 * 1000; // in milliseconds
    const validImages = images.filter(image => {
      const age = now - image.timestamp;
      return age < expiryTime;
    });
    
    // If we filtered out any expired images, update storage
    if (validImages.length !== images.length) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(validImages));
    }
    
    return validImages;
  } catch (error) {
    console.error('Error getting images from local storage:', error);
    return [];
  }
};

/**
 * Delete an image from local storage
 */
export const deleteImage = (id: string): boolean => {
  try {
    const images = getImages();
    const updatedImages = images.filter(image => image.id !== id);
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedImages));
    return true;
  } catch (error) {
    console.error('Error deleting image from local storage:', error);
    return false;
  }
};

/**
 * Clear all images from local storage
 */
export const clearImages = (): boolean => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch (error) {
    console.error('Error clearing images from local storage:', error);
    return false;
  }
};

/**
 * Generate a random ID for an image
 */
const generateId = (): string => {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}; 