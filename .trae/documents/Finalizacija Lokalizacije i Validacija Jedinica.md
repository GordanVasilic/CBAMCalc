## Cilj
- Dovršiti 100% lokalizaciju na srpski u svim koracima, porukama, tooltip‑ovima i tabelama.
- Učvrstiti konverzije jedinica i validacije u E↔D, te proveru kompatibilnosti jedinica u F.
- Usaglasiti import iz Excela sa srpskim etiketama i sažecima.

## Faza 1 — Preostali prevodi
- Pretražiti preostale komponente (AInstData, EnergyFuelData, ProcessProductionData helperText, CompanyInfo, ReportConfig, InstallationDetails).
- Zameniti engleske stringove: labele, dugmad, naslove, tooltip‑ove, table headers, placeholder‑e.
- Usaglasiti `Chip` etikete i statusne poruke.

## Faza 2 — i18n konsolidacija
- Eksternalizovati najčešće korišćene stringove u `t(key)` util (naslovi, dugmad, statusne poruke), bez menjanja postojeće strukture.
- Uvesti minimalne ključeve za Excel/PDF/CSV export etikete.

## Faza 3 — Jedinice i validacije
- E↔D: dodati mapiranje za `m³`, `l`, `pcs` kroz upozorenja ili korisničku mapu (fallback upozorenje kad nije mapirano).
- F: dopuniti proveru kompatibilnosti jedinica (aktivnost/faktor) sa jasnim porukama.

## Faza 4 — Excel import usklađivanje
- Dodati srpske etikete kao alternative pri parsiranju u `importFromExcel` (npr. "Ukupne emisije", "Period izveštavanja").
- Obezbediti tolerantni read (sr/en) za Validation i Verification blokove.

## Faza 5 — UX
- Stepper badge: broj grešaka/upozorenja po koraku (dosledno srpski).
- Tooltip pragovi: C↔B, F↔C/B pragovi i saveti na srpskom.

## Faza 6 — Testiranje
- Ažurirati postojeće unit testove ako promena utiče na etikete.
- Kratki e2e smoke: unos minimalnog seta podataka, provera validacije i izvoza.

## Rezultat
- Potpuno srpski interfejs i eksporti, robustne konverzije i validacije, i Excel import tolerantno podržava srpske etikete.