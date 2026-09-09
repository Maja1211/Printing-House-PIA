import mongoose from 'mongoose'

const Schema = mongoose.Schema

let Narudzbina = new Schema({
    idFakture: String,
    kor_ime: String,

    stamparijaId: String,
    nazivStamparije: String,
    grad: String,

    proizvodi: Array,

    ukupanIznos: Number,
    status: String,
    datum: String
})

export default mongoose.model('NarudzbinaModel', Narudzbina, 'narudzbine')