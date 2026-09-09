import express from 'express'
import JavnaNabavkaModel from '../models/JavnaNabavka'
import ProizvodModel from '../models/Proizvod'
import KorisnikModel from '../models/Korisnik'
import NarudzbinaModel from '../models/Narudzbina'
import { posaljiEmail } from '../servisi/EmailServis'

export class JavnaNabavkaKontroler {

    kreiraj = async (req: express.Request, res: express.Response) => {
        try {
            const kor_ime = req.body.kor_ime
            const stavke = req.body.stavke

            if (stavke == null || stavke.length == 0) {
                res.json({ poruka: "Korpa je prazna." })
                return
            }

            const grupisanoPoNazivu: { [naziv: string]: any } = {}
            for (let stavka of stavke) {
                if (grupisanoPoNazivu[stavka.naziv] == null) {
                    grupisanoPoNazivu[stavka.naziv] = {
                        naziv: stavka.naziv,
                        kolicina: 0,
                        boja: stavka.boja,
                        tipStampe: stavka.tipStampe,
                        tekstZaStampu: stavka.tekstZaStampu
                    }
                }
                grupisanoPoNazivu[stavka.naziv].kolicina += stavka.kolicina
            }

            const proizvodi = Object.values(grupisanoPoNazivu)

            const javnaNabavka = new JavnaNabavkaModel({
                id: "JN-" + Date.now(),
                kor_ime: kor_ime,
                datumVrijeme: new Date(),
                proizvodi: proizvodi,
                ponude: [],
                status: "otvorena",
                pobjednik: ""
            })

            await javnaNabavka.save()

            const stamparije = await KorisnikModel.find({
                tip: "stampar",
                status: "aktivan"
            })

            const listaProizvoda = proizvodi
                .map((p: any) => "- " + p.naziv + " x " + p.kolicina)
                .join("\n")

            for (let stamparija of stamparije) {
                if (!stamparija.email) {
                    continue
                }

                await posaljiEmail(
                    stamparija.email as string,
                    "Otvorena javna nabavka " + javnaNabavka.id + " - Printing House",
                    "Poštovani/a " + stamparija.ime + ",\n\n" +
                    "Otvorena je nova javna nabavka (" + javnaNabavka.id + ") kod koje možete poslati ponudu u naredih 10 minuta.\n\n" +
                    "Traženi proizvodi:\n" +
                    listaProizvoda + "\n\n" +
                    "Prijavite se u sistem da biste poslali ponudu."
                )
            }

            res.json({ poruka: "ok" })
        }
        catch (err) {
            console.log(err)
            res.json({ poruka: "Greška pri kreiranju javne nabavke." })
        }
    }

    otvorene = (req: express.Request, res: express.Response) => {
        const prijeDesetMinuta = new Date(Date.now() - 10 * 60 * 1000)

        JavnaNabavkaModel.find({
            status: "otvorena",
            datumVrijeme: { $gt: prijeDesetMinuta }
        })
        .then((nabavke) => {
            res.json(nabavke)
        })
        .catch(() => {
            res.json([])
        })
    }

    posaljiPonudu = async (req: express.Request, res: express.Response) => {
        try {
            const nabavka = await JavnaNabavkaModel.findOne({
                id: req.body.id,
                status: "otvorena"
            })

            if (nabavka == null) {
                res.json({ poruka: "Javna nabavka ne postoji ili je završena." })
                return
            }

            const datum = new Date(nabavka.datumVrijeme as any)
            const proslo = Date.now() - datum.getTime()

            if (proslo >= 10 * 60 * 1000) {
                res.json({ poruka: "Vrijeme za slanje ponude je isteklo." })
                return
            }

            const ponude: any[] = nabavka.ponude || []
            const vecPoslao = ponude.find(p => p.stamparijaId == req.body.stamparijaId)

            if (vecPoslao != null) {
                res.json({ poruka: "Već ste poslali ponudu za ovu nabavku." })
                return
            }

            const iznos = Number(req.body.ukupanIznos)

            if (iznos <= 0) {
                res.json({ poruka: "Iznos ponude mora biti veći od 0." })
                return
            }

            for (let trazeni of nabavka.proizvodi as any[]) {
                const proizvod = await ProizvodModel.findOne({
                    stamparijaId: req.body.stamparijaId,
                    naziv: trazeni.naziv,
                    kolicinaNaLageru: { $gte: trazeni.kolicina }
                })

                if (proizvod == null) {
                    res.json({ poruka: "Nemate sve tražene proizvode u dovoljnoj količini." })
                    return
                }
            }

            nabavka.ponude.push({
                stamparijaId: req.body.stamparijaId,
                nazivStamparije: req.body.nazivStamparije,
                ukupanIznos: iznos
            })

            await nabavka.save()

            res.json({ poruka: "ok" })
        }
        catch (err) {
            console.log(err)
            res.json({ poruka: "Greška pri slanju ponude." })
        }
    }

