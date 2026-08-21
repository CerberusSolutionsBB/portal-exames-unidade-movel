<?php

namespace App\Domain\ValueObjects;

use InvalidArgumentException;

/**
 * CPF (Cadastro de Pessoas Físicas) as an immutable value object.
 *
 * Owns the check-digit validation rule and all formatting concerns,
 * so the rest of the system never deals with a raw string.
 */
final class Cpf
{
    private function __construct(private readonly string $digits)
    {
    }

    /**
     * Build a CPF from any user-provided string (masked or not).
     *
     * @throws InvalidArgumentException when the CPF is not valid.
     */
    public static function fromString(string $raw): self
    {
        $digits = preg_replace('/\D/', '', $raw) ?? '';

        if (! self::isValid($digits)) {
            throw new InvalidArgumentException('Informe um CPF válido.');
        }

        return new self($digits);
    }

    /**
     * Check whether an 11-digit string is a valid CPF.
     */
    public static function isValid(string $digits): bool
    {
        if (strlen($digits) !== 11 || preg_match('/^(\d)\1{10}$/', $digits)) {
            return false;
        }

        return self::checkDigit($digits, 9) === (int) $digits[9]
            && self::checkDigit($digits, 10) === (int) $digits[10];
    }

    private static function checkDigit(string $digits, int $length): int
    {
        $sum = 0;

        for ($i = 0; $i < $length; $i++) {
            $sum += (int) $digits[$i] * ($length + 1 - $i);
        }

        $remainder = ($sum * 10) % 11;

        return $remainder === 10 ? 0 : $remainder;
    }

    public function digits(): string
    {
        return $this->digits;
    }

    public function formatted(): string
    {
        return vsprintf('%s%s%s.%s%s%s.%s%s%s-%s%s', str_split($this->digits));
    }

    /**
     * One-way anonymised fingerprint of the CPF, salted with the app key.
     * Used for LGPD-safe storage and logging — the raw CPF is never persisted.
     */
    public function hash(): string
    {
        return hash_hmac('sha256', $this->digits, (string) config('app.key'));
    }

    public function __toString(): string
    {
        return $this->formatted();
    }
}
