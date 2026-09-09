import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { Proizvod } from '../../models/Proizvod';
import { ProizvodService } from '../../servisi/proizvod.service';

@Component({
  selector: 'app-pretraga-klijent',
  imports: [FormsModule],
  templateUrl: './pretraga-klijent.html',
  styleUrl: './pretraga-klijent.css'
})
export class PretragaKlijent implements OnInit {

  naziv: string = "";
  kategorija: string = "";

  kategorije: string[] = [];
  proizvodi: Proizvod[] = [];

  rastuce: boolean = true;

  vrstaKlijenta: string = "";

  constructor(
    private proizvodServis: ProizvodService,
    private router: Router
  ) {}


  ngOnInit(): void {

    const podatak = localStorage.getItem("ulogovan");

    if (podatak == null) {
      this.router.navigate(['/login']);
      return;
    }

    const ulogovan = JSON.parse(podatak);

    if (ulogovan.tip != "klijent") {
      this.router.navigate(['/']);
      return;
    }

    this.vrstaKlijenta = ulogovan.vrstaKlijenta;

    this.proizvodServis.kategorijeAktivnihProizvoda()
      .subscribe((kategorije) => {
        this.kategorije = kategorije;
      });

    this.pretraga();
  }


  pretraga() {

    this.proizvodServis.pretraga(
      this.naziv,
      this.kategorija
    ).subscribe((proizvodi) => {

      this.proizvodi = proizvodi;
    });
  }


  sortirajPoNazivu() {

    if (this.rastuce) {
      this.proizvodi.sort((a, b) =>
        a.naziv.localeCompare(b.naziv)
      );
    }
    else {
      this.proizvodi.sort((a, b) =>
        b.naziv.localeCompare(a.naziv)
      );
    }

    this.rastuce = !this.rastuce;
  }


  detalji(sifra: string) {
    this.router.navigate(['/klijent-proizvod', sifra]);
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