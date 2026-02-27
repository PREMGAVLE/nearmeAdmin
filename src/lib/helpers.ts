import type { User, Business, Category } from '@/types';

// Helper functions to get names by ID
// These will be used to display names in components while the actual data comes from API

export function getCategoryName(categories: Category[], categoryId: string | any): string {
  // If categoryId is already an object with name property (populated from backend)
  if (categoryId && typeof categoryId === 'object' && categoryId.name) {
    return categoryId.name;
  }
  
  // If categoryId is a string ID, look it up in the categories array
  if (typeof categoryId === 'string') {
    if (!Array.isArray(categories)) return categoryId;
    return categories.find(c => c._id === categoryId)?.name || categoryId;
  }
  
  // Fallback
  return categoryId || 'Unknown';
}

export function getUserName(users: User[], id: string): string {
  return users.find(u => u._id === id)?.name || id;
}

export function getBusinessName(businesses: Business[], id: string): string {
  return businesses.find(b => b._id === id)?.businessName || id;
}

export function getBusinessById(businesses: Business[], id: string): Business | undefined {
  return businesses.find(b => b._id === id);
}

export function getUserById(users: User[], id: string): User | undefined {
  return users.find(u => u._id === id);
}
