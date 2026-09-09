import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Klijent } from './klijent';

describe('Klijent', () => {
  let component: Klijent;
  let fixture: ComponentFixture<Klijent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Klijent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Klijent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
