import { Component, OnInit } from '@angular/core';
import {DialogHelper} from "../testngelectron";
import {gentoolstest} from "../../gentools"

@Component({
  selector: 'app-template-manager',
  templateUrl: './template-manager.component.html',
  styleUrls: ['./template-manager.component.css']
})
export class TemplateManagerComponent implements OnInit {
  btnTxt='Select File';

  constructor() { 
  }

  ngOnInit() {
  }

  onSelectBtnClick():void {
    gentoolstest();
  }


  backupSelectBtnClick():void{
    var remote=DialogHelper.remote;
    var dialog=DialogHelper.alert;
    var fs=remote.require('fs');
    var parseString = remote.require('xml2js').parseString;
    dialog.showOpenDialog({},(fileNames)=>{
      // fileNames is an array that contains all the selected
      if(fileNames === undefined){
          console.log("No file selected");
          return;
      }
    console.log(fileNames);
      fs.readFile(fileNames[0], 'utf-8', (err, data) => {
          if(err){
              alert("An error ocurred reading the file :" + err.message);
              return;
          }
  
          // Change how to handle the file content
          console.log("The file content is : " + data);
      parseString(data.toString(), function (err, result) {
        console.log('result');
        //var factory=new TemplateFactory({rootFile:fileNames[0],source:result,containerId:'slt-entity-container'});
        //factory.createUI();
      });
      });
  });
  }
}
