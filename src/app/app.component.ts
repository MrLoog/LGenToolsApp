import {
  Injectable,
  Injector,
  ComponentFactoryResolver,
  EmbeddedViewRef,
  ApplicationRef,
  Component,
  ViewContainerRef,
  ComponentRef,
  ComponentFactory,
  OnInit,
  ViewChild,
  Inject,
   AfterViewInit,
    ElementRef
} from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { IpcRenderer } from 'electron';

import {selectFile} from "../gentools";
import { TemplateRegionComponent } from './template-region/template-region.component';
import { DynCompServiceService } from './dyn-comp-service.service'
import { TemplateOutputAreaComponent } from './template-output-area/template-output-area.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent implements OnInit {
  title = 'LGenToolsApp';
  templateFactory:any;
  arr:any[];
  componentRef: any;
  service:any;
  private ipc: IpcRenderer;
  
  @ViewChild('dynamic', { 
    read: ViewContainerRef 
  }) viewContainerRef: ViewContainerRef

  constructor(
    @Inject(DynCompServiceService) service,@Inject(DOCUMENT) private document, private elementRef: ElementRef){
    this.service=service;
    if ((<any>window).require) {
      try {
        this.ipc = (<any>window).require('electron').ipcRenderer;
      } catch (e) {
        throw e;
      }
    } else {
      console.warn('App not running inside Electron!');
    }
  }


  ngOnInit() {
  }

  ngAfterViewInit() {
    const s = this.document.createElement('script');
    s.type = 'text/javascript';
    //s.src = '//external.script.com/script.js';
    const __this = this; //to store the current instance to call 
                         //afterScriptAdded function on onload event of 
                         //script.
// tslint:disable-next-line: max-line-length
    s.text = ' window.q$=window.$ = window.jQuery = require("../../../../../../node_modules/jquery/dist/jquery.min.js");require("../../../../../../node_modules/bootstrap/dist/js/bootstrap.js");require("../../../../../../node_modules/bootstrap/js/dist/popover.js");q$("[data-toggle=\'popover\']").popover(); ';
    s.onload = function () { __this.afterScriptAdded(); };
    this.elementRef.nativeElement.appendChild(s);
  }

  afterScriptAdded() {
    const params= {
      width: '350px',
      height: '420px',
    };
    if (typeof (window['functionFromExternalScript']) === 'function') {
      window['functionFromExternalScript'](params);
    }
  }

  onSelectBtnClick():void {
    //this.ipc.send("openModal");
    console.log('modal');
    this.arr=[];
    selectFile(this.arr,this);
    var self=this;
    setTimeout(() => {
      
      self.templateFactory=self.arr[0];
      // self.templateFactory.setFactoryUI(this);
      // console.log(self.templateFactory);
    }, 3000);
  }

  onSelectTemplate(templateName):void{
    // console.log('click call');
    // if(templateName=='') return;
    // this.templateFactory.templateMap[templateName].createUI();
  }

  onSelect(templateName):void{
    if(templateName=='') return;
    this.templateFactory.templateMap[templateName].createUI();
  }

  onClickTest():void{
    // this.templateFactory=this.arr[0];
    // this.templateFactory.setFactoryUI(this);
    //this.templateFactory=this.arr[0];
    //console.log(this.templateFactory);
  }

  onClickTest2():void{
    //this.addDynamicComponent();
  }


  addDynamicComponent():void {
    this.service.setRootViewContainerRef(this.viewContainerRef)
                this.service.addDynamicComponent('txtTest','Test')
  }

  buildUIControl(model,modelParent):any{
      return this.service.createAndAddComponentForModel(model,modelParent);
  }

}
