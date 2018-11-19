import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TemplateFactoryComponent } from './template-factory.component';

describe('TemplateFactoryComponent', () => {
  let component: TemplateFactoryComponent;
  let fixture: ComponentFixture<TemplateFactoryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TemplateFactoryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TemplateFactoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
