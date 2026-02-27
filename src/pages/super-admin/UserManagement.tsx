import { useState } from 'react';
import { useUsers, useCreateUser, useToggleBlockUser, useActivateSubscription, useDeleteUser } from '@/services/userService';
import { StatusBadge } from '@/components/StatusBadge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { TableSkeleton } from '@/components/TableSkeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { UserPlus, Ban, CheckCircle, Trash2, Crown, Pencil } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { DataTableHeader } from '@/components/DataTableHeader';
import type { UserFilters, Subscription, UserRole } from '@/types';

export default function UserManagement() {
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<UserFilters>({ page: 1, limit: 20 });
  const [createOpen, setCreateOpen] = useState(false);
  const [subOpen, setSubOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [formData, setFormData] = useState({ name: '', mobile: '', email: '', role: 'user' as UserRole });
  const [subData, setSubData] = useState<Partial<Subscription>>({ planType: '', startDate: '', expiryDate: '', status: 'active' });
  const { toast } = useToast();

  const { data, isLoading } = useUsers({ ...filters, search: search || undefined });
  const toggleBlockMutation = useToggleBlockUser();
  const createMutation = useCreateUser();
  const deleteMutation = useDeleteUser();
  const subMutation = useActivateSubscription();

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData, {
      onSuccess: () => {
        toast({ title: 'User Created' });
        setCreateOpen(false);
        setFormData({ name: '', mobile: '', email: '', role: 'user' });
      },
      onError: (err: any) => toast({ title: 'Error', description: err?.response?.data?.message || 'Failed', variant: 'destructive' }),
    });
  };

  const handleActivateSubscription = (e: React.FormEvent) => {
    e.preventDefault();
    subMutation.mutate({ id: selectedUserId, subscription: subData }, {
      onSuccess: () => { toast({ title: 'Subscription Activated' }); setSubOpen(false); },
      onError: (err: any) => toast({ title: 'Error', description: err?.response?.data?.message || 'Failed', variant: 'destructive' }),
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-xl sm:text-2xl font-bold text-foreground">User Management</h1>
          <p className="text-sm text-muted-foreground">Manage all users across the platform</p>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button className="gradient-primary text-primary-foreground gap-2">
              <UserPlus className="h-4 w-4" /> Create User
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Create New User</DialogTitle></DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2"><Label>Name</Label><Input value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} required /></div>
              <div className="space-y-2"><Label>Mobile</Label><Input value={formData.mobile} onChange={e => setFormData(p => ({ ...p, mobile: e.target.value }))} required /></div>
              <div className="space-y-2"><Label>Email</Label><Input type="email" value={formData.email} onChange={e => setFormData(p => ({ ...p, email: e.target.value }))} required /></div>
              <div className="space-y-2">
                <Label>Role</Label>
                <Select value={formData.role} onValueChange={(v: UserRole) => setFormData(p => ({ ...p, role: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="super_admin">Super Admin</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="salesman">Salesman</SelectItem>
                    <SelectItem value="owner">Owner</SelectItem>
                    <SelectItem value="user">User</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full gradient-primary text-primary-foreground" disabled={createMutation.isPending}>
                {createMutation.isPending ? 'Creating...' : 'Create User'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Subscription Modal */}
      <Dialog open={subOpen} onOpenChange={setSubOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Activate Subscription</DialogTitle></DialogHeader>
          <form onSubmit={handleActivateSubscription} className="space-y-4">
            <div className="space-y-2"><Label>Plan Type</Label><Input value={subData.planType} onChange={e => setSubData(p => ({ ...p, planType: e.target.value }))} required /></div>
            <div className="space-y-2"><Label>Start Date</Label><Input type="date" value={subData.startDate} onChange={e => setSubData(p => ({ ...p, startDate: e.target.value }))} required /></div>
            <div className="space-y-2"><Label>Expiry Date</Label><Input type="date" value={subData.expiryDate} onChange={e => setSubData(p => ({ ...p, expiryDate: e.target.value }))} required /></div>
            <Button type="submit" className="w-full gradient-primary text-primary-foreground" disabled={subMutation.isPending}>
              {subMutation.isPending ? 'Activating...' : 'Activate'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <div className="rounded-xl border bg-card card-shadow">
        <div className="p-5 border-b border-border">
          <DataTableHeader
            searchValue={search}
            onSearchChange={setSearch}
            searchPlaceholder="Search users..."
            filters={[
              { key: 'role', label: 'Role', value: filters.role || 'all', onChange: (v) => setFilters(p => ({ ...p, role: v === 'all' ? undefined : v, page: 1 })), options: [{ value: 'super_admin', label: 'Super Admin' }, { value: 'admin', label: 'Admin' }, { value: 'salesman', label: 'Salesman' }, { value: 'owner', label: 'Owner' }, { value: 'user', label: 'User' }] },
              { key: 'status', label: 'Status', value: filters.status || 'all', onChange: (v) => setFilters(p => ({ ...p, status: v === 'all' ? undefined : v, page: 1 })), options: [{ value: 'active', label: 'Active' }, { value: 'blocked', label: 'Blocked' }] },
            ]}
          />
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Mobile</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Subscription</TableHead>
                <TableHead>Expiry</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? <TableSkeleton cols={8} /> : data?.data?.items?.map((u) => (<TableRow key={u._id}>
                <TableCell className="font-medium">{u.name}</TableCell>
                <TableCell className="text-muted-foreground">{u.mobile}</TableCell>
                <TableCell className="text-muted-foreground">{u.email}</TableCell>
                <TableCell><StatusBadge status={u.role} /></TableCell>
                <TableCell><StatusBadge status={u.status} /></TableCell>
                <TableCell><StatusBadge status={u.subscription?.status || 'none'} /></TableCell>
                <TableCell className="text-muted-foreground">{u.subscription?.expiryDate ? new Date(u.subscription.expiryDate).toLocaleDateString() : '—'}</TableCell>
                <TableCell>
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setSelectedUserId(u._id); setSubOpen(true); }}>
                      <Crown className="h-4 w-4 text-premium" />
                    </Button>
                    <Button variant="ghost" size="icon" className={`h-8 w-8 ${u.status === 'active' ? 'text-destructive' : 'text-success'}`}
                      onClick={() => toggleBlockMutation.mutate(u._id, { onSuccess: () => toast({ title: 'Updated' }) })} disabled={toggleBlockMutation.isPending}>
                      {u.status === 'active' ? <Ban className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive"
                      onClick={() => deleteMutation.mutate(u._id, { onSuccess: () => toast({ title: 'Deleted' }) })} disabled={deleteMutation.isPending}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
              ))}
              {!isLoading && (!data?.data?.items || data.data.items.length === 0) && (<TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">No users found</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </div>
{data?.data?.pagination && data.data.pagination.totalPages > 1 && (<div className="flex items-center justify-between p-4 border-t border-border">
            <p className="text-sm text-muted-foreground">Page {data.data.pagination.page} of {data.data.pagination.totalPages}</p>
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
