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
    console.log('command ctrl');
    this.GTModel.makeRepeat();
  }
  removeMe: Function;

  removeRow():void{
    console.log('remove row',this.GTModel.parent);
    
    this.GTModel.destroy();
    this.removeMe();
    console.log('remove row',this.GTModel.parent);
    //this.viewContainerRef.clear();
    // this.viewContainerRef
    // .element
    // .nativeElement
    // .parentElement
    // .removeChild(this.viewContainerRef.element.nativeElement);
  }
}
