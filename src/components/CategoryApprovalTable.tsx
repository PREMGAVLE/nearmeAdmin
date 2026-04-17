import { useState } from 'react';
import { CheckCircle, XCircle, Clock, User, Calendar } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/StatusBadge';
import { useToast } from '@/hooks/use-toast';
import { getUserName } from '@/lib/helpers';
import { useApproveCategory, useRejectCategory } from '@/services/categoryService';
import { Category, User as UserType } from '@/types';
import * as Icons from 'lucide-react';
import React from 'react';

interface CategoryApprovalTableProps {
    categories: Category[];
    users: UserType[];
    isLoading?: boolean;
    title?: string;
    description?: string;
}

export function CategoryApprovalTable({
    categories,
    users,
    isLoading,
    title = "Pending Category Approvals",
    description = "Categories created by users waiting for approval"
}: CategoryApprovalTableProps) {
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState<string | null>(null);

    const approveMutation = useApproveCategory();
    const rejectMutation = useRejectCategory();

    // Add debugging
    console.log('CategoryApprovalTable - Received categories:', categories);
    console.log('CategoryApprovalTable - Categories length:', categories.length);
    console.log('CategoryApprovalTable - Is loading:', isLoading);

    // Remove the redundant filter since we're already passing pending categories
    const pendingCategories = categories; // Already filtered by API

    const handleApprove = (id: string) => {
        setIsSubmitting(id);
        approveMutation.mutate(id, {
            onSuccess: () => {
                toast({ title: 'Category Approved' });
                setIsSubmitting(null);
            },
            onError: () => {
                setIsSubmitting(null);
            }
        });
    };

    const handleReject = (id: string) => {
        setIsSubmitting(id);
        rejectMutation.mutate({
            id,
            reason: 'Rejected by admin'
        }, {
            onSuccess: () => {
                toast({ title: 'Category Rejected' });
                setIsSubmitting(null);
            },
            onError: () => {
                setIsSubmitting(null);
            }
        });
    };
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-orange-500" />
                    {title}
                </CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Category Name</TableHead>
                                <TableHead>Section</TableHead>
                                <TableHead>Created By</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Created Date</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8">
                                        Loading categories...
                                    </TableCell>
                                </TableRow>
                            ) : pendingCategories.length === 0 ? (
                                <>
                                    {/* Debug info */}
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-4 bg-gray-50">
                                            <div className="text-xs text-gray-600">
                                                Debug: Received {categories.length} categories from API
                                                {categories.length > 0 && ` | First category: ${JSON.stringify(categories[0]).substring(0, 100)}...`}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                            No pending category approvals
                                        </TableCell>
                                    </TableRow>
                                </>
                            ) : (
                                pendingCategories.map((category) => (
                                    <TableRow key={category._id}>
                                        <TableCell className="font-medium">
                                            <div className="flex items-center gap-2">
                                                {category.iconKey && (
                                                    <div className="flex items-center justify-center w-8 h-8 bg-gray-100 rounded">
                                                        {React.createElement(Icons[category.iconKey as keyof typeof Icons], {
                                                            className: "h-4 w-4"
                                                        })}
                                                    </div>
                                                )}
                                                {category.name}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${category.section === 'BUSINESS'
                                                ? 'bg-blue-100 text-blue-800'
                                                : 'bg-green-100 text-green-800'
                                                }`}>
                                                {category.section}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">
                                            <div className="flex items-center gap-1">
                                                <User className="h-4 w-4" />
                                                {getUserName(users, category.createdBy as string)}
                                            </div>
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
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    size="sm"
                                                    onClick={() => handleApprove(category._id)}
                                                    disabled={isSubmitting === category._id}
                                                    className="bg-green-600 hover:bg-green-700"
                                                >
                                                    <CheckCircle className="h-4 w-4 mr-1" />
                                                    Approve
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="destructive"
                                                    onClick={() => handleReject(category._id)}
                                                    disabled={isSubmitting === category._id}
                                                >
                                                    <XCircle className="h-4 w-4 mr-1" />
                                                    Reject
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
    );
}