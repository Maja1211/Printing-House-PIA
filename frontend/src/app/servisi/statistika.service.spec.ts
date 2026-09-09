import { TestBed } from '@angular/core/testing';

import { Statistika } from './statistika.service';

describe('Statistika', () => {
  let service: Statistika;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Statistika);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
