<?php

use App\Interface\Http\Controllers\Api\AccessController;
use App\Interface\Http\Controllers\Api\ExamStatusController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Protected routes (Sanctum)
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/exames/status', [ExamStatusController::class, 'show']);
    Route::post('/logout', [AccessController::class, 'logout']);
});
