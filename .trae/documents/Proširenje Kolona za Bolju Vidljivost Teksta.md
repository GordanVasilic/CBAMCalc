## Cilj
- Raširiti kolone s dugim tekstom (npr. "Naziv toka") i kolone s jedinicama (NCV/EF) kako bi sadržaj bio vidljiv bez rezanja.

## Promjene u Tabelama
1. Tokovi i izvori emisija (B_EmInst)
- Povećati širine kolona:
  - "Naziv toka": 320px
  - "Podaci o aktivnosti": 200px
  - "NCV": 240px (broj 140px + select jedinice 100px)
  - "Faktor emisije": 240px (broj 140px + select 100px)
  - "OxF"/"ConvF": 130px svaka
  - "Carbon content": 160px
  - "Biomass %"/"Non‑sust. Biomass %": 140px svaka
- Ukloniti elipsu za unos "Naziv toka"; koristiti full width i `whiteSpace: 'nowrap'` bez skrivanja.
- Select za jedinice: `sx={{ minWidth: 100, '& .MuiSelect-select': { fontSize: 12 } }}` da "GJ/t" ne izlazi iz polja.
- Brojevi desno poravnati; zadržati `%` adornment.
- Zadržati sticky za `#` i "Metoda"; `TableContainer` sa `overflowX: 'auto'`.

2. PFC emisije
- Širine kolona:
  - "Metoda": 140px (sticky)
  - "Tip tehnologije": 200px
  - "Podaci o aktivnosti": 180px (broj 120px + jedinica 60px)
  - "Učestalost"/"Trajanje": 140px svaka
  - "SEF(CF4)"/"Faktor C2F6": 160px svaka (broj 110px + preset select 50px)
  - "AEo"/"CE"/"OVC": 140px svaka
- Brojevi desno poravnati; kompaktan font.

## Implementacija
- U `src/components/steps/BEmInstStep.tsx`:
  - Ažurirati `TableCell` `sx={{ width: ... }}` vrijednosti.
  - Ažurirati `TextField`/`Select` `sx` i `inputProps` kako je gore navedeno.
  - Ukloniti elipsu na "Naziv toka" i povećati širinu ćelije.

## Verifikacija
- Vizuelno testirati s dugim nazivima toka i provjeriti da se jedinice (npr. "GJ/t") ne sijeku.
- Zadržati horizontalni skrol gdje je potrebno.

## Napomena
- Ne uvodimo nove biblioteke; izmjene su lokalne stilizacije. Nakon odobrenja primjenjujem izmjene u jednom prolazu.