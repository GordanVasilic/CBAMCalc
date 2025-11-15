## Cilj
- Dodati izbor jedinica za NCV i EF u B_EmInst tabeli i proširiti PFC polja (Duration, C2F6 factor, AEo, CE, OVC) u UI.

## Promjene
- BEmInstStep UI:
  - NCV: pored vrijednosti dodati select jedinica (`TJ/t`, `GJ/t`, `MJ/kg`).
  - EF: pored vrijednosti dodati select jedinica (`tCO2/TJ`, `kgCO2/GJ`).
  - PFC: dodati polja `Duration`, `C2F6 factor`, `AEo`, `CE`, `OVC` u tabelu.

## Kalkulacije
- Već postoje normalizacije NCV/EF i upotreba `duration` i `c2f6Factor`. AEo/CE/OVC ostaju opcioni (za kasnije precizno uključivanje); upozorenja su već dodana.

## Verifikacija
- Build bez grešaka, dev server bez TypeScript problema.
- Vizuelno potvrditi da su selecti i dodatna polja vidljivi i funkcionalni.

Ako je u redu, implementiram odmah.