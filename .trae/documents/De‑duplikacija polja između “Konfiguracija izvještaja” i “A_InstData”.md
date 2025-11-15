## Analiza preklapanja
- Korak 2 (Konfiguracija izvještaja) — trenutno sadrži: `reportingPeriod`, `installationId`, `installationName`, `installationCountry`, `installationAddress`, `reportType`.
- Korak 3 (A_InstData) — sadrži detaljne sekcije: `reportingPeriod` (datumi, godina, bilješke), `installationIdentification` (name, type, activity, CN kod, kapacitet, godišnja proizvodnja…), `installationAddress` (ulica, poštanski, grad, država, UNLOCODE, koordinate), `authorizedRepresentative`, `verifierInformation` itd.
- Preklapanja: `reportingPeriod`, `installationName`, `installationAddress/country`, `installationId` postoje u oba; „A_InstData” je canonical i detaljniji.

## Preporuka (zadržati oba uz jasne uloge)
- Zadržati korak 2 kao „globalne postavke izvještaja” (meta)
  - Ostaviti: `reportingPeriod`, `reportType`, `installationId`.
  - Polja o identitetu instalacije (name, address, country) ne unositi ovdje; prikazati ih samo u A_InstData.
- Korak 3 (A_InstData) ostaje jedini izvor istine za identitet instalacije, adresu, predstavnika i sve detalje.

## Plan izmjena
1. Ukloniti iz koraka 2 unos za: `installationName`, `installationCountry`, `installationAddress`.
2. (Opcionalno) U koraku 2 prikazati te vrijednosti read‑only, vezane na A_InstData, radi pregleda.
3. Validacije:
   - Korak 2: validirati samo `reportingPeriod` (obavezno) i `reportType` (preporučeno) te `installationId` (obavezno).
   - Korak 3: zadržati postojeća A_InstData pravila i sekcijsku „completeness”.
4. Export:
   - Zaglavlje Excel‑a (Company/Report) uzima meta iz koraka 2 (`reportingPeriod`, `installationId`, `reportType`).
   - Blokovi „Installation Details” i „Verifier” koriste isključivo A_InstData (bez `installationDetails`).
5. Sinhronizacija:
   - Jednosmjerna: ako se `installationId` postavi u koraku 2 i A_InstData ima prazno polje, upisati ga u `installationIdentification.installationId`.
   - Ostala polja NE duplirati — A_InstData ostaje source of truth.

## Migracija podataka (ako već ima unosi u koraku 2)
- Preseliti postojeće vrijednosti `installationName/country/address` iz koraka 2 u odgovarajuće A_InstData sekcije (jednokratan mapping).
- Nakon migracije, polja ostaju samo u A_InstData.

## Rizici i mitigacija
- Konfuzija korisnika zbog uklanjanja polja u koraku 2 → dodati read‑only prikaz vezan na A_InstData ili kratku napomenu.
- Export usklađenosti → već pokriven A_InstData cell‑map; verifikovati primjerom.

## Tražim potvrdu
- Potvrdi da u koraku 2 ostavljamo: `reportingPeriod`, `reportType`, `installationId`, a polja identiteta instalacije selimo isključivo u A_InstData.
- Ako želiš read‑only pregled identiteta u koraku 2, uključujemo ga.