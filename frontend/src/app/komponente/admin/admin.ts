import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { Chart, registerables } from 'chart.js';

import { Korisnik } from '../../models/Korisnik';
import { Kategorija } from '../../models/Kategorija';

import { KorisnikService } from '../../servisi/korisnik.service';
import { KategorijaService } from '../../servisi/kategorija.service';
import { Statistika } from '../../servisi/statistika.service';

Chart.register(...registerables);

@Component({
  selector: 'app-admin',
  imports: [FormsModule],
  templateUrl: './admin.html',
  styleUrl: './admin.css'
})
export class Admin implements OnInit {

  korisnici: Korisnik[] = [];

  zahtjevi: Korisnik[] = [];

  kategorije: Kategorija[] = [];

  grafikPrometa: Chart | null = null;
  grafikNarucivanja: Chart | null = null;
  grafikOcjena: Chart | null = null;


  novaKategorija: string = "";

  izabranaKategorija: string = "";

  novaPotkategorija: string = "";

  poruka: string = "";


  constructor(
    private korisnikServis: KorisnikService,
    private kategorijaServis: KategorijaService,
    private statistikaServis: Statistika,
    private router: Router
  ) {}


  ngOnInit(): void {

    const podatak =
      localStorage.getItem("ulogovan");


    if (podatak == null) {

      this.router.navigate(['/admin-login']);

      return;
    }


    const korisnik =
      JSON.parse(podatak);


    if (korisnik.tip != "admin") {

      this.router.navigate(['/']);

      return;
    }


    this.ucitajSve();

    this.ucitajStatistike();
  }


  ucitajSve() {

    this.ucitajKorisnike();

    this.ucitajZahtjeve();

    this.ucitajKategorije();
  }


  ucitajStatistike() {

    this.statistikaServis
      .prometStamparija()
      .subscribe((podaci) => {

        this.grafikPrometa?.destroy();

        const platnoPrometa =
          document.getElementById(
            'grafikPrometaPlatno'
          ) as HTMLCanvasElement;

        this.grafikPrometa = new Chart(
          platnoPrometa,
          {
            type: 'bar',
            data: {
              labels: podaci.map((p) => p.nazivStamparije),
              datasets: [{
                label: 'Promet u posljednja 3 mjeseca (RSD)',
                data: podaci.map((p) => p.promet),
                backgroundColor: '#4f7cff'
              }]
            },
            options: {
              responsive: true,
              scales: { y: { beginAtZero: true } }
            }
          }
        );
      });


    this.statistikaServis
      .najnarucivaniProizvodi()
      .subscribe((podaci) => {

        this.grafikNarucivanja?.destroy();

        const boje = [
          '#4f7cff', '#f97316', '#22c55e',
          '#a855f7', '#ef4444', '#14b8a6',
          '#eab308', '#64748b'
        ];

        const platnoNarucivanja =
          document.getElementById(
            'grafikNarucivanjaPlatno'
          ) as HTMLCanvasElement;

        this.grafikNarucivanja = new Chart(
          platnoNarucivanja,
          {
            type: 'pie',
            data: {
              labels: podaci.map(
                (p) => p.naziv + ' (' + p.procenat + '%)'
              ),
              datasets: [{
                data: podaci.map((p) => p.kolicina),
                backgroundColor: boje
              }]
            },
            options: {
              responsive: true
            }
          }
        );
      });


    this.statistikaServis
      .ocenaKrozVrijeme()
      .subscribe((podaci) => {

        this.grafikOcjena?.destroy();

        const boje = [
          '#4f7cff', '#f97316', '#22c55e',
          '#a855f7', '#ef4444', '#14b8a6'
        ];

        const datasetovi = podaci.map((proizvod, indeks) => {

          return {
            label: proizvod.naziv + ' (' + proizvod.sifra + ')',
            data: proizvod.ocenaIstorija.map((tacka: any) => {

              return {
                x: new Date(tacka.datum).getTime(),
                y: tacka.brojLajkova - tacka.brojDislajkova
              };
            }),
            borderColor: boje[indeks % boje.length],
            backgroundColor: boje[indeks % boje.length],
            fill: false
          };
        });

        const platnoOcjena =
          document.getElementById(
            'grafikOcjenaPlatno'
          ) as HTMLCanvasElement;

        this.grafikOcjena = new Chart(
          platnoOcjena,
          {
            type: 'line',
            data: {
              datasets: datasetovi
            },
            options: {
              responsive: true,
              parsing: false,
              scales: {
                x: {
                  type: 'linear',
                  ticks: {
                    callback: (vrijednost) => {

                      return new Date(
                        Number(vrijednost)
                      ).toLocaleDateString('sr-Latn');
                    }
                  }
                },
                y: {
                  title: {
                    display: true,
                    text: 'Ocjena (lajkovi - dislajkovi)'
                  }
                }
              },
              plugins: {
                legend: {
                  onClick: (event, legendItem, legend) => {
                    const indeks = legendItem.datasetIndex;

                    if (indeks == null) {
                      return;
                    }

                    const chart = legend.chart;

                    const vidljiv =
                      chart.isDatasetVisible(indeks);

                    chart.setDatasetVisibility(
                      indeks,
                      !vidljiv
                    );

                    chart.update();
                  }
                }
              }
            }
          }
        );
      });
  }


