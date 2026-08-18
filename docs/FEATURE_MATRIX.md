# SHEditor verified feature matrix

Updated for the current `0.1.0` development line. AI is intentionally excluded. Legend: ✅ COMPLETE · 🟡 PARTIAL · 🔴 MISSING · ⚪ NOT APPLICABLE.

A row is complete only when its applicable model, commands, UI, keyboard behavior, serialization, save/reload, readonly, RTL, security, tests, framework access, and demo requirements are verified. Framework columns mean the shared feature is reachable through that wrapper, not that each wrapper reimplements it.

| Feature | Status | Tests | React | Angular | Vue | RTL | Serialization | Undo/Redo | Demo | Notes |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|
| **Core editing** |||||||||||
| Paragraph and H1–H6 | ✅ | Unit | ✅ | ✅ | ✅ | ✅ | HTML/JSON | ✅ | ✅ | Semantic nodes and commands |
| Bold, italic, underline, strike | ✅ | Unit | ✅ | ✅ | ✅ | ✅ | HTML/JSON | ✅ | ✅ | UI and shortcuts for common marks |
| Inline code | 🟡 | Parse | ✅ | ✅ | ✅ | ✅ | HTML/JSON | ✅ | 🔴 | Command exists; default toolbar omits it |
| Subscript and superscript | ✅ | Unit | ✅ | ✅ | ✅ | ✅ | HTML/JSON | ✅ | ✅ | Mutually exclusive marks |
| Code block and preformatted text | 🟡 | Parse | ✅ | ✅ | ✅ | ✅ | HTML/JSON | ✅ | 🔴 | Model exists; dedicated UI missing |
| Hard break and horizontal rule | 🟡 | Parse | ✅ | ✅ | ✅ | ✅ | HTML/JSON | ✅ | 🔴 | Commands/model exist; UI incomplete |
| Blockquote | ✅ | Unit | ✅ | ✅ | ✅ | ✅ | HTML/JSON | ✅ | ✅ | Also powers extension demo |
| Clear formatting | ✅ | Unit | ✅ | ✅ | ✅ | ✅ | HTML/JSON | ✅ | ✅ | Removes marks and restores paragraphs |
| Selection/focus lifecycle | 🟡 | Unit | ✅ | ✅ | ✅ | ✅ | ⚪ | ⚪ | ✅ | More keyboard/E2E coverage required |
| Readonly/editable | ✅ | Unit | ✅ | ✅ | ✅ | ✅ | Stable | ⚪ | ✅ | Runtime toggle demonstrated |
| **Typography and layout** |||||||||||
| Text color | ✅ | Unit/XSS | ✅ | ✅ | ✅ | ✅ | HTML/JSON | ✅ | ✅ | Typed allowlist support |
| Background/highlight color | ✅ | Unit/XSS | ✅ | ✅ | ✅ | ✅ | HTML/JSON | ✅ | ✅ | Safe CSS filtering |
| Font family | 🟡 | Round-trip | ✅ | ✅ | ✅ | ✅ | HTML/JSON | ✅ | 🔴 | Command and allowlist; default picker pending |
| Font size | 🟡 | Round-trip | ✅ | ✅ | ✅ | ✅ | HTML/JSON | ✅ | 🔴 | Command and allowlist; default picker pending |
| Text alignment | ✅ | Unit | ✅ | ✅ | ✅ | ✅ | HTML/JSON | ✅ | ✅ | Left/center/right/justify |
| Line height/letter spacing | 🔴 | 🔴 | 🔴 | 🔴 | 🔴 | 🔴 | 🔴 | 🔴 | 🔴 | Planned formatting phase |
| Indent/outdent | 🟡 | Unit | ✅ | ✅ | ✅ | ✅ | HTML/JSON | ✅ | 🟡 | Nested-list Tab works; block indent missing |
| Change case | 🔴 | 🔴 | 🔴 | 🔴 | 🔴 | ⚪ | 🔴 | 🔴 | 🔴 | Must preserve Persian/Arabic |
| **Lists and links** |||||||||||
| Bullet/ordered/nested lists | 🟡 | Unit | ✅ | ✅ | ✅ | ✅ | HTML/JSON | ✅ | ✅ | Advanced marker/start/reversed properties missing |
| Task lists | 🔴 | 🔴 | 🔴 | 🔴 | 🔴 | 🔴 | 🔴 | 🔴 | 🔴 | Planned |
| Multi-level legal lists | 🔴 | 🔴 | 🔴 | 🔴 | 🔴 | 🔴 | 🔴 | 🔴 | 🔴 | Planned |
| Safe links | 🟡 | Unit/XSS | ✅ | ✅ | ✅ | ✅ | HTML/JSON | ✅ | 🟡 | URL/title supported; dialog and advanced rel UI missing |
| Bookmarks/anchors | 🔴 | 🔴 | 🔴 | 🔴 | 🔴 | 🔴 | 🔴 | 🔴 | 🔴 | Planned |
| Autolink and autoformat | 🔴 | 🔴 | 🔴 | 🔴 | 🔴 | 🔴 | 🔴 | 🔴 | 🔴 | Planned |
| **Productivity** |||||||||||
| History | ✅ | Unit | ✅ | ✅ | ✅ | ✅ | ⚪ | ✅ | ✅ | Mod-Z/Y/Shift-Z |
| Find and replace | 🔴 | 🔴 | 🔴 | 🔴 | 🔴 | 🔴 | ⚪ | 🔴 | 🔴 | Planned |
| Format painter | 🔴 | 🔴 | 🔴 | 🔴 | 🔴 | 🔴 | ⚪ | 🔴 | 🔴 | Planned |
| Autosave API | 🔴 | 🔴 | 🔴 | 🔴 | 🔴 | ⚪ | 🔴 | ⚪ | 🔴 | Host callback architecture planned |
| Fullscreen/show blocks | 🔴 | 🔴 | 🔴 | 🔴 | 🔴 | 🔴 | ⚪ | ⚪ | 🔴 | Planned |
| Special characters/emoji | 🔴 | 🔴 | 🔴 | 🔴 | 🔴 | 🔴 | 🔴 | ✅ | 🔴 | Planned optional UI |
| **HTML, clipboard and source** |||||||||||
| Semantic HTML parser/serializer | ✅ | Unit | ✅ | ✅ | ✅ | ✅ | HTML | ✅ | ✅ | Schema-based fragments |
| Stable JSON | ✅ | Unit | ✅ | ✅ | ✅ | ✅ | JSON | ✅ | ✅ | Public getJSON/setContent |
| Plain text output | ✅ | Unit | ✅ | ✅ | ✅ | ✅ | Text | ⚪ | ✅ | Public getText |
| Allowlist sanitization | ✅ | XSS | ✅ | ✅ | ✅ | ✅ | Clean HTML | ⚪ | ✅ | Script/iframe/events/URLs/CSS covered |
| Configurable HTML support | 🟡 | Unit | ✅ | ✅ | ✅ | ✅ | HTML | ✅ | 🔴 | Extra tags/attrs/schemes; schema extension incomplete |
| Paste pipeline/Office/Docs | 🔴 | 🔴 | 🔴 | 🔴 | 🔴 | 🔴 | 🔴 | 🔴 | 🔴 | Browser default passes through parser only |
| Visual source editing | 🔴 | 🔴 | 🔴 | 🔴 | 🔴 | 🔴 | 🔴 | 🔴 | 🔴 | Demo inspector is read-only, not source mode |
| Markdown | 🔴 | 🔴 | 🔴 | 🔴 | 🔴 | 🔴 | 🔴 | 🔴 | 🔴 | No getMarkdown/setMarkdown claims |
| **Images, tables, media** |||||||||||
| Image insertion/upload/resize | 🟡 | Unit/XSS | ✅ | ✅ | ✅ | ✅ | HTML/JSON | ✅ | ✅ | URL, Base64, adapter, drop/paste, alt/title/alignment; captions and progress UI pending |
| Professional tables | 🟡 | Unit | ✅ | ✅ | ✅ | ✅ | HTML/JSON | ✅ | ✅ | Cell selection, rows/columns, merge/split, headers and resize; cell-property UI/E2E pending |
| Media/audio/video/embed | 🔴 | 🔴 | 🔴 | 🔴 | 🔴 | 🔴 | 🔴 | 🔴 | 🔴 | Planned modular package |
| Attachments/asset manager | 🔴 | 🔴 | 🔴 | 🔴 | 🔴 | 🔴 | 🔴 | 🔴 | 🔴 | Planned provider interface |
| Math/Mermaid | 🔴 | 🔴 | 🔴 | 🔴 | 🔴 | 🔴 | 🔴 | 🔴 | 🔴 | Planned optional extensions |
| **Documents/import/export** |||||||||||
| Page breaks/pagination | 🔴 | 🔴 | 🔴 | 🔴 | 🔴 | 🔴 | 🔴 | 🔴 | 🔴 | Planned document package |
| TOC/outline/minimap | 🔴 | 🔴 | 🔴 | 🔴 | 🔴 | 🔴 | 🔴 | 🔴 | 🔴 | Planned |
| Footnotes/templates/merge fields | 🔴 | 🔴 | 🔴 | 🔴 | 🔴 | 🔴 | 🔴 | 🔴 | 🔴 | Planned |
| PDF/Word/import adapters | 🔴 | 🔴 | 🔴 | 🔴 | 🔴 | 🔴 | 🔴 | ⚪ | 🔴 | Planned adapter architecture |
| Email/inline-style export | 🔴 | 🔴 | 🔴 | 🔴 | 🔴 | 🔴 | 🔴 | ⚪ | 🔴 | Planned |
| **Collaboration and review** |||||||||||
| Mentions/comments | 🔴 | 🔴 | 🔴 | 🔴 | 🔴 | 🔴 | 🔴 | 🔴 | 🔴 | Planned optional packages |
| Track changes/revisions | 🔴 | 🔴 | 🔴 | 🔴 | 🔴 | 🔴 | 🔴 | 🔴 | 🔴 | Planned |
| Restricted editing | 🔴 | 🔴 | 🔴 | 🔴 | 🔴 | 🔴 | 🔴 | 🔴 | 🔴 | Planned |
| Real-time collaboration | 🔴 | 🔴 | 🔴 | 🔴 | 🔴 | 🔴 | Yjs planned | 🔴 | 🔴 | No collaboration is faked |
| **Architecture and integrations** |||||||||||
| Typed extension plugins | 🟡 | Unit | ✅ | ✅ | ✅ | ✅ | Depends | Depends | ✅ | Plugins work; schema/command contributions need expansion |
| Duplicate extension detection | ✅ | Unit | ✅ | ✅ | ✅ | ⚪ | ⚪ | ⚪ | ✅ | Structured PluginError |
| React controlled/uncontrolled/ref | 🟡 | Typecheck | ✅ | ⚪ | ⚪ | ✅ | Shared | Shared | ✅ | Integration E2E still required |
| Angular ControlValueAccessor | 🟡 | Typecheck | ⚪ | ✅ | ⚪ | ✅ | Shared | Shared | ✅ | Forms integration E2E still required |
| Vue 3 v-model/instance access | 🟡 | Typecheck | ⚪ | ⚪ | ✅ | ✅ | Shared | Shared | ✅ | Integration E2E still required |
| SSR-safe imports | 🟡 | Typecheck | 🟡 | 🟡 | 🟡 | ⚪ | ⚪ | ⚪ | 🔴 | No top-level DOM in packages; SSR smoke tests pending |
| i18n en/fa/ar | ✅ | Typecheck | ✅ | ✅ | ✅ | ✅ | ⚪ | ⚪ | ✅ | Typed dictionaries and runtime locale |
| Theme/content CSS/print | ✅ | Build | ✅ | ✅ | ✅ | ✅ | CSS | ⚪ | ✅ | Light/dark/custom variables |
| Accessibility | 🟡 | Manual | 🟡 | 🟡 | 🟡 | ✅ | ⚪ | ⚪ | ✅ | ARIA/focus present; axe and cross-browser gates pending |
| GitHub Pages playground | 🟡 | Build | ✅ | ✅ | ✅ | ✅ | Live output | ✅ | ✅ | Build is ready; repository Pages activation remains external |

## Parity summary

This matrix contains **62 feature rows**: **17 complete**, **17 partial**, and **28 missing**. The verified complete ratio is **17/62 (27.4%)**. This is not CKEditor parity. Feature coverage is under active development, following vertical slices rather than placeholder controls.
