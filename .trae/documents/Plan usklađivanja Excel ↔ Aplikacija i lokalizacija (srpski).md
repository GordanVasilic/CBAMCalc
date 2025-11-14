## Nalazi
- Mešoviti jezik (sr/en) u UI i eksportima; nema i18n u `src/`.
- Jedinice `t`, `tCO2`, `tCO2e`, `TJ` bez doslednih konverzija u svim cross‑checkovima.
- Duplikat Excel export logike (lokalne `exportToExcel` u E/F vs centralni `excelExport.ts`); import ne pokriva `dataQuality`, `validationStatus`, `verificationData`.
- UI dobro vodi unos i blokira `Dalje` kad ima grešaka; nedostaje pregled „Fuel Balance (TJ)“ u UI.
- Duplikati semantičkih polja (period, verifikacija, agregati emisija, električna energija, identifikacija).

## Ciljevi
- 100% srpski UI/eksport uz minimalan i18n sloj.
- Konsistentne jedinice i eksplicitne konverzije.
- Konsolidovan Excel izvoz i robusniji uvoz.
- Dodatne validacije (E↔D raspodele, C↔B mapiranje, F jedinice).
- Jednostavniji tok sa pregledom „Fuel Balance (TJ)“.

## Faze
### Faza 1: Lokalizacija (sr)
- Dodati minimalni i18n util (`t(key, params?)`) i `sr` resurs.
- Prevesti naslov/e, dugmad, pomoćne tekstove i etikete u ključnim koracima (Wizard, Header, Results, C/E/F stepovi).
- U eksportima (Excel/PDF/CSV/Print) koristiti iste `t` ključeve.

### Faza 2: Jedinice i konverzije
- Standardizovati zbirne emisije na `tCO2e`; jasno razlikovati „CO2“ vs „CO2e“.
- Proširiti E↔D konverzije (`kg`, `t`, `m³`, `l`, `pcs`); upozorenja za nepoznate jedinice.
- U F: validacija kompatibilnosti jedinica aktivnosti i faktora, sa konverzijama ili greškama.

### Faza 3: Excel export konsolidacija + UI Fuel Balance
- Ukloniti lokalne `exportToExcel` u E/F i centralizovati u `excelExport.ts`.
- Harmonizovati nazive listova/kolona (sr) preko i18n.
- Proširiti `importFromExcel` za `dataQuality`, `validationStatus`, `verificationData`.
- Dodati u UI „Fuel Balance (TJ)“ pregled u „Pregled i izvoz“. 

### Faza 4: Validacije
- E: `∑ processConsumptions.quantity ≈ totalQuantity` i `nonCBAMQuantity ≤ totalQuantity`.
- C: stvarno mapiranje „Import from B_EmInst“ polje‑po‑polje ili uklanjanje flag‑a; razjasniti C Excel kolone.
- F: dodatne kontrole izvora vs B i jedinica kompatibilnosti.

### Faza 5: Konsolidacija tipova/modela
- Jedinstveni `ReportingPeriod`, `VerifierInformation`, `EmissionsTotals`, `ElectricityData`; smanjenje dupliranja u `CBAMData`.

### Faza 6: UX vođenje
- Bedževi sa brojem grešaka/upozorenja po koraku; dosledni Tooltips.
- Prazan‑state poruke i saveti na srpskom; opcioni dijalog pri skoku na drugi korak sa greškama.

### Faza 7: Testiranje
- Unit testovi za engine‑e i konverzije; E2E smoke kroz UI; round‑trip Export→Import.

## Kriterijumi uspeha
- Kompajliranje bez upozorenja; 100% srpski UI/eksport; konsistentne jedinice; uspešne cross‑sheet validacije; uklonjeni duplikati eksport logike.

Ako odobravate, počinjem odmah Fazu 1 i nakon svake faze testiram, ispravljam i nastavljam do kompletnog plana.