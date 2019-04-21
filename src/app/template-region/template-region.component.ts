import { Component,
  OnInit,
  ViewChild,
  ViewContainerRef,
  Inject,
   AfterViewInit,
    ElementRef
} from '@angular/core';

import { DOCUMENT } from '@angular/common';

import { AdDirective } from '../ad.directive'
import { AreaResultService } from '../area-result.service';

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

  txtTest2='test2';
  @ViewChild(AdDirective) adHost: AdDirective;

  @ViewChild('dynamic', { 
    read: ViewContainerRef 
  }) viewContainerRef: ViewContainerRef


  constructor(private areaResultService:AreaResultService,@Inject(DOCUMENT) private document, private elementRef: ElementRef){
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
    s.text = ' q$("[data-toggle=\'popover\']").popover(); ';
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
    this.areaResultService.setResult(this.GTModel.generateOutput());
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
