## Zaključak
- D_Processes u aplikaciji nije 100% identičan Excelu; postoje funkcionalne razlike u uvozu, validacijama, kalkulacijama i UI pokrivenosti.

## Uočene Razlike
- Uvoz/Izvoz:
  - Izvoz D_Processes postoji i generira listove `D_Processes` i `InputOutput` (`src/utils/excelExport.ts:143-227`).
  - Uvoz iz Excela ne obrađuje `D_Processes` — podržani su samo `C_InstEmissions`, `E_Purchased`, `F_Emissions` (`src/utils/excelExport.ts:502-610`), pa paritet nedostaje.
- Dvije paralelne implementacije procesa:
  - Korak s detaljima procesa (`src/components/steps/ProcessProductionDataStep.tsx`) računa udio tržišta automatski iz total/market (`1263-1276`) i provodi konverzije jedinica za električnu energiju (`739-747`).
  - Korak D_Processes (`src/components/steps/DProcessesStep.tsx`) omogućuje ručni unos `shareProducedForMarket` (`283-293`) i ne provodi konverzije jedinica pri indirektnim emisijama; koristi samo MWh (`638-683`).
- UI pokrivenost Input/Output matrica:
  - Tipovi podržavaju polja `share` i `calculationMethod` (`src/types/DProcessesTypes.ts:127-134`), ali UI u `DProcessesStep.tsx` ne omogućuje unos/izmjenu tih polja (vidljiv je samo `amount`, `unit`).
- Validacije vs. UI:
  - Validacije za D_Processes logiku nalaze se nad `processProductionData` (npr. market share 0..100, non‑CBAM, negativne vrijednosti, električna energija export) (`src/utils/dataValidationUtils.ts:64-115`, `346-389`).
  - `DProcessesStep.tsx` ne koristi taj validator niti ima ekvivalentnu provjeru polja.
- Kalkulacije:
  - Engine pojednostavljuje proračune i ne koristi udio topline za CBAM dobra (`shareToCBAMGoods`) pri izračunu (`src/utils/dProcessesCalculationEngine.ts:30-36`).
  - Indirektne emisije ne rade konverzije jedinica u engine‑u (`45-50`), dok ih UI u drugoj implementaciji radi (`src/components/steps/ProcessProductionDataStep.tsx:739-747`).

## Predloženi Plan Do Pariteta
- Dodati uvoz D_Processes iz Excela:
  - Parsirati sheet `D_Processes` i mapirati u `CBAMData.dProcessesData.productionProcesses` i `inputOutputMatrix` (`src/utils/excelExport.ts`).
- Uskladiti kalkulacije s Excelom:
  - U `dProcessesCalculationEngine.ts` uvesti konverzije jedinica (kWh/GJ↔MWh), primjenu `shareToCBAMGoods` i `reusedShare` te provjere granica.
- Unificirati model i korake:
  - Donijeti odluku: koristiti centralno `dProcessesData` i uskladiti `ProcessProductionDataStep` ili spajanje funkcionalnosti u jedan korak.
- Proširiti UI matrica:
  - U `DProcessesStep.tsx` omogućiti unos `share` i `calculationMethod` za `processToProcess`, `processToProduct` i `precursorConsumption`.
- Aktivirati validacije:
  - Pozvati validatore iz `dataValidationUtils.ts` pri spremanju/validaciji D_Processes i prikazati poruke.
- Testovi i verifikacija:
  - Dodati testove koji za iste ulaze daju identične rezultate Excelu; validirati export/import round‑trip.

## Što ću napraviti nakon odobrenja
- Implementirati uvoz D_Processes u `excelExport.ts` i dodati potrebne mape.
- Nadograditi `dProcessesCalculationEngine.ts` s konverzijama i korištenjem svih relevantnih polja.
- Uskladiti UI (`DProcessesStep.tsx`) s tipovima i validacijama te dodati nedostajuća polja matrica.
- Dodati provjere i osnovne testove za paritet izračuna i validacija.