## Šta je pokriveno u aplikaciji (C_InstEmissions)
- Polja — Fuel Balance: `totalFuelInput`, `directFuelCBAM`, `fuelForElectricity`, `directFuelNonCBAM` (src/types/CInstEmissionsTypes.ts:37–48). Prikaz i unos u UI (src/components/steps/CInstEmissionsStep.tsx:375–427).
- Polja — Emissions Balance: `totalCO2Emissions`, `biomassEmissions`, `totalN2OEmissions`, `totalPFCEmissions`, `totalDirectEmissions`, `totalIndirectEmissions`, `totalEmissions` (src/types/CInstEmissionsTypes.ts:51–68). UI unos (src/components/steps/CInstEmissionsStep.tsx:441–515).
- Način rada: ručni/auto toggle i izvor podataka B_EmInst/manual (src/components/steps/CInstEmissionsStep.tsx:331–355, 125–165).
- Formule: sumiranje Fuel Balance (src/utils/cInstEmissionsCalculationEngine.ts:155–165) i Emissions Balance (src/utils/cInstEmissionsCalculationEngine.ts:170–185) sa ručnim override-om (`manualEntries`).
- Veze sa B_EmInst: auto uvoz suma CO2e, PFC, biomase i energetskog sadržaja ako izvor = B_EmInst (src/utils/cInstEmissionsCalculationEngine.ts:113–139).
- Cross‑sheet validacije (C ↔ B): engine (src/utils/cInstEmissionsCalculationEngine.ts:374–469) i UI sa statusnim čipovima (src/components/steps/CInstEmissionsStep.tsx:236–299).
- Data Quality: opcije i export (src/types/CInstEmissionsTypes.ts:71–76, 146–159; src/utils/excelExport.ts:257–266).
- Excel izvoz C lista: sažetak, fuel/emissions balance, data quality, validacijski status, i C↔B provjere (src/utils/excelExport.ts:235–279).
- Excel import C lista: parsiranje ključnih polja i meta (src/utils/excelExport.ts:413–451).

## Procjena pariteta s Excelom
- Ključna polja i zbirne linije iz C sheeta su pokrivene i mapirane na odgovarajuće redove (src/types/CInstEmissionsTypes.ts:182–206; src/utils/cInstEmissionsCalculationEngine.ts:528–606).
- Formule zbirnih polja u C su implementirane 1:1 (zbroj komponenti i total vs direct+indirect), s dodatnim ručnim override-om.
- Veze C ↔ B su aktivne (auto import + provjere razlika), što odražava Excel logiku referenciranja B suma.

## Uočene razlike / mogući nedostaci
- Pregled mjerenih izvora (`measurementSources`) nije prikazan unutar C koraka — oni se uređuju u B_EmInst i izvoze se u B list; ako Excel traži i rezime u C, možemo dodati read‑only tabelu u C (src/types/CInstEmissionsTypes.ts:86–88, 110–123).
- Razrada indirektnih emisija je sumarna (`totalIndirectEmissions`) bez pod-razlaganja po izvoru; ako Excel ima dodatne redove (npr. električna energija vs. uvoz toplote), možemo dodati ta polja i mapiranje.
- Export C meta preko generičkog cSheet buildera je pokriven; funkcija `mapCInstEmissionsToExcel` ne mapira meta blok, ali cSheet ga zapisuje — po želji možemo ujednačiti kroz jedan pristup.

## Plan za 100% identičnost s Excelom
- Dodati read‑only pregled `measurementSources` u C koraku (rezime sekcije c) da korisnik vidi sve i u C.
- Po potrebi dodati razlome `totalIndirectEmissions` po izvoru, u skladu s Excel rasporedom (npr. `indirectElectricity`, `indirectHeat`), i ažurirati export/import mapiranja.
- Ujednačiti export: konsolidirati na `mapCInstEmissionsToExcel` ili dopuniti ga da uključuje meta blok.
- Dodati male tooltip‑ove pored fuel/emissions polja s formulama (za edukativni efekt, bez mijenjanja logike).

Ako odobrite, implementirat ću navedene dorade da C_InstEmissions bude identičan Excelu i verificirati ih kroz build i Excel export/import testove.