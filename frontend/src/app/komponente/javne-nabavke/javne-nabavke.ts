import { Component, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';

import { jsPDF } from 'jspdf';

import { JavnaNabavka } from '../../models/JavnaNabavka';
import { JavnaNabavkaService } from '../../servisi/javna-nabavka.service';


@Component({
  selector: 'app-javne-nabavke',
  imports: [DatePipe],
  templateUrl: './javne-nabavke.html',
  styleUrl: './javne-nabavke.css'
})
export class JavneNabavke implements OnInit {

  nabavke: JavnaNabavka[] = [];


  constructor(
    private servis: JavnaNabavkaService,
    private router: Router
  ) {}


  ngOnInit(): void {

    const podatak =
      localStorage.getItem("ulogovan");


    if (podatak == null) {

      this.router.navigate(['/login']);

      return;
    }


    const korisnik =
      JSON.parse(podatak);


    if (korisnik.vrstaKlijenta != "pravno") {

      this.router.navigate(['/klijent']);

      return;
    }


    this.servis
      .nabavkeKorisnika(korisnik.kor_ime)
      .subscribe((nabavke) => {

        this.nabavke = nabavke;
      });
  }


  nazivPobjednika(nabavka: JavnaNabavka) {

    if (
      nabavka.pobjednik == "" ||
      nabavka.ponude == null
    ) {

      return "";
    }


    for (let ponuda of nabavka.ponude) {

      if (
        ponuda.stamparijaId ==
        nabavka.pobjednik
      ) {

        return ponuda.nazivStamparije;
      }
    }


    return nabavka.pobjednik;
  }


  preuzmiIzvjestaj(
    nabavka: JavnaNabavka
  ) {

    const pdf =
      new jsPDF();


    let y = 20;


    pdf.setFontSize(18);

    pdf.text(
      "Printing House - Izvjestaj javne nabavke",
      20,
      y
    );


    y += 15;


    pdf.setFontSize(12);

    pdf.text(
      "ID javne nabavke: " +
      this.bezDijakritike(nabavka.id),
      20,
      y
    );


    y += 8;


    pdf.text(
      "Datum i vrijeme: " +
      this.bezDijakritike(
        String(nabavka.datumVrijeme)
      ),
      20,
      y
    );


    y += 14;

    pdf.setFontSize(14);

    pdf.text(
      "Trazeni proizvodi",
      20,
      y
    );


    y += 9;

    pdf.setFontSize(11);


    for (
      let proizvod of nabavka.proizvodi
    ) {

      const tekst =
        "- " +
        this.bezDijakritike(
          proizvod.naziv
        ) +
        " - " +
        proizvod.kolicina +
        " kom.";


      pdf.text(
        tekst,
        25,
        y
      );


      y += 7;
    }


    y += 7;

    pdf.setFontSize(14);

    pdf.text(
      "Pristigle ponude",
      20,
      y
    );


    y += 9;

    pdf.setFontSize(11);


    if (
      nabavka.ponude == null ||
      nabavka.ponude.length == 0
    ) {

      pdf.text(
        "Nema pristiglih ponuda.",
        25,
        y
      );

      y += 7;
    }

    else {

      for (
        let ponuda of nabavka.ponude
      ) {

        const tekst =
          "- " +
          this.bezDijakritike(
            ponuda.nazivStamparije
          ) +
          ": " +
          ponuda.ukupanIznos +
          " RSD";


        pdf.text(
          tekst,
          25,
          y
        );


        y += 7;
      }
    }


    y += 10;

    pdf.setFontSize(14);

    pdf.text(
      "Rezultat",
      20,
      y
    );


    y += 9;

    pdf.setFontSize(11);


    const pobjednik =
      this.nazivPobjednika(nabavka);


    if (pobjednik != "") {

      pdf.text(
        "Pobjednicka stamparija: " +
        this.bezDijakritike(pobjednik),
        25,
        y
      );
    }

    else {

      pdf.text(
        "Javna nabavka je zavrsena bez validne ponude.",
        25,
        y
      );
    }


    pdf.save(
      "javna_nabavka_" +
      nabavka.id +
      ".pdf"
    );
  }


  bezDijakritike(
    tekst: string
  ) {

    return tekst
      .replace(/č/g, "c")
      .replace(/ć/g, "c")
      .replace(/š/g, "s")
      .replace(/ž/g, "z")
      .replace(/đ/g, "dj")
      .replace(/Č/g, "C")
      .replace(/Ć/g, "C")
      .replace(/Š/g, "S")
      .replace(/Ž/g, "Z")
      .replace(/Đ/g, "Dj");
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