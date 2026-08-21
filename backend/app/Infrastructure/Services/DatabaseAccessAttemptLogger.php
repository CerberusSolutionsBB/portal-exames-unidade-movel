<?php

namespace App\Infrastructure\Services;

use App\Application\Contracts\AccessAttemptLogger;
use App\Models\LoginAttempt;
use Illuminate\Http\Request;

/**
 * LGPD-compliant attempt logger.
 *
 * Persists only one-way HMAC-SHA256 hashes (salted with the app key) of the
 * IP, CPF and user-agent — never the raw values — plus the success flag.
 */
final class DatabaseAccessAttemptLogger implements AccessAttemptLogger
{
    public function __construct(private readonly Request $request)
    {
    }

    public function log(string $cpfDigits, bool $success): void
    {
        LoginAttempt::query()->create([
            'ip_hash' => $this->hash((string) ($this->request->ip() ?? 'unknown')),
            'cpf_hash' => $this->hash($cpfDigits),
            'user_agent_hash' => $this->hash((string) $this->request->userAgent()),
            'success' => $success,
        ]);
    }

    private function hash(string $value): string
    {
        return hash_hmac('sha256', $value, (string) config('app.key'));
    }
}
