## Cilj
Postaviti korake "Energija i gorivo" odmah iza "C_InstEmissions" u UI‑wizardu, tako da korisnik prvo vidi sažetak emisija/energije pa odmah detalje energije.

## Datoteke za izmjenu
- `src/components/CBAMWizard.tsx` (redoslijed `steps` i `getStepContent(...)`)
- `src/components/CBAMStepper.tsx` (vizuelni stepper `stepGroups`/mapiranje indeksa)

## Promjene u CBAMWizard
1. U nizu `steps`, premjestiti `'Energija i gorivo'` da stoji odmah poslije `'C_InstEmissions - Emisije i energija'` i prije `'D_Processes - Procesi proizvodnje'`.
2. U `getStepContent(step)` ažurirati switch:
   - `case` za `CInstEmissionsStep` ostaje na svom indeksu.
   - Novi sljedeći `case` postaje `EnergyFuelDataStep`.
   - `DProcessesStep` i naredni `case` indeksi pomaknuti za +1.
3. Ako postoji `nextStep`/`prevStep` logika vezana za indekse, uskladiti da koristi novi poredak.

## Promjene u CBAMStepper
1. U `stepGroups` pomjeriti item za `'Energija i gorivo'` da vizuelno slijedi odmah nakon `'C_InstEmissions'`.
2. Ako `id` u stepperu referencira indekse iz `CBAMWizard.steps`, ažurirati `id` vrijednosti da korespondiraju novom poretku.

## Validacija
- Ručno proći wizard i provjeriti da navigacija ide: `… → C_InstEmissions → Energija i gorivo → D_Processes …`.
- Provjeriti da se validacije/pretpostavke ne oslanjaju na stari indeks (npr. zaštita prije prelaska na sljedeći korak).

## Napomena
- Promjene ne diraju model podataka; samo poredak koraka i stepper‑mapiranje. Ako želiš dodatno: možemo dodati kratki opis u UI koji objašnjava odnos "sažetak (C) → detalji (Energija)".