import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JavneNabavke } from './javne-nabavke';

describe('JavneNabavke', () => {
  let component: JavneNabavke;
  let fixture: ComponentFixture<JavneNabavke>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JavneNabavke]
    })
    .compileComponents();

    fixture = TestBed.createComponent(JavneNabavke);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
