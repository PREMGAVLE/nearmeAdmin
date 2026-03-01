// src/services/appSettingsService.ts नई फाइल बनाएं:

import apiClient from '@/lib/apiClient';

export interface AppSettings {
  premiumOverride: any;
  globalPremiumOverride: boolean;
  hideCategoryLeads: boolean;
}

export const appSettingsService = {
  // Get current settings
  getSettings: async (): Promise<AppSettings> => {
    const response = await apiClient.get('/admin/settings'); // "global-settings" को "settings" में बदलें
    return response.data.data;
  },
 
  // Toggle premium override
  togglePremiumOverride: async (status: boolean): Promise<AppSettings> => {
    const response = await apiClient.patch('/admin/toggle-premium', { status }); // "toggle-global-premium" को "toggle-premium" में बदलें
    return response.data;
  },
 
  // Toggle category leads visibility
  toggleCategoryLeads: async (hideCategoryLeads: boolean): Promise<AppSettings> => {
    const response = await apiClient.patch('/admin/toggle-category-leads', { hideCategoryLeads });
    return response.data;
  }
};