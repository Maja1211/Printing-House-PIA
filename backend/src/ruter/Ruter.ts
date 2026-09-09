import multer from 'multer'
import express from 'express'
import { KorisnikKontroler } from '../kontroleri/KorisnikKontroler'
import { ProizvodKontroler } from '../kontroleri/ProizvodKontroler'
import { NarudzbinaKontroler } from '../kontroleri/NarudzbinaKontroler'
import { KategorijaKontroler } from '../kontroleri/KategorijaKontroler'
import { JavnaNabavkaKontroler } from '../kontroleri/JavnaNabavkaKontroler'
import { StatistikaKontroler } from '../kontroleri/StatistikaKontroler'
import { zahtijevajUlogu, proveriIdentitet } from '../middleware/Autorizacija'

const ruter = express.Router()

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/')
    },

    filename: (req, file, cb) => {
        cb(null, Date.now() + "_" + file.originalname)
    }
})

const dozvoljeniTipoviSlika = ['image/jpeg', 'image/png', 'image/gif']

const filterSlika = (
    req: express.Request,
    file: Express.Multer.File,
    cb: multer.FileFilterCallback
) => {

    if (dozvoljeniTipoviSlika.includes(file.mimetype)) {
        cb(null, true)
    }
    else {
        cb(null, false)
    }
}

const upload = multer({
    storage: storage,
    fileFilter: filterSlika,
    limits: { fileSize: 5 * 1024 * 1024 }
})

const uploadProizvod = multer({
    storage: storage,
    fileFilter: filterSlika,
    limits: { fileSize: 5 * 1024 * 1024 }
}).fields([
    { name: 'slika', maxCount: 1 },
    { name: 'dodatneSlike', maxCount: 3 }
])

ruter.route('/login').post(
    (req, res) => new KorisnikKontroler().login(req, res)
)

ruter.route('/adminLogin').post(
    (req, res) => new KorisnikKontroler().adminLogin(req, res)
)

ruter.route('/registracija').post(
    upload.single('slika'),
    (req, res) => new KorisnikKontroler().registracija(req, res)
)

ruter.route('/zatraziResetovanjeLozinke').post(
    (req, res) => new KorisnikKontroler().zatraziResetovanjeLozinke(req, res)
)

ruter.route('/postaviNovuLozinku').post(
    (req, res) => new KorisnikKontroler().postaviNovuLozinku(req, res)
)

ruter.route('/provjeriResetToken/:token').get(
    (req, res) => new KorisnikKontroler().provjeriResetToken(req, res)
)

ruter.route('/brojStamparija').get(
    (req, res) => new KorisnikKontroler().brojStamparija(req, res)
)

ruter.route('/top5').get(
    (req, res) => new ProizvodKontroler().top5(req, res)
)

ruter.route('/kategorijeAktivnihProizvoda').get(
    (req, res) => new ProizvodKontroler().kategorijeAktivnihProizvoda(req, res)
)

ruter.route('/pretragaProizvoda').post(
    (req, res) => new ProizvodKontroler().pretraga(req, res)
)

ruter.route('/proizvod/:sifra').get(
    (req, res) => new ProizvodKontroler().detalji(req, res)
)

ruter.route('/profil/:kor_ime').get(
    zahtijevajUlogu(),
    proveriIdentitet(req => req.params.kor_ime),
    (req, res) => new KorisnikKontroler().profil(req, res)
)

ruter.route('/azurirajProfil').post(
    upload.single('slika'),
    zahtijevajUlogu(),
    proveriIdentitet(req => req.body.kor_ime),
    (req, res) => new KorisnikKontroler().azurirajProfil(req, res)
)

ruter.route('/narudzbine/:kor_ime').get(
    zahtijevajUlogu('klijent'),
    proveriIdentitet(req => req.params.kor_ime),
    (req, res) => new NarudzbinaKontroler().narudzbineKorisnika(req, res)
)

ruter.route('/potvrdiNarudzbinu').post(
    zahtijevajUlogu('klijent'),
    proveriIdentitet(req => req.body.kor_ime),
    (req, res) =>
        new NarudzbinaKontroler().potvrdiNarudzbinu(req, res)
)

ruter.route('/arhiva/:kor_ime').get(
    zahtijevajUlogu('klijent'),
    proveriIdentitet(req => req.params.kor_ime),
    (req, res) =>
        new NarudzbinaKontroler().arhiva(req, res)
)

ruter.route('/primljeno').post(
    zahtijevajUlogu('klijent'),
    proveriIdentitet(req => req.body.kor_ime),
    (req, res) =>
        new NarudzbinaKontroler().primljeno(req, res)
)

ruter.route('/lajkuj').post(
    zahtijevajUlogu('klijent'),
    proveriIdentitet(req => req.body.kor_ime),
    (req, res) =>
        new ProizvodKontroler().lajkuj(req, res)
)

ruter.route('/dislajkuj').post(
    zahtijevajUlogu('klijent'),
    proveriIdentitet(req => req.body.kor_ime),
    (req, res) =>
        new ProizvodKontroler().dislajkuj(req, res)
)

ruter.route('/dodajKomentar').post(
    zahtijevajUlogu('klijent'),
    proveriIdentitet(req => req.body.kor_ime),
    (req, res) =>
        new ProizvodKontroler().dodajKomentar(req, res)
)

