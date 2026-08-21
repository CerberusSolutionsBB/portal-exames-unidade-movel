<?php

namespace App\Interface\Http\Controllers\Api;

use App\Application\Dtos\AccessCredentialsDto;
use App\Application\UseCases\AuthenticatePatientUseCase;
use App\Interface\Http\Requests\AccessRequest;
use App\Interface\Http\Resources\AccessResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Thin controller: validates the request shape and delegates everything else
 * to the use case (Single Responsibility).
 */
class AccessController
{
    public function __construct(private readonly AuthenticatePatientUseCase $useCase)
    {
    }

    public function store(AccessRequest $request): JsonResponse
    {
        $result = $this->useCase->execute(
            AccessCredentialsDto::fromArray($request->validated())
        );

        if (! $result->success) {
            return response()->json([
                'message' => 'Os dados informados são inválidos.',
                'errors' => $result->fieldErrors,
            ], 422);
        }

        return (new AccessResource($result))->response()->setStatusCode(200);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->tokens()->delete();

        return response()->json(['message' => 'Sessão encerrada.'], 200);
    }
}
