# Copilot Instructions — task-base

## Commands

```bash
npm run dev       # watch mode (esbuild, outputs main.js)
npm run build     # typecheck (tsc --noEmit) then bundle for production
npm run lint      # eslint across the whole project
npm run version   # bump version in manifest.json + versions.json + git add
```

There are no automated tests. Manual testing: copy `main.js`, `manifest.json`, `styles.css` to `<Vault>/.obsidian/plugins/task-base/` and reload Obsidian.

## Architecture

This is an Obsidian community plugin (`isDesktopOnly: false`) that provides task tracking on top of **Obsidian Bases** (the `programmatic-bases` plugin).

### Plugin loading lifecycle

`onload()` does **not** load the plugin immediately. It creates a `PluginDependencyManager` and waits for `programmatic-bases` to fire its `programmatic-bases:loaded` workspace event before calling `loadPlugin()`. Only once that runs does the plugin register commands and emit `task-base:loaded`.

The `PluginDependencyManager` lives in a **shared sibling directory** — not an npm package:
```
plugins/
  task-base/          ← this repo
  pluginUtilsCommon/  ← shared utilities, imported via relative path
    src/dependency.ts
```
`src/main.ts` imports it as `../../pluginUtilsCommon/dependency`. Do not move or restructure this import without updating the sibling library.

### Workspace events

`types/types.d.ts` augments the Obsidian `Workspace` interface with plugin-specific events:
- `task-base:loaded` — plugin fully initialized
- `task-base:loadFailed` — initialization threw an error
- `task-base:unloaded` — plugin unloaded

Always trigger these on success/failure in `loadPlugin()`.

### Metadata type system (`src/metadata/`)

The `ComplexPropertyValue<TValue, TSerialized>` interface is the core abstraction for properties that need serialization to/from YAML frontmatter:

```ts
interface ComplexPropertyValue<TValue, TSerialized extends PrimitivePropertyValue> {
  serialize:   () => TSerialized;
  deserialize: () => TValue | undefined;
}
```

- `DatePropertyValue` — serializes `Date` → `"2024-03-15"` (date-only ISO string)
- `DateTimePropertyValue` — serializes `Date` → full ISO string
- `EditBehavior` enum governs whether a property is user-editable, auto-populated, or both

`src/metadata/statusProperty.ts` and `src/metadata/defaultProperties.ts` are **work in progress** (incomplete/empty).

## Key conventions

- **`tsconfig.json` sets `baseUrl: "src"`** — imports within `src/` should be relative (`./settings`, `./metadata/metadataTypes`), not absolute from the project root.
- **esbuild outputs CJS** (`format: "cjs"`), targeting `es2018`. All dependencies except `obsidian`, `electron`, and `@codemirror/*` are bundled into `main.js`.
- **`js-yaml`** is a runtime dependency (unusual); it is bundled into the output.
- **Settings** are persisted via `loadData()`/`saveData()` with `Object.assign({}, DEFAULT_SETTINGS, ...)` merge pattern. Settings tab re-saves on every `onChange`.
- **Releasing**: tag must exactly match `manifest.json` version (no leading `v`). Run `npm run version` to sync `versions.json`. Attach `main.js`, `manifest.json`, and `styles.css` as release assets.
- **ESLint** uses `eslint-plugin-obsidianmd` for Obsidian-specific rules. A GitHub Actions workflow runs `npm run build && npm run lint` on every push/PR against Node 20 and 22.
