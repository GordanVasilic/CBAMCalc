## Cilj
- Proći kompletan tok „glavni Excel“ (A/B/C/D/E/F listovi) i provjeriti da li aplikacija pokriva sve ulaze, veze, kalkulacije i izlaze.
- Isporučiti paritetnu matricu (Excel ⇄ App) i listu praznina sa predlogom dopuna.

## Trenutno Stanje (dokazni fajlovi)
- Navigacija i tok: `src/components/CBAMWizard.tsx:41–140, 304–404` (koraci, stanje, export hooks).
- Excel export/import: `src/utils/excelExport.ts:18–139, 383–567, 618–1204` (CBAM Report, D_Processes, InputOutput, B_EmInst, C_InstEmissions, E_Purchased/E_PurchPrec/Sections, F_Emissions; robustan import).
- E_Purchased UI i obrada: `src/components/steps/EPurchasedStep.tsx:58–206, 286–876` (svi ulazi + alokacije procesa).
- E_Purchased kalkulacije/validacija: `src/utils/ePurchasedCalculationEngine.ts:15–63, 65–118, 128–216, 254–334`.
- Glavni engine kalkulacija: `src/utils/calculationEngine.ts:947–1036` (rezultati i metrika), plus pomoćne funkcije: `src/utils/calculationEngine.ts:176–415, 428–465, 492–671, 811–865`.
- Validacija sekcija: `src/utils/dataValidationUtils.ts:14–87, 149–186, 189–206`.
- Testovi pariteta Excel-a: `src/utils/__tests__/excel_ePurchased_roundtrip.test.ts:21–51` i `src/utils/__tests__/excel_ePurchased_import_markers.test.ts:20–35`.

## Metod Verifikacije
- Inventar lista (A/B/C/D/E/F) iz glavnog Excel-a; mapiranje na App:
  - Ulazi (forme/komponente), Tipovi (`src/types/*Types.ts`), utili.
  - Veze (InputOutput, alokacije, cross‑checks između listova).
  - Kalkulacije (direktne, indirektne, ugrađene, bilansi, SEE, validacije).
  - Izlazi (Excel/CSV/PDF/print, ekranski sažeci).
- Automatizovani dokaz:
  - Pregled Excel export-a po listovima u `excelExport.ts`.
  - Pregled Excel import-a po listovima u `importFromExcel`.
  - Pokrivenost testovima (round‑trip i marker parsing za E_PurchPrec).

## Paritetna Matrica (deliverable)
- Za svaki list:
  - A_InstData: ulazi, adrese, verifikator, agregovana dobra/procesi;
  - B_EmInst: izvori emisija + PFC; veze sa C;
  - C_InstEmissions: fuel i GHG bilansi + status validacije;
  - D_Processes: proizvodni procesi, elementi (toplota, otpadni plinovi, indirektno, izvoz el.), ne‑CBAM, rezultati;
  - InputOutput: P→P, P→Proizvod, Prekursor konzumacija;
  - E_Purchased/E_PurchPrec/(a)/(b): prekursori, SEE, default justification, alokacije;
  - F_Emissions: dodatne emisije, verifikacija, cross‑checks.
- Kolone: Excel polje | App model/ekran | Import/Export implementacija | Kalkulacija/validacija | Status (OK / djelimično / nedostaje).

## Preliminarni Nalazi
- Export/import pokriva C, D, InputOutput, E_Purchased + E_PurchPrec + Sections, F; B_EmInst sa sažetkom i PFC; A_InstData podaci se iznose u „CBAM Report“ sheetu, ali ne u punom originalnom layout-u (potencijalna praznina za „A_InstData“ tačan format).
- E_PurchPrec marker parsing (SEE indirect, ElecEFMeth_, default justification) je implementiran i testiran.
- Kalkulacije u `calculationEngine.ts` koriste podrazumijevane faktore; precizne Excel formule su djelimično pojednostavljene (potencijalno odstupanje od službenog modela, ali metrika je kompletna).

## Faze i Koraci
- Faza 1: Inventar i mapiranje
  - Izvući listu polja po Excel listovima iz `public/reference/ExcelAnalysis/*` i `CBAM Communication template for installations_en_20241213.xlsx`.
  - Preko tipova u `src/types/*Types.ts` mapirati 1:1 polja.
- Faza 2: Verifikacija import/export
  - Proći `importFromExcel` i `buildWorkbook` po listovima; označiti pokrivene i propuštene dijelove.
- Faza 3: Verifikacija kalkulacija
  - Uporediti ključne formule (direktne/indirektne/SEE/bilansi) s Excel očekivanjima.
- Faza 4: Praznine i predlog dopuna
  - Posebno za „A_InstData“ tačan sheet format; dodatne kolone/sekcije koje fale.
  - Dorade u calculation engine-u gdje treba veća preciznost.
- Faza 5: Validacija
  - Round‑trip dataset kroz export→import; potvrda pariteta.
- Faza 6: Izvještaj
  - Paritetna matrica + lista zadataka za dopune.

## Validacija i Izvještaj
- Kriterij: 100% pokrivenost ulaza, veza, kalkulacija i izlaza,
- Artefakti: Matrica, testni izvještaji (Excel/CSV/PDF), zapis validacija.

## Za Potvrdu
- Ako je cilj „tačan Excel layout“ za A_InstData, potvrditi da zahtijevamo dodatni sheet export; u suprotnom zadržati sažetak u „CBAM Report“. Nakon potvrde, pokrećem audit i pripremam matrice i izmjene.