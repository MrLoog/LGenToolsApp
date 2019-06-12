"use strict";
let $ = require('jquery');
let apiDot = require('dot');
var ElectronService = require('ngx-electron');
var remote = require('./app/testngelectron').DialogHelper.remote;
var app =remote;
var dialog = app.dialog;

var path = app.require('path');
let fs = app.require('fs');
var parseString = app.require('xml2js').parseString;
var XLSX = app.require('xlsx');


var TemplateUtils={
	parseBody:function(){
		
	},
	isEmpty:function isEmpty(val){
		return (val === undefined || val == null || val.length <= 0) ? true : false;
	},
	index:function(obj,is, value) {
		if (obj===undefined) return undefined;
		if (typeof is == 'string')
			return this.index(obj,is.split('.'), value);
		else if (is.length==1 && value!==undefined)
			return obj[is[0]] = value;
		else if (is.length==0)
			return obj;
		else
			return this.index(obj[is[0]],is.slice(1), value);
	},
	getUniqueID(obj){
		if(this.id===undefined) this.id=1;
		var id=this.id++;
		return 'thangtt-'+id;
	},
	showResult(content){
		$('#textarea-result').text(content);
	},
	replaceTemplate(template,data){
		//template=template.replace(new RegExp('\\}\\}[\\s]*\\{\\{','g'),'\}\}\{\{');
		template=template.replace(new RegExp('[\\}][\\s]*[\\{]','g'),'\} \{');
		template=template.replace(new RegExp('[\\>][\\s]*[\\{]','g'),'\> \{');
		template=template.replace(new RegExp('[\\}][\\n]*','g'),'\}');
		template=template.replace(new RegExp('[\\n]+[\\{]','g'),'\n\{');
		//template=template.replace(new RegExp('[\\}][\\s]*[\\<]','g'),'\}\<');
		//template=template.replace(new RegExp('[\\}][\\s]*[\\{]','g'),'\}\{');
		//template=template.replace(new RegExp('[\\s]*[\\{][\\s]*','g'),'\{');
		//template=template.replace(new RegExp('[\\s]*[\\}][\\s]*','g'),'\}');
		template=template.replace(new RegExp('\n','g'),'{{=it.SYSTEM_NEWLINE}}');
		//template=template.replace(new RegExp(' ','g'),'{{=it.SYSTEM_SPACE}}');
		template=template.replace(new RegExp('\t','g'),'{{=it.SYSTEM_TAB}}');
		//template=template.replace(new RegExp("\\\\'",'g'),'{{=it.SYSTEM_COMMA}}');
		template=template.replace(new RegExp("\\\\ (?![^{]*})",'g'),'{{=it.SYSTEM_SPACE}}');
		template=template.replace(new RegExp("\\\\'(?![^{]*})",'g'),'{{=it.SYSTEM_COMMA}}');
		template=template.replace(new RegExp("\\*(?![^{]*})",'g'),'{{=it.SYSTEM_ASTERISK}}');
		//template=template.replace(new RegExp("\\\\'(?![^{]*})",'g'),'{{=it.SYSTEM_COMMA}}');
		template=template.replace(new RegExp('@','g'),'SYSTEM_KEEP_TO'); //@
		data.SYSTEM_NEWLINE='\n';
		data.SYSTEM_SPACE=' ';
		data.SYSTEM_TAB='\t';
		data.SYSTEM_COMMA='\'';
		data.SYSTEM_ASTERISK='*';
		// 1. Compile template function
		//apiDot.templateSettings.strip=false;
		var tempFn = apiDot.template(template,null,data);
		// 2. Use template function as many times as you like
		var resultText = tempFn(data);
		resultText=resultText.replace(new RegExp('SYSTEM_KEEP_TO','g'),'@'); //@
		return resultText;
	},
	stringToFunction(str) {
		var arr = str.split(".");
  
		var fn = (window || this);
		for (var i = 0, len = arr.length; i < len; i++) {
		  fn = fn[arr[i]];
		}
  
		if (typeof fn !== "function") {
		  throw new Error("function not found");
		}
		return  fn;
	  }
}



//constant Body Object
TemplateUtils.BODY_VALUE_INDEX_PATH='0.value.0._';
TemplateUtils.BODY_TYPE_INDEX_PATH='0.value.0.$.type';
TemplateUtils.BODY_SOURCE_INDEX_PATH='0.value.0.$.source';
TemplateUtils.BODY_REPEAT_INDEX_PATH='0.value.0.$.repeat';
TemplateUtils.BODY_SREPEAT_INDEX_PATH='0.value.0.$.step-repeat';
TemplateUtils.BODY_ARRAY_INDEX_PATH='0.value';


//constant TemplateUtils Object
TemplateUtils.BODY_INDEX_PATH='body';
TemplateUtils.NAME_INDEX_PATH='$.name';
TemplateUtils.DES_INDEX_PATH='description';
TemplateUtils.CHILDS_INDEX_PATH='childs.0.child';
TemplateUtils.KEY_INDEX_PATH='$.key';
TemplateUtils.FOR_VALUE_PATH='$.for';
TemplateUtils.TEMPLATE_LIST_INDEX_PATH='templates.template';
TemplateUtils.TYPE_INDEX_PATH='$.type';
TemplateUtils.SOURCE_INDEX_PATH='$.source';
TemplateUtils.INPUT_TYPE_INDEX_PATH='$.inputType';

TemplateUtils.CHILD_VALUE_PATH='value.0';

//constant META
TemplateUtils.META='META';
TemplateUtils.META_BODY_CTRL='BODY_CTRL';
TemplateUtils.META_REPEAT_TOTAL='REPEAT_TOTAL';
TemplateUtils.META_CTRL_TYPE='CTRL_TYPE';
TemplateUtils.META_VALUE_CTRL_TYPE_REPEAT='CTRL_REPEAT';
TemplateUtils.META_VALUE_CTRL_TYPE_SHADOW='CTRL_SHADOW';
TemplateUtils.META_CTRL_REPEAT_INDEX='CTRL_REPEAT_INDEX';

