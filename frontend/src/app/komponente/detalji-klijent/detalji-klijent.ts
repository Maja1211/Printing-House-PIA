import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

import {
  DomSanitizer,
  SafeResourceUrl
} from '@angular/platform-browser';

import { Proizvod } from '../../models/Proizvod';
import { ProizvodService } from '../../servisi/proizvod.service';


@Component({
  selector: 'app-detalji-klijent',
  imports: [FormsModule, DatePipe],
  templateUrl: './detalji-klijent.html',
  styleUrl: './detalji-klijent.css'
})
export class DetaljiKlijent implements OnInit {

  proizvod: Proizvod = new Proizvod();

  grad: string = "";
  adresa: string = "";

  slike: string[] = [];
  izabranaSlika: string = "";

  mapaUrl: SafeResourceUrl | null = null;

  boja: string = "";
  uslugaStampe: string = "";
  kor_ime: string = "";
  vrstaKlijenta: string = "";

  poruka: string = "";


  constructor(
    private ruta: ActivatedRoute,
    private proizvodServis: ProizvodService,
    private router: Router,
    private sanitizer: DomSanitizer
  ) {}


  ngOnInit(): void {

    const podatak =
      localStorage.getItem("ulogovan");


    if (podatak == null) {

      this.router.navigate(['/login']);
      return;
    }


    const ulogovan =
      JSON.parse(podatak);

    if (ulogovan.tip != "klijent") {

      this.router.navigate(['/']);
      return;
    }

    this.kor_ime =
      ulogovan.kor_ime;

    this.vrstaKlijenta =
      ulogovan.vrstaKlijenta;


    const sifra =
      this.ruta.snapshot.paramMap.get('sifra');


    if (sifra != null) {

      this.proizvodServis
        .detalji(sifra)
        .subscribe((odgovor) => {

          if (odgovor != null) {

            this.proizvod =
              odgovor.proizvod;

            this.grad =
              odgovor.grad;

            this.adresa =
              odgovor.adresa;


            this.slike = [];

            if (this.proizvod.slikaUrl != "") {
              this.slike.push(this.proizvod.slikaUrl);
            }

            if (this.proizvod.dodatneSlike != null) {
              for (
                let i = 0;
                i < this.proizvod.dodatneSlike.length && i < 3;
                i++
              ) {
                this.slike.push(this.proizvod.dodatneSlike[i]);
              }
            }

            const sacuvanaSlika =
              this.procitajCookie("glavnaSlika_" + this.proizvod.sifra);

            if (sacuvanaSlika != "" && this.slike.includes(sacuvanaSlika)) {
              this.izabranaSlika = sacuvanaSlika;
            }
            else if (this.slike.length > 0) {
              this.izabranaSlika = this.slike[0];
            }


            const lokacija =
              this.adresa + ", " + this.grad;


            const url =
              "https://www.google.com/maps?q=" +
              encodeURIComponent(lokacija) +
              "&output=embed";


            this.mapaUrl =
              this.sanitizer
                .bypassSecurityTrustResourceUrl(url);


            if (
              this.proizvod.dostupneBoje.length > 0
            ) {

              this.boja =
                this.proizvod.dostupneBoje[0];
            }
            else {

              this.boja =
                "Bijela";
            }


            if (
              this.proizvod.uslugeStampe.length == 1
            ) {

              this.uslugaStampe =
                this.proizvod.uslugeStampe[0].idUsluge;
            }

          }

        });
    }
  }


  izaberiSliku(slika: string) {

    this.izabranaSlika = slika;

    document.cookie =
      "glavnaSlika_" +
      this.proizvod.sifra +
      "=" +
      encodeURIComponent(slika) +
      "; max-age=2592000; path=/";
  }


  procitajCookie(naziv: string) {

    const kolacici = document.cookie.split(";");

    for (let kolacic of kolacici) {

      const dijelovi = kolacic.trim().split("=");

      if (dijelovi[0] == naziv) {
        return decodeURIComponent(dijelovi.slice(1).join("="));
      }
    }

    return "";
  }


  nazad() {

    this.router.navigate([
      '/pretraga-klijent'
    ]);
  }


  odjava() {

    localStorage.removeItem(
      "ulogovan"
    );

    localStorage.removeItem(
      "korpa"
    );

    this.router.navigate(['/']);
  }


  dalje() {

    this.poruka = "";

    if (this.uslugaStampe == "") {

      this.poruka =
        "Izaberite vrstu štampe.";

      return;
    }


    this.router.navigate(
      [
        '/priprema-proizvoda',
        this.proizvod.sifra
      ],
      {
        queryParams: {

          boja:
            this.boja,

          usluga:
            this.uslugaStampe
        }
      }
    );
  }


  poslednjihPetKomentara() {

    if (
      this.proizvod.komentari == null
    ) {

      return [];
    }


    return [
      ...this.proizvod.komentari
    ]
      .sort(
        (a: any, b: any) =>
          new Date(b.datum).getTime()
          -
          new Date(a.datum).getTime()
      )
      .slice(0, 5);
  }

}