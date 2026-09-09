import express from 'express'
import NarudzbinaModel from '../models/Narudzbina'
import ProizvodModel from '../models/Proizvod'

export class StatistikaKontroler {

    prometStamparija = async (req: express.Request, res: express.Response) => {
        try {
            const prije3Mjeseca = new Date()
            prije3Mjeseca.setMonth(prije3Mjeseca.getMonth() - 3)
            const odDatuma = prije3Mjeseca.toISOString().split('T')[0]

            const rezultat = await NarudzbinaModel.aggregate([
                {
                    $match: {
                        datum: { $gte: odDatuma },
                        status: { $ne: "naruceno" }
                    }
                },
                {
                    $group: {
                        _id: "$nazivStamparije",
                        promet: { $sum: "$ukupanIznos" }
                    }
                },
                { $sort: { promet: -1 } }
            ])

            res.json(
                rezultat.map((r) => ({
                    nazivStamparije: r._id,
                    promet: r.promet
                }))
            )
        }
        catch (err) {
            console.log(err)
            res.json([])
        }
    }

    najnarucivaniProizvodi = async (req: express.Request, res: express.Response) => {
        try {
            const prijeMjesec = new Date()
            prijeMjesec.setMonth(prijeMjesec.getMonth() - 1)
            const odDatuma = prijeMjesec.toISOString().split('T')[0]

            const narudzbine = await NarudzbinaModel.find({ datum: { $gte: odDatuma } })

            const grupe: { [naziv: string]: number } = {}
            let ukupnoKomada = 0

            for (let narudzbina of narudzbine) {
                for (let proizvod of narudzbina.proizvodi as any[]) {
                    const kolicina = Number(proizvod.kolicina) || 0
                    grupe[proizvod.naziv] = (grupe[proizvod.naziv] || 0) + kolicina
                    ukupnoKomada += kolicina
                }
            }

            const rezultat = Object.entries(grupe)
                .map(([naziv, kolicina]) => ({
                    naziv: naziv,
                    kolicina: kolicina,
                    procenat: ukupnoKomada > 0 ? Math.round((kolicina / ukupnoKomada) * 1000) / 10 : 0
                }))
                .sort((a, b) => b.kolicina - a.kolicina)

            res.json(rezultat)
        }
        catch (err) {
            console.log(err)
            res.json([])
        }
    }

    ocenaKrozVrijeme = async (req: express.Request, res: express.Response) => {
        try {
            const proizvodi = await ProizvodModel.find(
                { 'ocenaIstorija.0': { $exists: true } },
                { sifra: 1, naziv: 1, ocenaIstorija: 1 }
            )

            res.json(proizvodi)
        }
        catch (err) {
            console.log(err)
            res.json([])
        }
    }
}
