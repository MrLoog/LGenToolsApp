import {
  ComponentFactoryResolver,
  Injectable,
  Inject,
  ReflectiveInjector
} from '@angular/core'

import { TemplateRegionComponent } from './template-region/template-region.component'
import { TemplateInputDataComponent } from './template-input-data/template-input-data.component'
import { INTERNAL_BROWSER_DYNAMIC_PLATFORM_PROVIDERS } from '@angular/platform-browser-dynamic/src/platform_providers';

@Injectable({
  providedIn: 'root'
})
export class DynCompServiceService {
  factoryResolver:any;
  rootViewContainer:any;

  constructor(@Inject(ComponentFactoryResolver) factoryResolver) { 
    this.factoryResolver = factoryResolver
  }

  

  setRootViewContainerRef(viewContainerRef) {
    this.rootViewContainer = viewContainerRef
  }

  addDynamicComponent(name,model) {
    const factory = this.factoryResolver
                        .resolveComponentFactory(TemplateRegionComponent);
    const component = factory
      .create(this.rootViewContainer.parentInjector);
      component.instance[name]=model; 
    this.rootViewContainer.insert(component.hostView);
  }

  createAndAddComponentForModel(model,modelParent){
    console.log('model',model,model.isInputChild&&model.isInputChild());
    var factory = factory = this.factoryResolver
    .resolveComponentFactory(TemplateRegionComponent);
    if(model.constructor.name=='ChildWrapper' && model.isInputChild && model.isInputChild()){
      factory = this.factoryResolver
      .resolveComponentFactory(TemplateInputDataComponent);
    }else if(model.constructor.name=='RootTemplate'){

    }else if(model.constructor.name=='BodyObject'){
    }else if(model.constructor.name=='ChildWrapper'){
    }else if(model.constructor.name=='ObjectTemplate'){
    }else if(model.constructor.name=='BodyPart'){
    }else if(model.constructor.name=='RepeatCtrl'){
    }
    var parentViewRef=modelParent['UIControl'].viewContainerRef!==undefined?modelParent['UIControl'].viewContainerRef:modelParent['UIControl'].instance.viewContainerRef;
    //var parentViewRef=modelParent['UIControl'].instance.viewContainerRef;
    const component = factory
      .create(parentViewRef.parentInjector);
    component.instance['GTModel']=model;
    model['UIControl']=component;
    parentViewRef.insert(component.hostView);
    component.instance['removeMe']=function(){
      parentViewRef.detach(parentViewRef.indexOf(component));
    }
    model.onDestroyUI=function(){
      if(component.instance['removeMe']!==undefined){
        component.instance['removeMe']();
      }
    }
    return component;
  }
}
