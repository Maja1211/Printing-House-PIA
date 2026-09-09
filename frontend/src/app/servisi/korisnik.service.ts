import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Korisnik } from '../models/Korisnik';

@Injectable({
  providedIn: 'root'
})
export class KorisnikService {

  backendUrl = "http://localhost:4000";

  constructor(private http: HttpClient) { }

  login(kor_ime: string, lozinka: string) {
    const data = {
      kor_ime: kor_ime,
      lozinka: lozinka
    }

    return this.http.post<Korisnik>(
      `${this.backendUrl}/login`,
      data
    );
  }

  adminLogin(kor_ime: string, lozinka: string) {
    const data = {
      kor_ime: kor_ime,
      lozinka: lozinka
    }

    return this.http.post<Korisnik>(
      `${this.backendUrl}/adminLogin`,
      data
    );
  }

  registracija(data: FormData) {
    return this.http.post<any>(
        `${this.backendUrl}/registracija`,
        data
    );
}

brojStamparija() {
    return this.http.get<number>(
        `${this.backendUrl}/brojStamparija`
    );
}

profil(kor_ime: string) {
    return this.http.get<Korisnik>(
      `${this.backendUrl}/profil/${kor_ime}`
    );
}


azurirajProfil(data: FormData) {
    return this.http.post<any>(
      `${this.backendUrl}/azurirajProfil`,
      data
    );
}

sviKorisnici() {

  return this.http.get<Korisnik[]>(
    `${this.backendUrl}/sviKorisnici`
  );
}


zahtjeviRegistracije() {

  return this.http.get<Korisnik[]>(
    `${this.backendUrl}/zahtjeviRegistracije`
  );
}


obradiRegistraciju(
  kor_ime: string,
  status: string
) {

  return this.http.post<any>(
    `${this.backendUrl}/obradiRegistraciju`,
    {
      kor_ime: kor_ime,
      status: status
    }
  );
}


adminAzurirajKorisnika(
  korisnik: Korisnik
) {

  return this.http.post<any>(
    `${this.backendUrl}/adminAzurirajKorisnika`,
    korisnik
  );
}


obrisiKorisnika(
  kor_ime: string
) {

  return this.http.post<any>(
    `${this.backendUrl}/obrisiKorisnika`,
    {
      kor_ime: kor_ime
    }
  );
}


zatraziResetovanjeLozinke(
  korisnickoImeIliEmail: string
) {

  return this.http.post<any>(
    `${this.backendUrl}/zatraziResetovanjeLozinke`,
    {
      korisnickoImeIliEmail: korisnickoImeIliEmail
    }
  );
}


postaviNovuLozinku(
  token: string,
  novaLozinka: string
) {

  return this.http.post<any>(
    `${this.backendUrl}/postaviNovuLozinku`,
    {
      token: token,
      novaLozinka: novaLozinka
    }
  );
}


provjeriResetToken(
  token: string
) {

  return this.http.get<any>(
    `${this.backendUrl}/provjeriResetToken/${token}`
  );
}
}