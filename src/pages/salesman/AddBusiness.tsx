import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCategories } from '@/services/categoryService';
import { useCreateBusiness } from '@/services/businessService';
import { useCreateUser } from '@/services/userService';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Building2, UserPlus, CheckCircle } from 'lucide-react';
import type { BusinessType } from '@/types';

export default function AddBusiness() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [step, setStep] = useState<1 | 2>(1);
  const [ownerId, setOwnerId] = useState('');

  // Step 1: Owner form (full backend fields)
  const [ownerData, setOwnerData] = useState({
    name: '', mobile: '', email: '', city: '', categoryPreference: '',
    subscriptionStatus: 'none' as 'active' | 'expired' | 'none',
    planType: '', startDate: '', expiryDate: '',
  });
  const createOwnerMutation = useCreateUser();

  // Step 2: Business form (backend-accurate nested fields)
  const [businessData, setBusinessData] = useState({
    businessName: '', categoryId: '',
    contactNumbers: { primary: '', whatsapp: '' },
    address: { street: '', city: 'Burhanpur', state: 'Madhya Pradesh', pincode: '450331' },
    listingType: 'normal' as 'normal' | 'premium',
    businessType: 'leads' as BusinessType,
    serviceArea: '', description: '',
    paymentDetails: { amount: 0, paymentMode: 'cash' as 'cash' | 'upi', paymentNote: '' },
  });
  const createBusinessMutation = useCreateBusiness();
  const { data: categoriesData } = useCategories();

  const handleCreateOwner = async (e: React.FormEvent) => {
    e.preventDefault();
    const subscription = ownerData.subscriptionStatus === 'active'
      ? { status: 'active' as const, planType: ownerData.planType, startDate: ownerData.startDate, expiryDate: ownerData.expiryDate }
      : { status: ownerData.subscriptionStatus as 'none' | 'expired' };
    createOwnerMutation.mutate(
      { name: ownerData.name, mobile: ownerData.mobile, email: ownerData.email, role: 'owner', city: ownerData.city, categoryPreference: ownerData.categoryPreference, subscription, acceptTerms: true },
      {
        onSuccess: (newUser) => {
          toast({ title: 'Owner Created', description: `${newUser.name} has been created` });
          setOwnerId(newUser._id);
          setStep(2);
        },
        onError: (err: any) => toast({ title: 'Error', description: err?.response?.data?.message || 'Failed to create owner', variant: 'destructive' }),
      }
    );
  };

  const handleCreateBusiness = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...businessData,
      ownerId,
      createdBy: user?._id || 'usr_s1',
      paymentDetails: { ...businessData.paymentDetails, paymentStatus: 'pending' as const, paymentDate: new Date().toISOString() },
    };
    createBusinessMutation.mutate(payload, {
      onSuccess: () => {
        toast({ title: 'Business Submitted', description: 'The business has been submitted for review. Status: Pending' });
        setStep(1);
        setOwnerId('');
        setOwnerData({ name: '', mobile: '', email: '', city: '', categoryPreference: '', subscriptionStatus: 'none', planType: '', startDate: '', expiryDate: '' });
        setBusinessData({
          businessName: '', categoryId: '',
          contactNumbers: { primary: '', whatsapp: '' },
          address: { street: '', city: 'Burhanpur', state: 'Madhya Pradesh', pincode: '450331' },
          listingType: 'normal', businessType: 'leads', serviceArea: '', description: '',
          paymentDetails: { amount: 0, paymentMode: 'cash', paymentNote: '' },
        });
      },
      onError: (err: any) => toast({ title: 'Error', description: err?.response?.data?.message || 'Failed to create business', variant: 'destructive' }),
    });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4 sm:space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-xl sm:text-2xl font-bold text-foreground">Add New Business</h1>
        <p className="text-sm text-muted-foreground">Step {step} of 2 — {step === 1 ? 'Create Owner' : 'Business Details'}</p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2 sm:gap-4">
        <div className={`flex items-center gap-1.5 sm:gap-2 rounded-lg px-2.5 sm:px-4 py-2 text-xs sm:text-sm font-medium ${step >= 1 ? 'gradient-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
          {step > 1 ? <CheckCircle className="h-4 w-4" /> : <span className="h-5 w-5 rounded-full bg-primary-foreground/20 flex items-center justify-center text-xs">1</span>}
          <span className="hidden sm:inline">Create Owner</span><span className="sm:hidden">Owner</span>
        </div>
        <div className="h-px flex-1 bg-border" />
        <div className={`flex items-center gap-1.5 sm:gap-2 rounded-lg px-2.5 sm:px-4 py-2 text-xs sm:text-sm font-medium ${step === 2 ? 'gradient-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
          <span className="h-5 w-5 rounded-full bg-primary-foreground/20 flex items-center justify-center text-xs">2</span>
          <span className="hidden sm:inline">Add Business</span><span className="sm:hidden">Business</span>
        </div>
      </div>

      {step === 1 ? (
        <form onSubmit={handleCreateOwner} className="rounded-xl border bg-card card-shadow p-6 space-y-5">
          <div className="flex items-center gap-3 pb-4 border-b border-border">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg gradient-primary">
              <UserPlus className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h3 className="font-display font-semibold text-foreground">Step 1: Create Owner/User</h3>
              <p className="text-xs text-muted-foreground">Create the business owner with full profile (role auto = owner)</p>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label>Name *</Label>
              <Input value={ownerData.name} onChange={e => setOwnerData(p => ({ ...p, name: e.target.value }))} required maxLength={100} />
            </div>
            <div className="space-y-2">
              <Label>Mobile *</Label>
              <Input type="tel" value={ownerData.mobile} onChange={e => setOwnerData(p => ({ ...p, mobile: e.target.value }))} required maxLength={10} placeholder="10 digit mobile" />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" value={ownerData.email} onChange={e => setOwnerData(p => ({ ...p, email: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>City</Label>
              <Input value={ownerData.city} onChange={e => setOwnerData(p => ({ ...p, city: e.target.value }))} placeholder="e.g. Burhanpur" />
            </div>
            <div className="space-y-2">
              <Label>Business Category Preference</Label>
              <Select value={ownerData.categoryPreference} onValueChange={v => setOwnerData(p => ({ ...p, categoryPreference: v }))}>
                <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>
                  {categoriesData?.data?.map(c => <SelectItem key={c._id} value={c._id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="border-t border-border pt-5">
            <h4 className="font-semibold text-foreground mb-4">Subscription Details</h4>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Subscription Status</Label>
                <Select value={ownerData.subscriptionStatus} onValueChange={(v: 'active' | 'expired' | 'none') => setOwnerData(p => ({ ...p, subscriptionStatus: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Inactive</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {ownerData.subscriptionStatus === 'active' && (
                <>
                  <div className="space-y-2">
                    <Label>Plan Type</Label>
                    <Select value={ownerData.planType} onValueChange={v => setOwnerData(p => ({ ...p, planType: v }))}>
                      <SelectTrigger><SelectValue placeholder="Select plan" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="quarterly">Quarterly</SelectItem>
                        <SelectItem value="yearly">Yearly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Start Date</Label>
                    <Input type="date" value={ownerData.startDate} onChange={e => setOwnerData(p => ({ ...p, startDate: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label>Expiry Date</Label>
                    <Input type="date" value={ownerData.expiryDate} onChange={e => setOwnerData(p => ({ ...p, expiryDate: e.target.value }))} />
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button type="submit" className="gradient-primary text-primary-foreground px-8" disabled={createOwnerMutation.isPending}>
              {createOwnerMutation.isPending ? 'Creating...' : 'Create Owner & Continue'}
            </Button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleCreateBusiness} className="rounded-xl border bg-card card-shadow p-6 space-y-5">
          <div className="flex items-center gap-3 pb-4 border-b border-border">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg gradient-primary">
              <Building2 className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h3 className="font-display font-semibold text-foreground">Step 2: Business Details</h3>
              <p className="text-xs text-muted-foreground">createdBy = {user?.name} (auto) • approvalStatus = pending • isVisible = false</p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label>Business Name *</Label>
              <Input value={businessData.businessName} onChange={e => setBusinessData(p => ({ ...p, businessName: e.target.value }))} required maxLength={100} />
            </div>
            <div className="space-y-2">
              <Label>Category *</Label>
              <Select value={businessData.categoryId} onValueChange={v => setBusinessData(p => ({ ...p, categoryId: v }))}>
                <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>
                  {categoriesData?.data?.map(c => <SelectItem key={c._id} value={c._id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Business Type *</Label>
              <Select value={businessData.businessType} onValueChange={(v: BusinessType) => setBusinessData(p => ({ ...p, businessType: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="leads">Leads Only</SelectItem>
                  <SelectItem value="booking">Booking Only</SelectItem>
                  <SelectItem value="hybrid">Hybrid (Leads + Booking)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Contact Numbers */}
          <div className="border-t border-border pt-5">
            <h4 className="font-semibold text-foreground mb-4">Contact Numbers</h4>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Primary Phone *</Label>
                <Input type="tel" value={businessData.contactNumbers.primary} onChange={e => setBusinessData(p => ({ ...p, contactNumbers: { ...p.contactNumbers, primary: e.target.value } }))} required maxLength={10} />
              </div>
              <div className="space-y-2">
                <Label>WhatsApp</Label>
                <Input type="tel" value={businessData.contactNumbers.whatsapp} onChange={e => setBusinessData(p => ({ ...p, contactNumbers: { ...p.contactNumbers, whatsapp: e.target.value } }))} maxLength={10} />
              </div>
            </div>
          </div>

          {/* Address */}
          <div className="border-t border-border pt-5">
            <h4 className="font-semibold text-foreground mb-4">Address</h4>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label>Street *</Label>
                <Input value={businessData.address.street} onChange={e => setBusinessData(p => ({ ...p, address: { ...p.address, street: e.target.value } }))} required maxLength={200} />
              </div>
              <div className="space-y-2">
                <Label>City *</Label>
                <Input value={businessData.address.city} onChange={e => setBusinessData(p => ({ ...p, address: { ...p.address, city: e.target.value } }))} required />
              </div>
              <div className="space-y-2">
                <Label>State *</Label>
                <Input value={businessData.address.state} onChange={e => setBusinessData(p => ({ ...p, address: { ...p.address, state: e.target.value } }))} required />
              </div>
              <div className="space-y-2">
                <Label>Pincode *</Label>
                <Input value={businessData.address.pincode} onChange={e => setBusinessData(p => ({ ...p, address: { ...p.address, pincode: e.target.value } }))} required maxLength={6} />
              </div>
            </div>
          </div>

          {/* Extra details */}
          <div className="border-t border-border pt-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label>Service Area</Label>
                <Input value={businessData.serviceArea} onChange={e => setBusinessData(p => ({ ...p, serviceArea: e.target.value }))} placeholder="e.g. Burhanpur City" maxLength={200} />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Description</Label>
                <Textarea value={businessData.description} onChange={e => setBusinessData(p => ({ ...p, description: e.target.value }))} placeholder="Brief description of the business" maxLength={500} />
              </div>
            </div>
          </div>

          {/* Listing & Payment */}
          <div className="border-t border-border pt-5">
            <h4 className="font-semibold text-foreground mb-4">Listing & Payment</h4>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Listing Type *</Label>
                <Select value={businessData.listingType} onValueChange={(v: 'normal' | 'premium') => setBusinessData(p => ({ ...p, listingType: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal">Normal (Free)</SelectItem>
                    <SelectItem value="premium">Premium (Paid)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Payment Mode</Label>
                <Select value={businessData.paymentDetails.paymentMode} onValueChange={(v: 'cash' | 'upi') => setBusinessData(p => ({ ...p, paymentDetails: { ...p.paymentDetails, paymentMode: v } }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="upi">UPI</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Amount Collected (₹)</Label>
                <Input type="number" value={businessData.paymentDetails.amount} onChange={e => setBusinessData(p => ({ ...p, paymentDetails: { ...p.paymentDetails, amount: Number(e.target.value) } }))} min={0} />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Payment Note</Label>
                <Textarea value={businessData.paymentDetails.paymentNote} onChange={e => setBusinessData(p => ({ ...p, paymentDetails: { ...p.paymentDetails, paymentNote: e.target.value } }))} maxLength={500} />
              </div>
            </div>
          </div>

          <div className="flex justify-between pt-2">
            <Button type="button" variant="outline" onClick={() => setStep(1)}>Back</Button>
            <Button type="submit" className="gradient-primary text-primary-foreground px-8" disabled={createBusinessMutation.isPending}>
              {createBusinessMutation.isPending ? 'Submitting...' : 'Submit Business'}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
