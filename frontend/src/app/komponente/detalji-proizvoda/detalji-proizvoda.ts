import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { Proizvod } from '../../models/Proizvod';
import { ProizvodService } from '../../servisi/proizvod.service';


@Component({
  selector: 'app-detalji-proizvoda',
  imports: [],
  templateUrl: './detalji-proizvoda.html',
  styleUrl: './detalji-proizvoda.css',
})
export class DetaljiProizvoda implements OnInit {

  proizvod: Proizvod = new Proizvod();

  grad: string = "";

  slike: string[] = [];

  izabranaSlika: string = "";


  constructor(
    private ruta: ActivatedRoute,
    private servis: ProizvodService
  ) {}


  ngOnInit(): void {

    const sifra =
      this.ruta.snapshot.paramMap.get('sifra');


    if (sifra != null) {

      this.servis
        .detalji(sifra)
        .subscribe((odgovor) => {

          if (odgovor != null) {

            this.proizvod =
              odgovor.proizvod;

            this.grad =
              odgovor.grad;


            this.slike = [];


            if (
              this.proizvod.slikaUrl != ""
            ) {

              this.slike.push(
                this.proizvod.slikaUrl
              );
            }


            if (
              this.proizvod.dodatneSlike != null
            ) {

              for (
                let i = 0;
                i < this.proizvod.dodatneSlike.length &&
                i < 3;
                i++
              ) {

                this.slike.push(
                  this.proizvod.dodatneSlike[i]
                );
              }
            }


            const sacuvanaSlika =
              this.procitajCookie(
                "glavnaSlika_" +
                this.proizvod.sifra
              );


            if (
              sacuvanaSlika != "" &&
              this.slike.includes(sacuvanaSlika)
            ) {

              this.izabranaSlika =
                sacuvanaSlika;
            }
            else if (
              this.slike.length > 0
            ) {

              this.izabranaSlika =
                this.slike[0];
            }

          }

        });
    }
  }


  izaberiSliku(slika: string) {

    this.izabranaSlika =
      slika;


    document.cookie =
      "glavnaSlika_" +
      this.proizvod.sifra +
      "=" +
      encodeURIComponent(slika) +
      "; max-age=2592000; path=/";
  }


  procitajCookie(naziv: string) {

    const kolacici =
      document.cookie.split(";");


    for (let kolacic of kolacici) {

      const dijelovi =
        kolacic.trim().split("=");


      if (
        dijelovi[0] == naziv
      ) {

        return decodeURIComponent(
          dijelovi.slice(1).join("=")
        );
      }
    }


    return "";
  }


  nazad() {
    window.history.back();
  }

}