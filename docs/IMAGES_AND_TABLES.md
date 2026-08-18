# Images and tables

## Image configuration

SHEditor supports URL insertion, Base64 embedding, clipboard/drop insertion, and an asynchronous server upload adapter. The adapter owns authentication, progress infrastructure, and the server response shape; it returns either a URL string or `{ url }`.

```ts
const ui = createEditorUI(element, {
  image: {
    acceptedTypes: ["image/png", "image/jpeg", "image/webp"],
    maxFileSize: 5 * 1024 * 1024,
    allowBase64: true,
    upload: async (file, { signal }) => {
      const body = new FormData();
      body.append("image", file);
      const response = await fetch("/api/images", {
        method: "POST",
        body,
        signal,
      });
      if (!response.ok) throw new Error("Upload failed");
      return (await response.json()) as { url: string };
    },
    onError: console.error,
  },
});
```

## File manager

The optional file manager turns the image dialog into a reusable server asset library with search, upload, selection, metadata, and optional deletion.

```ts
image: {
  upload: uploadImage,
  fileManager: {
    list: async ({ search, signal }) => {
      const url = new URL('/api/assets', location.origin);
      if (search) url.searchParams.set('q', search);
      return fetch(url, { signal }).then(response => response.json());
    },
    delete: async (asset, { signal }) => {
      await fetch(`/api/assets/${asset.id}`, { method: 'DELETE', signal });
    },
  },
}
```

Each item returned by `list()` follows `FileAsset`: `{ id, url, name, thumbnailUrl?, mimeType?, size?, width?, height?, createdAt? }`. Search requests cancel the previous request through `AbortSignal`. Deletion is only displayed when the adapter supplies `delete`, and the UI asks for confirmation before calling it. Upload continues to use the shared `image.upload` adapter, keeping storage and authentication policy in the host application.

Use `editor.commands.insertImage({ src, alt, title, width, align })` for URLs and `await editor.insertImageFile(file, 'base64' | 'upload', { alt, title })` for files. HTTP(S), root-relative, and supported image data URLs are accepted. Script URLs and non-image data URLs are rejected. Width and alignment persist in HTML and JSON. Selecting an image exposes four resize handles in the default UI; resize is clamped between 80 and 1600 pixels.

Images also support Word-like text wrapping through `wrap: 'none' | 'left' | 'right'`. Selecting an image opens a contextual layout toolbar for switching between an independent image block, image-left/text-right, and image-right/text-left. The wrap value persists as `data-wrap` in HTML and in JSON, so saved documents retain their layout after reload.

Dropped and pasted image files choose `upload` when an adapter exists, otherwise Base64. Default limits are 10 MiB and PNG/JPEG/GIF/WebP. Set `allowBase64: false` when embedded document data is not acceptable.

## Table commands

`insertTable(rows, columns, withHeaderRow)` creates a schema-backed table. The default UI also exposes commands for adding/deleting rows and columns, merging/splitting selected cells, toggling a header row, and deleting the table. The complete command API additionally includes `addRowBefore`, `addColumnBefore`, and `toggleHeaderColumn`.

The table toolbar button opens a graphical 10×10 size picker when the cursor is outside a table. When the cursor is inside a table, the same button becomes a contextual management menu grouped into row, column, cell, header, and destructive operations. On narrow screens it is presented as a bottom sheet, and Persian/Arabic layouts follow RTL positioning.

Cell selections, keyboard navigation, merged cells, and column-resize persistence are provided by the ProseMirror table model. HTML and JSON round-trip through the same sanitizer and schema as the rest of the document.

For production upload adapters, return a durable public or signed URL. Browser `blob:` URLs are suitable only for previews and are intentionally used only by the playground's simulated adapter.
