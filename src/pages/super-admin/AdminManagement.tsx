import { useState } from 'react';
import { useUsers, useToggleBlockUser } from '@/services/userService';
import { useCreateAdmin } from '@/services/adminService';
import { StatusBadge } from '@/components/StatusBadge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { TableSkeleton } from '@/components/TableSkeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { UserPlus, Ban, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { DataTableHeader } from '@/components/DataTableHeader';
import type { UserFilters } from '@/types';
import { a } from 'vitest/dist/chunks/suite.d.FvehnV49.js';

interface AdminFormData {
  name: string;
  mobile: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export default function AdminManagement() {
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<UserFilters>({ page: 1, limit: 20, role: 'admin' });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState<AdminFormData>({
    name: '',
    mobile: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState<Partial<AdminFormData>>({});
  const { toast } = useToast();

  const { data, isLoading } = useUsers({ ...filters, search: search || undefined });
  const toggleBlockMutation = useToggleBlockUser();
  const createAdminMutation = useCreateAdmin();

  const validateForm = (): boolean => {
    const newErrors: Partial<AdminFormData> = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.length < 2 || formData.name.length > 120) {
      newErrors.name = 'Name must be between 2 and 120 characters';
    }

    // Mobile validation
    const mobileRegex = /^\d{10}$/;
    if (!formData.mobile.trim()) {
      newErrors.mobile = 'Mobile number is required';
    } else if (!mobileRegex.test(formData.mobile)) {
      newErrors.mobile = 'Mobile must be exactly 10 digits';
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const payload = {
      action: 'create_admin' as const,
      name: formData.name.trim(),
      mobile: formData.mobile.trim(),
      email: formData.email.trim(),
      password: formData.password
    };

    createAdminMutation.mutate(payload, {
      onSuccess: () => {
        toast({ 
          title: 'Admin Created', 
          description: `${formData.name} has been created successfully` 
        });
        setDialogOpen(false);
        setFormData({
          name: '',
          mobile: '',
          email: '',
          password: '',
          confirmPassword: ''
        });
        setErrors({});
      },
      onError: (err: any) => {
        toast({ 
          title: 'Error', 
          description: err?.response?.data?.message || 'Failed to create admin', 
          variant: 'destructive' 
        });
      },
    });
  };

  const handleToggleBlock = (id: string, name: string) => {
    toggleBlockMutation.mutate(id, {
      onSuccess: () => toast({ title: 'Updated', description: `${name} status updated` }),
      onError: (err: any) => toast({ title: 'Error', description: err?.response?.data?.message || 'Failed', variant: 'destructive' }),
    });
  };

  const handleInputChange = (field: keyof AdminFormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-xl sm:text-2xl font-bold text-foreground">Admin Management</h1>
          <p className="text-sm text-muted-foreground">Manage administrators and their access</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gradient-primary text-primary-foreground gap-2">
              <UserPlus className="h-4 w-4" /> Create Admin
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Admin</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input 
                  id="name"
                  value={formData.name} 
                  onChange={handleInputChange('name')}
                  placeholder="Enter admin name"
                  className={errors.name ? 'border-red-500' : ''}
                />
                {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="mobile">Mobile Number *</Label>
                <Input 
                  id="mobile"
                  value={formData.mobile} 
                  onChange={handleInputChange('mobile')}
                  placeholder="Enter 10-digit mobile number"
                  maxLength={10}
                  className={errors.mobile ? 'border-red-500' : ''}
                />
                {errors.mobile && <p className="text-sm text-red-500">{errors.mobile}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input 
                  id="email"
                  type="email" 
                  value={formData.email} 
                  onChange={handleInputChange('email')}
                  placeholder="Enter email address"
                  className={errors.email ? 'border-red-500' : ''}
                />
                {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password *</Label>
                <Input 
                  id="password"
                  type="password" 
                  value={formData.password} 
                  onChange={handleInputChange('password')}
                  placeholder="Enter password (min 8 chars)"
                  className={errors.password ? 'border-red-500' : ''}
                />
                {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password *</Label>
                <Input 
                  id="confirmPassword"
                  type="password" 
                  value={formData.confirmPassword} 
                  onChange={handleInputChange('confirmPassword')}
                  placeholder="Confirm password"
                  className={errors.confirmPassword ? 'border-red-500' : ''}
                />
                {errors.confirmPassword && <p className="text-sm text-red-500">{errors.confirmPassword}</p>}
              </div>

              <Button 
                type="submit" 
                className="w-full gradient-primary text-primary-foreground" 
                disabled={createAdminMutation.isPending}
              >
                {createAdminMutation.isPending ? 'Creating...' : 'Create Admin'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-xl border bg-card card-shadow">
        <div className="p-5 border-b border-border">
          <DataTableHeader searchValue={search} onSearchChange={setSearch} searchPlaceholder="Search admins..." />
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Mobile</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? <TableSkeleton cols={6} /> : data?.data?.items?.map((a) => (
                <TableRow key={a._id}>
                  <TableCell className="font-medium">{a.name}</TableCell>
                  <TableCell className="text-muted-foreground">{a.email}</TableCell>
                  <TableCell className="text-muted-foreground">{a.mobile}</TableCell>
                  <TableCell><StatusBadge status={a.status} /></TableCell>
                  <TableCell className="text-muted-foreground">{new Date(a.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="sm" className={a.status === 'active' ? 'text-destructive' : 'text-success'}
                        onClick={() => handleToggleBlock(a._id, a.name)} disabled={toggleBlockMutation.isPending}>
                        {a.status === 'active' ? <Ban className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {!isLoading && (!data?.items || data.items.length === 0) && (
                <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No admins found</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}