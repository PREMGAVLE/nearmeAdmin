import { useState } from 'react';
import { useBusinesses, useApproveBusiness, useRejectBusiness, useVerifyPayment, useToggleVisibility, useActivatePremium, useDeactivatePremium, useDeleteBusiness, useUpdateBusiness } from '@/services/businessService';
import { useUsers } from '@/services/userService';
import { useCategories } from '@/services/categoryService';
import { StatusBadge, ListingTypeBadge } from '@/components/StatusBadge';
import { DataTableHeader } from '@/components/DataTableHeader';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { TableSkeleton } from '@/components/TableSkeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Check, X, Trash2, Crown, EyeOff, Eye as EyeIcon, Pencil, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getUserName, getCategoryName, getUserById } from '@/lib/helpers';
import type { BusinessFilters, Business, BusinessType } from '@/types';

export default function AllBusinessesPage() {
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<BusinessFilters>({ page: 1, limit: 20 });
  const [editOpen, setEditOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedBiz, setSelectedBiz] = useState<Business | null>(null);
  const [editForm, setEditForm] = useState<Partial<Business>>({});
  const { toast } = useToast();

  const { data, isLoading } = useBusinesses({ ...filters, search: search || undefined });
  const { data: userData } = useUsers({ limit: 100 });
  const { data: categoryData } = useCategories({ limit: 100 });
  const approveMutation = useApproveBusiness();
  const rejectMutation = useRejectBusiness();
  const verifyPaymentMutation = useVerifyPayment();
  const toggleVisibilityMutation = useToggleVisibility();
  const activatePremiumMutation = useActivatePremium();
  const deactivatePremiumMutation = useDeactivatePremium();
  const deleteMutation = useDeleteBusiness();
  const updateMutation = useUpdateBusiness();

  const users = userData?.data?.items || [];
  const categories = categoryData?.data?.items || [];

  const handleApprove = (id: string, name: string) => {
    approveMutation.mutate(id, { onSuccess: () => toast({ title: 'Approved', description: `${name} has been approved` }) });
  };

  const handleReject = (id: string, name: string) => {
    rejectMutation.mutate({ id, rejectionReason: 'Rejected by admin' }, { onSuccess: () => toast({ title: 'Rejected', description: `${name} has been rejected` }) });
  };

  const openEdit = (b: Business) => {
    setSelectedBiz(b);
    setEditForm({ ...b });
    setEditOpen(true);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBiz) return;
    updateMutation.mutate({ id: selectedBiz._id, payload: editForm }, {
      onSuccess: () => { toast({ title: 'Business Updated' }); setEditOpen(false); },
    });
  };

  const categoryOptions = categoryData?.data?.items?.map(c => ({ value: c._id, label: c.name })) || [];
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-xl sm:text-2xl font-bold text-foreground">All Businesses</h1>
        <p className="text-sm text-muted-foreground">Manage all business listings across the platform</p>
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
                <div><p className="text-muted-foreground">Primary Phone</p><p className="font-medium">{selectedBiz.contactNumbers.primary}</p></div>
                <div><p className="text-muted-foreground">City</p><p className="font-medium">{selectedBiz.address.city}</p></div>
                <div className="col-span-2"><p className="text-muted-foreground">Address</p><p className="font-medium">{selectedBiz.address.street}, {selectedBiz.address.city}, {selectedBiz.address.state} - {selectedBiz.address.pincode}</p></div>
                <div><p className="text-muted-foreground">Listing Type</p><ListingTypeBadge type={selectedBiz.listingType} /></div>
                <div><p className="text-muted-foreground">Approval Status</p><StatusBadge status={selectedBiz.approvalStatus} /></div>
                <div><p className="text-muted-foreground">Premium</p><p className="font-medium">{selectedBiz.isPremium ? '★ Yes' : 'No'}</p></div>
                <div><p className="text-muted-foreground">Visible</p><p className="font-medium">{selectedBiz.isVisible ? 'Yes' : 'No'}</p></div>
              </div>
              <div className="border-t pt-3">
                <p className="font-semibold text-foreground mb-2">Payment Details</p>
                <div className="grid grid-cols-2 gap-3">
                  <div><p className="text-muted-foreground">Amount</p><p className="font-medium">₹{selectedBiz.paymentDetails.amount.toLocaleString()}</p></div>
                  <div><p className="text-muted-foreground">Mode</p><p className="font-medium uppercase">{selectedBiz.paymentDetails.paymentMode}</p></div>
                  <div><p className="text-muted-foreground">Payment Status</p><StatusBadge status={selectedBiz.paymentDetails.paymentStatus} /></div>
                  <div><p className="text-muted-foreground">Verification</p><StatusBadge status={selectedBiz.verification.status} /></div>
                  {selectedBiz.paymentDetails.paymentNote && (
                    <div className="col-span-2"><p className="text-muted-foreground">Note</p><p className="font-medium">{selectedBiz.paymentDetails.paymentNote}</p></div>
                  )}
                </div>
              </div>
              <div className="border-t pt-3">
                <div className="grid grid-cols-2 gap-3">
                  <div><p className="text-muted-foreground">Created By</p><p className="font-medium">{getUserName(users, selectedBiz.createdBy as string)}</p></div>
                  <div><p className="text-muted-foreground">Created At</p><p className="font-medium">{new Date(selectedBiz.createdAt).toLocaleString()}</p></div>
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

      {/* Edit Modal */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Edit Business</DialogTitle></DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div className="space-y-2"><Label>Business Name</Label><Input value={editForm.businessName || ''} onChange={e => setEditForm(p => ({ ...p, businessName: e.target.value }))} required /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={editForm.categoryId || ''} onValueChange={v => setEditForm(p => ({ ...p, categoryId: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{categoryOptions.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>City</Label><Input value={editForm.address?.city || ''} onChange={e => setEditForm(p => ({ ...p, address: { ...p.address!, city: e.target.value } }))} /></div>
            </div>
            <div className="space-y-2"><Label>Primary Phone</Label><Input value={editForm.contactNumbers?.primary || ''} onChange={e => setEditForm(p => ({ ...p, contactNumbers: { ...p.contactNumbers!, primary: e.target.value } }))} /></div>
            <div className="space-y-2"><Label>Street</Label><Input value={editForm.address?.street || ''} onChange={e => setEditForm(p => ({ ...p, address: { ...p.address!, street: e.target.value } }))} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Listing Type</Label>
                <Select value={editForm.listingType || 'normal'} onValueChange={(v: 'normal' | 'premium') => setEditForm(p => ({ ...p, listingType: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="normal">Normal</SelectItem><SelectItem value="premium">Premium</SelectItem></SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Payment Amount</Label>
                <Input type="number" value={editForm.paymentDetails?.amount || 0} onChange={e => setEditForm(p => ({ ...p, paymentDetails: { ...p.paymentDetails!, amount: Number(e.target.value) } }))} />
              </div>
            </div>
            <Button type="submit" className="w-full gradient-primary text-primary-foreground" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <div className="rounded-xl border bg-card card-shadow">
        <div className="p-5 border-b border-border">
          <DataTableHeader
            searchValue={search}
            onSearchChange={setSearch}
            searchPlaceholder="Search businesses..."
            filters={[
              { key: 'approvalStatus', label: 'Status', value: filters.approvalStatus || 'all', onChange: (v) => setFilters(p => ({ ...p, approvalStatus: v === 'all' ? undefined : v, page: 1 })), options: [{ value: 'pending', label: 'Pending' }, { value: 'approved', label: 'Approved' }, { value: 'rejected', label: 'Rejected' }] },
              { key: 'listingType', label: 'Type', value: filters.listingType || 'all', onChange: (v) => setFilters(p => ({ ...p, listingType: v === 'all' ? undefined : v, page: 1 })), options: [{ value: 'normal', label: 'Normal' }, { value: 'premium', label: 'Premium' }] },
              { key: 'categoryId', label: 'Category', value: filters.categoryId || 'all', onChange: (v) => setFilters(p => ({ ...p, categoryId: v === 'all' ? undefined : v, page: 1 })), options: categoryOptions },
            ]}
          />
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Business</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>City</TableHead>
                <TableHead>Biz Type</TableHead>
                <TableHead>Listing</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Premium</TableHead>
                <TableHead>Created By</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? <TableSkeleton cols={10} /> : data?.data?.items?.map((b) => (
                <TableRow key={b._id}>
                  <TableCell className="font-medium">
                    {b.businessName}
                    {b.isPremium && <span className="ml-2 text-xs text-premium">★</span>}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{getCategoryName(categories, b.categoryId)}</TableCell>
                  <TableCell className="text-muted-foreground">{b.address.city}</TableCell>
                  <TableCell><StatusBadge status={b.businessType} /></TableCell>
                  <TableCell><ListingTypeBadge type={b.listingType} /></TableCell>
                  <TableCell><StatusBadge status={b.approvalStatus} /></TableCell>
                  <TableCell><StatusBadge status={b.paymentDetails.paymentStatus} /></TableCell>
                  <TableCell>
                    {b.isPremium ? <span className="text-xs font-semibold text-premium">★ {b.premiumSource}</span> : b.premiumRequestStatus === 'premium_requested' ? <StatusBadge status="premium_requested" /> : '—'}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{getUserName(users, b.createdBy as string)}</TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setSelectedBiz(b); setDetailOpen(true); }}>
                        <Info className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(b)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => toggleVisibilityMutation.mutate(b._id, { onSuccess: () => toast({ title: 'Visibility Updated' }) })} disabled={toggleVisibilityMutation.isPending}>
                        {b.isVisible ? <EyeIcon className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                      </Button>
                      {b.approvalStatus === 'pending' && (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-success hover:text-success"
                            onClick={() => handleApprove(b._id, b.businessName)}
                            disabled={approveMutation.isPending}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => handleReject(b._id, b.businessName)} disabled={rejectMutation.isPending}>
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                      {b.paymentDetails.paymentStatus === 'pending' && (
                        <Button variant="ghost" size="sm" className="text-info" onClick={() => verifyPaymentMutation.mutate(b._id, { onSuccess: () => toast({ title: 'Payment Verified' }) })} disabled={verifyPaymentMutation.isPending}>
                          Verify
                        </Button>
                      )}
                      {!b.isPremium && (
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-premium" onClick={() => activatePremiumMutation.mutate(b._id, { onSuccess: () => toast({ title: 'Premium Activated' }) })} disabled={activatePremiumMutation.isPending}>
                          <Crown className="h-4 w-4" />
                        </Button>
                      )}
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteMutation.mutate(b._id, { onSuccess: () => toast({ title: 'Business Deleted' }) })} disabled={deleteMutation.isPending}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {!isLoading && (!data?.data?.items || data.data.items.length === 0) && (
                <TableRow><TableCell colSpan={10} className="text-center py-8 text-muted-foreground">No businesses found</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        {data?.data?.pagination && data.data.pagination.totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-border">
            <p className="text-sm text-muted-foreground">Page {data.data.pagination.page} of {data.data.pagination.totalPages} ({data.data.pagination.total} total)</p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={data.data.pagination.page <= 1} onClick={() => setFilters(p => ({ ...p, page: (p.page || 1) - 1 }))}>Previous</Button>
              <Button variant="outline" size="sm" disabled={data.data.pagination.page >= data.data.pagination.totalPages} onClick={() => setFilters(p => ({ ...p, page: (p.page || 1) + 1 }))}>Next</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
