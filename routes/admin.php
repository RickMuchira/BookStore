<?php

// routes/admin.php
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Admin\CategoryController;
use App\Http\Controllers\Admin\ProductController;

Route::middleware(['auth', 'verified'])->prefix('admin')->name('admin.')->group(function () {
    // Categories management
    Route::resource('categories', CategoryController::class);
    
    // Products management
    Route::resource('products', ProductController::class);
    
    // Additional product image routes
    Route::post('products/{product}/images', [ProductController::class, 'uploadImages'])
        ->name('products.images.upload');
    Route::delete('products/{product}/images/{image}', [ProductController::class, 'deleteImage'])
        ->name('products.images.delete');
    Route::post('products/{product}/images/{image}/primary', [ProductController::class, 'setPrimaryImage'])
        ->name('products.images.primary');
});