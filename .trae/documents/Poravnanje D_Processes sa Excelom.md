## Zaključak
- Ne, D_Processes u aplikaciji nije 100% identičan Excel sheetu.
- Postoje dvije paralelne implementacije: jednostavni `DProcessesStep` i napredniji `ProcessProductionDataStep`; nijedna ne pokriva sve Excel funkcionalnosti, a dedicated Excel izvoz/uvoz za D_Processes ne postoji.

## Šta je trenutno implementirano
- Osnovni procesni podaci u `DProcessesStep` (naziv, ruta, količina, jedinica): `src/components/steps/DProcessesStep.tsx:152–218`.
- Tržišni detalji (proizvedeno za tržište, udio, „samo za tržište“): `src/components/steps/DProcessesStep.tsx:220–269`.
- Direktne emisije (primjena, količina, izvor, metode): `src/components/steps/DProcessesStep.tsx:271–374`.
- Mjerljiva toplota (neto, uvoz/izvoz, EF): `src/components/steps/DProcessesStep.tsx:376–466`.
- Napredniji dio podataka o procesu (ulazi/izlazi, CN kodovi, električna energija, izvoz el. energije, potrošeno u drugim procesima, ne‑CBAM dobra) u `ProcessProductionDataStep`: 
  - Ulazi/izlazi po procesu: `src/components/steps/ProcessProductionDataStep.tsx:1086–1220`.
  - D_Processes detalji (total production, produced for market, share auto): `src/components/steps/ProcessProductionDataStep.tsx:1224–1276`.
  - Ne‑CBAM dobra: `src/components/steps/ProcessProductionDataStep.tsx:1305–1335`.
  - Električna energija (potrošnja, EF, jedinice, izračun, izvoz): `src/components/steps/ProcessProductionDataStep.tsx:1340–1493`.
  - Potrošeno u drugim procesima (link na druge procese): `src/components/steps/ProcessProductionDataStep.tsx:1495–1539`.

## Ključne razlike i praznine naspram Excel D_Processes
- Input/Output matrice
  - Tipovi postoje (`inputOutputMatrix`): `src/types/DProcessesTypes.ts:105–125`, ali UI/proračuni nisu implementirani; default je prazan: `src/types/DProcessesTypes.ts:349–359`.
- Otpadni plinovi i neizravne emisije
  - `DProcessesStep` nema UI za otpadne plinove i indirektne emisije; prisutna je samo mjerljiva toplota (nema referenci za Waste/Indirect): vidi manjak u `src/components/steps/DProcessesStep.tsx`.
- Kontrolni total, potrošnja za ne‑CBAM dobra, matrice potrošnje
  - Polja su definisana u tipovima (`consumedForNonCBAMGoods`, `consumedInOtherProcesses`, `controlTotal`): `src/types/DProcessesTypes.ts:20–28`, ali u `DProcessesStep` UI nedostaju; u `ProcessProductionDataStep` postoji parcijalna podrška za ne‑CBAM i potrošnju u drugim procesima (vidi linije iznad), bez matrica/sumara kao u Excelu.
- Proračunski engine za D_Processes
  - Nema specifičnog `dProcessesCalculationEngine.ts`; postoje generičke funkcije na nivou procesa (`calculateProcessEmissionsByGasType`): `src/utils/calculationEngine.ts:347–356`, koje ne pokrivaju D matrice i SEE denominator iz Excel‐a.
- Excel izvoz/uvoz za D_Processes
  - Dedicated sheet za D_Processes i InputOutput ne postoji; izvoz ide u jedan „CBAM Report“ sa sekcijom „Process and Production Data“: `src/utils/excelExport.ts:95–117`.
  - Postoje B/C/E/F listovi (`B_EmInst`, `C_InstEmissions`, `E_Purchased`, `F_Emissions`): `src/utils/excelExport.ts:140–351`.

## Plan za 100% paritet sa Excel D_Processes
1. UI proširenja (D korak)
- Dodati sekcije u `DProcessesStep` za: otpadne plinove, neizravne emisije (električna energija), izvoz električne energije, kontrolni total, potrošnju u drugim procesima i ne‑CBAM dobra, sa validacijama.
- Implementirati uređivanje `inputOutputMatrix` (process→process, process→product, precursor consumption) sa sažecima.
2. Proračuni i validacije
- Kreirati specifičan engine za D (`dProcessesCalculationEngine`) koji računa: direktne/toplota/otpadni/indirektne emisije, kredit za izvoz, SEE denominator (= total production within installation), raspodjelu po matricama, kontrolne provjere, i status validacija.
3. Excel izvoz/uvoz
- Dodati dedicated sheet‑ove: `D_Processes` i `InputOutput`, sa mapiranjem naziva ćelija/range‑ova iz Excel‑a (npr. `TotProd_`, `ToMarket_`, `PrecToGood__`, `EmDir_`, `ElecCons_`, `ElecEFMeth_`).
- Omogućiti uvoz tih sheet‑ova nazad u aplikaciju (parsiranje u `DProcessesData`).
4. Integracije
- Uvezati rezultate D sa `Summary_Processes` i cross‑sheet provjerama (B↔C↔D), uključujući SEE i balanse energije.
5. UX i pomoćne informacije
- Dodati tooltipe i „formula hint“ uz ključna polja (kao u C koraku), te completeness indikatore po sekcijama.

Ako potvrdiš, implementiraću navedene tačke, poravnati oba postojeća koraka (DProcessesStep i ProcessProductionDataStep) i obezbijediti punu Excel paritetu (UI, proračuni, i Excel mapping).