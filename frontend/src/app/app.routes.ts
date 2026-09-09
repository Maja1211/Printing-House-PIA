import { Routes } from '@angular/router';

import { Pocetna } from './komponente/pocetna/pocetna';
import { Login } from './komponente/login/login';
import { AdminLogin } from './komponente/admin-login/admin-login';
import { Registracija } from './komponente/registracija/registracija';

import { Klijent } from './komponente/klijent/klijent';
import { Stampar } from './komponente/stampar/stampar';
import { Admin } from './komponente/admin/admin';

import { DetaljiProizvoda } from './komponente/detalji-proizvoda/detalji-proizvoda';
import { PretragaKlijent } from './komponente/pretraga-klijent/pretraga-klijent';
import { DetaljiKlijent } from './komponente/detalji-klijent/detalji-klijent';

import { PripremaProizvoda } from './komponente/priprema-proizvoda/priprema-proizvoda';
import { Korpa } from './komponente/korpa/korpa';

import { ArhivaKlijent } from './komponente/arhiva-klijent/arhiva-klijent';
import { JavneNabavke } from './komponente/javne-nabavke/javne-nabavke';

import { ZaboravljenaLozinka } from './komponente/zaboravljena-lozinka/zaboravljena-lozinka';
import { NovaLozinka } from './komponente/nova-lozinka/nova-lozinka';

export const routes: Routes = [

   
    { path: '', component: Pocetna },
    { path: 'login', component: Login },
    { path: 'registracija', component: Registracija },
    { path: 'zaboravljena-lozinka', component: ZaboravljenaLozinka },
    { path: 'nova-lozinka/:token', component: NovaLozinka },
    { path: 'admin-login', component: AdminLogin },

    
    { path: 'klijent', component: Klijent },
    { path: 'stampar', component: Stampar },
    { path: 'admin', component: Admin },
    { path: 'pretraga-klijent', component: PretragaKlijent },
    { path: 'klijent-proizvod/:sifra', component: DetaljiKlijent },
    { path: 'proizvod/:sifra', component: DetaljiProizvoda },
    {path: 'priprema-proizvoda/:sifra', component: PripremaProizvoda},

    {path: 'korpa',component: Korpa},
    {path: 'arhiva-klijent',component: ArhivaKlijent},
    {path: 'javne-nabavke',component: JavneNabavke},
    { path: '**', redirectTo: '' },
];