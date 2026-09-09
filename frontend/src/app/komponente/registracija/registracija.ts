import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { KorisnikService } from '../../servisi/korisnik.service';

@Component({
  selector: 'app-registracija',
  imports: [FormsModule],
  templateUrl: './registracija.html',
  styleUrl: './registracija.css'
})
export class Registracija {

  kor_ime: string = "";
  lozinka: string = "";
  ime: string = "";
  prezime: string = "";
  telefon: string = "";
  email: string = "";

  tip: string = "klijent";
  vrstaKlijenta: string = "fizicko";

  nazivInstitucije: string = "";
  adresa: string = "";
  grad: string = "";
  maticniBroj: string = "";
  pib: string = "";

  slika: File | null = null;

  poruka: string = "";

  constructor(
    private servis: KorisnikService,
    private router: Router
  ) {}

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
  }

  img.src = URL.createObjectURL(file);
}

  registracija() {

    this.poruka = "";

    if (
      this.kor_ime == "" ||
      this.lozinka == "" ||
      this.ime == "" ||
      this.prezime == "" ||
      this.telefon == "" ||
      this.email == ""
    ) {
      this.poruka = "Unesite sve obavezne podatke.";
      return;
    }

const regexLozinka =
  /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9])[A-Za-z].{7,11}$/;

    if (!regexLozinka.test(this.lozinka)) {
      this.poruka = "Lozinka nije u odgovarajućem formatu.";
      return;
    }

    const regexTelefon = /^\+?\d{6,15}$/;

    if (!regexTelefon.test(this.telefon)) {
      this.poruka = "Telefon mora sadržati samo cifre (6 do 15 cifara).";
      return;
    }

    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!regexEmail.test(this.email)) {
      this.poruka = "Unesite ispravnu e-mail adresu.";
      return;
    }

    if (this.vrstaKlijenta == "pravno" || this.tip == "stampar") {

      if (
        this.nazivInstitucije == "" ||
        this.adresa == "" ||
        this.grad == "" ||
        this.maticniBroj == "" ||
        this.pib == ""
      ) {
        this.poruka = "Unesite podatke o instituciji.";
        return;
      }

      if (!/^\d{8}$/.test(this.maticniBroj)) {
        this.poruka = "Matični broj mora imati tačno 8 cifara.";
        return;
      }

      if (!/^[1-9]\d{8}$/.test(this.pib)) {
        this.poruka = "PIB mora imati 9 cifara i ne smije počinjati nulom.";
        return;
      }
    }

    const data = new FormData();

    data.append("kor_ime", this.kor_ime);
    data.append("lozinka", this.lozinka);
    data.append("ime", this.ime);
    data.append("prezime", this.prezime);
    data.append("telefon", this.telefon);
    data.append("email", this.email);

    data.append("tip", this.tip);
    data.append("vrstaKlijenta", this.vrstaKlijenta);

    data.append("nazivInstitucije", this.nazivInstitucije);
    data.append("adresa", this.adresa);
    data.append("grad", this.grad);
    data.append("maticniBroj", this.maticniBroj);
    data.append("pib", this.pib);

    if (this.slika != null) {
      data.append("slika", this.slika);
    }

    this.servis.registracija(data).subscribe((odgovor) => {

      if (odgovor.poruka == "ok") {
        this.router.navigate(['/login']);
      }
      else {
        this.poruka = odgovor.poruka;
      }
    });
  }
}