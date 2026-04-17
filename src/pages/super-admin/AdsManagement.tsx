import { useState } from 'react';
import { useAds, useCreateAd, useUpdateAd, useDeleteAd, useToggleAdStatus, useUploadAdImage } from '@/services/adsService';
import { StatusBadge } from '@/components/StatusBadge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { TableSkeleton } from '@/components/TableSkeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Power, PowerOff, Image as ImageIcon, Eye, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { DataTableHeader } from '@/components/DataTableHeader';
import type { Ad, AdFormData, AdFilters, AdType, AdStatus } from '@/types';

export default function AdsManagement() {
    const [search, setSearch] = useState('');
    const [filters, setFilters] = useState<AdFilters>({ page: 1, limit: 20 });
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [selectedAd, setSelectedAd] = useState<Ad | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string>('');
    const [formData, setFormData] = useState<AdFormData>({
        title: '',
        description: '',
        type: 'banner',
        startDate: '',
        endDate: '',
        redirectUrl: '',
        targetCategory: '',
        priority: 1,
        imageUrl: '',
        isActive: true
    });

    const { toast } = useToast();
    const { data, isLoading } = useAds({ ...filters, search: search || undefined });
    const createMutation = useCreateAd();
    const updateMutation = useUpdateAd();
    const deleteMutation = useDeleteAd();
    const toggleStatusMutation = useToggleAdStatus();
    const uploadImageMutation = useUploadAdImage();

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            let imageUrl = formData.imageUrl;

            // Upload image if selected
            if (imageFile) {
                const uploadResponse = await uploadImageMutation.mutateAsync(imageFile);
                imageUrl = uploadResponse.data.imageUrl;
            }

            const payload = { ...formData, imageUrl, isActive: formData.isActive };
            await createMutation.mutateAsync(payload);

            toast({
                title: 'Ad Created',
                description: `${formData.title} has been created successfully`
            });

            setCreateDialogOpen(false);
            resetForm();
        } catch (err: any) {
            toast({
                title: 'Error',
                description: err?.response?.data?.message || 'Failed to create ad',
                variant: 'destructive'
            });
        }
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedAd) return;

        try {
            let imageUrl = formData.imageUrl;

            // Upload image if selected
            if (imageFile) {
                const uploadResponse = await uploadImageMutation.mutateAsync(imageFile);
                imageUrl = uploadResponse.data.imageUrl;
            }

            const payload = { ...formData, imageUrl, isActive: formData.isActive };
             await updateMutation.mutateAsync({ id: selectedAd._id, data: payload });

            toast({
                title: 'Ad Updated',
                description: `${formData.title} has been updated successfully`
            });

            setEditDialogOpen(false);
            resetForm();
            setSelectedAd(null);
        } catch (err: any) {
            toast({
                title: 'Error',
                description: err?.response?.data?.message || 'Failed to update ad',
                variant: 'destructive'
            });
        }
    };

    const handleDelete = async (id: string, title: string) => {
        try {
            await deleteMutation.mutateAsync(id);
            toast({
                title: 'Ad Deleted',
                description: `${title} has been deleted successfully`
            });
        } catch (err: any) {
            toast({
                title: 'Error',
                description: err?.response?.data?.message || 'Failed to delete ad',
                variant: 'destructive'
            });
        }
    };

    const handleToggleStatus = async (id: string, title: string) => {
        try {
            await toggleStatusMutation.mutateAsync(id);
            toast({
                title: 'Status Updated',
                description: `${title} status has been updated`
            });
        } catch (err: any) {
            toast({
                title: 'Error',
                description: err?.response?.data?.message || 'Failed to update status',
                variant: 'destructive'
            });
        }
    };

    const handleEdit = (ad: Ad) => {
        setSelectedAd(ad);
        setFormData({
            title: ad.title,
            description: ad.description || '',
            type: ad.type,
            startDate: ad.startDate.split('T')[0],
            endDate: ad.endDate.split('T')[0],
            redirectUrl: ad.redirectUrl || '',
            targetCategory: ad.targetCategory || '',
            priority: ad.priority,
            imageUrl: ad.imageUrl || '',
            isActive: ad.isActive
        });
        setImagePreview(ad.imageUrl || '');
        setEditDialogOpen(true);
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const resetForm = () => {
        setFormData({
            title: '',
            description: '',
            type: 'banner',
            startDate: '',
            endDate: '',
            redirectUrl: '',
            targetCategory: '',
            priority: 1,
            imageUrl: '',
            isActive: true
        });
        setImageFile(null);
        setImagePreview('');
    };

    const getAdTypeColor = (type: AdType) => {
        const colors = {
            banner: 'bg-blue-100 text-blue-800',
            sidebar: 'bg-green-100 text-green-800',
            popup: 'bg-purple-100 text-purple-800',
            featured: 'bg-orange-100 text-orange-800',
            category: 'bg-pink-100 text-pink-800'
        };
        return colors[type] || 'bg-gray-100 text-gray-800';
    };

    const isAdActive = (ad: Ad) => {
        const now = new Date();
        const start = new Date(ad.startDate);
        const end = new Date(ad.endDate);
        return ad.isActive && now >= start && now <= end;
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <h1 className="font-display text-xl sm:text-2xl font-bold text-foreground">Ads Management</h1>
                    <p className="text-sm text-muted-foreground">Manage advertisements and promotional content</p>
                </div>
                <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="gradient-primary text-primary-foreground gap-2">
                            <Plus className="h-4 w-4" /> Create Ad
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Create New Advertisement</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="title">Title *</Label>
                                    <Input
                                        id="title"
                                        value={formData.title}
                                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                        placeholder="Enter ad title"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="type">Ad Type *</Label>
                                    <Select value={formData.type} onValueChange={(value: AdType) => setFormData(prev => ({ ...prev, type: value }))}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select ad type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="banner">Banner</SelectItem>
                                            <SelectItem value="sidebar">Sidebar</SelectItem>
                                            <SelectItem value="popup">Popup</SelectItem>
                                            <SelectItem value="featured">Featured</SelectItem>
                                            <SelectItem value="category">Category</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    value={formData.description}
                                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                    placeholder="Enter ad description"
                                    rows={3}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="startDate">Start Date *</Label>
                                    <Input
                                        id="startDate"
                                        type="date"
                                        value={formData.startDate}
                                        onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="endDate">End Date *</Label>
                                    <Input
                                        id="endDate"
                                        type="date"
                                        value={formData.endDate}
                                        onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="redirectUrl">Redirect URL</Label>
                                <Input
                                    id="redirectUrl"
                                    type="url"
                                    value={formData.redirectUrl}
                                    onChange={(e) => setFormData(prev => ({ ...prev, redirectUrl: e.target.value }))}
                                    placeholder="https://example.com"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="targetCategory">Target Category</Label>
                                    <Input
                                        id="targetCategory"
                                        value={formData.targetCategory}
                                        onChange={(e) => setFormData(prev => ({ ...prev, targetCategory: e.target.value }))}
                                        placeholder="e.g., restaurants, hotels"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="priority">Priority (1-10)</Label>
                                    <Input
                                        id="priority"
                                        type="number"
                                        min="1"
                                        max="10"
                                        value={formData.priority}
                                        onChange={(e) => setFormData(prev => ({ ...prev, priority: parseInt(e.target.value) || 1 }))}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="status">Status</Label>
                                <Select
                                    value={formData.isActive?.toString() || 'true'}
                                    onValueChange={(value) => setFormData(prev => ({ ...prev, isActive: value === 'true' }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="true">Active</SelectItem>
                                        <SelectItem value="false">Inactive</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="image">Ad Image</Label>
                                <Input
                                    id="image"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                />
                                {imagePreview && (
                                    <div className="mt-2">
                                        <img
                                            src={imagePreview}
                                            alt="Preview"
                                            className="max-w-full h-32 object-cover rounded-lg border"
                                        />
                                    </div>
                                )}
                            </div>

                            <Button
                                type="submit"
                                className="w-full gradient-primary text-primary-foreground"
                                disabled={createMutation.isPending || uploadImageMutation.isPending}
                            >
                                {createMutation.isPending || uploadImageMutation.isPending ? 'Creating...' : 'Create Ad'}
                            </Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3">
                <Select value={filters.type || 'all'} onValueChange={(value) => setFilters(prev => ({ ...prev, type: value === 'all' ? undefined : value as AdType }))}>
                    <SelectTrigger className="w-40">
                        <SelectValue placeholder="Filter by type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="banner">Banner</SelectItem>
                        <SelectItem value="sidebar">Sidebar</SelectItem>
                        <SelectItem value="popup">Popup</SelectItem>
                        <SelectItem value="featured">Featured</SelectItem>
                        <SelectItem value="category">Category</SelectItem>
                    </SelectContent>
                </Select>

                <Select value={filters.status || 'all'} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value === 'all' ? undefined : value as AdStatus }))}>
                    <SelectTrigger className="w-40">
                        <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                        <SelectItem value="expired">Expired</SelectItem>
                        <SelectItem value="scheduled">Scheduled</SelectItem>
                    </SelectContent>
                </Select>

                <Select value={filters.isActive?.toString() || 'all'} onValueChange={(value) => setFilters(prev => ({ ...prev, isActive: value === 'all' ? undefined : value === 'true' ? true : false }))}>
                    <SelectTrigger className="w-40">
                        <SelectValue placeholder="Active status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="true">Active</SelectItem>
                        <SelectItem value="false">Inactive</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Table */}
            <div className="rounded-xl border bg-card card-shadow">
                <div className="p-5 border-b border-border">
                    <DataTableHeader searchValue={search} onSearchChange={setSearch} searchPlaceholder="Search ads..." />
                </div>
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Title</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Duration</TableHead>
                                <TableHead>Performance</TableHead>
                                <TableHead>Priority</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? <TableSkeleton cols={7} /> : (Array.isArray(data) ? data : data?.data || data?.items || [])?.map((ad: Ad) => (
                                <TableRow key={ad._id}>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            {ad.imageUrl && (
                                                <img
                                                    src={ad.imageUrl}
                                                    alt={ad.title}
                                                    className="w-10 h-10 object-cover rounded-lg border"
                                                />
                                            )}
                                            <div>
                                                <div className="font-medium">{ad.title}</div>
                                                {ad.description && (
                                                    <div className="text-sm text-muted-foreground truncate max-w-xs">
                                                        {ad.description}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge className={getAdTypeColor(ad.type)}>
                                            {ad.type}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="space-y-1">
                                            <StatusBadge status={isAdActive(ad) ? 'active' : 'inactive'} />
                                            <div className="text-xs text-muted-foreground">
                                                {new Date(ad.startDate).toLocaleDateString()} - {new Date(ad.endDate).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="text-sm">
                                            <div>{new Date(ad.startDate).toLocaleDateString()}</div>
                                            <div className="text-muted-foreground">to {new Date(ad.endDate).toLocaleDateString()}</div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="text-sm">
                                            <div>{ad.impressions} impressions</div>
                                            <div className="text-muted-foreground">{ad.clicks} clicks</div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={ad.priority > 7 ? 'destructive' : ad.priority > 4 ? 'default' : 'secondary'}>
                                            {ad.priority}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex justify-end gap-1">
                                            <Button variant="ghost" size="sm" onClick={() => handleEdit(ad)}>
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleToggleStatus(ad._id, ad.title)}
                                                disabled={toggleStatusMutation.isPending}
                                            >
                                                {ad.isActive ? <PowerOff className="h-4 w-4" /> : <Power className="h-4 w-4" />}
                                            </Button>
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button variant="ghost" size="sm" className="text-destructive">
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Delete Ad</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            Are you sure you want to delete "{ad.title}"? This action cannot be undone.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                        <AlertDialogAction
                                                            onClick={() => handleDelete(ad._id, ad.title)}
                                                            className="bg-destructive text-destructive-foreground"
                                                        >
                                                            Delete
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {!isLoading && (!data?.items || data.items.length === 0) && (
                                <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No ads found</TableCell></TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {/* Edit Dialog */}
            <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Edit Advertisement</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleUpdate} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit-title">Title *</Label>
                                <Input
                                    id="edit-title"
                                    value={formData.title}
                                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                    placeholder="Enter ad title"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="edit-type">Ad Type *</Label>
                                <Select value={formData.type} onValueChange={(value: AdType) => setFormData(prev => ({ ...prev, type: value }))}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select ad type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="banner">Banner</SelectItem>
                                        <SelectItem value="sidebar">Sidebar</SelectItem>
                                        <SelectItem value="popup">Popup</SelectItem>
                                        <SelectItem value="featured">Featured</SelectItem>
                                        <SelectItem value="category">Category</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="edit-description">Description</Label>
                            <Textarea
                                id="edit-description"
                                value={formData.description}
                                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                placeholder="Enter ad description"
                                rows={3}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit-startDate">Start Date *</Label>
                                <Input
                                    id="edit-startDate"
                                    type="date"
                                    value={formData.startDate}
                                    onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="edit-endDate">End Date *</Label>
                                <Input
                                    id="edit-endDate"
                                    type="date"
                                    value={formData.endDate}
                                    onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="edit-redirectUrl">Redirect URL</Label>
                            <Input
                                id="edit-redirectUrl"
                                type="url"
                                value={formData.redirectUrl}
                                onChange={(e) => setFormData(prev => ({ ...prev, redirectUrl: e.target.value }))}
                                placeholder="https://example.com"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit-targetCategory">Target Category</Label>
                                <Input
                                    id="edit-targetCategory"
                                    value={formData.targetCategory}
                                    onChange={(e) => setFormData(prev => ({ ...prev, targetCategory: e.target.value }))}
                                    placeholder="e.g., restaurants, hotels"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="edit-priority">Priority (1-10)</Label>
                                <Input
                                    id="edit-priority"
                                    type="number"
                                    min="1"
                                    max="10"
                                    value={formData.priority}
                                    onChange={(e) => setFormData(prev => ({ ...prev, priority: parseInt(e.target.value) || 1 }))}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-status">Status</Label>
                            <Select
                                value={formData.isActive?.toString() || 'true'}
                                onValueChange={(value) => setFormData(prev => ({ ...prev, isActive: value === 'true' }))}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="true">Active</SelectItem>
                                    <SelectItem value="false">Inactive</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-image">Ad Image</Label>
                            <Input
                                id="edit-image"
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                            />
                            {imagePreview && (
                                <div className="mt-2">
                                    <img
                                        src={imagePreview}
                                        alt="Preview"
                                        className="max-w-full h-32 object-cover rounded-lg border"
                                    />
                                </div>
                            )}
                        </div>

                        <Button
                            type="submit"
                            className="w-full gradient-primary text-primary-foreground"
                            disabled={updateMutation.isPending || uploadImageMutation.isPending}
                        >
                            {updateMutation.isPending || uploadImageMutation.isPending ? 'Updating...' : 'Update Ad'}
                        </Button>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}