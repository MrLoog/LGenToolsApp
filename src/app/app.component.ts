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
  Inject
} from '@angular/core';
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
  
  @ViewChild('dynamic', { 
    read: ViewContainerRef 
  }) viewContainerRef: ViewContainerRef

  constructor(
    @Inject(DynCompServiceService) service){
                this.service=service;
  }


  ngOnInit() {
  }

  onSelectBtnClick():void {
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
