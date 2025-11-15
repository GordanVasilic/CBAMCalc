import React, { useState } from 'react'
import { Box, Tab, Tabs, Button } from '@mui/material'
import { Link } from 'react-router-dom'
import MarkdownSection from './MarkdownSection'
import CountriesCurrenciesTable from './CountriesCurrenciesTable'
import VersionHistoryTable from './VersionHistoryTable'

const ReferencePage: React.FC = () => {
  const [tab, setTab] = useState<number>(0)

  const base = '/reference/ExcelAnalysis'

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Button variant="outlined" component={Link} to="/">
          Nazad u aplikaciju
        </Button>
      </Box>
      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3 }}>
        <Tab label="Verzija" />
        <Tab label="Smjernice i uslovi" />
        <Tab label="Kodovi" />
      </Tabs>

      {tab === 0 && (
        <Box>
          <VersionHistoryTable src={`${base}/0_Versions/raw_data.csv`} title="Pregled verzija" />
        </Box>
      )}

      {tab === 1 && (
        <Box>
          <MarkdownSection src={`${base}/b_Guidelines&Conditions/analysis.sr.md`} title="Smjernice i uslovi" />
        </Box>
      )}

      {tab === 2 && (
        <Box>
          <MarkdownSection src={`${base}/c_CodeLists/analysis.sr.md`} title="Kodovi" />
          <CountriesCurrenciesTable src={`${base}/c_CodeLists/raw_data.csv`} title="Zemlje i valute" />
        </Box>
      )}
    </Box>
  )
}

export default ReferencePage