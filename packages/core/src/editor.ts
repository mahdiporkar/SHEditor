import { DOMParser as PMDOMParser, DOMSerializer } from 'prosemirror-model';
import { EditorState, TextSelection, type Command, type Plugin } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import { baseKeymap, chainCommands, createParagraphNear, liftEmptyBlock, newlineInCode, setBlockType, splitBlock, toggleMark, wrapIn } from 'prosemirror-commands';
import { history, redo, undo } from 'prosemirror-history';
import { keymap } from 'prosemirror-keymap';
import { liftListItem, sinkListItem, splitListItem, wrapInList } from 'prosemirror-schema-list';
import { PluginError, ParseError, SHEditorError } from './errors';
import { schema } from './schema';
import { sanitizeHTML } from './sanitize';
import type { Chain, Content, EditorCommands, Extension, Locale, SHEditorAPI, SHEditorOptions } from './types';

type EventName = 'update' | 'focus' | 'blur';
export class SHEditor implements SHEditorAPI {
  readonly schema = schema;
  view: EditorView | null = null;
  private currentState: EditorState;
  private options: SHEditorOptions;
  private editable: boolean;
  private listeners = new Map<EventName, Set<(...args: never[]) => void>>();
  readonly commands: EditorCommands;

  constructor(options: SHEditorOptions = {}) {
    this.options = options; this.editable = options.editable ?? true;
    const doc = this.parse(options.content ?? '<p></p>');
    const extensions = options.extensions ?? [];
    const names = new Set<string>();
    const extensionPlugins: Plugin[] = [];
    for (const extension of extensions) {
      if (names.has(extension.name)) throw new PluginError(`SHEditor: duplicate extension name “${extension.name}”.`);
      names.add(extension.name); extensionPlugins.push(...(extension.plugins?.({ schema }) ?? []));
    }
    const keys = { ...baseKeymap, 'Mod-z': undo, 'Mod-y': redo, 'Mod-Shift-z': redo, 'Mod-b': toggleMark(schema.marks.bold!), 'Mod-i': toggleMark(schema.marks.italic!), 'Mod-u': toggleMark(schema.marks.underline!), Enter: chainCommands(splitListItem(schema.nodes.list_item!), newlineInCode, createParagraphNear, liftEmptyBlock, splitBlock), Tab: sinkListItem(schema.nodes.list_item!), 'Shift-Tab': liftListItem(schema.nodes.list_item!) };
    this.currentState = EditorState.create({ doc, plugins: [history(), keymap(keys), ...extensionPlugins] });
    this.commands = this.makeCommands();
    if (options.element) this.mount(options.element);
  }
  get state(): EditorState { return this.view?.state ?? this.currentState; }
  private parse(content: Content) {
    try {
      if (typeof content !== 'string') return schema.nodeFromJSON(content);
      const wrap = document.createElement('div'); wrap.innerHTML = sanitizeHTML(content, this.options?.sanitizer);
      return PMDOMParser.fromSchema(schema).parse(wrap);
    } catch (cause) { throw new ParseError(`SHEditor: content could not be parsed. ${cause instanceof Error ? cause.message : ''}`); }
  }
  private mount(element: HTMLElement): void {
    element.classList.add('she-content'); element.dataset.locale = this.options.locale ?? 'en';
    element.dir = this.options.direction ?? ((this.options.locale === 'fa' || this.options.locale === 'ar') ? 'rtl' : 'ltr');
    element.setAttribute('aria-label', this.options.placeholder ?? 'Rich text editor');
    this.view = new EditorView(element, { state: this.currentState, editable: () => this.editable,
      dispatchTransaction: transaction => { const next = this.view!.state.apply(transaction); this.view!.updateState(next); this.currentState = next; if (transaction.docChanged) { this.options.onUpdate?.({ editor: this, transaction }); this.emit('update'); } },
      handleDOMEvents: { focus: () => { this.options.onFocus?.(this); this.emit('focus'); return false; }, blur: () => { this.options.onBlur?.(this); this.emit('blur'); return false; } },
      attributes: { class: 'she-prosemirror', 'data-placeholder': this.options.placeholder ?? '' },
    });
  }
  private run(command: Command): boolean { if (!this.view) return command(this.state); return command(this.view.state, this.view.dispatch, this.view); }
  private makeCommands(): EditorCommands {
    const mark = (name: string) => this.run(toggleMark(schema.marks[name]!));
    const setMark = (name: string, attrs: Record<string, unknown>) => this.run((state, dispatch) => { const value=schema.marks[name]!.create(attrs); dispatch?.(state.selection.empty?state.tr.addStoredMark(value):state.tr.addMark(state.selection.from,state.selection.to,value)); return true; });
    const unsetMark = (name: string) => this.run((state, dispatch) => { dispatch?.(state.selection.empty?state.tr.removeStoredMark(schema.marks[name]!):state.tr.removeMark(state.selection.from,state.selection.to,schema.marks[name])); return true; });
    const allowed = (value: string, values: string[] | undefined, label: string, pattern: RegExp) => { if (!pattern.test(value)) throw new SHEditorError(`SHEditor: unsafe ${label} value.`); if (values?.length && !values.includes(value)) throw new SHEditorError(`SHEditor: ${label} “${value}” is not in the configured allowlist.`); return value; };
    const textAlign = (alignment: 'left'|'center'|'right'|'justify'|null) => this.run((state, dispatch) => { let tr=state.tr; const { from, to }=state.selection; state.doc.nodesBetween(from,to,(node,pos)=>{ if(node.isTextblock && (node.type===schema.nodes.paragraph || node.type===schema.nodes.heading)) tr=tr.setNodeMarkup(pos,undefined,{...node.attrs,textAlign:alignment}); }); dispatch?.(tr); return tr.docChanged; });
    return {
      focus: () => { this.focus(); return true; }, blur: () => { this.blur(); return true; },
      toggleBold: () => mark('bold'), toggleItalic: () => mark('italic'), toggleUnderline: () => mark('underline'), toggleStrike: () => mark('strike'), toggleCode: () => mark('code'),
      toggleSubscript: () => mark('subscript'), toggleSuperscript: () => mark('superscript'),
      setTextColor: color => setMark('text_color',{color:allowed(color,this.options.typography?.colors,'text color',/^(?:#[0-9a-f]{3,8}|rgba?\([\d\s,.%]+\)|[a-z]+)$/i)}), unsetTextColor: () => unsetMark('text_color'),
      setHighlight: color => setMark('highlight',{color:allowed(color,this.options.typography?.highlights,'highlight',/^(?:#[0-9a-f]{3,8}|rgba?\([\d\s,.%]+\)|[a-z]+)$/i)}), unsetHighlight: () => unsetMark('highlight'),
      setFontFamily: family => setMark('font_family',{family:allowed(family,this.options.typography?.fontFamilies,'font family',/^[\w\s,'"-]+$/)}), setFontSize: size => setMark('font_size',{size:allowed(size,this.options.typography?.fontSizes,'font size',/^(?:\d+(?:\.\d+)?(?:px|rem|em|%)|small|medium|large)$/i)}),
      setTextAlign: alignment => textAlign(alignment), unsetTextAlign: () => textAlign(null),
      setParagraph: () => this.run(setBlockType(schema.nodes.paragraph!)), setHeading: level => this.run(setBlockType(schema.nodes.heading!, { level })),
      toggleBulletList: () => this.run(wrapInList(schema.nodes.bullet_list!)), toggleOrderedList: () => this.run(wrapInList(schema.nodes.ordered_list!)), toggleBlockquote: () => this.run(wrapIn(schema.nodes.blockquote!)),
      setLink: (href, title) => { if (!/^https?:|^mailto:|^tel:|^\/|^#/i.test(href)) throw new SHEditorError('SHEditor: unsafe link URL.'); return this.run(toggleMark(schema.marks.link!, { href, title: title ?? null })); },
      unsetLink: () => this.run((state, dispatch) => { dispatch?.(state.tr.removeMark(state.selection.from, state.selection.to, schema.marks.link)); return true; }),
      insertHorizontalRule: () => this.run((state, dispatch) => { dispatch?.(state.tr.replaceSelectionWith(schema.nodes.horizontal_rule!.create()).scrollIntoView()); return true; }),
      undo: () => this.run(undo), redo: () => this.run(redo),
      clearFormatting: () => this.run((state, dispatch) => { const { from, to } = state.selection; let tr = state.tr.removeMark(from, to); const para = schema.nodes.paragraph!; state.doc.nodesBetween(from, to, (node, pos) => { if (node.isTextblock && node.type !== para) tr = tr.setNodeMarkup(pos, para); }); dispatch?.(tr); return true; }),
    };
  }
  getHTML(): string { const wrap = document.createElement('div'); wrap.appendChild(DOMSerializer.fromSchema(schema).serializeFragment(this.state.doc.content)); return wrap.innerHTML; }
  getJSON(): Record<string, unknown> { return this.state.doc.toJSON() as Record<string, unknown>; }
  getText(): string { return this.state.doc.textBetween(0, this.state.doc.content.size, '\n'); }
  setContent(content: Content, emitUpdate = true): void { const doc = this.parse(content); const tr = this.state.tr.replaceWith(0, this.state.doc.content.size, doc.content); tr.setSelection(TextSelection.atStart(tr.doc)); if (this.view) this.view.dispatch(tr); else this.currentState = this.state.apply(tr); if (emitUpdate && !this.view) this.emit('update'); }
  setEditable(editable: boolean): void { this.editable = editable; this.view?.setProps({ editable: () => editable }); }
  setLocale(locale: Locale): void { this.options = { ...this.options, locale }; if (this.view) { this.view.dom.closest<HTMLElement>('.she-content')?.setAttribute('data-locale', locale); this.view.dom.setAttribute('dir', locale === 'en' ? 'ltr' : 'rtl'); } }
  isActive(name: string, attrs: Record<string, unknown> = {}): boolean { const { from, to, empty } = this.state.selection; const mark = schema.marks[name]; if (mark) return empty ? Boolean(mark.isInSet(this.state.storedMarks ?? this.state.selection.$from.marks())) : this.state.doc.rangeHasMark(from, to, mark); const node = schema.nodes[name]; return Boolean(node && this.state.selection.$from.parent.type === node && Object.entries(attrs).every(([k,v]) => this.state.selection.$from.parent.attrs[k] === v)); }
  can(command: keyof EditorCommands): boolean { const fn = this.commands[command]; return typeof fn === 'function'; }
  chain(): Chain { const tasks: Array<() => boolean> = []; const api: Chain = { focus: () => (tasks.push(() => this.commands.focus()), api), toggleBold: () => (tasks.push(() => this.commands.toggleBold()), api), toggleItalic: () => (tasks.push(() => this.commands.toggleItalic()), api), toggleUnderline: () => (tasks.push(() => this.commands.toggleUnderline()), api), toggleStrike: () => (tasks.push(() => this.commands.toggleStrike()), api), undo: () => (tasks.push(() => this.commands.undo()), api), redo: () => (tasks.push(() => this.commands.redo()), api), run: () => tasks.every(task => task()) }; return api; }
  focus(): void { this.view?.focus(); }
  blur(): void { (this.view?.dom as HTMLElement | undefined)?.blur(); }
  on(event: EventName, callback: (...args: never[]) => void): () => void { const group = this.listeners.get(event) ?? new Set(); group.add(callback); this.listeners.set(event, group); return () => group.delete(callback); }
  private emit(event: EventName): void { for (const callback of this.listeners.get(event) ?? []) callback(); }
  destroy(): void { this.view?.destroy(); this.view = null; this.listeners.clear(); }
}
export function createEditor(options: SHEditorOptions = {}): SHEditor { return new SHEditor(options); }
export function defineExtension(extension: Extension): Extension { return extension; }
