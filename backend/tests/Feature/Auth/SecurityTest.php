<?php

namespace Tests\Feature\Auth;

use App\Models\LoginAttempt;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

final class SecurityTest extends TestCase
{
    use RefreshDatabase;

    private const VALID_CPF = '123.456.789-09';

    public function test_security_headers_are_present(): void
    {
        $response = $this->postJson('/api/acesso', [
            'cpf' => self::VALID_CPF,
            'nascimento' => '15/03/1990',
        ]);

        $response->assertHeader('X-Content-Type-Options', 'nosniff');
        $response->assertHeader('X-Frame-Options', 'DENY');
        $response->assertHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    }

    public function test_attempts_are_logged_with_hashed_data_only(): void
    {
        $this->postJson('/api/acesso', [
            'cpf' => self::VALID_CPF,
            'nascimento' => '15/03/1990',
        ]);

        $attempt = LoginAttempt::query()->firstOrFail();

        $this->assertTrue($attempt->success);
        $this->assertSame(64, strlen($attempt->ip_hash));
        $this->assertStringNotContainsString('12345678909', (string) $attempt->cpf_hash);
    }

    public function test_five_failed_attempts_lock_the_ip_out(): void
    {
        $ipHash = hash_hmac('sha256', '127.0.0.1', (string) config('app.key'));

        for ($i = 0; $i < 5; $i++) {
            LoginAttempt::query()->create([
                'ip_hash' => $ipHash,
                'cpf_hash' => null,
                'user_agent_hash' => null,
                'success' => false,
            ]);
        }

        $response = $this->postJson('/api/acesso', [
            'cpf' => self::VALID_CPF,
            'nascimento' => '15/03/1990',
        ]);

        $response->assertStatus(429);
    }
}
