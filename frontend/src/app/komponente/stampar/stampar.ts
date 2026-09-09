import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';

import { jsPDF } from 'jspdf';

import { Korisnik } from '../../models/Korisnik';
import { Proizvod } from '../../models/Proizvod';
import { Kategorija } from '../../models/Kategorija';

import { KorisnikService } from '../../servisi/korisnik.service';
import { ProizvodService } from '../../servisi/proizvod.service';
import { KategorijaService } from '../../servisi/kategorija.service';

import { Narudzbina } from '../../models/Narudzbina';
import { NarudzbinaService } from '../../servisi/narudzbina.service';

import { JavnaNabavka } from '../../models/JavnaNabavka';
import { JavnaNabavkaService } from '../../servisi/javna-nabavka.service';

@Component({
  selector: 'app-stampar',
  imports: [FormsModule, DatePipe],
  templateUrl: './stampar.html',
  styleUrl: './stampar.css'
})
export class Stampar implements OnInit {

  korisnik: Korisnik = new Korisnik();

  proizvodi: Proizvod[] = [];

  kategorije: Kategorija[] = [];

  potkategorije: string[] = [];

  narudzbine: Narudzbina[] = [];

  javneNabavke: JavnaNabavka[] = [];

  zavrseneNabavke: JavnaNabavka[] = [];

  iznosiPonuda: any = {};

  ponudaPoruke: any = {};


  sifra: string = "";

  naziv: string = "";

  opis: string = "";

  kategorija: string = "";

  potkategorija: string = "";

  jedinicnaCena: number = 0;

  kolicinaNaLageru: number = 0;

  bojeTekst: string = "";


  tipStampe: string = "";

  maxSirinaMm: number = 0;

  maxVisinaMm: number = 0;

  dodatnaCenaPoKomadu: number = 0;

  usluge: any[] = [];


  slika: File | null = null;

  dodatneSlike: File[] = [];

  novaProfilnaSlika: File | null = null;

  poruka: string = "";

  jsonProizvodi: any[] = [];

  jsonSlike: { [sifra: string]: File } = {};

  jsonDodatneSlike: { [sifra: string]: File[] } = {};

  jsonPoruka: string = "";


  constructor(
    private korisnikServis: KorisnikService,
    private proizvodServis: ProizvodService,
    private kategorijaServis: KategorijaService,
    private javnaNabavkaServis: JavnaNabavkaService,
    private narudzbinaServis: NarudzbinaService,
    private router: Router
    
  ) {}


  ngOnInit(): void {

    const podatak =
      localStorage.getItem("ulogovan");

    if (podatak == null) {

      this.router.navigate(['/login']);

      return
    }


    const ulogovan =
      JSON.parse(podatak);

    if (ulogovan.tip != "stampar") {
      this.router.navigate(['/']);
      return;
    }


    this.ucitajProfil(
      ulogovan.kor_ime
    );


    this.ucitajProizvode(
      ulogovan.stamparijaId
    );

    this.ucitajNarudzbine(
    ulogovan.stamparijaId
);


    this.kategorijaServis
      .sveKategorije()
      .subscribe((kategorije) => {

        this.kategorije =
          kategorije;
      });

      this.ucitajJavneNabavke();

      this.ucitajZavrseneNabavke(
        ulogovan.stamparijaId
      );
  }


  ucitajProfil(kor_ime: string) {

    this.korisnikServis
      .profil(kor_ime)
      .subscribe((korisnik) => {

        if (korisnik != null) {
          this.korisnik = korisnik;
        }
      });
  }


  ucitajProizvode(
    stamparijaId: string
  ) {

    this.proizvodServis
      .proizvodiStamparije(stamparijaId)
      .subscribe((proizvodi) => {

        this.proizvodi =
          proizvodi;
      });
  }


  promjenaKategorije() {

    const kategorija =
      this.kategorije.find(
        k => k.naziv == this.kategorija
      );


    if (kategorija != null) {

      this.potkategorije =
        kategorija.potkategorije;

    }
    else {

      this.potkategorije = [];
    }


    this.potkategorija = "";
  }


