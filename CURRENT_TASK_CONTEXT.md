# task-base — Current Task Context

## What this plugin does
Task management plugin for Obsidian. Tasks are markdown files with frontmatter properties, stored under a user-configured `taskLocation` folder. Uses the `programmatic-bases` plugin API to register YAML templates/components for Obsidian Bases views.

---

## Core data model

### Property schema (`src/metadata/taskProperties.ts`)

| Property   | Kind     | Type              | Values                                        |
|------------|----------|-------------------|-----------------------------------------------|
| `priority` | Manual   | enum string       | `critical`, `high`, `medium`, `low`           |
| `status`   | Manual   | enum string       | `not_started`, `in_progress`, `complete`, `dropped` |
| `due_date` | Manual   | date (YYYY-MM-DD) | any date                                      |
| `resolved` | Auto     | boolean           | computed: `status` is `complete` or `dropped` |

**Display labels**: enum values are snake_case for file properties. Human-readable display strings are in `PRIORITY_DISPLAY` and `STATUS_DISPLAY` record maps (e.g. `not_started` → `"Not Started"`). Use these wherever values are shown to the user (dropdowns, etc.).

A file is a task if it lives under `taskLocation` and has a `status` property.

### `Task` class (`src/task/task.ts`)
- Constructor: `priority`, `status`, `due_date`
- `resolved` is a computed getter (not stored on the object, but IS written to frontmatter)
- `serialize(fm)` — writes all properties into a frontmatter object (used inside `processFrontMatter`)
- `Task.deserialize(fm)` — reads from a frontmatter object
- `Task.createDefault()` — returns `new Task('medium', 'not_started', null)`

---

## Features implemented

- **Settings** (`src/settings.ts`): user picks `taskLocation` via folder input with autocomplete + red-border validation
- **Create Task command** (`src/task/taskCreator.ts`): modal with task name, category (subfolder, relative to `taskLocation`), priority dropdown, status dropdown, date picker, create button
  - Validation: name required, no invalid filename chars, no overwrite existing file, category chars valid
  - Error display: red border + error text under each field; create button disabled while invalid
  - Category autocomplete via `FolderSuggest` scoped to `taskLocation` (relative paths)
- **FolderSuggest** (`src/ui/folderSuggest.ts`): `AbstractInputSuggest<TFolder>` with optional `basePath` — filters to subfolders and returns relative paths
- **TaskManager** (`src/task/taskManager.ts`): listens to `metadataCache.on('changed')`, auto-writes `resolved` frontmatter when `status` changes; infinite-loop guarded by early return if `resolved` already correct
- **Templates**: YAML templates bundled via esbuild YAML loader, registered with `programmatic-bases` via `window.programmaticBases.registerSource()` in `src/templates/templateSource.ts`
- **Tests**: full vitest suite covering `Task`, `DatePropertyValue`, task properties constants, `FolderSuggest`, `TaskCreatorModal`, and `TaskManager`

---

## Key design notes

- Obsidian handles all YAML — no manual YAML string building anywhere
  - Deserialize: read from `cache.frontmatter` plain object
  - Serialize: mutate the `fm` object inside `processFrontMatter`
- `tsc -noEmit` has unavoidable errors from `pluginUtilsCommon` (can't resolve obsidian from its directory); esbuild is the actual build tool
- `types/types.d.ts` must have `export {}` at top so `declare module "obsidian"` is a proper augmentation (not an ambient module that shadows the real package)
