class AppUI{
	constructor(options){
		
	}
}

module.exports.InputValueUI=class InputValueUIFactory{
	constructor(options){
		this.options=options;
		this.inputType=options.inputType;
		this.containerId=options.containerId;
		this.viewId=options.viewId;
		this.buildUI();
	}
	buildUI(){
		console.log('testInputUI');
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

class InputUI{
	constructor(options){
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