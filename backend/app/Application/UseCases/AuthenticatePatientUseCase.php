<?php

namespace App\Application\UseCases;

use App\Application\Contracts\AccessAttemptLogger;
use App\Application\Contracts\ExamStatusGateway;
use App\Application\Dtos\AccessCredentialsDto;
use App\Application\Dtos\AccessResult;
use App\Domain\ValueObjects\BirthDate;
use App\Domain\ValueObjects\Cpf;
use App\Models\Patient;
use InvalidArgumentException;

/**
 * Validates the access credentials, logs the attempt and issues a Sanctum
 * token for the anonymous patient identity (keyed by a hashed CPF).
 *
 * Single responsibility: orchestrate the access flow. Validation lives in the
 * value objects; persistence lives behind the injected contracts.
 */
final class AuthenticatePatientUseCase
{
    public function __construct(
        private readonly ExamStatusGateway $examStatusGateway,
        private readonly AccessAttemptLogger $attemptLogger,
    ) {
    }

    public function execute(AccessCredentialsDto $credentials): AccessResult
    {
        try {
            $cpf = Cpf::fromString($credentials->cpf);
        } catch (InvalidArgumentException $exception) {
            $this->attemptLogger->log($credentials->cpf, false);

            return AccessResult::failure(['cpf' => $exception->getMessage()]);
        }

        try {
            $birthDate = BirthDate::fromDmy($credentials->birthDate);
        } catch (InvalidArgumentException $exception) {
            $this->attemptLogger->log($cpf->digits(), false);

            return AccessResult::failure(['nascimento' => $exception->getMessage()]);
        }

        $this->attemptLogger->log($cpf->digits(), true);

        $status = $this->examStatusGateway->statusFor($cpf->digits(), $birthDate->toDateString());

        return AccessResult::success(
            $this->issueToken($cpf),
            $status['status'],
            $status['message'],
        );
    }

    private function issueToken(Cpf $cpf): string
    {
        $patient = Patient::query()->firstOrCreate(
            ['cpf_hash' => $cpf->hash()],
            ['last_accessed_at' => now()],
        );

        $patient->forceFill(['last_accessed_at' => now()])->save();

        return $patient->createToken('acesso-exames', ['exames:read'])->plainTextToken;
    }
}
