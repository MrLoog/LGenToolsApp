import { Component, OnInit } from '@angular/core';
import { AreaResultService } from '../area-result.service';

@Component({
  selector: 'app-template-output-area',
  templateUrl: './template-output-area.component.html',
  styleUrls: ['./template-output-area.component.css']
})
export class TemplateOutputAreaComponent implements OnInit {
  result='';

  constructor(private areaResultService: AreaResultService) { }

  ngOnInit() {
    this.result=this.areaResultService.getResult();
    var self=this;
    this.areaResultService.onChange=function(){
      self.result=self.areaResultService.getResult();
    };
  }

}
