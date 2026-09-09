import express from 'express'
import ProizvodModel from '../models/Proizvod'
import KorisnikModel from '../models/Korisnik'
import NarudzbinaModel from '../models/Narudzbina'
import KategorijaModel from '../models/Kategorija'

function zabiljeziOcenu(proizvod: any) {
    if (proizvod.ocenaIstorija == null) {
        proizvod.ocenaIstorija = []
    }

    proizvod.ocenaIstorija.push({
        datum: new Date(),
        brojLajkova: proizvod.brojLajkova || 0,
        brojDislajkova: proizvod.brojDislajkova || 0
    })
}

export class ProizvodKontroler {

    top5 = (req: express.Request, res: express.Response) => {
        ProizvodModel.find({})
            .sort({ brojLajkova: -1 })
            .limit(5)
            .then((proizvodi) => {
                res.json(proizvodi)
            })
            .catch(() => {
                res.json([])
            })
    }

    kategorijeAktivnihProizvoda = (req: express.Request, res: express.Response) => {
        ProizvodModel.distinct("kategorija", { kolicinaNaLageru: { $gt: 0 } })
        .then((kategorije) => {
            res.json(kategorije)
        })
        .catch(() => {
            res.json([])
        })
    }

    pretraga = (req: express.Request, res: express.Response) => {
        let uslov: any = { kolicinaNaLageru: { $gt: 0 } }

        if (req.body.naziv != "") {
            uslov.naziv = { $regex: req.body.naziv, $options: "i" }
        }

        if (req.body.kategorija != "") {
            uslov.kategorija = req.body.kategorija
        }

        ProizvodModel.find(uslov)
            .then((proizvodi) => {
                res.json(proizvodi)
            })
            .catch(() => {
                res.json([])
            })
    }

    detalji = async (req: express.Request, res: express.Response) => {
    try {
        const proizvod = await ProizvodModel.findOne({ sifra: req.params.sifra })

        if (proizvod == null) {
            res.json(null)
            return
        }

        const stampar = await KorisnikModel.findOne({ stamparijaId: proizvod.stamparijaId })

        res.json({
            proizvod: proizvod,
            grad: stampar != null ? stampar.grad : "",
            adresa: stampar != null ? stampar.adresa : ""
        })
    }
    catch {
        res.json(null)
    }
}

    lajkuj = async (req: express.Request, res: express.Response) => {
        try {
            const proizvod = await ProizvodModel.findOne({ sifra: req.body.sifra })

            if (proizvod == null) {
                res.json({ poruka: "Proizvod ne postoji." })
                return
            }

            const kor_ime = req.body.kor_ime

            const primljenaNarudzbina = await NarudzbinaModel.findOne({
                kor_ime: kor_ime,
                status: "primljeno",
                "proizvodi.sifra": req.body.sifra
            })

            if (primljenaNarudzbina == null) {
                res.json({ poruka: "Možete lajkovati samo primljene proizvode." })
                return
            }

            const lajkovali: any[] = proizvod.lajkovali || []
            const dislajkovali: any[] = proizvod.dislajkovali || []

            if (lajkovali.includes(kor_ime)) {
                proizvod.lajkovali = lajkovali.filter((k: string) => k != kor_ime)
                proizvod.brojLajkova = Math.max(0, (proizvod.brojLajkova || 0) - 1)

                zabiljeziOcenu(proizvod)
                await proizvod.save()

                res.json({ poruka: "ok", stanje: "uklonjen" })
                return
            }

            if (dislajkovali.includes(kor_ime)) {
                proizvod.dislajkovali = dislajkovali.filter((k: string) => k != kor_ime)
                proizvod.brojDislajkova = Math.max(0, (proizvod.brojDislajkova || 0) - 1)
            }

            proizvod.lajkovali = [...lajkovali, kor_ime]
            proizvod.brojLajkova = (proizvod.brojLajkova || 0) + 1

            zabiljeziOcenu(proizvod)
            await proizvod.save()

            res.json({ poruka: "ok", stanje: "dodat" })
        }
        catch (err) {
            console.log(err)
            res.json({ poruka: "Greška." })
        }
    }

    dislajkuj = async (req: express.Request, res: express.Response) => {
        try {
            const proizvod = await ProizvodModel.findOne({ sifra: req.body.sifra })

            if (proizvod == null) {
                res.json({ poruka: "Proizvod ne postoji." })
                return
            }

            const kor_ime = req.body.kor_ime

            const primljenaNarudzbina = await NarudzbinaModel.findOne({
                kor_ime: kor_ime,
                status: "primljeno",
                "proizvodi.sifra": req.body.sifra
            })

            if (primljenaNarudzbina == null) {
                res.json({ poruka: "Možete dislajkovati samo primljene proizvode." })
                return
            }

            const lajkovali: any[] = proizvod.lajkovali || []
            const dislajkovali: any[] = proizvod.dislajkovali || []

            if (dislajkovali.includes(kor_ime)) {
                proizvod.dislajkovali = dislajkovali.filter((k: string) => k != kor_ime)
                proizvod.brojDislajkova = Math.max(0, (proizvod.brojDislajkova || 0) - 1)

                zabiljeziOcenu(proizvod)
                await proizvod.save()

                res.json({ poruka: "ok", stanje: "uklonjen" })
                return
            }

            if (lajkovali.includes(kor_ime)) {
                proizvod.lajkovali = lajkovali.filter((k: string) => k != kor_ime)
                proizvod.brojLajkova = Math.max(0, (proizvod.brojLajkova || 0) - 1)
            }

            proizvod.dislajkovali = [...dislajkovali, kor_ime]
            proizvod.brojDislajkova = (proizvod.brojDislajkova || 0) + 1

            zabiljeziOcenu(proizvod)
            await proizvod.save()

            res.json({ poruka: "ok", stanje: "dodat" })
        }
        catch (err) {
            console.log(err)
            res.json({ poruka: "Greška." })
        }
    }

