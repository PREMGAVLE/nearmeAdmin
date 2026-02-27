import { useState } from 'react';
import { useBusinesses, useRequestPremium } from '@/services/businessService';
import { useUsers, useActivateSubscription } from '@/services/userService';
import { useCategories } from '@/services/categoryService';
import { useAuth } from '@/contexts/AuthContext';
import { StatusBadge, ListingTypeBadge } from '@/components/StatusBadge';
import { DataTableHeader } from '@/components/DataTableHeader';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { TableSkeleton } from '@/components/TableSkeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Info, Crown, Pencil } from 'lucide-react';
import { getCategoryName, getUserById } from '@/lib/helpers';
import { useToast } from '@/hooks/use-toast';
import type { BusinessFilters, Business, User, Subscription } from '@/types';

export default function MyBusinesses() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<BusinessFilters>({ page: 1, limit: 20 });
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedBiz, setSelectedBiz] = useState<Business | null>(null);
  const [editOwnerOpen, setEditOwnerOpen] = useState(false);
  const [selectedOwner, setSelectedOwner] = useState<User | null>(null);
  const [editOwnerForm, setEditOwnerForm] = useState({ name: '', mobile: '', email: '', city: '' });

  const { data: userData } = useUsers({ limit: 1000 });
  const { data: categoryData } = useCategories({ limit: 100 });
  const requestPremiumMutation = useRequestPremium();
  const activateSubMutation = useActivateSubscription();

  const users = userData?.data || [];
  const categories = categoryData?.data || [];

  const { data, isLoading } = useBusinesses({
    ...filters, createdBy: user?._id, search: search || undefined,
  });

  // Get unique owner IDs from businesses
  const ownerIds = [...new Set((data?.data || []).map(b => b.ownerId).filter(Boolean))] as string[];
  const owners = ownerIds.map(id => getUserById(users, id)).filter(Boolean) as User[];

  const handleRequestPremium = (id: string) => {
    requestPremiumMutation.mutate(id, {
      onSuccess: () => toast({ title: 'Premium Requested', description: 'Premium request sent for admin approval' }),
    });
  };

  const handleToggleSub = (ownerId: string) => {
    activateSubMutation.mutate({ id: ownerId, subscription: { status: 'active', planType: 'monthly', startDate: new Date().toISOString().split('T')[0], expiryDate: '2027-01-01' } }, {
      onSuccess: () => toast({ title: 'Subscription Activated' }),
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-xl sm:text-2xl font-bold text-foreground">My Businesses</h1>
        <p className="text-sm text-muted-foreground">View and manage businesses you've submitted</p>
      </div>

      {/* Detail Modal */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Business Details</DialogTitle></DialogHeader>
          {selectedBiz && (
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div><p className="text-muted-foreground">Business Name</p><p className="font-medium">{selectedBiz.businessName}</p></div>
                <div><p className="text-muted-foreground">Category</p><p className="font-medium">{getCategoryName(categories, selectedBiz.categoryId)}</p></div>
                <div><p className="text-muted-foreground">Business Type</p><StatusBadge status={selectedBiz.businessType} /></div>
                <div><p className="text-muted-foreground">City</p><p className="font-medium">{selectedBiz.address.city}</p></div>
                <div><p className="text-muted-foreground">Phone</p><p className="font-medium">{selectedBiz.contactNumbers.primary}</p></div>
                <div className="col-span-2"><p className="text-muted-foreground">Address</p><p className="font-medium">{selectedBiz.address.street}, {selectedBiz.address.city}, {selectedBiz.address.state} - {selectedBiz.address.pincode}</p></div>
                {selectedBiz.serviceArea && <div className="col-span-2"><p className="text-muted-foreground">Service Area</p><p className="font-medium">{selectedBiz.serviceArea}</p></div>}
                {selectedBiz.description && <div className="col-span-2"><p className="text-muted-foreground">Description</p><p className="font-medium">{selectedBiz.description}</p></div>}
                <div><p className="text-muted-foreground">Listing Type</p><ListingTypeBadge type={selectedBiz.listingType} /></div>
                <div><p className="text-muted-foreground">Approval Status</p><StatusBadge status={selectedBiz.approvalStatus} /></div>
                <div><p className="text-muted-foreground">Premium</p><p className="font-medium">{selectedBiz.isPremium ? `★ Yes (${selectedBiz.premiumSource})` : 'No'}</p></div>
                <div><p className="text-muted-foreground">Visible</p><p className="font-medium">{selectedBiz.isVisible ? 'Yes' : 'No'}</p></div>
              </div>
              <div className="border-t pt-3">
                <p className="font-semibold mb-2">Payment Details</p>
                <div className="grid grid-cols-2 gap-3">
                  <div><p className="text-muted-foreground">Amount</p><p className="font-medium">₹{selectedBiz.paymentDetails.amount.toLocaleString()}</p></div>
                  <div><p className="text-muted-foreground">Mode</p><p className="font-medium uppercase">{selectedBiz.paymentDetails.paymentMode}</p></div>
                  <div><p className="text-muted-foreground">Payment Status</p><StatusBadge status={selectedBiz.paymentDetails.paymentStatus} /></div>
                  <div><p className="text-muted-foreground">Verification</p><StatusBadge status={selectedBiz.verification.status} /></div>
                </div>
              </div>
              {selectedBiz.rejectionReason && (
                <div className="border-t pt-3">
                  <p className="text-muted-foreground">Rejection Reason</p>
                  <p className="font-medium text-destructive">{selectedBiz.rejectionReason}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Owner Modal */}
      <Dialog open={editOwnerOpen} onOpenChange={setEditOwnerOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Owner Info</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>Name</Label><Input value={editOwnerForm.name} onChange={e => setEditOwnerForm(p => ({ ...p, name: e.target.value }))} /></div>
            <div className="space-y-2"><Label>Mobile</Label><Input value={editOwnerForm.mobile} onChange={e => setEditOwnerForm(p => ({ ...p, mobile: e.target.value }))} /></div>
            <div className="space-y-2"><Label>Email</Label><Input value={editOwnerForm.email} onChange={e => setEditOwnerForm(p => ({ ...p, email: e.target.value }))} /></div>
            <div className="space-y-2"><Label>City</Label><Input value={editOwnerForm.city} onChange={e => setEditOwnerForm(p => ({ ...p, city: e.target.value }))} /></div>
            <Button className="w-full gradient-primary text-primary-foreground" onClick={() => { toast({ title: 'Owner Updated (mock)' }); setEditOwnerOpen(false); }}>
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Tabs defaultValue="businesses">
        <TabsList>
          <TabsTrigger value="businesses">My Businesses</TabsTrigger>
          <TabsTrigger value="owners">Business Owners</TabsTrigger>
        </TabsList>

        <TabsContent value="businesses" className="mt-4">
          <div className="rounded-xl border bg-card card-shadow">
            <div className="p-5 border-b border-border">
              <DataTableHeader
                searchValue={search} onSearchChange={setSearch} searchPlaceholder="Search your businesses..."
                filters={[
                  { key: 'approvalStatus', label: 'Status', value: filters.approvalStatus || 'all', onChange: (v) => setFilters(p => ({ ...p, approvalStatus: v === 'all' ? undefined : v, page: 1 })), options: [{ value: 'pending', label: 'Pending' }, { value: 'approved', label: 'Approved' }, { value: 'rejected', label: 'Rejected' }] },
                  { key: 'listingType', label: 'Type', value: filters.listingType || 'all', onChange: (v) => setFilters(p => ({ ...p, listingType: v === 'all' ? undefined : v, page: 1 })), options: [{ value: 'normal', label: 'Normal' }, { value: 'premium', label: 'Premium' }] },
                ]}
              />
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Business Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Biz Type</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Approval</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead>Premium</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? <TableSkeleton cols={9} /> : data?.data?.map((b) => {
                    const owner = b.ownerId ? getUserById(users, b.ownerId) : null;
                    const ownerSubActive = owner?.subscription?.status === 'active';
                    return (
                      <TableRow key={b._id}>
                        <TableCell className="font-medium">{b.businessName}</TableCell>
                        <TableCell className="text-muted-foreground">{getCategoryName(categories, b.categoryId)}</TableCell>
                        <TableCell><StatusBadge status={b.businessType} /></TableCell>
                        <TableCell><ListingTypeBadge type={b.listingType} /></TableCell>
                        <TableCell><StatusBadge status={b.approvalStatus} /></TableCell>
                        <TableCell><StatusBadge status={b.paymentDetails.paymentStatus} /></TableCell>
                        <TableCell>
                          {b.isPremium ? (
                            <span className="text-xs font-semibold text-premium">★ {b.premiumSource}</span>
                          ) : b.premiumRequestStatus === 'premium_requested' ? (
                            <StatusBadge status="premium_requested" />
                          ) : (
                            <Button variant="ghost" size="sm" className="text-xs text-primary h-7" onClick={() => handleRequestPremium(b._id)}
                              disabled={requestPremiumMutation.isPending}>
                              <Crown className="h-3 w-3 mr-1" /> Request Premium
                            </Button>
                          )}
                        </TableCell>
                        <TableCell className="text-muted-foreground">{new Date(b.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setSelectedBiz(b); setDetailOpen(true); }}>
                              <Info className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {!isLoading && (!data?.data || data.data.length === 0) && (
                    <TableRow><TableCell colSpan={9} className="text-center py-8 text-muted-foreground">No businesses found</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="owners" className="mt-4">
          <div className="rounded-xl border bg-card card-shadow">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Mobile</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>City</TableHead>
                    <TableHead>Subscription</TableHead>
                    <TableHead>Expiry</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {owners.length === 0 ? (
                    <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No owners linked to your businesses</TableCell></TableRow>
                  ) : owners.map((o) => (
                    <TableRow key={o._id}>
                      <TableCell className="font-medium">{o.name}</TableCell>
                      <TableCell className="text-muted-foreground">{o.mobile}</TableCell>
                      <TableCell className="text-muted-foreground">{o.email}</TableCell>
                      <TableCell className="text-muted-foreground">{o.city || '—'}</TableCell>
                      <TableCell><StatusBadge status={o.subscription?.status || 'none'} /></TableCell>
                      <TableCell className="text-muted-foreground">{o.subscription?.expiryDate ? new Date(o.subscription.expiryDate).toLocaleDateString() : '—'}</TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => {
                            setSelectedOwner(o);
                            setEditOwnerForm({ name: o.name, mobile: o.mobile, email: o.email, city: o.city || '' });
                            setEditOwnerOpen(true);
                          }}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          {o.subscription?.status !== 'active' && (
                            <Button variant="ghost" size="sm" className="text-xs text-success h-7" onClick={() => handleToggleSub(o._id)}>
                              Activate Sub
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
