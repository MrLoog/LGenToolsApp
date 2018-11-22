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

class XMLTemplate{
	constructor(options){
		var source=this.source=options.source;
		this.options=options;
		this.rootFolder=options.rootFolder;
		this.containerId=options.containerId;
		this.myWrapperId=TemplateUtils.getUniqueID();
		this.parent=this.parentModel=options.parent;
		this.factoryUI=options.factoryUI;
		this.dataSource=options.dataSource;
		this.level=this.parent.level+1;
	}
	setUIControl(uiControl){
		this.UIControl=uiControl;
	}
	createDataInit(source,wrapperId){
		if(source===undefined){
			source={rootFolder:this.rootFolder
				,containerId:this.containerId
				,parent:this
				,factoryUI:this.factoryUI
				,dataSource:this.dataSource};
		}
		return {source:source
			,rootFolder:this.rootFolder
			,containerId:typeof wrapperId==='undefined'?this.myWrapperId:wrapperId
			,parent:this
			,factoryUI:this.factoryUI
			,dataSource=this.dataSource};
	}
	createUI(){
		if(this['UIControl']===undefined){
			this['UIControl']=this.factoryUI.buildUIControl(this,this.parentModel);
		}
		//this['UIControl'].createUI();
		//this.getContainer().append('<div class="'+this.getClassCss()+'" id="'+this.myWrapperId+'"></div>');
	}
	generateUI(){
		throw new Error('You have to implement the method doSomething!');
	}
	isMultiTemplate(){
		//todo1:implement check multi template
		return false;
	}
	
	generateSelectTemplate(){
		//todo1:build html selected
		//todo1:add event on template selected
	}
	generateInput(){
		//todo1:implement generate input
		throw new Error('You have to implement the method doSomething!');
	}
	generateOutput(){
		throw new Error('You have to implement the method doSomething!');
	}
	getContainer(){
		return $('#'+this.containerId);
	}
	getMyWrapper(){
		return $('#'+this.myWrapperId);
	}
	cloneNew(){
		// var myObject = window[this.constructor.name];
		// var MyClass = this.stringToFunction(this.constructor.name);
		var myObject = new classesMapping[this.constructor.name](this.options);
		return myObject;
	}
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
	getClassCss(){
		return 'lgt-template';
	}
	setFactoryUI(factoryUI){
		this.factoryUI=factoryUI;
	}
	getTypeTemplate(){
		if(this instanceof inputUI){
			return 'input';
		}
		return 'object';
	}
}

var myModuleUI={};
myModuleUI.InputValueUI=class InputValueUIFactory{
	constructor(options){
		this.options=options;
		this.inputType=options.inputType;
		this.containerId=options.containerId;
		this.viewId=options.viewId;
		this.buildUI();
	}
	buildUI(){
		if(this.inputType.toUpperCase()=='TEXT'){
			this.inputUI=new InputTextUI(this.options);
		}else if(this.inputType.toUpperCase()=='BOOLEAN'){
			this.inputUI=new InputBooleanUI(this.options);
		}else if(this.inputType.toUpperCase()=='LIST'){
			this.inputUI=new InputListUI(this.options);
		}
		else{
			this.inputUI=new InputUI(this.options);
		}
		this.inputUI.buildUI();
	}
	getValue(){
		return this.inputUI.getValue();
	}
}

class InputUI extends XMLTemplate{
	constructor(options){
		super(options);
		this.options=options;
		this.inputType=options.inputType;
		this.containerId=options.containerId;
		this.viewId=options.viewId;
		this.value=options.value[0];
		this.values=options.value;
	}
	buildUI(){
		//do nothing
	}
	getValue(){
		return this.value;
	}
	getContainer(){
		return $('#'+this.containerId);
	}
	buildCommonClass(){
		return 'lgt-inputUI'
	}
}

 class InputTextUI extends InputUI{
	constructor(options){
		super(options);
	}
	buildUI(){
		var $container=this.getContainer();
		$container.append('<input type="text" class="'+this.buildCommonClass()+'" id="'+this.viewId+'"  value="'+this.value+'"/>');
	}
	getValue(){
		return $('#'+this.viewId).val();
	}
}

class InputBooleanUI extends InputUI{
	constructor(options){
		super(options);
	}
	buildUI(){
		var $container=this.getContainer();
		$container.append('<input type="checkbox" class="'+this.buildCommonClass()+'" id="'+this.viewId+'"  '+(this.value.toUpperCase()=='TRUE'?'checked':'')+'/>');
	}
	getValue(){
		return $('#'+this.viewId).prop('checked');
	}
}

