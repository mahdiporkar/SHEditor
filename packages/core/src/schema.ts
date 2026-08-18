import { Schema, type MarkSpec, type NodeSpec } from 'prosemirror-model';
import { addListNodes } from 'prosemirror-schema-list';
import OrderedMap from 'orderedmap';

const baseNodes: Record<string, NodeSpec> = {
  doc: { content: 'block+' },
  paragraph: { content: 'inline*', group: 'block', parseDOM: [{ tag: 'p' }], toDOM: () => ['p', 0] },
  text: { group: 'inline' },
  hard_break: { inline: true, group: 'inline', selectable: false, parseDOM: [{ tag: 'br' }], toDOM: () => ['br'] },
  heading: { attrs: { level: { default: 1 } }, content: 'inline*', group: 'block', defining: true, parseDOM: [1,2,3,4,5,6].map(level => ({ tag: `h${level}`, attrs: { level } })), toDOM: node => [`h${String(node.attrs.level)}`, 0] as const },
  blockquote: { content: 'block+', group: 'block', defining: true, parseDOM: [{ tag: 'blockquote' }], toDOM: () => ['blockquote', 0] },
  code_block: { content: 'text*', marks: '', group: 'block', code: true, defining: true, parseDOM: [{ tag: 'pre', preserveWhitespace: 'full' }], toDOM: () => ['pre', ['code', 0]] },
  horizontal_rule: { group: 'block', parseDOM: [{ tag: 'hr' }], toDOM: () => ['hr'] },
};
const nodes = addListNodes(OrderedMap.from(baseNodes), 'paragraph block*', 'block');

const marks: Record<string, MarkSpec> = {
  bold: { parseDOM: [{ tag: 'strong' }, { tag: 'b' }, { style: 'font-weight=bold' }], toDOM: () => ['strong', 0] },
  italic: { parseDOM: [{ tag: 'em' }, { tag: 'i' }, { style: 'font-style=italic' }], toDOM: () => ['em', 0] },
  underline: { parseDOM: [{ tag: 'u' }, { style: 'text-decoration=underline' }], toDOM: () => ['u', 0] },
  strike: { parseDOM: [{ tag: 's' }, { tag: 'del' }, { style: 'text-decoration=line-through' }], toDOM: () => ['s', 0] },
  code: { parseDOM: [{ tag: 'code' }], toDOM: () => ['code', 0] },
  link: { attrs: { href: {}, title: { default: null } }, inclusive: false, parseDOM: [{ tag: 'a[href]', getAttrs: (dom: HTMLElement | string) => typeof dom === 'string' ? false : ({ href: dom.getAttribute('href'), title: dom.getAttribute('title') }) }], toDOM: node => ['a', { href: node.attrs.href, title: node.attrs.title, rel: 'noopener noreferrer' }, 0] },
};
export const schema = new Schema({ nodes, marks });
