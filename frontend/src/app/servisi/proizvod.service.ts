import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Proizvod } from '../models/Proizvod';

@Injectable({
  providedIn: 'root'
})
export class ProizvodService {

  backendUrl = "http://localhost:4000";

  constructor(private http: HttpClient) { }

  top5() {
    return this.http.get<Proizvod[]>(
      `${this.backendUrl}/top5`
    );
  }

  kategorijeAktivnihProizvoda() {
    return this.http.get<string[]>(
      `${this.backendUrl}/kategorijeAktivnihProizvoda`
    );
}

pretraga(naziv: string, kategorija: string) {

    const data = {
      naziv: naziv,
      kategorija: kategorija
    }

    return this.http.post<Proizvod[]>(
      `${this.backendUrl}/pretragaProizvoda`,
      data
    );
}

detalji(sifra: string) {
    return this.http.get<any>(
      `${this.backendUrl}/proizvod/${sifra}`
    );
}

lajkuj(sifra: string, kor_ime: string) {

  return this.http.post<any>(
    `${this.backendUrl}/lajkuj`,
    {
      sifra: sifra,
      kor_ime: kor_ime
    }
  );
}


dislajkuj(sifra: string, kor_ime: string) {

  return this.http.post<any>(
    `${this.backendUrl}/dislajkuj`,
    {
      sifra: sifra,
      kor_ime: kor_ime
    }
  );
}


dodajKomentar(
    sifra: string,
    kor_ime: string,
    tekst: string
) {

  return this.http.post<any>(
    `${this.backendUrl}/dodajKomentar`,
    {
      sifra: sifra,
      kor_ime: kor_ime,
      tekst: tekst
    }
  );
}

proizvodiStamparije(stamparijaId: string) {

  return this.http.get<Proizvod[]>(
    `${this.backendUrl}/proizvodiStamparije/${stamparijaId}`
  );
}


dodajProizvod(data: FormData) {

  return this.http.post<any>(
    `${this.backendUrl}/dodajProizvod`,
    data
  );
}


azurirajKolicinu(
    sifra: string,
    stamparijaId: string,
    kolicina: number
) {

  return this.http.post<any>(
    `${this.backendUrl}/azurirajKolicinu`,
    {
      sifra: sifra,
      stamparijaId: stamparijaId,
      kolicina: kolicina
    }
  );
}
}