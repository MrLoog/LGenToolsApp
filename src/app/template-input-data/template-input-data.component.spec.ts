import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TemplateInputDataComponent } from './template-input-data.component';

describe('TemplateInputDataComponent', () => {
  let component: TemplateInputDataComponent;
  let fixture: ComponentFixture<TemplateInputDataComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TemplateInputDataComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TemplateInputDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