class XMLTemplate{
	constructor(options){
		var source=this.source=options.source;
		for(var key in options.source){
			if(typeof  options.source[key] !== 'object' ||  options.source[key] instanceof Array){
				if(options.source[key] instanceof Array && options.source[key].length==1){
					this[key]=options.source[key][0];
				}else{
					this[key]=options.source[key];
				}
			}
		}
		this.options=options;
		this.rootFolder=options.rootFolder;
		this.parent=this.parentModel=options.parent;
		this.factoryUI=options.factoryUI;
		this.dataSource=options.dataSource;
		this.absolutePath=options.absolutePath;
		this.level=this.parent.level+1;
		this.createdUI=false;
		this.hidden=false;
		if(this["init-script"]!==undefined){
			eval(this["init-script"]);
		}
		if(this['parse-script']!==undefined && this.generateOutput!==undefined){
			var old_generateOutput = this.generateOutput;
			this.generateOutput=function(){
				var value=old_generateOutput.apply(this,arguments);
				var script_execute='function exe(it){'+this['parse-script']+'} exe("'+
					value
						.replace(new RegExp('\\/\\*([\\s\\S]*?)\\*\\/','g'),'').replace(new RegExp('\\\r','g'),'') //xóa comment
						.replace(new RegExp('\\\n','g'),'') //remove xuống dòng
						.replace(new RegExp('\\\\(?!r|n|t|b|f)','g'),'\\\\')
						//.replace(new RegExp('\'','g'),'\\\\\'')
						.replace(new RegExp('\"','g'),'\\\"')+'");';
						
						
						//.replace(new RegExp('\\/\\*.*\\*\\/','g'),'')
						//.replace(new RegExp('\'','g'),'\\\"')
						//.replace(new RegExp('\\','g'),'\\\\')
				value=eval(script_execute);
				return value;
			}
		}
	}
	setUIControl(uiControl){
		this.UIControl=uiControl;
	}
	createDataInit(source,wrapperId,absolutePath){
		if(source===undefined){
			source={};
		}
		return {source:source
			,rootFolder:this.rootFolder
			,containerId:(typeof wrapperId==='undefined'?this.myWrapperId:wrapperId)
			,parent:this
			,factoryUI:this.factoryUI
			,dataSource:this.dataSource
		,absolutePath:absolutePath===undefined?this.absolutePath:absolutePath};
	}

	createUI(){
		if(this['UIControl']===undefined){
			this['UIControl']=this.factoryUI.buildUIControl(this,this.parentModel);
			this.createdUI=true;
		}
	}
	generateUI(){
		throw new Error('You have to implement the method doSomething!');
	}
	isMultiTemplate(){
		//not using
		return false;
	}
	
	generateSelectTemplate(){
		//not using
	}
	generateInput(){
		throw new Error('You have to implement the method doSomething!');
	}
	generateOutput(){
		throw new Error('You have to implement the method doSomething!');
	}
	setFactoryUI(factoryUI){
		this.factoryUI=factoryUI;
	}
	destroyUI(){
		if(this.onDestroyUI!==undefined){
			this.onDestroyUI();
		}
	}

	getData(dt,inheritData,baseData){
		var data={};
		if(baseData!==undefined) data=baseData;
		data[TemplateUtils.META]={};
		if(dt!==undefined && dt!=null){
			for(var key in dt){
				data[TemplateUtils.META][key]=dt[key];
			}
		}
		if(inheritData !==undefined && inheritData[TemplateUtils.META]!==undefined){
			for(var key in inheritData[TemplateUtils.META]){
				data[TemplateUtils.META][key]=inheritData[TemplateUtils.META][key];
			}
		}
		return data;
	}
}




class BodyWrapper extends XMLTemplate{
	constructor(options){
		super(options);
		var source=this.source;
		this.bodySource=TemplateUtils.index(source,TemplateUtils.BODY_ARRAY_INDEX_PATH);
		this.parent=options.parent;
		this.initBodyValues();
	}
	
	initBodyValues(){
		this.bodyValues={};
		for(var i=0;i<this.bodySource.length;i++){
			var source=this.bodySource[i];
			if(source.$.type.toUpperCase()=='STRUCT'){
				this.bodyStruct=new BodyStruct(this.createDataInit(source));
				this.bodyStruct.stt=i;
			} else if(source.$.type.toUpperCase()=='MULTI'){
				var bodyMulti=new BodyMulti(this.createDataInit(source));
				this.bodyValues[bodyMulti.name]=bodyMulti;
				bodyMulti.stt=i;
			}else if(source.$.type.toUpperCase()=='MULTI_DROP'){
				var bodyMultiDrop=new BodyMultiDrop(this.createDataInit(source));
				this.bodyValues[bodyMultiDrop.name]=bodyMultiDrop;
				bodyMultiDrop.stt=i;
			}else if(source.$.type.toUpperCase()=='EXCEL'){
				var bodyExcel=new BodyExcel(this.createDataInit(source));
				this.bodyValues[bodyExcel.name]=bodyExcel;
				bodyExcel.stt=i;
			}else{
				var bodyPart=new BodyPart(this.createDataInit(source));
				this.bodyValues[bodyPart.name]=bodyPart;
				bodyPart.stt=i;
			}
		}
	}
	// loadTemplate(){
	// 	var self=this;
	// 	if(this.type.toUpperCase()=='IN'){
	// 		self.parent.template=self.template=self.templatePath;
	// 	}else if (this.type.toUpperCase()=='OUT'){
	// 		this.dataSource.loadTemplate(self.rootFolder,self.templatePath,function(data){
	// 			self.parent.template=self.template=data;
	// 		});
	// 	}
	// }
	getTemplate(){
		return this.template;
	}
	createUI(){
		super.createUI();
		this.generateChildUI();
		for(var key in this.bodyValues){
			this.bodyValues[key].createUI();
		}
	}
	generateChildUI(){
		for(var i=0;i<this.bodyChilds.length;i++){
			this.bodyChilds[i].createUI();
		}
	}
	setChilds(childs){
		this.childs=childs;//contain all childs
		this.bodyChilds=[];//contain only body value share childs
		for(var i=0;i<this.childs.length;i++){
			var aChild=this.childs[i];
			if(aChild.forBody!==undefined){
				this.bodyValues[aChild.forBody].addChild(aChild);
			}else{
				aChild.parentModel=this;
				this.bodyChilds.push(aChild);
			}
			
		}
	}
	generateOutput(){
		var body='';
		this.bodyStruct.startBuilding()
		//build from body part
		var data={};
		for(var key in this.bodyValues){
			data[this.bodyValues[key].key]=this.bodyValues[key].generateOutput();
		}
		//build from child input share
		for(var i=0;i<this.bodyChilds.length;i++){
			data[this.bodyChilds[i].key]=this.bodyChilds[i].generateOutput();
		}
		
		body=TemplateUtils.replaceTemplate(this.bodyStruct.templateO,data);
		return body;
	}

	generateOutputExt(it,key){
		if (it.Ext===undefined) it.Ext={};
		//build from body part
		var data={};
		for(var k in this.bodyValues){
			data[this.bodyValues[k].key]=this.bodyValues[k].generateOutput();
		}
		//build from child input share
		for(var i=0;i<this.bodyChilds.length;i++){
			data[this.bodyChilds[i].key]=this.bodyChilds[i].generateOutput();
		}

		it.Ext[key]=data;
	}
}



