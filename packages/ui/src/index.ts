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
  tableButton.setAttribute("aria-haspopup", "menu");
  tableButton.setAttribute("aria-expanded", "false");
  toolbar.append(tableButton);
  let tableMenu: HTMLElement | null = null;
  const inTable = () => {
    const { $from } = editor.state.selection;
    for (let depth = $from.depth; depth > 0; depth--)
      if ($from.node(depth).type.name === "table") return true;
    return false;
  };
  const closeTableMenu = () => {
    tableMenu?.remove();
    tableMenu = null;
    tableButton.setAttribute("aria-expanded", "false");
    document.removeEventListener("pointerdown", outsideTableMenu);
  };
  const tableCommand = (command: keyof typeof editor.commands) => {
    (editor.commands[command] as () => boolean)();
    closeTableMenu();
    editor.focus();
  };
  const tableLabels =
    locale === "fa"
      ? {
          title: "درج جدول",
          manage: "مدیریت جدول",
          selected: "سلول انتخاب‌شده",
          row: "سطر",
          column: "ستون",
          cell: "سلول",
          before: "افزودن قبل",
          after: "افزودن بعد",
          remove: "حذف",
          merge: "ادغام سلول‌ها",
          split: "تفکیک سلول",
          headerRow: "سطر عنوان",
          headerColumn: "ستون عنوان",
          deleteTable: "حذف کامل جدول",
          custom: "اندازه دلخواه…",
          choose: "انتخاب اندازه",
        }
      : {
          title: "Insert table",
          manage: "Manage table",
          selected: "Selected cell",
          row: "Row",
          column: "Column",
          cell: "Cell",
          before: "Insert before",
          after: "Insert after",
          remove: "Delete",
          merge: "Merge cells",
          split: "Split cell",
          headerRow: "Header row",
          headerColumn: "Header column",
          deleteTable: "Delete table",
          custom: "Custom size…",
          choose: "Choose a size",
        };
  const icon = (
    name: "before" | "after" | "delete" | "merge" | "split" | "header",
  ) =>
    ({
      before: "＋←",
      after: "→＋",
      delete: "−",
      merge: "⇥⇤",
      split: "⇤│⇥",
      header: "▦",
    })[name];
  const addMenuAction = (
    container: HTMLElement,
    label: string,
    glyph: string,
    command: keyof typeof editor.commands,
    danger = false,
  ) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `she-table-action${danger ? " she-table-action--danger" : ""}`;
    button.innerHTML = `<span aria-hidden="true">${glyph}</span><small>${label}</small>`;
    button.addEventListener("mousedown", (event) => event.preventDefault());
    button.addEventListener("click", () => tableCommand(command));
    container.append(button);
  };
  const openTableMenu = () => {
    if (tableMenu) {
      closeTableMenu();
      return;
    }
    const menu = document.createElement("div");
    tableMenu = menu;
    menu.className = "she-table-menu";
    menu.classList.toggle("she-dark", host.classList.contains("she-dark"));
    menu.dir = host.dir;
    menu.setAttribute("role", "menu");
    const rect = tableButton.getBoundingClientRect();
    menu.style.top = `${rect.bottom + 8}px`;
    if (host.dir === "rtl")
      menu.style.right = `${Math.max(12, window.innerWidth - rect.right)}px`;
    else
      menu.style.left = `${Math.max(12, Math.min(rect.left, window.innerWidth - 344))}px`;
    if (!inTable()) {
      menu.innerHTML = `<div class="she-table-menu-head"><span class="she-table-menu-icon">▦</span><div><strong>${tableLabels.title}</strong><small>${tableLabels.choose}</small></div></div><div class="she-table-size" aria-label="${tableLabels.choose}"><strong data-size>3 × 3</strong><div class="she-table-grid"></div></div><button type="button" class="she-table-custom">⚙ <span>${tableLabels.custom}</span></button>`;
      const grid = menu.querySelector<HTMLElement>(".she-table-grid")!;
      const size = menu.querySelector<HTMLElement>("[data-size]")!;
      for (let row = 1; row <= 10; row++)
        for (let col = 1; col <= 10; col++) {
          const cell = document.createElement("button");
          cell.type = "button";
          cell.className = "she-table-grid-cell";
          cell.classList.toggle("is-selected", row <= 3 && col <= 3);
          cell.dataset.row = String(row);
          cell.dataset.col = String(col);
          cell.setAttribute("aria-label", `${row} × ${col}`);
          cell.addEventListener("pointerenter", () => {
            size.textContent = `${row} × ${col}`;
            grid
              .querySelectorAll<HTMLElement>(".she-table-grid-cell")
              .forEach((item) =>
                item.classList.toggle(
                  "is-selected",
                  Number(item.dataset.row) <= row &&
                    Number(item.dataset.col) <= col,
                ),
              );
          });
          cell.addEventListener("click", () => {
            editor.commands.insertTable(row, col, true);
            closeTableMenu();
            editor.focus();
          });
          grid.append(cell);
        }
      menu.querySelector(".she-table-custom")!.addEventListener("click", () => {
        closeTableMenu();
        openTableDialog();
      });
    } else {
      menu.innerHTML = `<div class="she-table-menu-head"><span class="she-table-menu-icon">▦</span><div><strong>${tableLabels.manage}</strong><small>${tableLabels.selected}</small></div></div>`;
      const groups: Array<
        [
          string,
          Array<[string, string, keyof typeof editor.commands, boolean?]>,
        ]
      > = [
        [
          tableLabels.row,
          [
            [tableLabels.before, icon("before"), "addRowBefore"],
            [tableLabels.after, icon("after"), "addRowAfter"],
            [tableLabels.remove, icon("delete"), "deleteRow"],
          ],
        ],
        [
          tableLabels.column,
          [
            [tableLabels.before, icon("before"), "addColumnBefore"],
            [tableLabels.after, icon("after"), "addColumnAfter"],
            [tableLabels.remove, icon("delete"), "deleteColumn"],
          ],
        ],
        [
          tableLabels.cell,
          [
            [tableLabels.merge, icon("merge"), "mergeCells"],
            [tableLabels.split, icon("split"), "splitCell"],
            [tableLabels.headerRow, icon("header"), "toggleHeaderRow"],
            [tableLabels.headerColumn, icon("header"), "toggleHeaderColumn"],
          ],
        ],
      ];
      for (const [title, actions] of groups) {
        const section = document.createElement("section");
        section.className = "she-table-menu-section";
        section.innerHTML = `<h4>${title}</h4><div></div>`;
        const actionsHost = section.querySelector<HTMLElement>("div")!;
        for (const [label, glyph, command, danger] of actions)
          addMenuAction(actionsHost, label, glyph, command, danger);
        menu.append(section);
      }
      const danger = document.createElement("div");
      danger.className = "she-table-menu-danger";
      addMenuAction(danger, tableLabels.deleteTable, "⌫", "deleteTable", true);
      menu.append(danger);
    }
    document.body.append(menu);
    tableButton.setAttribute("aria-expanded", "true");
    window.setTimeout(
      () => document.addEventListener("pointerdown", outsideTableMenu),
      0,
    );
  };
  const outsideTableMenu = (event: PointerEvent) => {
    if (
      tableMenu?.contains(event.target as Node) ||
      tableButton.contains(event.target as Node)
    )
      return;
    closeTableMenu();
  };
  tableButton.addEventListener("mousedown", (event) => event.preventDefault());
  tableButton.addEventListener("click", openTableMenu);
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
      closeTableMenu();
      editor.destroy();
      host.replaceChildren();
      host.classList.remove("she-editor");
    },
  };
}
export function setUILocale(ui: EditorUI, locale: Locale): void {
  ui.editor.setLocale(locale);
}
