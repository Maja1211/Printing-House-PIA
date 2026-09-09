import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class KorpaService {

  constructor() { }

  dohvatiKorpu(): any[] {

    const podatak = localStorage.getItem("korpa");

    if (podatak == null) {
      return [];
    }

    return JSON.parse(podatak);
  }


  dodaj(stavka: any) {

    const korpa = this.dohvatiKorpu();

    korpa.push(stavka);

    localStorage.setItem(
      "korpa",
      JSON.stringify(korpa)
    );
  }


  obrisi(index: number) {

    const korpa = this.dohvatiKorpu();

    korpa.splice(index, 1);

    localStorage.setItem(
      "korpa",
      JSON.stringify(korpa)
    );
  }


  isprazni() {
    localStorage.removeItem("korpa");
  }
}