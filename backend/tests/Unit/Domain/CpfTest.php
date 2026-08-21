<?php

namespace Tests\Unit\Domain;

use App\Domain\ValueObjects\Cpf;
use InvalidArgumentException;
use PHPUnit\Framework\Attributes\Test;
use PHPUnit\Framework\TestCase;

final class CpfTest extends TestCase
{
    #[Test]
    public function it_accepts_a_valid_cpf(): void
    {
        $cpf = Cpf::fromString('123.456.789-09');

        $this->assertSame('12345678909', $cpf->digits());
        $this->assertSame('123.456.789-09', $cpf->formatted());
    }

    #[Test]
    public function it_rejects_an_invalid_check_digit(): void
    {
        $this->expectException(InvalidArgumentException::class);

        Cpf::fromString('123.456.789-00');
    }

    #[Test]
    public function it_rejects_repeated_digits(): void
    {
        $this->assertFalse(Cpf::isValid('11111111111'));
    }

    #[Test]
    public function it_rejects_a_short_cpf(): void
    {
        $this->assertFalse(Cpf::isValid('123456789'));
    }
}
