import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { KorisnikService } from '../../servisi/korisnik.service';

@Component({
  selector: 'app-admin-login',
  imports: [FormsModule],
  templateUrl: './admin-login.html',
  styleUrl: './admin-login.css'
})
export class AdminLogin {

  kor_ime: string = "";
  lozinka: string = "";
  poruka: string = "";

  constructor(
    private servis: KorisnikService,
    private router: Router
  ) {}

  login() {
    this.poruka = "";

    this.servis.adminLogin(this.kor_ime, this.lozinka).subscribe(korisnik => {

      if (korisnik == null) {
        this.poruka = "Pogrešno korisničko ime ili lozinka.";
        return;
      }

      localStorage.setItem("ulogovan", JSON.stringify(korisnik));

      this.router.navigate(['/admin']);
    });
  }
}