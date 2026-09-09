import express from 'express'
import NarudzbinaModel from '../models/Narudzbina'
import ProizvodModel from '../models/Proizvod'
import KorisnikModel from '../models/Korisnik'
import { napraviFakturuPdf } from '../servisi/PdfServis'
import { posaljiEmail } from '../servisi/EmailServis'
import stripe from '../servisi/StripeServis'

export class NarudzbinaKontroler {

    narudzbineKorisnika = (req: express.Request, res: express.Response) => {
        NarudzbinaModel.find({
            kor_ime: req.params.kor_ime
        }).then((narudzbine) => {
            res.json(narudzbine)
        }).catch(() => {
            res.json([])
        })
    }

    potvrdiNarudzbinu = async (req: express.Request, res: express.Response) => {
    try {

        const kor_ime = req.body.kor_ime
        const stavke = req.body.stavke

        if (stavke == null || stavke.length == 0) {
            res.json({ poruka: "Korpa je prazna." })
            return
        }

        const trazeneKolicinePoSifri: any = {}
        for (let stavka of stavke) {
            trazeneKolicinePoSifri[stavka.sifra] =
                (trazeneKolicinePoSifri[stavka.sifra] || 0) + stavka.kolicina
        }

        for (let sifra in trazeneKolicinePoSifri) {
            const proizvod = await ProizvodModel.findOne({ sifra: sifra })
            if (proizvod == null || (proizvod.kolicinaNaLageru ?? 0) < trazeneKolicinePoSifri[sifra]) {
                res.json({ poruka: "Nema dovoljno proizvoda trenutno na stanju." })
                return
            }
        }

        for (let stavka of stavke) {
            const proizvod = await ProizvodModel.findOne({ sifra: stavka.sifra })
            if (proizvod == null) {
                res.json({ poruka: "Proizvod ne postoji." })
                return
            }

            const usluge: any[] = proizvod.uslugeStampe || []
            const usluga = usluge.find((u: any) => u.tipStampe == stavka.tipStampe)
            if (usluga == null) {
                res.json({ poruka: "Izabrana usluga štampe ne postoji za taj proizvod." })
                return
            }

            const cijenaPoKomadu = (proizvod.jedinicnaCena || 0) + (usluga.dodatnaCenaPoKomadu || 0)
            stavka.ukupnaCena = cijenaPoKomadu * stavka.kolicina
        }

        const klijent = await KorisnikModel.findOne({ kor_ime: kor_ime })

        const grupe: any = {}
        for (let stavka of stavke) {
            if (grupe[stavka.stamparijaId] == null) {
                grupe[stavka.stamparijaId] = []
            }
            grupe[stavka.stamparijaId].push(stavka)
        }

        let brojac = 0
        const kreiraneNarudzbine: any[] = []

        for (let stamparijaId in grupe) {
            const proizvodi = grupe[stamparijaId]
            const stampar = await KorisnikModel.findOne({ stamparijaId: stamparijaId })

            let ukupanIznos = 0
            for (let proizvod of proizvodi) {
                ukupanIznos += proizvod.ukupnaCena
            }

            const narudzbina = new NarudzbinaModel({
                idFakture: "F-" + Date.now() + "-" + brojac,
                kor_ime: kor_ime,
                stamparijaId: stamparijaId,
                nazivStamparije: proizvodi[0].nazivStamparije,
                grad: stampar != null ? stampar.grad : "",
                proizvodi: proizvodi,
                ukupanIznos: ukupanIznos,
                status: "naruceno",
                datum: new Date().toISOString().split('T')[0]
            })

            await narudzbina.save()

            kreiraneNarudzbine.push({
                idFakture: narudzbina.idFakture,
                nazivStamparije: narudzbina.nazivStamparije,
                ukupanIznos: narudzbina.ukupanIznos,
                proizvodi: narudzbina.proizvodi
            })

            brojac++

            if (klijent != null && klijent.email) {
                const fakturaPdf = await napraviFakturuPdf(narudzbina)

                await posaljiEmail(
                    klijent.email as string,
                    "Faktura " + narudzbina.idFakture + " - Printing House",
                    "Poštovani/a " + klijent.ime + ",\n\n" +
                    "U prilogu se nalazi faktura za Vašu narudžbinu kod štamparije " +
                    narudzbina.nazivStamparije + ".\n" +
                    "Ukupan iznos: " + ukupanIznos + " RSD.",
                    {
                        naziv: narudzbina.idFakture + ".pdf",
                        sadrzaj: fakturaPdf
                    }
                )
            }
        }

        // atomski oduzmi stanje - uslov kolicinaNaLageru >= trazeno je
        // dio istog updateOne poziva, sto sprjecava da dva istovremena
        // zahtjeva oba prodju raniju provjeru prije nego sto ijedan
        // stigne da upise oduzimanje (narudzbine su vec kreirane, pa se
        // u slucaju neuspjeha ovde vec upisano oduzimanje mora vratiti)

        const vecOduzeto: { sifra: string, kolicina: number }[] = []

        for (let sifra in trazeneKolicinePoSifri) {
            const trazenaKolicina = trazeneKolicinePoSifri[sifra]

            const rezultat = await ProizvodModel.updateOne(
                { sifra: sifra, kolicinaNaLageru: { $gte: trazenaKolicina } },
                { $inc: { kolicinaNaLageru: -trazenaKolicina } }
            )

            if (rezultat.modifiedCount == 0) {

                for (let stavkaZaVracanje of vecOduzeto) {
                    await ProizvodModel.updateOne(
                        { sifra: stavkaZaVracanje.sifra },
                        { $inc: { kolicinaNaLageru: stavkaZaVracanje.kolicina } }
                    )
                }

                await NarudzbinaModel.deleteMany({
                    idFakture: { $in: kreiraneNarudzbine.map((n) => n.idFakture) }
                })

                res.json({ poruka: "Nema dovoljno proizvoda trenutno na stanju." })
                return
            }

            vecOduzeto.push({ sifra: sifra, kolicina: trazenaKolicina })
        }

        res.json({
            poruka: "ok",
            narudzbine: kreiraneNarudzbine
        })
    }
    catch (err) {
        console.log(err)
        res.json({ poruka: "Greška pri kreiranju narudžbine." })
    }
}

arhiva = (req: express.Request, res: express.Response) => {
    NarudzbinaModel.find({
        kor_ime: req.params.kor_ime,
        status: { $in: ["isporuceno", "primljeno"] }
    })
    .sort({ datum: -1 })
    .then((narudzbine) => {
        res.json(narudzbine)
    })
    .catch(() => {
        res.json([])
    })
}

primljeno = async (req: express.Request, res: express.Response) => {
    try {
        const narudzbina = await NarudzbinaModel.findOne({
            idFakture: req.body.idFakture,
            kor_ime: req.body.kor_ime
        })

        if (narudzbina == null) {
            res.json({ poruka: "Narudžbina ne postoji." })
            return
        }

        if (narudzbina.status != "isporuceno") {
            res.json({ poruka: "Narudžbina nije u statusu isporučeno." })
            return
        }

        narudzbina.status = "primljeno"
        await narudzbina.save()

        res.json({ poruka: "ok" })
    }
    catch (err) {
        console.log(err)
        res.json({ poruka: "Greška pri promjeni statusa." })
    }
}

narudzbineStamparije = (req: express.Request, res: express.Response) => {
    NarudzbinaModel.find({
        stamparijaId: req.params.stamparijaId
    })
    .sort({ datum: -1 })
    .then((narudzbine) => {
        res.json(narudzbine)
    })
    .catch(() => {
        res.json([])
    })
}

promijeniStatus = async (req: express.Request, res: express.Response) => {
    try {
        const narudzbina = await NarudzbinaModel.findOne({
            idFakture: req.body.idFakture,
            stamparijaId: req.body.stamparijaId
        })

        if (narudzbina == null) {
            res.json({ poruka: "Narudžbina ne postoji." })
            return
        }

        if (narudzbina.status == "placeno" && req.body.noviStatus == "u stampi") {
            narudzbina.status = "u stampi"
        }
        else if (narudzbina.status == "u stampi" && req.body.noviStatus == "isporuceno") {
            narudzbina.status = "isporuceno"
        }
        else {
            res.json({ poruka: "Nije dozvoljena ta promjena statusa." })
            return
        }

        await narudzbina.save()
        res.json({ poruka: "ok" })
    }
    catch (err) {
        console.log(err)
        res.json({ poruka: "Greška pri promjeni statusa." })
    }
}

otkaziNarudzbinu = async (req: express.Request, res: express.Response) => {
    try {
        const narudzbina = await NarudzbinaModel.findOne({
            idFakture: req.body.idFakture,
            kor_ime: req.body.kor_ime
        })

        if (narudzbina == null) {
            res.json({ poruka: "Narudžbina ne postoji." })
            return
        }

        if (narudzbina.status != "naruceno") {
            res.json({ poruka: "Može se otkazati samo narudžbina koja još nije u štampi." })
            return
        }

        const proizvodi: any[] = narudzbina.proizvodi || []

        for (let proizvod of proizvodi) {
            await ProizvodModel.updateOne(
                { sifra: proizvod.sifra, stamparijaId: narudzbina.stamparijaId },
                { $inc: { kolicinaNaLageru: Number(proizvod.kolicina) } }
            )
        }

        await NarudzbinaModel.deleteOne({ _id: narudzbina._id })

        res.json({ poruka: "ok" })
    }
    catch (err) {
        console.log(err)
        res.json({ poruka: "Greška pri otkazivanju narudžbine." })
    }
}

platiNarudzbinu = async (req: express.Request, res: express.Response) => {
    try {
        const narudzbina = await NarudzbinaModel.findOne({
            idFakture: req.body.idFakture,
            kor_ime: req.body.kor_ime
        })

        if (narudzbina == null) {
            res.json({ poruka: "Narudžbina ne postoji." })
            return
        }

        if (narudzbina.status != "naruceno") {
            res.json({ poruka: "Plaćanje je moguće samo za narudžbinu u statusu 'naručeno'." })
            return
        }

        if (!req.body.paymentMethodId) {
            res.json({ poruka: "Podaci o kartici nisu ispravno primljeni." })
            return
        }

        try {
            const paymentIntent = await stripe.paymentIntents.create({
                amount: Math.round((narudzbina.ukupanIznos as number) * 100),
                currency: 'rsd',
                payment_method: req.body.paymentMethodId,
                payment_method_types: ['card'],
                confirm: true
            })

            if (paymentIntent.status != 'succeeded') {
                res.json({ poruka: "Plaćanje nije uspjelo. Pokušajte ponovo." })
                return
            }
        }
        catch (stripeGreska: any) {
            console.log('Stripe greska:', stripeGreska.message)
            res.json({ poruka: "Plaćanje je odbijeno. Pokušajte ponovo (npr. test karticom 4242 4242 4242 4242)." })
            return
        }

        narudzbina.status = "placeno"
        await narudzbina.save()

        res.json({ poruka: "ok" })
    }
    catch (err) {
        console.log(err)
        res.json({ poruka: "Greška pri obradi plaćanja." })
    }
}
}
