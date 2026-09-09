import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { KorisnikService } from '../../servisi/korisnik.service';

@Component({
  selector: 'app-nova-lozinka',
  imports: [FormsModule],
  templateUrl: './nova-lozinka.html',
  styleUrl: './nova-lozinka.css',
})
export class NovaLozinka implements OnInit {

  token: string = "";

  novaLozinka: string = "";

  poruka: string = "";

  uspjesno: boolean = false;

  stanjeLinka: 'provjera' | 'vazi' | 'nevazi' = 'provjera';

  constructor(
    private ruta: ActivatedRoute,
    private korisnikServis: KorisnikService,
    private router: Router
  ) {}

  ngOnInit(): void {

    this.token =
      this.ruta.snapshot.paramMap.get('token') || "";

    this.korisnikServis
      .provjeriResetToken(this.token)
      .subscribe((odgovor) => {

        this.stanjeLinka =
          odgovor.vazi ? 'vazi' : 'nevazi';
      });
  }

  postaviLozinku() {

    this.poruka = "";

    const regexLozinka =
      /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9])[A-Za-z].{7,11}$/;

    if (!regexLozinka.test(this.novaLozinka)) {
      this.poruka = "Lozinka nije u odgovarajućem formatu.";
      return;
    }

    this.korisnikServis
      .postaviNovuLozinku(this.token, this.novaLozinka)
      .subscribe((odgovor) => {

        if (odgovor.poruka == "ok") {

          this.uspjesno = true;

          this.poruka =
            "Lozinka je uspješno promijenjena. Sada se možete prijaviti.";
        }
        else {
          this.poruka = odgovor.poruka;
        }

      });
  }
}
