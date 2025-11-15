## Sažetak trenutnog stanja
- Redoslijed u aplikaciji nakon `A_InstData` ide na `D_Processes`, dok u Excelu poslije `A_InstData` ide `B_EmInst`. U kodu je `steps` niz definisan kao: `src/components/CBAMWizard.tsx:29–32` i render mape: `src/components/CBAMWizard.tsx:313–323`.
- `B_EmInst` je trenutno šesti korak (indeks 5) i koristi totals/cross-checkove u exportu, ali se poseban `B_EmInst` list ne generiše: `src/utils/excelExport.ts:178–189` i `src/utils/excelExport.ts:183–187`.
- `B_EmInst` tipovi i Excel row-map konstante su već prisutni: `src/types/BEmInstTypes.ts:150–172` i defaulti: `src/types/BEmInstTypes.ts:175–185`.
- `D_Processes` UI/typovi pokrivaju osnove procesa i matrice ulaza/izlaza, ali Excel je detaljniji (mjerenja, jedinice, validacija, statusi, veza na energiju): `src/components/steps/DProcessesStep.tsx:34–40,79–82,480–489` i `src/types/DProcessesTypes.ts:218–264,386–423`.

## Cilj
- Poravnati redoslijed koraka sa Excel šemom: nakon `A_InstData` ide `B_EmInst`, pa tek onda `D_Processes`.
- Proširiti `D_Processes` da dostigne paritet sa Excel listom (polja, validacije, izračuni, sekcije), uz zadržavanje postojeće UX jednostavnosti.
- Opcionalno: Dodati izdvojeni `B_EmInst` Excel list (pored sažetaka i cross-checkova), da korisnik ima pregled izvora emisija kao u šablonu.

## Promjene po komponentama
- CBAMWizard
  - Reorder `steps` niza i `getStepContent` switch mape da `BEmInstStep` bude korak 2 (poslije `AInstDataStep`), a `DProcessesStep` pređe na sljedeći.
  - Uskladiti validacijski gate za Next/Prev da poštuje novi slijed.
- B_EmInst
  - Potvrditi da `BEmInstStep` već radi sa `BEmInstData.totals` i detaljima izvora; ostaviti postojeći UI.
  - Export: dodati opcionalni list `B_EmInst` sa tabelom izvora (kolone: metoda, naziv toka, AD/NCV/EF/CC/OxF, CO2e fosilni/biomasa, napomene). Sačuvati postojeće cross-sheet provjere.
- D_Processes
  - Napraviti gap-analizu polja u Excelu naspram `DProcessesData` i proširiti tipove/validacije:
    - Mjerenja i učestalost (npr. `measurementMethod`, `measurementFrequency`).
    - Jedinice i standardizacija (obavezne jedinice po polju, automatske konverzije).
    - Veze na energiju (potrošnja električne i goriva po procesu; veza sa `EnergyFuelData`).
    - Statusi kompletnosti i provjere po procesu (vizualni indikatori, score).
    - PFC/posebni procesi ako Excel traži (sekcije/flagovi).
  - UI segmentacija u akordeone: Ulazi, Izlazi, Energija, Emisije, Mjerenja/Verifikacija, Rezime procesa.

## Validacija i cross-checkovi
- Održati postojeće `C ↔ B` provjere u exportu: `src/utils/excelExport.ts:183–187`.
- Dodati provjere koje uključuju `D_Processes` totals naspram `B_EmInst`/`C_InstEmissions` gdje je primjenjivo (npr. potrošnja goriva po procesu vs ukupno iz B/C).

## Migracija i kompatibilnost
- Migrirati postojeće korisničke podatke tako da redoslijed koraka ne izgubi sadržaj (presložiti bez mijenjanja payload ključova).
- Ostaviti `DEFAULT_DPROCESSES_DATA` i `DEFAULT_EMISSION_SOURCES` netaknute; proširenja dodati sa sigurnim defaultima.

## Verifikacija
- Izvršiti build i ručno testiranje redoslijeda koraka.
- Generisati Excel i potvrditi da:
  - `CBAM Report` sažetak ostaje ispravan.
  - `C_InstEmissions` i `E_Purchased` listovi se generišu kao ranije.
  - Novi `B_EmInst` list (ako uključen) pravilno prikazuje izvore.
  - Cross-check procenti imaju očekivane vrijednosti.

## Plan isporuke
- Faza 1: Reorder koraka i osnovno poravnanje exporta.
- Faza 2: Gap-analiza i proširenje `D_Processes` tipova/UX.
- Faza 3: Dodati `B_EmInst` Excel list (opcionalno) i dodatne cross-checkove.
- Faza 4: Verifikacija i fino podešavanje UX-a.

Molim potvrdu da nastavimo s ovim redoslijedom i proširenjima (posebno da `B_EmInst` ide odmah nakon `A_InstData`).