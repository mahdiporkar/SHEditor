import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import type { SHEditorAPI as Editor, SHEditorOptions } from '@sheditor/core';
import { createEditorUI } from '@sheditor/ui';
export interface SHEditorProps extends Omit<SHEditorOptions,'element'|'content'|'onUpdate'> { value?: string; defaultValue?: string; onChange?: (html:string,editor:Editor)=>void; className?:string }
export interface SHEditorRef { editor: Editor | null; focus(): void; getHTML(): string }
export const SHEditor = forwardRef<SHEditorRef,SHEditorProps>(function SHEditor({value,defaultValue,onChange,className,...options},ref){
  const host=useRef<HTMLDivElement>(null); const editor=useRef<Editor|null>(null); const change=useRef(onChange); change.current=onChange;
  useEffect(()=>{ if(!host.current)return; const ui=createEditorUI(host.current,{...options,content:value??defaultValue??'',onUpdate:({editor:e})=>change.current?.(e.getHTML(),e)}); editor.current=ui.editor; return()=>{ui.destroy();editor.current=null}; },[]);
  useEffect(()=>{if(value!==undefined&&editor.current&&editor.current.getHTML()!==value)editor.current.setContent(value,false)},[value]);
  useImperativeHandle(ref,()=>({get editor(){return editor.current},focus:()=>editor.current?.focus(),getHTML:()=>editor.current?.getHTML()??''}),[]);
  return <div ref={host} className={className} />;
});
export type { Editor };
