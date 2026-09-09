import express from 'express'
import crypto from 'crypto'
import KorisnikModel from '../models/Korisnik'
import bcrypt from 'bcryptjs'
import { posaljiEmail } from '../servisi/EmailServis'

export class KorisnikKontroler {

    login = (req: express.Request, res: express.Response) => {
        KorisnikModel.findOne({
            kor_ime: req.body.kor_ime,
            status: "aktivan"
        }).then((korisnik) => {

            if (korisnik == null) {
                res.json(null)
                return
            }

            if (korisnik.tip == "admin") {
                res.json(null)
                return
            }

            if (bcrypt.compareSync(req.body.lozinka, korisnik.lozinka as string)) {
                res.json(korisnik)
            }
            else {
                res.json(null)
            }

        }).catch(() => {
            res.json(null)
        })
    }

    adminLogin = (req: express.Request, res: express.Response) => {
        KorisnikModel.findOne({
            kor_ime: req.body.kor_ime,
            tip: "admin",
            status: "aktivan"
        }).then((korisnik) => {

            if (korisnik == null) {
                res.json(null)
                return
            }

            if (bcrypt.compareSync(req.body.lozinka, korisnik.lozinka as string)) {
                res.json(korisnik)
            }
            else {
                res.json(null)
            }

        }).catch(() => {
            res.json(null)
        })
    }

    registracija = async (req: express.Request, res: express.Response) => {
    try {
        if (req.body.tip != "klijent" && req.body.tip != "stampar") {
            res.json({ poruka: "Neispravan tip naloga." })
            return
        }

        if (
            req.body.tip == "klijent" &&
            req.body.vrstaKlijenta != "fizicko" &&
            req.body.vrstaKlijenta != "pravno"
        ) {
            res.json({ poruka: "Neispravna vrsta klijenta." })
            return
        }

        const postojiKorisnickoIme = await KorisnikModel.findOne({ kor_ime: req.body.kor_ime })

        if (postojiKorisnickoIme != null) {
            res.json({ poruka: "Korisničko ime već postoji." })
            return
        }

        const regexLozinka = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9])[A-Za-z].{7,11}$/

        if (!regexLozinka.test(req.body.lozinka)) {
            res.json({ poruka: "Lozinka nije u odgovarajućem formatu." })
            return
        }

        const regexTelefon = /^\+?\d{6,15}$/

        if (!regexTelefon.test(req.body.telefon)) {
            res.json({ poruka: "Telefon mora sadržati samo cifre (6 do 15 cifara)." })
            return
        }

        const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

        if (!regexEmail.test(req.body.email)) {
            res.json({ poruka: "Unesite ispravnu e-mail adresu." })
            return
        }

        const postojiEmail = await KorisnikModel.findOne({ email: req.body.email })

        if (postojiEmail != null) {
            res.json({ poruka: "E-mail već postoji." })
            return
        }

        if (req.body.vrstaKlijenta == "pravno" || req.body.tip == "stampar") {
            if (!/^\d{8}$/.test(req.body.maticniBroj)) {
                res.json({ poruka: "Matični broj mora imati tačno 8 cifara." })
                return
            }

            const postojiMaticni = await KorisnikModel.findOne({ maticniBroj: req.body.maticniBroj })

            if (postojiMaticni != null) {
                res.json({ poruka: "Matični broj već postoji." })
                return
            }

            if (!/^[1-9]\d{8}$/.test(req.body.pib)) {
                res.json({ poruka: "PIB mora imati 9 cifara i ne smije počinjati nulom." })
                return
            }

            const postojiPib = await KorisnikModel.findOne({ pib: req.body.pib })

            if (postojiPib != null) {
                res.json({ poruka: "PIB već postoji." })
                return
            }
        }

        const sifrovanaLozinka = await bcrypt.hash(req.body.lozinka, 10)

        let slika = "default_profile_image.jpg"
        if (req.file != null) {
            slika = req.file.filename
        }

