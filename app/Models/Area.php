<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $accreditation_id
 * @property string $name
 * @property string|null $description
 * @property string|null $video
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 */
#[Fillable(['accreditation_id', 'name', 'description', 'video'])]
class Area extends Model
{
    public function accreditation(): BelongsTo
    {
        return $this->belongsTo(Accreditation::class);
    }
}
