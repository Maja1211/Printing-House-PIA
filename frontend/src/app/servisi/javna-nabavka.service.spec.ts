import { TestBed } from '@angular/core/testing';

import { JavnaNabavkaService } from './javna-nabavka.service';

describe('JavnaNabavkaService', () => {
  let service: JavnaNabavkaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(JavnaNabavkaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
