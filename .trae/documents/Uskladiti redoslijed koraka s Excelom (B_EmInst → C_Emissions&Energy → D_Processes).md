## Zašto je sada D prije C
- U aplikaciji je `D_Processes` postavljen prije `C_InstEmissions` da bi se prvo unijeli procesni parametri koji direktno ulaze u emisije/energiju (npr. PFC metodologije, AEo/CE/OVC, maseni bilans), a tek potom zbirne vrijednosti u C.
- Funkcionalno nema prepreka da C ide odmah nakon B kao u Excelu — podaci su već dvosmjerno vezani i izračuni rade neovisno o vizualnom redoslijedu.

## Trenutni redoslijed u kodu
- `src/components/CBAMWizard.tsx:29–40` definira korake: A → B → D → C → …
- Mapiranje sadržaja koraka: `src/components/CBAMWizard.tsx:309–341` (`case 2 = B`, `case 3 = D`, `case 4 = C`).
- Primijećena nekonzistentnost validacije: `src/components/CBAMWizard.tsx:221–250` validacija za `case 3` referencira `cInstEmissions` i `case 5` `bEmInstData` — to treba poravnati s novim redoslijedom.

## Plan izmjena (usklađivanje s Excelom)
- Preurediti `steps` listu i `getStepContent` switch tako da ide: `A_InstData` → `B_EmInst` → `C_InstEmissions` → `D_Processes` → ostalo.
- Poravnati `validateCurrentStep` slučajeve da odgovaraju novim indeksima (C validacija na novom `case` indeksu, D na svom, itd.).
- Provjeriti stepper header (`CBAMStepper.tsx`) da etikete i kratki nazivi prate redoslijed.
- Ne dirati izračune i export — dvosmjerne veze B ↔ C ostaju iste; Excel export (`excelExport.ts`) već izdvaja B i C neovisno o UI redoslijedu.

## Verifikacija
- Pokrenuti dev, proći kroz A → B → C → D i potvrditi da validacije i upozorenja rade na pravim koracima.
- Brzi smoke test Excel/PDF exporta da potvrdi nepromijenjene listove i vrijednosti.

## Utjecaj i rizik
- UI/UX poravnanje s Excelom; minimalni rizik jer se ne mijenja poslovna logika nego indeksiranje koraka i validacija.

Molim potvrdu — nakon odobrenja izvršit ću promjene i verificirati ih.