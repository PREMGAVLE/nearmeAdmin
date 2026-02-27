import { useState } from 'react';
import { Settings, Bell, Shield, Globe, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function SettingsPage() {
  const { toast } = useToast();
  const [platformName, setPlatformName] = useState('nearmeb2b.city');
  const [supportEmail, setSupportEmail] = useState('support@nearmeb2b.city');
  const [autoApprove, setAutoApprove] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [defaultCurrency, setDefaultCurrency] = useState('INR');
  const [defaultListingType, setDefaultListingType] = useState('normal');
  const [saving, setSaving] = useState(false);

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      toast({ title: 'Settings Saved', description: 'Platform settings have been updated.' });
    }, 800);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-xl sm:text-2xl font-bold text-foreground">System Settings</h1>
        <p className="text-sm text-muted-foreground">Configure platform settings and preferences</p>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <div className="overflow-x-auto -mx-3 px-3 sm:mx-0 sm:px-0">
          <TabsList className="bg-muted w-full sm:w-auto">
            <TabsTrigger value="general" className="gap-2 text-xs sm:text-sm"><Globe className="h-4 w-4" /> <span className="hidden sm:inline">General</span></TabsTrigger>
            <TabsTrigger value="notifications" className="gap-2 text-xs sm:text-sm"><Bell className="h-4 w-4" /> <span className="hidden sm:inline">Notifications</span></TabsTrigger>
            <TabsTrigger value="business" className="gap-2 text-xs sm:text-sm"><Shield className="h-4 w-4" /> <span className="hidden sm:inline">Business Rules</span></TabsTrigger>
          </TabsList>
        </div>

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
