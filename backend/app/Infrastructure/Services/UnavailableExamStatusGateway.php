<?php

namespace App\Infrastructure\Services;

use App\Application\Contracts\ExamStatusGateway;

/**
 * Current behaviour of the project: there is no exam database yet, so every
 * access returns "not available" regardless of the CPF provided.
 *
 * This class is the single place to change when the real base is integrated.
 */
final class UnavailableExamStatusGateway implements ExamStatusGateway
{
    public function statusFor(string $cpfDigits, string $birthDate): array
    {
        return [
            'status' => 'nao_disponivel',
            'message' => 'Resultado de exame ainda não disponível.',
        ];
    }
}
