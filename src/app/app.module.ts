import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import {NgxElectronModule} from 'ngx-electron';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SelectTemplateComponent } from './select-template/select-template.component';
import { TemplateFactoryComponent } from './template-factory/template-factory.component';
import { TemplateManagerComponent } from './template-manager/template-manager.component';
import { TemplateBuildingComponent } from './template-building/template-building.component';
import { TemplateInputAreaComponent } from './template-input-area/template-input-area.component';
import { TemplateOutputAreaComponent } from './template-output-area/template-output-area.component';
import { TemplateRegionComponent } from './template-region/template-region.component';
import { DynCompServiceService } from './dyn-comp-service.service';
import { TemplateInputDataComponent } from './template-input-data/template-input-data.component';
import { SelectDropDownModule } from 'ngx-select-dropdown';

@NgModule({
  declarations: [
    AppComponent,
    SelectTemplateComponent,
    TemplateFactoryComponent,
    TemplateManagerComponent,
    TemplateBuildingComponent,
    TemplateInputAreaComponent,
    TemplateOutputAreaComponent,
    TemplateRegionComponent,
    TemplateInputDataComponent
  ],
  imports: [
    BrowserModule,
    NgxElectronModule,
    AppRoutingModule,
    FormsModule,
    SelectDropDownModule
  ],
  providers: [DynCompServiceService],
  bootstrap: [AppComponent],
  entryComponents:[TemplateRegionComponent,TemplateInputDataComponent]
})
export class AppModule { }
