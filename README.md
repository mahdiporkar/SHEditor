[English](README.md) | [فارسی](README.fa.md) | [العربية](README.ar.md)

# SHEditor

A free, MIT-licensed, framework-agnostic WYSIWYG HTML editing platform built with strict TypeScript and ProseMirror primitives. SHEditor is under active development toward broad professional-editor coverage; it does **not** claim CKEditor parity yet.

[Live Demo](https://mahdiporkar.github.io/SHEditor/) · [Architecture](docs/ARCHITECTURE.md) · [Verified Feature Matrix](docs/FEATURE_MATRIX.md) · [Roadmap](docs/ROADMAP.md)

![SHEditor typography playground](docs/assets/sheditor-typography.png)

## Key features

- Semantic paragraphs, H1–H6, lists, blockquotes, code, links, and history
- Bold, italic, underline, strike, subscript, superscript, colors, highlight, font family/size, and alignment
- Typed commands, events, chain API, and public extension plugins
- Allowlist sanitization for HTML, URLs, attributes, and typography CSS
- First-class Persian/Arabic RTL, English, light/dark/custom themes, and accessible controls
- One core shared by Vanilla TypeScript, React, Vue 3, and Angular

Images, tables, Markdown, source editing, document features, import/export, comments, track changes, revisions, and collaboration remain planned or partial. See the matrix for exact status.

## Installation

```bash
npm install @sheditor/core @sheditor/ui
```

Framework packages are `@sheditor/react`, `@sheditor/vue`, and `@sheditor/angular`. Packages are currently developed in this monorepo and are not claimed as published until a release is announced.

## Quick start / Vanilla TypeScript

```ts
import { createEditorUI } from '@sheditor/ui';
import '@sheditor/ui/style.css';
import '@sheditor/ui/content.css';

const ui = createEditorUI(document.querySelector('#editor')!, {
  content: '<p>Hello SHEditor</p>',
  onUpdate: ({ editor }) => console.log(editor.getHTML()),
});
```

For a headless/custom UI, use `createEditor()` from `@sheditor/core` with an `element`.

## React

```tsx
import { useState } from 'react';
import { SHEditor } from '@sheditor/react';

export function ArticleEditor() {
  const [value, setValue] = useState('<p>Hello</p>');
  return <SHEditor value={value} onChange={setValue} />;
}
```

Use `defaultValue` for uncontrolled mode. A `SHEditorRef` exposes `editor`, `focus()`, and `getHTML()`. The wrapper avoids replacing content when the controlled value already matches editor HTML.

## Vue

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { SHEditor } from '@sheditor/vue';
const content = ref('<p>Hello</p>');
</script>
<template><SHEditor v-model="content" locale="en" /></template>
```

The Vue component emits `update:modelValue` and `ready`, accepts `locale`, `editable`, and `placeholder`, and exposes `getEditor()`/`focus()`.

## Angular

```ts
import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { SHEditorComponent } from '@sheditor/angular';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, SHEditorComponent],
  template: `<she-editor [formControl]="content" />`,
})
export class EditorPage {
  content = new FormControl('<p>Hello</p>');
}
```

The standalone component implements `ControlValueAccessor`: initial values, value changes, reset, touched state, and disabled state flow through Angular Forms. The `ready` output provides the editor instance. Template-driven forms work through `[(ngModel)]` when `FormsModule` is imported.

## Configuration

`SHEditorOptions` includes `content`, `editable`, `locale`, `direction`, `placeholder`, `extensions`, `sanitizer`, `typography`, and update/focus/blur callbacks. Typography allowlists constrain fonts, sizes, colors, and highlights.

```ts
const options = {
  locale: 'fa' as const,
  direction: 'rtl' as const,
  typography: { colors: ['#20222d', '#6750f2'], fontSizes: ['14px', '18px'] },
};
```

## Toolbar and commands

The optional UI shows only working commands. `editor.commands` includes focus/blur, marks, sub/superscript, typography, alignment, paragraph/headings, lists, blockquote, links, horizontal rule, clear formatting, undo, and redo. `chain()`, `can()`, and `isActive()` support custom UIs.

## Events

Configure `onUpdate`, `onFocus`, and `onBlur`, or subscribe with `editor.on('update' | 'focus' | 'blur', callback)`. The returned function unsubscribes. `destroy()` removes the view and listeners.

## HTML, JSON, and text APIs

Implemented: `getHTML()`, `getJSON()`, `getText()`, `setContent(htmlOrJSON)`, `focus()`, `blur()`, `setEditable()`, `setLocale()`, and `destroy()`. There are no `getMarkdown()`/`setMarkdown()` or true source-mode APIs yet.

## RTL and localization

```ts
createEditor({ locale: 'fa', direction: 'rtl', content: '<p>نسخه SHEditor برای React آماده است.</p>' });
createEditor({ locale: 'ar', direction: 'rtl', content: '<p>محرر عربي و English.</p>' });
```

Typed dictionaries cover `en`, `fa`, and `ar`. Direction is applied through the editor API, not only a demo container.

## Links

`setLink(href, title?)` accepts HTTP(S), mail, telephone, relative, and anchor URLs. Unsafe schemes throw. Advanced target/rel/bookmark UI and autolinking are not complete.

## Images and image upload

The professional image model, upload adapter, drag/drop, resize, metadata, caption, linking, and responsive image features are **missing** and scheduled for the next vertical milestone. No fake image API or endpoint is documented.

## Tables

Professional table nodes, selection, row/column operations, merge/split, resize, clipboard, and serialization are **missing**. The demo labels this honestly.

## Source editing and Markdown

The playground can inspect live HTML/JSON/text, but cannot edit source. Source mode and Markdown round-trip APIs are **missing**.

## Document features and import/export

Pagination, TOC, outline, footnotes, templates, merge fields, PDF/DOCX, Office paste, email export, and asset management are **missing** and reserved for modular packages/adapters.

## Comments, track changes, revisions, and collaboration

These features are **missing**. Collaboration will be optional and provider-based; the project does not fake multi-user behavior.

## Extensions and custom widgets

```ts
import { defineExtension } from '@sheditor/core';
import { Plugin } from 'prosemirror-state';

