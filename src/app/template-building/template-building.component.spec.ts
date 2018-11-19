import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TemplateBuildingComponent } from './template-building.component';

describe('TemplateBuildingComponent', () => {
  let component: TemplateBuildingComponent;
  let fixture: ComponentFixture<TemplateBuildingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TemplateBuildingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TemplateBuildingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
