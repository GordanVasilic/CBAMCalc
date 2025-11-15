## Cilj
- Poboljšati čitljivost i ergonomiju unosa u tabelama „Tokovi i izvori emisija“ i „PFC emisije“.
- Smanjiti horizontalno prelivanje, jasno prikazati jedinice i skratiti zaglavlja.

## Predložene UI Promjene
1. Kompaktna polja:
- `size="small"` za sve `TextField`/`Select` u redovima.
- Smanjiti font polja (`inputProps={{ style: { fontSize: 12 }}}`).

2. Fiksne širine kolona i elipsa:
- Definisati `sx={{ width: <px>, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}` po koloni (npr. `#` 48px, `Metoda` 140px, `Naziv toka` 160px, `AD` 110px, `NCV` 130px, `EF` 130px, `OxF`/`ConvF` 100px, `Carbon` 120px, `Biomass`/`Non-sust.` 100px).
- Primijeniti i u PFC tabeli (`Metoda`, `Tip tehnologije`, `AD`, `Učestalost`, `Trajanje`, `SEF CF4`, `C2F6`).

3. Jedinice kao adornment ili mini-select:
- Za `NCV` i `EF`: numeric `TextField` + `InputAdornment` za jedinice (npr. „GJ/t“, „tCO2/TJ“) i pored mini `Select` (ikona zupčanik) za promjenu jedinice.
- Za `OxF`/`ConvF`: suffix `%` kao `InputAdornment`.
- Poravnati brojeve desno (`inputProps={{ style: { textAlign: 'right' }}}`).

4. Sticky kolone i zaglavlje:
- `TableCell` za `#` i `Metoda`: `sx={{ position: 'sticky', left: 0, zIndex: 1, bgcolor: 'background.paper' }}` i `left: 70` za drugu.
- `TableHead` sticky unutar `TableContainer` (CSS `position: sticky; top: 0`).

5. Skraćena zaglavlja + tooltips:
- Skraćene oznake („AD“, „OxF“, „ConvF“) i `Tooltip` s punim opisom.

6. Grupisanje kolona:
- Vizuelno grupisati „Energetski“ (NCV, EF, OxF, ConvF) i „Biomasa“ (Biomass %, Non-sust. Biomass %) sa tankom separator linijom.

7. Komponentizacija redova:
- Izvući `EmissionSourceRow` i `PFCRow` kao zasebne komponente sa lokalnim `sx` za širine, da se lakše održi.

## Implementacija (datoteke)
- `src/components/steps/BEmInstStep.tsx`:
  - Dodati konfiguraciju kolona (širine/etikete/tooltip).
  - Uvesti `InputAdornment` i mini-`Select` za jedinice u kolone NCV/EF.
  - Primijeniti `size="small"`, poravnanje desno i elipsu.
  - `TableCell` sticky za prve dvije kolone; `TableHead` sticky.
- Dodati `components/common` pomoćne komponente: `EmissionSourceRow.tsx`, `PFCRow.tsx` (opciono) ili ostaviti inline uz `sx`.

## Rezultati
- Manje horizontalnog skrolovanja; tekst staje u ćelije uz elipsu.
- Jedinice jasne i uz broj; brojke poravnate desno.
- Prve kolone ostaju vidljive pri skrolu.

## Verifikacija
- Vizuelni pregled u browseru.
- Brza provjera unosa dugačkih naziva i promjene jedinica.

## Tražim potvrdu
- Potvrdi da idem s navedenim promjenama bez dodavanja novih biblioteka; po potrebi izvučem redove u pomoćne komponente za čitljivost koda. 