class InputListUI extends InputUI{
	constructor(options){
		super(options);
	}
	buildUI(){
		var $container=this.getContainer();
		var html='<select class="'+this.buildCommonClass()+'" id="'+this.viewId+'">'
		for(var i=0;i<this.values.length;i++){
			html+='<option value="'+(this.values[i]._===undefined?'':this.values[i]._)+'" '+(i==0?'selected="selected"':'')+'>'+this.values[i].$.alias+'</option>'
		}
		html+='</select>'
		$container.append(html);
	}
	getValue(){
		return $('#'+this.viewId+' option:selected').val();
	}
}

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
		template=template.replace(new RegExp('\n','g'),'{{=it.SYSTEM_NEWLINE}}');
		template=template.replace(new RegExp(' ','g'),'{{=it.SYSTEM_SPACE}}');
		template=template.replace(new RegExp('\t','g'),'{{=it.SYSTEM_TAB}}');
		template=template.replace(new RegExp('@','g'),'SYSTEM_KEEP_TO'); //@
		data.SYSTEM_NEWLINE='\n';
		data.SYSTEM_SPACE=' ';
		data.SYSTEM_TAB='\t';
		// 1. Compile template function
		var tempFn = apiDot.template(template);
		// 2. Use template function as many times as you like
		var resultText = tempFn(data);
		resultText=resultText.replace(new RegExp('SYSTEM_KEEP_TO','g'),'@'); //@
		return resultText;
	}
}



//constant Body Object
TemplateUtils.BODY_VALUE_INDEX_PATH='0.value.0._';
TemplateUtils.BODY_TYPE_INDEX_PATH='0.value.0.$.type';
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
TemplateUtils.INPUT_TYPE_INDEX_PATH='$.inputType';

TemplateUtils.CHILD_VALUE_PATH='value.0';


class BodyObject extends XMLTemplate{
	constructor(options){
		//todo:implement body
		super(options);
		var source=this.source;
		// this.templatePath=TemplateUtils.index(source,TemplateUtils.BODY_VALUE_INDEX_PATH);
		// this.type=TemplateUtils.index(source,TemplateUtils.BODY_TYPE_INDEX_PATH);
		// this.repeat=TemplateUtils.index(source,TemplateUtils.BODY_REPEAT_INDEX_PATH);
		// this.stepRepeat=TemplateUtils.index(source,TemplateUtils.BODY_SREPEAT_INDEX_PATH);
		this.bodySource=TemplateUtils.index(source,TemplateUtils.BODY_ARRAY_INDEX_PATH);
		//this.rootFolder=options.rootFolder;
		this.parent=options.parent;
		//this.containerId=options.containerId;
		// this.loadTemplate();
		//init control property
		// this.curRepeat=1;
		this.childWrapperId=TemplateUtils.getUniqueID();//wrapper id for contain global child ui
		this.initBodyValues();
	}
	loadTemplate(){
		var self=this;
		if(this.type.toUpperCase()=='IN'){
			self.parent.template=self.template=self.templatePath;
		}else if (this.type.toUpperCase()=='OUT'){
			var absolutePath = path.join(self.rootFolder,self.templatePath) 
			fs.readFile(absolutePath, 'utf-8', (err, data) => {
				if(err){
					alert("An error ocurred reading the file :" + err.message);
					return;
				}
				self.parent.template=self.template=data;
			});
		}
	}
	getTemplate(){
		return this.template;
	}
	generateCtrl(){
		//todo:generate control ui
		var self=this;
		if(this.repeat!==undefined){
			var repeatBtnId=TemplateUtils.getUniqueID();
			this.getMyWrapper().append('<input type="button" value="Add More Template" id="'+repeatBtnId+'"/>');
			$('#'+repeatBtnId).click(function(){
				self.ctrlDoRepeat();
			});
		}
	}
	createUI(){
		super.createUI();
		this.generateChildUI();//todo:generate global child 
		for(var key in this.bodyValues){
			this.bodyValues[key].createUI();
		}
		// this.generateCtrl();
	}
	ctrlDoRepeat(){
		if(this.stepRepeat===undefined) this.stepRepeat=1;
		// this.parent.makeClone(this.stepRepeat);
		this.parent.buildRepeat(this.stepRepeat);
		this.curRepeat++;
	}
	getClassCss(){
		return super.getClassCss()+' '+'lgt-body';
	}
	setChilds(childs){
		this.childs=childs;//contain all childs
		this.bodyChilds=[];//contain only body value share childs
		for(var i=0;i<this.childs.length;i++){
			var aChild=this.childs[i];
			if(aChild.forBody!==undefined){
				this.bodyValues[aChild.forBody].addChild(aChild);
			}else{
				//aChild.containerId=this.childWrapperId;
				aChild.parentModel=this;
				this.bodyChilds.push(aChild);
			}
		}
	}
	initBodyValues(){
		//todo: init body value object
		this.bodyValues={};
		for(var i=0;i<this.bodySource.length;i++){
			var source=this.bodySource[i];
			if(source.$.type.toUpperCase()=='STRUCT'){
				this.bodyStruct=new BodyStruct(this.createDataInit(source));
				this.bodyStruct.stt=i;
			}else{
				var bodyPart=new BodyPart(this.createDataInit(source));
				this.bodyValues[bodyPart.name]=bodyPart;
				bodyPart.stt=i;
			}
		}
	}
	generateOutput(){
		var body='';
		this.bodyStruct.startBuilding()
		//build from body part
		var data={};
		for(var key in this.bodyValues){
			// this.bodyStruct.replaceChildIntoTemplate(this.bodyValues[key].key,this.bodyValues[key].generateOutput());
			data[this.bodyValues[key].key]=this.bodyValues[key].generateOutput();
		}
		//build from child input share
		for(var i=0;i<this.bodyChilds.length;i++){
			// this.bodyStruct.replaceChildIntoTemplate(this.bodyChilds[i].key,this.bodyChilds[i].generateOutput());
			data[this.bodyChilds[i].key]=this.bodyChilds[i].generateOutput();
		}
		
		// body=this.bodyStruct.generateOutput();
		body=TemplateUtils.replaceTemplate(this.bodyStruct.templateO,data);
		return body;
	}
	getStructBody(){
		//todo:return struct body
	}
	generateChildUI(){
		this.getMyWrapper().append('<div class="lgt-childs-content" id="'+this.childWrapperId+'"></div>'); //append wrapper for global child ui
		for(var i=0;i<this.bodyChilds.length;i++){
			this.bodyChilds[i].createUI();
		}
	}
}

