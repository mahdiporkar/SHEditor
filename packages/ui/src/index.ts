import {
  createEditor,
  dictionaries,
  type Locale,
  type SHEditor,
  type SHEditorOptions,
  type TranslationKey,
} from "@sheditor/core";

export interface EditorUI {
  editor: SHEditor;
  element: HTMLElement;
  destroy(): void;
}
type Tool = {
  key: TranslationKey;
  icon: string;
  command: (editor: SHEditor) => boolean;
  active?: string;
};
const tools: Tool[] = [
  { key: "undo", icon: "↶", command: (e) => e.commands.undo() },
  { key: "redo", icon: "↷", command: (e) => e.commands.redo() },
  {
    key: "bold",
    icon: "B",
    command: (e) => e.commands.toggleBold(),
    active: "bold",
  },
  {
    key: "italic",
    icon: "I",
    command: (e) => e.commands.toggleItalic(),
    active: "italic",
  },
  {
    key: "underline",
    icon: "U",
    command: (e) => e.commands.toggleUnderline(),
    active: "underline",
  },
  {
    key: "strike",
    icon: "S",
    command: (e) => e.commands.toggleStrike(),
    active: "strike",
  },
  {
    key: "subscript",
    icon: "X₂",
    command: (e) => e.commands.toggleSubscript(),
    active: "subscript",
  },
  {
    key: "superscript",
    icon: "X²",
    command: (e) => e.commands.toggleSuperscript(),
    active: "superscript",
  },
  {
    key: "bulletList",
    icon: "•≡",
    command: (e) => e.commands.toggleBulletList(),
  },
  {
    key: "orderedList",
    icon: "1≡",
    command: (e) => e.commands.toggleOrderedList(),
  },
  {
    key: "blockquote",
    icon: "❝",
    command: (e) => e.commands.toggleBlockquote(),
  },
  { key: "clear", icon: "Tx", command: (e) => e.commands.clearFormatting() },
];
export function createEditorUI(
  host: HTMLElement,
  options: SHEditorOptions = {},
): EditorUI {
  const locale = options.locale ?? "en";
  const t = (key: TranslationKey) => dictionaries[locale][key];
  host.classList.add("she-editor");
  host.dir = options.direction ?? (locale === "en" ? "ltr" : "rtl");
  const toolbar = document.createElement("div");
  toolbar.className = "she-toolbar";
  toolbar.setAttribute("role", "toolbar");
  toolbar.setAttribute("aria-label", "Formatting");
  const surface = document.createElement("div");
  surface.className = "she-surface";
  host.append(toolbar, surface);
  const editor = createEditor({ ...options, element: surface });
  const update = () =>
    toolbar
      .querySelectorAll<HTMLButtonElement>("button[data-active]")
      .forEach((button) => {
        button.setAttribute(
          "aria-pressed",
          String(editor.isActive(button.dataset.active!)),
        );
      });
  for (const tool of tools) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "she-button";
    button.title = t(tool.key);
    button.setAttribute("aria-label", t(tool.key));
    if (tool.active) {
      button.dataset.active = tool.active;
      button.setAttribute("aria-pressed", "false");
    }
    button.textContent = tool.icon;
    button.addEventListener("mousedown", (event) => event.preventDefault());
    button.addEventListener("click", () => {
      tool.command(editor);
      editor.focus();
      update();
    });
    toolbar.append(button);
  }
  const select = document.createElement("select");
  select.className = "she-select";
  select.setAttribute("aria-label", t("heading"));
  select.innerHTML = `<option value="paragraph">${t("paragraph")}</option>${[1, 2, 3].map((n) => `<option value="${n}">${t("heading")} ${n}</option>`).join("")}`;
  select.addEventListener("change", () => {
    if (select.value === "paragraph") editor.commands.setParagraph();
    else editor.commands.setHeading(Number(select.value));
    editor.focus();
  });
  toolbar.insertBefore(select, toolbar.children[2] ?? null);
  const alignment = document.createElement("select");
  alignment.className = "she-select she-align";
  alignment.setAttribute("aria-label", t("alignment"));
  alignment.innerHTML =
    '<option value="">↔</option><option value="left">⇤ Left</option><option value="center">↔ Center</option><option value="right">⇥ Right</option><option value="justify">☰ Justify</option>';
  alignment.addEventListener("change", () => {
    const value = alignment.value;
    if (value)
      editor.commands.setTextAlign(
        value as "left" | "center" | "right" | "justify",
      );
    else editor.commands.unsetTextAlign();
    editor.focus();
  });
  toolbar.append(alignment);
  const color = document.createElement("input");
  color.type = "color";
  color.className = "she-color";
  color.value = "#6750f2";
  color.setAttribute("aria-label", t("textColor"));
  color.title = t("textColor");
  color.addEventListener("change", () => {
    editor.commands.setTextColor(color.value);
    editor.focus();
  });
  toolbar.append(color);
  const highlight = document.createElement("input");
  highlight.type = "color";
  highlight.className = "she-color she-highlight";
  highlight.value = "#fff2a8";
  highlight.setAttribute("aria-label", t("highlight"));
  highlight.title = t("highlight");
  highlight.addEventListener("change", () => {
    editor.commands.setHighlight(highlight.value);
    editor.focus();
  });
  toolbar.append(highlight);
  const imageButton = document.createElement("button");
  imageButton.type = "button";
  imageButton.className = "she-button";
  imageButton.textContent = "▧";
  imageButton.title = locale === "fa" ? "درج تصویر" : "Insert image";
  imageButton.setAttribute("aria-label", imageButton.title);
  imageButton.addEventListener("click", () => openImageDialog());
  toolbar.append(imageButton);
  const tableButton = document.createElement("button");
  tableButton.type = "button";
  tableButton.className = "she-button";
  tableButton.textContent = "▦";
  tableButton.title = locale === "fa" ? "درج جدول" : "Insert table";
  tableButton.setAttribute("aria-label", tableButton.title);
  tableButton.addEventListener("click", () => openTableDialog());
  toolbar.append(tableButton);
  const tableTools = document.createElement("div");
  tableTools.className = "she-table-tools";
  tableTools.setAttribute("aria-label", "Table controls");
  const tableActions: Array<[string, keyof typeof editor.commands]> = [
    ["+↕", "addRowAfter"],
    ["−↕", "deleteRow"],
    ["+↔", "addColumnAfter"],
    ["−↔", "deleteColumn"],
    ["Merge", "mergeCells"],
    ["Split", "splitCell"],
    ["TH", "toggleHeaderRow"],
    ["×", "deleteTable"],
  ];
  for (const [label, command] of tableActions) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "she-button";
    button.textContent = label;
    button.title = command;
    button.addEventListener("mousedown", (event) => event.preventDefault());
    button.addEventListener("click", () => {
      (editor.commands[command] as () => boolean)();
      editor.focus();
    });
    tableTools.append(button);
  }
  toolbar.append(tableTools);
  const makeDialog = (title: string) => {
    const dialog = document.createElement("dialog");
    dialog.className = "she-dialog";
    dialog.innerHTML = `<form method="dialog"><header><strong>${title}</strong><button value="cancel" aria-label="Close">×</button></header><div class="she-dialog-body"></div><footer><button value="cancel" class="she-dialog-cancel">Cancel</button><button value="default" class="she-dialog-submit">Insert</button></footer></form>`;
    host.append(dialog);
    return dialog;
  };
  const openImageDialog = () => {
    const dialog = makeDialog(locale === "fa" ? "درج تصویر" : "Insert image");
    const body = dialog.querySelector<HTMLElement>(".she-dialog-body")!;
    body.innerHTML = `<label>Source<select data-field="mode"><option value="url">Image URL</option><option value="base64">Embed as Base64</option><option value="upload" ${options.image?.upload ? "" : "disabled"}>Upload to server</option></select></label><label data-url>URL<input data-field="url" type="url" placeholder="https://example.com/image.jpg"></label><label data-file hidden>Image file<input data-field="file" type="file" accept="${(options.image?.acceptedTypes ?? ["image/png", "image/jpeg", "image/gif", "image/webp"]).join(",")}"></label><label>Alternative text<input data-field="alt" placeholder="Describe the image"></label><label>Alignment<select data-field="align"><option value="center">Center</option><option value="left">Left</option><option value="right">Right</option></select></label>`;
    const mode = body.querySelector<HTMLSelectElement>("[data-field=mode]")!;
    mode.addEventListener("change", () => {
      body.querySelector<HTMLElement>("[data-url]")!.hidden =
        mode.value !== "url";
      body.querySelector<HTMLElement>("[data-file]")!.hidden =
        mode.value === "url";
    });
    dialog.addEventListener("close", async () => {
      if (dialog.returnValue !== "default") {
        dialog.remove();
        return;
      }
      const alt =
        body.querySelector<HTMLInputElement>("[data-field=alt]")!.value;
      const align = body.querySelector<HTMLSelectElement>("[data-field=align]")!
        .value as "left" | "center" | "right";
      try {
        if (mode.value === "url")
          editor.commands.insertImage({
            src: body.querySelector<HTMLInputElement>("[data-field=url]")!
              .value,
            alt,
            align,
          });
        else {
          const file =
            body.querySelector<HTMLInputElement>("[data-field=file]")!
              .files?.[0];
          if (file)
            await editor.insertImageFile(
              file,
              mode.value as "base64" | "upload",
              { alt },
            );
        }
      } finally {
        dialog.remove();
        editor.focus();
      }
    });
    dialog.showModal();
  };
  const openTableDialog = () => {
    const dialog = makeDialog(locale === "fa" ? "درج جدول" : "Insert table");
    dialog.querySelector<HTMLElement>(".she-dialog-body")!.innerHTML =
      '<div class="she-grid-fields"><label>Rows<input data-field="rows" type="number" min="1" max="50" value="3"></label><label>Columns<input data-field="cols" type="number" min="1" max="50" value="3"></label></div><label class="she-checkbox"><input data-field="header" type="checkbox" checked> Header row</label>';
    dialog.addEventListener("close", () => {
      if (dialog.returnValue === "default")
        editor.commands.insertTable(
          Number(
            (dialog.querySelector("[data-field=rows]") as HTMLInputElement)
              .value,
          ),
          Number(
            (dialog.querySelector("[data-field=cols]") as HTMLInputElement)
              .value,
          ),
          (dialog.querySelector("[data-field=header]") as HTMLInputElement)
            .checked,
        );
      dialog.remove();
      editor.focus();
    });
    dialog.showModal();
  };
  const off = editor.on("update", update);
  return {
    editor,
    element: host,
    destroy: () => {
      off();
      editor.destroy();
      host.replaceChildren();
      host.classList.remove("she-editor");
    },
  };
}
export function setUILocale(ui: EditorUI, locale: Locale): void {
  ui.editor.setLocale(locale);
}
