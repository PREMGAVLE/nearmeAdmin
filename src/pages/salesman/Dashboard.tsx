import { Building2, CheckCircle, Clock, Crown, CreditCard, Folder, Calendar } from 'lucide-react';
import { StatsCard } from '@/components/StatsCard';
import { useBusiness, useBusinesses } from '@/services/businessService';
import { useCategories } from '@/services/categoryService';
import { useAuth } from '@/contexts/AuthContext';
import { StatusBadge, ListingTypeBadge } from '@/components/StatusBadge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { StatsSkeleton, TableSkeleton } from '@/components/TableSkeleton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getCategoryName } from '@/lib/helpers';

export default function SalesmanDashboard() {
  const { user } = useAuth();
  const { data: businessesData, isLoading: businessesLoading } = useBusinesses({
    createdBy: user?._id,
    limit: 5,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  // Fetch all user's businesses for stats calculation
  const { data: allBusinessesData, isLoading: statsLoading } = useBusinesses({
    createdBy: user?._id,
  });

  const businesses = allBusinessesData?.data?.items || [];
  const totalBusinesses = businesses.length;
  const approved = businesses.filter(b => b.approvalStatus === 'approved').length;
  const pending = businesses.filter(b => b.approvalStatus === 'pending').length;
  const pendingPremium = businesses.filter(b => b.premiumRequestStatus === 'premium_requested').length;
  const totalRevenue = businesses
    .filter(b => b.paymentDetails?.paymentStatus === 'received' || b.paymentDetails?.paymentStatus === 'verified')
    .reduce((sum, b) => sum + (b.paymentDetails?.amount || 0), 0);

  // Get categories created by this salesman
  const { data: myCategoriesData, isLoading: myCategoriesLoading, error: myCategoriesError } = useCategories({
    createdBy: user?._id,
    limit: 10,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  const { data: categoryData, error: allCategoriesError } = useCategories({ limit: 100 });

  const categories = categoryData?.data || [];
  const myCategories = myCategoriesData?.data || [];

  console.log('Dashboard - user._id:', user?._id);
  console.log('Dashboard - myCategoriesData:', myCategoriesData);
  console.log('Dashboard - myCategories:', myCategories);

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="font-display text-xl sm:text-2xl font-bold text-foreground">Welcome, {user?.name}</h1>
        <p className="text-sm text-muted-foreground">Your field operations overview</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {statsLoading ? <StatsSkeleton count={5} /> : (
          <>
            <StatsCard title="Total Added" value={totalBusinesses} icon={Building2} variant="default" />
            <StatsCard title="Approved" value={approved} icon={CheckCircle} variant="success" />
            <StatsCard title="Pending" value={pending} icon={Clock} variant="warning" />
            <StatsCard title="Pending Premium" value={pendingPremium} icon={Crown} variant="premium" />
            <StatsCard title="Collected" value={`₹${totalRevenue.toLocaleString()}`} icon={CreditCard} variant="info" />
          </>
        )}
      </div>

      <div className="rounded-xl border bg-card card-shadow">
        <div className="p-5 border-b border-border">
          <h3 className="font-display font-semibold text-foreground">My Recent Businesses</h3>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Business</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {businessesLoading ? <TableSkeleton cols={5} /> : businessesData?.data?.items?.map((b) => (
                <TableRow key={b._id}>
                  <TableCell className="font-medium">{b.businessName}</TableCell>
                  <TableCell className="text-muted-foreground">{getCategoryName(categories, b.categoryId)}</TableCell>
                  <TableCell><ListingTypeBadge type={b.listingType} /></TableCell>
                  <TableCell><StatusBadge status={b.approvalStatus} /></TableCell>
                  <TableCell className="text-muted-foreground">{new Date(b.created_at).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
              {!businessesLoading && (!businessesData?.data?.items || businessesData.data.items.length === 0) && (
                <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No businesses yet</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* My Categories Status - ONLY VIEW, NO APPROVAL */}
      {myCategoriesError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600">Error loading categories: {myCategoriesError.message}</p>
        </div>
      )}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Folder className="h-5 w-5 text-blue-500" />
            My Categories
          </CardTitle>
          <CardDescription>Categories you created and their approval status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Category Name</TableHead>
                  <TableHead>Section</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {myCategoriesLoading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8">
                      Loading categories...
                    </TableCell>
                  </TableRow>
                ) : myCategoriesError ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8">
                      <div className="text-red-600">
                        Error: {myCategoriesError.message}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  <>
                    {myCategories.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                          No categories created yet
                        </TableCell>
                      </TableRow>
                    ) : (
                      myCategories.map((category) => (
                        <TableRow key={category._id}>
                          <TableCell className="font-medium">{category.name}</TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${category.section === 'BUSINESS'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-green-100 text-green-800'
                              }`}>
                              {category.section}
                            </span>
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={category.approvalStatus} />
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {category.createdAt ? new Date(category.createdAt).toLocaleDateString() : 'N/A'}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}