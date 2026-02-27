import { useState } from 'react';
import { useBusinesses, useApproveBusiness, useRejectBusiness, useVerifyPayment, useToggleVisibility, useActivatePremium, useDeactivatePremium } from '@/services/businessService';
import { useUsers } from '@/services/userService';
import { useCategories } from '@/services/categoryService'; // Keep for filter options
import { StatusBadge, ListingTypeBadge } from '@/components/StatusBadge';
import { DataTableHeader } from '@/components/DataTableHeader';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { TableSkeleton } from '@/components/TableSkeleton';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle, Crown, Eye, EyeOff, CreditCard, Building2, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getUserName, getCategoryName } from '@/lib/helpers';
import type { BusinessFilters, Business } from '@/types';

export default function AdminAllBusinesses() {
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<BusinessFilters>({ page: 1, limit: 20 });
  const { toast } = useToast();

  const { data, isLoading, refetch } = useBusinesses({ 
    ...filters, 
    search: search || undefined 
  });
  const { data: userData } = useUsers({ limit: 100 });
  const { data: categoryData } = useCategories({ limit: 100 }); // Keep for filter dropdown
  
  const approveMutation = useApproveBusiness();
  const rejectMutation = useRejectBusiness();
  const verifyPaymentMutation = useVerifyPayment();
  const toggleVisibilityMutation = useToggleVisibility();
  const activatePremiumMutation = useActivatePremium();
  const deactivatePremiumMutation = useDeactivatePremium();

  const users = userData?.data?.items || [];
  const categories = categoryData?.data?.items || [];
  const businesses = data?.data?.items || [];
  const pagination = data?.data?.pagination;

  const handleApprove = (id: string, name: string) => {
    approveMutation.mutate(id, { 
      onSuccess: () => {
        toast({ title: 'Approved', description: `${name} has been approved` });
        refetch();
      }
    });
  };

  const handleReject = (id: string, name: string) => {
    rejectMutation.mutate({ 
      id, 
      rejectionReason: 'Rejected by admin' 
    }, { 
      onSuccess: () => {
        toast({ title: 'Rejected', description: `${name} has been rejected` });
        refetch();
      }
    });
  };

  const handleVerifyPayment = (id: string) => {
    verifyPaymentMutation.mutate(id, { 
      onSuccess: () => {
        toast({ title: 'Payment Verified', description: 'Payment has been verified successfully' });
        refetch();
      }
    });
  };

  const handleToggleVisibility = (id: string) => {
    toggleVisibilityMutation.mutate(id, { 
      onSuccess: () => {
        toast({ title: 'Visibility Updated', description: 'Business visibility has been updated' });
        refetch();
      }
    });
  };

  const handleTogglePremium = (business: Business) => {
    if (business.isPremium) {
      deactivatePremiumMutation.mutate(business._id, { 
        onSuccess: () => {
          toast({ title: 'Premium Deactivated', description: 'Premium status has been deactivated' });
          refetch();
        }
      });
    } else {
      activatePremiumMutation.mutate(business._id, { 
        onSuccess: () => {
          toast({ title: 'Premium Activated', description: 'Premium status has been activated' });
          refetch();
        }
      });
    }
  };

  const categoryOptions = categories.map(c => ({ value: c._id, label: c.name }));

  return (
    <div className="min-h-screen bg-gray-50/40">
      {/* Header */}
      <div className="border-b bg-white px-6 py-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">All Businesses</h1>
          <p className="text-sm text-gray-500 mt-1">Manage all business listings and approvals</p>
        </div>
      </div>

      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle>Business Directory</CardTitle>
            <CardDescription>
              View and manage all businesses, including pending, approved, and rejected listings
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Search and Filters */}
            <div className="mb-6">
              <DataTableHeader
                searchValue={search}
                onSearchChange={setSearch}
                searchPlaceholder="Search businesses by name..."
                filters={[
                  { 
                    key: 'approvalStatus', 
                    label: 'Status', 
                    value: filters.approvalStatus || 'all', 
                    onChange: (v) => setFilters(p => ({ ...p, approvalStatus: v === 'all' ? undefined : v, page: 1 })), 
                    options: [
                      { value: 'pending', label: 'Pending' }, 
                      { value: 'approved', label: 'Approved' }, 
                      { value: 'rejected', label: 'Rejected' }
                    ] 
                  },
                  { 
                    key: 'listingType', 
                    label: 'Listing Type', 
                    value: filters.listingType || 'all', 
                    onChange: (v) => setFilters(p => ({ ...p, listingType: v === 'all' ? undefined : v, page: 1 })), 
                    options: [
                      { value: 'normal', label: 'Normal' }, 
                      { value: 'premium', label: 'Premium' }
                    ] 
                  },
                  { 
                    key: 'categoryId', 
                    label: 'Category', 
                    value: filters.categoryId || 'all', 
                    onChange: (v) => setFilters(p => ({ ...p, categoryId: v === 'all' ? undefined : v, page: 1 })), 
                    options: categoryOptions 
                  },
                ]}
              />
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Business Name</TableHead>
                    <TableHead>Owner</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>City</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead>Premium</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableSkeleton cols={9} />
                  ) : businesses.map((business) => (
                    <TableRow key={business._id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-gray-400" />
                          {business.businessName}
                          {business.isPremium && <Crown className="h-3 w-3 text-yellow-500" />}
                        </div>
                      </TableCell>
                      <TableCell>{getUserName(users, business.createdBy as string)}</TableCell>
                      <TableCell>{getCategoryName([], business.categoryId)}</TableCell>
                      <TableCell>{business.address.city}</TableCell>
                      <TableCell>
                        <StatusBadge status={business.approvalStatus} />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <CreditCard className="h-3 w-3" />
                          <span className="text-sm">₹{business.paymentDetails.amount.toLocaleString()}</span>
                          <StatusBadge status={business.paymentDetails.paymentStatus} />
                        </div>
                      </TableCell>
                      <TableCell>
                        <ListingTypeBadge type={business.listingType} />
                      </TableCell>
                      <TableCell>{new Date(business.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          {/* Visibility Toggle */}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleVisibility(business._id)}
                            disabled={toggleVisibilityMutation.isPending}
                          >
                            {business.isVisible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                          </Button>

                          {/* Payment Verification */}
                          {business.paymentDetails.paymentStatus === 'pending' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleVerifyPayment(business._id)}
                              disabled={verifyPaymentMutation.isPending}
                            >
                              Verify Payment
                            </Button>
                          )}

                          {/* Premium Toggle */}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleTogglePremium(business)}
                            disabled={activatePremiumMutation.isPending || deactivatePremiumMutation.isPending}
                            className={business.isPremium ? 'text-yellow-600' : 'text-gray-600'}
                          >
                            <Crown className="h-4 w-4" />
                          </Button>

                          {/* Approve/Reject Actions */}
                          {business.approvalStatus === 'pending' && (
                            <>
                              <Button
                                size="sm"
                                className="bg-green-600 hover:bg-green-700"
                                onClick={() => handleApprove(business._id, business.businessName)}
                                disabled={approveMutation.isPending}
                              >
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-red-600 border-red-200 hover:bg-red-50"
                                onClick={() => handleReject(business._id, business.businessName)}
                                disabled={rejectMutation.isPending}
                              >
                                <XCircle className="h-3 w-3 mr-1" />
                                Reject
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {!isLoading && businesses.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                        No businesses found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex items-center justify-between p-4 border-t">
                <p className="text-sm text-gray-500">
                  Page {pagination.page} of {pagination.totalPages} ({pagination.total} total businesses)
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={pagination.page <= 1}
                    onClick={() => setFilters(p => ({ ...p, page: (p.page || 1) - 1 }))}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={pagination.page >= pagination.totalPages}
                    onClick={() => setFilters(p => ({ ...p, page: (p.page || 1) + 1 }))}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}