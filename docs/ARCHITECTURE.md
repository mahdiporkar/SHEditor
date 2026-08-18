# SHEditor architecture

## Repository audit

The repository was empty except for Git metadata. There was no package manager, build system, editor implementation, CSS, test suite, or reusable code to preserve. The project now uses npm workspaces, strict TypeScript project references, Vitest, ESLint, Prettier, and Vite.

## Dependency direction

```text
React / Vue / Angular
          ↓
       UI + theme
          ↓
   @sheditor/core
          ↓
ProseMirror primitives
```

`@sheditor/core` owns the schema, state, commands, HTML parsing/serialization, extension contract, events, security policy and public API. It has no framework dependency. `@sheditor/ui` provides the optional accessible toolbar and CSS. Framework packages only bridge lifecycle and data binding. All browser globals are accessed during editor creation, not module evaluation, keeping imports SSR-safe.

## Decisions

- ProseMirror primitives provide transactional editing and proven selection/history semantics without wrapping another editor product.
- Extensions are named, typed units; duplicate names fail early. Future node/mark contributions will be composed before schema construction.
- The default sanitizer is an allowlist. Host additions are explicit and unsafe URL schemes remain rejected.
- UI text lives in typed `en`, `fa`, and `ar` dictionaries. CSS uses the `she-` namespace and custom properties.
- Optional future capabilities (tables, images, and collaboration) remain outside core package boundaries. AI integrations are intentionally out of scope.

## Public packages

| Package | Responsibility |
|---|---|
| `@sheditor/core` | Framework-independent model, commands, HTML and extensions |
| `@sheditor/ui` | Default toolbar, theme and portable content CSS |
| `@sheditor/react` | Controlled/uncontrolled React component and ref API |
| `@sheditor/vue` | Vue 3 `v-model` component and instance access |
| `@sheditor/angular` | Standalone component and `ControlValueAccessor` |

The planned `extensions`, `image`, `table`, `collaboration`, `ai`, and `testing` packages will only be introduced with complete vertical features.