        let stamparijaId = ""
        if (req.body.tip == "stampar") {
            stamparijaId = "stampa_" + Date.now()
        }

        const korisnik = new KorisnikModel({
            kor_ime: req.body.kor_ime,
            lozinka: sifrovanaLozinka,
            ime: req.body.ime,
            prezime: req.body.prezime,
            telefon: req.body.telefon,
            email: req.body.email,
            tip: req.body.tip,
            vrstaKlijenta: req.body.vrstaKlijenta,
            slika: slika,
            status: "ceka",
            nazivInstitucije: req.body.nazivInstitucije,
            adresa: req.body.adresa,
            grad: req.body.grad,
            maticniBroj: req.body.maticniBroj,
            pib: req.body.pib,
            stamparijaId: stamparijaId
        })

        await korisnik.save()

        res.json({ poruka: "ok" })
    }
    catch (err: any) {

        if (err.code == 11000) {
            res.json({ poruka: "Korisničko ime ili e-mail već postoji." })
            return
        }

        console.log(err)
        res.json({ poruka: "Greška pri registraciji." })
    }
}

brojStamparija = (req: express.Request, res: express.Response) => {
    KorisnikModel.countDocuments({
        tip: "stampar",
        status: "aktivan"
    }).then((broj) => {
        res.json(broj)
    }).catch(() => {
        res.json(0)
    })
}

profil = (req: express.Request, res: express.Response) => {
    KorisnikModel.findOne({
        kor_ime: req.params.kor_ime
    }).then((korisnik) => {
        res.json(korisnik)
    }).catch(() => {
        res.json(null)
    })
}

azurirajProfil = async (req: express.Request, res: express.Response) => {
    try {
        const korisnik = await KorisnikModel.findOne({ kor_ime: req.body.kor_ime })

        if (korisnik == null) {
            res.json({ poruka: "Korisnik ne postoji." })
            return
        }

        if (!/^\+?\d{6,15}$/.test(req.body.telefon)) {
            res.json({ poruka: "Telefon mora sadržati samo cifre (6 do 15 cifara)." })
            return
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(req.body.email)) {
            res.json({ poruka: "Unesite ispravnu e-mail adresu." })
            return
        }

        const postojiEmail = await KorisnikModel.findOne({
            email: req.body.email,
            kor_ime: { $ne: req.body.kor_ime }
        })

        if (postojiEmail != null) {
            res.json({ poruka: "E-mail već postoji." })
            return
        }

        if (korisnik.vrstaKlijenta == "pravno" || korisnik.tip == "stampar") {
            const postojiMaticni = await KorisnikModel.findOne({
                maticniBroj: req.body.maticniBroj,
                kor_ime: { $ne: req.body.kor_ime }
            })

            if (postojiMaticni != null) {
                res.json({ poruka: "Matični broj već postoji." })
                return
            }

            const postojiPib = await KorisnikModel.findOne({
                pib: req.body.pib,
                kor_ime: { $ne: req.body.kor_ime }
            })

            if (postojiPib != null) {
                res.json({ poruka: "PIB već postoji." })
                return
            }
        }

        let izmjene: any = {
            ime: req.body.ime,
            prezime: req.body.prezime,
            telefon: req.body.telefon,
            email: req.body.email
        }

        if (korisnik.vrstaKlijenta == "pravno" || korisnik.tip == "stampar") {
            izmjene.nazivInstitucije = req.body.nazivInstitucije
            izmjene.adresa = req.body.adresa
            izmjene.grad = req.body.grad
            izmjene.maticniBroj = req.body.maticniBroj
            izmjene.pib = req.body.pib
        }

        if (req.file != null) {
            izmjene.slika = req.file.filename
        }

        const azuriraniKorisnik = await KorisnikModel.findOneAndUpdate(
            { kor_ime: req.body.kor_ime },
            { $set: izmjene },
            { new: true }
        )

        res.json({ poruka: "ok", korisnik: azuriraniKorisnik })
    }
    catch (err) {
        console.log(err)
        res.json({ poruka: "Greška pri ažuriranju profila." })
    }
}

