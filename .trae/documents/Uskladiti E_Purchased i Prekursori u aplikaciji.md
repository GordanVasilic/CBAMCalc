## Nalazi
- Originalni Excel koristi domen `E_Purchased` i njegove listove: `E_Purchased` (sažetak), `E_PurchPrec` (tabela prekursors), `E_PurchPrec_Sections` (sekcije (a)/(b)). Mapa kolona: `src/types/EPurchasedTypes.ts:209–241`. Export/import: `src/utils/excelExport.ts:435–521`, import: `src/utils/excelExport.ts:685–887`.
- Aplikacija ima dva koraka:
  - `E_Purchased - Kupljeni prekursori`: komponenta `src/components/steps/EPurchasedStep.tsx` radi nad `cbamData.ePurchased` (kompletni domen E sheetova).
  - `Nabavljeni prekursori`: komponenta `src/components/purchased-precursors/PurchasedPrecursorsForm.tsx` radi nad `cbamData.purchasedPrecursors` (paralelna, pojednostavljena struktura).
- Export/import ne koristi `cbamData.purchasedPrecursors` (nigdje referencirano u `excelExport.ts`), dok `ePurchased` je jedini izvor za Excel.

## Zaključak
- `Nabavljeni prekursori` uvodi paralelni skup podataka koji nije vezan za Excel roundtrip, pa stvarno djeluje kao duplikat domene i može zbunjivati.
- Preporuka: zadržati jedan korak zasnovan na `E_Purchased`, a „Prekursori“ prikaz uklopiti u taj korak ili ga ukloniti.

## Predložene Promjene
1. Ukloniti zaseban korak `Nabavljeni prekursori` iz wizards/steppera:
   - `src/components/CBAMWizard.tsx`: iz `steps` ukloniti label „Nabavljeni prekursori“; iz `getStepContent` ukloniti `case` koji renderuje `PurchasedPrecursorsForm`.
   - `src/components/CBAMStepper.tsx`: ukloniti item sa `id` tog koraka i uskladiti indekse (rezultati postaju sljedeći).
2. Po želji zadržati jednostavni UI kao pod‑tab u `E_Purchased`:
   - Dodati Tabs u `EPurchasedStep` (Summary/Precursors/Sections), ostaviti postojeći editor (već pokriva precursors) — ili integrisati jednostavni pregled sličan `PurchasedPrecursorsForm`, ali vezan na `ePurchased.precursors` da nema dvostrukog izvora.
3. Ne mijenjati Excel roundtrip:
   - `excelExport.ts` i `EPurchasedTypes.ts` ostaju izvori; testovi `excel_ePurchased_roundtrip` i `excel_ePurchased_import_markers` moraju ostati zeleni.

## Verifikacija
- Pokrenuti testove; izvršiti ručni prolaz kroz `E_Purchased` i potvrditi da su sažetak, tabela i sekcije funkcionalne.
- Provjeriti da validacija u wizardu pokriva `ePurchased` i da više nema koraka koji rade nad `purchasedPrecursors`.

## Napomena
- Ako tim želi zadržati „Jednostavni unos“, možemo refaktorisati `PurchasedPrecursorsForm` da koristi `ePurchased.precursors` umjesto `cbamData.purchasedPrecursors`, kako bi ostao jedan izvor istine.