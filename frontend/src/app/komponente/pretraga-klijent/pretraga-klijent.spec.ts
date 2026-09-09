import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PretragaKlijent } from './pretraga-klijent';

describe('PretragaKlijent', () => {
  let component: PretragaKlijent;
  let fixture: ComponentFixture<PretragaKlijent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PretragaKlijent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PretragaKlijent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
