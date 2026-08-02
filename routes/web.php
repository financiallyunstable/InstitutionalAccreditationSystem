<?php

use App\Http\Controllers\AccreditationController;
use App\Http\Controllers\AreaController;
use App\Http\Controllers\IndicatorController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');

    Route::get('accreditations', [AccreditationController::class, 'index'])->name('accreditations.index');
    Route::get('accreditations/data', [AccreditationController::class, 'data'])->name('accreditations.data');
    Route::get('accreditations/create', [AccreditationController::class, 'create'])->name('accreditations.create');
    Route::post('accreditations', [AccreditationController::class, 'store'])->name('accreditations.store');
    Route::get('accreditations/{accreditation}/edit', [AccreditationController::class, 'edit'])->name('accreditations.edit');
    Route::put('accreditations/{accreditation}', [AccreditationController::class, 'update'])->name('accreditations.update');

    Route::get('areas', [AreaController::class, 'index'])->name('areas.index');
    Route::get('areas/data', [AreaController::class, 'data'])->name('areas.data');
    Route::get('areas/create', [AreaController::class, 'create'])->name('areas.create');
    Route::post('areas', [AreaController::class, 'store'])->name('areas.store');
    Route::get('areas/{area}/edit', [AreaController::class, 'edit'])->name('areas.edit');
    Route::put('areas/{area}', [AreaController::class, 'update'])->name('areas.update');
    Route::delete('areas/{area}', [AreaController::class, 'destroy'])->name('areas.destroy');

    Route::get('indicators', [IndicatorController::class, 'moduleIndex'])->name('indicators.module');

    Route::prefix('areas/{area}/indicators')->group(function () {
        Route::get('/data', [IndicatorController::class, 'data'])->name('indicators.data');
        Route::get('/create', [IndicatorController::class, 'create'])->name('indicators.create');
        Route::post('/', [IndicatorController::class, 'store'])->name('indicators.store');
        Route::post('/reorder', [IndicatorController::class, 'reorder'])->name('indicators.reorder');
        Route::get('/{indicator}/edit', [IndicatorController::class, 'edit'])->name('indicators.edit');
        Route::put('/{indicator}', [IndicatorController::class, 'update'])->name('indicators.update');
        Route::delete('/{indicator}', [IndicatorController::class, 'destroy'])->name('indicators.destroy');
    });
});

require __DIR__.'/settings.php';
