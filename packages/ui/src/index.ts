import { createEditor, dictionaries, type Locale, type SHEditor, type SHEditorOptions, type TranslationKey } from '@sheditor/core';

export interface EditorUI { editor: SHEditor; element: HTMLElement; destroy(): void }
type Tool = { key: TranslationKey; icon: string; command: (editor: SHEditor) => boolean; active?: string };
const tools: Tool[] = [
  { key:'undo', icon:'↶', command:e=>e.commands.undo() }, { key:'redo', icon:'↷', command:e=>e.commands.redo() },
  { key:'bold', icon:'B', command:e=>e.commands.toggleBold(), active:'bold' }, { key:'italic', icon:'I', command:e=>e.commands.toggleItalic(), active:'italic' },
  { key:'underline', icon:'U', command:e=>e.commands.toggleUnderline(), active:'underline' }, { key:'strike', icon:'S', command:e=>e.commands.toggleStrike(), active:'strike' },
  { key:'subscript', icon:'X₂', command:e=>e.commands.toggleSubscript(), active:'subscript' }, { key:'superscript', icon:'X²', command:e=>e.commands.toggleSuperscript(), active:'superscript' },
  { key:'bulletList', icon:'•≡', command:e=>e.commands.toggleBulletList() }, { key:'orderedList', icon:'1≡', command:e=>e.commands.toggleOrderedList() },
  { key:'blockquote', icon:'❝', command:e=>e.commands.toggleBlockquote() }, { key:'clear', icon:'Tx', command:e=>e.commands.clearFormatting() },
];
export function createEditorUI(host: HTMLElement, options: SHEditorOptions = {}): EditorUI {
  const locale = options.locale ?? 'en'; const t = (key: TranslationKey) => dictionaries[locale][key];
  host.classList.add('she-editor'); host.dir = options.direction ?? (locale === 'en' ? 'ltr' : 'rtl');
  const toolbar = document.createElement('div'); toolbar.className = 'she-toolbar'; toolbar.setAttribute('role','toolbar'); toolbar.setAttribute('aria-label','Formatting');
  const surface = document.createElement('div'); surface.className = 'she-surface'; host.append(toolbar, surface);
  const editor = createEditor({ ...options, element: surface });
  const update = () => toolbar.querySelectorAll<HTMLButtonElement>('button[data-active]').forEach(button => { button.setAttribute('aria-pressed', String(editor.isActive(button.dataset.active!))); });
  for (const tool of tools) { const button = document.createElement('button'); button.type='button'; button.className='she-button'; button.title=t(tool.key); button.setAttribute('aria-label',t(tool.key)); if (tool.active) { button.dataset.active=tool.active; button.setAttribute('aria-pressed','false'); } button.textContent=tool.icon; button.addEventListener('mousedown',event=>event.preventDefault()); button.addEventListener('click',()=>{ tool.command(editor); editor.focus(); update(); }); toolbar.append(button); }
  const select = document.createElement('select'); select.className='she-select'; select.setAttribute('aria-label',t('heading')); select.innerHTML=`<option value="paragraph">${t('paragraph')}</option>${[1,2,3].map(n=>`<option value="${n}">${t('heading')} ${n}</option>`).join('')}`; select.addEventListener('change',()=>{ if(select.value==='paragraph') editor.commands.setParagraph(); else editor.commands.setHeading(Number(select.value)); editor.focus(); }); toolbar.insertBefore(select, toolbar.children[2] ?? null);
  const alignment=document.createElement('select');alignment.className='she-select she-align';alignment.setAttribute('aria-label',t('alignment'));alignment.innerHTML='<option value="">↔</option><option value="left">⇤ Left</option><option value="center">↔ Center</option><option value="right">⇥ Right</option><option value="justify">☰ Justify</option>';alignment.addEventListener('change',()=>{const value=alignment.value;if(value)editor.commands.setTextAlign(value as 'left'|'center'|'right'|'justify');else editor.commands.unsetTextAlign();editor.focus()});toolbar.append(alignment);
  const color=document.createElement('input');color.type='color';color.className='she-color';color.value='#6750f2';color.setAttribute('aria-label',t('textColor'));color.title=t('textColor');color.addEventListener('change',()=>{editor.commands.setTextColor(color.value);editor.focus()});toolbar.append(color);
  const highlight=document.createElement('input');highlight.type='color';highlight.className='she-color she-highlight';highlight.value='#fff2a8';highlight.setAttribute('aria-label',t('highlight'));highlight.title=t('highlight');highlight.addEventListener('change',()=>{editor.commands.setHighlight(highlight.value);editor.focus()});toolbar.append(highlight);
  const off=editor.on('update',update); return { editor, element:host, destroy:()=>{ off(); editor.destroy(); host.replaceChildren(); host.classList.remove('she-editor'); } };
}
export function setUILocale(ui: EditorUI, locale: Locale): void { ui.editor.setLocale(locale); }
