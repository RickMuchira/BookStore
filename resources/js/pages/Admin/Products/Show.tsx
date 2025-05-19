// resources/js/pages/Admin/Products/Show.tsx
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { type BreadcrumbItem } from '@/types';
import { Pencil } from 'lucide-react';

interface ProductImage {
    id: number;
    image_path: string;
    is_primary: boolean;
    display_order: number;
}

interface Category {
    id: number;
    name: string;
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
    categories: Category[];
}

interface Props {
    product: Product;
}

export default function ProductShow({ product }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Products', href: '/admin/products' },
        { title: product.title, href: `/admin/products/${product.id}` },
    ];

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-KE', {
            style: 'currency',
            currency: 'KES',
        }).format(price);
    };

    const calculateProfit = () => {
        if (product.cost_per_item) {
            return product.regular_price - product.cost_per_item;
        }
        return null;
    };

    const calculateMargin = () => {
        const profit = calculateProfit();
        if (profit && product.regular_price > 0) {
            return ((profit / product.regular_price) * 100).toFixed(1);
        }
        return null;
    };

    const primaryImage = product.images.find(img => img.is_primary);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={product.title} />
            
            <div className="p-6">
                <div className="max-w-6xl mx-auto">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-2xl font-semibold">{product.title}</h1>
                            <p className="text-muted-foreground">
                                Product Details
                            </p>
                        </div>
                        <Link href={`/admin/products/${product.id}/edit`}>
                            <Button>
                                <Pencil className="mr-2 h-4 w-4" />
                                Edit Product
                            </Button>
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Card className="md:col-span-2">
                            <CardHeader>
                                <CardTitle>Product Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <h3 className="font-medium mb-1">Title</h3>
                                    <p>{product.title}</p>
                                </div>
                                
                                <div>
                                    <h3 className="font-medium mb-1">Description</h3>
                                    <p className="whitespace-pre-wrap">{product.description || 'No description provided'}</p>
                                </div>
                                
                                <div>
                                    <h3 className="font-medium mb-1">Status</h3>
                                    <Badge variant={product.status === 'active' ? "default" : "secondary"}>
                                        {product.status}
                                    </Badge>
                                </div>
                                
                                <div>
                                    <h3 className="font-medium mb-1">Categories</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {product.categories.map((category) => (
                                            <Badge key={category.id} variant="secondary">
                                                {category.name}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                                
                                <div>
                                    <h3 className="font-medium mb-1">SKU/ISBN</h3>
                                    <p>{product.sku || '—'}</p>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Pricing</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <h3 className="font-medium mb-1">Regular Price</h3>
                                        <p className="text-lg font-semibold">{formatPrice(product.regular_price)}</p>
                                    </div>
                                    
                                    {product.compare_at_price && (
                                        <div>
                                            <h3 className="font-medium mb-1">Compare-at Price</h3>
                                            <p className="text-lg line-through text-muted-foreground">
                                                {formatPrice(product.compare_at_price)}
                                            </p>
                                        </div>
                                    )}
                                    
                                    {product.cost_per_item && (
                                        <>
                                            <div>
                                                <h3 className="font-medium mb-1">Cost per Item</h3>
                                                <p>{formatPrice(product.cost_per_item)}</p>
                                            </div>
                                            
                                            <div>
                                                <h3 className="font-medium mb-1">Profit</h3>
                                                <p>{formatPrice(calculateProfit() || 0)}</p>
                                            </div>
                                            
                                            <div>
                                                <h3 className="font-medium mb-1">Margin</h3>
                                                <p>{calculateMargin()}%</p>
                                            </div>
                                        </>
                                    )}
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Inventory</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div>
                                        <h3 className="font-medium mb-1">Stock Quantity</h3>
                                        <Badge variant={product.stock_quantity > 0 ? "default" : "destructive"}>
                                            {product.stock_quantity} in stock
                                        </Badge>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <Card className="md:col-span-3">
                            <CardHeader>
                                <CardTitle>Images</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {product.images.length > 0 ? (
                                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                                        {product.images.map((image) => (
                                            <div key={image.id} className="relative">
                                                <img
                                                    src={`/storage/${image.image_path}`}
                                                    alt={product.title}
                                                    className="w-full h-40 object-cover rounded-lg"
                                                />
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
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}