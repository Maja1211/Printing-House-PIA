import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { Proizvod } from '../../models/Proizvod';
import { ProizvodService } from '../../servisi/proizvod.service';
import { KorpaService } from '../../servisi/korpa.service';

@Component({
  selector: 'app-priprema-proizvoda',
  imports: [FormsModule],
  templateUrl: './priprema-proizvoda.html',
  styleUrl: './priprema-proizvoda.css'
})
export class PripremaProizvoda implements OnInit {

  proizvod: Proizvod = new Proizvod();

  boja: string = "";
  uslugaId: string = "";
  usluga: any = null;

  tekstZaStampu: string = "";

  slikaZaStampu: string = "";
  nazivSlikeZaStampu: string = "";

  kolicina: number = 1;

  poruka: string = "";

  vrstaKlijenta: string = "";

  constructor(
    private ruta: ActivatedRoute,
    private proizvodServis: ProizvodService,
    private korpaServis: KorpaService,
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

    const sifra =
      this.ruta.snapshot.paramMap.get('sifra');

    this.boja =
      this.ruta.snapshot.queryParamMap.get('boja') || "Bijela";

    this.uslugaId =
      this.ruta.snapshot.queryParamMap.get('usluga') || "";


    if (sifra != null) {

      this.proizvodServis
        .detalji(sifra)
        .subscribe((odgovor) => {

          if (odgovor != null) {

            this.proizvod =
              odgovor.proizvod;

            this.usluga =
              this.proizvod.uslugeStampe.find(
                (u: any) =>
                  u.idUsluge == this.uslugaId
              );
          }

        });
    }
  }


  izabranaSlikaZaStampu(event: any) {

    this.poruka = "";

    const fajl =
      event.target.files[0];

    if (fajl == null) {
      return;
    }


    const dozvoljeniTipovi = [
      "image/jpeg",
      "image/png",
      "image/gif"
    ];


    if (!dozvoljeniTipovi.includes(fajl.type)) {

      this.poruka =
        "Slika mora biti JPG, PNG ili GIF.";

      event.target.value = "";

      return;
    }


    this.nazivSlikeZaStampu =
      fajl.name;


    const reader =
      new FileReader();


    reader.onload = () => {

      this.slikaZaStampu =
        reader.result as string;
    };


    reader.readAsDataURL(fajl);
  }


  dodajUKorpu() {

    this.poruka = "";


    if (
      this.tekstZaStampu.trim() == "" &&
      this.slikaZaStampu == ""
    ) {

      this.poruka =
        "Unesite tekst ili izaberite sliku za štampu.";

      return;
    }


    if (this.kolicina <= 0) {

      this.poruka =
        "Količina mora biti veća od 0.";

      return;
    }


    if (
      this.kolicina >
      this.proizvod.kolicinaNaLageru
    ) {

      this.poruka =
        "Nema dovoljno proizvoda trenutno na stanju.";

      return;
    }


    if (this.usluga == null) {

      this.poruka =
        "Vrsta štampe nije izabrana.";

      return;
    }


    const cijenaPoKomadu =
      this.proizvod.jedinicnaCena +
      this.usluga.dodatnaCenaPoKomadu;


    const stavka = {

      sifra:
        this.proizvod.sifra,

      naziv:
        this.proizvod.naziv,

      stamparijaId:
        this.proizvod.stamparijaId,

      nazivStamparije:
        this.proizvod.nazivStamparije,

      boja:
        this.boja,

      tipStampe:
        this.usluga.tipStampe,

      tekstZaStampu:
        this.tekstZaStampu,

      nazivSlikeZaStampu:
        this.nazivSlikeZaStampu,

      kolicina:
        this.kolicina,

      ukupnaCena:
        cijenaPoKomadu *
        this.kolicina
    };


    this.korpaServis.dodaj(stavka);

    this.router.navigate(['/korpa']);
  }


  ponisti() {

    this.tekstZaStampu = "";

    this.slikaZaStampu = "";

    this.nazivSlikeZaStampu = "";

    this.kolicina = 1;

    this.poruka = "";


    const input =
      document.getElementById(
        "slikaZaStampu"
      ) as HTMLInputElement;


    if (input != null) {
      input.value = "";
    }
  }


  nazad() {

    this.router.navigate(
      [
        '/klijent-proizvod',
        this.proizvod.sifra
      ]
    );
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

}