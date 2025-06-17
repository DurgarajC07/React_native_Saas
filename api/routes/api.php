<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\RegisteredUserController;
use App\Http\Controllers\Auth\AuthenticatedSessionController;

Route::middleware("guest")->group(function () {
    Route::post('/register', [RegisteredUserController::class, 'store'])
    ->middleware('guest')
    ->name('register');

    Route::post('/login', [AuthenticatedSessionController::class, 'store'])
        ->middleware('guest')
        ->name('login');
});


Route::middleware(['auth:sanctum'])->group(function () {
    Route::post('/logout', [AuthenticatedSessionController::class, 'destroy'])
    ->name('logout');

   Route::get('/user', function (Request $request) {
    return $request->user();
    });

    Route::get('/operations/credits', function () {
        return response()->json([
            'operations' => \App\Enums\OperationEnum::listOfCredits(),
        ]);
    })->name('operations.credits');

    Route::post('/image/fill', [\App\Http\Controllers\ImageController::class, 'fill'])
        ->name('image.fill');

    Route::get('/image/latest-operations', [\App\Http\Controllers\ImageController::class, 'getLatestOperations'])
        ->name('image.latest_operations');
    
    Route::get('/image/operation/{id}', [\App\Http\Controllers\ImageController::class, 'getOperation']);

    Route::delete('/image/operation/{id}', [\App\Http\Controllers\ImageController::class, 'deleteOperation'])
        ->name('image.delete_operation');
});

