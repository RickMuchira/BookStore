// resources/js/pages/Admin/Products/Create.tsx
import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { type BreadcrumbItem } from '@/types';
import { FormEventHandler } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface Category {
    id: number;
    name: string;
    parent_id: number | null;
    parent?: { name: string };
}

interface Props {
    categories: Category[];
}

export default function ProductCreate({ categories }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        title: '',
        description: '',
        status: 'draft',
        regular_price: '',
        compare_at_price: '',
        cost_per_item: '',
        stock_quantity: '',
        sku: '',
        categories: [] as string[],
        images: [] as File[],
    });

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Products', href: '/admin/products' },
        { title: 'Create Product', href: '/admin/products/create' },
    ];

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        
        // Create FormData object
        const formData = new FormData();
        
        // Add all fields to FormData
        formData.append('title', data.title);
        formData.append('description', data.description || '');
        formData.append('status', data.status);
        formData.append('regular_price', data.regular_price);
        formData.append('compare_at_price', data.compare_at_price || '');
        formData.append('cost_per_item', data.cost_per_item || '');
        formData.append('stock_quantity', data.stock_quantity);
        formData.append('sku', data.sku || '');
        
        // Add categories
        data.categories.forEach((categoryId) => {
            formData.append('categories[]', categoryId);
        });
        
        // Add images
        if (data.images.length > 0) {
            data.images.forEach((image, index) => {
                formData.append(`images[${index}]`, image);
            });
        }
        
        // Submit using Inertia's post method
        post('/admin/products', {
            data: formData,
            forceFormData: true,
            preserveScroll: true,
            onError: (errors) => {
                console.error('Form errors:', errors);
            },
            onSuccess: (page) => {
                console.log('Success:', page);
            },
        });
    };

    const handleCategoryChange = (categoryId: string, checked: boolean) => {
        if (checked) {
            setData('categories', [...data.categories, categoryId]);
        } else {
            setData('categories', data.categories.filter(id => id !== categoryId));
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setData('images', Array.from(e.target.files));
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Product" />
            
            <div className="p-6">
                <div className="max-w-4xl mx-auto">
                    <div className="mb-6">
                        <h1 className="text-2xl font-semibold">Create Product</h1>
                        <p className="text-muted-foreground">
                            Add a new book to your inventory
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Card className="md:col-span-2">
                                <CardHeader>
                                    <CardTitle>Basic Information</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="title">Title *</Label>
                                        <Input
                                            id="title"
                                            value={data.title}
                                            onChange={(e) => setData('title', e.target.value)}
                                            className={cn(errors.title && 'border-destructive')}
                                        />
                                        {errors.title && (
                                            <p className="text-sm text-destructive">{errors.title}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="description">Description</Label>
                                        <Textarea
                                            id="description"
                                            value={data.description}
                                            onChange={(e) => setData('description', e.target.value)}
                                            rows={4}
                                        />
                                        {errors.description && (
                                            <p className="text-sm text-destructive">{errors.description}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="status">Status *</Label>
                                        <Select
                                            value={data.status}
                                            onValueChange={(value) => setData('status', value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="draft">Draft</SelectItem>
                                                <SelectItem value="active">Active</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {errors.status && (
                                            <p className="text-sm text-destructive">{errors.status}</p>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Pricing</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="regular_price">Regular Price (KES) *</Label>
                                        <Input
                                            id="regular_price"
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={data.regular_price}
                                            onChange={(e) => setData('regular_price', e.target.value)}
                                            className={cn(errors.regular_price && 'border-destructive')}
                                        />
                                        {errors.regular_price && (
                                            <p className="text-sm text-destructive">{errors.regular_price}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="compare_at_price">Compare-at Price (KES)</Label>
                                        <Input
                                            id="compare_at_price"
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={data.compare_at_price}
                                            onChange={(e) => setData('compare_at_price', e.target.value)}
                                            className={cn(errors.compare_at_price && 'border-destructive')}
                                        />
                                        {errors.compare_at_price && (
                                            <p className="text-sm text-destructive">{errors.compare_at_price}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="cost_per_item">Cost per Item (KES)</Label>
                                        <Input
                                            id="cost_per_item"
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={data.cost_per_item}
                                            onChange={(e) => setData('cost_per_item', e.target.value)}
                                            className={cn(errors.cost_per_item && 'border-destructive')}
                                        />
                                        {errors.cost_per_item && (
                                            <p className="text-sm text-destructive">{errors.cost_per_item}</p>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Inventory</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="stock_quantity">Stock Quantity *</Label>
                                        <Input
                                            id="stock_quantity"
                                            type="number"
                                            min="0"
                                            value={data.stock_quantity}
                                            onChange={(e) => setData('stock_quantity', e.target.value)}
                                            className={cn(errors.stock_quantity && 'border-destructive')}
                                        />
                                        {errors.stock_quantity && (
                                            <p className="text-sm text-destructive">{errors.stock_quantity}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="sku">SKU/ISBN</Label>
                                        <Input
                                            id="sku"
                                            value={data.sku}
                                            onChange={(e) => setData('sku', e.target.value)}
                                            className={cn(errors.sku && 'border-destructive')}
                                        />
                                        {errors.sku && (
                                            <p className="text-sm text-destructive">{errors.sku}</p>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="md:col-span-2">
                                <CardHeader>
                                    <CardTitle>Categories *</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                        {categories.map((category) => (
                                            <div key={category.id} className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={`category-${category.id}`}
                                                    checked={data.categories.includes(category.id.toString())}
                                                    onCheckedChange={(checked) => 
                                                        handleCategoryChange(category.id.toString(), checked as boolean)
                                                    }
                                                />
                                                <Label htmlFor={`category-${category.id}`}>
                                                    {category.parent ? `${category.parent.name} > ` : ''}
                                                    {category.name}
                                                </Label>
                                            </div>
                                        ))}
                                    </div>
                                    {errors.categories && (
                                        <p className="text-sm text-destructive mt-2">{errors.categories}</p>
                                    )}
                                </CardContent>
                            </Card>

                            <Card className="md:col-span-2">
                                <CardHeader>
                                    <CardTitle>Images</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        <Label htmlFor="images">Product Images</Label>
                                        <Input
                                            id="images"
                                            type="file"
                                            multiple
                                            accept="image/*"
                                            onChange={handleImageChange}
                                        />
                                        <p className="text-sm text-muted-foreground">
                                            The first image will be used as the primary image
                                        </p>
                                        {errors.images && (
                                            <p className="text-sm text-destructive">{errors.images}</p>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="flex justify-end space-x-4">
                            <Link href="/admin/products">
                                <Button type="button" variant="outline">
                                    Cancel
                                </Button>
                            </Link>
                            <Button type="submit" disabled={processing}>
                                {processing ? 'Creating...' : 'Create Product'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}