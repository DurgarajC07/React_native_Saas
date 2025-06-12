<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Image extends Model
{
    protected $fillable = [
        'user_id',
        'original_image_public_id',
        'original_image',
        'generated_image_public_id',
        'generated_image',
        'operation_type',
        'operation_metadata',
    ];
    protected $casts = [
        'operation_metadata' => 'array',
    ];
}
