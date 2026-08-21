<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Laravel\Sanctum\HasApiTokens;

/**
 * Anonymous patient identity used only as a token anchor.
 *
 * The raw CPF is never stored — only its one-way hash — so the portal keeps
 * working without a traditional account ("sem cadastro prévio").
 */
class Patient extends Model
{
    use HasApiTokens;

    protected $fillable = [
        'cpf_hash',
        'last_accessed_at',
    ];

    protected function casts(): array
    {
        return [
            'last_accessed_at' => 'datetime',
        ];
    }
}