  ucitajKorisnike() {

    this.korisnikServis
      .sviKorisnici()
      .subscribe((korisnici) => {

        this.korisnici =
          korisnici;
      });
  }


  ucitajZahtjeve() {

    this.korisnikServis
      .zahtjeviRegistracije()
      .subscribe((zahtjevi) => {

        this.zahtjevi =
          zahtjevi;
      });
  }


  ucitajKategorije() {

    this.kategorijaServis
      .sveKategorije()
      .subscribe((kategorije) => {

        this.kategorije =
          kategorije;
      });
  }


  odobri(
    korisnik: Korisnik
  ) {

    this.korisnikServis
      .obradiRegistraciju(
        korisnik.kor_ime,
        "aktivan"
      )
      .subscribe((odgovor) => {

        if (odgovor.poruka == "ok") {

          this.poruka =
            "Registracija je odobrena.";

          this.ucitajSve();
        }
        else {

          this.poruka =
            odgovor.poruka;
        }

      });
  }


  odbij(
    korisnik: Korisnik
  ) {

    this.korisnikServis
      .obradiRegistraciju(
        korisnik.kor_ime,
        "odbijen"
      )
      .subscribe((odgovor) => {

        if (odgovor.poruka == "ok") {

          this.poruka =
            "Registracija je odbijena.";

          this.ucitajSve();
        }
        else {

          this.poruka =
            odgovor.poruka;
        }

      });
  }


  sacuvajKorisnika(
    korisnik: Korisnik
  ) {

    this.korisnikServis
      .adminAzurirajKorisnika(korisnik)
      .subscribe((odgovor) => {

        if (odgovor.poruka == "ok") {

          this.poruka =
            "Korisnik je ažuriran.";
        }
        else {

          this.poruka =
            odgovor.poruka;
        }

      });
  }


  obrisiKorisnika(
    korisnik: Korisnik
  ) {

    this.korisnikServis
      .obrisiKorisnika(
        korisnik.kor_ime
      )
      .subscribe((odgovor) => {

        if (odgovor.poruka == "ok") {

          this.poruka =
            "Korisnik je obrisan.";

          this.ucitajKorisnike();
        }
        else {

          this.poruka =
            odgovor.poruka;
        }

      });
  }


  dodajKategoriju() {

    if (
      this.novaKategorija.trim() == ""
    ) {

      this.poruka =
        "Unesite naziv kategorije.";

      return;
    }


    this.kategorijaServis
      .dodajKategoriju(
        this.novaKategorija
      )
      .subscribe((odgovor) => {

        if (odgovor.poruka == "ok") {

          this.poruka =
            "Kategorija je dodata.";

          this.novaKategorija = "";

          this.ucitajKategorije();
        }
        else {

          this.poruka =
            odgovor.poruka;
        }

      });
  }


  dodajPotkategoriju() {

    if (
      this.izabranaKategorija == "" ||
      this.novaPotkategorija.trim() == ""
    ) {

      this.poruka =
        "Izaberite kategoriju i unesite potkategoriju.";

      return;
    }


    this.kategorijaServis
      .dodajPotkategoriju(
        this.izabranaKategorija,
        this.novaPotkategorija
      )
      .subscribe((odgovor) => {

        if (odgovor.poruka == "ok") {

          this.poruka =
            "Potkategorija je dodata.";

          this.novaPotkategorija = "";

          this.ucitajKategorije();
        }
        else {

          this.poruka =
            odgovor.poruka;
        }

      });
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