import React, { useEffect, useMemo, useState } from 'react'
import { Box, CircularProgress, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, TextField, Typography } from '@mui/material'
import * as XLSX from 'xlsx'

interface CCRow { countryName: string; countryCode: string; currencyName: string; currencyCode: string }

const CountriesCurrenciesTable: React.FC<{ src: string; title?: string }> = ({ src, title }) => {
  const [rows, setRows] = useState<CCRow[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(25)
  const [query, setQuery] = useState('')

  useEffect(() => {
    setLoading(true)
    fetch(src)
      .then(async (r) => {
        if (!r.ok) throw new Error('not_found')
        const text = await r.text()
        const wb = XLSX.read(text, { type: 'string' })
        const ws = wb.Sheets[wb.SheetNames[0]]
        const json = XLSX.utils.sheet_to_json(ws, { defval: '' }) as Record<string, any>[]

        const combined: CCRow[] = []
        for (const row of json) {
          const vals = Object.values(row).map((v) => String(v).trim()).filter((v) => v.length > 0)
          if (vals.length === 0) continue

          let countryCode = ''
          let countryName = ''
          let currencyCode = ''
          let currencyName = ''

          for (let i = 0; i < vals.length; i++) {
            const v = vals[i]
            if (!countryCode && /^[A-Z]{2}$/.test(v) && vals[i + 1]) {
              countryCode = v
              countryName = vals[i + 1]
            }
            if (!currencyCode && /^[A-Z]{3}$/.test(v) && vals[i + 1]) {
              currencyCode = v
              currencyName = vals[i + 1]
            }
          }

          if (countryCode && countryName && currencyCode && currencyName) {
            combined.push({ countryName, countryCode, currencyName, currencyCode })
          }
        }

        const uniq = new Map<string, CCRow>()
        combined.forEach((r) => {
          const key = `${r.countryCode}-${r.currencyCode}`
          if (!uniq.has(key)) uniq.set(key, r)
        })

        setRows(Array.from(uniq.values()))
        setError(null)
      })
      .catch(() => setError('Tabela zemalja i valuta nije dostupna'))
      .finally(() => setLoading(false))
  }, [src])

  const filtered = useMemo(() => {
    const q = query.toLowerCase()
    if (!q) return rows
    return rows.filter((r) =>
      r.countryName.toLowerCase().includes(q) ||
      r.countryCode.toLowerCase().includes(q) ||
      r.currencyName.toLowerCase().includes(q) ||
      r.currencyCode.toLowerCase().includes(q)
    )
  }, [query, rows])

  if (loading) return <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}><CircularProgress size={20} /> Učitavanje…</Box>
  if (error) return <Typography color="error">{error}</Typography>

  return (
    <Paper sx={{ mt: 3 }}>
      {title && (
        <Typography variant="h6" sx={{ px: 2, pt: 2 }}>
          {title}
        </Typography>
      )}
      <Box sx={{ px: 2, pb: 2, pt: 1 }}>
        <TextField
          label="Pretraga"
          size="small"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setPage(0) }}
        />
      </Box>
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>Naziv zemlje</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Kod</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Valuta</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Kod valute</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((r, idx) => (
              <TableRow key={idx}>
                <TableCell>{r.countryName}</TableCell>
                <TableCell>{r.countryCode}</TableCell>
                <TableCell>{r.currencyName}</TableCell>
                <TableCell>{r.currencyCode}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        count={filtered.length}
        page={page}
        onPageChange={(_, p) => setPage(p)}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0) }}
        rowsPerPageOptions={[25, 50, 100]}
        labelRowsPerPage="Redova po stranici"
      />
    </Paper>
  )
}

export default CountriesCurrenciesTable