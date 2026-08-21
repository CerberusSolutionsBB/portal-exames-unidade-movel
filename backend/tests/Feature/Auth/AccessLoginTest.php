<?php

namespace Tests\Feature\Auth;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

final class AccessLoginTest extends TestCase
{
    use RefreshDatabase;

    private const VALID_CPF = '123.456.789-09';

    public function test_valid_credentials_issue_a_token_and_return_not_available(): void
    {
        $response = $this->postJson('/api/acesso', [
            'cpf' => self::VALID_CPF,
            'nascimento' => '15/03/1990',
        ]);

        $response->assertOk()
            ->assertJsonPath('status', 'nao_disponivel')
            ->assertJsonPath('message', 'Resultado de exame ainda não disponível.')
            ->assertJsonStructure(['token', 'status', 'message']);

        $this->assertDatabaseHas('patients', [
            'cpf_hash' => hash_hmac('sha256', '12345678909', (string) config('app.key')),
        ]);
    }

    public function test_invalid_cpf_returns_field_error(): void
    {
        $response = $this->postJson('/api/acesso', [
            'cpf' => '123.456.789-00',
            'nascimento' => '15/03/1990',
        ]);

        $response->assertStatus(422)
            ->assertJsonPath('errors.cpf', 'Informe um CPF válido.');
    }

    public function test_invalid_birth_date_returns_field_error(): void
    {
        $response = $this->postJson('/api/acesso', [
            'cpf' => self::VALID_CPF,
            'nascimento' => '31/02/1990',
        ]);

        $response->assertStatus(422)
            ->assertJsonPath('errors.nascimento', 'Informe uma data de nascimento válida.');
    }

    public function test_protected_route_requires_token(): void
    {
        $this->getJson('/api/exames/status')->assertUnauthorized();
    }

    public function test_protected_route_works_with_token(): void
    {
        $token = $this->postJson('/api/acesso', [
            'cpf' => self::VALID_CPF,
            'nascimento' => '15/03/1990',
        ])->json('token');

        $this->withToken($token)
            ->getJson('/api/exames/status')
            ->assertOk()
            ->assertJsonPath('status', 'nao_disponivel');
    }
}
