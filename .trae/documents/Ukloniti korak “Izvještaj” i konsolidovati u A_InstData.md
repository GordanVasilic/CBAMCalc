## Sažetak odluke
- Ukloniti korak 2 (“Konfiguracija izvještaja”) jer sadrži malo polja i preklapa se s A_InstData.
- Sve neophodno iz koraka 2 prenijeti u korak 3 (A_InstData), ili ukloniti ako nije dio originalnog Excel-a.

## Provjera originalnog Excel-a
- A_InstData mapira samo početni i krajnji datum izvještajnog perioda: B10 = start, F10 = end (`src/utils/aInstDataCalculationEngine.ts:718`–`724` i `src/types/AInstDataTypes.ts:AINST_EXCEL_MAPPINGS` za `reportingPeriod`).
- Polje “Vrsta izvještaja” ne postoji u A_InstData Excel šablonu; to je aplikacijski meta podatak.

## Šta prebaciti u A_InstData
- `installationId` → dodati polje u sekciji “Installation Identification” (`installationIdentification.installationId`) i UI unos u A_InstData koraku.
- `reportingPeriod` → oslanjati se isključivo na A_InstData `startDate`/`endDate` (datumi se već unose u koraku 3); ukloniti godišnji select iz koraka 2.
- `reportType` → ukloniti (nije u Excel šablonu); eventualno ga zadržati kao interni meta (bez UI), ali po zahtjevu ga brišemo.

## Promjene u aplikaciji
- Ukloniti korak 2 iz wizard-a i stepper-a (iz liste koraka i validacija).
- A_InstData UI: dodati unos “ID instalacije” u sekciji identifikacije.
- Validacije:
  - Ukloniti validacije vezane uz `reportConfig.reportType` i godišnji period u step 2.
  - Zadržati A_InstData pravila za datume; `isFullCalendarYear` i `reportingYear` ostaju derivirani (bez posebnog UI-a).
- Export:
  - U “Report Configuration” zaglavlju koristiti samo A_InstData (start/end datumi) i `installationId`; izbaciti `reportType`.
  - Blokovi “Installation Details/Verifier” ostaju pogonjeni A_InstData (kako je već podešeno).
- Sinhronizacija:
  - Ako postojećim korisnicima ostanu podaci u `reportConfig.installationId`, prebaciti ih u `installationIdentification.installationId` ako tamo prazno.

## Koraci implementacije
1. Ukloniti `ReportConfigStep` iz wizard-a i stepper-a; reindeksirati korake i validacije.
2. Dodati `installationId` input u A_InstData identifikaciji.
3. Ukloniti UI elemente i validacije za `reportType` i godišnji select; osloniti se na A_InstData datume.
4. Ažurirati Excel export zaglavlje da koristi A_InstData datume i `installationId`; ukloniti `reportType` iz exporta.
5. Očistiti preostale reference na `reportConfig` u UI-u i validatorima (zadržati strukturu u tipu radi kompatibilnosti, ali bez korištenja).

## Rizici i mitigacije
- Gubitak unosa iz koraka 2: migraciona sinhronizacija `installationId` prije uklanjanja UI-a.
- Navika korisnika: A_InstData već ima datume; dodatno ćemo jasno istaknuti sekciju “Izvještajni period” na početku koraka 3.

## Traženi potvrđeni ishod
- Potvrđujem da ćemo ukloniti korak 2, ukloniti `reportType`, dodati `installationId` u A_InstData i uskladiti export/validacije s A_InstData (start/end datumi). Po potvrdi, krećem s implementacijom.