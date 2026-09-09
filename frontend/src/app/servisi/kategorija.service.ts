import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Kategorija } from '../models/Kategorija';

@Injectable({
  providedIn: 'root'
})
export class KategorijaService {

  backendUrl = "http://localhost:4000";

  constructor(private http: HttpClient) { }


  sveKategorije() {

    return this.http.get<Kategorija[]>(
      `${this.backendUrl}/sveKategorije`
    );
  }

  dodajKategoriju(
  naziv: string
) {

  return this.http.post<any>(
    `${this.backendUrl}/dodajKategoriju`,
    {
      naziv: naziv
    }
  );
}


dodajPotkategoriju(
  kategorija: string,
  potkategorija: string
) {

  return this.http.post<any>(
    `${this.backendUrl}/dodajPotkategoriju`,
    {
      kategorija: kategorija,
      potkategorija: potkategorija
    }
  );
}
}