<?php

use App\Http\Controllers\AccreditationController;
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
});

require __DIR__.'/settings.php';
