import { TestBed } from '@angular/core/testing';

import { DynCompServiceService } from './dyn-comp-service.service';

describe('DynCompServiceService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: DynCompServiceService = TestBed.get(DynCompServiceService);
    expect(service).toBeTruthy();
  });
});