class BodyBase extends XMLTemplate{
	constructor(options){
		super(options);
		this.childs=[];
	}

	addChild(aChild){
		this.childs.push(aChild);
	}

	
	

}

class BodyValue extends BodyBase{
	constructor(options){
		super(options);
		var source=options.source;
		this.key=TemplateUtils.index(source,'$.key');
		this.templatePath=TemplateUtils.index(source,'_');
		this.type=TemplateUtils.index(source,'$.type');
		this.sourceT=TemplateUtils.index(source,'$.source');
		this.sourceT=(this.sourceT===undefined?'':this.sourceT);
		this.bodyRow=new BodyRow(this.createDataInit(this.source));
		this.bodyRow.stt=0;
		this.bodyRows=[];
		this.bodyRows.push(this.bodyRow);
		this.loadTemplate();
	}
	loadTemplate(){
		var self=this;
		if (this.sourceT.toUpperCase()=='OUT'){
			this.dataSource.loadTemplate(self.rootFolder,self.templatePath,function(data){
				self.template=data;
			});
		}else {
			//IN , MULTI,EXCEL STRUCT
			//(this.type.toUpperCase()=='IN' || this.type.toUpperCase()=='STRUCT') 
			// self.parent.template=self.template=self.templatePath;
			self.template=self.templatePath;
		} 
	}
	createUI(){
		super.createUI();
	}
	addChild(aChild){
		super.addChild(aChild);
		this.bodyRow.addChild(aChild);
	}
	generateOutput(){
		//todo: body value generate output
	}
	generateChildUI(){
		this.bodyRow.createUI();
		for(var i=0;i<this.childs.length;i++){
			this.childs[i].createUI();
		}
	}
	startBuilding(){
		this.templateO=this.template;
		
	}
	generateOutput(clear){
		var result=this.templateO;
		if (clear) delete this.templateO;
		return result;
	}
	replaceChildIntoTemplate(key,value){
		if(this.templateO===undefined){
			this.startBuilding();
		}
		this.templateO=this.templateO.replace(new RegExp(key,'gi'),value);
		
		
		return this.templateO;
	}
}

class BodyStruct extends BodyValue{
	constructor(options){
		super(options);
	}
}

class BodyPart extends BodyValue{
	constructor(options){
		super(options);
		this.name=TemplateUtils.index(options.source,'$.name');
		this.initCtrl();
	}
	initCtrl(){
		this.ctrlObjs=[];
		if(TemplateUtils.index(this.source,'$.repeat')!==undefined){
			var repeatCtrl=new RepeatCtrl(this.createDataInit(this.source));
			this.ctrlObjs.push(repeatCtrl);
			this.isRepeat=true;
		}
		if(TemplateUtils.index(this.source,'$.shadowFrom')!==undefined){
			var shadowCtrl=new ShadowCtrl(this.createDataInit(this.source));
			this.ctrlObjs.push(shadowCtrl);
			this.isShadow=true;
		}
	}

	getData(dt,inheritData,baseData){
		var data=super.getData(dt,inheritData,baseData);
		var dataMeta=data[TemplateUtils.META];
		dataMeta[TemplateUtils.META_BODY_CTRL]='';
		for(var key in this.ctrlObjs){
			dataMeta[TemplateUtils.META_BODY_CTRL]+=this.ctrlObjs[key].name;
			dataMeta[TemplateUtils.META_BODY_CTRL]+=',';
		}
		if(this.isRepeat){
			dataMeta[TemplateUtils.META_REPEAT_TOTAL]=this.childsRepeat===undefined? 0 :this.childsRepeat.length;
		}
		return data;
	}
	
	generateOutput(clear){
		this.startBuilding();
		var data=this.getData();
		for(var key in this.parent.bodyChilds){
			var global_child=this.parent.bodyChilds[key];
			data[global_child.key]=global_child.generateOutput();
			global_child.generateOutputExt(data,global_child.key);
		}
		for(var i=0;i<this.childs.length;i++){
			// this.replaceChildIntoTemplate(this.childs[i].key,this.childs[i].generateOutput());
			data[this.childs[i].key]=this.childs[i].generateOutput();
			this.childs[i].generateOutputExt(data,this.childs[i].key);
		}
		
		if(!this.isShadow ){
			this.templateO=TemplateUtils.replaceTemplate(this.templateO,data);
		}
		for(var i=0;i<this.ctrlObjs.length;i++){
			this.ctrlObjs[i].generateOutput(data);
		}
		return super.generateOutput();
	}
	
	createUI(){
		super.createUI();
		this.generateCtrl();
		this.generateChildUI();
	}
	generateCtrl(){
		for(var i=0;i<this.ctrlObjs.length;i++){
			this.ctrlObjs[i].createUI();
		}
	}
	// createDataInit(){
		// var data=super.createDataInit();
		// return data;
	// }
	
	
	
	
	removeBodyRow(bodyRow){
		console.log('remove normal repeat');
		var index=bodyRow.repeatIndex*1;
		this.childsRepeat.splice(index, 1);// not contain first child
		this.bodyRows.splice(index+1, 1);
		//reset index
		for(var i=index+1;i<this.bodyRows.length;i++){
			this.bodyRows[i].repeatIndex=i-1;
		}
	}
	
	cloneChilds(){
		var childs=[];
		var bodyRow=new BodyRow(this.createDataInit(this.source));
		bodyRow.childs=childs;
		this.bodyRows.push(bodyRow);
		for(var i=0;i<this.childs.length;i++){
			var aChild=new ChildWrapper(this.createDataInit(this.childs[i].source));
			aChild.setFactoryUI(this.factoryUI);
			childs.push(aChild);
			aChild.stt=i;
			bodyRow.addChild(aChild);
		}
		return bodyRow;
	}

	generateChildRepeatUI(i){
		this.bodyRows[i+1].createUI();
		for(var j=0;j< this.childsRepeat[i].length;j++){
			this.childsRepeat[i][j].createUI();
		}
	}
}

class BodyExcel extends BodyValue{
	constructor(options){
		super(options);
		this.name=TemplateUtils.index(options.source,'$.name');
		//this.initCtrl();
	}
	initCtrl(){
		//
		this.ctrlObjs=[];
		if(TemplateUtils.index(this.source,'$.repeat')!==undefined){
			var repeatCtrl=new RepeatCtrl(this.createDataInit(this.source));
			this.ctrlObjs.push(repeatCtrl);
		}
		if(TemplateUtils.index(this.source,'$.shadowFrom')!==undefined){
			var shadowCtrl=new ShadowCtrl(this.createDataInit(this.source));
			this.ctrlObjs.push(shadowCtrl);
			this.isShadow=true;
		}
	}
	
