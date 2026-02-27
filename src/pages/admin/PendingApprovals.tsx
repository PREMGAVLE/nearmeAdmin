import { useState } from 'react';
import { useBusinesses, useApproveBusiness, useRejectBusiness, useVerifyPayment } from '@/services/businessService';
import { useUsers } from '@/services/userService';
import { useCategories } from '@/services/categoryService';
import { StatusBadge, ListingTypeBadge } from '@/components/StatusBadge';
import { DataTableHeader } from '@/components/DataTableHeader';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { TableSkeleton } from '@/components/TableSkeleton';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Check, X, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getUserName, getCategoryName } from '@/lib/helpers';
import type { Business } from '@/types';

export default function PendingApprovals() {
  const [search, setSearch] = useState('');
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedBiz, setSelectedBiz] = useState<Business | null>(null);
  const { toast } = useToast();

  const { data, isLoading } = useBusinesses({ approvalStatus: 'pending', search: search || undefined });
  const { data: userData } = useUsers({ limit: 1000 });
  const { data: categoryData } = useCategories({ limit: 100 });
  const approveMutation = useApproveBusiness();
  const rejectMutation = useRejectBusiness();
  const verifyPaymentMutation = useVerifyPayment();

  const users = userData?.items || userData?.data?.items || [];
  const categories = categoryData?.items || categoryData?.data?.items || [];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-xl sm:text-2xl font-bold text-foreground">Pending Approvals</h1>
        <p className="text-sm text-muted-foreground">Review and approve business listing requests</p>
      </div>

      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Pending Business Details</DialogTitle></DialogHeader>
          {selectedBiz && (
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div><p className="text-muted-foreground">Business Name</p><p className="font-medium">{selectedBiz.businessName}</p></div>
                <div><p className="text-muted-foreground">Category</p><p className="font-medium">{getCategoryName(categories, selectedBiz.categoryId)}</p></div>
                <div><p className="text-muted-foreground">City</p><p className="font-medium">{selectedBiz.address.city}</p></div>
                <div><p className="text-muted-foreground">Phone</p><p className="font-medium">{selectedBiz.contactNumbers.primary}</p></div>
                <div className="col-span-2"><p className="text-muted-foreground">Address</p><p className="font-medium">{selectedBiz.address.street}, {selectedBiz.address.city}, {selectedBiz.address.state} - {selectedBiz.address.pincode}</p></div>
                <div><p className="text-muted-foreground">Created By (Salesman)</p><p className="font-medium">{getUserName(users, selectedBiz.createdBy as string)}</p></div>
                <div><p className="text-muted-foreground">Listing Type</p><ListingTypeBadge type={selectedBiz.listingType} /></div>
              </div>
              <div className="border-t pt-3">
                <p className="font-semibold mb-2">Payment Details</p>
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
            </div>
          )}
        </DialogContent>
      </Dialog>

      <div className="rounded-xl border bg-card card-shadow">
        <div className="p-5 border-b border-border">
          <DataTableHeader searchValue={search} onSearchChange={setSearch} searchPlaceholder="Search pending businesses..." />
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Business</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Created By</TableHead>
                <TableHead>Type Requested</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Payment Mode</TableHead>
                <TableHead>Payment Status</TableHead>
                <TableHead>Verification</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? <TableSkeleton cols={9} /> : data?.data?.items?.map((b) => (
                <TableRow key={b._id}>
                  <TableCell className="font-medium">{b.businessName}</TableCell>
                  <TableCell className="text-muted-foreground">{getCategoryName(categories, b.categoryId)}</TableCell>
                  <TableCell className="text-muted-foreground">{getUserName(users, b.createdBy as string)}</TableCell>
                  <TableCell><ListingTypeBadge type={b.listingType} /></TableCell>
                  <TableCell className="font-semibold">₹{b.paymentDetails?.amount?.toLocaleString() || 'N/A'}</TableCell>
                  <TableCell className="uppercase text-xs font-medium text-muted-foreground">{b.paymentDetails?.paymentMode || 'N/A'}</TableCell>
                  <TableCell><StatusBadge status={b.paymentDetails?.paymentStatus || 'pending'} /></TableCell>                  <TableCell><StatusBadge status={b.verification?.status} /></TableCell>
                  <TableCell>
                    <div className="flex flex-wrap justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setSelectedBiz(b); setDetailOpen(true); }}>
                        <Info className="h-4 w-4" />
                      </Button>
                      <Button size="sm" className="bg-success text-success-foreground hover:bg-success/90 gap-1"
                        onClick={() => approveMutation.mutate(b._id, { onSuccess: () => toast({ title: 'Approved' }) })}
                        disabled={approveMutation.isPending}>
                        <Check className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Approve</span>
                      </Button>
                      <Button size="sm" variant="outline" className="text-destructive border-destructive/30 gap-1"
                        onClick={() => rejectMutation.mutate({ id: b._id, rejectionReason: 'Rejected' }, { onSuccess: () => toast({ title: 'Rejected' }) })}
                        disabled={rejectMutation.isPending}>
                        <X className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Reject</span>
                      </Button>
                      {b.paymentDetails.paymentStatus === 'pending' && (
                        <Button size="sm" variant="outline" className="text-info gap-1"
                          onClick={() => verifyPaymentMutation.mutate(b._id, { onSuccess: () => toast({ title: 'Payment Verified' }) })}
                          disabled={verifyPaymentMutation.isPending}>
                          <span className="hidden sm:inline">Verify Payment</span><span className="sm:hidden">Verify</span>
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {!isLoading && (!data?.data?.items || data.data.items.length === 0) && (
                <TableRow><TableCell colSpan={9} className="text-center py-8 text-muted-foreground">No pending approvals</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