ruter.route('/sveKategorije').get(
    (req, res) =>
        new KategorijaKontroler().sveKategorije(req, res)
)


ruter.route('/proizvodiStamparije/:stamparijaId').get(
    zahtijevajUlogu('stampar'),
    proveriIdentitet(req => req.params.stamparijaId),
    (req, res) =>
        new ProizvodKontroler().proizvodiStamparije(req, res)
)


ruter.route('/dodajProizvod').post(
    uploadProizvod,
    zahtijevajUlogu('stampar'),
    proveriIdentitet(req => req.body.stamparijaId),
    (req, res) =>
        new ProizvodKontroler().dodajProizvod(req, res)
)


ruter.route('/azurirajKolicinu').post(
    zahtijevajUlogu('stampar'),
    proveriIdentitet(req => req.body.stamparijaId),
    (req, res) =>
        new ProizvodKontroler().azurirajKolicinu(req, res)
)

ruter.route('/narudzbineStamparije/:stamparijaId').get(
    zahtijevajUlogu('stampar'),
    proveriIdentitet(req => req.params.stamparijaId),
    (req, res) =>
        new NarudzbinaKontroler().narudzbineStamparije(req, res)
)


ruter.route('/promijeniStatus').post(
    zahtijevajUlogu('stampar'),
    proveriIdentitet(req => req.body.stamparijaId),
    (req, res) =>
        new NarudzbinaKontroler().promijeniStatus(req, res)
)

ruter.route('/kreirajJavnuNabavku').post(
    zahtijevajUlogu('klijent'),
    proveriIdentitet(req => req.body.kor_ime),
    (req, res) =>
        new JavnaNabavkaKontroler().kreiraj(req, res)
)


ruter.route('/otvoreneJavneNabavke').get(
    zahtijevajUlogu('stampar'),
    (req, res) =>
        new JavnaNabavkaKontroler().otvorene(req, res)
)


ruter.route('/posaljiPonudu').post(
    zahtijevajUlogu('stampar'),
    proveriIdentitet(req => req.body.stamparijaId),
    (req, res) =>
        new JavnaNabavkaKontroler().posaljiPonudu(req, res)
)


ruter.route('/javneNabavke/:kor_ime').get(
    zahtijevajUlogu('klijent'),
    proveriIdentitet(req => req.params.kor_ime),
    (req, res) =>
        new JavnaNabavkaKontroler().nabavkeKorisnika(req, res)
)

ruter.route('/zavrseneJavneNabavke/:stamparijaId').get(
    zahtijevajUlogu('stampar'),
    proveriIdentitet(req => req.params.stamparijaId),
    (req, res) =>
        new JavnaNabavkaKontroler().zavrseneNabavke(req, res)
)

ruter.route('/sviKorisnici').get(
    zahtijevajUlogu('admin'),
    (req, res) =>
        new KorisnikKontroler().sviKorisnici(req, res)
)


ruter.route('/zahtjeviRegistracije').get(
    zahtijevajUlogu('admin'),
    (req, res) =>
        new KorisnikKontroler().zahtjeviRegistracije(req, res)
)


ruter.route('/obradiRegistraciju').post(
    zahtijevajUlogu('admin'),
    (req, res) =>
        new KorisnikKontroler().obradiRegistraciju(req, res)
)


ruter.route('/adminAzurirajKorisnika').post(
    zahtijevajUlogu('admin'),
    (req, res) =>
        new KorisnikKontroler().adminAzurirajKorisnika(req, res)
)


ruter.route('/obrisiKorisnika').post(
    zahtijevajUlogu('admin'),
    (req, res) =>
        new KorisnikKontroler().obrisiKorisnika(req, res)
)


ruter.route('/dodajKategoriju').post(
    zahtijevajUlogu('admin'),
    (req, res) =>
        new KategorijaKontroler().dodajKategoriju(req, res)
)


ruter.route('/dodajPotkategoriju').post(
    zahtijevajUlogu('admin'),
    (req, res) =>
        new KategorijaKontroler().dodajPotkategoriju(req, res)
)

ruter.route('/statistike/prometStamparija').get(
    zahtijevajUlogu('admin'),
    (req, res) =>
        new StatistikaKontroler().prometStamparija(req, res)
)

ruter.route('/statistike/najnarucivaniProizvodi').get(
    zahtijevajUlogu('admin'),
    (req, res) =>
        new StatistikaKontroler().najnarucivaniProizvodi(req, res)
)

ruter.route('/statistike/ocenaKrozVrijeme').get(
    zahtijevajUlogu('admin'),
    (req, res) =>
        new StatistikaKontroler().ocenaKrozVrijeme(req, res)
)

ruter.route('/otkaziNarudzbinu').post(
    zahtijevajUlogu('klijent'),
    proveriIdentitet(req => req.body.kor_ime),
    (req, res) =>
        new NarudzbinaKontroler()
            .otkaziNarudzbinu(req, res)
)

ruter.route('/platiNarudzbinu').post(
    zahtijevajUlogu('klijent'),
    proveriIdentitet(req => req.body.kor_ime),
    (req, res) =>
        new NarudzbinaKontroler()
            .platiNarudzbinu(req, res)
)

export default ruter
