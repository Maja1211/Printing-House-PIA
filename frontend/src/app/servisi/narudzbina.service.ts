import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Narudzbina } from '../models/Narudzbina';

@Injectable({
  providedIn: 'root'
})
export class NarudzbinaService {

  backendUrl = "http://localhost:4000";

  constructor(private http: HttpClient) { }

  narudzbineKorisnika(kor_ime: string) {
    return this.http.get<Narudzbina[]>(
      `${this.backendUrl}/narudzbine/${kor_ime}`
    );
  }

  potvrdiNarudzbinu(
    kor_ime: string,
    stavke: any[]
) {

    const data = {
      kor_ime: kor_ime,
      stavke: stavke
    }

    return this.http.post<any>(
      `${this.backendUrl}/potvrdiNarudzbinu`,
      data
    );
}

arhiva(kor_ime: string) {

    return this.http.get<Narudzbina[]>(
      `${this.backendUrl}/arhiva/${kor_ime}`
    );
}


primljeno(
    idFakture: string,
    kor_ime: string
) {

    return this.http.post<any>(
      `${this.backendUrl}/primljeno`,
      {
        idFakture: idFakture,
        kor_ime: kor_ime
      }
    );
}

narudzbineStamparije(stamparijaId: string) {

    return this.http.get<Narudzbina[]>(
        `${this.backendUrl}/narudzbineStamparije/${stamparijaId}`
    );
}


promijeniStatus(
    idFakture: string,
    stamparijaId: string,
    noviStatus: string
) {

    return this.http.post<any>(
        `${this.backendUrl}/promijeniStatus`,
        {
            idFakture: idFakture,
            stamparijaId: stamparijaId,
            noviStatus: noviStatus
        }
    );
}

otkaziNarudzbinu(
    idFakture: string,
    kor_ime: string
) {

    return this.http.post<any>(
        `${this.backendUrl}/otkaziNarudzbinu`,
        {
            idFakture: idFakture,
            kor_ime: kor_ime
        }
    );
}


platiNarudzbinu(
    idFakture: string,
    kor_ime: string,
    tipKartice: string,
    paymentMethodId: string
) {

    return this.http.post<any>(
        `${this.backendUrl}/platiNarudzbinu`,
        {
            idFakture: idFakture,
            kor_ime: kor_ime,
            tipKartice: tipKartice,
            paymentMethodId: paymentMethodId
        }
    );
}
}