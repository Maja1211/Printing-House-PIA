import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { KorpaService } from '../../servisi/korpa.service';
import { NarudzbinaService } from '../../servisi/narudzbina.service';

import { JavnaNabavkaService } from '../../servisi/javna-nabavka.service';

declare var Stripe: any;

const STRIPE_PUBLISHABLE_KEY =
  'pk_test_51UCGe6CgTp4uC6syxK8E6jnC6mu6dh9fy6z0BQH9ZU02KiNU7ty9ZB6dGO7cFlKOZu7ynrV0hsVE1TJrARGbWeMV00NRLXGvfq';

@Component({
  selector: 'app-korpa',
  imports: [FormsModule],
  templateUrl: './korpa.html',
  styleUrl: './korpa.css',
})
export class Korpa implements OnInit {

  stavke: any[] = [];
  poruka: string = "";
  vrstaKlijenta: string = "";
  korIme: string = "";
  potvrdaUToku: boolean = false;

  redFaktura: any[] = [];
  trenutnaFaktura: any = null;
  placanjeZavrseno: boolean = false;

  tipKartice: string = "";
  porukaPlacanja: string = "";

  stripe: any = null;
  stripeElements: any = null;
  stripeKartica: any = null;
  stripeDatum: any = null;
  stripeCvc: any = null;
  stripeUcitavanje: boolean = false;

  constructor(
    private korpaServis: KorpaService,
    private narudzbinaServis: NarudzbinaService,
    private javnaNabavkaServis: JavnaNabavkaService,
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

    this.stavke = this.korpaServis.dohvatiKorpu();
    this.vrstaKlijenta = ulogovan.vrstaKlijenta;
    this.korIme = ulogovan.kor_ime;
  }

  grupisaneStavke(): any[] {
    const grupe: any[] = [];

    for (let i = 0; i < this.stavke.length; i++) {
      const stavka = this.stavke[i];
      let grupa = grupe.find(g => g.nazivStamparije == stavka.nazivStamparije);

      if (grupa == null) {
        grupa = {
          nazivStamparije: stavka.nazivStamparije,
          stavke: []
        };
        grupe.push(grupa);
      }

      grupa.stavke.push({
        ...stavka,
        originalniIndex: i
      });
    }

    return grupe;
  }

  obrisi(index: number) {
    this.korpaServis.obrisi(index);
    this.stavke = this.korpaServis.dohvatiKorpu();
  }

  ukupno(): number {
    let suma = 0;
    for (let stavka of this.stavke) {
      suma += stavka.ukupnaCena;
    }
    return suma;
  }

  potvrdi() {
    if (this.stavke.length == 0) {
      this.poruka = "Korpa je prazna.";
      return;
    }

    if (this.potvrdaUToku) {
      return;
    }

    const podatak = localStorage.getItem("ulogovan");
    if (podatak == null) {
      this.router.navigate(['/login']);
      return;
    }

    const korisnik = JSON.parse(podatak);

    this.potvrdaUToku = true;

    if (korisnik.vrstaKlijenta == "pravno") {
      this.javnaNabavkaServis.kreiraj(korisnik.kor_ime, this.stavke).subscribe((odgovor) => {
        this.potvrdaUToku = false;

        if (odgovor.poruka == "ok") {
          this.korpaServis.isprazni();
          this.stavke = [];
          this.poruka = "Javna nabavka je uspješno otvorena.";
        }
        else {
          this.poruka = odgovor.poruka;
        }
      });
      return;
    }

    this.narudzbinaServis.potvrdiNarudzbinu(korisnik.kor_ime, this.stavke).subscribe((odgovor) => {
      this.potvrdaUToku = false;

      if (odgovor.poruka == "ok") {
        this.korpaServis.isprazni();
        this.stavke = [];
        this.poruka = "";

        this.redFaktura = odgovor.narudzbine || [];
        this.placanjeZavrseno = false;
        this.sledecaFaktura();
      }
      else {
        this.poruka = odgovor.poruka;
      }
    });
  }

  sledecaFaktura() {
    this.tipKartice = "";
    this.porukaPlacanja = "";

    if (this.redFaktura.length == 0) {
      this.trenutnaFaktura = null;
      this.placanjeZavrseno = true;
      return;
    }

    this.trenutnaFaktura = this.redFaktura.shift();

    setTimeout(() => {
      this.pripremiStripeElement();
    });
  }

