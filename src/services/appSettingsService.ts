import apiClient from '@/lib/apiClient';

export interface AppSettings {
  premiumOverride: boolean;
  hideCategoryLeads: boolean;
  premiumEnabled: boolean;  
  premiumPrice: number;     
  premiumDuration: number;  
  maxBusinessPerUser: number;
}

export const appSettingsService = {
  // Get current settings
  getSettings: async (): Promise<AppSettings> => {
    const response = await apiClient.get('/app-settings');
    return response.data.data;
  },
 
  // Toggle premium override (existing)
  togglePremiumOverride: async (status: boolean): Promise<AppSettings> => {
    const response = await apiClient.patch('/app-settings/toggle-premium');
    return response.data.data;
  },
 
  // Toggle category leads visibility (existing)
  toggleCategoryLeads: async (hideCategoryLeads: boolean): Promise<AppSettings> => {
    const response = await apiClient.patch('/app-settings', { hideCategoryLeads });
    return response.data.data;
  },

  // NEW: Update all settings
  updateSettings: async (settings: Partial<AppSettings>): Promise<AppSettings> => {
    const response = await apiClient.patch('/app-settings', settings);
    return response.data.data;
  }
};