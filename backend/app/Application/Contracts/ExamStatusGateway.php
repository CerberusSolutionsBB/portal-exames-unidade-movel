<?php

namespace App\Application\Contracts;

/**
 * Seam for looking up an exam result.
 *
 * Today the only implementation returns "not available" because there is no
 * exam database yet. Swapping in a real gateway (DB/API) later is a matter of
 * adding a new implementation — no change to the use case (Open/Closed).
 */
interface ExamStatusGateway
{
    /**
     * @return array{status: string, message: string}
     */
    public function statusFor(string $cpfDigits, string $birthDate): array;
}
