import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PripremaProizvoda } from './priprema-proizvoda';

describe('PripremaProizvoda', () => {
  let component: PripremaProizvoda;
  let fixture: ComponentFixture<PripremaProizvoda>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PripremaProizvoda]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PripremaProizvoda);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
