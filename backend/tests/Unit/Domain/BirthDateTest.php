<?php

namespace Tests\Unit\Domain;

use App\Domain\ValueObjects\BirthDate;
use InvalidArgumentException;
use PHPUnit\Framework\Attributes\Test;
use PHPUnit\Framework\TestCase;

final class BirthDateTest extends TestCase
{
    #[Test]
    public function it_accepts_a_valid_date(): void
    {
        $date = BirthDate::fromDmy('15/03/1990');

        $this->assertSame('1990-03-15', $date->toDateString());
    }

    #[Test]
    public function it_rejects_an_impossible_date(): void
    {
        $this->expectException(InvalidArgumentException::class);

        BirthDate::fromDmy('31/02/1990');
    }

    #[Test]
    public function it_rejects_a_future_date(): void
    {
        $this->expectException(InvalidArgumentException::class);

        BirthDate::fromDmy('01/01/2999');
    }

    #[Test]
    public function it_rejects_a_date_older_than_120_years(): void
    {
        $this->expectException(InvalidArgumentException::class);

        BirthDate::fromDmy('01/01/1800');
    }
}
