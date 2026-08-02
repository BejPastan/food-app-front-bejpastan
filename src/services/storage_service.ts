import { STORAGE_KEYS } from '../constants/Routes';

// Storage service abstraction
export class StorageService {
  private static instance: StorageService;

  private constructor() {
    // Private constructor for singleton pattern
  }

  public static getInstance(): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService();
    }
    return StorageService.instance;
  }

  /**
   * Set a string value in local storage
   */
  async setItem(key: string, value: string): Promise<void> {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      //console.error('Failed to store data:', error);
      //throw new Error('Storage operation failed');
    }
  }

  /**
   * Get a string value from local storage
   */
  async getItem(key: string): Promise<string | null> {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      //console.error('Failed to retrieve data:', error);
      return null;
    }
  }

  /**
   * Delete a value from local storage
   */
  async deleteItem(key: string): Promise<void> {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.log('Failed to delete data:', error);
    }
  }

  /**
   * Clear all stored data
   */
  async clear(): Promise<void> {
    try {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
      localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    } catch (error) {
      console.error('Failed to clear storage:', error);
    }
  }
}

// Export singleton instance
export const storageService = StorageService.getInstance();