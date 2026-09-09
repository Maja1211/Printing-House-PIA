import express from 'express'
import KorisnikModel from '../models/Korisnik'

export function zahtijevajUlogu(tip?: string) {

    return async (
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
    ) => {

        const kor_ime = req.header('x-kor-ime')

        if (kor_ime == null) {
            res.status(401).json({ poruka: "Niste prijavljeni." })
            return
        }

        const korisnik = await KorisnikModel.findOne({
            kor_ime: kor_ime,
            status: "aktivan"
        })

        if (korisnik == null) {
            res.status(401).json({ poruka: "Niste prijavljeni." })
            return
        }

        if (tip != null && korisnik.tip != tip) {
            res.status(403).json({ poruka: "Nemate dozvolu za ovu akciju." })
            return
        }

        (req as any).korisnik = korisnik

        next()
    }
}

export function proveriIdentitet(
    uzmiOcekivanuVrijednost: (req: express.Request) => string | string[]
) {

    return (
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
    ) => {

        const korisnik = (req as any).korisnik
        const vrijednost = uzmiOcekivanuVrijednost(req)
        const ocekivano = Array.isArray(vrijednost) ? vrijednost[0] : vrijednost

        if (
            korisnik.kor_ime != ocekivano &&
            korisnik.stamparijaId != ocekivano
        ) {
            res.status(403).json({ poruka: "Nemate dozvolu za ovu akciju." })
            return
        }

        next()
    }
}
