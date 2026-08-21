<?php

namespace App\Interface\Http\Controllers\Api;

use Illuminate\Http\JsonResponse;

/**
 * Protected endpoint (requires a valid Sanctum token) that returns the exam
 * status. Demonstrates that the token issued on access actually authorises
 * requests against protected routes.
 */
class ExamStatusController
{
    public function show(): JsonResponse
    {
        return response()->json([
            'status' => 'nao_disponivel',
            'message' => 'Resultado de exame ainda não disponível.',
        ]);
    }
}
