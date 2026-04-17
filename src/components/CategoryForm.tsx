import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { IconPicker } from './IconPicker';
import { useCreateCategory, useUpdateCategory } from '@/services/categoryService';
import { Category } from '@/types';
import { useToast } from '@/hooks/use-toast';

interface CategoryFormProps {
  category?: Category;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function CategoryForm({ category, onSuccess, onCancel }: CategoryFormProps) {
  const { toast } = useToast();
  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();

  const [formData, setFormData] = useState({
    name: category?.name || '',
    section: category?.section || 'BUSINESS' as 'BUSINESS' | 'SERVICE',
    isTrending: category?.isTrending || false,
    iconKey: category?.iconKey || undefined,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (category) {
      updateMutation.mutate({
        id: category._id,
        name: formData.name,
        section: formData.section,
        isTrending: formData.isTrending,
        iconKey: formData.iconKey,
      }, {
        onSuccess: () => {
          toast({
            title: 'Category Updated',
            description: `Successfully updated category "${formData.name}"`,
          });
          onSuccess?.();
        },
        onError: (error: any) => {
          toast({
            title: 'Error',
            description: error.response?.data?.message || 'Failed to update category',
            variant: 'destructive',
          });
        }
      });
    } else {
      createMutation.mutate(formData, {
        onSuccess: () => {
          toast({
            title: 'Category Created',
            description: `Successfully created category "${formData.name}"`,
          });
          onSuccess?.();
        },
        onError: (error: any) => {
          toast({
            title: 'Error',
            description: error.response?.data?.message || 'Failed to create category',
            variant: 'destructive',
          });
        }
      });
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{category ? 'Edit Category' : 'Add New Category'}</CardTitle>
        <CardDescription>
          {category ? 'Update category information' : 'Create a new category for businesses or services'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Category Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter category name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="section">Section *</Label>
            <Select 
              value={formData.section} 
              onValueChange={(value: 'BUSINESS' | 'SERVICE') => 
                setFormData(prev => ({ ...prev, section: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select section" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="BUSINESS">Business</SelectItem>
                <SelectItem value="SERVICE">Service</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <IconPicker
            value={formData.iconKey}
            onChange={(iconKey) => setFormData(prev => ({ ...prev, iconKey }))}
          />

          <div className="flex items-center space-x-2">
            <Switch
              id="isTrending"
              checked={formData.isTrending}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isTrending: checked }))}
            />
            <Label htmlFor="isTrending">Mark as Trending</Label>
          </div>

          <div className="flex gap-2 pt-4">
            <Button 
              type="submit" 
              disabled={createMutation.isPending || updateMutation.isPending}
              className="flex-1"
            >
              {createMutation.isPending || updateMutation.isPending 
                ? 'Saving...' 
                : category ? 'Update Category' : 'Create Category'
              }
            </Button>
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}