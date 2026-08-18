import type { Node as PMNode, Schema } from "prosemirror-model";
import type { EditorState, Transaction } from "prosemirror-state";
import type { EditorView } from "prosemirror-view";

export type Locale = "en" | "fa" | "ar";
export type Direction = "ltr" | "rtl" | "auto";
export type Content = string | Record<string, unknown>;
export type ImageInsertMode = "url" | "base64" | "upload";
export type ImageWrap = "none" | "left" | "right";
export interface ImageUploadContext {
  editor: SHEditorAPI;
  signal: AbortSignal;
}
export interface FileAsset {
  id: string;
  url: string;
  name: string;
  thumbnailUrl?: string;
  mimeType?: string;
  size?: number;
  width?: number;
  height?: number;
  createdAt?: string;
}
export interface FileManagerOptions {
  list: (query: {
    search?: string;
    signal: AbortSignal;
  }) => Promise<FileAsset[]>;
  delete?: (
    asset: FileAsset,
    context: { signal: AbortSignal },
  ) => Promise<void>;
}
export interface ImageOptions {
  upload?: (
    file: File,
    context: ImageUploadContext,
  ) => Promise<string | { url: string }>;
  maxFileSize?: number;
  acceptedTypes?: string[];
  allowBase64?: boolean;
  onError?: (error: unknown) => void;
  fileManager?: FileManagerOptions;
}
export interface EditorUpdate {
  editor: SHEditorAPI;
  transaction: Transaction;
}
export interface SHEditorOptions {
  element?: HTMLElement;
  content?: Content;
  editable?: boolean;
  locale?: Locale;
  direction?: Direction;
  placeholder?: string;
  extensions?: Extension[];
  sanitizer?: SanitizerOptions;
  typography?: TypographyOptions;
  image?: ImageOptions;
  onUpdate?: (event: EditorUpdate) => void;
  onFocus?: (editor: SHEditorAPI) => void;
  onBlur?: (editor: SHEditorAPI) => void;
}
export interface TypographyOptions {
  fontFamilies?: string[];
  fontManager?: FontManagerOptions;
  acceptedFontTypes?: string[];
  maxFontFileSize?: number;
  onFontError?: (error: unknown) => void;
  fontSizes?: string[];
  colors?: string[];
  highlights?: string[];
}
export interface FontAsset {
  id: string;
  name: string;
  family: string;
  url: string;
  format?: "woff2" | "woff" | "truetype" | "opentype";
  weight?: string;
  style?: "normal" | "italic" | "oblique";
}
export interface FontManagerOptions {
  list: (context: { signal: AbortSignal }) => Promise<FontAsset[]>;
  upload: (file: File, context: { signal: AbortSignal }) => Promise<FontAsset>;
  delete?: (font: FontAsset, context: { signal: AbortSignal }) => Promise<void>;
}
export interface SanitizerOptions {
  allowedTags?: string[];
  allowedAttributes?: Record<string, string[]>;
  allowedSchemes?: string[];
}
export interface ExtensionContext {
  schema: Schema;
}
export interface Extension {
  name: string;
  plugins?: (context: ExtensionContext) => import("prosemirror-state").Plugin[];
}
export interface Chain {
  focus(): Chain;
  toggleBold(): Chain;
  toggleItalic(): Chain;
  toggleUnderline(): Chain;
  toggleStrike(): Chain;
  undo(): Chain;
  redo(): Chain;
  run(): boolean;
}
export interface EditorCommands {
  focus(): boolean;
  blur(): boolean;
  toggleBold(): boolean;
  toggleItalic(): boolean;
  toggleUnderline(): boolean;
  toggleStrike(): boolean;
  toggleCode(): boolean;
  setParagraph(): boolean;
  setHeading(level: number): boolean;
  toggleSubscript(): boolean;
  toggleSuperscript(): boolean;
  setTextColor(color: string): boolean;
  unsetTextColor(): boolean;
  setHighlight(color: string): boolean;
  unsetHighlight(): boolean;
  setFontFamily(family: string): boolean;
  setFontSize(size: string): boolean;
  setTextAlign(alignment: "left" | "center" | "right" | "justify"): boolean;
  unsetTextAlign(): boolean;
  toggleBulletList(): boolean;
  toggleOrderedList(): boolean;
  toggleBlockquote(): boolean;
  setLink(href: string, title?: string): boolean;
  unsetLink(): boolean;
  insertHorizontalRule(): boolean;
  undo(): boolean;
  redo(): boolean;
  clearFormatting(): boolean;
  insertImage(attrs: {
    src: string;
    alt?: string;
    title?: string;
    width?: number;
    align?: "left" | "center" | "right";
    wrap?: ImageWrap;
  }): boolean;
  updateImage(attrs: {
    alt?: string;
    title?: string;
    width?: number;
    align?: "left" | "center" | "right";
    wrap?: ImageWrap;
  }): boolean;
  insertTable(rows?: number, cols?: number, withHeaderRow?: boolean): boolean;
  addRowBefore(): boolean;
  addRowAfter(): boolean;
  deleteRow(): boolean;
  addColumnBefore(): boolean;
  addColumnAfter(): boolean;
  deleteColumn(): boolean;
  deleteTable(): boolean;
  mergeCells(): boolean;
  splitCell(): boolean;
  toggleHeaderRow(): boolean;
  toggleHeaderColumn(): boolean;
}
export interface SHEditorAPI {
  readonly commands: EditorCommands;
  readonly state: EditorState;
  readonly view: EditorView | null;
  readonly schema: Schema;
  getHTML(): string;
  getJSON(): Record<string, unknown>;
  getText(): string;
  setContent(content: Content, emitUpdate?: boolean): void;
  setEditable(editable: boolean): void;
  setLocale(locale: Locale): void;
  registerFontFamily(family: string): void;
  isActive(name: string, attrs?: Record<string, unknown>): boolean;
  can(command: keyof EditorCommands): boolean;
  chain(): Chain;
  focus(): void;
  blur(): void;
  destroy(): void;
  insertImageFile(
    file: File,
    mode?: Exclude<ImageInsertMode, "url">,
    attrs?: {
      alt?: string;
      title?: string;
      align?: "left" | "center" | "right";
      wrap?: ImageWrap;
    },
  ): Promise<boolean>;
  on(
    event: "update" | "focus" | "blur",
    callback: (...args: never[]) => void,
  ): () => void;
}
export interface ParsedContent {
  doc: PMNode;
}