  dodajUslugu() {

    if (
      this.tipStampe == "" ||
      this.maxSirinaMm <= 0 ||
      this.maxVisinaMm <= 0 ||
      this.dodatnaCenaPoKomadu < 0
    ) {

      this.poruka =
        "Unesite ispravne podatke za uslugu.";

      return
    }


    this.usluge.push({

      idUsluge:
        "USL-" + Date.now(),

      tipStampe:
        this.tipStampe,

      maxSirinaMm:
        this.maxSirinaMm,

      maxVisinaMm:
        this.maxVisinaMm,

      dodatnaCenaPoKomadu:
        this.dodatnaCenaPoKomadu
    });


    this.tipStampe = "";

    this.maxSirinaMm = 0;

    this.maxVisinaMm = 0;

    this.dodatnaCenaPoKomadu = 0;

    this.poruka = "";
  }


  izabranaSlika(
    event: Event
  ) {

    const input =
      event.target as HTMLInputElement;


    if (
      input.files == null ||
      input.files.length == 0
    ) {
      return
    }


    const file = input.files[0];

    if (
      file.type != "image/jpeg" &&
      file.type != "image/png" &&
      file.type != "image/gif"
    ) {
      this.poruka = "Slika proizvoda mora biti JPG, PNG ili GIF.";
      this.slika = null;
      input.value = "";
      return;
    }

    this.slika = file;
    this.poruka = "";
  }


  izabraneDodatneSlike(
    event: Event
  ) {

    const input =
      event.target as HTMLInputElement;


    if (
      input.files == null ||
      input.files.length == 0
    ) {
      return
    }


    const fajlovi = Array.from(input.files);


    for (let fajl of fajlovi) {

      if (
        fajl.type != "image/jpeg" &&
        fajl.type != "image/png" &&
        fajl.type != "image/gif"
      ) {
        this.poruka = "Dodatne slike moraju biti JPG, PNG ili GIF.";
        this.dodatneSlike = [];
        input.value = "";
        return;
      }
    }


    if (fajlovi.length > 3) {

      this.poruka =
        "Možete dodati najviše 3 dodatne slike, uzete su prve 3.";

      const prveTri = fajlovi.slice(0, 3);

      this.dodatneSlike = prveTri;

      const noviPrijenos = new DataTransfer();

      for (let fajl of prveTri) {
        noviPrijenos.items.add(fajl);
      }

      input.files = noviPrijenos.files;

      return
    }


    this.dodatneSlike = fajlovi;

    this.poruka = "";
  }


  dodajProizvod() {

    this.poruka = "";


    if (
      this.sifra == "" ||
      this.naziv == "" ||
      this.opis == "" ||
      this.kategorija == "" ||
      this.potkategorija == ""
    ) {

      this.poruka =
        "Unesite sve podatke proizvoda.";

      return
    }

    if (this.jedinicnaCena <= 0) {

      this.poruka =
        "Jedinična cijena mora biti veća od 0.";

      return
    }

    if (this.kolicinaNaLageru < 0) {

      this.poruka =
        "Količina ne može biti negativna.";

      return
    }


    if (this.usluge.length == 0) {

      this.poruka =
        "Dodajte najmanje jednu uslugu štampe.";

      return
    }


    if (this.slika == null) {

      this.poruka =
        "Glavna slika proizvoda je obavezna.";

      return
    }


    const boje =
      this.bojeTekst
        .split(',')
        .map(b => b.trim())
        .filter(b => b != "");


    const data =
      new FormData();


    data.append(
      "stamparijaId",
      this.korisnik.stamparijaId
    );


    data.append(
      "nazivStamparije",
      this.korisnik.nazivInstitucije
    );


    data.append(
      "sifra",
      this.sifra
    );

    data.append(
      "naziv",
      this.naziv
    );

    data.append(
      "opis",
      this.opis
    );

    data.append(
      "kategorija",
      this.kategorija
    );

    data.append(
      "potkategorija",
      this.potkategorija
    );

    data.append(
      "jedinicnaCena",
      String(this.jedinicnaCena)
    );

    data.append(
      "kolicinaNaLageru",
      String(this.kolicinaNaLageru)
    );


    data.append(
      "dostupneBoje",
      JSON.stringify(boje)
    );


    data.append(
      "uslugeStampe",
      JSON.stringify(this.usluge)
    );


    if (this.slika != null) {

      data.append(
        "slika",
        this.slika
      );
    }


    for (let dodatnaSlika of this.dodatneSlike) {

      data.append(
        "dodatneSlike",
        dodatnaSlika
      );
    }


    this.proizvodServis
      .dodajProizvod(data)
      .subscribe((odgovor) => {

        if (odgovor.poruka == "ok") {

          this.poruka =
            "Proizvod je dodat.";

          this.ocistiFormu();

          this.ucitajProizvode(
            this.korisnik.stamparijaId
          );

        }
        else {

          this.poruka =
            odgovor.poruka;
        }
      });
  }


