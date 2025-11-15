## Cilj i Opseg
- Dovesti `B_EmInst` u aplikaciji do potpunog pariteta sa Excel `B_EmInst` sheetom: polja, jedinice, formule, validacije, upozorenja i Excel export.

## UI i Polja (Emission Sources)
- Dodati editabilna polja u tabeli izvora:
  - `OxF (%)`, `ConvF (%)`, `Carbon Content (tC/t)`, `Biomass %`, `Non-sustainable Biomass %`.
  - Kontrole jedinica za `NCV` i `EF` (selecti) uz automatsku normalizaciju na standardne jedinice (NCV→TJ, EF→tCO2/TJ).
  - Dodatne kolone: `Data source`, `Notes` (kratki tekstovi).
- Prikaz izračunatog energetskog sadržaja (fossil/biomass, TJ) u read-only kolonama.

## UI i Polja (PFC)
- Proširiti PFC tabelu:
  - Dodati `Duration`, `C2F6 factor`, `AEo`, `CE`, `OVC`.
  - Prikaz parcijalnih rezultata i CO2e (CF4/C2F6) u read-only kolonama.

## Tipovi i Defaulti
- Verifikovati da `EmissionSourceStream` već sadrži potrebna polja i unit atribute; dopuniti samo ako nedostaje.
- Osigurati safe default vrijednosti (0 ili prazno) za nova polja u inicijalizaciji izvora i PFC streamova.

## Kalkulacije i Jedinice
- Normalizacija jedinica:
  - NCV: konverzija iz `GJ/t` ili drugih u TJ gdje potrebno.
  - EF: konverzija u `tCO2/TJ` (ako uneseno u drugim jedinicama).
  - AD: osigurati da formula pravilno tretira `t`, `Nm3` i sl. gdje primjenjivo.
- Emisije:
  - Combustion: `CO2 = AD × NCV × EF × OxF × ConvF` sa ispravnim skaliranjem i procentnim faktorima.
  - Process: `CO2 = AD × EF`.
  - Mass balance: `CO2 = AD × Carbon Content × ConvF`.
  - Biomass split: podjela na `fossil/biomass/non-sust. biomass` na osnovu procenata.
- PFC: uključiti `AEo`, `CE`, `OVC` u izračune gdje predložak to traži (formule iz Excel-a), te dosljedno računati CF4/C2F6 i CO2e.

## Validacija i Upozorenja
- Dodati validacije za nova polja (range check: 0–100% za procente, pozitivne vrijednosti za faktore).
- Implementirati warnings:
  - Nedosljedne jedinice (npr. EF bez kompatibilne NCV), nedostaju parametri za odabranu metodu.
  - Sumarni “completeness score” s tegovima po metodi.

## Excel Export
- Proširiti `B_EmInst` list:
  - Uključiti sve nove kolone (OxF, ConvF, CC, Biomass%, Non-sust.%, jedinice).
  - Dodati energetski sadržaj (fossil/biomass) i validacione napomene.
  - Proširiti PFC sekciju sa dodatnim parametrima.

## Migracija i Kompatibilnost
- Postojeći podaci ostaju kompatibilni; nova polja inicijalizovati defaultima.

## Verifikacija
- Ručno testiranje UI, provjera formula na nekoliko slučajeva (combustion/process/mass balance/PFC).
- Jednostavni unit testovi za kalkulacije (bEmInstCalculationEngine) sa poznatim vrijednostima.
- Pregled Excel export-a i upoređivanje sa predloškom.

Molim potvrdu da krenem s implementacijom ovih izmjena.