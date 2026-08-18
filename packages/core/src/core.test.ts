import { describe, expect, it, vi } from "vitest";
import { TextSelection } from "prosemirror-state";
import { createEditor, PluginError, sanitizeHTML } from "./index";
describe("SHEditor core", () => {
  it("parses and serializes semantic HTML", () => {
    const editor = createEditor({
      content: "<h2>Hello <strong>world</strong></h2><p>Text</p>",
    });
    expect(editor.getHTML()).toBe(
      "<h2>Hello <strong>world</strong></h2><p>Text</p>",
    );
    expect(editor.getJSON().type).toBe("doc");
  });
  it("updates content without a DOM view", () => {
    const editor = createEditor();
    editor.setContent("<p>سلام دنیا</p>");
    expect(editor.getText()).toBe("سلام دنیا");
  });
  it("rejects duplicate extensions", () =>
    expect(() =>
      createEditor({ extensions: [{ name: "same" }, { name: "same" }] }),
    ).toThrow(PluginError));
  it("supports readonly and locale changes", () => {
    const element = document.createElement("div");
    const editor = createEditor({ element, locale: "fa", editable: false });
    expect(element.dir).toBe("rtl");
    editor.setEditable(true);
    editor.setLocale("en");
    expect(editor.view?.dom.getAttribute("dir")).toBe("ltr");
    editor.destroy();
  });
  it("emits updates and destroys safely", () => {
    const update = vi.fn();
    const element = document.createElement("div");
    const editor = createEditor({ element, onUpdate: update });
    editor.setContent("<p>changed</p>");
    expect(update).toHaveBeenCalledOnce();
    editor.destroy();
    expect(editor.view).toBeNull();
  });
  it("round-trips advanced typography and alignment", () => {
    const editor = createEditor({
      content:
        '<p style="text-align: center"><span style="color: #6750f2; font-size: 18px">Color</span> H<sub>2</sub>O x<sup>2</sup> <mark style="background-color: #fff2a8">mark</mark></p>',
    });
    const html = editor.getHTML();
    expect(html).toContain("text-align: center");
    expect(html).toContain("color: rgb(103, 80, 242)");
    expect(html).toContain("font-size: 18px");
    expect(html).toContain("<sub>2</sub>");
    expect(html).toContain("<sup>2</sup>");
    expect(createEditor({ content: html }).getHTML()).toBe(html);
  });
  it("applies typography commands with undo and redo", () => {
    const element = document.createElement("div");
    const editor = createEditor({
      element,
      content: "<p>Styled text</p>",
      typography: { colors: ["#6750f2"] },
    });
    editor.view!.dispatch(
      editor.state.tr.setSelection(
        TextSelection.create(editor.state.doc, 1, 12),
      ),
    );
    expect(editor.commands.setTextColor("#6750f2")).toBe(true);
    expect(editor.getHTML()).toContain("color: rgb(103, 80, 242)");
    expect(editor.commands.undo()).toBe(true);
    expect(editor.getHTML()).not.toContain("color:");
    expect(editor.commands.redo()).toBe(true);
    expect(editor.getHTML()).toContain("color: rgb(103, 80, 242)");
    expect(() => editor.commands.setTextColor("#000000")).toThrow("allowlist");
    editor.destroy();
  });
  it("aligns selected text blocks and serializes the property", () => {
    const element = document.createElement("div");
    const editor = createEditor({ element, content: "<p>One</p><p>Two</p>" });
    editor.view!.dispatch(
      editor.state.tr.setSelection(
        TextSelection.create(editor.state.doc, 1, 8),
      ),
    );
    expect(editor.commands.setTextAlign("right")).toBe(true);
    expect(editor.getHTML()).toContain("text-align: right");
    editor.commands.undo();
    expect(editor.getHTML()).not.toContain("text-align: right");
    editor.destroy();
  });
  it("inserts and round-trips safe images with persistent size", () => {
    const editor = createEditor({ content: "<p>before</p>" });
    expect(
      editor.commands.insertImage({
        src: "https://example.com/photo.jpg",
        alt: "Photo",
        width: 420,
        align: "right",
        wrap: "left",
      }),
    ).toBe(true);
    const html = editor.getHTML();
    expect(html).toContain('width="420"');
    expect(html).toContain('data-align="right"');
    expect(html).toContain('data-wrap="left"');
    expect(createEditor({ content: html }).getHTML()).toBe(html);
    expect(() =>
      editor.commands.insertImage({ src: "javascript:alert(1)" }),
    ).toThrow("unsafe image URL");
  });
  it("creates and round-trips semantic tables", () => {
    const editor = createEditor();
    expect(editor.commands.insertTable(3, 2, true)).toBe(true);
    const html = editor.getHTML();
    expect(html.match(/<th/g)).toHaveLength(2);
    expect(html.match(/<td/g)).toHaveLength(4);
    expect(createEditor({ content: html }).getHTML()).toBe(html);
  });
});
describe("security", () => {
  it.each([
    ["<img src=x onerror=alert(1)>", ""],
    ["<script>alert(1)</script>", "alert(1)"],
    [
      '<a href="javascript:alert(1)">x</a>',
      '<a rel="noopener noreferrer">x</a>',
    ],
    ['<iframe src="https://evil.test"></iframe>', ""],
    ['<img src="javascript:alert(1)" onerror="alert(1)">', ""],
  ])("sanitizes %s", (unsafe, safe) => expect(sanitizeHTML(unsafe)).toBe(safe));
  it("keeps safe links", () =>
    expect(sanitizeHTML('<a href="https://example.com">x</a>')).toContain(
      'href="https://example.com"',
    ));
  it("keeps allowlisted typography and removes dangerous CSS", () => {
    expect(
      sanitizeHTML(
        '<span style="color:#fff; background-image:url(javascript:alert(1))">x</span>',
      ),
    ).toBe('<span style="color:#fff">x</span>');
    const editor = createEditor();
    expect(() =>
      editor.commands.setFontFamily(
        "Arial; background:url(javascript:alert(1))",
      ),
    ).toThrow("unsafe font family");
  });
});
