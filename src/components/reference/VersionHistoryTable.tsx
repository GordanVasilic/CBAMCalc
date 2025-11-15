import React, { useEffect, useState } from 'react'
import { Box, CircularProgress, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material'
import * as XLSX from 'xlsx'

interface VersionHistoryTableProps {
  src: string
  title?: string
}

type RawRow = { [key: string]: any }

const VersionHistoryTable: React.FC<VersionHistoryTableProps> = ({ src, title }) => {
  const [rows, setRows] = useState<Array<{ version: string; date: string; description: string }>>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    setLoading(true)
    fetch(src)
      .then(async (r) => {
        if (!r.ok) throw new Error('not_found')
        const text = await r.text()
        const wb = XLSX.read(text, { type: 'string' })
        const ws = wb.Sheets[wb.SheetNames[0]]
        const json = XLSX.utils.sheet_to_json(ws, { defval: '' }) as RawRow[]
        const parsed: Array<{ version: string; date: string; description: string }> = []

        let headerIndex = json.findIndex((row) => String(row['P5']).toLowerCase() === 'version')
        if (headerIndex === -1) headerIndex = 0

        let current: { version: string; date: string; description: string } | null = null

        for (let i = headerIndex + 1; i < json.length; i++) {
          const r = json[i]
          const v = String(r['P5'] ?? '').trim()
          const d = String(r['P6'] ?? '').trim()
          let desc = String(r['P7'] ?? '').trim()

          const isNew = v.length > 0 && d.length > 0

          if (isNew) {
            if (current) parsed.push(current)
            current = { version: v, date: d, description: desc }
          } else if (desc.length > 0) {
            if (current) current.description = current.description ? current.description + ' ' + desc : desc
          }
        }

        if (current) parsed.push(current)

        const translated = parsed.map((item) => ({
          version: item.version,
          date: item.date,
          description: translateDescription(item.description)
        }))

        setRows(translated)
        setError(null)
      })
      .catch(() => setError('Pregled verzija nije dostupan'))
      .finally(() => setLoading(false))
  }, [src])

  if (loading) return <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}><CircularProgress size={20} /> Učitavanje pregleda verzija…</Box>
  if (error) return <Typography color="error">{error}</Typography>

  return (
    <Paper sx={{ mt: 3 }}>
      {title && (
        <Typography variant="h6" sx={{ px: 2, pt: 2 }}>
          {title}
        </Typography>
      )}
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>Verzija</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Datum</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Opis</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row, idx) => (
              <TableRow key={idx}>
                <TableCell>{row.version}</TableCell>
                <TableCell>{row.date}</TableCell>
                <TableCell>{row.description}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  )
}

