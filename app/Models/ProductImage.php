<?php

// app/Models/ProductImage.php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProductImage extends Model
{
    use HasFactory;

    protected $fillable = [
        'product_id',
        'image_path',
        'display_order',
        'is_primary',
    ];

    /**
     * Get the product this image belongs to
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    /**
     * Scope to get primary images
     */
    public function scopePrimary($query)
    {
        return $query->where('is_primary', true);
    }

    /**
     * Set this image as the primary image
     */
    public function makePrimary()
    {
        // First, remove primary flag from all other images for this product
        ProductImage::where('product_id', $this->product_id)
            ->where('id', '!=', $this->id)
            ->update(['is_primary' => false]);
        
        // Then set this one as primary
        $this->is_primary = true;
        $this->save();
    }
}
