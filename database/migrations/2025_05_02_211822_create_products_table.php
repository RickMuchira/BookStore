<?php

// Migration: create_products_table.php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('description')->nullable();
            $table->enum('status', ['active', 'draft'])->default('draft');
            
            // Pricing
            $table->decimal('regular_price', 10, 2);
            $table->decimal('compare_at_price', 10, 2)->nullable();
            
            // Cost & Profitability
            $table->decimal('cost_per_item', 10, 2)->nullable();
            // Note: Profit and margin are calculated values, not stored
            
            // Inventory
            $table->integer('stock_quantity')->default(0);
            $table->string('sku')->nullable(); // ISBN for books
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
