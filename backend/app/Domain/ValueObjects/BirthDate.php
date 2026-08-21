<?php

namespace App\Domain\ValueObjects;

use Carbon\CarbonImmutable;
use InvalidArgumentException;

/**
 * Date of birth as an immutable value object.
 *
 * Accepts the DD/MM/YYYY form used by the UI and enforces that the value is
 * a real calendar date, not in the future and not older than 120 years.
 */
final class BirthDate
{
    private const MAX_AGE_YEARS = 120;

    private function __construct(private readonly CarbonImmutable $date)
    {
    }

    /**
     * Build a BirthDate from a DD/MM/YYYY string (or raw digits).
     *
     * @throws InvalidArgumentException when the date is not real/plausible.
     */
    public static function fromDmy(string $raw): self
    {
        $normalized = preg_replace('/\D/', '', $raw) ?? '';

        if (! preg_match('/^(\d{2})(\d{2})(\d{4})$/', $normalized, $matches)) {
            throw new InvalidArgumentException('Informe uma data de nascimento válida.');
        }

        $day = (int) $matches[1];
        $month = (int) $matches[2];
        $year = (int) $matches[3];

        if (! checkdate($month, $day, $year)) {
            throw new InvalidArgumentException('Informe uma data de nascimento válida.');
        }

        $date = CarbonImmutable::createSafe($year, $month, $day);

        if ($date === false) {
            throw new InvalidArgumentException('Informe uma data de nascimento válida.');
        }

        if ($date->isFuture()) {
            throw new InvalidArgumentException('A data de nascimento não pode estar no futuro.');
        }

        if ($year < CarbonImmutable::now()->subYears(self::MAX_AGE_YEARS)->year) {
            throw new InvalidArgumentException('Informe uma data de nascimento válida.');
        }

        return new self($date);
    }

    public function date(): CarbonImmutable
    {
        return $this->date;
    }

    public function toDateString(): string
    {
        return $this->date->toDateString();
    }
}
