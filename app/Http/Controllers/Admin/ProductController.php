<?php

// app/Http/Controllers/Admin/ProductController.php
namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Category;
use App\Models\ProductImage;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class ProductController extends Controller
{
    /**
     * Display a listing of products.
     */
    public function index(): Response
    {
        $products = Product::with(['categories', 'primaryImage'])
            ->latest()
            ->paginate(20);

        return Inertia::render('Admin/Products/Index', [
            'products' => $products
        ]);
    }

    /**
     * Show the form for creating a new product.
     */
    public function create(): Response
    {
        $categories = Category::orderBy('display_order')
            ->orderBy('name')
            ->get();

        return Inertia::render('Admin/Products/Create', [
            'categories' => $categories
        ]);
    }

    /**
     * Store a newly created product in storage.
     */
    public function store(Request $request): RedirectResponse
    {
        // Debug: Log all incoming data
        Log::info('Product store request:', [
            'all' => $request->all(),
            'files' => $request->allFiles(),
            'method' => $request->method(),
            'content_type' => $request->header('Content-Type'),
        ]);

        // Check upload settings and permissions
        Log::info('Upload settings:', [
            'upload_max_filesize' => ini_get('upload_max_filesize'),
            'post_max_size' => ini_get('post_max_size'),
            'max_file_uploads' => ini_get('max_file_uploads'),
            'file_uploads' => ini_get('file_uploads'),
            'memory_limit' => ini_get('memory_limit'),
        ]);

        // Create products directory if it doesn't exist
        $storagePath = storage_path('app/public/products');
        if (!file_exists($storagePath)) {
            mkdir($storagePath, 0755, true);
            Log::info('Created products directory: ' . $storagePath);
        }

        try {
            // Validate the request
            $rules = [
                'title' => 'required|string|max:255',
                'description' => 'nullable|string',
                'status' => 'required|in:active,draft',
                'regular_price' => 'required|numeric|min:0',
                'compare_at_price' => 'nullable|numeric|min:0',
                'cost_per_item' => 'nullable|numeric|min:0',
                'stock_quantity' => 'required|integer|min:0',
                'sku' => 'nullable|string|max:255|unique:products,sku',
                'categories' => 'required|array|min:1',
                'categories.*' => 'exists:categories,id',
            ];

            // Only validate images if they are present
            if ($request->hasFile('images')) {
                $rules['images'] = 'array';
                $rules['images.*'] = 'image|mimes:jpeg,png,jpg,gif|max:10240';
            }

            $validated = $request->validate($rules);

            Log::info('Validation passed:', $validated);

            // Additional validation for compare_at_price
            if (isset($validated['compare_at_price']) && 
                $validated['compare_at_price'] && 
                $validated['compare_at_price'] <= $validated['regular_price']) {
                return back()->withErrors([
                    'compare_at_price' => 'Compare at price must be greater than regular price'
                ])->withInput();
            }

            DB::beginTransaction();
            try {
                // Create the product
                $product = Product::create([
                    'title' => $validated['title'],
                    'description' => $validated['description'] ?? null,
                    'status' => $validated['status'],
                    'regular_price' => $validated['regular_price'],
                    'compare_at_price' => $validated['compare_at_price'] ?? null,
                    'cost_per_item' => $validated['cost_per_item'] ?? null,
                    'stock_quantity' => $validated['stock_quantity'],
                    'sku' => $validated['sku'] ?? null,
                ]);
                
                Log::info('Product created:', $product->toArray());

                // Attach categories
                $product->categories()->attach($validated['categories']);
                Log::info('Categories attached:', $validated['categories']);

                // Handle image uploads
                if ($request->hasFile('images')) {
                    $images = $request->file('images');
                    if (!is_array($images)) {
                        $images = [$images];
                    }

                    foreach ($images as $index => $image) {
                        try {
                            $path = $image->store('products', 'public');
                            
                            ProductImage::create([
                                'product_id' => $product->id,
                                'image_path' => $path,
                                'display_order' => $index,
                                'is_primary' => $index === 0
                            ]);
                            
                            Log::info('Image uploaded successfully:', [
                                'path' => $path,
                                'index' => $index,
                                'original_name' => $image->getClientOriginalName()
                            ]);
                        } catch (\Exception $e) {
                            Log::error('Image upload failed:', [
                                'error' => $e->getMessage(),
                                'index' => $index
                            ]);
                        }
                    }
                }

                DB::commit();
                Log::info('Transaction committed successfully');

                return redirect()->route('admin.products.index')
                    ->with('success', 'Product created successfully.');

            } catch (\Exception $e) {
                DB::rollBack();
                Log::error('Transaction failed:', [
                    'message' => $e->getMessage(),
                    'trace' => $e->getTraceAsString()
                ]);
                
                return back()->withErrors(['error' => 'Failed to create product: ' . $e->getMessage()])
                    ->withInput();
            }

        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::error('Validation failed:', [
                'errors' => $e->errors(),
                'input' => $request->except(['password', 'images'])
            ]);
            throw $e;
        }
    }

    /**
     * Display the specified product.
     */
    public function show(Product $product): Response
    {
        $product->load(['categories', 'images']);

        return Inertia::render('Admin/Products/Show', [
            'product' => $product
        ]);
    }

    /**
     * Show the form for editing the specified product.
     */
    public function edit(Product $product): Response
    {
        $product->load(['categories', 'images']);
        $categories = Category::orderBy('display_order')
            ->orderBy('name')
            ->get();

        return Inertia::render('Admin/Products/Edit', [
            'product' => $product,
            'categories' => $categories,
            'selectedCategories' => $product->categories->pluck('id')->toArray()
        ]);
    }

    /**
     * Update the specified product in storage.
     */
    public function update(Request $request, Product $product): RedirectResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'status' => 'required|in:active,draft',
            'regular_price' => 'required|numeric|min:0',
            'compare_at_price' => 'nullable|numeric|min:0',
            'cost_per_item' => 'nullable|numeric|min:0',
            'stock_quantity' => 'required|integer|min:0',
            'sku' => 'nullable|string|max:255|unique:products,sku,' . $product->id,
            'categories' => 'required|array|min:1',
            'categories.*' => 'exists:categories,id'
        ]);

        // Additional validation: compare_at_price must be greater than regular_price
        if (isset($validated['compare_at_price']) && 
            $validated['compare_at_price'] && 
            $validated['compare_at_price'] <= $validated['regular_price']) {
            return back()->withErrors([
                'compare_at_price' => 'Compare at price must be greater than regular price'
            ])->withInput();
        }

        DB::transaction(function () use ($validated, $product) {
            $product->update($validated);
            $product->categories()->sync($validated['categories']);
        });

        return redirect()->route('admin.products.index')
            ->with('success', 'Product updated successfully.');
    }

    /**
     * Remove the specified product from storage.
     */
    public function destroy(Product $product): RedirectResponse
    {
        // Delete all images
        foreach ($product->images as $image) {
            Storage::disk('public')->delete($image->image_path);
        }

        $product->delete();

        return redirect()->route('admin.products.index')
            ->with('success', 'Product deleted successfully.');
    }

    /**
     * Upload additional images for a product.
     */
    public function uploadImages(Request $request, Product $product): RedirectResponse
    {
        $request->validate([
            'images' => 'required|array',
            'images.*' => 'image|mimes:jpeg,png,jpg,gif|max:10240'
        ]);

        $lastOrder = $product->images()->max('display_order') ?? -1;

        foreach ($request->file('images') as $index => $image) {
            $path = $image->store('products', 'public');
            ProductImage::create([
                'product_id' => $product->id,
                'image_path' => $path,
                'display_order' => $lastOrder + $index + 1,
                'is_primary' => false
            ]);
        }

        return redirect()->back()
            ->with('success', 'Images uploaded successfully.');
    }

    /**
     * Delete a product image.
     */
    public function deleteImage(Product $product, ProductImage $image): RedirectResponse
    {
        // Ensure the image belongs to the product
        if ($image->product_id !== $product->id) {
            abort(404);
        }

        Storage::disk('public')->delete($image->image_path);
        $image->delete();

        // If this was the primary image, make the first remaining image primary
        if ($image->is_primary && $product->images()->count() > 0) {
            $firstImage = $product->images()->orderBy('display_order')->first();
            $firstImage->makePrimary();
        }

        return redirect()->back()
            ->with('success', 'Image deleted successfully.');
    }

    /**
     * Set an image as the primary image for a product.
     */
    public function setPrimaryImage(Product $product, ProductImage $image): RedirectResponse
    {
        // Ensure the image belongs to the product
        if ($image->product_id !== $product->id) {
            abort(404);
        }

        $image->makePrimary();

        return redirect()->back()
            ->with('success', 'Primary image updated successfully.');
    }
}