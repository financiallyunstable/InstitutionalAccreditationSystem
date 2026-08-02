<?php

namespace App\Http\Controllers;

use App\Models\Accreditation;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class AccreditationController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('accreditations/index');
    }

    public function data(Request $request): \Illuminate\Http\JsonResponse
    {
        $query = Accreditation::query();

        if ($search = $request->string('search')->trim()->toString()) {
            $query->where(function ($inner) use ($search) {
                $inner->where('name', 'like', "%{$search}%")
                    ->orWhere('year', 'like', "%{$search}%")
                    ->orWhere('status', 'like', "%{$search}%");
            });
        }

        $sorting = json_decode($request->input('sorting', '[]'), true);
        if (! is_array($sorting)) {
            $sorting = [];
        }
        $sortColumn = 'created_at';
        $sortDirection = 'desc';

        if (isset($sorting[0]['id'], $sorting[0]['desc'])) {
            $sortColumn = in_array($sorting[0]['id'], ['name', 'year', 'status', 'created_at'], true)
                ? $sorting[0]['id']
                : 'created_at';
            $sortDirection = $sorting[0]['desc'] ? 'desc' : 'asc';
        }

        $pageIndex = max(0, (int) $request->input('pageIndex', 0));
        $pageSize = max(1, (int) $request->input('pageSize', 10));

        $paginator = $query
            ->orderBy($sortColumn, $sortDirection)
            ->paginate($pageSize, ['*'], 'page', $pageIndex + 1);

        return response()->json([
            'rows' => $paginator->items(),
            'pageCount' => $paginator->lastPage(),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('accreditations/form', [
            'accreditation' => null,
            'statuses' => $this->statuses(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $this->validateRequest($request);

        DB::transaction(function () use ($validated): void {
            if ($validated['status'] === 'default') {
                Accreditation::query()->update(['status' => 'active']);
            }

            Accreditation::create($validated);
        });

        return redirect()
            ->route('accreditations.index')
            ->with('status', 'Accreditation created.');
    }

    public function edit(Accreditation $accreditation): Response
    {
        return Inertia::render('accreditations/form', [
            'accreditation' => $accreditation,
            'statuses' => $this->statuses(),
        ]);
    }

    public function update(Request $request, Accreditation $accreditation): RedirectResponse
    {
        $validated = $this->validateRequest($request);

        DB::transaction(function () use ($validated, $accreditation): void {
            if ($validated['status'] === 'default') {
                Accreditation::query()
                    ->whereKeyNot($accreditation->id)
                    ->update(['status' => 'active']);
            }

            $accreditation->update($validated);
        });

        return redirect()
            ->route('accreditations.index')
            ->with('status', 'Accreditation updated.');
    }

    protected function validateRequest(Request $request): array
    {
        return $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'year' => ['required', 'integer', 'min:1900', 'max:'.((int) date('Y') + 1)],
            'status' => ['required', Rule::in($this->statuses())],
        ]);
    }

    /**
     * @return array<int, string>
     */
    protected function statuses(): array
    {
        return ['disabled', 'active', 'default'];
    }
}
