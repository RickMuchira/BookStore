<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Storage;

class CategoryController extends Controller
{
    /**
     * Display a listing of categories.
     */
    public function index(): Response
    {
        $categories = Category::with('parent')
            ->orderBy('display_order')
            ->orderBy('name')
            ->get();

        return Inertia::render('Admin/Categories/Index', [
            'categories' => $categories
        ]);
    }

    /**
     * Show the form for creating a new category.
     */
    public function create(): Response
    {
        $parentCategories = Category::whereNull('parent_id')
            ->orderBy('display_order')
            ->orderBy('name')
            ->get();

        return Inertia::render('Admin/Categories/Create', [
            'parentCategories' => $parentCategories
        ]);
    }

    /**
     * Store a newly created category in storage.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'display_order' => 'required|integer|min:0',
            'parent_id' => 'nullable|exists:categories,id',
            'is_promotional' => 'boolean',
            'image' => 'nullable|image|max:10240' // 10MB limit
        ]);

        // Handle "none" value for parent_id
        if (isset($validated['parent_id']) && $validated['parent_id'] === 'none') {
            $validated['parent_id'] = null;
        }

        if ($request->hasFile('image')) {
            $validated['image_path'] = $request->file('image')->store('categories', 'public');
        }

        Category::create($validated);

        return redirect()->route('admin.categories.index')
            ->with('success', 'Category created successfully.');
    }

    /**
     * Show the form for editing the specified category.
     */
    public function edit(Category $category): Response
    {
        $parentCategories = Category::whereNull('parent_id')
            ->where('id', '!=', $category->id)
            ->orderBy('display_order')
            ->orderBy('name')
            ->get();

        return Inertia::render('Admin/Categories/Edit', [
            'category' => $category,
            'parentCategories' => $parentCategories
        ]);
    }

    /**
     * Update the specified category in storage.
     */
    public function update(Request $request, Category $category): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'display_order' => 'required|integer|min:0',
            'parent_id' => 'nullable|exists:categories,id',
            'is_promotional' => 'boolean',
            'image' => 'nullable|image|max:10240' // 10MB limit
        ]);

        // Handle "none" value for parent_id
        if (isset($validated['parent_id']) && $validated['parent_id'] === 'none') {
            $validated['parent_id'] = null;
        }

        if ($request->hasFile('image')) {
            // Delete old image if exists
            if ($category->image_path) {
                Storage::disk('public')->delete($category->image_path);
            }
            $validated['image_path'] = $request->file('image')->store('categories', 'public');
        }

        $category->update($validated);

        return redirect()->route('admin.categories.index')
            ->with('success', 'Category updated successfully.');
    }

    /**
     * Remove the specified category from storage.
     */
    public function destroy(Category $category): RedirectResponse
    {
        // Check if category has products
        if ($category->products()->count() > 0) {
            return redirect()->route('admin.categories.index')
                ->with('error', 'Cannot delete category with products.');
        }

        // Check if category has children
        if ($category->children()->count() > 0) {
            return redirect()->route('admin.categories.index')
                ->with('error', 'Cannot delete category with subcategories.');
        }

        // Delete image if exists
        if ($category->image_path) {
            Storage::disk('public')->delete($category->image_path);
        }

        $category->delete();

        return redirect()->route('admin.categories.index')
            ->with('success', 'Category deleted successfully.');
    }
}