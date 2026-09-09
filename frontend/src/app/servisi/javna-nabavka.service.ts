import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { JavnaNabavka } from '../models/JavnaNabavka';

@Injectable({
  providedIn: 'root'
})
export class JavnaNabavkaService {

  backendUrl = "http://localhost:4000";

  constructor(private http: HttpClient) { }


  kreiraj(
    kor_ime: string,
    stavke: any[]
  ) {

    return this.http.post<any>(
      `${this.backendUrl}/kreirajJavnuNabavku`,
      {
        kor_ime: kor_ime,
        stavke: stavke
      }
    );
  }


  otvorene() {

    return this.http.get<JavnaNabavka[]>(
      `${this.backendUrl}/otvoreneJavneNabavke`
    );
  }


  posaljiPonudu(
    id: string,
    stamparijaId: string,
    nazivStamparije: string,
    ukupanIznos: number
  ) {

    return this.http.post<any>(
      `${this.backendUrl}/posaljiPonudu`,
      {
        id: id,
        stamparijaId: stamparijaId,
        nazivStamparije: nazivStamparije,
        ukupanIznos: ukupanIznos
      }
    );
  }


  nabavkeKorisnika(kor_ime: string) {

    return this.http.get<JavnaNabavka[]>(
      `${this.backendUrl}/javneNabavke/${kor_ime}`
    );
  }


  zavrseneNabavke(stamparijaId: string) {

    return this.http.get<JavnaNabavka[]>(
      `${this.backendUrl}/zavrseneJavneNabavke/${stamparijaId}`
    );
  }
}