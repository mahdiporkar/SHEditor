import type { Node as PMNode, Schema } from 'prosemirror-model';
import type { EditorState, Transaction } from 'prosemirror-state';
import type { EditorView } from 'prosemirror-view';

export type Locale = 'en' | 'fa' | 'ar';
export type Direction = 'ltr' | 'rtl' | 'auto';
export type Content = string | Record<string, unknown>;
export interface EditorUpdate { editor: SHEditorAPI; transaction: Transaction }
export interface SHEditorOptions {
  element?: HTMLElement;
  content?: Content;
  editable?: boolean;
  locale?: Locale;
  direction?: Direction;
  placeholder?: string;
  extensions?: Extension[];
  sanitizer?: SanitizerOptions;
  onUpdate?: (event: EditorUpdate) => void;
  onFocus?: (editor: SHEditorAPI) => void;
  onBlur?: (editor: SHEditorAPI) => void;
}
export interface SanitizerOptions { allowedTags?: string[]; allowedAttributes?: Record<string, string[]>; allowedSchemes?: string[] }
export interface ExtensionContext { schema: Schema }
export interface Extension { name: string; plugins?: (context: ExtensionContext) => import('prosemirror-state').Plugin[] }
export interface Chain { focus(): Chain; toggleBold(): Chain; toggleItalic(): Chain; toggleUnderline(): Chain; toggleStrike(): Chain; undo(): Chain; redo(): Chain; run(): boolean }
export interface EditorCommands {
  focus(): boolean; blur(): boolean; toggleBold(): boolean; toggleItalic(): boolean; toggleUnderline(): boolean;
  toggleStrike(): boolean; toggleCode(): boolean; setParagraph(): boolean; setHeading(level: number): boolean;
  toggleBulletList(): boolean; toggleOrderedList(): boolean; toggleBlockquote(): boolean; setLink(href: string, title?: string): boolean;
  unsetLink(): boolean; insertHorizontalRule(): boolean; undo(): boolean; redo(): boolean; clearFormatting(): boolean;
}
export interface SHEditorAPI {
  readonly commands: EditorCommands; readonly state: EditorState; readonly view: EditorView | null; readonly schema: Schema;
  getHTML(): string; getJSON(): Record<string, unknown>; getText(): string; setContent(content: Content, emitUpdate?: boolean): void;
  setEditable(editable: boolean): void; setLocale(locale: Locale): void; isActive(name: string, attrs?: Record<string, unknown>): boolean;
  can(command: keyof EditorCommands): boolean; chain(): Chain; focus(): void; blur(): void; destroy(): void;
  on(event: 'update' | 'focus' | 'blur', callback: (...args: never[]) => void): () => void;
}
export interface ParsedContent { doc: PMNode }
