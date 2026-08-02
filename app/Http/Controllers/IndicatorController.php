<?php

namespace App\Http\Controllers;

use App\Models\Area;
use App\Models\Indicator;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class IndicatorController extends Controller
{
    public function moduleIndex(Request $request): Response
    {
        $accreditations = \App\Models\Accreditation::query()
            ->select('id', 'name', 'status')
            ->orderByDesc('status')
            ->orderBy('name')
            ->get();

        $selectedAccreditationId = $request->integer('accreditation_id')
            ?: $accreditations->firstWhere('status', 'default')?->id
            ?: $accreditations->first()?->id;

        $areas = Area::query()
            ->select('id', 'name', 'accreditation_id')
            ->when($selectedAccreditationId, fn ($query) => $query->where('accreditation_id', $selectedAccreditationId))
            ->orderBy('name')
            ->get();

        $selectedAreaId = $request->integer('area_id');
        if ($selectedAreaId && ! $areas->contains('id', $selectedAreaId)) {
            $selectedAreaId = null;
        }

        $selectedAreaId ??= $areas->first()?->id;

        $area = $selectedAreaId ? $areas->firstWhere('id', $selectedAreaId) : null;

        $indicators = $area
            ? $area->indicators()
                ->orderBy('parent_id')
                ->orderBy('sort_order')
                ->get(['id', 'parent_id', 'sort_order', 'title'])
            : collect();

        return Inertia::render('indicators/index', [
            'moduleMode' => true,
            'accreditations' => $accreditations,
            'areas' => $areas,
            'selectedAccreditationId' => $selectedAccreditationId,
            'selectedAreaId' => $selectedAreaId,
            'area' => $area?->only(['id', 'name']),
            'indicators' => $indicators,
        ]);
    }

    public function data(Request $request, Area $area): \Illuminate\Http\JsonResponse
    {
        $query = $area->indicators()->with('children.children');

        if ($search = $request->string('search')->trim()->toString()) {
            $query->where(function ($inner) use ($search) {
                $inner->where('title', 'like', "%{$search}%");
            });
        }

        $roots = $query->whereNull('parent_id')->orderBy('sort_order')->get();

        return response()->json([
            'rows' => $roots,
            'pageCount' => 1,
        ]);
    }

    public function create(Area $area): Response
    {
        $indicators = $area->indicators()->orderBy('sort_order')->get(['id', 'title', 'parent_id']);
        $defaultParentId = request()->integer('parent_id') ?: null;

        return Inertia::render('indicators/form', [
            'area' => $area->only(['id', 'name']),
            'indicator' => null,
            'indicators' => $indicators,
            'defaultParentId' => $defaultParentId,
        ]);
    }

    public function store(Request $request, Area $area): RedirectResponse
    {
        $validated = $this->validateRequest($request);
        $validated['area_id'] = $area->id;
        $validated['sort_order'] = (int) ($area->indicators()
            ->where('parent_id', $validated['parent_id'] ?? null)
            ->max('sort_order') ?? 0) + 1;

        Indicator::create($validated);

        return redirect()->back()->with('status', 'Indicator created.');
    }

    public function edit(Area $area, Indicator $indicator): Response
    {
        abort_unless($indicator->area_id === $area->id, 404);

        $indicators = $area->indicators()->whereKeyNot($indicator->id)->orderBy('sort_order')->get(['id', 'title', 'parent_id']);

        return Inertia::render('indicators/form', [
            'area' => $area->only(['id', 'name']),
            'indicator' => $indicator,
            'indicators' => $indicators,
        ]);
    }

    public function update(Request $request, Area $area, Indicator $indicator): RedirectResponse
    {
        abort_unless($indicator->area_id === $area->id, 404);

        $validated = $this->validateRequest($request);
        $validated['sort_order'] = $indicator->sort_order;

        $indicator->update($validated);

        return redirect()->back()->with('status', 'Indicator updated.');
    }

    public function destroy(Area $area, Indicator $indicator): RedirectResponse
    {
        abort_unless($indicator->area_id === $area->id, 404);

        $this->deleteDescendants($indicator);
        $indicator->delete();

        return redirect()->back()->with('status', 'Indicator deleted.');
    }

    protected function deleteDescendants(Indicator $indicator): void
    {
        $children = $indicator->children()->get();

        foreach ($children as $child) {
            $this->deleteDescendants($child);
            $child->delete();
        }
    }

    public function moveUp(Area $area, Indicator $indicator): RedirectResponse
    {
        abort_unless($indicator->area_id === $area->id, 404);

        $sibling = $area->indicators()
            ->where('parent_id', $indicator->parent_id)
            ->where('sort_order', '<', $indicator->sort_order)
            ->orderByDesc('sort_order')
            ->first();

        if ($sibling) {
            [$indicator->sort_order, $sibling->sort_order] = [$sibling->sort_order, $indicator->sort_order];
            $indicator->save();
            $sibling->save();
        }

        return redirect()->to(url()->previous());
    }

    public function moveDown(Area $area, Indicator $indicator): RedirectResponse
    {
        abort_unless($indicator->area_id === $area->id, 404);

        $sibling = $area->indicators()
            ->where('parent_id', $indicator->parent_id)
            ->where('sort_order', '>', $indicator->sort_order)
            ->orderBy('sort_order')
            ->first();

        if ($sibling) {
            [$indicator->sort_order, $sibling->sort_order] = [$sibling->sort_order, $indicator->sort_order];
            $indicator->save();
            $sibling->save();
        }

        return redirect()->back();
    }

    public function reorder(Request $request, Area $area): RedirectResponse
    {
        $data = $request->validate([
            'parent_id' => ['nullable', 'integer'],
            'ordered_ids' => ['required', 'array'],
            'ordered_ids.*' => ['integer'],
        ]);

        $parentId = $data['parent_id'] ?? null;
        $orderedIds = $data['ordered_ids'];

        $indicators = $area->indicators()
            ->where('parent_id', $parentId)
            ->whereIn('id', $orderedIds)
            ->get()
            ->keyBy('id');

        foreach (array_values($orderedIds) as $index => $id) {
            if ($indicator = $indicators->get($id)) {
                $indicator->sort_order = $index + 1;
                $indicator->save();
            }
        }

        return redirect()->back();
    }

    protected function validateRequest(Request $request): array
    {
        $areaId = request()->route('area')?->id;

        return $request->validate([
            'parent_id' => [
                'nullable',
                Rule::exists('indicators', 'id')->where(fn ($query) => $query->where('area_id', $areaId)),
            ],
            'title' => ['required', 'string', 'max:255'],
        ]);
    }
}
