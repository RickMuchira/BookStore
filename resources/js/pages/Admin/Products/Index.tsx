// resources/js/pages/Admin/Products/Index.tsx
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Pencil, Trash, Plus, Eye } from 'lucide-react';
import { type BreadcrumbItem } from '@/types';

interface Product {
    id: number;
    title: string;
    regular_price: number;
    compare_at_price: number | null;
    stock_quantity: number;
    status: 'active' | 'draft';
    primary_image?: {
        id: number;
        image_path: string;
    };
    categories: {
        id: number;
        name: string;
    }[];
}

interface PaginatedProducts {
    data: Product[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

interface Props {
    products: PaginatedProducts;
}

export default function ProductIndex({ products }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Products', href: '/admin/products' },
    ];

    const handleDelete = (product: Product) => {
        if (confirm(`Are you sure you want to delete "${product.title}"?`)) {
            router.delete(`/admin/products/${product.id}`);
        }
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-KE', {
            style: 'currency',
            currency: 'KES',
        }).format(price);
    };

    const handlePageChange = (page: number) => {
        router.get('/admin/products', { page }, { preserveState: true });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Products" />
            
            <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-semibold">Products</h1>
                        <p className="text-muted-foreground">
                            Manage your book inventory
                        </p>
                    </div>
                    <Link href="/admin/products/create">
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Product
                        </Button>
                    </Link>
                </div>

                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[100px]">Image</TableHead>
                                <TableHead>Title</TableHead>
                                <TableHead>Categories</TableHead>
                                <TableHead>Price</TableHead>
                                <TableHead>Stock</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="w-[70px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {products.data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center">
                                        No products found. Create your first product.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                products.data.map((product) => (
                                    <TableRow key={product.id}>
                                        <TableCell>
                                            {product.primary_image ? (
                                                <img
                                                    src={`/storage/${product.primary_image.image_path}`}
                                                    alt={product.title}
                                                    className="h-16 w-16 object-cover rounded"
                                                />
                                            ) : (
                                                <div className="h-16 w-16 bg-gray-100 rounded flex items-center justify-center">
                                                    <span className="text-gray-400">No image</span>
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell className="font-medium">
                                            {product.title}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-wrap gap-1">
                                                {product.categories.map((category) => (
                                                    <Badge key={category.id} variant="secondary">
                                                        {category.name}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div>
                                                <div>{formatPrice(product.regular_price)}</div>
                                                {product.compare_at_price && (
                                                    <div className="text-sm text-muted-foreground line-through">
                                                        {formatPrice(product.compare_at_price)}
                                                    </div>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={product.stock_quantity > 0 ? "default" : "destructive"}>
                                                {product.stock_quantity}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={product.status === 'active' ? "default" : "secondary"}>
                                                {product.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem asChild>
                                                        <Link href={`/admin/products/${product.id}`}>
                                                            <Eye className="mr-2 h-4 w-4" />
                                                            View
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem asChild>
                                                        <Link href={`/admin/products/${product.id}/edit`}>
                                                            <Pencil className="mr-2 h-4 w-4" />
                                                            Edit
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        className="text-destructive"
                                                        onClick={() => handleDelete(product)}
                                                    >
                                                        <Trash className="mr-2 h-4 w-4" />
                                                        Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                {products.last_page > 1 && (
                    <div className="flex items-center justify-center space-x-2 py-4">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePageChange(products.current_page - 1)}
                            disabled={products.current_page === 1}
                        >
                            Previous
                        </Button>
                        <div className="text-sm text-muted-foreground">
                            Page {products.current_page} of {products.last_page}
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePageChange(products.current_page + 1)}
                            disabled={products.current_page === products.last_page}
                        >
                            Next
                        </Button>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}