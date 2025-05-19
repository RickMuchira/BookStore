// resources/js/pages/Admin/Products/Edit.tsx
import { Head, Link, useForm, router } from '@inertiajs/react';
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
import { X, Star } from 'lucide-react';
import InputError from '@/components/input-error';

interface ProductImage {
    id: number;
    image_path: string;
    is_primary: boolean;
    display_order: number;
}

interface Category {
    id: number;
    name: string;
    parent_id: number | null;
    parent?: { name: string };
}

interface Product {
    id: number;
    title: string;
    description: string | null;
    status: 'active' | 'draft';
    regular_price: number;
    compare_at_price: number | null;
    cost_per_item: number | null;
    stock_quantity: number;
    sku: string | null;
    images: ProductImage[];
}

interface Props {
    product: Product;
    categories: Category[];
    selectedCategories: number[];
}

export default function ProductEdit({ product, categories, selectedCategories }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        title: product.title,
        description: product.description || '',
        status: product.status,
        regular_price: product.regular_price.toString(),
        compare_at_price: product.compare_at_price?.toString() || '',
        cost_per_item: product.cost_per_item?.toString() || '',
        stock_quantity: product.stock_quantity.toString(),
        sku: product.sku || '',
        categories: selectedCategories.map(String),
        _method: 'PUT',
    });

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Products', href: '/admin/products' },
        { title: 'Edit Product', href: `/admin/products/${product.id}/edit` },
    ];

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        post(`/admin/products/${product.id}`);
    };

    const handleCategoryChange = (categoryId: string, checked: boolean) => {
        if (checked) {
            setData('categories', [...data.categories, categoryId]);
        } else {
            setData('categories', data.categories.filter(id => id !== categoryId));
        }
    };

    const handleImageDelete = (imageId: number) => {
        if (confirm('Are you sure you want to delete this image?')) {
            router.delete(`/admin/products/${product.id}/images/${imageId}`);
        }
    };

    const handleSetPrimaryImage = (imageId: number) => {
        router.post(`/admin/products/${product.id}/images/${imageId}/primary`);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Product" />
            
            <div className="p-6">
                <div className="max-w-4xl mx-auto">
                    <div className="mb-6">
                        <h1 className="text-2xl font-semibold">Edit Product</h1>
                        <p className="text-muted-foreground">
                            Update product information
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
                                        />
                                        <InputError message={errors.title} />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="description">Description</Label>
                                        <Textarea
                                            id="description"
                                            value={data.description}
                                            onChange={(e) => setData('description', e.target.value)}
                                            rows={4}
                                        />
                                        <InputError message={errors.description} />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="status">Status *</Label>
                                        <Select
                                            value={data.status}
                                            onValueChange={(value) => setData('status', value as 'active' | 'draft')}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="draft">Draft</SelectItem>
                                                <SelectItem value="active">Active</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <InputError message={errors.status} />
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
                                        />
                                        <InputError message={errors.regular_price} />
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
                                        />
                                        <InputError message={errors.compare_at_price} />
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
                                        />
                                        <InputError message={errors.cost_per_item} />
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
                                        />
                                        <InputError message={errors.stock_quantity} />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="sku">SKU/ISBN</Label>
                                        <Input
                                            id="sku"
                                            value={data.sku}
                                            onChange={(e) => setData('sku', e.target.value)}
                                        />
                                        <InputError message={errors.sku} />
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
                                    <InputError message={errors.categories} className="mt-2" />
                                </CardContent>
                            </Card>

                            <Card className="md:col-span-2">
                                <CardHeader>
                                    <CardTitle>Images</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {product.images.length > 0 ? (
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                {product.images.map((image) => (
                                                    <div key={image.id} className="relative group">
                                                        <img
                                                            src={`/storage/${image.image_path}`}
                                                            alt="Product"
                                                            className="w-full h-40 object-cover rounded-lg"
                                                        />
                                                        <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                                                            <Button
                                                                type="button"
                                                                variant="secondary"
                                                                size="sm"
                                                                onClick={() => handleSetPrimaryImage(image.id)}
                                                                disabled={image.is_primary}
                                                            >
                                                                <Star className={`h-4 w-4 ${image.is_primary ? 'fill-current' : ''}`} />
                                                            </Button>
                                                            <Button
                                                                type="button"
                                                                variant="destructive"
                                                                size="sm"
                                                                onClick={() => handleImageDelete(image.id)}
                                                            >
                                                                <X className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                        {image.is_primary && (
                                                            <div className="absolute top-2 left-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs">
                                                                Primary
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-muted-foreground">No images uploaded</p>
                                        )}
                                        
                                        <div className="border-t pt-4">
                                            <Label htmlFor="new-images">Add More Images</Label>
                                            <form
                                                onSubmit={(e) => {
                                                    e.preventDefault();
                                                    const formData = new FormData(e.currentTarget);
                                                    router.post(`/admin/products/${product.id}/images`, formData);
                                                    e.currentTarget.reset();
                                                }}
                                                className="flex gap-4 items-end"
                                            >
                                                <div className="flex-1">
                                                    <Input
                                                        id="new-images"
                                                        name="images[]"
                                                        type="file"
                                                        multiple
                                                        accept="image/*"
                                                    />
                                                </div>
                                                <Button type="submit">Upload</Button>
                                            </form>
                                        </div>
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
                                {processing ? 'Updating...' : 'Update Product'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}