import { DOMParser as PMDOMParser, DOMSerializer } from "prosemirror-model";
import {
  EditorState,
  TextSelection,
  type Command,
  type Plugin,
} from "prosemirror-state";
import { EditorView, type NodeView } from "prosemirror-view";
import {
  baseKeymap,
  chainCommands,
  createParagraphNear,
  liftEmptyBlock,
  newlineInCode,
  setBlockType,
  splitBlock,
  toggleMark,
  wrapIn,
} from "prosemirror-commands";
import { history, redo, undo } from "prosemirror-history";
import { keymap } from "prosemirror-keymap";
import {
  liftListItem,
  sinkListItem,
  splitListItem,
  wrapInList,
} from "prosemirror-schema-list";
import {
  addColumnAfter,
  addColumnBefore,
  addRowAfter,
  addRowBefore,
  columnResizing,
  deleteColumn,
  deleteRow,
  deleteTable,
  mergeCells,
  splitCell,
  tableEditing,
  toggleHeaderColumn,
  toggleHeaderRow,
} from "prosemirror-tables";
import { PluginError, ParseError, SHEditorError } from "./errors";
import { schema } from "./schema";
import { sanitizeHTML } from "./sanitize";
import type {
  Chain,
  Content,
  EditorCommands,
  Extension,
  Locale,
  SHEditorAPI,
  SHEditorOptions,
} from "./types";

type EventName = "update" | "focus" | "blur";
class ImageNodeView implements NodeView {
  dom: HTMLElement;
  private image: HTMLImageElement;
  constructor(
    private node: import("prosemirror-model").Node,
    private view: EditorView,
    private getPos: () => number | undefined,
  ) {
    this.dom = document.createElement("span");
    this.dom.className = "she-image-node";
    this.image = document.createElement("img");
    this.image.draggable = true;
    this.dom.append(this.image);
    for (const edge of ["nw", "ne", "sw", "se"]) {
      const handle = document.createElement("span");
      handle.className = `she-image-handle she-image-handle--${edge}`;
      handle.addEventListener("mousedown", (event) => this.resize(event));
      this.dom.append(handle);
    }
    this.render();
  }
  private render() {
    this.image.src = String(this.node.attrs.src);
    this.image.alt = String(this.node.attrs.alt ?? "");
    this.image.title = String(this.node.attrs.title ?? "");
    this.image.style.width = this.node.attrs.width
      ? `${String(this.node.attrs.width)}px`
      : "auto";
    this.dom.dataset.align = String(this.node.attrs.align ?? "center");
    this.dom.dataset.wrap = String(this.node.attrs.wrap ?? "none");
  }
  private resize(event: MouseEvent) {
    event.preventDefault();
    const startX = event.clientX,
      startWidth = this.image.getBoundingClientRect().width;
    const move = (e: MouseEvent) => {
      const width = Math.max(
        80,
        Math.min(1600, Math.round(startWidth + e.clientX - startX)),
      );
      this.image.style.width = `${width}px`;
    };
    const up = (e: MouseEvent) => {
      move(e);
      removeEventListener("mousemove", move);
      removeEventListener("mouseup", up);
      const pos = this.getPos();
      if (pos !== undefined)
        this.view.dispatch(
          this.view.state.tr.setNodeMarkup(pos, undefined, {
            ...this.node.attrs,
            width: Math.round(this.image.getBoundingClientRect().width),
          }),
        );
    };
    addEventListener("mousemove", move);
    addEventListener("mouseup", up);
  }
  update(node: import("prosemirror-model").Node) {
    if (node.type !== this.node.type) return false;
    this.node = node;
    this.render();
    return true;
  }
  selectNode() {
    this.dom.classList.add("ProseMirror-selectednode");
  }
  deselectNode() {
    this.dom.classList.remove("ProseMirror-selectednode");
  }
  ignoreMutation() {
    return true;
  }
}
export class SHEditor implements SHEditorAPI {
  readonly schema = schema;
  view: EditorView | null = null;
  private currentState: EditorState;
  private options: SHEditorOptions;
  private editable: boolean;
  private registeredFonts = new Set<string>();
  private listeners = new Map<EventName, Set<(...args: never[]) => void>>();
  readonly commands: EditorCommands;

