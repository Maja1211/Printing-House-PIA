import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetaljiProizvoda } from './detalji-proizvoda';

describe('DetaljiProizvoda', () => {
  let component: DetaljiProizvoda;
  let fixture: ComponentFixture<DetaljiProizvoda>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetaljiProizvoda]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DetaljiProizvoda);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