sviKorisnici = (req: express.Request, res: express.Response) => {
    KorisnikModel.find({ status: { $ne: "ceka" } })
    .then((korisnici) => {
        res.json(korisnici)
    })
    .catch(() => {
        res.json([])
    })
}

zahtjeviRegistracije = (req: express.Request, res: express.Response) => {
    KorisnikModel.find({ status: "ceka" })
    .then((korisnici) => {
        res.json(korisnici)
    })
    .catch(() => {
        res.json([])
    })
}

obradiRegistraciju = async (req: express.Request, res: express.Response) => {
    try {
        if (req.body.status != "aktivan" && req.body.status != "odbijen") {
            res.json({ poruka: "Neispravan status." })
            return
        }

        const korisnik = await KorisnikModel.findOneAndUpdate(
            { kor_ime: req.body.kor_ime, status: "ceka" },
            { $set: { status: req.body.status } },
            { new: true }
        )

        if (korisnik == null) {
            res.json({ poruka: "Zahtjev ne postoji." })
            return
        }

        res.json({ poruka: "ok" })
    }
    catch (err) {
        console.log(err)
        res.json({ poruka: "Greška pri obradi zahtjeva." })
    }
}

adminAzurirajKorisnika = async (req: express.Request, res: express.Response) => {
    try {
        const korisnik = await KorisnikModel.findOne({ kor_ime: req.body.kor_ime })

        if (korisnik == null) {
            res.json({ poruka: "Korisnik ne postoji." })
            return
        }

        if (!/^\+?\d{6,15}$/.test(req.body.telefon)) {
            res.json({ poruka: "Telefon mora sadržati samo cifre (6 do 15 cifara)." })
            return
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(req.body.email)) {
            res.json({ poruka: "Unesite ispravnu e-mail adresu." })
            return
        }

        const emailPostoji = await KorisnikModel.findOne({
            email: req.body.email,
            kor_ime: { $ne: req.body.kor_ime }
        })

        if (emailPostoji != null) {
            res.json({ poruka: "E-mail već postoji." })
            return
        }

        if (korisnik.vrstaKlijenta == "pravno" || korisnik.tip == "stampar") {
            if (!/^\d{8}$/.test(req.body.maticniBroj)) {
                res.json({ poruka: "Matični broj mora imati tačno 8 cifara." })
                return
            }

            if (!/^[1-9]\d{8}$/.test(req.body.pib)) {
                res.json({ poruka: "PIB mora imati 9 cifara i ne smije počinjati nulom." })
                return
            }

            const maticniPostoji = await KorisnikModel.findOne({
                maticniBroj: req.body.maticniBroj,
                kor_ime: { $ne: req.body.kor_ime }
            })

            if (maticniPostoji != null) {
                res.json({ poruka: "Matični broj već postoji." })
                return
            }

            const pibPostoji = await KorisnikModel.findOne({
                pib: req.body.pib,
                kor_ime: { $ne: req.body.kor_ime }
            })

            if (pibPostoji != null) {
                res.json({ poruka: "PIB već postoji." })
                return
            }
        }

        korisnik.ime = req.body.ime
        korisnik.prezime = req.body.prezime
        korisnik.telefon = req.body.telefon
        korisnik.email = req.body.email

        if (korisnik.tip != "admin") {
            korisnik.status = req.body.status
        }

        if (korisnik.vrstaKlijenta == "pravno" || korisnik.tip == "stampar") {
            korisnik.nazivInstitucije = req.body.nazivInstitucije
            korisnik.adresa = req.body.adresa
            korisnik.grad = req.body.grad
            korisnik.maticniBroj = req.body.maticniBroj
            korisnik.pib = req.body.pib
        }

        await korisnik.save()

        res.json({ poruka: "ok" })
    }
    catch (err) {
        console.log(err)
        res.json({ poruka: "Greška pri ažuriranju korisnika." })
    }
}

