<?php

namespace App\Application\Contracts;

/**
 * Records access attempts for security auditing (LGPD-aware).
 *
 * Implementations must only persist anonymised data (hashes), never raw CPF,
 * IP or user-agent strings.
 */
interface AccessAttemptLogger
{
    public function log(string $cpfDigits, bool $success): void;
}
