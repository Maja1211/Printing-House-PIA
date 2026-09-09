import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { Narudzbina } from '../../models/Narudzbina';
import { NarudzbinaService } from '../../servisi/narudzbina.service';
import { ProizvodService } from '../../servisi/proizvod.service';

@Component({
  selector: 'app-arhiva-klijent',
  imports: [FormsModule],
  templateUrl: './arhiva-klijent.html',
  styleUrl: './arhiva-klijent.css'
})
export class ArhivaKlijent implements OnInit {

  narudzbine: Narudzbina[] = [];

  kor_ime: string = "";

  komentari: any = {};

  komentarisano: any = {};

  poruka: string = "";

  poruke: any = {};

  sortiranje: string = "datum";
  rastuce: boolean = false;

  vrstaKlijenta: string = "";

  constructor(
    private narudzbinaServis: NarudzbinaService,
    private proizvodServis: ProizvodService,
    private router: Router
  ) {}


  ngOnInit(): void {

    const podatak = localStorage.getItem("ulogovan");

    if (podatak == null) {
      this.router.navigate(['/login']);
      return;
    }

    const korisnik = JSON.parse(podatak);

    if (korisnik.tip != "klijent") {
      this.router.navigate(['/']);
      return;
    }

    this.kor_ime = korisnik.kor_ime;
    this.vrstaKlijenta = korisnik.vrstaKlijenta;

    this.ucitajArhivu();
  }


  ucitajArhivu() {

    this.narudzbinaServis.arhiva(this.kor_ime)
      .subscribe((narudzbine) => {
        this.narudzbine = narudzbine;
      });
  }


  stavkeArhive(): any[] {

    const stavke: any[] = [];

    for (let narudzbina of this.narudzbine) {

      for (let proizvod of narudzbina.proizvodi) {

        stavke.push({
          idFakture: narudzbina.idFakture,
          nazivStamparije: narudzbina.nazivStamparije,
          datum: narudzbina.datum,
          status: narudzbina.status,
          sifra: proizvod.sifra,
          naziv: proizvod.naziv,
          kolicina: proizvod.kolicina
        });
      }
    }

    stavke.sort((a: any, b: any) => {

      let prvi: any;
      let drugi: any;

      if (this.sortiranje == "proizvod") {
        prvi = a.naziv.toLowerCase();
        drugi = b.naziv.toLowerCase();
      }
      else if (this.sortiranje == "kolicina") {
        prvi = a.kolicina;
        drugi = b.kolicina;
      }
      else if (this.sortiranje == "stamparija") {
        prvi = a.nazivStamparije.toLowerCase();
        drugi = b.nazivStamparije.toLowerCase();
      }
      else {
        prvi = new Date(a.datum).getTime();
        drugi = new Date(b.datum).getTime();
      }

      if (prvi < drugi) {
        return this.rastuce ? -1 : 1;
      }

      if (prvi > drugi) {
        return this.rastuce ? 1 : -1;
      }

      return 0;
    });

    return stavke;
  }


  oznaciKaoPrimljeno(idFakture: string) {

    this.narudzbinaServis
      .primljeno(idFakture, this.kor_ime)
      .subscribe((odgovor) => {

        if (odgovor.poruka == "ok") {
          this.poruka = "Narudžbina je označena kao primljena.";
          this.ucitajArhivu();
        }
        else {
          this.poruka = odgovor.poruka;
        }

      });
  }


  lajkuj(sifra: string) {

    this.proizvodServis
      .lajkuj(sifra, this.kor_ime)
      .subscribe((odgovor) => {

        if (odgovor.poruka == "ok") {

          this.poruke[sifra] =
            odgovor.stanje == "uklonjen"
              ? "Lajk uklonjen."
              : "Proizvod lajkovan.";
        }
        else {
          this.poruke[sifra] = odgovor.poruka;
        }

      });
  }


  dislajkuj(sifra: string) {

    this.proizvodServis
      .dislajkuj(sifra, this.kor_ime)
      .subscribe((odgovor) => {

        if (odgovor.poruka == "ok") {

          this.poruke[sifra] =
            odgovor.stanje == "uklonjen"
              ? "Dislajk uklonjen."
              : "Proizvod dislajkovan.";
        }
        else {
          this.poruke[sifra] = odgovor.poruka;
        }

      });
  }


  dodajKomentar(sifra: string) {

    const tekst = this.komentari[sifra];

    if (tekst == null || tekst.trim() == "") {
      this.poruke[sifra] = "Komentar ne može biti prazan.";
      return;
    }

    this.proizvodServis
      .dodajKomentar(
        sifra,
        this.kor_ime,
        tekst
      )
      .subscribe((odgovor) => {

        if (odgovor.poruka == "ok") {

          this.poruke[sifra] = "Komentar je objavljen.";

          this.komentari[sifra] = "";

          this.komentarisano[sifra] = true;
        }
        else {
          this.poruke[sifra] = odgovor.poruka;
        }

      });
  }


  nazad() {
    this.router.navigate(['/klijent']);
  }


  odjava() {
    localStorage.removeItem("ulogovan");
    localStorage.removeItem("korpa");
    this.router.navigate(['/']);
  }
}
