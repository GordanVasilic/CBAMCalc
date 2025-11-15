## Pregled stanja
- Korak 3 („Detalji o instalaciji”) i korak 4 („A_InstData – Podaci o instalaciji”) prikupljaju isti skup instalacijskih podataka.
- „A_InstData” je bogatiji, ima jasna pravila validacije i precizan Excel maping (ćelije), dok „Detalji o instalaciji” ima slabiju validaciju i generički export.

## Ključne razlike
- Model podataka:
  - „InstallationDetails” (ravna struktura) vs „AInstData” (sekcije: identifikacija, adresa, predstavnik, verifikator…).
- Validacija:
  - „AInstData” ima kompletna pravila i procenat popunjenosti; „InstallationDetails” minimalne provere.
- Excel:
  - „AInstData” mapira točne ćelije (npr. B20–B33); „InstallationDetails” puni generičnu tabelu.

## Opcije
- Opcija A: Zadržati oba koraka, ali sinhronizovati polja (podaci se automatski preslikavaju u oba modela).
- Opcija B (preporuka): Konsolidovati na „AInstData” kao jedini izvor istine i ukloniti korak „Detalji o instalaciji”.

## Preporuka
- Usvojiti Opciju B: „AInstData” je sveobuhvatan, validiran i usklađen sa službenim Excel šablonom; uklanjanje duplikata pojednostavljuje UX i smanjuje greške.

## Faze implementacije
- Faza 1: Uvesti pomoćnu funkciju „syncInstallationDetailsToAInstData(cbamData)” da migrira postojeće podatke iz „InstallationDetails” u odgovarajuće sekcije „AInstData”.
- Faza 2: Wizard: ukloniti korak 3 ili ga pretvoriti u „pregled” koji čita iz „AInstData” (bez uređivanja).
- Faza 3: Validacija: koristiti isključivo validacije iz „AInstData” za instalacijske podatke; ukloniti minimalne provere za „InstallationDetails”.
- Faza 4: Excel export: umesto polja iz „installationDetails”, koristiti „AInstData” cell‑map; osigurati da svi ranije popunjeni podaci imaju odgovarajuću ćeliju.
- Faza 5: Čišćenje modela: postepeno deprecirati „InstallationDetails” polja iz „CBAMData” nakon migracije.

## Detalji mapiranja (primeri)
- Tip/aktivnost/CN: „installationDetails.installationType/mainActivity/cnCode” → „aInstData.installationIdentification.*”.
- Kapacitet/produkcija: „productionCapacity/annualProduction” → „installationIdentification.*”.
- Adresa: „streetAndNumber/postalCode/city/country/poBox/unlocode/lat/lon” → „installationAddress.*”.
- Predstavnik: „authorizedRepresentativeName/email/telephone” → „authorizedRepresentative.*”.
- Period: „startDate/endDate” → „reportingPeriod.startDate/endDate”.
- Verifikator: „verifier*” → „verifierInformation.*”.
- Agregacije/procesi: „aggregatedGoods/productionProcesses” → „aggregatedGoodsCategories/productionProcesses”.

## Validacija i export
- Validacija: koristiti „AINST_VALIDATION_RULES” i prikazati sekcijske „completeness” čipove u „AInstData”.
- Export: koristiti „generateExcelRowMapping(aInstData)” za tačan raspored u Excel šablonu; ukloniti duplirani blok iz generičkog exporta.

## Rizici i mitigacije
- Rizik gubitka podataka: mitigovati migracionom funkcijom i testnim exportom prije uklanjanja koraka.
- Promjena navika korisnika: omogućiti kratki „pregledni” korak ili pomoćni „summary” ekran.

## Potreban input
- Da li definitivno uklanjamo korak 3 („Detalji o instalaciji”) ili ga pretvaramo u pregled?
- Potvrda da Excel export treba da koristi isključivo „A_InstData” cell‑map (zvanični šablon).
- Eventualne lokalizacijske dorade naziva sekcija i polja (srpski/hrvatski/BHS).
