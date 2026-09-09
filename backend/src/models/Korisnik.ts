import mongoose from 'mongoose'

const Schema = mongoose.Schema

let Korisnik = new Schema({
    kor_ime: { type: String, unique: true },
    lozinka: String,
    ime: String,
    prezime: String,
    telefon: String,
    email: { type: String, unique: true },
    tip: String,
    vrstaKlijenta: String,
    slika: String,
    status: String,

    nazivInstitucije: String,
    adresa: String,
    grad: String,
    maticniBroj: String,
    pib: String,

    stamparijaId: String,

    resetToken: String,
    resetIstice: Date
})

export default mongoose.model('KorisnikModel', Korisnik, 'korisnici')