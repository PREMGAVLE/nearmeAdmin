import { useEffect, useState } from 'react';
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
import { useSearchParams, useNavigate } from 'react-router-dom';

export default function AddBusiness() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [step, setStep] = useState<1 | 2>(1);
  const [ownerId, setOwnerId] = useState('');
const [searchParams] = useSearchParams();
const navigate = useNavigate();
const userIdFromUrl = searchParams.get('userId');
 useEffect(() => {
  if (userIdFromUrl) {
    setOwnerId(userIdFromUrl);
    // User details fetch karke ownerData auto-fill karo
    // User fetch API call karna hoga
    setStep(2); // Direct business form pe le jao
  }
}, [userIdFromUrl]);
  // Step 1: Owner form (complete backend fields)
  const [ownerData, setOwnerData] = useState({
    name: '',
    mobile: '',
    email: '',
    password: '',
    address: '',
    city: '',
    categoryPreference: '',
    subscriptionStatus: 'none' as 'active' | 'expired' | 'none',
    planType: '',
    startDate: '',
    expiryDate: '',
    notes: ''
  });
  const createOwnerMutation = useCreateUser();

  // Step 2: Business form (complete backend fields)
  const [businessData, setBusinessData] = useState({
    businessName: '',
    categoryId: '',
    businessType: 'LEAD' as 'LEAD' | 'BOOKING' | 'HYBRID',
    contactNumbers: {
      primary: '',
      whatsapp: '',
      alternate: ''
    },
    contactPersonName: '',
    email: '',
    address: {
      street: '',
      landmark: '',
      area: '',
      city: 'Burhanpur',
      state: 'Madhya Pradesh',
      pincode: '450331'
    },
    listingType: 'normal' as 'normal' | 'premium',
    serviceArea: '',
    description: '',
    openingTime: '',
    closingTime: '',
    serviceDays: [] as string[],
    charges: 0,
    socialLinks: {
      instagram: '',
      facebook: '',
      whatsapp: ''
    },
    paymentDetails: {
      amount: 0,
      paymentMode: 'cash' as 'cash' | 'upi' | 'online',
      paymentNote: '',
      paymentStatus: 'pending' as 'pending' | 'received' | 'verified',
      paymentDate: new Date().toISOString()
    },
  });
  const createBusinessMutation = useCreateBusiness();
  const { data: categoriesData } = useCategories();

  const handleCreateOwner = async (e: React.FormEvent) => {
    e.preventDefault();

    // Build subscription object based on status
    // const subscription = ownerData.subscriptionStatus === 'active'
    //   ? {
    //     status: 'active' as const,
    //     planType: ownerData.planType,
    //     startDate: ownerData.startDate,
    //     expiryDate: ownerData.expiryDate
    //   }
    //   : { status: ownerData.subscriptionStatus as 'none' | 'expired' };

    createOwnerMutation.mutate(
      {
        name: ownerData.name,
        mobile: ownerData.mobile,
        email: ownerData.email,
        password: ownerData.password,
        role: 'owner',
        address: ownerData.address,
        city: ownerData.city,
        // categoryPreference: ownerData.categoryPreference,
        // subscription,
        acceptTerms: true,
        notes: ownerData.notes
      } as any,
      {
        onSuccess: (newUser) => {
          toast({ title: 'Owner Created', description: `${newUser.name} has been created successfully` });
          setOwnerId(newUser._id);
          setStep(2);
        },
        onError: (err: any) => toast({
          title: 'Error',
          description: err?.response?.data?.message || 'Failed to create owner',
          variant: 'destructive'
        }),
      }
    );
  };

  const handleCreateBusiness = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      ...businessData,
      ownerId,
      createdBy: user?._id,
      approvalStatus: 'pending' as const,
    };

    createBusinessMutation.mutate(payload, {
      onSuccess: () => {
        toast({
          title: 'Business Submitted',
          description: 'The business has been submitted for review. Status: Pending'
        });
        // Reset form
        setStep(1);
        setOwnerId('');
        setOwnerData({
          name: '', mobile: '', email: '', password: '', address: '', city: '',
          categoryPreference: '', subscriptionStatus: 'none', planType: '',
          startDate: '', expiryDate: '', notes: ''
        });
        setBusinessData({
          businessName: '', categoryId: '', businessType: 'LEAD',
          contactNumbers: { primary: '', whatsapp: '', alternate: '' },
          contactPersonName: '', email: '',
          address: { street: '', landmark: '', area: '', city: 'Burhanpur', state: 'Madhya Pradesh', pincode: '450331' },
          listingType: 'normal', serviceArea: '', description: '',
          openingTime: '', closingTime: '', serviceDays: [], charges: 0,
          socialLinks: { instagram: '', facebook: '', whatsapp: '' },
          paymentDetails: { amount: 0, paymentMode: 'cash', paymentNote: '', paymentStatus: 'pending', paymentDate: new Date().toISOString() },
        });
      },
      onError: (err: any) => toast({
        title: 'Error',
        description: err?.response?.data?.message || 'Failed to create business',
        variant: 'destructive'
      }),
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6 animate-fade-in">
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
              <p className="text-xs text-muted-foreground">Create the business owner with complete profile</p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="owner-name">Full Name *</Label>
              <Input
                id="owner-name"
                value={ownerData.name}
                onChange={e => setOwnerData(p => ({ ...p, name: e.target.value }))}
                required
                maxLength={100}
                placeholder="Enter full name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="owner-mobile">Mobile Number *</Label>
              <Input
                id="owner-mobile"
                type="tel"
                value={ownerData.mobile}
                onChange={e => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                  setOwnerData(p => ({ ...p, mobile: value }));
                }}
                required
                maxLength={10}
                placeholder="10 digit mobile"
                pattern="\d{10}"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="owner-email">Email Address</Label>
              <Input
                id="owner-email"
                type="email"
                value={ownerData.email}
                onChange={e => setOwnerData(p => ({ ...p, email: e.target.value }))}
                placeholder="email@example.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="owner-password">Password *</Label>
              <Input
                id="owner-password"
                type="password"
                value={ownerData.password}
                onChange={e => setOwnerData(p => ({ ...p, password: e.target.value }))}
                required
                minLength={8}
                placeholder="Min 8 characters"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="owner-city">City</Label>
              <Input
                id="owner-city"
                value={ownerData.city}
                onChange={e => setOwnerData(p => ({ ...p, city: e.target.value }))}
                placeholder="e.g. Burhanpur"
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="owner-address">Address</Label>
              <Textarea
                id="owner-address"
                value={ownerData.address}
                onChange={e => setOwnerData(p => ({ ...p, address: e.target.value }))}
                placeholder="Complete address"
                rows={2}
              />
            </div>

            {/* <div className="space-y-2">
              <Label htmlFor="category-preference">Business Category Preference</Label>
              <Select value={ownerData.categoryPreference} onValueChange={v => setOwnerData(p => ({ ...p, categoryPreference: v }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categoriesData?.data?.map(c => <SelectItem key={c._id} value={c._id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div> */}

            {/* <div className="space-y-2">
              <Label>Subscription Status</Label>
              <Select value={ownerData.subscriptionStatus} onValueChange={(v: any) => setOwnerData(p => ({ ...p, subscriptionStatus: v }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Subscription</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                </SelectContent>
              </Select>
            </div> */}

            {ownerData.subscriptionStatus === 'active' && (
              <>
                <div className="space-y-2">
                  <Label>Plan Type</Label>
                  <Input
                    value={ownerData.planType}
                    onChange={e => setOwnerData(p => ({ ...p, planType: e.target.value }))}
                    placeholder="e.g. Premium"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Input
                    type="date"
                    value={ownerData.startDate}
                    onChange={e => setOwnerData(p => ({ ...p, startDate: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Expiry Date</Label>
                  <Input
                    type="date"
                    value={ownerData.expiryDate}
                    onChange={e => setOwnerData(p => ({ ...p, expiryDate: e.target.value }))}
                  />
                </div>
              </>
            )}

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="owner-notes">Notes</Label>
              <Textarea
                id="owner-notes"
                value={ownerData.notes}
                onChange={e => setOwnerData(p => ({ ...p, notes: e.target.value }))}
                placeholder="Additional notes about the owner"
                rows={2}
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full gradient-primary text-primary-foreground"
            disabled={createOwnerMutation.isPending}
          >
            {createOwnerMutation.isPending ? 'Creating Owner...' : 'Create Owner & Continue'}
          </Button>
        </form>
      ) : (
        <form onSubmit={handleCreateBusiness} className="rounded-xl border bg-card card-shadow p-6 space-y-5">
          <div className="flex items-center gap-3 pb-4 border-b border-border">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg gradient-primary">
              <Building2 className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h3 className="font-display font-semibold text-foreground">Step 2: Business Details</h3>
              <p className="text-xs text-muted-foreground">Complete business information for {ownerData.name}</p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="business-name">Business Name *</Label>
              <Input
                id="business-name"
                value={businessData.businessName}
                onChange={e => setBusinessData(p => ({ ...p, businessName: e.target.value }))}
                required
                maxLength={120}
                placeholder="Enter business name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="business-category">Business Category *</Label>
              <Select value={businessData.categoryId} onValueChange={v => setBusinessData(p => ({ ...p, categoryId: v }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categoriesData?.items?.map(c => <SelectItem key={c._id} value={c._id}>{c.name}</SelectItem>)}

                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="business-type">Business Type *</Label>
              <Select value={businessData.businessType} onValueChange={(v: any) => setBusinessData(p => ({ ...p, businessType: v }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LEAD">Lead Generation</SelectItem>
                  <SelectItem value="BOOKING">Booking System</SelectItem>
                  <SelectItem value="HYBRID">Hybrid (Lead + Booking)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="primary-mobile">Primary Mobile *</Label>
              <Input
                id="primary-mobile"
                type="tel"
                value={businessData.contactNumbers.primary}
                onChange={e => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                  setBusinessData(p => ({
                    ...p,
                    contactNumbers: { ...p.contactNumbers, primary: value }
                  }));
                }}
                required
                maxLength={10}
                placeholder="10 digit mobile"
                pattern="\d{10}"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="whatsapp-mobile">WhatsApp Mobile</Label>
              <Input
                id="whatsapp-mobile"
                type="tel"
                value={businessData.contactNumbers.whatsapp}
                onChange={e => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                  setBusinessData(p => ({
                    ...p,
                    contactNumbers: { ...p.contactNumbers, whatsapp: value }
                  }));
                }}
                maxLength={10}
                placeholder="10 digit mobile (optional)"
                pattern="\d{10}"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="alternate-mobile">Alternate Mobile</Label>
              <Input
                id="alternate-mobile"
                type="tel"
                value={businessData.contactNumbers.alternate}
                onChange={e => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                  setBusinessData(p => ({
                    ...p,
                    contactNumbers: { ...p.contactNumbers, alternate: value }
                  }));
                }}
                maxLength={10}
                placeholder="10 digit mobile (optional)"
                pattern="\d{10}"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact-person">Contact Person Name</Label>
              <Input
                id="contact-person"
                value={businessData.contactPersonName}
                onChange={e => setBusinessData(p => ({ ...p, contactPersonName: e.target.value }))}
                maxLength={80}
                placeholder="Contact person name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="business-email">Business Email</Label>
              <Input
                id="business-email"
                type="email"
                value={businessData.email}
                onChange={e => setBusinessData(p => ({ ...p, email: e.target.value }))}
                placeholder="business@example.com"
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label>Business Address *</Label>
              <div className="grid gap-2 sm:grid-cols-2">
                <Input
                  placeholder="Street Address"
                  value={businessData.address.street}
                  onChange={e => setBusinessData(p => ({
                    ...p,
                    address: { ...p.address, street: e.target.value }
                  }))}
                />
                <Input
                  placeholder="Landmark"
                  value={businessData.address.landmark}
                  onChange={e => setBusinessData(p => ({
                    ...p,
                    address: { ...p.address, landmark: e.target.value }
                  }))}
                />
                <Input
                  placeholder="Area"
                  value={businessData.address.area}
                  onChange={e => setBusinessData(p => ({
                    ...p,
                    address: { ...p.address, area: e.target.value }
                  }))}
                />
                <Input
                  placeholder="City"
                  value={businessData.address.city}
                  onChange={e => setBusinessData(p => ({
                    ...p,
                    address: { ...p.address, city: e.target.value }
                  }))}
                />
                <Input
                  placeholder="State"
                  value={businessData.address.state}
                  onChange={e => setBusinessData(p => ({
                    ...p,
                    address: { ...p.address, state: e.target.value }
                  }))}
                />
                <Input
                  placeholder="Pincode *"
                  value={businessData.address.pincode}
                  onChange={e => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                    setBusinessData(p => ({
                      ...p,
                      address: { ...p.address, pincode: value }
                    }));
                  }}
                  maxLength={6}
                  pattern="\d{6}"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="opening-time">Opening Time</Label>
              <Input
                id="opening-time"
                type="time"
                value={businessData.openingTime}
                onChange={e => setBusinessData(p => ({ ...p, openingTime: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="closing-time">Closing Time</Label>
              <Input
                id="closing-time"
                type="time"
                value={businessData.closingTime}
                onChange={e => setBusinessData(p => ({ ...p, closingTime: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label>Service Days</Label>
              <div className="grid grid-cols-4 gap-2">
                {['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'].map(day => (
                  <label key={day} className="flex items-center space-x-2 text-sm">
                    <input
                      type="checkbox"
                      checked={businessData.serviceDays.includes(day)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setBusinessData(p => ({
                            ...p,
                            serviceDays: [...p.serviceDays, day]
                          }));
                        } else {
                          setBusinessData(p => ({
                            ...p,
                            serviceDays: p.serviceDays.filter(d => d !== day)
                          }));
                        }
                      }}
                      className="rounded"
                    />
                    <span className="capitalize">{day}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="charges">Service Charges</Label>
              <Input
                id="charges"
                type="number"
                value={businessData.charges}
                onChange={e => setBusinessData(p => ({ ...p, charges: Number(e.target.value) }))}
                placeholder="0"
                min={0}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="listing-type">Listing Type</Label>
              <Select value={businessData.listingType} onValueChange={(v: any) => setBusinessData(p => ({ ...p, listingType: v }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">Normal Listing</SelectItem>
                  <SelectItem value="premium">Premium Listing</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="service-area">Service Area</Label>
              <Input
                id="service-area"
                value={businessData.serviceArea}
                onChange={e => setBusinessData(p => ({ ...p, serviceArea: e.target.value }))}
                placeholder="Areas you serve"
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="description">Business Description</Label>
              <Textarea
                id="description"
                value={businessData.description}
                onChange={e => setBusinessData(p => ({ ...p, description: e.target.value }))}
                placeholder="Describe your business..."
                rows={3}
                maxLength={2000}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="instagram">Instagram</Label>
              <Input
                id="instagram"
                value={businessData.socialLinks.instagram}
                onChange={e => setBusinessData(p => ({
                  ...p,
                  socialLinks: { ...p.socialLinks, instagram: e.target.value }
                }))}
                placeholder="Instagram handle"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="facebook">Facebook</Label>
              <Input
                id="facebook"
                value={businessData.socialLinks.facebook}
                onChange={e => setBusinessData(p => ({
                  ...p,
                  socialLinks: { ...p.socialLinks, facebook: e.target.value }
                }))}
                placeholder="Facebook page"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="whatsapp-link">WhatsApp Link</Label>
              <Input
                id="whatsapp-link"
                value={businessData.socialLinks.whatsapp}
                onChange={e => setBusinessData(p => ({
                  ...p,
                  socialLinks: { ...p.socialLinks, whatsapp: e.target.value }
                }))}
                placeholder="WhatsApp link"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="payment-amount">Payment Amount</Label>
              <Input
                id="payment-amount"
                type="number"
                value={businessData.paymentDetails.amount}
                onChange={e => setBusinessData(p => ({
                  ...p,
                  paymentDetails: { ...p.paymentDetails, amount: Number(e.target.value) }
                }))}
                placeholder="0"
                min={0}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="payment-mode">Payment Mode</Label>
              <Select value={businessData.paymentDetails.paymentMode} onValueChange={(v: any) => setBusinessData(p => ({
                ...p,
                paymentDetails: { ...p.paymentDetails, paymentMode: v }
              }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="upi">UPI</SelectItem>
                  {/* <SelectItem value="online">Online</SelectItem> */}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="payment-note">Payment Note</Label>
              <Textarea
                id="payment-note"
                value={businessData.paymentDetails.paymentNote}
                onChange={e => setBusinessData(p => ({
                  ...p,
                  paymentDetails: { ...p.paymentDetails, paymentNote: e.target.value }
                }))}
                placeholder="Payment notes"
                rows={2}
              />
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setStep(1)}
              className="flex-1"
            >
              Back
            </Button>
            <Button
              type="submit"
              className="flex-1 gradient-primary text-primary-foreground"
              disabled={createBusinessMutation.isPending}
            >
              {createBusinessMutation.isPending ? 'Submitting...' : 'Submit Business'}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}