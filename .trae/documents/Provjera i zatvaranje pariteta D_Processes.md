## Verifikacija stanja
- Pokriveno u aplikaciji (D korak):
  - Osnovni podaci, tržišni detalji, direktne emisije, mjerljiva toplota, otpadni plinovi, neizravne emisije (struja), kredit za izvoz, ne‑CBAM i kontrola; inline proračuni neto i SEE.
  - Kod: D_Processes UI u src/components/steps/DProcessesStep.tsx:152–739, 467–708, 740–1059.
  - Excel export: dedicated listovi D_Processes i InputOutput u src/utils/excelExport.ts:139–234.
- Preostale razlike naspram Excel šablona:
  - Nema UI za `consumedInOtherProcesses` (potrošnja u drugim procesima) kao zasebne stavke; postoji samo IO matrica (vidi da nema referenci na consumedInOtherProcesses u src/components/steps/DProcessesStep.tsx).
  - Nema UI polja za `emissionFactorSource` i `emissionFactorMethod` u sekciji neizravnih emisija (definisano u tipovima: src/types/DProcessesTypes.ts:93–95, ali nije prikazano u DProcessesStep).
  - IO matrice su funkcionalno jednostavne (po jedan zapis po redu); nisu modelirane kao kompletna 10×10 raster matrica s kontrolnim sumama i specifičnim Excel range imenima.
  - Nema uvoza D_Processes/InputOutput iz Excel‑a (samo export), niti mapiranja na Excel named range‑ove (npr. TotProd_, ToMarket_, PrecToGood__, EmDir_, ElecCons_, ElecEFMeth_).
  - Validacije i formula‑hint tooltips nisu dodani za D (postoje u C).

## Plan za 100% paritet
1. Dodati UI za `consumedInOtherProcesses` kao listu stavki per proces (target proces, količina, jedinica), sa kontrolnim sumama.
2. Proširiti neizravne emisije UI: dodati `emissionFactorSource` i `emissionFactorMethod` polja.
3. IO matrice: uvesti „grid“ prikaz (do 10×10) s kontrolnim totalima, procentualnim udjelima i validacijama (matrixCompleteness, totalInputs/Outputs/netProduction).
4. Excel kompatibilnost:
   - Mapirati D_Processes i InputOutput na nazivlja ćelija i named range‑ove iz Excel šablona.
   - Dodati uvoz (parsing) za D_Processes/InputOutput sheetove.
5. Validacije i UX:
   - Dodati section‑wise validacije i tooltipe („formula hint“), i completeness indikator za D.

Potvrdi plan pa ću odmah implementirati ove tačke i zatvoriti paritet do 100%.