## Cilj
Dodati „Help & Reference” meni sa prikazom prvih 4 Excel sheetova (0_Versions, a_Contents, b_Guidelines&Conditions, c_CodeLists) — sav UI i sadržaj na srpskom.

## Jezik (srpski)
- Sav interfejs (naslovi, tabovi, opisi) na srpskom — kroz postojeći `i18n`.
- Za opisne tekstove: pripremiti srpske verzije `analysis.sr.md` za svaki sheet.
- Za CSV zaglavlja: runtime prevod zaglavlja preko mape prevoda (vrijednosti ostaju originalne ako su kodovi/eng. termini).

## UI/UX
- AppBar: dodati „Pomoć & Referenca” (ikona + link) → ruta `/help`.
- `/help`: Tabs — „0_Versije”, „a_Sadržaj”, „b_Smjernice i uslovi”, „c_Listinzi kodova”.
- Svaki tab: „Opis” (Markdown na srpskom) + tabele za relevantne CSV-ove (Kolone, Validacije, Raw podaci), uz paginaciju.
- Opcija: u „Podešavanja” (`/settings`) prvi tab „Pomoć & Referenca”, drugi tab „Jezik” (preklopnik srpski/engleski).

## Izvori i struktura fajlova
- Premjestiti `ExcelAnalysis` u `public/reference/ExcelAnalysis` za jednostavan `fetch`.
- Dodati po jedan `analysis.sr.md` u svaki folder.
- Kreirati mapu prevoda CSV zaglavlja: `src/data/referenceTranslationsSr.ts` (npr. `{ "Column Name": "Naziv kolone", ... }`).

## Render tehnika
- Markdown: `react-markdown` za prikaz `analysis.sr.md`.
- CSV: koristiti postojeći `xlsx` paket za parsiranje CSV; primijeniti mapu prevoda na zaglavlja prije rendera; prikaz preko MUI `Table` + `TablePagination`.

## Implementacija
1. Routing: proširiti rute sa `/help` (i opcionalno `/settings`).
2. Komponente:
   - `ReferencePage` (Tabs, okvir)
   - `MarkdownSection` (učitavanje i prikaz `analysis.sr.md`)
   - `CsvTable` (učitavanje CSV, parsiranje preko `xlsx`, prevod zaglavlja, tabela + paginacija)
   - `sheets/*` (4 komponente koje kombinuju Markdown + tabele za svoje fajlove)
3. Header: dodati dugme/ikonu ka `/help` u `StepNavigationHeader` ili glavni `AppBar`.
4. i18n: proširiti `i18n.ts` za nove stringove (`help.title`, nazivi tabova, etikete tabela, dugmad).

## Validacija
- Paginacija 50–100 redova po stranici.
- Fallback „fajl nije nađen” sa linkom na GitHub repo.

## Isporuke
- Nova stranica „Pomoć & Referenca” na srpskom sa 4 taba.
- Srpski `analysis.sr.md` tekstovi.
- CSV tabele sa prevedenim zaglavljima.

## Sljedeći koraci
Ako potvrdiš, implementiram komponente i rute, dodam `react-markdown`, pripremim srpske `analysis.sr.md`, mapu prevoda CSV zaglavlja i povežem prikaz; testiram lokalno, a zatim push i deploy na Vercel.