  ocistiFormu() {

    this.sifra = "";

    this.naziv = "";

    this.opis = "";

    this.kategorija = "";

    this.potkategorija = "";

    this.potkategorije = [];

    this.jedinicnaCena = 0;

    this.kolicinaNaLageru = 0;

    this.bojeTekst = "";

    this.usluge = [];

    this.slika = null;

    this.dodatneSlike = [];
  }


  ucitajJson(
    event: Event
  ) {

    const input =
      event.target as HTMLInputElement;

    if (
      input.files == null ||
      input.files.length == 0
    ) {
      return
    }

    const fajl = input.files[0];
    const citac = new FileReader();

    citac.onload = () => {

      try {

        const sadrzaj =
          JSON.parse(citac.result as string);

        if (
          sadrzaj.proizvodi == null ||
          !Array.isArray(sadrzaj.proizvodi)
        ) {

          this.jsonPoruka =
            "Fajl nema ispravan format (nedostaje niz 'proizvodi').";

          this.jsonProizvodi = [];

          return
        }

        this.jsonProizvodi = sadrzaj.proizvodi;
        this.jsonSlike = {};
        this.jsonPoruka = "";
      }
      catch {

        this.jsonPoruka = "Fajl nije ispravan JSON.";
        this.jsonProizvodi = [];
      }
    }

    citac.readAsText(fajl);
    input.value = "";
  }


  izabranaSlikaZaJson(
    sifra: string,
    event: Event
  ) {

    const input =
      event.target as HTMLInputElement;

    if (
      input.files == null ||
      input.files.length == 0
    ) {
      return
    }

    const fajl = input.files[0];

    if (
      fajl.type != "image/jpeg" &&
      fajl.type != "image/png" &&
      fajl.type != "image/gif"
    ) {
      this.jsonPoruka = "Slika mora biti JPG, PNG ili GIF.";
      input.value = "";
      return;
    }

    this.jsonSlike[sifra] = fajl;
  }


  izabraneDodatneSlikeZaJson(
    sifra: string,
    event: Event
  ) {

    const input =
      event.target as HTMLInputElement;

    if (
      input.files == null ||
      input.files.length == 0
    ) {
      return
    }

    const izabrani = Array.from(input.files);

    for (let fajl of izabrani) {

      if (
        fajl.type != "image/jpeg" &&
        fajl.type != "image/png" &&
        fajl.type != "image/gif"
      ) {
        this.jsonPoruka = "Slika mora biti JPG, PNG ili GIF.";
        input.value = "";
        return;
      }
    }

    if (izabrani.length > 3) {

      this.jsonPoruka =
        "Možete dodati najviše 3 dodatne slike, uzete su prve 3.";

      const prveTri = izabrani.slice(0, 3);

      this.jsonDodatneSlike[sifra] = prveTri;

      const noviPrijenos = new DataTransfer();

      for (let fajl of prveTri) {
        noviPrijenos.items.add(fajl);
      }

      input.files = noviPrijenos.files;

      return
    }

    this.jsonDodatneSlike[sifra] = izabrani;
  }


