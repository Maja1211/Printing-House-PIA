import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class Statistika {

  backendUrl = "http://localhost:4000";

  constructor(private http: HttpClient) { }

  prometStamparija() {

    return this.http.get<any[]>(
      `${this.backendUrl}/statistike/prometStamparija`
    );
  }

  najnarucivaniProizvodi() {

    return this.http.get<any[]>(
      `${this.backendUrl}/statistike/najnarucivaniProizvodi`
    );
  }

  ocenaKrozVrijeme() {

    return this.http.get<any[]>(
      `${this.backendUrl}/statistike/ocenaKrozVrijeme`
    );
  }
}