    dodajKomentar = async (req: express.Request, res: express.Response) => {
        try {
            const proizvod = await ProizvodModel.findOne({ sifra: req.body.sifra })

            if (proizvod == null) {
                res.json({ poruka: "Proizvod ne postoji." })
                return
            }

            const kor_ime = req.body.kor_ime

            const primljenaNarudzbina = await NarudzbinaModel.findOne({
                kor_ime: kor_ime,
                status: "primljeno",
                "proizvodi.sifra": req.body.sifra
            })

            if (primljenaNarudzbina == null) {
                res.json({ poruka: "Možete komentarisati samo primljene proizvode." })
                return
            }

            if (req.body.tekst == null || req.body.tekst.trim() == "") {
                res.json({ poruka: "Komentar ne može biti prazan." })
                return
            }

            if (proizvod.komentari == null) {
                proizvod.komentari = []
            }

            const vecKomentarisao = proizvod.komentari.find((k: any) => k.kor_ime == kor_ime)

            if (vecKomentarisao != null) {
                res.json({ poruka: "Već ste ostavili komentar za ovaj proizvod." })
                return
            }

            proizvod.komentari.push({
                kor_ime: kor_ime,
                datum: new Date(),
                tekst: req.body.tekst
            })

            await proizvod.save()

            res.json({ poruka: "ok" })
        }
        catch (err) {
            console.log(err)
            res.json({ poruka: "Greška." })
        }
    }

    proizvodiStamparije = (req: express.Request, res: express.Response) => {
    ProizvodModel.find({ stamparijaId: req.params.stamparijaId })
    .then((proizvodi) => {
        res.json(proizvodi)
    })
    .catch(() => {
        res.json([])
    })
}

dodajProizvod = async (req: express.Request, res: express.Response) => {
    try {
        if (!req.body.sifra || !req.body.naziv || !req.body.kategorija || !req.body.potkategorija) {
            res.json({ poruka: "Popunite sve obavezne podatke o proizvodu." })
            return
        }

        const cijena = Number(req.body.jedinicnaCena)

        if (!Number.isFinite(cijena) || cijena <= 0) {
            res.json({ poruka: "Jedinična cijena mora biti broj veći od 0." })
            return
        }

        const lager = Number(req.body.kolicinaNaLageru)

        if (!Number.isFinite(lager) || lager < 0) {
            res.json({ poruka: "Količina na lageru mora biti broj koji nije negativan." })
            return
        }

        const kategorijaPostoji = await KategorijaModel.findOne({
            naziv: req.body.kategorija,
            potkategorije: req.body.potkategorija
        })

        if (kategorijaPostoji == null) {
            res.json({ poruka: "Izabrana kategorija/potkategorija ne postoji." })
            return
        }

        const postoji = await ProizvodModel.findOne({ sifra: req.body.sifra })

        if (postoji != null) {
            res.json({ poruka: "Proizvod sa tom šifrom već postoji." })
            return
        }

        let dostupneBoje = []
        if (req.body.dostupneBoje) {
            dostupneBoje = JSON.parse(req.body.dostupneBoje)
        }

        let uslugeStampe = []
        if (req.body.uslugeStampe) {
            uslugeStampe = JSON.parse(req.body.uslugeStampe)
        }

        const fajlovi = req.files as { [polje: string]: Express.Multer.File[] }

        let slikaUrl = ""
        if (fajlovi != null && fajlovi.slika != null) {
            slikaUrl = fajlovi.slika[0].filename
        }

        if (slikaUrl == "") {
            res.json({ poruka: "Glavna slika proizvoda je obavezna (JPG, PNG ili GIF)." })
            return
        }

        let dodatneSlike: string[] = []
        if (fajlovi != null && fajlovi.dodatneSlike != null) {
            dodatneSlike = fajlovi.dodatneSlike.map((f) => f.filename)
        }

        const proizvod = new ProizvodModel({
            stamparijaId: req.body.stamparijaId,
            nazivStamparije: req.body.nazivStamparije,
            sifra: req.body.sifra,
            naziv: req.body.naziv,
            opis: req.body.opis,
            kategorija: req.body.kategorija,
            potkategorija: req.body.potkategorija,
            jedinicnaCena: Number(req.body.jedinicnaCena),
            kolicinaNaLageru: Number(req.body.kolicinaNaLageru),
            dostupneBoje: dostupneBoje,
            slikaUrl: slikaUrl,
            dodatneSlike: dodatneSlike,
            uslugeStampe: uslugeStampe,
            brojLajkova: 0,
            brojDislajkova: 0,
            lajkovali: [],
            dislajkovali: [],
            komentari: []
        })

        await proizvod.save()

        res.json({ poruka: "ok" })
    }
    catch (err) {
        console.log(err)
        res.json({ poruka: "Greška pri dodavanju proizvoda." })
    }
}

azurirajKolicinu = async (req: express.Request, res: express.Response) => {
    try {
        if (req.body.kolicina < 0) {
            res.json({ poruka: "Količina ne može biti negativna." })
            return
        }

        const proizvod = await ProizvodModel.findOneAndUpdate(
            { sifra: req.body.sifra, stamparijaId: req.body.stamparijaId },
            { $set: { kolicinaNaLageru: Number(req.body.kolicina) } },
            { new: true }
        )

        if (proizvod == null) {
            res.json({ poruka: "Proizvod ne postoji." })
            return
        }

        res.json({ poruka: "ok" })
    }
    catch (err) {
        console.log(err)
        res.json({ poruka: "Greška pri izmjeni količine." })
    }
}

}
