import type { SanitizerOptions } from './types';

const SAFE_TAGS = ['P','BR','H1','H2','H3','H4','H5','H6','BLOCKQUOTE','PRE','CODE','STRONG','B','EM','I','U','S','DEL','SUB','SUP','SPAN','MARK','A','UL','OL','LI','HR'];
const SAFE_ATTRS: Record<string, string[]> = { A: ['href','title','target','rel'], P: ['style'], H1: ['style'], H2: ['style'], H3: ['style'], H4: ['style'], H5: ['style'], H6: ['style'], SPAN: ['style'], MARK: ['style'] };
const SAFE_SCHEMES = ['http:', 'https:', 'mailto:', 'tel:'];
const SAFE_STYLE = /^(?:(?:color|background-color):\s*(?:#[0-9a-f]{3,8}|rgba?\([\d\s,.%]+\)|[a-z]+)|font-family:\s*[\w\s,'"-]+|font-size:\s*(?:\d+(?:\.\d+)?(?:px|rem|em|%)|small|medium|large)|text-align:\s*(?:left|center|right|justify))$/i;

export function sanitizeHTML(input: string, options: SanitizerOptions = {}): string {
  if (typeof document === 'undefined') return input.replace(/<script[\s\S]*?<\/script>/gi, '');
  const template = document.createElement('template');
  template.innerHTML = input;
  const tags = new Set([...SAFE_TAGS, ...(options.allowedTags ?? []).map(tag => tag.toUpperCase())]);
  const schemes = new Set([...SAFE_SCHEMES, ...(options.allowedSchemes ?? [])]);
  const visit = (root: ParentNode): void => {
    for (const child of [...root.children]) {
      if (!tags.has(child.tagName)) { child.replaceWith(...child.childNodes); continue; }
      const allowed = new Set([...(SAFE_ATTRS[child.tagName] ?? []), ...(options.allowedAttributes?.[child.tagName.toLowerCase()] ?? [])]);
      for (const attr of [...child.attributes]) if (!allowed.has(attr.name.toLowerCase()) || attr.name.toLowerCase().startsWith('on')) child.removeAttribute(attr.name);
      if (child.hasAttribute('style')) { const declarations=(child.getAttribute('style')??'').split(';').map(value=>value.trim()).filter(Boolean); const safe=declarations.filter(value=>SAFE_STYLE.test(value)); if(safe.length) child.setAttribute('style',safe.join('; ')); else child.removeAttribute('style'); }
      if (child.tagName === 'A' && child.hasAttribute('href')) {
        const href = child.getAttribute('href') ?? '';
        try { const url = new URL(href, 'https://sheditor.local'); if (!schemes.has(url.protocol) && !href.startsWith('/') && !href.startsWith('#')) child.removeAttribute('href'); } catch { child.removeAttribute('href'); }
        child.setAttribute('rel', 'noopener noreferrer');
      }
      visit(child);
    }
  };
  visit(template.content);
  return template.innerHTML;
}
