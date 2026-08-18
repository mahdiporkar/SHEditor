import { createEditorUI, type EditorUI } from "@sheditor/ui";
import type {
  Direction,
  Extension,
  FileAsset,
  ImageOptions,
  Locale,
  SHEditorAPI,
} from "@sheditor/core";
import "../../../packages/ui/src/style.css";
import "../../../packages/ui/src/content.css";
import "./playground.css";
import { calloutExtension } from "./examples/callout-extension";
import {
  extensionContent,
  fullContent,
  imageContent,
  readonlyContent,
  rtlContent,
  snippets,
  tableContent,
} from "./examples/content";

type Route =
  | "overview"
  | "full"
  | "images"
  | "tables"
  | "rtl"
  | "source"
  | "react"
  | "vue"
  | "angular"
  | "extensions"
  | "readonly";
const routes: Array<{ id: Route; label: string }> = [
  { id: "overview", label: "Overview" },
  { id: "full", label: "Full Editor" },
  { id: "images", label: "Images" },
  { id: "tables", label: "Tables" },
  { id: "rtl", label: "RTL" },
  { id: "source", label: "Source HTML" },
  { id: "react", label: "React" },
  { id: "vue", label: "Vue" },
  { id: "angular", label: "Angular" },
  { id: "extensions", label: "Extensions" },
  { id: "readonly", label: "Readonly" },
];
const app = document.querySelector<HTMLElement>("#app")!;
let activeUI: EditorUI | null = null;
let theme =
  localStorage.getItem("she-demo-theme") ??
  (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
function escapeHTML(value: string): string {
  const node = document.createElement("span");
  node.textContent = value;
  return node.innerHTML;
}
function currentRoute(): Route {
  const candidate = location.hash.replace(/^#\/?(?:demo\/)?/, "") as Route;
  return routes.some((route) => route.id === candidate)
    ? candidate
    : "overview";
}
function shell(route: Route, content: string): void {
  activeUI?.destroy();
  activeUI = null;
  document.documentElement.dataset.theme = theme;
  app.innerHTML = `<header class="site-header"><a class="brand" href="#/overview" aria-label="SHEditor home"><span>SH</span><b>SHEditor</b></a><button class="mobile-nav" id="menu-toggle" aria-label="Toggle navigation" aria-expanded="false">Menu</button><nav id="primary-nav" aria-label="Demo navigation">${routes.map((item) => `<a href="#/demo/${item.id}" ${item.id === route ? 'aria-current="page"' : ""}>${item.label}${item.id === "images" || item.id === "tables" ? "<small>Soon</small>" : ""}</a>`).join("")}</nav><div class="header-actions"><button class="icon-button" id="theme-toggle" aria-label="Switch color theme">${theme === "dark" ? "☀" : "◐"}</button><a class="github-link" href="https://github.com/mahdiporkar/SHEditor">GitHub ↗</a></div></header><main id="main-content">${content}</main><footer class="site-footer"><span>SHEditor · MIT licensed · Built with TypeScript</span><a href="https://github.com/mahdiporkar/SHEditor">Source on GitHub</a></footer><div class="toast" id="toast" role="status" aria-live="polite"></div>`;
  document.querySelector("#theme-toggle")?.addEventListener("click", () => {
    theme = theme === "dark" ? "light" : "dark";
    localStorage.setItem("she-demo-theme", theme);
    document.documentElement.dataset.theme = theme;
    document
      .querySelectorAll(".she-editor")
      .forEach((node) => node.classList.toggle("she-dark", theme === "dark"));
    const button = document.querySelector("#theme-toggle");
    if (button) button.textContent = theme === "dark" ? "☀" : "◐";
  });
  document.querySelector("#menu-toggle")?.addEventListener("click", (event) => {
    const button = event.currentTarget as HTMLButtonElement;
    const nav = document.querySelector("#primary-nav")!;
    const open = button.getAttribute("aria-expanded") !== "true";
    button.setAttribute("aria-expanded", String(open));
    nav.classList.toggle("open", open);
  });
}
function editorFrame(title: string, subtitle: string): string {
  return `<section class="editor-card"><header><div><span class="status-dot"></span><strong>${title}</strong><small>${subtitle}</small></div><div class="editor-actions"><button class="secondary-button" id="reset-editor">Reset example</button></div></header><div id="editor"></div><footer class="metrics" id="metrics" aria-live="polite"><span>Words <b data-metric="words">0</b></span><span>Characters <b data-metric="characters">0</b></span><span>HTML <b data-metric="size">0 B</b></span><span>Direction <b data-metric="direction">LTR</b></span><span>Editable <b data-metric="editable">Yes</b></span></footer></section>`;
}
function mountEditor(
  content: string,
  options: {
    locale?: Locale;
    direction?: Direction;
    editable?: boolean;
    extensions?: Extension[];
    image?: ImageOptions;
    onUpdate?: (editor: SHEditorAPI) => void;
  } = {},
): EditorUI {
  const host = document.querySelector<HTMLElement>("#editor")!;
  let metricTimer = 0;
  const update = (editor: SHEditorAPI) => {
    window.clearTimeout(metricTimer);
    metricTimer = window.setTimeout(() => {
      const text = editor.getText();
      const html = editor.getHTML();
      document.querySelector("[data-metric=words]")!.textContent = String(
        text.trim() ? text.trim().split(/\s+/).length : 0,
      );
      document.querySelector("[data-metric=characters]")!.textContent = String(
        text.length,
      );
      document.querySelector("[data-metric=size]")!.textContent =
        `${new Blob([html]).size} B`;
      document.querySelector("[data-metric=direction]")!.textContent = (
        options.direction ?? "ltr"
      ).toUpperCase();
      document.querySelector("[data-metric=editable]")!.textContent =
        (options.editable ?? true) ? "Yes" : "No";
      options.onUpdate?.(editor);
    }, 80);
  };
  const ui = createEditorUI(host, {
    content,
    locale: options.locale ?? "en",
    direction: options.direction ?? "ltr",
    editable: options.editable ?? true,
    ...(options.extensions ? { extensions: options.extensions } : {}),
    ...(options.image ? { image: options.image } : {}),
    placeholder: "Start writing…",
    onUpdate: ({ editor }) => update(editor),
  });
  ui.element.classList.toggle("she-dark", theme === "dark");
  update(ui.editor);
  document
    .querySelector("#reset-editor")
    ?.addEventListener("click", () => ui.editor.setContent(content));
  activeUI = ui;
  return ui;
}
function hero(): string {
  return `<section class="hero"><div class="hero-copy"><p class="eyebrow">OPEN SOURCE · TYPESCRIPT FIRST</p><h1>Modern WYSIWYG<br><span>HTML editing platform.</span></h1><p class="lead">One dependable editor core for Vanilla JavaScript, React, Vue and Angular—with secure output and first-class RTL.</p><div class="hero-actions"><a class="primary-button" href="#/demo/full">Try full editor</a><a class="secondary-button" href="https://github.com/mahdiporkar/SHEditor">View on GitHub</a><a class="text-link" href="https://github.com/mahdiporkar/SHEditor#readme">Documentation →</a></div><div class="framework-row"><span>Framework agnostic</span><b>React</b><b>Vue</b><b>Angular</b><b>Vanilla JS</b></div></div><div class="api-window" aria-label="SHEditor TypeScript example"><div><i></i><i></i><i></i><span>editor.ts</span></div><pre><code>${escapeHTML(snippets.vanilla)}</code></pre></div></section>`;
}
function overviewPage(): void {
  shell(
    "overview",
    `${hero()}<section class="section-heading"><p class="eyebrow">LIVE PLAYGROUND</p><h2>Write first. Configure later.</h2><p>The editor below is the real <code>@sheditor/core</code> package with the optional default UI.</p></section>${editorFrame("Untitled document", "Changes stay in this browser session")}<section class="feature-grid"><article><span>01</span><h3>Framework agnostic</h3><p>A single transactional editing model behind every integration.</p></article><article><span>02</span><h3>Clean, secure HTML</h3><p>Schema parsing and allowlist sanitization protect saved content.</p></article><article><span>03</span><h3>RTL first</h3><p>Persian and Arabic locale dictionaries with real editor direction APIs.</p></article><article><span>04</span><h3>Plugin architecture</h3><p>Typed public extensions contribute ProseMirror plugins without coupling core.</p></article></section><section class="open-source"><div><p class="eyebrow">FREE & OPEN SOURCE</p><h2>Built in public, licensed for everyone.</h2><p>Use, modify, and distribute SHEditor under the MIT license.</p></div><a class="primary-button" href="https://github.com/mahdiporkar/SHEditor">Explore the repository ↗</a></section>`,
  );
  mountEditor(fullContent);
}
function fullPage(): void {
  shell(
    "full",
    `<section class="page-intro"><p class="eyebrow">FULL EDITOR</p><h1>Every stable feature, ready to try.</h1><p>Select text, apply formatting, build lists, create links, and inspect semantic output. The toolbar contains working commands only.</p></section>${editorFrame("Full editor", "Real @sheditor/ui toolbar")}`,
  );
  mountEditor(fullContent);
}
function rtlPage(): void {
  shell(
    "rtl",
    `<section class="page-intro rtl-intro" dir="rtl"><p class="eyebrow">RTL · PERSIAN</p><h1>ویرایش حرفه‌ای، از راست به چپ.</h1><p>این نمونه با API واقعی <code>locale: 'fa'</code> و <code>direction: 'rtl'</code> اجرا می‌شود. نوشتن ترکیبی فارسی و English را امتحان کنید.</p></section>${editorFrame("سند فارسی", "جهت و زبان واقعی ویرایشگر")}`,
  );
  mountEditor(rtlContent, { locale: "fa", direction: "rtl" });
}
function sourcePage(): void {
  shell(
    "source",
    `<section class="page-intro"><p class="eyebrow">CONTENT INSPECTOR</p><h1>Visual editing. Transparent output.</h1><p>Edit on the left and inspect the exact HTML, JSON, or plain text generated on the right.</p></section><section class="source-grid"><div>${editorFrame("Visual editor", "Live document")}</div><aside class="output-panel"><header><div class="tabs" role="tablist"><button role="tab" aria-selected="true" data-output="html">HTML</button><button role="tab" aria-selected="false" data-output="json">JSON</button><button role="tab" aria-selected="false" data-output="text">Text</button></div><button class="copy-button" id="copy-output">Copy HTML</button></header><pre><code id="output-code"></code></pre></aside></section>`,
  );
  let mode: "html" | "json" | "text" = "html";
  const render = (editor: SHEditorAPI) => {
    const value =
      mode === "html"
        ? editor.getHTML()
        : mode === "json"
          ? JSON.stringify(editor.getJSON(), null, 2)
          : editor.getText();
    document.querySelector("#output-code")!.textContent = value;
    document.querySelector("#copy-output")!.textContent =
      `Copy ${mode.toUpperCase()}`;
  };
  const ui = mountEditor(fullContent, { onUpdate: render });
  document
    .querySelectorAll<HTMLButtonElement>("[data-output]")
    .forEach((button) =>
      button.addEventListener("click", () => {
        mode = button.dataset.output as typeof mode;
        document
          .querySelectorAll("[data-output]")
          .forEach((item) =>
            item.setAttribute("aria-selected", String(item === button)),
          );
        render(ui.editor);
      }),
    );
  document
    .querySelector("#copy-output")
    ?.addEventListener("click", async () => {
      await navigator.clipboard.writeText(
        document.querySelector("#output-code")!.textContent ?? "",
      );
      showToast("Copied to clipboard");
    });
  render(ui.editor);
}
function frameworkPage(route: "react" | "vue" | "angular"): void {
  const labels = { react: "React", vue: "Vue 3", angular: "Angular" };
  shell(
    route,
    `<section class="page-intro"><p class="eyebrow">FRAMEWORK INTEGRATION</p><h1>${labels[route]}, powered by the same core.</h1><p>This example matches the package’s current public API and compiles against the workspace implementation.</p></section><section class="example-layout"><div>${editorFrame(`${labels[route]} preview`, "Rendered with the shared core")}</div><aside class="code-card"><header><span>${route === "angular" ? "article-editor.ts" : route === "vue" ? "ArticleEditor.vue" : "ArticleEditor.tsx"}</span><button class="copy-button" id="copy-code">Copy code</button></header><pre><code>${escapeHTML(snippets[route])}</code></pre></aside></section>`,
  );
  mountEditor(fullContent);
  document.querySelector("#copy-code")?.addEventListener("click", async () => {
    await navigator.clipboard.writeText(snippets[route]);
    showToast("Code copied");
  });
}
function extensionPage(): void {
  shell(
    "extensions",
    `<section class="page-intro"><p class="eyebrow">PUBLIC EXTENSION API</p><h1>Extend behavior without forking core.</h1><p>This callout is a real plugin decoration registered with <code>defineExtension()</code>.</p></section><section class="example-layout"><div>${editorFrame("Callout extension", "Active demoCallout plugin")}</div><aside class="code-card"><header><span>callout-extension.ts</span><button class="copy-button" id="copy-code">Copy code</button></header><pre><code>${escapeHTML(snippets.extension)}</code></pre></aside></section>`,
  );
  mountEditor(extensionContent, { extensions: [calloutExtension] });
  document.querySelector("#copy-code")?.addEventListener("click", async () => {
    await navigator.clipboard.writeText(snippets.extension);
    showToast("Extension code copied");
  });
}
function readonlyPage(): void {
  shell(
    "readonly",
    `<section class="page-intro"><p class="eyebrow">EDITABLE STATE</p><h1>One renderer. Two modes.</h1><p>Toggle the real editor instance without replacing the document or losing content.</p></section><div class="toggle-row"><span>Editable</span><button id="editable-toggle" class="toggle" role="switch" aria-checked="true"><i></i><span>ON</span></button></div>${editorFrame("Product announcement", "Editable mode is on")}`,
  );
  const ui = mountEditor(readonlyContent);
  let editable = true;
  document
    .querySelector("#editable-toggle")
    ?.addEventListener("click", (event) => {
      editable = !editable;
      ui.editor.setEditable(editable);
      const button = event.currentTarget as HTMLButtonElement;
      button.setAttribute("aria-checked", String(editable));
      button.querySelector("span")!.textContent = editable ? "ON" : "OFF";
      document.querySelector("[data-metric=editable]")!.textContent = editable
        ? "Yes"
        : "No";
    });
}
function imagePage(): void {
  shell(
    "images",
    `<section class="page-intro"><p class="eyebrow">IMAGE WORKFLOW</p><h1>Upload, browse, and reuse assets.</h1><p>Choose File manager in the image dialog to search a server-backed library, upload, select, delete, insert, align, wrap, and resize an image.</p></section>${editorFrame("Image and file manager", "Asset library + three insertion modes")}`,
  );
  let assets: FileAsset[] = [
    {
      id: "forest",
      name: "forest.jpg",
      url: "https://picsum.photos/id/15/1200/800",
      thumbnailUrl: "https://picsum.photos/id/15/320/240",
      width: 1200,
      height: 800,
      size: 184000,
    },
    {
      id: "workspace",
      name: "workspace.jpg",
      url: "https://picsum.photos/id/20/1200/800",
      thumbnailUrl: "https://picsum.photos/id/20/320/240",
      width: 1200,
      height: 800,
      size: 211000,
    },
    {
      id: "architecture",
      name: "architecture.jpg",
      url: "https://picsum.photos/id/43/1200/800",
      thumbnailUrl: "https://picsum.photos/id/43/320/240",
      width: 1200,
      height: 800,
      size: 196000,
    },
    {
      id: "mountain",
      name: "mountain.jpg",
      url: "https://picsum.photos/id/29/1200/800",
      thumbnailUrl: "https://picsum.photos/id/29/320/240",
      width: 1200,
      height: 800,
      size: 228000,
    },
    {
      id: "camera",
      name: "camera.jpg",
      url: "https://picsum.photos/id/250/1200/800",
      thumbnailUrl: "https://picsum.photos/id/250/320/240",
      width: 1200,
      height: 800,
      size: 173000,
    },
  ];
  mountEditor(imageContent, {
    image: {
      upload: async (file) => URL.createObjectURL(file),
      fileManager: {
        list: async ({ search }) =>
          assets.filter(
            (asset) =>
              !search ||
              asset.name.toLowerCase().includes(search.toLowerCase()),
          ),
        delete: async (asset) => {
          assets = assets.filter((item) => item.id !== asset.id);
        },
      },
      maxFileSize: 10 * 1024 * 1024,
      onError: (error) =>
        showToast(
          error instanceof Error ? error.message : "Image upload failed",
        ),
    },
  });
}
function tablePage(): void {
  shell(
    "tables",
    `<section class="page-intro"><p class="eyebrow">TABLE WORKFLOW</p><h1>Structured tables, without friction.</h1><p>Create tables and manage selected cells with row, column, merge, split, header and delete commands. Column widths persist in HTML and JSON.</p></section>${editorFrame("Table editor", "Cell selection and column resizing")}`,
  );
  mountEditor(tableContent);
}
function showToast(message: string): void {
  const toast = document.querySelector<HTMLElement>("#toast");
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("show");
  window.setTimeout(() => toast.classList.remove("show"), 1800);
}
function render(): void {
  try {
    const route = currentRoute();
    if (route === "overview") overviewPage();
    else if (route === "full") fullPage();
    else if (route === "rtl") rtlPage();
    else if (route === "source") sourcePage();
    else if (route === "react" || route === "vue" || route === "angular")
      frameworkPage(route);
    else if (route === "extensions") extensionPage();
    else if (route === "readonly") readonlyPage();
    else if (route === "images") imagePage();
    else tablePage();
  } catch (error) {
    console.error(error);
    app.innerHTML =
      '<main class="error-state"><h1>The demo could not start.</h1><p>Reload the page or open an issue if the problem continues.</p><a href="#/overview">Return to overview</a></main>';
  }
}
window.addEventListener("hashchange", render);
render();