	generateOutput(clear){
		var data={};
		console.log('tesst');
		for(var key in this.parent.bodyChilds){
			var global_child=this.parent.bodyChilds[key];
			data[global_child.key]=global_child.generateOutput();
			global_child.generateOutputExt(data,global_child.key);
		}
		var excelChilds={};
		var maxLength=0;
		for(var i=0;i<this.childs.length;i++){
			// this.replaceChildIntoTemplate(this.childs[i].key,this.childs[i].generateOutput());
			if(this.childs[i].isInputChild() && this.childs[i].inputType.toUpperCase()=='EXCEL'){
				excelChilds[this.childs[i].key]=this.childs[i].generateOutput();
				if(excelChilds[this.childs[i].key].length>maxLength){
					maxLength=excelChilds[this.childs[i].key].length;
				}
			}else{
				data[this.childs[i].key]=this.childs[i].generateOutput();
				this.childs[i].generateOutputExt(data,this.childs[i].key);
			}
		}
		this.templateO='';
		for(var i=0;i<maxLength;i++){
			for(var c in excelChilds){
				data[c]=excelChilds[c][i];
			}
			this.templateO+=TemplateUtils.replaceTemplate(this.template,data);
		}
		
		/*
		for(var i=0;i<this.ctrlObjs.length;i++){
			this.ctrlObjs[i].generateOutput(data);
		}*/
		return super.generateOutput();
	}
	
	createUI(){
		super.createUI();
		//this.generateCtrl();
		this.generateChildUI();
	}
	generateCtrl(){
		for(var i=0;i<this.ctrlObjs.length;i++){
			this.ctrlObjs[i].createUI();
		}
	}
	// createDataInit(){
		// var data=super.createDataInit();
		// return data;
	// }
	
	
	
	
	removeBodyRow(bodyRow){
		console.log('remove normal repeat');
		var index=bodyRow.repeatIndex*1;
		this.childsRepeat.splice(index, 1);// not contain first child
		this.bodyRows.splice(index+1, 1);
		//reset index
		for(var i=index+1;i<this.bodyRows.length;i++){
			this.bodyRows[i].repeatIndex=i-1;
		}
	}
	
	cloneChilds(){
		var childs=[];
		var bodyRow=new BodyRow(this.createDataInit(this.source));
		bodyRow.childs=childs;
		this.bodyRows.push(bodyRow);
		for(var i=0;i<this.childs.length;i++){
			var aChild=new ChildWrapper(this.createDataInit(this.childs[i].source));
			aChild.setFactoryUI(this.factoryUI);
			childs.push(aChild);
			aChild.stt=i;
			bodyRow.addChild(aChild);
		}
		return bodyRow;
	}

	generateChildRepeatUI(i){
		this.bodyRows[i+1].createUI();
		for(var j=0;j< this.childsRepeat[i].length;j++){
			this.childsRepeat[i][j].createUI();
		}
	}
}

class BodyMulti extends BodyBase{

	constructor(options){
		super(options);
		this.key=TemplateUtils.index(options.source,'$.key');
		this.name=TemplateUtils.index(options.source,'$.name');
		this.bodyRow=new BodyRowMulti(this.createDataInit(this.source));
		this.bodyRow.stt=0;
		this.bodyRows=[];
		this.bodyRows.push(this.bodyRow);
		this.template=TemplateUtils.index(options.source,'_');
		this.initCtrl();
	}

	initCtrl(){
		this.ctrlObjs=[];
		if(TemplateUtils.index(this.source,'$.repeat')!==undefined){
			var repeatCtrl=new RepeatCtrl(this.createDataInit(this.source));
			this.ctrlObjs.push(repeatCtrl);
		}
		// if(TemplateUtils.index(this.source,'$.shadowFrom')!==undefined){
		// 	var shadowCtrl=new ShadowCtrl(this.createDataInit(this.source));
		// 	this.ctrlObjs.push(shadowCtrl);
		// }
	}

	addChild(aChild){
		super.addChild(aChild);
		this.bodyRow.addChild(aChild);
	}

	getData(dt,inheritData,baseData){
		var data=super.getData(dt,inheritData,baseData);
		var dataMeta=data[TemplateUtils.META];
		dataMeta[TemplateUtils.META_BODY_CTRL]='';
		for(var key in this.ctrlObjs){
			dataMeta[TemplateUtils.META_BODY_CTRL]+=this.ctrlObjs[key].name;
			dataMeta[TemplateUtils.META_BODY_CTRL]+=',';
		}
		if(this.isRepeat){
			dataMeta[TemplateUtils.META_REPEAT_TOTAL]=this.childsRepeat===undefined? 0 :this.childsRepeat.length;
		}
		return data;
	}

	generateOutput(){
		var output='';
		var data=this.getData();
		for(var key in this.parent.bodyChilds){
			var global_child=this.parent.bodyChilds[key];
			data[global_child.key]=global_child.generateOutput();
			global_child.generateOutputExt(data,global_child.key);
		}
		data[this.bodyRow.selectedChild.key]=this.bodyRow.selectedChild.generateOutput();
		this.bodyRow.selectedChild.generateOutputExt(data,this.bodyRow.selectedChild.key);
		
		output+=TemplateUtils.replaceTemplate(this.template,data);
		//for(var i=0;i<this.ctrlObjs.length;i++){
		//	this.ctrlObjs[i].generateOutput();
		//}
		for(var i=0;i<this.ctrlObjs.length;i++){
			output+=this.ctrlObjs[i].generateOutputMulti();
		}
		return output;
	}

	createUI(){
		super.createUI();
		this.generateCtrl();
		this.bodyRow.createUI();
		//for(var i=0;i<this.childs.length;i++){
		//	this.childs[i].createUI();
		//}
	}

	generateCtrl(){
		for(var i=0;i<this.ctrlObjs.length;i++){
			this.ctrlObjs[i].createUI();
		}
	}

	removeBodyRow(bodyRow){
		console.log('remove body multi');
		var index=bodyRow.repeatIndex*1;
		this.childsRepeat.splice(index, 1);// not contain first child
		this.bodyRows.splice(index+1, 1);
		//reset index
		for(var i=index+1;i<this.bodyRows.length;i++){
			this.bodyRows[i].repeatIndex=i-1;
		}
	}
	

	cloneChilds(){
		var bodyRow=new BodyRowMulti(this.createDataInit(this.source));
		this.bodyRows.push(bodyRow);
		for(var i=0;i<this.childs.length;i++){
			var aChild=new ChildWrapper(this.createDataInit(this.childs[i].source));
			aChild.setFactoryUI(this.factoryUI);
			aChild.stt=i;
			bodyRow.addChild(aChild);
		}
		return bodyRow;
	}

