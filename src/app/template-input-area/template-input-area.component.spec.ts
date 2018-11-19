import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TemplateInputAreaComponent } from './template-input-area.component';

describe('TemplateInputAreaComponent', () => {
  let component: TemplateInputAreaComponent;
  let fixture: ComponentFixture<TemplateInputAreaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TemplateInputAreaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TemplateInputAreaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