class BodyRow extends XMLTemplate{
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

class BodyValue extends XMLTemplate{
	constructor(options){
		super(options);
		var source=options.source;
		this.key=TemplateUtils.index(source,'$.key');
		this.templatePath=TemplateUtils.index(source,'_');
		this.type=TemplateUtils.index(source,'$.type');
		this.childs=[];
		this.bodyRow=new BodyRow(this.createDataInit(this.source));
		this.bodyRow.stt=0;
		this.bodyRows=[];
		this.childWrapperId=TemplateUtils.getUniqueID();
		this.loadTemplate();
	}
	loadTemplate(){
		var self=this;
		if(this.type.toUpperCase()=='IN' || this.type.toUpperCase()=='STRUCT'){
			// self.parent.template=self.template=self.templatePath;
			self.template=self.templatePath;
		}else if (this.type.toUpperCase()=='OUT'){
			var absolutePath = path.join(self.rootFolder,self.templatePath) 
			fs.readFile(absolutePath, 'utf-8', (err, data) => {
				if(err){
					alert("An error ocurred reading the file :" + err.message);
					return;
				}
				// self.parent.template=self.template=data;
				self.template=data;
			});
		}
	}
	createUI(){
		super.createUI();
	}
	addChild(aChild){
		//aChild.containerId=this.childWrapperId;
		this.bodyRow.addChild(aChild);
		this.childs.push(aChild);
	}
	generateOutput(){
		//todo: body value generate output
	}
	generateChildUI(){
		this.getMyWrapper().append('<div class="lgt-childs-content" id="'+this.childWrapperId+'"></div>'); //append wrapper for child
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

class BodyMulti extends BodyObject{

	constructor(options){
		super(options);
		this.initBodyParts();
	}

	initBodyParts(){

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
		}
		if(TemplateUtils.index(this.source,'$.shadowFrom')!==undefined){
			var shadowCtrl=new ShadowCtrl(this.createDataInit(this.source));
			this.ctrlObjs.push(shadowCtrl);
		}
	}
	
	generateOutput(clear){
		this.startBuilding();
		var data={};
		for(var i=0;i<this.childs.length;i++){
			// this.replaceChildIntoTemplate(this.childs[i].key,this.childs[i].generateOutput());
			data[this.childs[i].key]=this.childs[i].generateOutput();
		}
		this.templateO=TemplateUtils.replaceTemplate(this.templateO,data);
		for(var i=0;i<this.ctrlObjs.length;i++){
			this.ctrlObjs[i].generateOutput();
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
	
	
	buildRepeat(number){
		if(this.childsRepeat===undefined){
			this.childsRepeat=[];
		}
		var self=this;
		var number = number*1;
		var curRepeat=this.childsRepeat.length;
		for(var i=curRepeat;i<(curRepeat+number);i++){
			var divId=TemplateUtils.getUniqueID();
			var bodyRow=this.cloneChilds(divId)
			bodyRow.repeatIndex=i;
			bodyRow.stt=i+1;
			var repeat=this.childsRepeat[i]=bodyRow.childs;
			
			//this.buildChild(this.childSource,this.childsRepeat[i]);
			// $('#'+this.childWrapperId).append('<div id="'+divId+'" class="lgt-row-child"></div>');
			for(var j=0;j< this.childsRepeat[i].length;j++){
				this.childsRepeat[i][j].createUI();
			}
			// var btnRemoveId=TemplateUtils.getUniqueID();
			// $('#'+divId).append('<input type="button" value="Remove This Row" id="'+btnRemoveId+'"/>');
			// (function(repeat,btnRemoveId,divId,self){
			// 	$('#'+btnRemoveId).click(function(){
			// 		var index=self.childsRepeat.indexOf(repeat);
			// 		self.childsRepeat.splice(index, 1);
			// 		$('#'+divId).remove();
			// 	});
			// })(repeat,btnRemoveId,divId,self);
		}
	}
	
	removeBodyRow(bodyRow){
		var index=bodyRow.repeatIndex*1;
		this.childsRepeat.splice(index, 1);
		this.bodyRows.splice(index, 1);
	}
	
	cloneChilds(childDivId){
		var childs=[];
		var bodyRow=new BodyRow(this.createDataInit(this.source));
		bodyRow.childs=childs;
		this.bodyRows.push(bodyRow);
		bodyRow.createUI();
		for(var i=0;i<this.childs.length;i++){
			var aChild=new ChildWrapper(this.createDataInit(this.childs[i].source));
			aChild.setFactoryUI(this.factoryUI);
			childs.push(aChild);
			aChild.stt=i;
			bodyRow.addChild(aChild);
			aChild.containerId=childDivId;
		}
		return bodyRow;
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
	}
	createUI(){
		super.createUI();
		var self=this;
		var $wrapper=self.getMyWrapper();
			self.btnCtrlId=TemplateUtils.getUniqueID();
			$wrapper.append('<input type="button" value="Generate Repeat" id="'+self.btnCtrlId+'"/>');
			$('#'+self.btnCtrlId).click(function(){
				self.makeRepeat();
			});
	}
	makeRepeat(){
		if(this.stepRepeat===undefined) this.stepRepeat=1;
		// this.parent.makeClone(this.stepRepeat);
		this.parent.buildRepeat(this.stepRepeat);
		this.curRepeat++;
	}
	
	generateOutput(){
		var curOutput=this.parent.templateO;
		var parent=this.parent;
		if (parent.childsRepeat===undefined) return;
		for(var j=0;j<parent.childsRepeat.length;j++){
				this.parent.startBuilding();
				var data={};
				for(var i=0;i<parent.childsRepeat[j].length;i++){
					// parent.replaceChildIntoTemplate(parent.childsRepeat[j][i].key,parent.childsRepeat[j][i].generateOutput());
					data[parent.childsRepeat[j][i].key]=parent.childsRepeat[j][i].generateOutput();
				}
				parent.templateO=TemplateUtils.replaceTemplate(parent.templateO,data);
			curOutput+=parent.templateO;
		}
		parent.templateO=curOutput;
	}
}

class ShadowCtrl extends CtrlView{
	constructor(options){
		super(options);
		var source=this.source;
		this.shadowFrom=TemplateUtils.index(source,'$.shadowFrom'); 
	}
	createUI(){
		//no UI
	}
	generateOutput(){
		var parent=this.parent;
		var targetShadow=parent.parent.bodyValues[this.shadowFrom];
		//todo: shadow default output
		parent.startBuilding();
		var data={};
		for(var i=0;i<targetShadow.childs.length;i++){
			var aChild=targetShadow.childs[i];
			// parent.replaceChildIntoTemplate(aChild.key,aChild.generateOutput());
			data[aChild.key]=aChild.generateOutput();
		}
		parent.templateO=TemplateUtils.replaceTemplate(parent.templateO,data);
		//todo: shadow repeat output
		var output=parent.templateO;
		
		if (targetShadow.childsRepeat===undefined) return;
		//var repeatCount=targetShadow.childsRepeat.length;
		for(var j=0;j<targetShadow.childsRepeat.length;j++){
			parent.startBuilding();
			for(var i=0;i<targetShadow.childsRepeat[j].length;i++){
				// parent.replaceChildIntoTemplate(targetShadow.childsRepeat[j][i].key,targetShadow.childsRepeat[j][i].generateOutput());
				data[targetShadow.childsRepeat[j][i].key]=targetShadow.childsRepeat[j][i].generateOutput();
			}
			parent.templateO=TemplateUtils.replaceTemplate(parent.templateO,data);
			output+=parent.templateO;
		}
		parent.templateO=output;
		return output;
	}
}

class Template extends XMLTemplate{
	constructor(options){
		super(options);
		var source=this.source=options.source;
		if(TemplateUtils.index(source,TemplateUtils.BODY_INDEX_PATH)!=undefined){
			// this.body=new BodyObject({source:TemplateUtils.index(source,TemplateUtils.BODY_INDEX_PATH),rootFolder:options.rootFolder,parent:this,containerId:this.wrapperId});
			this.body=new BodyObject(this.createDataInit(TemplateUtils.index(source,TemplateUtils.BODY_INDEX_PATH)));
			this.body.setFactoryUI(this.factoryUI);
			console.log(this.body);
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
			aChild.setFactoryUI(this.factoryUI);
			aChild.stt=i;
			arrChilds.push(aChild);
		}
		//have child -> mush have body
		this.body.setChilds(arrChilds);
	}
	//demo index function
	// > obj = {a:{b:{etc:5}}}
	// > index(obj,'a.b.etc')
	// 5
	// > index(obj,['a','b','etc'])   #works with both strings and lists
	// 5
	/*index(obj,is, value) {
		if (typeof is == 'string')
			return this.index(obj,is.split('.'), value);
		else if (is.length==1 && value!==undefined)
			return obj[is[0]] = value;
		else if (is.length==0)
			return obj;
		else
			return this.index(obj[is[0]],is.slice(1), value);
	}*/
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
		var $myWrapper=this.getMyWrapper();
		this.btnBuildId=TemplateUtils.getUniqueID();
		$myWrapper.append('<input type="button" id="'+this.btnBuildId+'"  value="Build Template '+this.name+'" />');
		$('#'+this.btnBuildId).click(function(){
			self.showBuildTemplate();
		});
	}
	showBuildTemplate(){
		//alert(this.generateOutput());
		TemplateUtils.showResult(this.generateOutput());
	}
	generateOutput(){
		return this.body.generateOutput();
	}
	
	getBuildingTemplate(){
		//implement get template
		if(this.templateO===undefined){
			this.templateO=this.template;
		}
		return this.templateO;
	}
	replaceChildIntoTemplate(template,key,value){
		//implement replace child into template
		// var specialC='[\\^$.|?*+()';
		// for(var i=0;i<specialC.length;i++){
			// key=key.replace(new RegExp('\\'+specialC[i],'g'),'\\'+specialC[i]);
			
		// }
		var tempO=template.replace(new RegExp(key,'g'),value);
		//save template to current building template
		this.templateO=tempO;
	}
	generateChildUI(){
		//todo:implement generate child of selected template
		
		$('#'+this.childWrapperId).append('<div id="'+this.childs.arrChildsDiv+'" class="lgt-row-child"></div>');
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
	makeClone(number){
		for(var i=0;i<number;i++){
			this.parent.makeClone();
		}
	}
	addChild(aChild){
		this.childs.push(aChild);
		setTimeout(function(){ aChild.createUI(); }, 3000);
	}
	getClassCss(){
		return super.getClassCss()+' '+'lgt-xml';
	}
}


class ObjectTemplate extends Template{
	constructor(options){
		super(options);
		this.buildable=true;
	}
}

class RootTemplate extends Template{
	constructor(options){
		super(options);
		this.buildable=true;
	}
	createUI(){
		super.createUI();
		var self=this;
		var btnRemoveId=TemplateUtils.getUniqueID();
		this.getMyWrapper().prepend('<input type="button" value="Remove Template '+this.name+'" id="'+btnRemoveId+'"/>');
		$('#'+btnRemoveId).click(function(){
			self.getMyWrapper().remove();
		});
	}
}

class ChildWrapper extends XMLTemplate{
	constructor(options){
		super(options);
		var source=this.source=options.source;
		this.name=TemplateUtils.index(source,TemplateUtils.NAME_INDEX_PATH);
		this.key=TemplateUtils.index(source,TemplateUtils.KEY_INDEX_PATH);
		this.type=TemplateUtils.index(source,TemplateUtils.TYPE_INDEX_PATH);
		this.value=TemplateUtils.index(source,TemplateUtils.CHILD_VALUE_PATH);
		this.values=TemplateUtils.index(source,'value');
		this.forBody=TemplateUtils.index(source,TemplateUtils.FOR_VALUE_PATH);
		if(this.isInputChild()){
			this.inputType=TemplateUtils.index(source,TemplateUtils.INPUT_TYPE_INDEX_PATH);
			if(this.inputType.toUpperCase()=="LIST"){
				//todo:implement list value
				this.value=this.values[0]._;
			}else if(this.inputType.toUpperCase()=="BOOLEAN"){
				this.value=this.value=='true';
			}
		}else if(this.type.toUpperCase()=='OUT'){
			this.loadObjTemplate();
		}
	}
	isInputChild(){
		return this.type.toUpperCase()=='INPUT';
	}
	loadObjTemplate(){
		var self=this;
			var absolutePath = path.join(this.rootFolder,this.value) 
			fs.readFile(absolutePath, 'utf-8', (err, data) => {
				if(err){
					alert("An error ocurred reading the file :" + err.message);
					return;
				}
				parseString(data, function (err, result) {
					var objects=result.objects.object;
					for(var i=0;i<objects.length;i++){
						if(objects[i].$.name==self.name){
							self.initObjtemplate(objects[i]);
							break;
						}
					}
				});
				return ;
		});
	}
	initObjtemplate(source){
		this.objTemplate=new ObjectTemplate(this.createDataInit(source));
	}
	createUI(){
		super.createUI();
		if(this.type.toUpperCase()=='OUT'){
			this.objTemplate.createUI();
		}else{ 
			if(this.isInputChild()){
				this.generateInput();
			}
		}
	}
	generateInput(){
		var $container=this.getContainer();
		this.inputViewId=TemplateUtils.getUniqueID();
		this.inputValueUI=new myModuleUI.InputValueUI({inputType:this.inputType,containerId:this.myWrapperId,viewId:this.inputViewId,value:this.values,parent:this});
		// if(this.inputType.toUpperCase()=='TEXT'){
			// $container.append('<input type="text" id="'+this.inputViewId+'"  value="'+this.value+'">');
		// }
	}
	generateOutput(){
		if(this.isInputChild()){
			if(this.validInput()){
				return this.getValueInput();
			}
			return;
		}else if(this.type.toUpperCase()=='IN'){
			return this.value;
		}
		else{
			return this.objTemplate.generateOutput();
		}
	}
	getValueInput(){
		//todo1:implement get value input
		return this.value;
	}
	
	validInput(){
		//todo1:implement valid Input value
		return true;
	}
	makeClone(){
		this.parent.addChild(this.cloneNew());
	}
	getClassCss(){
		var css='lgt-child-wrapper';
		if(this.isInputChild()){
			css+=' '+'lgt-wrapper-input'
		}
		return super.getClassCss()+' '+css;
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
		var self=this;
		var $container=$('#'+this.containerId);
		$container.html(this.buildSelectEntity());
		this.templateId=TemplateUtils.getUniqueID();
		$container.append('<div  class="lgt-temp-factory" id="'+this.templateId+'"></div>');
		$container.find('.template-select').change(function(){
			self.onTemplateSelectChanged(self.templateMap[$container.find('.template-select option:selected').text()]);
		});
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
        console.log("The file content is : " + data);
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

class DataSource{
	constructor(options){
		this.options=options;
	}
}

export function gentoolstest(){
	selectFile();
}
exports.default =InputUI;