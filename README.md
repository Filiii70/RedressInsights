# KMO-Alert - B2B Betalingsgedrag Register

**De Graydon voor KMO's — realtime, crowd-sourced en betaalbaar**

KMO-Alert is een modern B2B financieel dataplatform voor het volgen en analyseren van betalingsgedrag van bedrijven in de Benelux. Het biedt realtime, crowd-sourced betalingsgegevens voor KMO's, waarmee bedrijven het kredietrisico kunnen beoordelen voordat ze met klanten samenwerken.

## 🎯 Wat is KMO-Alert?

KMO-Alert is een crowd-sourced KMO betalingsgedrag register dat bedrijven helpt om:

- **Facturen uploaden** en automatisch data extraheren met AI (OCR)
- **Betalingsgedrag volgen** van bedrijven op basis van echte factuurdata
- **Kredietrisico beoordelen** met risicoscores van 0-100
- **Bruikbare inzichten krijgen** met automatische actieplan aanbevelingen
- **Benchmarken tegen sectoren** om relatieve prestaties te begrijpen

## ✨ Belangrijkste Functies

### Factuurbeheer
- AI-gestuurde factuurscanning met automatische data-extractie
- Extraheert: bedrijfsnaam, BTW-nummer, factuurdatum, bedrag, vervaldatum
- Ondersteunt Belgische (BE) en Nederlandse (NL) BTW-nummerformaten
- Bestandslimiet: 10MB per factuurafbeelding

### Bedrijfsanalyse
- Risicoscores (0-100) gebaseerd op betalingsgeschiedenis
- Gemiddelde dagen tot betaling tracking
- Betalingstrend analyse (verbeterend/stabiel/achteruitgaand)
- Sector benchmarking

### Dashboard
- Realtime overzicht van openstaande facturen
- Hoog-risico bedrijf waarschuwingen
- Betalingsgedrag statistieken
- Recente factuuractiviteit

### Risico Analyse
- Kleurgecodeerde risiconiveaus:
  - **Laag** (0-30): Goed betalingsgedrag
  - **Gemiddeld** (31-50): Enkele vertragingen, nauwlettend volgen
  - **Hoog** (51-70): Frequente late betalingen
  - **Kritiek** (71-100): Zeer slecht betalingsgedrag
- Automatische actieplan aanbevelingen
- Historische trend visualisatie

## 🛡️ AVG/GDPR Compliant

KMO-Alert is ontworpen om AVG-compliant te zijn:
- **Alleen bedrijfsgegevens** worden opgeslagen (BTW-nummers, bedrijfsnamen, factuurgegevens)
- **Geen persoonsgegevens** worden verzameld of opgeslagen
- Alle data betreft uitsluitend B2B transacties

## 🏗️ Technische Stack

### Frontend
- **React 18** met TypeScript
- **Vite** voor snelle ontwikkeling en building
- **TailwindCSS** voor styling
- **shadcn/ui** componentenbibliotheek
- **TanStack Query** voor data ophalen
- **Recharts** voor data visualisatie
- **Wouter** voor routing

### Backend
- **Express.js** met TypeScript
- **Drizzle ORM** voor database operaties
- **PostgreSQL** (Neon serverless) voor data opslag
- **OpenAI GPT-4 Vision** voor factuur OCR extractie

## 📁 Projectstructuur

```
├── client/                 # Frontend React applicatie
│   ├── src/
│   │   ├── components/     # Herbruikbare UI componenten
│   │   ├── pages/          # Pagina componenten
│   │   │   ├── dashboard.tsx       # Hoofd dashboard
│   │   │   ├── upload.tsx          # Factuur upload
│   │   │   ├── companies.tsx       # Bedrijvenlijst
│   │   │   ├── company-detail.tsx  # Bedrijfsdetail weergave
│   │   │   ├── risk-analysis.tsx   # Risico analyse pagina
│   │   │   └── trends.tsx          # Betalingstrends
│   │   ├── hooks/          # Custom React hooks
│   │   └── lib/            # Hulpprogramma's en helpers
├── server/                 # Backend Express applicatie
│   ├── routes.ts           # API endpoints
│   ├── storage.ts          # Database operaties
│   └── openai.ts           # AI factuur extractie
├── shared/                 # Gedeelde types en schema's
│   └── schema.ts           # Database schema (Drizzle)
└── README.md
```

## 📊 Database Schema

### Bedrijven Tabel (companies)
| Veld | Type | Beschrijving |
|------|------|--------------|
| id | serial | Primaire sleutel |
| vatNumber | varchar | Uniek BTW-nummer (BE/NL formaat) |
| name | varchar | Bedrijfsnaam |
| sector | varchar | Sector/branche |
| city | varchar | Vestigingsplaats |
| country | varchar | Land (BE/NL) |

### Facturen Tabel (invoices)
| Veld | Type | Beschrijving |
|------|------|--------------|
| id | serial | Primaire sleutel |
| companyId | integer | Verwijzing naar bedrijf |
| invoiceNumber | varchar | Factuurnummer |
| invoiceDate | date | Factuurdatum |
| dueDate | date | Vervaldatum |
| amount | numeric | Factuurbedrag in EUR |
| status | varchar | pending / paid / overdue |
| paidDate | date | Betaaldatum |

### Betalingsregistraties Tabel (payment_records)
| Veld | Type | Beschrijving |
|------|------|--------------|
| id | serial | Primaire sleutel |
| companyId | integer | Verwijzing naar bedrijf |
| invoiceId | integer | Verwijzing naar factuur |
| daysLate | integer | Dagen na vervaldatum |
| amount | numeric | Betalingsbedrag |
| paymentDate | date | Betaaldatum |