  pripremiStripeElement() {
    this.odmontirajStripePolja();

    if (this.stripe == null) {
      this.stripe = Stripe(STRIPE_PUBLISHABLE_KEY);
    }

    this.stripeElements = this.stripe.elements();

    this.stripeKartica = this.stripeElements.create('cardNumber');
    this.stripeDatum = this.stripeElements.create('cardExpiry');
    this.stripeCvc = this.stripeElements.create('cardCvc');

    this.montirajStripePolja();

    setTimeout(() => {
      const kartica = document.querySelector('#stripe-broj-kartice iframe');
      const datum = document.querySelector('#stripe-datum iframe');
      const cvc = document.querySelector('#stripe-cvc iframe');
      if (kartica == null || datum == null || cvc == null) {
        this.montirajStripePolja();
      }
    }, 1000);
  }

  montirajStripePolja() {
    if (this.stripeKartica != null) {
      try {
        this.stripeKartica.mount('#stripe-broj-kartice');
      }
      catch {}
    }
    if (this.stripeDatum != null) {
      try {
        this.stripeDatum.mount('#stripe-datum');
      }
      catch {}
    }
    if (this.stripeCvc != null) {
      try {
        this.stripeCvc.mount('#stripe-cvc');
      }
      catch {}
    }
  }

  odmontirajStripePolja() {
    if (this.stripeKartica != null) {
      this.stripeKartica.unmount();
      this.stripeKartica = null;
    }
    if (this.stripeDatum != null) {
      this.stripeDatum.unmount();
      this.stripeDatum = null;
    }
    if (this.stripeCvc != null) {
      this.stripeCvc.unmount();
      this.stripeCvc = null;
    }
  }

  porukaGreskeKartice(kod: string): string {
    if (kod == "incomplete_number") {
      return "Unesite broj kartice.";
    }
    if (kod == "invalid_number") {
      return "Broj kartice nije ispravan.";
    }
    if (kod == "incomplete_expiry") {
      return "Unesite datum isticanja kartice.";
    }
    if (kod == "invalid_expiry_month_past" || kod == "invalid_expiry_year_past") {
      return "Datum isticanja kartice je istekao.";
    }
    if (kod == "incomplete_cvc") {
      return "Unesite CVC kod.";
    }
    if (kod == "invalid_cvc") {
      return "CVC kod nije ispravan.";
    }
    return "Provjerite podatke o kartici (broj, datum i CVC kod).";
  }

  async potvrdiPlacanje() {
    this.porukaPlacanja = "";

    if (this.tipKartice.trim() == "") {
      this.porukaPlacanja = "Izaberite tip kartice.";
      return;
    }

    if (this.stripe == null || this.stripeKartica == null) {
      this.porukaPlacanja = "Forma za plaćanje nije spremna, pokušajte ponovo.";
      return;
    }

    this.stripeUcitavanje = true;

    let rezultat: any;

    try {
      rezultat = await this.stripe.createPaymentMethod({
        type: 'card',
        card: this.stripeKartica
      });
    }
    catch {
      this.stripeUcitavanje = false;
      this.porukaPlacanja = "Forma za plaćanje nije spremna, pokušajte ponovo.";
      return;
    }

    this.stripeUcitavanje = false;

    if (rezultat.error) {
      this.porukaPlacanja = this.porukaGreskeKartice(rezultat.error.code);
      return;
    }

    this.narudzbinaServis.platiNarudzbinu(
      this.trenutnaFaktura.idFakture,
      this.korIme,
      this.tipKartice,
      rezultat.paymentMethod.id
    ).subscribe((odgovor) => {
      if (odgovor.poruka == "ok") {
        this.odmontirajStripePolja();
        this.sledecaFaktura();
      }
      else {
        this.porukaPlacanja = odgovor.poruka;
      }
    });
  }

  preskociPlacanje() {
    this.odmontirajStripePolja();
    this.sledecaFaktura();
  }

  nazad() {
    this.router.navigate(['/pretraga-klijent']);
  }

  odjava() {
    localStorage.removeItem("ulogovan");
    localStorage.removeItem("korpa");
    this.router.navigate(['/']);
  }
}