  uvezi() {

    if (this.jsonProizvodi.length == 0) {
      return
    }

    let uspjesno = 0;
    const ukupno = this.jsonProizvodi.length;

    const sledeci = (indeks: number) => {

      if (indeks >= ukupno) {

        this.jsonPoruka =
          "Uvezeno " + uspjesno + " od " + ukupno + " proizvoda.";

        this.jsonProizvodi = [];
        this.jsonSlike = {};
        this.jsonDodatneSlike = {};

        this.ucitajProizvode(
          this.korisnik.stamparijaId
        );

        return
      }

      const stavka = this.jsonProizvodi[indeks];

      const data = new FormData();

      data.append("stamparijaId", this.korisnik.stamparijaId);
      data.append("nazivStamparije", this.korisnik.nazivInstitucije);
      data.append("sifra", stavka.sifra);
      data.append("naziv", stavka.naziv);
      data.append("opis", stavka.opis);
      data.append("kategorija", stavka.kategorija);
      data.append("potkategorija", stavka.potkategorija);
      data.append("jedinicnaCena", String(stavka.jedinicnaCena));
      data.append("kolicinaNaLageru", String(stavka.kolicinaNaLageru));
      data.append("dostupneBoje", JSON.stringify(stavka.dostupneBoje || []));
      data.append("uslugeStampe", JSON.stringify(stavka.uslugeStampe || []));

      const slika = this.jsonSlike[stavka.sifra];

      if (slika != null) {
        data.append("slika", slika);
      }

      const dodatneSlike = this.jsonDodatneSlike[stavka.sifra] || [];

      for (let dodatnaSlika of dodatneSlike) {
        data.append("dodatneSlike", dodatnaSlika);
      }

      this.proizvodServis
        .dodajProizvod(data)
        .subscribe((odgovor) => {

          if (odgovor.poruka == "ok") {
            uspjesno++;
          }

          sledeci(indeks + 1);
        });
    }

    sledeci(0);
  }


  promijeniKolicinu(
    proizvod: Proizvod
  ) {

    if (
      proizvod.kolicinaNaLageru < 0
    ) {

      this.poruka =
        "Količina ne može biti negativna.";

      return
    }


    this.proizvodServis
      .azurirajKolicinu(
        proizvod.sifra,
        this.korisnik.stamparijaId,
        proizvod.kolicinaNaLageru
      )
      .subscribe((odgovor) => {

        if (odgovor.poruka == "ok") {

          this.poruka =
            "Količina je ažurirana.";

        }
        else {

          this.poruka =
            odgovor.poruka;
        }
      });
  }


  izabranaProfilnaSlika(
    event: Event
  ) {

    const input =
      event.target as HTMLInputElement;

    if (
      input.files == null ||
      input.files.length == 0
    ) {
      return;
    }

    const file = input.files[0];

    if (
      file.type != "image/jpeg" &&
      file.type != "image/png" &&
      file.type != "image/gif"
    ) {
      this.poruka = "Profilna slika mora biti JPG, PNG ili GIF.";
      this.novaProfilnaSlika = null;
      input.value = "";
      return;
    }

    const img = new Image();

    img.onload = () => {

      if (
        img.width < 100 || img.width > 250 ||
        img.height < 100 || img.height > 250
      ) {
        this.poruka = "Profilna slika mora biti dimenzija od 100x100 do 250x250 piksela.";
        this.novaProfilnaSlika = null;
        input.value = "";
        return;
      }

      this.novaProfilnaSlika = file;
      this.poruka = "";
    }

    img.src = URL.createObjectURL(file);
  }


  azurirajProfil() {

    this.poruka = "";

    if (
      this.korisnik.ime == "" ||
      this.korisnik.prezime == "" ||
      this.korisnik.telefon == "" ||
      this.korisnik.email == "" ||
      this.korisnik.nazivInstitucije == "" ||
      this.korisnik.adresa == "" ||
      this.korisnik.grad == "" ||
      this.korisnik.maticniBroj == "" ||
      this.korisnik.pib == ""
    ) {
      this.poruka = "Unesite sve obavezne podatke.";
      return;
    }

    if (!/^\+?\d{6,15}$/.test(this.korisnik.telefon)) {
      this.poruka = "Telefon mora sadržati samo cifre (6 do 15 cifara).";
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.korisnik.email)) {
      this.poruka = "Unesite ispravnu e-mail adresu.";
      return;
    }

