export class Proizvod {
    stamparijaId: string = ""
    nazivStamparije: string = ""

    sifra: string = ""
    naziv: string = ""
    opis: string = ""

    kategorija: string = ""
    potkategorija: string = ""

    jedinicnaCena: number = 0
    kolicinaNaLageru: number = 0

    dostupneBoje: string[] = []

    slikaUrl: string = ""
    dodatneSlike: string[] = []

    uslugeStampe: any[] = []

    brojLajkova: number = 0
    brojDislajkova: number = 0

    komentari: any[] = []
}