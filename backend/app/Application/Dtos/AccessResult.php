<?php

namespace App\Application\Dtos;

/**
 * Result of the authentication use case.
 *
 * On success it carries the issued Sanctum token and the exam status message.
 * On failure it carries per-field validation errors keyed by field name
 * ("cpf" / "nascimento") so the UI can highlight exactly what is wrong.
 */
final class AccessResult
{
    private function __construct(
        public readonly bool $success,
        public readonly array $fieldErrors,
        public readonly ?string $token,
        public readonly ?string $status,
        public readonly ?string $message,
    ) {
    }

    public static function success(string $token, string $status, string $message): self
    {
        return new self(true, [], $token, $status, $message);
    }

    public static function failure(array $fieldErrors): self
    {
        return new self(false, $fieldErrors, null, null, null);
    }
}
