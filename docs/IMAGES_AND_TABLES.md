# Images and tables

## Image configuration

SHEditor supports URL insertion, Base64 embedding, clipboard/drop insertion, and an asynchronous server upload adapter. The adapter owns authentication, progress infrastructure, and the server response shape; it returns either a URL string or `{ url }`.

```ts
const ui = createEditorUI(element, {
  image: {
    acceptedTypes: ['image/png', 'image/jpeg', 'image/webp'],
    maxFileSize: 5 * 1024 * 1024,
    allowBase64: true,
    upload: async (file, { signal }) => {
      const body = new FormData();
      body.append('image', file);
      const response = await fetch('/api/images', { method: 'POST', body, signal });
      if (!response.ok) throw new Error('Upload failed');
      return (await response.json()) as { url: string };
    },
    onError: console.error,
  },
});
```

Use `editor.commands.insertImage({ src, alt, title, width, align })` for URLs and `await editor.insertImageFile(file, 'base64' | 'upload', { alt, title })` for files. HTTP(S), root-relative, and supported image data URLs are accepted. Script URLs and non-image data URLs are rejected. Width and alignment persist in HTML and JSON. Selecting an image exposes four resize handles in the default UI; resize is clamped between 80 and 1600 pixels.

Dropped and pasted image files choose `upload` when an adapter exists, otherwise Base64. Default limits are 10 MiB and PNG/JPEG/GIF/WebP. Set `allowBase64: false` when embedded document data is not acceptable.

## Table commands

`insertTable(rows, columns, withHeaderRow)` creates a schema-backed table. The default UI also exposes commands for adding/deleting rows and columns, merging/splitting selected cells, toggling a header row, and deleting the table. The complete command API additionally includes `addRowBefore`, `addColumnBefore`, and `toggleHeaderColumn`.

Cell selections, keyboard navigation, merged cells, and column-resize persistence are provided by the ProseMirror table model. HTML and JSON round-trip through the same sanitizer and schema as the rest of the document.

For production upload adapters, return a durable public or signed URL. Browser `blob:` URLs are suitable only for previews and are intentionally used only by the playground's simulated adapter.
