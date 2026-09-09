import mongoose from 'mongoose'

const Schema = mongoose.Schema

let JavnaNabavka = new Schema({
    id: String,
    kor_ime: String,
    datumVrijeme: Date,

    proizvodi: Array,
    ponude: Array,

    status: String,
    pobjednik: String
})

export default mongoose.model(
    'JavnaNabavkaModel',
    JavnaNabavka,
    'javneNabavke'
)