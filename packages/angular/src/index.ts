import { Component, ElementRef, EventEmitter, forwardRef, Input, Output, ViewChild } from '@angular/core';
import type { AfterViewInit, OnDestroy } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import type { ControlValueAccessor } from '@angular/forms';
import { createEditorUI } from '@sheditor/ui';
import type { Locale, SHEditorAPI as Editor } from '@sheditor/core';
@Component({selector:'she-editor',standalone:true,template:'<div #host></div>',providers:[{provide:NG_VALUE_ACCESSOR,useExisting:forwardRef(()=>SHEditorComponent),multi:true}]})
export class SHEditorComponent implements AfterViewInit,OnDestroy,ControlValueAccessor {
  @ViewChild('host',{static:true}) host!:ElementRef<HTMLElement>; @Input() locale:Locale='en'; @Input() placeholder=''; @Output() readonly ready=new EventEmitter<Editor>();
  editor:Editor|null=null; private pending=''; private cleanup=()=>{}; private change:(value:string)=>void=()=>{}; private touch:()=>void=()=>{};
  ngAfterViewInit():void{const ui=createEditorUI(this.host.nativeElement,{content:this.pending,locale:this.locale,placeholder:this.placeholder,onUpdate:({editor})=>this.change(editor.getHTML()),onBlur:()=>this.touch()});this.editor=ui.editor;this.cleanup=ui.destroy;this.ready.emit(ui.editor)}
  writeValue(value:string|null):void{this.pending=value??'';if(this.editor&&this.editor.getHTML()!==this.pending)this.editor.setContent(this.pending,false)}
  registerOnChange(fn:(value:string)=>void):void{this.change=fn} registerOnTouched(fn:()=>void):void{this.touch=fn} setDisabledState(disabled:boolean):void{this.editor?.setEditable(!disabled)} ngOnDestroy():void{this.cleanup()}
}