    zavrseneNabavke = async (req: express.Request, res: express.Response) => {
        try {
            const nabavke = await JavnaNabavkaModel.find({
                status: "zavrsena",
                "ponude.stamparijaId": req.params.stamparijaId
            })
            .sort({ datumVrijeme: -1 })

            res.json(nabavke)
        }
        catch (err) {
            console.log(err)
            res.json([])
        }
    }

    nabavkeKorisnika = async (req: express.Request, res: express.Response) => {
        try {
            const nabavke = await JavnaNabavkaModel.find({ kor_ime: req.params.kor_ime })

            for (let nabavka of nabavke) {
                if (nabavka.status != "otvorena") {
                    continue
                }

                const datum = new Date(nabavka.datumVrijeme as any)
                const proslo = Date.now() - datum.getTime()

                if (proslo < 10 * 60 * 1000) {
                    continue
                }

                const ponude: any[] = nabavka.ponude || []
                ponude.sort((a, b) => a.ukupanIznos - b.ukupanIznos)

                let pobjednickaPonuda: any = null

                for (let ponuda of ponude) {
                    let imaSve = true

                    for (let trazeni of nabavka.proizvodi as any[]) {
                        const proizvod = await ProizvodModel.findOne({
                            stamparijaId: ponuda.stamparijaId,
                            naziv: trazeni.naziv,
                            kolicinaNaLageru: { $gte: trazeni.kolicina }
                        })

                        if (proizvod == null) {
                            imaSve = false
                            break
                        }
                    }

                    if (imaSve) {
                        pobjednickaPonuda = ponuda
                        break
                    }
                }

                if (pobjednickaPonuda == null) {
                    nabavka.status = "zavrsena"
                    nabavka.pobjednik = ""
                    await nabavka.save()
                    continue
                }

                nabavka.status = "zavrsena"
                nabavka.pobjednik = pobjednickaPonuda.stamparijaId

                const stampar = await KorisnikModel.findOne({
                    stamparijaId: pobjednickaPonuda.stamparijaId
                })

                const proizvodiZaNarudzbinu: any[] = []

                for (let trazeni of nabavka.proizvodi as any[]) {
                    const proizvod = await ProizvodModel.findOne({
                        stamparijaId: pobjednickaPonuda.stamparijaId,
                        naziv: trazeni.naziv
                    })

                    if (proizvod != null) {

                        const rezultatOduzimanja = await ProizvodModel.updateOne(
                            {
                                sifra: proizvod.sifra,
                                stamparijaId: pobjednickaPonuda.stamparijaId,
                                kolicinaNaLageru: { $gte: trazeni.kolicina }
                            },
                            { $inc: { kolicinaNaLageru: -trazeni.kolicina } }
                        )

                        if (rezultatOduzimanja.modifiedCount > 0) {
                            proizvodiZaNarudzbinu.push({
                                sifra: proizvod.sifra,
                                naziv: proizvod.naziv,
                                kolicina: trazeni.kolicina,
                                boja: trazeni.boja,
                                tipStampe: trazeni.tipStampe,
                                tekstZaStampu: trazeni.tekstZaStampu
                            })
                        }
                    }
                }

                const narudzbina = new NarudzbinaModel({
                    idFakture: "F-JN-" + Date.now(),
                    kor_ime: nabavka.kor_ime,
                    stamparijaId: pobjednickaPonuda.stamparijaId,
                    nazivStamparije: pobjednickaPonuda.nazivStamparije,
                    grad: stampar != null ? stampar.grad : "",
                    proizvodi: proizvodiZaNarudzbinu,
                    ukupanIznos: pobjednickaPonuda.ukupanIznos,
                    status: "u stampi",
                    datum: new Date().toISOString().split('T')[0]
                })

                await narudzbina.save()
                await nabavka.save()
            }

            const rezultat = await JavnaNabavkaModel.find({ kor_ime: req.params.kor_ime })
                .sort({ datumVrijeme: -1 })

            res.json(rezultat)
        }
        catch (err) {
            console.log(err)
            res.json([])
        }
    }

}