	generateChildRepeatUI(i){
		this.bodyRows[i+1].createUI();
		//do nothing
	}
}

class BodyMultiDrop extends BodyBase{

	constructor(options){
		super(options);
		this.key=TemplateUtils.index(options.source,'$.key');
		this.name=TemplateUtils.index(options.source,'$.name');
		this.bodyRow=new BodyRowMultiDrop(this.createDataInit(this.source));
		this.bodyRow.stt=0;
		this.bodyRows=[];
		this.bodyRows.push(this.bodyRow);
		this.template=TemplateUtils.index(options.source,'_');
		this.initCtrl();
	}

	initCtrl(){
		this.ctrlObjs=[];
		if(TemplateUtils.index(this.source,'$.repeat')!==undefined){
			var repeatCtrl=new RepeatCtrl(this.createDataInit(this.source));
			this.ctrlObjs.push(repeatCtrl);
		}
		// if(TemplateUtils.index(this.source,'$.shadowFrom')!==undefined){
		// 	var shadowCtrl=new ShadowCtrl(this.createDataInit(this.source));
		// 	this.ctrlObjs.push(shadowCtrl);
		// }
	}

	addChild(aChild){
		super.addChild(aChild);
		this.bodyRow.addChild(aChild);
	}

	generateOutput(){
		var output='';
		var data=this.getData();
		for(var key in this.parent.bodyChilds){
			var global_child=this.parent.bodyChilds[key];
			data[global_child.key]=global_child.generateOutput();
			global_child.generateOutputExt(data,global_child.key);
		}
		for(var i=0;i<this.bodyRow.selectedChild.length;i++){
			data[this.bodyRow.selectedChild[i].key]=this.bodyRow.selectedChild[i].generateOutput();
			this.bodyRow.selectedChild[i].generateOutputExt(data,this.bodyRow.selectedChild[i].key);
		}
		
		output+=TemplateUtils.replaceTemplate(this.template,data);
		//for(var i=0;i<this.ctrlObjs.length;i++){
		//	this.ctrlObjs[i].generateOutput();
		//}
		for(var i=0;i<this.ctrlObjs.length;i++){
			output+=this.ctrlObjs[i].generateOutputMultiDrop();
		}
		return output;
	}

	createUI(){
		super.createUI();
		this.generateCtrl();
		this.bodyRow.createUI();
		//for(var i=0;i<this.childs.length;i++){
		//	this.childs[i].createUI();
		//}
	}

	generateCtrl(){
		for(var i=0;i<this.ctrlObjs.length;i++){
			this.ctrlObjs[i].createUI();
		}
	}

	removeBodyRow(bodyRow){
		console.log('remove body multi');
		var index=bodyRow.repeatIndex*1;
		this.childsRepeat.splice(index, 1);// not contain first child
		this.bodyRows.splice(index+1, 1);
		//reset index
		for(var i=index+1;i<this.bodyRows.length;i++){
			this.bodyRows[i].repeatIndex=i-1;
		}
	}
	

	cloneChilds(){
		var bodyRow=new BodyRowMultiDrop(this.createDataInit(this.source));
		this.bodyRows.push(bodyRow);
		for(var i=0;i<this.childs.length;i++){
			var aChild=new ChildWrapper(this.createDataInit(this.childs[i].source));
			aChild.setFactoryUI(this.factoryUI);
			aChild.stt=i;
			bodyRow.addChild(aChild);
		}
		return bodyRow;
	}

	generateChildRepeatUI(i){
		this.bodyRows[i+1].createUI();
		//do nothing
	}
}



class RowWrapper extends XMLTemplate{
	constructor(options){
		super(options);
	}
}

class BodyRow extends RowWrapper{
	constructor(options){
		super(options);
		this.isBodyRow=true;
	}
	
	addChild(aChild){
		aChild.parentModel=this;
	}

	destroy(){
		this.parent.removeBodyRow(this);
		delete this;
	}
}

class BodyRowMulti extends RowWrapper{
	constructor(options){
		super(options);
		this.childs=[];
		this.bodyRowMulti=true;
	}

	
	addChild(aChild){
		aChild.parentModel=this;
		this.childs.push(aChild);
		if(this.childs.length==1){
			this.setSelectedChildByName(this.childs[0].name);
		}
	}

	destroy(){
		this.parent.removeBodyRow(this);
		delete this;
	}


	setSelectedChildByName(name){
		if(this.selectedChild!==undefined) this.selectedChild.hidden=true;
		for(var i=0;i<this.parent.childs.length;i++){
			if(this.parent.childs[i].name==name){
				console.log('set selected name ',name);
				this.selectedName=name;
				this.selectedChild=this.childs[i];
				this.selectedChild.hidden=false;
				break;
			}
		}
	}


	createUI(){
		super.createUI();
		this.reloadUI();
	}

	reloadUI(){
		if(this.selectedChild.createdUI){
			this.selectedChild.hidden=false;
			return;
		}
		this.selectedChild.createUI();
	}
}

class BodyRowMultiDrop extends RowWrapper{
	constructor(options){
		super(options);
		this.childs=[];
		this.displayChilds=[];
		this.selectedChildDisplay=[];
		this.selectedChild=[];
		this.bodyRowMultiDrop=true;
	}

	
	addChild(aChild){
		aChild.parentModel=this;
		this.childs.push(aChild);
		this.displayChilds.push(aChild.name);
		this.selectedChildDisplay.push(aChild.name);
		this.setSelectedChildByName(this.childs[0].name);
	}

	destroy(){
		this.parent.removeBodyRow(this);
		delete this;
	}


	setSelectedChildByName(name){
		this.selectedChild.length=0;
		for(var i=0;i<this.childs.length;i++){
			if(this.selectedChildDisplay.indexOf(this.childs[i].name)>-1){
				this.selectedChild.push(this.childs[i]);
				this.childs[i].hidden=false;
			}else{
				//this.selectedChild.splice(this.selectedChild.indexOf(this.childs[i]),1);
				this.childs[i].hidden=true;
			}
		}
		/*
		if(this.selectedChild!==undefined) this.selectedChild.hidden=true;
		for(var i=0;i<this.parent.childs.length;i++){
			if(this.parent.childs[i].name==name){
				console.log('set selected name ',name);
				this.selectedName=name;
				this.selectedChild=this.childs[i];
				this.selectedChild.hidden=false;
				break;
			}
		}*/
	}


	createUI(){
		super.createUI();
		this.reloadUI();
	}

