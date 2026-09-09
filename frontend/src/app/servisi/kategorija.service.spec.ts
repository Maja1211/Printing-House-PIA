import { TestBed } from '@angular/core/testing';

import { KategorijaService } from './kategorija.service';

describe('KategorijaService', () => {
  let service: KategorijaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(KategorijaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
