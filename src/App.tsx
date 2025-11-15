import React from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Container, AppBar, Toolbar, Typography, Box, Button } from '@mui/material';
import { Routes, Route, Link } from 'react-router-dom';
import ReferencePage from './components/reference/ReferencePage';
import CBAMWizard from './components/CBAMWizard';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            CBAM Emisijski Kalkulator (Instalacije)
          </Typography>
          <Button color="inherit" component={Link} to="/help">
            Pomoć & Referenca
          </Button>
        </Toolbar>
      </AppBar>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ my: 4 }}>
          <Routes>
            <Route path="/" element={<CBAMWizard />} />
            <Route path="/help" element={<ReferencePage />} />
          </Routes>
        </Box>
      </Container>
    </ThemeProvider>
  );
}

export default App;