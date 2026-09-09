import mongoose from 'mongoose'

const Schema = mongoose.Schema

let Proizvod = new Schema({
    stamparijaId: String,
    nazivStamparije: String,

    sifra: String,
    naziv: String,
    opis: String,

    kategorija: String,
    potkategorija: String,

    jedinicnaCena: Number,
    kolicinaNaLageru: Number,

    dostupneBoje: Array,
    slikaUrl: String,
    dodatneSlike: Array,

    uslugeStampe: Array,

    brojLajkova: Number,
    brojDislajkova: Number,

    lajkovali: Array,
    dislajkovali: Array,

    komentari: Array,

    ocenaIstorija: Array,
})

export default mongoose.model('ProizvodModel', Proizvod, 'proizvodi')