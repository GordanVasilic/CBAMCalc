## Sažetak

Nema stvarnog dupliranja: `D_Processes` je detaljni, CBAM‑usklađen izvor (sheet D + InputOutput), a `Proces i proizvodnja` je pojednostavljeni UI prikaz izveden iz `D_Processes`. Trenutno se međusobno mapiraju u `CBAMWizard.tsx` (sync naprijed‑nazad). Radi boljeg toka, predlažem jedan korak “Proizvodnja” sa dvije kartice.

## Razlozi

* Izbjegava osjećaj dvostrukog unosa jer su podaci istog domena.

* Zadržava preciznost (detaljna kartica → `D_Processes`) i brz unos (sažetak kartica → `ProcessProductionData`).

* Mapiranje ostaje transparentno: izmjene u jednoj kartici ažuriraju drugu.

## Tehnička Implementacija

1. Napraviti novu komponentu `src/components/steps/ProductionStep.tsx` sa Tabs:

   * Kartica 1: “Detaljni procesi (D)” — reuse `DProcessesStep` kao child.

   * Kartica 2: “Sažetak proizvodnje” — reuse `ProcessProductionDataStep` kao child.

   * Propagae `onUpdate`/`updateData` i koristi postojeće sync logike (kao u `CBAMWizard.tsx:327–331` i `CBAMWizard.tsx:337–405`).
2. Ažurirati `src/components/CBAMWizard.tsx`:

   * U `steps` zamijeniti dvije stavke (`D_Processes`, `Proces i proizvodnja`) jednom: `Proizvodnja`.

   * U `getStepContent` umjesto `case 5` i `case 7` imati jedan `case` koji renderuje `ProductionStep` i prosljeđuje `dProcessesData`, `processProductionData`, `emissionFactors` i callbacke.

   * Validaciju: kombinovati provjere za oba seta (`dProcessesData` i `processProductionData`) u jednom koraku.
3. Ažurirati `src/components/CBAMStepper.tsx`:

   * U grupama zamijeniti dvije stavke jednom (`id` uskladiti sa novim indeksom).

   * Label: “Proizvodnja”, shortLabel: “Proizvodnja”.
4. Ne dirati import/export:

   * Import: `D_Processes` i `InputOutput` ostaju izvor (`src/utils/excelExport.ts:927–1201`).

   * Export: `CBAM Report` koristi `processProductionData` sekciju; i dalje se puni iz `D_Processes` ako je dostupno (`src/utils/excelExport.ts:141–158`).

## Verifikacija

* Pokrenuti postojeće testove; ručno proći oba taba i provjeriti da se izmjene sinhronizuju.

* Vizualno potvrditi da “Proizvodnja” obuhvata oba pogleda bez gubitka funkcionalnosti.

## Napomena o lokaciji

* Korak “Proizvodnja” zadržati nakon `Energija`, ispred `E_Purchased` ili ga postaviti odmah prije `E_Purchased` prema trenutnom toku.

