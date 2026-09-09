import 'dotenv/config'
import ruterBaza from './ruter/Ruter'
import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'
import multer from 'multer'

const app = express()

app.use(cors())
app.use(express.json())
app.use('/uploads', express.static('uploads'))

const ruter = express.Router()
ruter.use('/', ruterBaza)

app.use('/', ruter)

app.use((
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
) => {

    if (err instanceof multer.MulterError) {
        res.json({ poruka: "Greška pri otpremanju fajla (previše slika ili neispravan fajl)." })
        return
    }

    console.log(err)
    res.json({ poruka: "Greška na serveru." })
})

mongoose.connect("mongodb://localhost:27017/printing_house");

const connection = mongoose.connection;
connection.once("open", () => {
    console.log("Connected to MongoDB on port 27017");
})

app.listen(4000, () => {
    console.log("Express running on port 4000!")
})