  constructor(options: SHEditorOptions = {}) {
    this.options = options;
    this.editable = options.editable ?? true;
    const doc = this.parse(options.content ?? "<p></p>");
    const extensions = options.extensions ?? [];
    const names = new Set<string>();
    const extensionPlugins: Plugin[] = [];
    for (const extension of extensions) {
      if (names.has(extension.name))
        throw new PluginError(
          `SHEditor: duplicate extension name “${extension.name}”.`,
        );
      names.add(extension.name);
      extensionPlugins.push(...(extension.plugins?.({ schema }) ?? []));
    }
    const keys = {
      ...baseKeymap,
      "Mod-z": undo,
      "Mod-y": redo,
      "Mod-Shift-z": redo,
      "Mod-b": toggleMark(schema.marks.bold!),
      "Mod-i": toggleMark(schema.marks.italic!),
      "Mod-u": toggleMark(schema.marks.underline!),
      Enter: chainCommands(
        splitListItem(schema.nodes.list_item!),
        newlineInCode,
        createParagraphNear,
        liftEmptyBlock,
        splitBlock,
      ),
      Tab: sinkListItem(schema.nodes.list_item!),
      "Shift-Tab": liftListItem(schema.nodes.list_item!),
    };
    this.currentState = EditorState.create({
      doc,
      plugins: [
        history(),
        keymap(keys),
        columnResizing(),
        tableEditing(),
        ...extensionPlugins,
      ],
    });
    this.commands = this.makeCommands();
    if (options.element) this.mount(options.element);
  }
  get state(): EditorState {
    return this.view?.state ?? this.currentState;
  }
  private parse(content: Content) {
    try {
      if (typeof content !== "string") return schema.nodeFromJSON(content);
      const wrap = document.createElement("div");
      wrap.innerHTML = sanitizeHTML(content, this.options?.sanitizer);
      return PMDOMParser.fromSchema(schema).parse(wrap);
    } catch (cause) {
      throw new ParseError(
        `SHEditor: content could not be parsed. ${cause instanceof Error ? cause.message : ""}`,
      );
    }
  }
  private mount(element: HTMLElement): void {
    element.classList.add("she-content");
    element.dataset.locale = this.options.locale ?? "en";
    element.dir =
      this.options.direction ??
      (this.options.locale === "fa" || this.options.locale === "ar"
        ? "rtl"
        : "ltr");
    element.setAttribute(
      "aria-label",
      this.options.placeholder ?? "Rich text editor",
    );
    this.view = new EditorView(element, {
      state: this.currentState,
      editable: () => this.editable,
      dispatchTransaction: (transaction) => {
        const next = this.view!.state.apply(transaction);
        this.view!.updateState(next);
        this.currentState = next;
        if (transaction.docChanged) {
          this.options.onUpdate?.({ editor: this, transaction });
          this.emit("update");
        }
      },
      handleDOMEvents: {
        focus: () => {
          this.options.onFocus?.(this);
          this.emit("focus");
          return false;
        },
        blur: () => {
          this.options.onBlur?.(this);
          this.emit("blur");
          return false;
        },
      },
      attributes: {
        class: "she-prosemirror",
        "data-placeholder": this.options.placeholder ?? "",
      },
      nodeViews: {
        image: (node, view, getPos) => new ImageNodeView(node, view, getPos),
      },
      handleDrop: (view, event) => {
        const file = event.dataTransfer?.files?.[0];
        if (!file?.type.startsWith("image/")) return false;
        event.preventDefault();
        const coords = view.posAtCoords({
          left: event.clientX,
          top: event.clientY,
        });
        if (coords)
          view.dispatch(
            view.state.tr.setSelection(
              TextSelection.near(
                view.state.doc.resolve(
                  Math.min(coords.pos, view.state.doc.content.size),
                ),
              ),
            ),
          );
        void this.insertImageFile(file).catch((error) =>
          this.options.image?.onError?.(error),
        );
        return true;
      },
      handlePaste: (_view, event) => {
        const file = [...(event.clipboardData?.files ?? [])].find((item) =>
          item.type.startsWith("image/"),
        );
        if (!file) return false;
        event.preventDefault();
        void this.insertImageFile(file).catch((error) =>
          this.options.image?.onError?.(error),
        );
        return true;
      },
    });
  }
  private run(command: Command): boolean {
    if (!this.view)
      return command(this.state, (transaction) => {
        this.currentState = this.currentState.apply(transaction);
        if (transaction.docChanged) this.emit("update");
      });
    return command(this.view.state, this.view.dispatch, this.view);
  }
  private makeCommands(): EditorCommands {
    const mark = (name: string) => this.run(toggleMark(schema.marks[name]!));
    const setMark = (name: string, attrs: Record<string, unknown>) =>
      this.run((state, dispatch) => {
        const value = schema.marks[name]!.create(attrs);
        dispatch?.(
          state.selection.empty
            ? state.tr.addStoredMark(value)
            : state.tr.addMark(state.selection.from, state.selection.to, value),
        );
        return true;
      });
    const unsetMark = (name: string) =>
      this.run((state, dispatch) => {
        dispatch?.(
          state.selection.empty
            ? state.tr.removeStoredMark(schema.marks[name]!)
            : state.tr.removeMark(
                state.selection.from,
                state.selection.to,
                schema.marks[name],
              ),
        );
        return true;
      });
    const allowed = (
      value: string,
      values: string[] | undefined,
      label: string,
      pattern: RegExp,
    ) => {
      if (!pattern.test(value))
        throw new SHEditorError(`SHEditor: unsafe ${label} value.`);
      if (values?.length && !values.includes(value))
        throw new SHEditorError(
          `SHEditor: ${label} “${value}” is not in the configured allowlist.`,
        );
      return value;
    };
    const textAlign = (
      alignment: "left" | "center" | "right" | "justify" | null,
    ) =>
      this.run((state, dispatch) => {
        let tr = state.tr;
        const { from, to } = state.selection;
        state.doc.nodesBetween(from, to, (node, pos) => {
          if (
            node.isTextblock &&
            (node.type === schema.nodes.paragraph ||
              node.type === schema.nodes.heading)
          )
            tr = tr.setNodeMarkup(pos, undefined, {
              ...node.attrs,
              textAlign: alignment,
            });
        });
        dispatch?.(tr);
        return tr.docChanged;
      });
    return {
      focus: () => {
        this.focus();
        return true;
      },
      blur: () => {
        this.blur();
        return true;
      },
      toggleBold: () => mark("bold"),
      toggleItalic: () => mark("italic"),
      toggleUnderline: () => mark("underline"),
      toggleStrike: () => mark("strike"),
      toggleCode: () => mark("code"),
      toggleSubscript: () => mark("subscript"),
      toggleSuperscript: () => mark("superscript"),
      setTextColor: (color) =>
        setMark("text_color", {
          color: allowed(
            color,
            this.options.typography?.colors,
            "text color",
            /^(?:#[0-9a-f]{3,8}|rgba?\([\d\s,.%]+\)|[a-z]+)$/i,
          ),
        }),
      unsetTextColor: () => unsetMark("text_color"),
      setHighlight: (color) =>
        setMark("highlight", {
          color: allowed(
            color,
            this.options.typography?.highlights,
            "highlight",
            /^(?:#[0-9a-f]{3,8}|rgba?\([\d\s,.%]+\)|[a-z]+)$/i,
          ),
        }),
      unsetHighlight: () => unsetMark("highlight"),
      setFontFamily: (family) =>
        setMark("font_family", {
          family: allowed(
            family,
            [
              ...(this.options.typography?.fontFamilies ?? []),
              ...this.registeredFonts,
            ],
            "font family",
            /^[\w\s,'"-]+$/,
          ),
        }),
      setFontSize: (size) =>
        setMark("font_size", {
          size: allowed(
            size,
            this.options.typography?.fontSizes,
            "font size",
            /^(?:\d+(?:\.\d+)?(?:px|rem|em|%)|small|medium|large)$/i,
          ),
        }),
      setTextAlign: (alignment) => textAlign(alignment),
      unsetTextAlign: () => textAlign(null),
      setParagraph: () => this.run(setBlockType(schema.nodes.paragraph!)),
      setHeading: (level) =>
        this.run(setBlockType(schema.nodes.heading!, { level })),
      toggleBulletList: () => this.run(wrapInList(schema.nodes.bullet_list!)),
      toggleOrderedList: () => this.run(wrapInList(schema.nodes.ordered_list!)),
      toggleBlockquote: () => this.run(wrapIn(schema.nodes.blockquote!)),
      setLink: (href, title) => {
        if (!/^https?:|^mailto:|^tel:|^\/|^#/i.test(href))
          throw new SHEditorError("SHEditor: unsafe link URL.");
        return this.run(
          toggleMark(schema.marks.link!, { href, title: title ?? null }),
        );
      },
      unsetLink: () =>
        this.run((state, dispatch) => {
          dispatch?.(
            state.tr.removeMark(
              state.selection.from,
              state.selection.to,
              schema.marks.link,
            ),
          );
          return true;
        }),
      insertHorizontalRule: () =>
        this.run((state, dispatch) => {
          dispatch?.(
            state.tr
              .replaceSelectionWith(schema.nodes.horizontal_rule!.create())
              .scrollIntoView(),
          );
          return true;
        }),
      insertImage: (attrs) => {
        if (!this.isSafeImageURL(attrs.src))
          throw new SHEditorError("SHEditor: unsafe image URL.");
        return this.run((state, dispatch) => {
          dispatch?.(
            state.tr
              .replaceSelectionWith(
                schema.nodes.image!.create({
                  ...attrs,
                  alt: attrs.alt ?? "",
                  title: attrs.title ?? null,
                  width: attrs.width ?? null,
                  align: attrs.align ?? "center",
                  wrap: attrs.wrap ?? "none",
                }),
              )
              .scrollIntoView(),
          );
          return true;
        });
      },
      updateImage: (attrs) =>
        this.run((state, dispatch) => {
          const { from } = state.selection;
          const node = state.doc.nodeAt(from);
          if (!node || node.type !== schema.nodes.image) return false;
          dispatch?.(
            state.tr.setNodeMarkup(from, undefined, {
              ...node.attrs,
              ...attrs,
            }),
          );
          return true;
        }),
      insertTable: (rows = 3, cols = 3, withHeaderRow = true) =>
        this.run((state, dispatch) => {
          if (rows < 1 || cols < 1 || rows > 50 || cols > 50) return false;
          const cell = (header = false) =>
            schema.nodes[
              header ? "table_header" : "table_cell"
            ]!.createAndFill()!;
          const tableRows = Array.from({ length: rows }, (_, r) =>
            schema.nodes.table_row!.create(
              null,
              Array.from({ length: cols }, () =>
                cell(withHeaderRow && r === 0),
              ),
            ),
          );
          dispatch?.(
            state.tr
              .replaceSelectionWith(schema.nodes.table!.create(null, tableRows))
              .scrollIntoView(),
          );
          return true;
        }),
      addRowBefore: () => this.run(addRowBefore),
      addRowAfter: () => this.run(addRowAfter),
      deleteRow: () => this.run(deleteRow),
      addColumnBefore: () => this.run(addColumnBefore),
      addColumnAfter: () => this.run(addColumnAfter),
      deleteColumn: () => this.run(deleteColumn),
      deleteTable: () => this.run(deleteTable),
      mergeCells: () => this.run(mergeCells),
      splitCell: () => this.run(splitCell),
      toggleHeaderRow: () => this.run(toggleHeaderRow),
      toggleHeaderColumn: () => this.run(toggleHeaderColumn),
      undo: () => this.run(undo),
      redo: () => this.run(redo),
      clearFormatting: () =>
        this.run((state, dispatch) => {
          const { from, to } = state.selection;
          let tr = state.tr.removeMark(from, to);
          const para = schema.nodes.paragraph!;
          state.doc.nodesBetween(from, to, (node, pos) => {
            if (node.isTextblock && node.type !== para)
              tr = tr.setNodeMarkup(pos, para);
          });
          dispatch?.(tr);
          return true;
        }),
    };
  }
  private isSafeImageURL(src: string): boolean {
    return /^(?:https?:\/\/|blob:|\/|data:image\/(?:png|jpeg|gif|webp);base64,)/i.test(
      src,
    );
  }
  async insertImageFile(
    file: File,
    mode: "base64" | "upload" = this.options.image?.upload
      ? "upload"
      : "base64",
    attrs: {
      alt?: string;
      title?: string;
      align?: "left" | "center" | "right";
      wrap?: "none" | "left" | "right";
    } = {},
  ): Promise<boolean> {
    const accepted = this.options.image?.acceptedTypes ?? [
      "image/png",
      "image/jpeg",
      "image/gif",
      "image/webp",
    ];
    if (!accepted.includes(file.type))
      throw new SHEditorError(
        `SHEditor: unsupported image type “${file.type}”.`,
      );
    if (file.size > (this.options.image?.maxFileSize ?? 10 * 1024 * 1024))
      throw new SHEditorError(
        "SHEditor: image exceeds the configured size limit.",
      );
    let src: string;
    if (mode === "upload") {
      const upload = this.options.image?.upload;
      if (!upload)
        throw new SHEditorError(
          "SHEditor: no image upload adapter is configured.",
        );
      const result = await upload(file, {
        editor: this,
        signal: new AbortController().signal,
      });
      src = typeof result === "string" ? result : result.url;
    } else {
      if (this.options.image?.allowBase64 === false)
        throw new SHEditorError("SHEditor: base64 images are disabled.");
      src = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(file);
      });
    }
    return this.commands.insertImage({
      src,
      alt: attrs.alt ?? file.name,
      ...(attrs.title ? { title: attrs.title } : {}),
      ...(attrs.align ? { align: attrs.align } : {}),
      ...(attrs.wrap ? { wrap: attrs.wrap } : {}),
    });
  }
  getHTML(): string {
    const wrap = document.createElement("div");
    wrap.appendChild(
      DOMSerializer.fromSchema(schema).serializeFragment(
        this.state.doc.content,
      ),
    );
    return wrap.innerHTML;
  }
  getJSON(): Record<string, unknown> {
    return this.state.doc.toJSON() as Record<string, unknown>;
  }
  getText(): string {
    return this.state.doc.textBetween(0, this.state.doc.content.size, "\n");
  }
  setContent(content: Content, emitUpdate = true): void {
    const doc = this.parse(content);
    const tr = this.state.tr.replaceWith(
      0,
      this.state.doc.content.size,
      doc.content,
    );
    tr.setSelection(TextSelection.atStart(tr.doc));
    if (this.view) this.view.dispatch(tr);
    else this.currentState = this.state.apply(tr);
    if (emitUpdate && !this.view) this.emit("update");
  }
  setEditable(editable: boolean): void {
    this.editable = editable;
    this.view?.setProps({ editable: () => editable });
  }
  setLocale(locale: Locale): void {
    this.options = { ...this.options, locale };
    if (this.view) {
      this.view.dom
        .closest<HTMLElement>(".she-content")
        ?.setAttribute("data-locale", locale);
      this.view.dom.setAttribute("dir", locale === "en" ? "ltr" : "rtl");
    }
  }
  registerFontFamily(family: string): void {
    if (!/^[\w\s,'"-]+$/.test(family))
      throw new SHEditorError("SHEditor: unsafe font family value.");
    this.registeredFonts.add(family);
  }
  isActive(name: string, attrs: Record<string, unknown> = {}): boolean {
    const { from, to, empty } = this.state.selection;
    const mark = schema.marks[name];
    if (mark)
      return empty
        ? Boolean(
            mark.isInSet(
              this.state.storedMarks ?? this.state.selection.$from.marks(),
            ),
          )
        : this.state.doc.rangeHasMark(from, to, mark);
    const node = schema.nodes[name];
    return Boolean(
      node &&
      this.state.selection.$from.parent.type === node &&
      Object.entries(attrs).every(
        ([k, v]) => this.state.selection.$from.parent.attrs[k] === v,
      ),
    );
  }
  can(command: keyof EditorCommands): boolean {
    const fn = this.commands[command];
    return typeof fn === "function";
  }
  chain(): Chain {
    const tasks: Array<() => boolean> = [];
    const api: Chain = {
      focus: () => (tasks.push(() => this.commands.focus()), api),
      toggleBold: () => (tasks.push(() => this.commands.toggleBold()), api),
      toggleItalic: () => (tasks.push(() => this.commands.toggleItalic()), api),
      toggleUnderline: () => (
        tasks.push(() => this.commands.toggleUnderline()),
        api
      ),
      toggleStrike: () => (tasks.push(() => this.commands.toggleStrike()), api),
      undo: () => (tasks.push(() => this.commands.undo()), api),
      redo: () => (tasks.push(() => this.commands.redo()), api),
      run: () => tasks.every((task) => task()),
    };
    return api;
  }
  focus(): void {
    this.view?.focus();
  }
  blur(): void {
    (this.view?.dom as HTMLElement | undefined)?.blur();
  }
  on(event: EventName, callback: (...args: never[]) => void): () => void {
    const group = this.listeners.get(event) ?? new Set();
    group.add(callback);
    this.listeners.set(event, group);
    return () => group.delete(callback);
  }
  private emit(event: EventName): void {
    for (const callback of this.listeners.get(event) ?? []) callback();
  }
  destroy(): void {
    this.view?.destroy();
    this.view = null;
    this.listeners.clear();
  }
}
export function createEditor(options: SHEditorOptions = {}): SHEditor {
  return new SHEditor(options);
}
export function defineExtension(extension: Extension): Extension {
  return extension;
}
