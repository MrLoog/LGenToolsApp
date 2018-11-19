import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TemplateRegionComponent } from './template-region.component';

describe('TemplateRegionComponent', () => {
  let component: TemplateRegionComponent;
  let fixture: ComponentFixture<TemplateRegionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TemplateRegionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TemplateRegionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
