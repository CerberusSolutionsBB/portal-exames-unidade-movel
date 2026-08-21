<?php

namespace App\Interface\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Validates the shape of the access request. Domain rules (CPF check digit,
 * real date) are enforced by the value objects in the use case, keeping the
 * HTTP layer thin.
 */
class AccessRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'cpf' => ['required', 'string', 'max:14'],
            'nascimento' => ['required', 'string', 'max:10'],
        ];
    }
}
