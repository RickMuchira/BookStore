import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { type BreadcrumbItem } from '@/types';
import { FormEventHandler, useState } from 'react';
import { cn } from '@/lib/utils';
import InputError from '@/components/input-error';

interface Category {
    id: number;
    name: string;
}

interface Props {
    parentCategories: Category[];
}

export default function CategoryCreate({ parentCategories }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        description: '',
        display_order: '0',
        parent_id: '',
        is_promotional: false,
        image: null as File | null,
    });

    const [imageError, setImageError] = useState<string | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Categories', href: '/admin/categories' },
        { title: 'Create Category', href: '/admin/categories/create' },
    ];

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        post('/admin/categories');
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        setImageError(null);
        
        if (file) {
            // Check file size (10MB limit)
            if (file.size > 10240 * 1024) {
                setImageError('File size must not exceed 10MB');
                e.target.value = '';
                setImagePreview(null);
                return;
            }
            
            // Check file type
            if (!file.type.startsWith('image/')) {
                setImageError('Please upload an image file');
                e.target.value = '';
                setImagePreview(null);
                return;
            }
            
            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
            
            setData('image', file);
        } else {
            setData('image', null);
            setImagePreview(null);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Category" />
            
            <div className="p-6">
                <div className="max-w-2xl mx-auto">
                    <div className="mb-6">
                        <h1 className="text-2xl font-semibold">Create Category</h1>
                        <p className="text-muted-foreground">
                            Add a new category to organize your books
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="name">Category Name *</Label>
                            <Input
                                id="name"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                className={cn(errors.name && 'border-destructive')}
                            />
                            <InputError message={errors.name} />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                rows={3}
                            />
                            <InputError message={errors.description} />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="parent_id">Parent Category</Label>
                            <Select
                                value={data.parent_id || 'none'}
                                onValueChange={(value) => setData('parent_id', value === 'none' ? '' : value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select parent category (optional)" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">None</SelectItem>
                                    {parentCategories.map((category) => (
                                        <SelectItem key={category.id} value={category.id.toString()}>
                                            {category.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <InputError message={errors.parent_id} />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="display_order">Display Order *</Label>
                            <Input
                                id="display_order"
                                type="number"
                                min="0"
                                value={data.display_order}
                                onChange={(e) => setData('display_order', e.target.value)}
                                className={cn(errors.display_order && 'border-destructive')}
                            />
                            <InputError message={errors.display_order} />
                        </div>

                        <div className="flex items-center space-x-2">
                            <Switch
                                id="is_promotional"
                                checked={data.is_promotional}
                                onCheckedChange={(checked) => setData('is_promotional', checked)}
                            />
                            <Label htmlFor="is_promotional">Promotional Category</Label>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="image">Category Image</Label>
                            {imagePreview && (
                                <div className="mb-2">
                                    <img 
                                        src={imagePreview} 
                                        alt="Category preview"
                                        className="h-32 w-32 object-cover rounded-md"
                                    />
                                </div>
                            )}
                            <Input
                                id="image"
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                            />
                            <InputError message={errors.image || imageError || undefined} />
                            <p className="text-sm text-muted-foreground">
                                Maximum file size: 10MB. Supported formats: JPG, PNG, GIF.
                            </p>
                        </div>

                        <div className="flex justify-end space-x-4">
                            <Link href="/admin/categories">
                                <Button type="button" variant="outline">
                                    Cancel
                                </Button>
                            </Link>
                            <Button type="submit" disabled={processing}>
                                {processing ? 'Creating...' : 'Create Category'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}