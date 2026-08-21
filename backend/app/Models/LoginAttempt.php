<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Security audit log of access attempts. Stores only hashes, no raw personal
 * data (LGPD). Used for the brute-force lockout and for auditing.
 */
class LoginAttempt extends Model
{
    public const UPDATED_AT = null;

    protected $fillable = [
        'ip_hash',
        'cpf_hash',
        'user_agent_hash',
        'success',
    ];

    protected function casts(): array
    {
        return [
            'success' => 'boolean',
        ];
    }
}
