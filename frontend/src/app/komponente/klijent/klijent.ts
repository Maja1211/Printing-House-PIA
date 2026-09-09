import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { Korisnik } from '../../models/Korisnik';
import { Narudzbina } from '../../models/Narudzbina';

import { KorisnikService } from '../../servisi/korisnik.service';
import { NarudzbinaService } from '../../servisi/narudzbina.service';

declare var Stripe: any;

const STRIPE_PUBLISHABLE_KEY =
  'pk_test_51UCGe6CgTp4uC6syxK8E6jnC6mu6dh9fy6z0BQH9ZU02KiNU7ty9ZB6dGO7cFlKOZu7ynrV0hsVE1TJrARGbWeMV00NRLXGvfq';

@Component({
  selector: 'app-klijent',
  imports: [FormsModule],
  templateUrl: './klijent.html',
  styleUrl: './klijent.css'
})
export class Klijent implements OnInit {

  korisnik: Korisnik = new Korisnik();
  narudzbine: Narudzbina[] = [];

  slika: File | null = null;
  previewSlika: string | null = null;
  poruka: string = "";

  poljeSortiranja: string = "";
  rastuce: boolean = true;

  narudzbinaZaOtkazivanje: string = "";
  narudzbinaZaPlacanje: string = "";
  tipKartice: string = "";
  porukaPlacanja: string = "";

  stripe: any = null;
  stripeElements: any = null;
  stripeKartica: any = null;
  stripeDatum: any = null;
  stripeCvc: any = null;
  stripeUcitavanje: boolean = false;

  constructor(
    private korisnikServis: KorisnikService,
    private narudzbinaServis: NarudzbinaService,
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

    this.ucitajProfil(ulogovan.kor_ime);
    this.ucitajNarudzbine(ulogovan.kor_ime);
  }

  ucitajProfil(kor_ime: string) {
    this.korisnikServis.profil(kor_ime).subscribe((korisnik) => {
      if (korisnik != null) {
        this.korisnik = korisnik;
      }
    });
  }

  ucitajNarudzbine(kor_ime: string) {
    this.narudzbinaServis.narudzbineKorisnika(kor_ime)
      .subscribe((narudzbine) => {
        this.narudzbine = narudzbine;
      });
  }

  izabranaSlika(event: Event) {
    const input = event.target as HTMLInputElement;

    if (input.files == null || input.files.length == 0) {
      return;
    }

    const file = input.files[0];

    if (
      file.type != "image/jpeg" &&
      file.type != "image/png" &&
      file.type != "image/gif"
    ) {
      this.poruka = "Slika mora biti JPG, PNG ili GIF.";
      this.slika = null;
      input.value = "";
      return;
    }

    const img = new Image();

    img.onload = () => {
      if (
        img.width < 100 || img.width > 250 ||
        img.height < 100 || img.height > 250
      ) {
        this.poruka = "Slika mora biti dimenzija od 100x100 do 250x250 piksela.";
        this.slika = null;
        input.value = "";
        return;
      }

      this.slika = file;
      this.poruka = "";
      this.previewSlika = img.src;
    }

    img.src = URL.createObjectURL(file);
  }

  azurirajProfil() {
    this.poruka = "";

    if (
      this.korisnik.ime == "" ||
      this.korisnik.prezime == "" ||
      this.korisnik.telefon == "" ||
      this.korisnik.email == ""
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

    if (this.korisnik.vrstaKlijenta == "pravno") {
      if (
        this.korisnik.nazivInstitucije == "" ||
        this.korisnik.adresa == "" ||
        this.korisnik.grad == "" ||
        this.korisnik.maticniBroj == "" ||
        this.korisnik.pib == ""
      ) {
        this.poruka = "Unesite sve podatke o instituciji.";
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
    }

    const data = new FormData();

    data.append("kor_ime", this.korisnik.kor_ime);

    data.append("ime", this.korisnik.ime);
    data.append("prezime", this.korisnik.prezime);
    data.append("telefon", this.korisnik.telefon);
    data.append("email", this.korisnik.email);

    data.append("nazivInstitucije", this.korisnik.nazivInstitucije);
    data.append("adresa", this.korisnik.adresa);
    data.append("grad", this.korisnik.grad);
    data.append("maticniBroj", this.korisnik.maticniBroj);
    data.append("pib", this.korisnik.pib);

    if (this.slika != null) {
      data.append("slika", this.slika);
    }

    this.korisnikServis.azurirajProfil(data)
      .subscribe((odgovor) => {
        if (odgovor.poruka == "ok") {
          this.korisnik = odgovor.korisnik;

          localStorage.setItem("ulogovan", JSON.stringify(odgovor.korisnik));

          this.poruka = "Podaci su uspješno ažurirani.";
          this.slika = null;
          this.previewSlika = null;
        }
        else {
          this.poruka = odgovor.poruka;
        }
      });
  }

  sortirajNarudzbine(polje: string) {
    if (this.poljeSortiranja == polje) {
      this.rastuce = !this.rastuce;
    }
    else {
      this.poljeSortiranja = polje;
      this.rastuce = true;
    }

    this.narudzbine.sort((a: any, b: any) => {
      let prvi = a[polje];
      let drugi = b[polje];

      if (typeof prvi == "string") {
        prvi = prvi.toLowerCase();
        drugi = drugi.toLowerCase();
      }

      if (prvi < drugi) {
        return this.rastuce ? -1 : 1;
      }

      if (prvi > drugi) {
        return this.rastuce ? 1 : -1;
      }

      return 0;
    });
  }

  otkaziNarudzbinu(narudzbina: Narudzbina) {
    this.narudzbinaZaOtkazivanje = narudzbina.idFakture;
  }

  odustaniOdOtkazivanja() {
    this.narudzbinaZaOtkazivanje = "";
  }

  potvrdiOtkazivanje(narudzbina: Narudzbina) {
    this.narudzbinaZaOtkazivanje = "";

    this.narudzbinaServis.otkaziNarudzbinu(narudzbina.idFakture, this.korisnik.kor_ime)
      .subscribe((odgovor) => {
        if (odgovor.poruka == "ok") {
          this.poruka = "Narudžbina je otkazana.";
          this.ucitajNarudzbine(this.korisnik.kor_ime);
        }
        else {
          this.poruka = odgovor.poruka;
        }
      });
  }

  otvoriPlacanje(narudzbina: Narudzbina) {
    this.narudzbinaZaPlacanje = narudzbina.idFakture;
    this.tipKartice = "";
    this.porukaPlacanja = "";

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

  odustaniOdPlacanja() {
    this.narudzbinaZaPlacanje = "";
    this.odmontirajStripePolja();
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

  async potvrdiPlacanje(narudzbina: Narudzbina) {
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
      narudzbina.idFakture,
      this.korisnik.kor_ime,
      this.tipKartice,
      rezultat.paymentMethod.id
    ).subscribe((odgovor) => {
      if (odgovor.poruka == "ok") {
        this.odustaniOdPlacanja();
        this.narudzbinaZaPlacanje = "";
        this.poruka = "Narudžbina je uspješno plaćena.";
        this.ucitajNarudzbine(this.korisnik.kor_ime);
      }
      else {
        this.porukaPlacanja = odgovor.poruka;
      }
    });
  }

  odjava() {
    localStorage.removeItem("ulogovan");
    localStorage.removeItem("korpa");
    this.router.navigate(['/']);
  }
}
