# DND-KIT Drag-and-Drop Research

Drag-and-drop patterns for module arrangement with dnd-kit.

**Source**: dnd-kit official documentation and examples.

## Quick Reference

- **Docs**: https://dndkit.com/
- **GitHub**: https://github.com/clauderic/dnd-kit
- **Examples**: https://examples.dndkit.com

## Critical Patterns for Module Arrangement

### 1. Multi-Container Setup

```typescript
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';

function ModuleEditor() {
  const [containers, setContainers] = useState({
    'palette': ['battery', 'clock', 'cpu'],
    'left': ['workspaces'],
    'center': ['window'],
    'right': ['tray', 'network'],
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor)
  );

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      {/* Palette */}
      <SortableContext items={containers.palette}>
        {containers.palette.map(id => <ModuleCard key={id} id={id} />)}
      </SortableContext>

      {/* Drop zones */}
      <SortableContext items={containers.left}>
        {containers.left.map(id => <ModuleCard key={id} id={id} />)}
      </SortableContext>

      <DragOverlay>
        {activeId ? <ModuleCard id={activeId} /> : null}
      </DragOverlay>
    </DndContext>
  );
}
```

### 2. Sortable Item Component

```tsx
function ModuleCard({ id }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {id}
    </div>
  );
}
```

### 3. Multi-Container Drag Handlers

```typescript
function handleDragOver(event) {
  const { active, over } = event;
  const activeContainer = findContainer(active.id);
  const overContainer = findContainer(over?.id);

  if (!activeContainer || !overContainer || activeContainer === overContainer) {
    return;
  }

  setContainers((prev) => {
    const activeItems = prev[activeContainer];
    const overItems = prev[overContainer];
    const activeIndex = activeItems.indexOf(active.id);

    return {
      ...prev,
      [activeContainer]: activeItems.filter(item => item !== active.id),
      [overContainer]: [...overItems, active.id],
    };
  });
}

function handleDragEnd(event) {
  const { active, over } = event;

  if (!over) return;

  const activeContainer = findContainer(active.id);
  const overContainer = findContainer(over.id);

  if (activeContainer !== overContainer) return;

  const activeIndex = containers[activeContainer].indexOf(active.id);
  const overIndex = containers[overContainer].indexOf(over.id);

  if (activeIndex !== overIndex) {
    setContainers((prev) => ({
      ...prev,
      [overContainer]: arrayMove(prev[overContainer], activeIndex, overIndex),
    }));
  }

  setActiveId(null);
}
```

### 4. Helper Function

```typescript
function findContainer(id: string) {
  if (id in containers) return id;
  return Object.keys(containers).find(key =>
    containers[key].includes(id)
  );
}
```

### 5. Collision Detection

```typescript
// For vertical lists
collisionDetection={closestCenter}

// For grids
collisionDetection={closestCorners}
```

### 6. CRITICAL: Use DragOverlay

```tsx
<DragOverlay>
  {activeId ? <ModulePreview id={activeId} /> : null}
</DragOverlay>
```

**Benefits**: Smoother animations, prevents layout shifts, better performance.

### 7. Accessibility (Built-in)

```typescript
const sensors = useSensors(
  useSensor(PointerSensor),
  useSensor(KeyboardSensor, {
    coordinateGetter: sortableKeyboardCoordinates,
  })
);
```

**Keyboard shortcuts**:
- Space/Enter: Pick up
- Arrow keys: Move
- Space/Enter: Drop
- Escape: Cancel

## Common Pitfalls

1. **Don't forget DragOverlay** - janky without it
2. **Use closestCenter for lists** - closestCorners for grids
3. **Always handle onDragOver** for multi-container
4. **Provide unique IDs** for all draggable items
