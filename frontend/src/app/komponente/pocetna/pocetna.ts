import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KorisnikService } from '../../servisi/korisnik.service';
import { ProizvodService } from '../../servisi/proizvod.service';
import { Proizvod } from '../../models/Proizvod';
import { Router } from '@angular/router';

@Component({
  selector: 'app-pocetna',
  imports: [FormsModule],
  templateUrl: './pocetna.html',
  styleUrl: './pocetna.css'
})
export class Pocetna implements OnInit {

  brojStamparija: number = 0;
  proizvodi: Proizvod[] = [];

  naziv: string = "";
  kategorija: string = "";

  kategorije: string[] = [];
  rezultati: Proizvod[] = [];

  rastuce: boolean = true;

  constructor(
    private korisnikServis: KorisnikService,
    private proizvodServis: ProizvodService,
    private router: Router
  ) {}

  ngOnInit(): void {

    this.korisnikServis.brojStamparija().subscribe((broj) => {
      this.brojStamparija = broj;
    });

    this.proizvodServis.top5().subscribe((proizvodi) => {
      this.proizvodi = proizvodi;
    });

    this.proizvodServis.kategorijeAktivnihProizvoda().subscribe((kategorije) => {
      this.kategorije = kategorije;
    });
  }


  pretraga() {

    this.proizvodServis.pretraga(
      this.naziv,
      this.kategorija
    ).subscribe((proizvodi) => {

      this.rezultati = proizvodi;

      requestAnimationFrame(() => {

        requestAnimationFrame(() => {

          document
            .getElementById('rezultati')
            ?.scrollIntoView({ behavior: 'smooth' });
        });
      });
    });
  }


  sortirajPoNazivu() {

    if (this.rastuce) {
      this.rezultati.sort((a, b) =>
        a.naziv.localeCompare(b.naziv)
      );
    }
    else {
      this.rezultati.sort((a, b) =>
        b.naziv.localeCompare(a.naziv)
      );
    }

    this.rastuce = !this.rastuce;
  }

  detalji(sifra: string) {
    this.router.navigate(['/proizvod', sifra]);
}


  skociNaSekciju(
    id: string,
    event: Event
  ) {

    event.preventDefault();

    document
      .getElementById(id)
      ?.scrollIntoView({ behavior: 'smooth' });
  }
}