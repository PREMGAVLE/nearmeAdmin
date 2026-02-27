import { useState } from 'react';
import { useBusinesses, useApprovePremiumRequest, useRejectPremiumRequest } from '@/services/businessService';
import { useUsers } from '@/services/userService';
import { useCategories } from '@/services/categoryService';
import { StatusBadge, ListingTypeBadge } from '@/components/StatusBadge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { TableSkeleton } from '@/components/TableSkeleton';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Check, X, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getUserName, getCategoryName, getUserById } from '@/lib/helpers';
import type { Business } from '@/types';

export default function PremiumRequestsPage() {
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedBiz, setSelectedBiz] = useState<Business | null>(null);
  const { toast } = useToast();

  const { data, isLoading } = useBusinesses({ premiumRequestStatus: 'premium_requested' });
  const { data: userData } = useUsers({ limit: 100 });
  const { data: categoryData } = useCategories({ limit: 100 });
  const approveMutation = useApprovePremiumRequest();
  const rejectMutation = useRejectPremiumRequest();

  const users = userData?.data || [];
  const categories = categoryData?.data || [];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-xl sm:text-2xl font-bold text-foreground">Premium Requests</h1>
        <p className="text-sm text-muted-foreground">Approve or reject premium listing requests from salesmen</p>
      </div>

      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Premium Request Details</DialogTitle></DialogHeader>
          {selectedBiz && (
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div><p className="text-muted-foreground">Business Name</p><p className="font-medium">{selectedBiz.businessName}</p></div>
                <div><p className="text-muted-foreground">Category</p><p className="font-medium">{getCategoryName(categories, selectedBiz.categoryId)}</p></div>
                <div><p className="text-muted-foreground">Business Type</p><StatusBadge status={selectedBiz.businessType} /></div>
                <div><p className="text-muted-foreground">City</p><p className="font-medium">{selectedBiz.address.city}</p></div>
                <div><p className="text-muted-foreground">Created By</p><p className="font-medium">{getUserName(users, selectedBiz.createdBy as string)}</p></div>
                <div><p className="text-muted-foreground">Approval Status</p><StatusBadge status={selectedBiz.approvalStatus} /></div>
                {selectedBiz.ownerId && (() => {
                  const owner = getUserById(users, selectedBiz.ownerId);
                  return owner ? (
                    <>
                      <div><p className="text-muted-foreground">Owner</p><p className="font-medium">{owner.name}</p></div>
                      <div><p className="text-muted-foreground">Owner Subscription</p><StatusBadge status={owner.subscription?.status || 'none'} /></div>
                    </>
                  ) : null;
                })()}
              </div>
              <div className="border-t pt-3">
                <div className="grid grid-cols-2 gap-3">
                  <div><p className="text-muted-foreground">Amount</p><p className="font-medium">₹{selectedBiz.paymentDetails.amount.toLocaleString()}</p></div>
                  <div><p className="text-muted-foreground">Payment Status</p><StatusBadge status={selectedBiz.paymentDetails.paymentStatus} /></div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <div className="rounded-xl border bg-card card-shadow">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Business</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>City</TableHead>
                <TableHead>Biz Type</TableHead>
                <TableHead>Created By</TableHead>
                <TableHead>Approval</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? <TableSkeleton cols={8} /> : data?.data?.map((b) => (
                <TableRow key={b._id}>
                  <TableCell className="font-medium">{b.businessName}</TableCell>
                  <TableCell className="text-muted-foreground">{getCategoryName(categories, b.categoryId)}</TableCell>
                  <TableCell className="text-muted-foreground">{b.address.city}</TableCell>
                  <TableCell><StatusBadge status={b.businessType} /></TableCell>
                  <TableCell className="text-muted-foreground">{getUserName(users, b.createdBy as string)}</TableCell>
                  <TableCell><StatusBadge status={b.approvalStatus} /></TableCell>
                  <TableCell className="font-semibold">₹{b.paymentDetails.amount.toLocaleString()}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setSelectedBiz(b); setDetailOpen(true); }}>
                        <Info className="h-4 w-4" />
                      </Button>
                      <Button size="sm" className="bg-success text-success-foreground hover:bg-success/90 gap-1"
                        onClick={() => approveMutation.mutate(b._id, { onSuccess: () => toast({ title: 'Premium Approved' }) })}
                        disabled={approveMutation.isPending}>
                        <Check className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Approve</span>
                      </Button>
                      <Button size="sm" variant="outline" className="text-destructive border-destructive/30 gap-1"
                        onClick={() => rejectMutation.mutate(b._id, { onSuccess: () => toast({ title: 'Premium Rejected' }) })}
                        disabled={rejectMutation.isPending}>
                        <X className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Reject</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {!isLoading && (!data?.data || data.data.length === 0) && (
                <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">No premium requests</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
