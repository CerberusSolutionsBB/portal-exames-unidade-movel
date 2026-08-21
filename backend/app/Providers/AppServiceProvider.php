<?php

namespace App\Providers;

use App\Application\Contracts\AccessAttemptLogger;
use App\Application\Contracts\ExamStatusGateway;
use App\Infrastructure\Services\DatabaseAccessAttemptLogger;
use App\Infrastructure\Services\UnavailableExamStatusGateway;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->bind(ExamStatusGateway::class, UnavailableExamStatusGateway::class);
        $this->app->bind(AccessAttemptLogger::class, DatabaseAccessAttemptLogger::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        JsonResource::withoutWrapping();
    }
}
