import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { KorisnikService } from '../../servisi/korisnik.service';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {

  kor_ime: string = "";
  lozinka: string = "";
  poruka: string = "";

  constructor(
    private servis: KorisnikService,
    private router: Router
  ) {}

  login() {
    this.poruka = "";

    this.servis.login(this.kor_ime, this.lozinka).subscribe(korisnik => {

      if (korisnik == null) {
        this.poruka = "Pogrešno korisničko ime ili lozinka.";
        return;
      }

      localStorage.setItem("ulogovan", JSON.stringify(korisnik));

      if (korisnik.tip == "klijent") {
        this.router.navigate(['/klijent']);
      }
      else if (korisnik.tip == "stampar") {
        this.router.navigate(['/stampar']);
      }
    });
  }
}