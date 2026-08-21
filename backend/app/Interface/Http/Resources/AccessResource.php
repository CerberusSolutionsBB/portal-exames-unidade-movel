<?php

namespace App\Interface\Http\Resources;

use App\Application\Dtos\AccessResult;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AccessResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        /** @var AccessResult $result */
        $result = $this->resource;

        return [
            'token' => $result->token,
            'status' => $result->status,
            'message' => $result->message,
        ];
    }
}