obrisiKorisnika = async (req: express.Request, res: express.Response) => {
    try {
        const korisnik = await KorisnikModel.findOne({ kor_ime: req.body.kor_ime })

        if (korisnik == null) {
            res.json({ poruka: "Korisnik ne postoji." })
            return
        }

        if (korisnik.tip == "admin") {
            res.json({ poruka: "Administratorski nalog nije moguće obrisati." })
            return
        }

        await KorisnikModel.deleteOne({ kor_ime: req.body.kor_ime })

        res.json({ poruka: "ok" })
    }
    catch (err) {
        console.log(err)
        res.json({ poruka: "Greška pri brisanju korisnika." })
    }
}

zatraziResetovanjeLozinke = async (req: express.Request, res: express.Response) => {
    try {
        const unos = req.body.korisnickoImeIliEmail

        const korisnik = await KorisnikModel.findOne({
            status: "aktivan",
            $or: [{ kor_ime: unos }, { email: unos }]
        })

        if (korisnik == null) {
            res.json({ poruka: "Korisnik sa tim korisničkim imenom ili e-mailom ne postoji." })
            return
        }

        const token = crypto.randomBytes(24).toString("hex")

        korisnik.resetToken = token
        korisnik.resetIstice = new Date(Date.now() + 5 * 60 * 1000)

        await korisnik.save()

        const link = "http://localhost:4200/nova-lozinka/" + token

        await posaljiEmail(
            korisnik.email as string,
            "Poništavanje lozinke - Printing House",
            "Poštovani/a " + korisnik.ime + ",\n\n" +
            "Zatraženo je poništavanje lozinke za nalog " + korisnik.kor_ime + ".\n" +
            "Kliknite na link ispod da postavite novu lozinku. Link važi 5 minuta.\n\n" +
            link + "\n\n" +
            "Ako niste vi zatražili ovo, slobodno ignorišite ovaj e-mail."
        )

        res.json({ poruka: "ok" })
    }
    catch (err) {
        console.log(err)
        res.json({ poruka: "Greška pri slanju e-maila." })
    }
}

provjeriResetToken = async (req: express.Request, res: express.Response) => {
    try {
        const korisnik = await KorisnikModel.findOne({ resetToken: req.params.token })

        if (
            korisnik == null ||
            korisnik.resetIstice == null ||
            (korisnik.resetIstice as Date).getTime() < Date.now()
        ) {
            res.json({ vazi: false })
            return
        }

        res.json({ vazi: true })
    }
    catch (err) {
        console.log(err)
        res.json({ vazi: false })
    }
}

postaviNovuLozinku = async (req: express.Request, res: express.Response) => {
    try {
        const korisnik = await KorisnikModel.findOne({ resetToken: req.body.token })

        if (korisnik == null) {
            res.json({ poruka: "Link za poništavanje lozinke nije ispravan." })
            return
        }

        if (
            korisnik.resetIstice == null ||
            (korisnik.resetIstice as Date).getTime() < Date.now()
        ) {
            res.json({ poruka: "Link za poništavanje lozinke je istekao. Zatražite novi." })
            return
        }

        const regexLozinka = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9])[A-Za-z].{7,11}$/

        if (!regexLozinka.test(req.body.novaLozinka)) {
            res.json({ poruka: "Lozinka nije u odgovarajućem formatu." })
            return
        }

        korisnik.lozinka = await bcrypt.hash(req.body.novaLozinka, 10)
        korisnik.resetToken = undefined
        korisnik.resetIstice = undefined

        await korisnik.save()

        res.json({ poruka: "ok" })
    }
    catch (err) {
        console.log(err)
        res.json({ poruka: "Greška pri postavljanju nove lozinke." })
    }
}
}
