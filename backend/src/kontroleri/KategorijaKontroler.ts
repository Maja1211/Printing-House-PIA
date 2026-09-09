import express from 'express'
import KategorijaModel from '../models/Kategorija'

export class KategorijaKontroler {

    sveKategorije = (
        req: express.Request,
        res: express.Response
    ) => {

        KategorijaModel.find({})
            .then((kategorije) => {
                res.json(kategorije)
            })
            .catch(() => {
                res.json([])
            })
    }

    dodajKategoriju = async (
    req: express.Request,
    res: express.Response
) => {

    try {

        if (
            req.body.naziv == null ||
            req.body.naziv.trim() == ""
        ) {

            res.json({
                poruka:
                    "Naziv kategorije je obavezan."
            })

            return
        }


        const postoji =
            await KategorijaModel.findOne({

                naziv:
                    req.body.naziv
            })


        if (postoji != null) {

            res.json({
                poruka:
                    "Kategorija već postoji."
            })

            return
        }


        const kategorija =
            new KategorijaModel({

                naziv:
                    req.body.naziv,

                potkategorije:
                    []
            })


        await kategorija.save()


        res.json({
            poruka: "ok"
        })

    }
    catch (err) {

        console.log(err)

        res.json({
            poruka:
                "Greška pri dodavanju kategorije."
        })
    }
}


dodajPotkategoriju = async (
    req: express.Request,
    res: express.Response
) => {

    try {

        if (
            req.body.potkategorija == null ||
            req.body.potkategorija.trim() == ""
        ) {

            res.json({
                poruka:
                    "Naziv potkategorije je obavezan."
            })

            return
        }


        const kategorija =
            await KategorijaModel.findOne({

                naziv:
                    req.body.kategorija
            })


        if (kategorija == null) {

            res.json({
                poruka:
                    "Kategorija ne postoji."
            })

            return
        }


        const potkategorije: any[] =
            kategorija.potkategorije || []


        if (
            potkategorije.includes(
                req.body.potkategorija
            )
        ) {

            res.json({
                poruka:
                    "Potkategorija već postoji."
            })

            return
        }


        kategorija.potkategorije.push(
            req.body.potkategorija
        )


        await kategorija.save()


        res.json({
            poruka: "ok"
        })

    }
    catch (err) {

        console.log(err)

        res.json({
            poruka:
                "Greška pri dodavanju potkategorije."
        })
    }
}
}