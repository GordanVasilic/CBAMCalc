export type TranslationParams = Record<string, string | number>

const sr: Record<string, string> = {
  'wizard.title': 'CBAM čarobnjak komunikacijskog predloška',
  'wizard.subtitle': 'Izrada izvještaja o ugrađenim emisijama',
  'navigation.step': 'Korak {current} od {total}',
  'buttons.back': 'Nazad',
  'buttons.next': 'Dalje',
  'buttons.reset': 'Poništi',
  'buttons.cancel': 'Otkaži',
  'buttons.export': 'Izvoz',
  'buttons.print': 'Štampa',
  'results.title': 'Rezultati i izvoz',
  'results.intro': 'Pregledajte izračunate emisije i izvezite rezultate za CBAM prijavu.',
  'results.emissionsSummary': 'Sažetak emisija',
  'results.energyMaterials': 'Energija i materijali',
  'results.detailed': 'Detaljni rezultati',
  'results.directBreakdown': 'Struktura direktnih emisija',
  'results.processBreakdown': 'Struktura procesnih emisija',
  'results.embeddedBreakdown': 'Struktura ugrađenih emisija',
  'results.fuelBalance': 'Bilans goriva (TJ)',
  'fuel.totalInput': 'Ukupan unos goriva',
  'fuel.cbamProcesses': 'CBAM proizvodni procesi',
  'fuel.electricity': 'Proizvodnja električne energije',
  'fuel.nonCbam': 'Ne-CBAM procesi',
  'note.conversion': 'Napomena: GJ i MWh konvertovani u TJ.',
  'export.options': 'Opcije izvoza',
  'export.options.intro': 'Izvezite rezultate CBAM prijave u različitim formatima.',
  'export.excel': 'Excel',
  'export.pdf': 'PDF',
  'export.csv': 'CSV',
  'export.print': 'Štampa',
  'dialog.export.title': 'Izvoz rezultata',
  'dialog.export.confirm': 'Da li želite da izvezete rezultate u {format} formatu?',
  'validation.messages': 'Poruke validacije',
  'validation.calcComplete.title': 'Izračun završen',
  'validation.calcComplete.text': 'CBAM emisije su uspešno izračunate. Pregledajte rezultate pre izvoza.',
  'validation.highEmissions.title': 'Otkrivene visoke emisije',
  'validation.highEmissions.text': 'Ukupne emisije su visoke. Proverite tačnost podataka i razmotrite smanjenje emisija.',
  'validation.lowRenewable.title': 'Nizak udeo obnovljive energije',
  'validation.lowRenewable.text': 'Udeo obnovljive energije je ispod 20%. Povećanje obnovljive energije može smanjiti emisije.',
  'validation.ready.title': 'Spremno za izvoz',
  'validation.ready.text': 'Rezultati su spremni za izvoz. Izaberite format iznad.'
  , 'help.title': 'Pomoć & Referenca'
  , 'help.tabs.versions': '0_Versije'
  , 'help.tabs.contents': 'a_Sadržaj'
  , 'help.tabs.guidelines': 'b_Smjernice i uslovi'
  , 'help.tabs.codelists': 'c_Listinzi kodova'
}

export function t(key: string, params?: TranslationParams): string {
  const template = sr[key] ?? key
  if (!params) return template
  return Object.keys(params).reduce((acc, k) => acc.replace(new RegExp(`\\{${k}\\}`, 'g'), String(params[k])), template)
}