export const telemetry = defineExtension({
  name: 'telemetry',
  plugins: () => [new Plugin({})],
});
```

Named plugin contributions and duplicate detection work. Public schema/command/node-view contribution APIs are still partial; custom nodes/widgets should wait for that contract rather than import core internals.

## Themes and content CSS

The UI uses scoped `she-` classes and CSS custom properties. Import `@sheditor/ui/style.css` for controls and `@sheditor/ui/content.css` wherever saved HTML is rendered. Light, dark, custom, responsive, and print styles are available.

## Security

Input is sanitized before parsing. Safe defaults reject scripts, iframes, event handlers, dangerous URL schemes, and unsafe CSS while permitting configured additions. XSS regression tests are mandatory. Server-side applications must still validate and sanitize at their trust boundary.

## Accessibility

Controls have labels, pressed states, visible focus, keyboard operation, and semantic toolbar roles. WCAG/axe and cross-browser automation remain a partial gate, so no full WCAG certification is claimed.

## SSR and browser support

Packages avoid browser globals at module top level and initialize DOM state during mounting. Dedicated Next/Nuxt/Angular SSR smoke suites are pending. Current Chromium is manually verified; Firefox and WebKit automation is still required before declaring a stable browser matrix.

## Live demo

The static hash-routed playground is intended for [GitHub Pages](https://mahdiporkar.github.io/SHEditor/). If the URL returns 404, the repository owner must first select **Settings → Pages → Source: GitHub Actions**, then rerun `Deploy SHEditor Demo`; see [the setup guide](docs/GITHUB_PAGES.md).

## Development and testing

```bash
npm ci
npm run lint
npm run typecheck
npm test
npm run build
npm run dev
```

Vitest covers core parsing, serialization, commands, history, RTL, lifecycle, and XSS. Framework and cross-browser E2E coverage remains a release gate.

## License

[MIT](LICENSE) © SHEditor contributors.