### Bedrijfsstatistieken Tabel (company_stats)
| Veld | Type | Beschrijving |
|------|------|--------------|
| id | serial | Primaire sleutel |
| companyId | integer | Verwijzing naar bedrijf |
| riskScore | integer | Risicoscore 0-100 |
| avgDaysToPayment | numeric | Gemiddelde dagen tot betaling |
| totalInvoices | integer | Totaal aantal facturen |
| paidOnTime | integer | Op tijd betaalde facturen |
| paidLate | integer | Te laat betaalde facturen |
| trend | varchar | improving / stable / declining |

## 🔌 API Endpoints

### Facturen

**POST /api/invoices/upload**
Upload een factuurafbeelding voor AI extractie.
- Content-Type: `multipart/form-data`
- Body: `file` (afbeelding, max 10MB)
- Retourneert: Geëxtraheerde factuurdata (bedrijf, BTW, bedrag, datums)

**GET /api/invoices**
Haal alle facturen op.
- Retourneert: Array van factuur objecten

**POST /api/invoices**
Maak handmatig een nieuwe factuur aan.
- Body: `{ companyId, invoiceNumber, invoiceDate, dueDate, amount }`

**PATCH /api/invoices/:id/status**
Update factuur betalingsstatus.
- Body: `{ status: "paid" | "pending" | "overdue", paidDate? }`

### Bedrijven

**GET /api/companies**
Haal alle bedrijven met hun statistieken op.
- Retourneert: Array van bedrijfsobjecten met risicoscores

**GET /api/companies/:id**
Haal bedrijfsdetails met betalingsgeschiedenis op.
- Retourneert: Bedrijfsobject met facturen en statistieken

**GET /api/companies/search?vat=BE0123456789**
Zoek bedrijf op BTW-nummer.
- Retourneert: Bedrijfsobject of null

### Dashboard

**GET /api/dashboard/stats**
Haal dashboard statistieken op.
- Retourneert: `{ totalOutstanding, avgDaysToPayment, highRiskCount, overdueCount }`

### Risico Analyse

**GET /api/risk/analysis**
Haal risico analyse data voor alle bedrijven op.
- Retourneert: Array van bedrijven met risicoscores en trends

## 🚀 Aan de Slag

### Vereisten
- Node.js 18+
- PostgreSQL database (of gebruik Replit's ingebouwde Neon database)
- OpenAI API sleutel

### Omgevingsvariabelen

Maak een `.env` bestand in de hoofdmap:

```env
# Database
DATABASE_URL=postgresql://gebruiker:wachtwoord@host:poort/database

# OpenAI (voor factuur OCR)
OPENAI_API_KEY=sk-jouw-openai-api-sleutel

# Sessie
SESSION_SECRET=jouw-willekeurige-sessie-geheim
```

### Draaien op Replit

1. De database wordt automatisch ingericht (Neon PostgreSQL)
2. Voeg je `OPENAI_API_KEY` toe in de Secrets tab
3. Klik "Run" - de app start automatisch op poort 5000

### Lokaal Draaien

1. Clone de repository:
```bash
git clone https://github.com/Filiii70/redress-kmo-register.git
cd redress-kmo-register
```

2. Installeer dependencies:
```bash
npm install
```

3. Stel omgevingsvariabelen in (kopieer `.env.example` naar `.env`)

4. Push database schema:
```bash
npm run db:push
```

5. Start de development server:
```bash
npm run dev
```

De applicatie is beschikbaar op `http://localhost:5000`

## 🤖 Factuur OCR Werkwijze

1. Gebruiker uploadt factuurafbeelding (PNG, JPG, PDF)
2. Afbeelding wordt naar OpenAI GPT-4 Vision API gestuurd
3. AI extraheert:
   - Bedrijfsnaam
   - BTW-nummer (genormaliseerd naar BE/NL formaat)
   - Factuurdatum
   - Vervaldatum
   - Bedrag
4. Gebruiker bevestigt geëxtraheerde data
5. Factuur wordt opgeslagen en gekoppeld aan bedrijf
6. Bedrijfsrisicoscore wordt herberekend

### Ondersteunde BTW Formaten
- Belgisch: `BE0123456789` of `BE 0123 456 789`
- Nederlands: `NL123456789B01`

## 💰 Prijsmodel (Gepland)

| Plan | Prijs | Functies |
|------|-------|----------|
| Gratis | €0/maand | Basis opzoekingen, beperkte data |
| Pro | €29/maand | Onbeperkte opzoekingen, volledige historie |
| API | €99/maand | API toegang, bulk operaties |

## 🤝 Netwerkeffect

KMO-Alert wordt waardevoller naarmate meer gebruikers factuurdata bijdragen. Het platform creëert een crowd-sourced database van betalingsgedrag waar alle deelnemers van profiteren:

- Meer facturen = Nauwkeurigere risicoscores
- Meer bedrijven = Bredere dekking
- Realtime data = Actuele inzichten

**Doel: 100-500 actieve gebruikers** om kritieke massa te bereiken voor betrouwbare betalingsgedrag data.

## 📄 Licentie

Dit project is eigendomssoftware. Alle rechten voorbehouden.

## 📞 Contact

Voor vragen of ondersteuning, neem contact op met het ontwikkelteam.

---

**Gebouwd voor de Benelux KMO gemeenschap**
