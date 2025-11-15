## Prijedlog naziva
- Primarni: "Instalacijski podaci"
- Alternativa: "Podaci o instalaciji"
- ShortLabel: isti kao label (jasno i kratko)

## Promjene
- U `src/components/CBAMWizard.tsx` zamijeniti string u `steps` nizu: `'A_InstData - Podaci o instalaciji'` → `'Instalacijski podaci'`.
- U `src/components/CBAMStepper.tsx` u grupi `instdata` promijeniti step:
  - `label`: `'Instalacijski podaci'`
  - `shortLabel`: `'Instalacijski podaci'`

## Verifikacija
- Pokrenuti testove (ne utiče na logiku, samo labeli).
- Vizuelno provjeriti da se naziv koraka prikazuje u wizardu i stepperu bez prefiksa `A_InstData`.

## Napomena
- Excel roundtrip i validacija ostaju nepromijenjeni; radi se samo o UI labelama.