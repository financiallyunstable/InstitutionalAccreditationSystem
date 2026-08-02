<?php

namespace App\Http\Controllers;

use App\Models\Accreditation;
use App\Models\Area;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class AreaController extends Controller
{
    public function index(): Response
    {
        $accreditations = Accreditation::query()
            ->orderBy('name')
            ->get(['id', 'name', 'status']);

        return Inertia::render('areas/index', [
            'canCreate' => $accreditations->isNotEmpty(),
            'accreditations' => $accreditations,
            'defaultAccreditationId' => $accreditations->firstWhere('status', 'default')?->id
                ?? $accreditations->first()?->id,
        ]);
    }

    public function data(Request $request): \Illuminate\Http\JsonResponse
    {
        $query = Area::query()->with('accreditation:id,name');

        if ($accreditationId = $request->integer('accreditation_id')) {
            $query->where('accreditation_id', $accreditationId);
        }

        if ($search = $request->string('search')->trim()->toString()) {
            $query->where(function ($inner) use ($search) {
                $inner->where('name', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%")
                    ->orWhere('video', 'like', "%{$search}%");
            });
        }

        $sorting = json_decode($request->input('sorting', '[]'), true);
        if (! is_array($sorting)) {
            $sorting = [];
        }
        $sortColumn = 'created_at';
        $sortDirection = 'desc';

        if (isset($sorting[0]['id'], $sorting[0]['desc'])) {
            $sortColumn = in_array($sorting[0]['id'], ['name', 'created_at'], true)
                ? $sorting[0]['id']
                : 'created_at';
            $sortDirection = $sorting[0]['desc'] ? 'desc' : 'asc';
        }

        $pageIndex = max(0, (int) $request->input('pageIndex', 0));
        $pageSize = max(1, (int) $request->input('pageSize', 10));

        $paginator = $query
            ->orderBy($sortColumn, $sortDirection)
            ->paginate($pageSize, ['*'], 'page', $pageIndex + 1);

        $rows = $paginator->getCollection()->map(function (Area $area): array {
            return [
                'id' => $area->id,
                'accreditation_name' => $area->accreditation?->name,
                'name' => $area->name,
                'description' => $area->description,
                'video' => $area->video,
                'video_url' => $area->video ? Storage::url($area->video) : null,
            ];
        })->all();

        return response()->json([
            'rows' => $rows,
            'pageCount' => $paginator->lastPage(),
        ]);
    }

    public function create(): Response
    {
        $accreditations = Accreditation::query()
            ->orderBy('name')
            ->get(['id', 'name', 'status']);

        $defaultAccreditationId = $accreditations->firstWhere('status', 'default')?->id
            ?? $accreditations->first()?->id;

        if ($accreditations->isEmpty()) {
            return redirect()
                ->route('areas.index')
                ->with('status', 'Create an accreditation first before adding areas.');
        }

        return Inertia::render('areas/form', [
            'area' => null,
            'accreditations' => $accreditations,
            'defaultAccreditationId' => $defaultAccreditationId,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $this->validateRequest($request);

        if ($request->hasFile('video')) {
            $validated['video'] = $request->file('video')->store('areas/videos', 'public');
        }

        Area::create($validated);

        return redirect()
            ->route('areas.index')
            ->with('status', 'Area created.');
    }

    public function edit(Area $area): Response
    {
        $accreditations = Accreditation::query()
            ->orderBy('name')
            ->get(['id', 'name', 'status']);

        return Inertia::render('areas/form', [
            'area' => $area,
            'accreditations' => $accreditations,
            'defaultAccreditationId' => $area->accreditation_id,
        ]);
    }

    public function update(Request $request, Area $area): RedirectResponse
    {
        $validated = $this->validateRequest($request);

        if ($request->hasFile('video')) {
            if ($area->video) {
                Storage::disk('public')->delete($area->video);
            }

            $validated['video'] = $request->file('video')->store('areas/videos', 'public');
        }

        $area->update($validated);

        return redirect()
            ->route('areas.index')
            ->with('status', 'Area updated.');
    }

    public function destroy(Area $area): RedirectResponse
    {
        if ($area->video) {
            Storage::disk('public')->delete($area->video);
        }

        $area->delete();

        return redirect()
            ->route('areas.index')
            ->with('status', 'Area deleted.');
    }

    protected function validateRequest(Request $request): array
    {
        return $request->validate([
            'accreditation_id' => ['required', 'exists:accreditations,id'],
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'video' => ['nullable', 'file', 'mimetypes:video/*', 'max:51200'],
        ]);
    }
}
