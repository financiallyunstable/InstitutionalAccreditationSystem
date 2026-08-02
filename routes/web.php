<?php

use App\Http\Controllers\AccreditationController;
use App\Http\Controllers\AreaController;
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
});

require __DIR__.'/settings.php';
