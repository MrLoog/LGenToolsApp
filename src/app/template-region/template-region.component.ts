import { Component,
  OnInit,
  ViewChild,
  ViewContainerRef,
  Inject,
   AfterViewInit,
    ElementRef,
    ChangeDetectionStrategy
} from '@angular/core';

import { DOCUMENT } from '@angular/common';

import { AdDirective } from '../ad.directive';
import { AreaResultService } from '../area-result.service';
import { IpcServiceService } from '../ipc-service.service';
import { IpcRenderer } from 'electron';

@Component({
  selector: 'app-template-region',
  templateUrl: './template-region.component.html',
  styleUrls: ['./template-region.component.css']
})


export class TemplateRegionComponent implements OnInit, AfterViewInit {
  GTModel:any;
  items = [{name: 'one', age: 30 },{ name: 'two', age: 27 },{ name: 'three', age: 50 }];
  selectedName='';
  testArr=['1','2','3'];
  private ipc: IpcRenderer;

  txtTest2='test2';
  @ViewChild(AdDirective) adHost: AdDirective;

  @ViewChild('dynamic', { 
    read: ViewContainerRef 
  }) viewContainerRef: ViewContainerRef


  constructor(private areaResultService:AreaResultService,@Inject(DOCUMENT) private document, private elementRef: ElementRef,private _electronService: IpcServiceService){
    
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
    s.text = ' q$("[data-toggle=\'tooltip\']").tooltip(); ';
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

  buildResult(){
    console.log('build');
    this._electronService.send('openModal');
    this.areaResultService.setResult(this.GTModel.generateOutput());
  }

  showSource(){
    console.log('show source');
    //this._electronService.openWindow();
    this._electronService.openWindowEditTemplate(this.GTModel.absolutePath);
    //this._electronService.send('openModal');
    // const remote = require('electron').remote;
    // const BrowserWindow = remote.BrowserWindow;
    // const win = new BrowserWindow({
    //   height: 600,
    //   width: 800
    // });

    // win.loadURL('');
  }

  commandCtrl(){
    this.GTModel.makeRepeat();
  }
  removeMe: Function;

  removeRow():void{
    
    this.GTModel.destroy();
    this.removeMe();
  }

  testRowMultiDrop():void{
    
    console.log('test');
  }

  changeMultiBody(obj:any):void{
    console.log(obj);
    this.GTModel.setSelectedChildByName(this.GTModel.selectedName);
    this.GTModel.reloadUI();

  }

  changeMultiBodyDrop(obj:any):void{
    console.log(obj);
    this.GTModel.setSelectedChildByName('');
    this.GTModel.reloadUI();
  }

  destroyUI():void{
    this.removeMe();
  }
}
