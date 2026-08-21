<?php

namespace App\Interface\Http\Middleware;

use App\Models\LoginAttempt;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Locks an IP out for a window after a number of consecutive failures.
 *
 * Complements the per-minute rate limiter (throttle:5,1) by blocking the
 * hashed IP for 15 minutes after 5 failed attempts, giving a simple
 * brute-force defence without storing the raw IP (LGPD).
 */
class AccessThrottle
{
    private const MAX_FAILURES = 5;

    private const LOCKOUT_MINUTES = 15;

    public function handle(Request $request, Closure $next): Response
    {
        $ipHash = hash_hmac('sha256', (string) ($request->ip() ?? 'unknown'), (string) config('app.key'));

        $failures = LoginAttempt::query()
            ->where('ip_hash', $ipHash)
            ->where('success', false)
            ->where('created_at', '>=', now()->subMinutes(self::LOCKOUT_MINUTES))
            ->count();

        if ($failures >= self::MAX_FAILURES) {
            return response()->json([
                'message' => 'Muitas tentativas de acesso. Tente novamente mais tarde.',
            ], 429, ['Retry-After' => (string) (self::LOCKOUT_MINUTES * 60)]);
        }

        return $next($request);
    }
}
