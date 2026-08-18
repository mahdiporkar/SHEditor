# Custom fonts and CMS integration

SHEditor can load fonts already stored by a CMS and upload new font files through a host-owned adapter. The editor does not prescribe an endpoint, authentication scheme, or storage provider.

```ts
createEditorUI(element, {
  typography: {
    fontFamilies: ["Arial", "Tahoma"],
    acceptedFontTypes: ["font/woff2", "font/woff"],
    maxFontFileSize: 5 * 1024 * 1024,
    fontManager: {
      list: ({ signal }) =>
        fetch("/api/fonts", { signal }).then((response) => response.json()),
      upload: async (file, { signal }) => {
        const body = new FormData();
        body.append("font", file);
        const response = await fetch("/api/fonts", {
          method: "POST",
          body,
          signal,
        });
        if (!response.ok) throw new Error("Font upload failed");
        return response.json();
      },
    },
    onFontError: console.error,
  },
});
```

The `list` and `upload` adapters return `FontAsset` objects:

```ts
interface FontAsset {
  id: string;
  name: string;
  family: string;
  url: string;
  format?: "woff2" | "woff" | "truetype" | "opentype";
  weight?: string;
  style?: "normal" | "italic" | "oblique";
}
```

Font URLs must use HTTP(S), `blob:` or `data:`. Production font servers must permit the editor origin through CORS. WOFF2 is recommended for its compression and broad browser support. The default file-size limit is 5 MiB and accepted extensions are WOFF2, WOFF, TTF and OTF.

Loaded families are registered with the editor allowlist and browser `FontFaceSet`, then appear in the toolbar selector. Applying a font uses the existing `font_family` mark, so the family persists in HTML and JSON. Consumers rendering saved HTML must load the same font CSS or use `content.css` alongside their own `@font-face` declarations.
