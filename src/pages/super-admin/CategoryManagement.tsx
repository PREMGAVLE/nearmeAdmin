import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CategoryForm } from '@/components/CategoryForm';
import { CategoryApprovalTable } from '@/components/CategoryApprovalTable';
import { useCategories } from '@/services/categoryService';
import { useUsers } from '@/services/userService';
import { Plus, Clock, List, Edit, Trash2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter } from 'lucide-react';
import * as FaIcons from 'react-icons/fa';
import * as MdIcons from 'react-icons/md';
import * as IoIcons from 'react-icons/io';
import * as BsIcons from 'react-icons/bs';
import * as AiIcons from 'react-icons/ai';
import * as BiIcons from 'react-icons/bi';
import * as CiIcons from 'react-icons/ci';
import * as DiIcons from 'react-icons/di';
import * as FiIcons from 'react-icons/fi';
import * as GiIcons from 'react-icons/gi';
import * as GoIcons from 'react-icons/go';
import * as HiIcons from 'react-icons/hi';
import * as ImIcons from 'react-icons/im';
import * as SiIcons from 'react-icons/si';
import * as TbIcons from 'react-icons/tb';
import * as TiIcons from 'react-icons/ti';
import * as VscIcons from 'react-icons/vsc';
import * as RxIcons from 'react-icons/rx';
import * as LuIcons from 'react-icons/lu';
import { useDeleteCategory } from '@/services/categoryService';
import { useToast } from '@/hooks/use-toast';

