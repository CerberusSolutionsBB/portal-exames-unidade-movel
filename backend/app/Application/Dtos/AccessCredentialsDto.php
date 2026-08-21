<?php

namespace App\Application\Dtos;

/**
 * Input for the "access exam result" flow: CPF + date of birth.
 */
final class AccessCredentialsDto
{
    public function __construct(
        public readonly string $cpf,
        public readonly string $birthDate,
    ) {
    }

    public static function fromArray(array $data): self
    {
        return new self(
            cpf: (string) ($data['cpf'] ?? ''),
            birthDate: (string) ($data['nascimento'] ?? ''),
        );
    }
}
