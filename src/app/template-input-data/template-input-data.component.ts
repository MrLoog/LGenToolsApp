import { Component, OnInit } from '@angular/core';
import * as $ from 'jquery';

@Component({
  selector: 'app-template-input-data',
  templateUrl: './template-input-data.component.html',
  styleUrls: ['./template-input-data.component.css']
})
export class TemplateInputDataComponent implements OnInit {
  GTModel:any;
  constructor() { }

  ngOnInit() {
  }

  changeBooleanValue(){
    this.GTModel.value=(this.GTModel.value=='true'?'false':'true');
  }
  onKeyDown(event) {
    if(event.ctrlKey && '37383940'.replace(event.keyCode,'').length!=8) {
      var source=$(event.srcElement).parents('.template-input-data')[0];
      var dataId=$(source).attr('data-id');
      var rowStt=dataId.substring(0,dataId.indexOf('-cl')).substring(dataId.indexOf('-ps')+3);
      var cStt=dataId.substring(dataId.indexOf('-cs')+3);
      var number;
      var slt='';
      switch(event.keyCode){
        case 37://left
          number=parseInt(cStt)-1;
          slt=dataId.replace('cs'+cStt,'cs'+number);
          break;
        case 38://up
          number=parseInt(rowStt)-1;
          slt=dataId.replace('ps'+rowStt,'ps'+number);
          break;
        case 39://right
          number=parseInt(cStt)+1;
          slt=dataId.replace('cs'+cStt,'cs'+number);
          break;
        case 40://down
          number=parseInt(rowStt)+1;
          slt=dataId.replace('ps'+rowStt,'ps'+number);
          break;
        default:
          break;
      }
      if('37383940'.replace(event.keyCode,'').length!=8){
        event.stopPropagation();
        event.preventDefault();
      }
      var target=$('[data-id="'+slt+'"]');
      if(target.length>0){
        $($(target[0]).children()[0]).focus().select();
      }
    }
   
  }
}