export default function CategoryManagement() {
    const [showForm, setShowForm] = useState(false);
    const [editingCategory, setEditingCategory] = useState<any>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState<'all' | 'business' | 'service' | 'trending'>('all');
    const { toast } = useToast();
    const deleteMutation = useDeleteCategory();

    const { data: categoriesData, isLoading: categoriesLoading } = useCategories();
    const { data: usersData } = useUsers();

    const categories = categoriesData?.data || [];
    const users = usersData?.data || [];

    const handleFormSuccess = () => {
        setShowForm(false);
        setEditingCategory(null);
    };

    const handleEdit = (category: any) => {
        setEditingCategory(category);
    };
    const handleDelete = (categoryId: string) => {
        if (window.confirm('Are you sure you want to delete this category?')) {
            deleteMutation.mutate(categoryId, {
                onSuccess: () => {
                    toast({
                        title: "Category deleted",
                        description: "The category has been deleted successfully.",
                    });
                },
                onError: () => {
                    toast({
                        title: "Error",
                        description: "Failed to delete category. Please try again.",
                        variant: "destructive",
                    });
                }
            });
        }
    };

    const filteredCategories = categories.filter(category => {
        const matchesSearch = category.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filterType === 'all' ||
            (filterType === 'business' && category.section === 'BUSINESS') ||
            (filterType === 'service' && category.section === 'SERVICE') ||
            (filterType === 'trending' && category.isTrending);

        return matchesSearch && matchesFilter;
    });
    if (showForm || editingCategory) {
        return (
            <div className="container mx-auto py-6">
                <CategoryForm
                    category={editingCategory}
                    onSuccess={handleFormSuccess}
                    onCancel={() => {
                        setShowForm(false);
                        setEditingCategory(null);
                    }}
                />
            </div>
        );
    }

    return (
        <div className="container mx-auto py-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Category Management</h1>
                    <p className="text-muted-foreground">Manage business and service categories</p>
                </div>
                <Button onClick={() => setShowForm(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Category
                </Button>
            </div>

            <Tabs defaultValue="pending" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="all">
                        <List className="h-4 w-4 mr-2" />
                        All Categories
                    </TabsTrigger>
                    <TabsTrigger value="pending">
                        <Clock className="h-4 w-4 mr-2" />
                        Pending Approval
                    </TabsTrigger>

                </TabsList>

                <TabsContent value="pending">
                    <CategoryApprovalTable
                        categories={categories.filter(cat => cat.approvalStatus === 'pending')}
                        users={users}
                        isLoading={categoriesLoading}
                    />
                </TabsContent>

                <TabsContent value="all">
                    <Card>
                        <CardHeader>
                            <CardTitle>All Categories</CardTitle>
                            <CardDescription>View and manage all categories in the system</CardDescription>
                            {/* Search and Filter Controls */}
                            <div className="flex flex-col sm:flex-row gap-4 mt-4">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search categories..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>

                                <div className="flex items-center gap-2">
                                    <Filter className="h-4 w-4 text-muted-foreground" />
                                    <Select value={filterType} onValueChange={(value: any) => setFilterType(value)}>
                                        <SelectTrigger className="w-[180px]">
                                            <SelectValue placeholder="Filter by type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Categories</SelectItem>
                                            <SelectItem value="business">Business Only</SelectItem>
                                            <SelectItem value="service">Service Only</SelectItem>
                                            <SelectItem value="trending">Trending Only</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Category</TableHead>
                                            <TableHead>Section</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Trending</TableHead>
                                            <TableHead>Created</TableHead>
                                            <TableHead>Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {categoriesLoading ? (
                                            <TableRow>
                                                <TableCell colSpan={6} className="text-center py-8">
                                                    Loading categories...
                                                </TableCell>
                                            </TableRow>
                                        ) : categories.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                                    {searchTerm || filterType !== 'all' ? 'No categories match your search criteria' : 'No categories found'}
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            filteredCategories.map((category) => (
                                                <TableRow key={category._id}>
                                                    <TableCell className="font-medium">
                                                        <div className="flex items-center gap-2">
                                                            {category.iconKey ? (() => {
                                                                // Parse the icon key to extract library and icon name
                                                                const [library, iconName] = category.iconKey.split('-');

                                                                let IconComponent = null;

                                                                // Get the correct icon from the right library
                                                                switch (library) {
                                                                    case 'fa':
                                                                        IconComponent = (FaIcons as any)[iconName];
                                                                        break;
                                                                    case 'md':
                                                                        IconComponent = (MdIcons as any)[iconName];
                                                                        break;
                                                                    case 'io':
                                                                        IconComponent = (IoIcons as any)[iconName];
                                                                        break;
                                                                    case 'bs':
                                                                        IconComponent = (BsIcons as any)[iconName];
                                                                        break;
                                                                    case 'ai':
                                                                        IconComponent = (AiIcons as any)[iconName];
                                                                        break;
                                                                    case 'bi':
                                                                        IconComponent = (BiIcons as any)[iconName];
                                                                        break;
                                                                    case 'ci':
                                                                        IconComponent = (CiIcons as any)[iconName];
                                                                        break;
                                                                    case 'di':
                                                                        IconComponent = (DiIcons as any)[iconName];
                                                                        break;
                                                                    case 'fi':
                                                                        IconComponent = (FiIcons as any)[iconName];
                                                                        break;
                                                                    case 'gi':
                                                                        IconComponent = (GiIcons as any)[iconName];
                                                                        break;
                                                                    case 'go':
                                                                        IconComponent = (GoIcons as any)[iconName];
                                                                        break;
                                                                    case 'hi':
                                                                        IconComponent = (HiIcons as any)[iconName];
                                                                        break;
                                                                    case 'im':
                                                                        IconComponent = (ImIcons as any)[iconName];
                                                                        break;
                                                                    case 'si':
                                                                        IconComponent = (SiIcons as any)[iconName];
                                                                        break;
                                                                    case 'tb':
                                                                        IconComponent = (TbIcons as any)[iconName];
                                                                        break;
                                                                    case 'ti':
                                                                        IconComponent = (TiIcons as any)[iconName];
                                                                        break;
                                                                    case 'vsc':
                                                                        IconComponent = (VscIcons as any)[iconName];
                                                                        break;
                                                                    case 'rx':
                                                                        IconComponent = (RxIcons as any)[iconName];
                                                                        break;
                                                                    case 'lu':
                                                                        IconComponent = (LuIcons as any)[iconName];
                                                                        break;
                                                                }

                                                                return IconComponent ? (
                                                                    <div className="flex items-center justify-center w-8 h-8 bg-gray-100 rounded">
                                                                        <IconComponent className="h-4 w-4" />
                                                                    </div>
                                                                ) : null;
                                                            })() : null}

                                                            {category.name}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant={category.section === 'BUSINESS' ? 'default' : 'secondary'}>
                                                            {category.section}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge
                                                            variant={
                                                                category.approvalStatus === 'approved' ? 'default' :
                                                                    category.approvalStatus === 'rejected' ? 'destructive' : 'secondary'
                                                            }
                                                        >
                                                            {category.approvalStatus}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        {category.isTrending && (
                                                            <Badge variant="outline">Trending</Badge>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-muted-foreground">
                                                        {category.createdAt ? new Date(category.createdAt).toLocaleDateString() : 'N/A'}
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() => handleEdit(category)}
                                                                disabled={deleteMutation.isPending}
                                                            >
                                                                <Edit className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="destructive"
                                                                onClick={() => handleDelete(category._id)}
                                                                disabled={deleteMutation.isPending}
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}