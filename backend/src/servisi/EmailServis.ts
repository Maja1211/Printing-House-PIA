import nodemailer from 'nodemailer'

let transporter: nodemailer.Transporter | null = null

async function dobaviTransporter() {

    if (transporter != null) {
        return transporter
    }

    const testNalog = await nodemailer.createTestAccount()

    transporter = nodemailer.createTransport({
        host: testNalog.smtp.host,
        port: testNalog.smtp.port,
        secure: testNalog.smtp.secure,
        auth: {
            user: testNalog.user,
            pass: testNalog.pass
        }
    })

    return transporter
}

export async function posaljiEmail(
    kome: string,
    naslov: string,
    tekst: string,
    prilog?: { naziv: string, sadrzaj: Buffer }
) {

    try {

        const posiljalac = await dobaviTransporter()

        const opcije: nodemailer.SendMailOptions = {
            from: "Printing House <noreply@printinghouse.rs>",
            to: kome,
            subject: naslov,
            text: tekst
        }

        if (prilog != null) {

            opcije.attachments = [
                {
                    filename: prilog.naziv,
                    content: prilog.sadrzaj
                }
            ]
        }

        const info = await posiljalac.sendMail(opcije)

        console.log(
            "Email poslat, pregled:",
            nodemailer.getTestMessageUrl(info)
        )
    }
    catch (err) {

        console.log("Greška pri slanju emaila:", err)
    }
}
