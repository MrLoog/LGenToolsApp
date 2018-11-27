import { Component, 
  OnInit,
  ViewChild,
  ViewContainerRef
} from '@angular/core';

import { AdDirective } from '../ad.directive'
import { AreaResultService } from '../area-result.service';

@Component({
  selector: 'app-template-region',
  templateUrl: './template-region.component.html',
  styleUrls: ['./template-region.component.css']
})


export class TemplateRegionComponent implements OnInit {
  GTModel:any;

  txtTest2='test2';
  @ViewChild(AdDirective) adHost: AdDirective;

  @ViewChild('dynamic', { 
    read: ViewContainerRef 
  }) viewContainerRef: ViewContainerRef


  constructor(private areaResultService:AreaResultService){
  }

  ngOnInit() {
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

  changeMultiBody():void{
    this.GTModel.setSelectedChildByName(this.GTModel.selectedName);
    this.GTModel.reloadUI();

  }

  destroyUI():void{
    this.removeMe();
  }
}