	reloadUI(){
		for(var i=0;i<this.childs.length;i++){
			console.log('generate');
			if(this.selectedChildDisplay.indexOf(this.childs[i].name)>-1){
				if(this.childs[i].createdUI){
					this.childs[i].hidden=false;
				}else{
					this.childs[i].createUI();
					this.childs[i].hidden=false;
				}
			}else{
				if(this.childs[i].createdUI){
					this.childs[i].hidden=true;
				}else{
					this.childs[i].createUI();
					this.childs[i].hidden=true;
				}
			}
		}
	}
}

class CtrlView extends XMLTemplate{
	constructor(options){
		super(options);
		this.target=options.parent;
		this.ctrlView=true;
	}
}

class CommandCtrl extends CtrlView{
	constructor(options){
		super(options);
		this.commandCtrl=true;
	}
}


class RepeatCtrl extends CommandCtrl{
	constructor(options){
		super(options);
		var source=this.source;
		this.repeat=TemplateUtils.index(source,'$.repeat'); 
		this.stepRepeat=TemplateUtils.index(source,'$.step-repeat');
		this.curRepeat=0;
		this.aliasCommand='Ctrl Repeat';
		this.name=TemplateUtils.META_VALUE_CTRL_TYPE_REPEAT;
	}
	createUI(){
		super.createUI();
	}
	makeRepeat(){
		if(this.stepRepeat===undefined) this.stepRepeat=1;
		this.curRepeat++;

		var number=this.stepRepeat;
		var parent=this.parent;
		if(parent.childsRepeat===undefined){
			parent.childsRepeat=[];
		}
		var number = number*1;
		var curRepeat=parent.childsRepeat.length;
		for(var i=curRepeat;i<(curRepeat+number);i++){
			var bodyRow=parent.cloneChilds()
			bodyRow.repeatIndex=i;
			bodyRow.stt=i+2;
			var repeat=parent.childsRepeat[i]=bodyRow.childs;
			
			this.parent.generateChildRepeatUI(i);
		}
	}
	
	generateOutput(preData){
		var curOutput=this.parent.templateO;
		var parent=this.parent;
		if (parent.childsRepeat===undefined) return;
		var data=this.getData();
		for(var j=0;j<parent.childsRepeat.length;j++){
				this.parent.startBuilding();
				data=this.getData(data,this.parent.getData(),preData);
				var extra={};
				extra[TemplateUtils.META_CTRL_REPEAT_INDEX]=j;
				data=this.getData(extra,data,preData);
				for(var i=0;i<parent.childsRepeat[j].length;i++){
					data[parent.childsRepeat[j][i].key]=parent.childsRepeat[j][i].generateOutput();
				}
				parent.templateO=TemplateUtils.replaceTemplate(parent.templateO,data);
			curOutput+=parent.templateO;
		}
		parent.templateO=curOutput;
	}

	getData(dt,inheritData,baseData){
		var data=super.getData(dt,inheritData,baseData);
		var dataMeta=data[TemplateUtils.META];
		dataMeta[TemplateUtils.META_CTRL_TYPE]=TemplateUtils.META_VALUE_CTRL_TYPE_REPEAT;
		return data;
	}
	
	generateOutputMulti(){
		var output='';
		var data=this.getData();
		for(var i=1;i<this.parent.bodyRows.length;i++){
			data=this.getData({},this.parent.getData());
			var extra={};
			extra[TemplateUtils.META_CTRL_REPEAT_INDEX]=i;
			data=this.getData(extra,data);
			data[this.parent.bodyRows[i].selectedChild.key]=this.parent.bodyRows[i].selectedChild.generateOutput();
			this.parent.bodyRows[i].selectedChild.generateOutputExt(data,this.parent.bodyRows[i].selectedChild.key);
			output+=TemplateUtils.replaceTemplate(this.parent.template,data);
		}
		//for(var i=0;i<this.ctrlObjs.length;i++){
		//	this.ctrlObjs[i].generateOutput();
		//}
		return output;
	}

	generateOutputMultiDrop(){
		var output='';
		var data=this.getData();
		for(var j=1;j<this.parent.bodyRows.length;j++){
			var bodyRow=this.parent.bodyRows[j];
			for(var i=0;i<bodyRow.selectedChild.length;i++){
				data[bodyRow.selectedChild[i].key]=bodyRow.selectedChild[i].generateOutput();
				bodyRow.selectedChild[i].generateOutputExt(data,bodyRow.selectedChild[i].key);
				output+=TemplateUtils.replaceTemplate(this.parent.template,data);
			}
		}
		//for(var i=0;i<this.ctrlObjs.length;i++){
		//	this.ctrlObjs[i].generateOutput();
		//}
		return output;
	}
}

class AutoCtrl extends CtrlView{
	constructor(options){
		super(options);
	}
}


class ShadowCtrl extends AutoCtrl{
	constructor(options){
		super(options);
		var source=this.source;
		this.name=TemplateUtils.META_VALUE_CTRL_TYPE_SHADOW;
		this.shadowFrom=TemplateUtils.index(source,'$.shadowFrom'); 
	}
	createUI(){
		//no UI
	}
	generateOutput(preData){
		var parent=this.parent;
		var targetShadow=parent.parent.bodyValues[this.shadowFrom];
		//todo: shadow default output
		parent.startBuilding();
		
		var data=this.getData();
		if (preData!==undefined) data=JSON.parse(JSON.stringify(preData));
		if(targetShadow instanceof BodyMulti){
			data[targetShadow.bodyRow.selectedChild.key]=targetShadow.bodyRow.selectedChild.generateOutput();
			targetShadow.bodyRow.selectedChild.generateOutputExt(data,targetShadow.bodyRow.selectedChild.key);
		}else{
			for(var i=0;i<targetShadow.childs.length;i++){
				var aChild=targetShadow.childs[i];
				data[aChild.key]=aChild.generateOutput();
				aChild.generateOutputExt(data,aChild.key);
			}
		}
		parent.templateO=TemplateUtils.replaceTemplate(parent.templateO,data);
		//todo: shadow repeat output
		var output=parent.templateO;
		
		if (targetShadow.childsRepeat===undefined) return;
		//var repeatCount=targetShadow.childsRepeat.length;
		if(targetShadow instanceof BodyMulti){
			for(var j=1;j<targetShadow.bodyRows.length;j++){
				parent.startBuilding();
				data=this.getData();
				if (preData!==undefined) data=JSON.parse(JSON.stringify(preData));
				var bodyRow=targetShadow.bodyRows[j];
				data[bodyRow.selectedChild.key]=bodyRow.selectedChild.generateOutput();
				bodyRow.selectedChild.generateOutputExt(data,bodyRow.selectedChild.key);

				parent.templateO=TemplateUtils.replaceTemplate(parent.templateO,data);
				output+=parent.templateO;
			}
		}else{
				for(var j=0;j<targetShadow.childsRepeat.length;j++){
				parent.startBuilding();
				for(var i=0;i<targetShadow.childsRepeat[j].length;i++){
					data[targetShadow.childsRepeat[j][i].key]=targetShadow.childsRepeat[j][i].generateOutput();
					targetShadow.childsRepeat[j][i].generateOutputExt(data,targetShadow.childsRepeat[j][i].key);
				}
				parent.templateO=TemplateUtils.replaceTemplate(parent.templateO,data);
				output+=parent.templateO;
			}
		}
		parent.templateO=output;
		return output;
	}
}