function translateDescription(text: string): string {
  let t = text
  t = t.replace(/first preliminary published version/gi, 'prva preliminarno objavljena verzija')
  t = t.replace(/Improvements and fixed bugs:/gi, 'Unapređenja i ispravke:')
  t = t.replace(/Minor errors corrected:/gi, 'Manje greške ispravljene:')
  t = t.replace(/Conditional format bug/gi, 'Greška uslovnog formatiranja')
  t = t.replace(/Consistent units/gi, 'Dosljedne jedinice')

  t = t.replace(/Sheet A:?/gi, 'A_InstData – Podaci o instalaciji:')
  t = t.replace(/Sheet B:?/gi, 'B_EmInst – Izvori emisija:')
  t = t.replace(/Sheet C:?/gi, 'C_InstEmissions – Emisije i energija:')
  t = t.replace(/Sheet D:?/gi, 'D_Processes – Procesi proizvodnje:')
  t = t.replace(/Sheet E:?/gi, 'E_Purchased – Kupljeni prekursori:')
  t = t.replace(/Sheet F:?/gi, 'F_Emissions – Emisije:')
  t = t.replace(/Sheet G:?/gi, 'Smjernice:')
  t = t.replace(/Summary_Processes/gi, 'Pregled procesa')
  t = t.replace(/Summary_Products/gi, 'Pregled proizvoda')
  t = t.replace(/Summary_Communication/gi, 'Rezultati komunikacije')
  t = t.replace(/a_contents/gi, 'Navigacija sadržaja')
  t = t.replace(/Sheet "?Version history"?/gi, 'Pregled verzija')

  t = t.replace(/UNLOCODE made mandatory/gi, 'UNLOCODE polje je obavezno')
  t = t.replace(/Calculation of emissions corrected \(incl\. adding missing factor of 3\.664 in the mass balance\)/gi, 'Ispravljen izračun emisija (uključeno dodavanje faktora 3.664 u bilansu mase)')
  t = t.replace(/Inconsistency between cells L16 and L17 fixed/gi, 'Ispravljena nedosljednost unosa')
  t = t.replace(/Electricity exported bug fixed/gi, 'Ispravljena greška izvoza električne energije')
  t = t.replace(/Scrap per t steel\/aluminium: values >100% can be entered now/gi, 'Otpad po t čelika\/aluminijuma: dozvoljene vrijednosti >100%')
  t = t.replace(/Fixed bug 'CN code ranges'/gi, 'Ispravljen opseg CN kodova')
  t = t.replace(/Error in sheet names in table of contents for certain Excel versions/gi, 'Ispravljeni nazivi listova u navigaciji za određene verzije')
  t = t.replace(/Link to implementing act corrected/gi, 'Ispravljen link na provedbeni akt')
  t = t.replace(/Inconsistency warning for production routes added/gi, 'Dodato upozorenje o nedosljednosti za proizvodne rute')
  t = t.replace(/Source stream calculation corrected .*?\)\. A warning for incomplete data has been added\./gi, 'Ispravljen proračun izvornog toka (procenat unositi kao broj [0..100]); dodato upozorenje za nekompletne podatke')
  t = t.replace(/PFC emissions \(2nd source stream\) incl\. further improvements/gi, 'PFC emisije (drugi izvorni tok) i dodatna poboljšanja')
  t = t.replace(/Fixed inputs and formulae in L25 and L26/gi, 'Ispravljeni ulazi i formule')
  t = t.replace(/Decomposed SEE \(indirect\) into entries for electricity consumption and emission factor\./gi, 'SEE (indirektne) razložene na potrošnju električne energije i faktor emisije.')
  t = t.replace(/Consequently, in the summary sheets there is now consistent display of "specific embedded electricity consumption" .*?\./gi, 'Pregled sada dosljedno prikazuje „specifičnu ugrađenu potrošnju električne energije” uzimajući u obzir prekursore.')
  t = t.replace(/More completeness indicators added\./gi, 'Dodati indikatori kompletnosti.')
  t = t.replace(/Navigation area extended to cover all 20 possible precursors/gi, 'Navigacija proširena na svih 20 mogućih prekursora')
  t = t.replace(/CHP tool corrected .*?\./gi, 'CHP alat ispravljen za uzimanje u obzir emisija iz čišćenja dimnih gasova.')
  t = t.replace(/Guidance texts have been revised\. An additional guidance section for sheet E has been added\./gi, 'Tekstovi smjernica ažurirani; dodata dodatna sekcija za E_Purchased.')
  t = t.replace(/The processes' activity levels have been added .*?\./gi, 'Dodani nivoi aktivnosti procesa; ispravke CP due i rabata.')
  t = t.replace(/Consistent units for carbon price due/gi, 'Jedinične mjere za cijenu ugljenika usklađene')
  t = t.replace(/Qualifying parameters \(columns R to AA\) made optional/gi, 'Kvalifikacioni parametri (kolone R–AA) postali opcioni')
  t = t.replace(/Consistent units for the good "Electricity" expressed as MWh/gi, 'Dosljedne jedinice za dobar „Električna energija” — MWh')
  t = t.replace(/Further clarification in guidance texts at several locations/gi, 'Dodatna pojašnjenja u tekstovima smjernica')
  t = t.replace(/Uniform formatting, conditional formats improved/gi, 'Ujednačeno formatiranje, poboljšani uslovni formati')
  t = t.replace(/Broken hyperlinks fixed/gi, 'Ispravljeni neispravni hyperlinkovi')
  t = t.replace(/Double reference to PP17 .*? corrected/gi, 'Ispravljena dvostruka referenca na PP17')
  t = t.replace(/Wrong guidance text .*? corrected/gi, 'Ispravljen pogrešan tekst smjernica')
  t = t.replace(/Minor revision of the CN code list, field for further information on carbon price instruments added/gi, 'Manja revizija liste CN kodova; dodato polje za informacije o instrumentima cijene ugljenika')
  t = t.replace(/Addition automatic calculation of Electricity EF in Summary_Communication/gi, 'Dodata automatska kalkulacija faktora emisije električne energije u Rezultatima komunikacije')
  return t
}

export default VersionHistoryTable