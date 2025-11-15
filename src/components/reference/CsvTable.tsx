import React, { useEffect, useMemo, useState } from 'react'
import { Box, CircularProgress, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, Paper, Typography } from '@mui/material'
import * as XLSX from 'xlsx'

interface CsvTableProps {
  src: string
  headerMap?: Record<string, string>
  title?: string
}

const CsvTable: React.FC<CsvTableProps> = ({ src, headerMap, title }) => {
  const [rows, setRows] = useState<any[]>([])
  const [columns, setColumns] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(50)

  useEffect(() => {
    setLoading(true)
    fetch(src)
      .then(async (r) => {
        if (!r.ok) throw new Error('not_found')
        const text = await r.text()
        const wb = XLSX.read(text, { type: 'string' })
        const ws = wb.Sheets[wb.SheetNames[0]]
        const json = XLSX.utils.sheet_to_json(ws, { defval: '' }) as any[]
        setRows(json)
        const keys = json.length > 0 ? Object.keys(json[0]) : []
        setColumns(keys)
        setError(null)
      })
      .catch(() => setError('Tabela nije dostupna'))
      .finally(() => setLoading(false))
  }, [src])

  const displayColumns = useMemo(() => columns.map((c) => headerMap?.[c] ?? c), [columns, headerMap])

  if (loading) return <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}><CircularProgress size={20} /> Učitavanje tabele…</Box>
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
              {displayColumns.map((c) => (
                <TableCell key={c} sx={{ fontWeight: 600 }}>{c}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, idx) => (
              <TableRow key={idx}>
                {columns.map((c) => (
                  <TableCell key={c}>{String(row[c])}</TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        count={rows.length}
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

export default CsvTable