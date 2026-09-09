import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetaljiKlijent } from './detalji-klijent';

describe('DetaljiKlijent', () => {
  let component: DetaljiKlijent;
  let fixture: ComponentFixture<DetaljiKlijent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetaljiKlijent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DetaljiKlijent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
