// src/pages/super-admin/Settings.tsx को इससे रिप्लेस करें:

import { useState, useEffect } from 'react';
import { Settings, Bell, Shield, Globe, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { appSettingsService, type AppSettings } from '@/services/appSettingsService';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export default function SettingsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // App Settings state
  const [platformName, setPlatformName] = useState('nearmeb2b.city');
  const [supportEmail, setSupportEmail] = useState('support@nearmeb2b.city');
  const [autoApprove, setAutoApprove] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [defaultCurrency, setDefaultCurrency] = useState('INR');
  const [defaultListingType, setDefaultListingType] = useState('normal');
  const [saving, setSaving] = useState(false);

  // Fetch app settings from backend
  const { data: appSettings, isLoading: settingsLoading } = useQuery({
    queryKey: ['appSettings'],
    queryFn: appSettingsService.getSettings,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Toggle premium override mutation
  const togglePremiumMutation = useMutation({
    mutationFn: appSettingsService.togglePremiumOverride,
    onSuccess: (data) => {
      queryClient.setQueryData(['appSettings'], data);
      toast({
        title: 'Premium Mode Updated',
        description: data.premiumOverride
          ? 'Global Premium Mode ENABLED - All users now have premium access'
          : 'Global Premium Mode DISABLED - Normal premium logic restored'
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update premium mode',
        variant: 'destructive'
      });
    }
  });

  // Toggle category leads mutation
  const toggleCategoryLeadsMutation = useMutation({
    mutationFn: appSettingsService.toggleCategoryLeads,
    onSuccess: (data) => {
      queryClient.setQueryData(['appSettings'], data);
      toast({
        title: 'Category Leads Updated',
        description: data.hideCategoryLeads
          ? 'Category leads are now HIDDEN - Only premium businesses can see them'
          : 'Category leads are now VISIBLE - All businesses can see them'
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update category leads visibility',
        variant: 'destructive'
      });
    }
  });

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      toast({ title: 'Settings Saved', description: 'Platform settings have been updated.' });
    }, 800);
  };

  const currentSettings = appSettings || {
    premiumOverride: false,  // "globalPremiumOverride" को "premiumOverride" में बदलें
    hideCategoryLeads: false
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-xl sm:text-2xl font-bold text-foreground">System Settings</h1>
        <p className="text-sm text-muted-foreground">Configure platform settings and preferences</p>
      </div>

      <Tabs defaultValue="app-settings" className="space-y-6">
        <div className="overflow-x-auto -mx-3 px-3 sm:mx-0 sm:px-0">
          <TabsList className="bg-muted w-full sm:w-auto">
            <TabsTrigger value="app-settings" className="gap-2 text-xs sm:text-sm">
              <Shield className="h-4 w-4" /> <span className="hidden sm:inline">App Settings</span>
            </TabsTrigger>
            <TabsTrigger value="general" className="gap-2 text-xs sm:text-sm">
              <Globe className="h-4 w-4" /> <span className="hidden sm:inline">General</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-2 text-xs sm:text-sm">
              <Bell className="h-4 w-4" /> <span className="hidden sm:inline">Notifications</span>
            </TabsTrigger>
            <TabsTrigger value="business" className="gap-2 text-xs sm:text-sm">
              <Settings className="h-4 w-4" /> <span className="hidden sm:inline">Business Rules</span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* NEW APP SETTINGS TAB */}
        <TabsContent value="app-settings">
          <div className="rounded-xl border bg-card card-shadow p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-semibold text-foreground">Application Settings</h3>
              {settingsLoading && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
              )}
            </div>

            <div className="space-y-6">
              {/* Premium Override Toggle */}
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-1">
                  <p className="font-medium text-foreground">Global Premium Mode</p>
                  <p className="text-sm text-muted-foreground">
                    Enable to give all users premium access regardless of their subscription status
                  </p>
                  {currentSettings.premiumOverride && (  // "globalPremiumOverride" को "premiumOverride" में बदलें
  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
    Currently Active
  </span>
)}
                </div>
                <Switch
                  checked={currentSettings.premiumOverride}  // "globalPremiumOverride" को "premiumOverride" में बदलें
                  onCheckedChange={(checked) => togglePremiumMutation.mutate(checked)}
                  disabled={togglePremiumMutation.isPending}
                />
              </div>

              {/* Category Leads Visibility Toggle */}
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-1">
                  <p className="font-medium text-foreground">Hide Category Leads</p>
                  <p className="text-sm text-muted-foreground">
                    When enabled, category leads will only be visible to premium businesses
                  </p>
                  {currentSettings.hideCategoryLeads && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                      Currently Active
                    </span>
                  )}
                </div>
                <Switch
                  checked={currentSettings.hideCategoryLeads}
                  onCheckedChange={(checked) => toggleCategoryLeadsMutation.mutate(checked)}
                  disabled={toggleCategoryLeadsMutation.isPending}
                />
              </div>

              {/* Current Status Display */}
              <div className="bg-muted/50 rounded-lg p-4">
                <h4 className="font-medium text-foreground mb-3">Current System Status</h4>
                <div className="grid gap-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Premium Mode:</span>
                    <span className={`font-medium ${currentSettings.premiumOverride ? 'text-green-600' : 'text-gray-600'}`}>
                      {currentSettings.premiumOverride ? 'ENABLED' : 'DISABLED'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Category Leads:</span>
                    <span className={`font-medium ${currentSettings.hideCategoryLeads ? 'text-orange-600' : 'text-green-600'}`}>
                      {currentSettings.hideCategoryLeads ? 'HIDDEN (Premium Only)' : 'VISIBLE (All Users)'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Existing tabs remain the same... */}
        <TabsContent value="general">
          <div className="rounded-xl border bg-card card-shadow p-6 space-y-6">
            <h3 className="font-display font-semibold text-foreground">General Settings</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Platform Name</Label>
                <Input value={platformName} onChange={e => setPlatformName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Support Email</Label>
                <Input type="email" value={supportEmail} onChange={e => setSupportEmail(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Default Currency</Label>
                <Select value={defaultCurrency} onValueChange={setDefaultCurrency}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="INR">INR (₹)</SelectItem>
                    <SelectItem value="USD">USD ($)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button onClick={handleSave} className="gradient-primary text-primary-foreground" disabled={saving}>
              {saving ? 'Saving...' : 'Save Settings'}
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="notifications">
          <div className="rounded-xl border bg-card card-shadow p-6 space-y-6">
            <h3 className="font-display font-semibold text-foreground">Notification Preferences</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <p className="font-medium text-foreground">Email Notifications</p>
                  <p className="text-sm text-muted-foreground">Receive email alerts for new businesses and approvals</p>
                </div>
                <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} />
              </div>
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <p className="font-medium text-foreground">SMS Notifications</p>
                  <p className="text-sm text-muted-foreground">Get SMS alerts for urgent actions</p>
                </div>
                <Switch checked={smsNotifications} onCheckedChange={setSmsNotifications} />
              </div>
            </div>
            <Button onClick={handleSave} className="gradient-primary text-primary-foreground" disabled={saving}>
              {saving ? 'Saving...' : 'Save Preferences'}
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="business">
          <div className="rounded-xl border bg-card card-shadow p-6 space-y-6">
            <h3 className="font-display font-semibold text-foreground">Business Rules</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <p className="font-medium text-foreground">Auto-Approve Businesses</p>
                  <p className="text-sm text-muted-foreground">Automatically approve new business listings (not recommended)</p>
                </div>
                <Switch checked={autoApprove} onCheckedChange={setAutoApprove} />
              </div>
              <div className="space-y-2">
                <Label>Default Listing Type</Label>
                <Select value={defaultListingType} onValueChange={setDefaultListingType}>
                  <SelectTrigger className="max-w-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal">Normal (Free)</SelectItem>
                    <SelectItem value="premium">Premium (Paid)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button onClick={handleSave} className="gradient-primary text-primary-foreground" disabled={saving}>
              {saving ? 'Saving...' : 'Save Rules'}
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}