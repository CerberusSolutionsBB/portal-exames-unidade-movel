<?php

use App\Interface\Http\Controllers\Api\AccessController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Public auth routes
|--------------------------------------------------------------------------
*/

Route::post('/acesso', [AccessController::class, 'store'])
    ->middleware(['throttle:5,1', 'access.throttle']);
