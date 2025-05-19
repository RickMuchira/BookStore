<?php

// app/Models/Product.php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'description',
        'status',
        'regular_price',
        'compare_at_price',
        'cost_per_item',
        'stock_quantity',
        'sku',
    ];

    protected $casts = [
        'regular_price' => 'decimal:2',
        'compare_at_price' => 'decimal:2',
        'cost_per_item' => 'decimal:2',
        'stock_quantity' => 'integer',
    ];

    /**
     * Get the profit for this product
     */
    public function getProfit()
    {
        if ($this->cost_per_item) {
            return $this->regular_price - $this->cost_per_item;
        }
        
        return null;
    }

    /**
     * Get the profit margin percentage for this product
     */
    public function getMarginPercentage()
    {
        if ($this->cost_per_item && $this->regular_price > 0) {
            $profit = $this->getProfit();
            return ($profit / $this->regular_price) * 100;
        }
        
        return null;
    }

    /**
     * Get the discount percentage if there's a compare-at price
     */
    public function getDiscountPercentage()
    {
        if ($this->compare_at_price && $this->compare_at_price > $this->regular_price) {
            $discount = $this->compare_at_price - $this->regular_price;
            return ($discount / $this->compare_at_price) * 100;
        }
        
        return null;
    }

    /**
     * Get all images for this product
     */
    public function images(): HasMany
    {
        return $this->hasMany(ProductImage::class);
    }

    /**
     * Get the primary image for this product
     * This should be a relationship, not a method that executes a query
     */
    public function primaryImage(): HasOne
    {
        return $this->hasOne(ProductImage::class)->where('is_primary', true);
    }

    /**
     * Get all categories this product belongs to
     */
    public function categories(): BelongsToMany
    {
        return $this->belongsToMany(Category::class);
    }

    /**
     * Check if the product is in stock
     */
    public function inStock(): bool
    {
        return $this->stock_quantity > 0;
    }

    /**
     * Check if the product is active
     */
    public function isActive(): bool
    {
        return $this->status === 'active';
    }

    /**
     * Scope for active products
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    /**
     * Scope for in-stock products
     */
    public function scopeInStock($query)
    {
        return $query->where('stock_quantity', '>', 0);
    }
}