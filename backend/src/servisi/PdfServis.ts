import PDFDocument from 'pdfkit'

function bezDijakritike(tekst: string) {

    return tekst
        .replace(/č/g, "c")
        .replace(/ć/g, "c")
        .replace(/š/g, "s")
        .replace(/ž/g, "z")
        .replace(/đ/g, "dj")
        .replace(/Č/g, "C")
        .replace(/Ć/g, "C")
        .replace(/Š/g, "S")
        .replace(/Ž/g, "Z")
        .replace(/Đ/g, "Dj")
}

export function napraviFakturuPdf(narudzbina: any): Promise<Buffer> {

    return new Promise((resolve, reject) => {

        try {

            const dokument = new PDFDocument({ margin: 50 })
            const delovi: Buffer[] = []

            dokument.on('data', (deo) => delovi.push(deo))
            dokument.on('end', () => resolve(Buffer.concat(delovi)))

            dokument.fontSize(18).text(
                "Printing House - Faktura",
                { align: "center" }
            )

            dokument.moveDown()

            dokument.fontSize(11)

            dokument.text("Broj fakture: " + narudzbina.idFakture)
            dokument.text("Datum: " + narudzbina.datum)
            dokument.text("Stamparija: " + bezDijakritike(narudzbina.nazivStamparije) + " (" + bezDijakritike(narudzbina.grad) + ")")

            dokument.moveDown()

            dokument.fontSize(13).text("Naruceni proizvodi")
            dokument.fontSize(11)

            dokument.moveDown(0.5)

            for (let proizvod of narudzbina.proizvodi) {

                dokument.text(
                    "- " +
                    bezDijakritike(proizvod.naziv) +
                    " x " + proizvod.kolicina +
                    "  (" + bezDijakritike(proizvod.tipStampe || "") + ", boja: " + bezDijakritike(proizvod.boja || "") + ")  -  " +
                    proizvod.ukupnaCena + " RSD"
                )
            }

            dokument.moveDown()

            dokument.fontSize(13).text(
                "Ukupan iznos: " + narudzbina.ukupanIznos + " RSD"
            )

            dokument.end()
        }
        catch (err) {
            reject(err)
        }
    })
}
