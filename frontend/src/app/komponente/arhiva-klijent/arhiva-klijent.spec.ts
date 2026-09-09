import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ArhivaKlijent } from './arhiva-klijent';

describe('ArhivaKlijent', () => {
  let component: ArhivaKlijent;
  let fixture: ComponentFixture<ArhivaKlijent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ArhivaKlijent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ArhivaKlijent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
