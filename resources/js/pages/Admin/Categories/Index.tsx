// resources/js/pages/Admin/Categories/Index.tsx
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
import { MoreHorizontal, Pencil, Trash, Plus } from 'lucide-react';
import { type BreadcrumbItem } from '@/types';

interface Category {
    id: number;
    name: string;
    description: string | null;
    display_order: number;
    is_promotional: boolean;
    parent_id: number | null;
    parent?: {
        id: number;
        name: string;
    };
}

interface Props {
    categories: Category[];
}

export default function CategoryIndex({ categories }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Categories', href: '/admin/categories' },
    ];

    const handleDelete = (category: Category) => {
        if (confirm(`Are you sure you want to delete "${category.name}"?`)) {
            router.delete(`/admin/categories/${category.id}`);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Categories" />
            
            <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-semibold">Categories</h1>
                        <p className="text-muted-foreground">
                            Manage your book categories and subcategories
                        </p>
                    </div>
                    <Link href="/admin/categories/create">
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Category
                        </Button>
                    </Link>
                </div>

                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Parent Category</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Display Order</TableHead>
                                <TableHead className="w-[70px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {categories.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center">
                                        No categories found. Create your first category.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                categories.map((category) => (
                                    <TableRow key={category.id}>
                                        <TableCell className="font-medium">
                                            {category.name}
                                        </TableCell>
                                        <TableCell>
                                            {category.parent ? category.parent.name : '—'}
                                        </TableCell>
                                        <TableCell>
                                            {category.is_promotional ? (
                                                <Badge variant="secondary">Promotional</Badge>
                                            ) : (
                                                <Badge variant="outline">Regular</Badge>
                                            )}
                                        </TableCell>
                                        <TableCell>{category.display_order}</TableCell>
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem asChild>
                                                        <Link href={`/admin/categories/${category.id}/edit`}>
                                                            <Pencil className="mr-2 h-4 w-4" />
                                                            Edit
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        className="text-destructive"
                                                        onClick={() => handleDelete(category)}
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
            </div>
        </AppLayout>
    );
}