import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KorisnikService } from '../../servisi/korisnik.service';

@Component({
  selector: 'app-zaboravljena-lozinka',
  imports: [FormsModule],
  templateUrl: './zaboravljena-lozinka.html',
  styleUrl: './zaboravljena-lozinka.css',
})
export class ZaboravljenaLozinka {

  korisnickoImeIliEmail: string = "";

  poruka: string = "";

  constructor(
    private korisnikServis: KorisnikService
  ) {}

  posaljiZahtjev() {

    this.poruka = "";

    if (this.korisnickoImeIliEmail.trim() == "") {
      this.poruka = "Unesite korisničko ime ili e-mail.";
      return;
    }

    this.korisnikServis
      .zatraziResetovanjeLozinke(this.korisnickoImeIliEmail)
      .subscribe((odgovor) => {

        if (odgovor.poruka == "ok") {
          this.poruka =
            "Poslali smo Vam e-mail sa linkom za poništavanje lozinke. Link važi 5 minuta.";
        }
        else {
          this.poruka = odgovor.poruka;
        }

      });
  }
}
