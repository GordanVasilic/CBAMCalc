## Cilj
- Provjeriti da su vrijednosti E_Purchased u Excelu i u aplikaciji identične za podržane polja.

## Trenutno stanje
- Aplikacija obrađuje i razmjenjuje SAŽETAK E_Purchased (ne detaljne redove prekursora): export i import pokrivaju samo meta i summary polja.
- Export u Excel upisuje E_Purchased sažetak (`src/utils/excelExport.ts:434–460`).
- Import iz Excela učitava E_Purchased sažetak (`src/utils/excelExport.ts:605–632`).
- Struktura podataka E_Purchased je definirana u `src/types/EPurchasedTypes.ts:116–160`.

## Opseg provjere (polja za 1:1 usporedbu)
- `Reporting Period`
- Summary: `Total Precursors`, `Total Quantity`, `Total Direct Embedded Emissions`, `Total Indirect Embedded Emissions`, `Total Embedded Emissions`, `Average Data Quality`, `Verified Precursors`
- Overall: `Overall Data Quality`, `Overall Verification Status`
- Validation: `Is Valid`, `Errors Count`, `Warnings Count`, `Completeness Score (%)`

## Koraci
1. Zatražiti putanju Excel datoteke koju treba usporediti (ili koristiti zadnji izvezeni Excel iz aplikacije).
2. Učitati E_Purchased sažetak iz Excel datoteke korištenjem postojeće rutine za import (bez promjena koda).
3. Dohvatiti trenutno stanje `data.ePurchased` iz aplikacije (sa ekrana ili iz skladišta podataka).
4. Usporediti polje‑po‑polje prema popisu iz "Opseg provjere" i izračunati odstupanja.
5. Pripremiti kratak izvještaj: lista polja koja su identična i lista polja s razlikama (vrijednost Excel vs Aplikacija).

## Izlaz
- Tablični pregled pariteta E_Purchased sa statusom za svako polje i zaključak da li su 100% isti.

## Napomena o ograničenju
- Detaljni redovi prekursora (stavke i potrošnje po procesima) trenutno se NE izvoze u Excel E_Purchased niti učitavaju iz njega; paritet je moguć za sažetak i meta polja. Ako je potreban 100% paritet i za detalje, naknadno ćemo proširiti export/import da uključi sve kolone prema `E_PURCHASED_EXCEL_MAPPING` (`src/types/EPurchasedTypes.ts:208–243`).