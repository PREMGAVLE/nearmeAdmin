import { useState } from 'react';
import { 
  useUsers, 
  useCreateUser, 
  useUpdateUserStatus, 
  useUpdateUserRole,
  useDeleteUser, 
  useBulkAction,
  useExportUsers,
  useUserActivityLog,
  useUserBusinesses,
  useUserLeads,
  useActivateSubscription
} from '@/services/userService';
import { StatusBadge } from '@/components/StatusBadge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { TableSkeleton } from '@/components/TableSkeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  UserPlus, 
  Ban, 
  CheckCircle, 
  Trash2, 
  Crown, 
  Pencil, 
  Download, 
  History,
  Filter,
  Building,
  Users
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { DataTableHeader } from '@/components/DataTableHeader';
import type { UserFilters, Subscription, UserRole, User } from '@/types';

export default function UserManagement() {
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<UserFilters>({ page: 1, limit: 20 });
  const [createOpen, setCreateOpen] = useState(false);
  const [subOpen, setSubOpen] = useState(false);
  const [activityOpen, setActivityOpen] = useState(false);
  const [businessOpen, setBusinessOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [activityData, setActivityData] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    email: '',
    role: 'user' as UserRole,
    password: '',
    confirmPassword: '',
    acceptTerms: false,
    notes: ''
  });
  
  const [subData, setSubData] = useState<Partial<Subscription>>({ 
    planType: '', 
    startDate: '', 
    expiryDate: '', 
    status: 'active' 
  });
  
  const { toast } = useToast();

  const { data, isLoading } = useUsers({ ...filters, search: search || undefined });
  const updateStatusMutation = useUpdateUserStatus();
  const updateRoleMutation = useUpdateUserRole();
  const createMutation = useCreateUser();
  const deleteMutation = useDeleteUser();
  const bulkMutation = useBulkAction();
  const exportMutation = useExportUsers();
  const activityMutation = useUserActivityLog();
  const subMutation = useActivateSubscription();
  
  // ✅ NEW: Get user businesses and leads when business dialog opens
  const { data: userBusinesses, isLoading: businessesLoading } = useUserBusinesses(
    businessOpen ? selectedUserId : ''
  );
  const { data: userLeads, isLoading: leadsLoading } = useUserLeads(
    businessOpen ? selectedUserId : ''
  );

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast({ title: 'Error', description: 'Passwords do not match', variant: 'destructive' });
      return;
    }
    
    createMutation.mutate(formData, {
      onSuccess: () => {
        toast({ title: 'User Created' });
        setCreateOpen(false);
        setFormData({
          name: '',
          mobile: '',
          email: '',
          role: 'user',
          password: '',
          confirmPassword: '',
          acceptTerms: false,
          notes: ''
        });
      },
      onError: (err: any) => toast({ title: 'Error', description: err?.response?.data?.message || 'Failed', variant: 'destructive' }),
    });
  };

  const handleBulkAction = (action: string) => {
    if (selectedUsers.length === 0) {
      toast({ title: 'Error', description: 'Please select users', variant: 'destructive' });
      return;
    }
    
    bulkMutation.mutate({ action, userIds: selectedUsers }, {
      onSuccess: () => {
        toast({ title: 'Bulk action completed' });
        setSelectedUsers([]);
        setShowBulkActions(false);
      },
      onError: (err: any) => toast({ title: 'Error', description: err?.response?.data?.message || 'Failed', variant: 'destructive' }),
    });
  };

  const handleExport = (format: 'csv' | 'excel') => {
    exportMutation.mutate({ ...filters, format, search: search || undefined }, {
      onSuccess: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `users.${format}`;
        a.click();
        window.URL.revokeObjectURL(url);
        toast({ title: 'Export completed' });
      },
      onError: () => toast({ title: 'Export failed', variant: 'destructive' }),
    });
  };

  const handleViewActivity = (userId: string) => {
    setSelectedUserId(userId);
    activityMutation.mutate({ id: userId, params: { page: 1, limit: 20 } }, {
      onSuccess: (data) => {
        setActivityData(data);
        setActivityOpen(true);
      },
      onError: () => toast({ title: 'Failed to load activity', variant: 'destructive' }),
    });
  };

  // ✅ NEW: Handle view businesses
  const handleViewBusinesses = (userId: string) => {
    setSelectedUserId(userId);
    setBusinessOpen(true);
  };

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const toggleAllUsers = () => {
    if (selectedUsers.length === data?.data?.items?.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(data?.data?.items?.map((u: User) => u._id) || []);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-xl sm:text-2xl font-bold text-foreground">User Management</h1>
          <p className="text-sm text-muted-foreground">Manage all users across the platform</p>
        </div>
        
        <div className="flex gap-2">
          {/* Export Buttons */}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => handleExport('csv')}
            disabled={exportMutation.isPending}
          >
            <Download className="h-4 w-4 mr-2" />
            CSV
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => handleExport('excel')}
            disabled={exportMutation.isPending}
          >
            <Download className="h-4 w-4 mr-2" />
            Excel
          </Button>
          
          {/* Create User */}
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button className="gradient-primary text-primary-foreground gap-2">
                <UserPlus className="h-4 w-4" /> Create User
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader><DialogTitle>Create New User</DialogTitle></DialogHeader>
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input 
                    value={formData.name} 
                    onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} 
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Mobile</Label>
                  <Input 
                    value={formData.mobile} 
                    onChange={e => setFormData(p => ({ ...p, mobile: e.target.value }))} 
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input 
                    type="email" 
                    value={formData.email} 
                    onChange={e => setFormData(p => ({ ...p, email: e.target.value }))} 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Role</Label>
                  <Select value={formData.role} onValueChange={(v: UserRole) => setFormData(p => ({ ...p, role: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="owner">Owner</SelectItem>
                      <SelectItem value="user">User</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Password</Label>
                  <Input
                    type="password"
                    value={formData.password}
                    onChange={e => setFormData(p => ({ ...p, password: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Confirm Password</Label>
                  <Input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={e => setFormData(p => ({ ...p, confirmPassword: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Notes</Label>
                  <Input
                    value={formData.notes}
                    onChange={e => setFormData(p => ({ ...p, notes: e.target.value }))}
                    placeholder="Optional notes..."
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="acceptTerms"
                    checked={formData.acceptTerms}
                    onCheckedChange={(checked) => setFormData(p => ({ ...p, acceptTerms: checked as boolean }))}
                    required
                  />
                  <Label htmlFor="acceptTerms" className="text-sm">
                    Accept Terms and Conditions
                  </Label>
                </div>
                <Button type="submit" className="w-full gradient-primary text-primary-foreground" disabled={createMutation.isPending}>
                  {createMutation.isPending ? 'Creating...' : 'Create User'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedUsers.length > 0 && (
        <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
          <span className="text-sm">{selectedUsers.length} users selected</span>
          <div className="flex gap-2">
            <Button size="sm" onClick={() => handleBulkAction('activate')}>
              <CheckCircle className="h-4 w-4 mr-1" /> Activate
            </Button>
            <Button size="sm" variant="destructive" onClick={() => handleBulkAction('block')}>
              <Ban className="h-4 w-4 mr-1" /> Block
            </Button>
            <Button size="sm" variant="destructive" onClick={() => handleBulkAction('delete')}>
              <Trash2 className="h-4 w-4 mr-1" /> Delete
            </Button>
            <Button size="sm" variant="outline" onClick={() => setSelectedUsers([])}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Activity Log Dialog */}
      <Dialog open={activityOpen} onOpenChange={setActivityOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader><DialogTitle>User Activity Log</DialogTitle></DialogHeader>
          {activityData && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 p-3 bg-muted rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground">Total Logins</p>
                  <p className="font-semibold">{activityData.summary?.loginCount || 0}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Failed Attempts</p>
                  <p className="font-semibold">{activityData.summary?.failedAttempts || 0}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Last Login</p>
                  <p className="font-semibold">
                    {activityData.summary?.lastLogin 
                      ? new Date(activityData.summary.lastLogin).toLocaleString()
                      : 'Never'
                    }
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Last Activity</p>
                  <p className="font-semibold">
                    {activityData.summary?.lastActivity 
                      ? new Date(activityData.summary.lastActivity).toLocaleString()
                      : 'Never'
                    }
                  </p>
                </div>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-semibold">Login History</h4>
                {activityData.loginHistory?.map((entry: any, index: number) => (
                  <div key={index} className="p-3 border rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{entry.status === 'success' ? '✅ Success' : '❌ Failed'}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(entry.timestamp).toLocaleString()}
                        </p>
                        <p className="text-sm">IP: {entry.ip}</p>
                        {entry.location && (
                          <p className="text-sm">
                            Location: {entry.location.city}, {entry.location.country}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ✅ UPDATED: User Businesses & Leads Dialog with Debug Info */}
<Dialog open={businessOpen} onOpenChange={setBusinessOpen}>
  <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
    <DialogHeader>
      <DialogTitle>User Businesses & Leads</DialogTitle>
    </DialogHeader>
    
    {/* ✅ DEBUG INFO - Remove later */}
    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg mb-4">
      <p className="text-sm font-medium">Debug Info:</p>
      <p className="text-xs">User ID: {selectedUserId}</p>
      <p className="text-xs">Businesses Count: {userBusinesses?.length || 0}</p>
      <p className="text-xs">Leads Count: {userLeads?.length || 0}</p>
      <p className="text-xs">Businesses Loading: {businessesLoading ? 'Yes' : 'No'}</p>
      <p className="text-xs">Leads Loading: {leadsLoading ? 'Yes' : 'No'}</p>
    </div>
    
    <Tabs defaultValue="businesses" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="businesses" className="flex items-center gap-2">
          <Building className="h-4 w-4" />
          Businesses ({userBusinesses?.length || 0})
        </TabsTrigger>
        <TabsTrigger value="leads" className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          Leads ({userLeads?.length || 0})
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="businesses" className="mt-4">
        <div className="space-y-4">
          <h3 className="font-semibold">Businesses</h3>
          {businessesLoading ? (
            <TableSkeleton cols={5} />
          ) : userBusinesses && userBusinesses.length > 0 ? (
            <>
              {/* ✅ DEBUG: Show raw data */}
              <div className="p-2 bg-gray-50 rounded text-xs">
                <p>Raw Business Data: {JSON.stringify(userBusinesses[0], null, 2)}</p>
              </div>
              
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Business Name</TableHead>
                    <TableHead>Premium</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {userBusinesses.map((business: any) => (
                    <TableRow key={business._id}>
                      <TableCell className="font-medium">
                        {business.businessName || 'No Name'}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={business.isPremium ? 'premium' : 'normal'} />
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={business.status || 'unknown'} />
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {business.createdAt ? new Date(business.createdAt).toLocaleDateString() : 'No Date'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>No businesses found</p>
              <p className="text-xs mt-2">Check browser console for debug info</p>
            </div>
          )}
        </div>
      </TabsContent>
      
      <TabsContent value="leads" className="mt-4">
        <div className="space-y-4">
          <h3 className="font-semibold">Leads</h3>
          {leadsLoading ? (
            <TableSkeleton cols={4} />
          ) : userLeads && userLeads.length > 0 ? (
            <>
              {/* ✅ DEBUG: Show raw data */}
              <div className="p-2 bg-gray-50 rounded text-xs">
                <p>Raw Lead Data: {JSON.stringify(userLeads[0], null, 2)}</p>
              </div>
              
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Mobile</TableHead>
                    <TableHead>Message</TableHead>
                    <TableHead>Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {userLeads.map((lead: any) => (
                    <TableRow key={lead._id}>
                      <TableCell className="font-medium">
                        {lead.name || 'No Name'}
                      </TableCell>
                      <TableCell>{lead.mobile || 'No Mobile'}</TableCell>
                      <TableCell className="max-w-xs truncate">
                        {lead.message || 'No Message'}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {lead.createdAt ? new Date(lead.createdAt).toLocaleDateString() : 'No Date'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>No leads found</p>
              <p className="text-xs mt-2">Check browser console for debug info</p>
            </div>
          )}
        </div>
      </TabsContent>
    </Tabs>
  </DialogContent>
</Dialog>

      {/* Users Table */}
      <div className="rounded-xl border bg-card card-shadow">
        <div className="p-5 border-b border-border">
          <DataTableHeader
            searchValue={search}
            onSearchChange={setSearch}
            searchPlaceholder="Search users..."
            filters={[
              { 
                key: 'role', 
                label: 'Role', 
                value: filters.role || 'all', 
                onChange: (v) => setFilters(p => ({ ...p, role: v === 'all' ? undefined : v, page: 1 })), 
                options: [
                  { value: 'admin', label: 'Admin' }, 
                  { value: 'owner', label: 'Owner' }, 
                  { value: 'user', label: 'User' }
                ] 
              },
              { 
                key: 'status', 
                label: 'Status', 
                value: filters.status || 'all', 
                onChange: (v) => setFilters(p => ({ ...p, status: v === 'all' ? undefined : v, page: 1 })), 
                options: [
                  { value: 'active', label: 'Active' }, 
                  { value: 'blocked', label: 'Blocked' },
                  { value: 'inactive', label: 'Inactive' }
                ] 
              },
            ]}
          />
        </div>
        
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedUsers.length === data?.data?.items?.length && data?.data?.items?.length > 0}
                    onCheckedChange={toggleAllUsers}
                  />
                </TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Mobile</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Login</TableHead>
                <TableHead>Businesses</TableHead>
                <TableHead>Leads</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? <TableSkeleton cols={10} /> : data?.data?.items?.map((u: User) => (
                <TableRow key={u._id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedUsers.includes(u._id)}
                      onCheckedChange={() => toggleUserSelection(u._id)}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{u.name}</TableCell>
                  <TableCell className="text-muted-foreground">{u.mobile}</TableCell>
                  <TableCell className="text-muted-foreground">{u.email || '—'}</TableCell>
                  <TableCell><StatusBadge status={u.role} /></TableCell>
                  <TableCell><StatusBadge status={u.status} /></TableCell>
                  <TableCell className="text-muted-foreground">
                    {u.activity?.lastLogin 
                      ? new Date(u.activity.lastLogin).toLocaleDateString()
                      : 'Never'
                    }
                  </TableCell>
                  <TableCell className="text-muted-foreground">{u.businessCount || 0}</TableCell>
                  <TableCell className="text-muted-foreground">{u.leadCount || 0}</TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8" 
                        onClick={() => handleViewBusinesses(u._id)}
                        title="View Businesses & Leads"
                      >
                        <Building className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8" 
                        onClick={() => handleViewActivity(u._id)}
                        title="View Activity"
                      >
                        <History className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8" 
                        onClick={() => { setSelectedUserId(u._id); setSubOpen(true); }}
                        title="Subscription"
                      >
                        <Crown className="h-4 w-4 text-premium" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className={`h-8 w-8 ${u.status === 'active' ? 'text-destructive' : 'text-success'}`}
                        onClick={() => updateStatusMutation.mutate({ 
                          id: u._id, 
                          status: u.status === 'active' ? 'blocked' : 'active' 
                        }, { onSuccess: () => toast({ title: 'Updated' }) })} 
                        disabled={updateStatusMutation.isPending}
                        title={u.status === 'active' ? 'Block User' : 'Activate User'}
                      >
                        {u.status === 'active' ? <Ban className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-destructive"
                        onClick={() => deleteMutation.mutate(u._id, { onSuccess: () => toast({ title: 'Deleted' }) })} 
                        disabled={deleteMutation.isPending}
                        title="Delete User"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {!isLoading && (!data?.data?.items || data.data.items.length === 0) && (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                    No users found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        
        {data?.data?.pagination && data.data.pagination.totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-border">
            <p className="text-sm text-muted-foreground">
              Page {data.data.pagination.page} of {data.data.pagination.totalPages}
            </p>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                disabled={data.data.pagination.page <= 1} 
                onClick={() => setFilters(p => ({ ...p, page: (p.page || 1) - 1 }))}
              >
                Previous
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                disabled={data.data.pagination.page >= data.data.pagination.totalPages} 
                onClick={() => setFilters(p => ({ ...p, page: (p.page || 1) + 1 }))}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}