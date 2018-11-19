import { TestBed } from '@angular/core/testing';

import { AreaResultService } from './area-result.service';

describe('AreaResultService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: AreaResultService = TestBed.get(AreaResultService);
    expect(service).toBeTruthy();
  });
});
