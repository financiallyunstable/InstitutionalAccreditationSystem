<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('indicators', function (Blueprint $table) {
            if (Schema::hasColumn('indicators', 'code')) {
                $table->dropColumn('code');
            }

            if (Schema::hasColumn('indicators', 'level')) {
                $table->dropColumn('level');
            }

            if (Schema::hasColumn('indicators', 'description')) {
                $table->dropColumn('description');
            }
        });
    }

    public function down(): void
    {
        Schema::table('indicators', function (Blueprint $table) {
            if (! Schema::hasColumn('indicators', 'code')) {
                $table->string('code')->nullable()->after('parent_id');
            }

            if (! Schema::hasColumn('indicators', 'level')) {
                $table->string('level')->nullable()->after('title');
            }

            if (! Schema::hasColumn('indicators', 'description')) {
                $table->text('description')->nullable()->after('level');
            }
        });
    }
};