    if (!/^\d{8}$/.test(this.korisnik.maticniBroj)) {
      this.poruka = "Matični broj mora imati tačno 8 cifara.";
      return;
    }

    if (!/^[1-9]\d{8}$/.test(this.korisnik.pib)) {
      this.poruka = "PIB mora imati 9 cifara i ne smije počinjati nulom.";
      return;
    }

    const data =
      new FormData();


    data.append(
      "kor_ime",
      this.korisnik.kor_ime
    );

    data.append(
      "ime",
      this.korisnik.ime
    );

    data.append(
      "prezime",
      this.korisnik.prezime
    );

    data.append(
      "telefon",
      this.korisnik.telefon
    );

    data.append(
      "email",
      this.korisnik.email
    );

    data.append(
      "nazivInstitucije",
      this.korisnik.nazivInstitucije
    );

    data.append(
      "adresa",
      this.korisnik.adresa
    );

    data.append(
      "grad",
      this.korisnik.grad
    );

    data.append(
      "maticniBroj",
      this.korisnik.maticniBroj
    );

    data.append(
      "pib",
      this.korisnik.pib
    );


    if (
      this.novaProfilnaSlika != null
    ) {

      data.append(
        "slika",
        this.novaProfilnaSlika
      );
    }


    this.korisnikServis
      .azurirajProfil(data)
      .subscribe((odgovor) => {

        if (
          odgovor.poruka == "ok"
        ) {

          this.korisnik =
            odgovor.korisnik;

          localStorage.setItem(
            "ulogovan",
            JSON.stringify(
              odgovor.korisnik
            )
          );

          this.poruka =
            "Profil je ažuriran.";

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

  ucitajNarudzbine(stamparijaId: string) {

    this.narudzbinaServis
      .narudzbineStamparije(stamparijaId)
      .subscribe((narudzbine) => {

        this.narudzbine = narudzbine;
      });
}


promijeniStatus(
    idFakture: string,
    noviStatus: string
) {

    this.narudzbinaServis
      .promijeniStatus(
        idFakture,
        this.korisnik.stamparijaId,
        noviStatus
      )
      .subscribe((odgovor) => {

        if (odgovor.poruka == "ok") {

          this.poruka =
            "Status narudžbine je promijenjen.";

          this.ucitajNarudzbine(
            this.korisnik.stamparijaId
          );
        }
        else {

          this.poruka = odgovor.poruka;
        }

      });
}

mojaPonuda(
  nabavka: JavnaNabavka
) {

  if (nabavka.ponude == null) {
    return null;
  }

  return nabavka.ponude.find(
    (p: any) =>
      p.stamparijaId == this.korisnik.stamparijaId
  ) || null;
}


ucitajJavneNabavke() {

  this.javnaNabavkaServis
    .otvorene()
    .subscribe((nabavke) => {

      this.javneNabavke =
        nabavke;
    });
}


ucitajZavrseneNabavke(
  stamparijaId: string
) {

  this.javnaNabavkaServis
    .zavrseneNabavke(stamparijaId)
    .subscribe((nabavke) => {

      this.zavrseneNabavke =
        nabavke;
    });
}


nazivPobjednika(
  nabavka: JavnaNabavka
) {

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


jesamPobjednik(
  nabavka: JavnaNabavka
) {

  return (
    nabavka.pobjednik ==
    this.korisnik.stamparijaId
  );
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


posaljiPonudu(
  nabavka: JavnaNabavka
) {

  const iznos =
    Number(
      this.iznosiPonuda[nabavka.id]
    );


  if (
    isNaN(iznos) ||
    iznos <= 0
  ) {

    this.ponudaPoruke[nabavka.id] =
      "Unesite ispravan iznos ponude.";

    return;
  }


  this.javnaNabavkaServis
    .posaljiPonudu(

      nabavka.id,

      this.korisnik.stamparijaId,

      this.korisnik.nazivInstitucije,

      iznos
    )
    .subscribe((odgovor) => {

      if (odgovor.poruka == "ok") {

        this.iznosiPonuda[nabavka.id] = null;

        this.ucitajJavneNabavke();
      }
      else {

        this.ponudaPoruke[nabavka.id] =
          odgovor.poruka;
      }

    });
}
}