class Template extends XMLTemplate{
	constructor(options){
		super(options);
		this.buildable=true;
		var source=this.source=options.source;
		if(TemplateUtils.index(source,TemplateUtils.BODY_INDEX_PATH)!=undefined){
			this.body=new BodyWrapper(this.createDataInit(TemplateUtils.index(source,TemplateUtils.BODY_INDEX_PATH)));
		}
		this.name=TemplateUtils.index(source,TemplateUtils.NAME_INDEX_PATH);
		this.description=TemplateUtils.index(source,TemplateUtils.DES_INDEX_PATH);
		this.childSource=TemplateUtils.index(source,TemplateUtils.CHILDS_INDEX_PATH);
		//this.type=TemplateUtils.index(source,TemplateUtils.TYPE_INDEX_PATH);
		//build child
		if(this.childSource.length>0){
			this.childs=[];
			this.buildChild(this.childSource,this.childs);
		}
		
	}
	loadTemplate(source){
		return this.body.getTemplate();
	}
	buildChild(childSource,arrChilds){
		for(var i=0;i<childSource.length;i++){
			var aChild=new ChildWrapper(this.createDataInit(childSource[i]));
			//aChild.setFactoryUI(this.factoryUI);
			aChild.stt=i;
			arrChilds.push(aChild);
		}
		//have child -> mush have body
		this.body.setChilds(arrChilds);
	}
	createUI(){
		super.createUI();//super class auto append wrapper div to parent div
		if(this.isMultiTemplate()){
			this.generateSelectTemplate();
		}else{
			this.generateUI();
		}
	}
	generateUI(){
		this.generateBtnBuild();
		if(this.body!==undefined){
			this.body.createUI();
		}
	}
	generateBtnBuild(){
		var self=this;
	}
	showBuildTemplate(){
		TemplateUtils.showResult(this.generateOutput());
	}
	generateOutput(){
		return this.body.generateOutput();
	}

	generateOutputExt(it,key){
		return this.body.generateOutputExt(it,key);
	}
	
	getBuildingTemplate(){
		//implement get template
		if(this.templateO===undefined){
			this.templateO=this.template;
		}
		return this.templateO;
	}
	replaceChildIntoTemplate(template,key,value){
		var tempO=template.replace(new RegExp(key,'g'),value);
		//save template to current building template
		this.templateO=tempO;
	}
	generateChildUI(){
		//todo:implement generate child of selected template
		for(var i=0;i<this.childs.length;i++){
			this.childs[i].createUI();
		}
	}
	
	onTemplateSelected(selected){
		//save selected value
		this.selectedTemplate=extractSelectedTemplate(selected);
		this.generateUI();
	}
	extractSelectedTemplate(selected){
		//todo:imeplement method
	}
	addChild(aChild){
		this.childs.push(aChild);
		setTimeout(function(){ aChild.createUI(); }, 3000);
	}
}


class ObjectTemplate extends Template{
	constructor(options){
		super(options);
	}
}

class RootTemplate extends Template{
	constructor(options){
		super(options);
		this.rootTemplate=true;
		window.rootTemplate=this;
	}
	createUI(){
		super.createUI();
	}
}

class ChildWrapper extends XMLTemplate{
	constructor(options){
		super(options);
		var source=this.source=options.source;
		this.name=TemplateUtils.index(source,TemplateUtils.NAME_INDEX_PATH);
		this.key=TemplateUtils.index(source,TemplateUtils.KEY_INDEX_PATH);
		this.type=TemplateUtils.index(source,TemplateUtils.TYPE_INDEX_PATH);
		this.sourceT=TemplateUtils.index(source,TemplateUtils.SOURCE_INDEX_PATH);
		this.sourceT=(this.sourceT===undefined?'':this.sourceT);
		this.value=TemplateUtils.index(source,TemplateUtils.CHILD_VALUE_PATH);
		this.values=TemplateUtils.index(source,'value');
		this.forBody=TemplateUtils.index(source,TemplateUtils.FOR_VALUE_PATH);
		var self=this;
		if(this.isInputChild()){
			this.inputType=TemplateUtils.index(source,TemplateUtils.INPUT_TYPE_INDEX_PATH).toUpperCase();
			if(this.inputType.toUpperCase()=="LIST" || this.inputType.toUpperCase()=="DATALIST"){
				//todo:implement list value
				this.value=this.values[0]._;
			}else if(this.inputType.toUpperCase()=="BOOLEAN"){
				this.value=this.value=='true';
			}else if(this.inputType.toUpperCase()=="EXCEL"){
				this.value='';
			}
		}else if(this.sourceT.toUpperCase()=='OUT'){
			this.loadObjTemplate();
		}else{
			this.dataSource.lookingObj(this.absolutePath,this.value,function(object){
				self.initObjtemplate(object,self.absolutePath);
			});
		}
	}
	isInputChild(){
		return this.type.toUpperCase()=='INPUT';
	}
	loadObjTemplate(){
		var self=this;
		this.dataSource.loadObjTemplate(this.rootFolder,this.value,self.name,function(object){
			self.initObjtemplate(object,path.join(self.rootFolder,self.value));
		});
			
	}
	initObjtemplate(source,absolutePath){
		this.objTemplate=new ObjectTemplate(this.createDataInit(source,null,absolutePath));
	}
	createUI(){
		super.createUI();
		if(this.isInputChild()){
			this.generateInput();
		}else{
			this.objTemplate.createUI();
		}
	}
	generateInput(){
	}
	generateOutput(){
		if(this.isInputChild()){
			if(this.inputType.toUpperCase()=='EXCEL'){
				var result= this.parseExcelOutput();
				return result;
			}else if(this.validInput()){
				var value=this.getValueInput();
				/*
				if(this['parse-script']!==undefined){
					var script_execute='function exe(it){'+this['parse-script']+'} exe("'+value.replace(new RegExp('\'','g'),'\\\"').replace(new RegExp('\"','g'),'\\\"')+'");';
					value=eval(script_execute);
				}*/
				return value;
			}
			return;
		}else {
			return this.objTemplate.generateOutput();
			//return this.value;
		}
	}

