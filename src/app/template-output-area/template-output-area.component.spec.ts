import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TemplateOutputAreaComponent } from './template-output-area.component';

describe('TemplateOutputAreaComponent', () => {
  let component: TemplateOutputAreaComponent;
  let fixture: ComponentFixture<TemplateOutputAreaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TemplateOutputAreaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TemplateOutputAreaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
