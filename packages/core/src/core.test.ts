import { describe,expect,it,vi } from 'vitest';
import { createEditor, PluginError, sanitizeHTML } from './index';
describe('SHEditor core',()=>{
  it('parses and serializes semantic HTML',()=>{const editor=createEditor({content:'<h2>Hello <strong>world</strong></h2><p>Text</p>'});expect(editor.getHTML()).toBe('<h2>Hello <strong>world</strong></h2><p>Text</p>');expect(editor.getJSON().type).toBe('doc')});
  it('updates content without a DOM view',()=>{const editor=createEditor();editor.setContent('<p>سلام دنیا</p>');expect(editor.getText()).toBe('سلام دنیا')});
  it('rejects duplicate extensions',()=>expect(()=>createEditor({extensions:[{name:'same'},{name:'same'}]})).toThrow(PluginError));
  it('supports readonly and locale changes',()=>{const element=document.createElement('div');const editor=createEditor({element,locale:'fa',editable:false});expect(element.dir).toBe('rtl');editor.setEditable(true);editor.setLocale('en');expect(editor.view?.dom.getAttribute('dir')).toBe('ltr');editor.destroy()});
  it('emits updates and destroys safely',()=>{const update=vi.fn();const element=document.createElement('div');const editor=createEditor({element,onUpdate:update});editor.setContent('<p>changed</p>');expect(update).toHaveBeenCalledOnce();editor.destroy();expect(editor.view).toBeNull()});
});
describe('security',()=>{
  it.each([
    ['<img src=x onerror=alert(1)>',''],['<script>alert(1)</script>','alert(1)'],['<a href="javascript:alert(1)">x</a>','<a rel="noopener noreferrer">x</a>'],['<iframe src="https://evil.test"></iframe>','']
  ])('sanitizes %s',(unsafe,safe)=>expect(sanitizeHTML(unsafe)).toBe(safe));
  it('keeps safe links',()=>expect(sanitizeHTML('<a href="https://example.com">x</a>')).toContain('href="https://example.com"'));
});
