# Feature matrix

Legend: ✅ Complete · 🟡 Partial · 🔴 Missing

This matrix tracks SHEditor honestly against capability categories common to CKEditor, TinyMCE, Tiptap and Froala; it is not a claim of parity.

| Category | SHEditor | Notes |
|---|---:|---|
| Paragraphs and H1–H6 | ✅ | Schema, commands, HTML round-trip |
| Bold, italic, underline, strike, code | ✅ | Commands, shortcuts for common marks |
| Bullet/ordered/nested lists | ✅ | ProseMirror list model and keyboard support |
| Blockquote, code block, HR, hard break | ✅ | Model and serialization; base UI covers quote |
| Undo/redo | ✅ | Transactional history and shortcuts |
| Links | ✅ | Safe command and scheme validation; dialog UI pending |
| HTML parsing/serialization | ✅ | Semantic output and stable JSON |
| XSS protection | ✅ | Allowlist sanitizer and regression tests |
| Typed extension API | 🟡 | Plugin contribution works; schema contribution planned |
| i18n / Persian / Arabic / RTL | ✅ | Typed dictionaries, live locale and direction |
| Accessible default toolbar | ✅ | Keyboard focus, ARIA labels and pressed state |
| Light/dark/custom theme | ✅ | CSS custom properties and dark demo |
| React integration | ✅ | Controlled/uncontrolled, callbacks and ref |
| Vue 3 integration | ✅ | `v-model`, lifecycle and editor access |
| Angular integration | ✅ | `ControlValueAccessor`, disabled/touched/change |
| Images and uploads | 🔴 | Milestone 2 |
| Professional tables | 🔴 | Milestone 3 |
| Find/replace, slash menu, source mode | 🔴 | Milestone 4–5 |
| Comments, track changes, collaboration | 🔴 | Milestone 6 |
| Provider-neutral AI | 🔴 | Milestone 7 |
