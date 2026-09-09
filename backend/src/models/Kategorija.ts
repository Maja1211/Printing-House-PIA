import mongoose from 'mongoose'

const Schema = mongoose.Schema

let Kategorija = new Schema({
    naziv: String,
    potkategorije: Array
})

export default mongoose.model('KategorijaModel', Kategorija, 'kategorije')