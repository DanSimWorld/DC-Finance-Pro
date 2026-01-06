import { TestBed } from '@angular/core/testing';

import { HoursService } from './hours.service';

describe('HoursService', () => {
  let service: HoursService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HoursService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