	parseExcelOutput(){
		var workbook=this.value[0];
		var sheetName1=workbook.SheetNames[0];
		var result=[];
		var rows=[];
		for(var cell in workbook.Sheets[sheetName1]){
			var find_column='';
			var find_row=0;
			for(var i=0;i<cell.length;i++){
				if(!isNaN(cell[i])){
					find_row=cell.substring(i)*1;
					find_column=cell.replace(find_row,'');
					break;
				}
			}
			if(find_row==0 || find_column=='') continue;
			if(rows[find_row]===undefined) rows[find_row]={};
			rows[find_row][find_column]=workbook.Sheets[sheetName1][cell].v;
		}
		var box=[];
		var pack=[];
		var empty_count=0;
		for(var i=0;i<rows.length;i++){
			var c_row=rows[i];
			if(c_row!==undefined){
				pack.push(c_row);
			}
			if(c_row===undefined){
				empty_count+=1
			}
			if(empty_count==2 || (c_row===undefined && pack.length>0)){
				box.push(pack)
				pack=[];
				empty_count=0;
			}
		}
		box.push(pack);
		result=box;
		return result;
	}

	generateOutputExt(it,key){
		if(this.isInputChild()){
			/*
			if(this.validInput()){
				return this.getValueInput();
			}*/
			return;
		}else{
			return this.objTemplate.generateOutputExt(it,key);
		}
	}

	getValueInput(){
		//todo1:implement get value input
		this.UIControl._component.gatherValue();
		return this.value;
	}
	
	validInput(){
		//todo1:implement valid Input value
		return true;
	}
}

const classesMapping = {
	'ObjectTemplate': ObjectTemplate,
	'ChildWrapper': ChildWrapper
}

export class TemplateFactory{
	constructor(options){
		this.source=options.source;
		this.containerId=options.containerId;
		this.rootFile=options.rootFile;
		this.factoryUI=options.factoryUI;
		this.dataSource=options.dataSource;
		this['UIControl']=this.factoryUI;
		this.level=0;
		this.initRootTemplate();
	}
	initRootTemplate(){
		var templateXmlList = this.extractTemplateList(this.source);
		this.templateMap={};
		this.templateKeys=[];
		for(var i=0;i<templateXmlList.length;i++){
			var template=new RootTemplate({source:templateXmlList[i]
				,rootFolder:this.getRootFolder()
				,containerId:this.containerId
				,parent:this
				,factoryUI:this.factoryUI
				,dataSource:this.dataSource});
			this.templateMap[template.name]=template;
			this.templateKeys.push(template.name);
		}
		this.onTemplateSelectChanged=function(o){
			o.createUI();
		}
	}
	getRootFolder(){
		//extract root folder from this.rootFile
		var root = path.dirname(this.rootFile);
		return root;
	}
	extractTemplateList(source){
		var templateXmlList=[];
		templateXmlList=TemplateUtils.index(source,TemplateUtils.TEMPLATE_LIST_INDEX_PATH);
		//parse to list template source xml
		return templateXmlList;
	}
	setFactoryUI(factoryUI){
		// this.factoryUI=factoryUI;
		// for(var key in this.templateMap){
		// 	this.templateMap[key].setFactoryUI(this.factoryUI);
		// }
	}
	createUI(){
	}
	buildSelectEntity(){
		var sltHtml='<select class="template-select">';
		var map=this.templateMap;
		for(var key in map){
			sltHtml+='<option>'+key+'</option>';
		}
		sltHtml+='</select>';
		return sltHtml;
	}
	onTemplateSelectChanged(o){
		this.onTemplateSelectChanged && this.onTemplateSelectChanged(o);
	}
}

export function selectFile(arr,factoryUI){
	var defaultPath=process.mainModule.paths[0].split('node_modules')[0].slice(0, -1);
	dialog.showOpenDialog((fileNames) => {
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
        //console.log("The file content is : " + data);
		parseString(data.toString(), function (err, result) {
			var factory=new TemplateFactory({rootFile:fileNames[0],source:result
				,containerId:'slt-entity-container'
				,factoryUI:factoryUI
				,dataSource:new DataSource({rootFile:fileNames[0]})});
			factory.test='Success';
			//factory.createUI();
			 arr.push(factory);
		});
    });
});
}

export function selectFileExcel(arr,factoryUI){
	dialog.showOpenDialog({
		title: "Select Root Template File", 
		filters: [{
			name: "Spreadsheets",
			extensions: "xls|xlsx|xlsm|xlsb|xml|xlw|xlc|csv|txt|dif|sylk|slk|prn|ods|fods|uos|dbf|wks|123|wq1|qpw|htm|html".split("|")
		}]
},(fileNames) => {
    // fileNames is an array that contains all the selected
    if(fileNames === undefined){
        console.log("No file selected");
        return;
		}
		arr.push(XLSX.readFile(fileNames[0]));
		factoryUI.GTModel.value=arr;
	console.log(fileNames);
	});
}


class DataSource{
	constructor(options){
		this.options=options;
		this.lstObj={};
	}

	loadTemplate(rootFolder,templatePath,onSuccess){
		var absolutePath = path.join(rootFolder,templatePath) 
		fs.readFile(absolutePath, 'utf-8', (err, data) => {
			if(err){
				alert("An error ocurred reading the file :" + err.message);
				return;
			}
			if(onSuccess!==undefined) onSuccess(data);
		});
	}

	findObjectInList(folder,relativeFileName,objName,onSuccess){
		var absolutePath = path.join(folder,relativeFileName) 
		var find=this.lstObj[absolutePath];
		if(find===undefined) this.loadObjsFromFile(absolutePath,objName,onSuccess);
		else this.lookingObj(absolutePath,objName,onSuccess);
	}

	loadObjsFromFile(absolutePath,objName,onSuccess){
		var self=this;
		fs.readFile(absolutePath, 'utf-8', (err, data) => {
			if(err){
				alert("An error ocurred reading the file :" + err.message);
				return;
			}
			parseString(data, function (err, result) {
				var objects=result.objects.object;
				self.lstObj[absolutePath]=objects;
				self.lookingObj(absolutePath,objName,onSuccess);
			});
			return ;
		});
	}

	lookingObj(absolutePath,objName,onSuccess){
		var lstObjs=this.lstObj[absolutePath]
		for(var i=0;i<lstObjs.length;i++){
			if(lstObjs[i].$.name==objName){
				onSuccess(lstObjs[i]);
				break;
			}
		}
	}

	loadObjTemplate(folder,relativeFileName,objName,onSuccess){
		this.findObjectInList(folder,relativeFileName,objName,onSuccess);
	}
}

export function gentoolstest(){
	selectFile();
}