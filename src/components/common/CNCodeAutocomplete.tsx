import React, { useState } from 'react';
import { Autocomplete, TextField, Box, Typography } from '@mui/material';
import cnCodes from '../../data/cnCodes.json';

interface CNCodeAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  helperText?: string;
  placeholder?: string;
}

const CNCodeAutocomplete: React.FC<CNCodeAutocompleteProps> = ({
  value,
  onChange,
  label = 'CN kod',
  helperText = 'EU kombinovana nomenklatura (CN)',
  placeholder = 'Počnite unos CN koda (npr. 7208...)'
}) => {
  const getCategoryForCN = (code: string): string => {
    if (!code) return "";
    const c = (code || "").replace(/\D/g, "");
    if (c.startsWith("2523")) return "Cement";
    if (c.startsWith("72") || c.startsWith("73")) return "Željezo i čelik";
    return "";
  };
  
  const formatOptionLabel = (code: string): string => {
    const category = getCategoryForCN(code);
    return category ? `${code} — ${category}` : code;
  };

  const [inputValue, setInputValue] = useState(value || '');
  const normalize = (s: string) => (s || '').toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '');
  const synonyms: Record<string, string[]> = {
    Cement: ['cement'],
    'Željezo i čelik': ['zeljezo', 'željezo', 'gvozdje', 'gvođe', 'gvođe', 'celik', 'čelik', 'steel', 'iron']
  };
  return (
    <Autocomplete
      freeSolo
      options={cnCodes}
      value={value || ''}
      inputValue={inputValue}
      onInputChange={(_, newInputValue) => setInputValue(newInputValue || '')}
      onChange={(_, newValue) => onChange((newValue as string) || '')}
      isOptionEqualToValue={(option, val) => (typeof option === 'string' ? option : String(option)) === (val || '')}
      groupBy={(option) => getCategoryForCN(typeof option === 'string' ? option : String(option)) || 'Ostalo'}
      ListboxProps={{ sx: { textAlign: 'left' } }}
      filterOptions={(options, { inputValue }) => {
        const q = normalize(inputValue);
        return options.filter((opt) => {
          const code = typeof opt === 'string' ? opt : String(opt);
          const cat = getCategoryForCN(code);
          if (!q) return true;
          if (normalize(code).includes(q)) return true;
          if (cat && synonyms[cat]?.some((w) => normalize(w).includes(q) || q.includes(normalize(w)))) return true;
          return false;
        });
      }}
      renderOption={(props, option) => {
        const code = typeof option === 'string' ? option : String(option);
        const cat = getCategoryForCN(code);
        return (
          <Box component="li" {...props} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', textAlign: 'left' }}>
            <Typography variant="body2" sx={{ fontWeight: 600, textAlign: 'left' }}>{code}</Typography>
            {cat && <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'left' }}>{cat}</Typography>}
          </Box>
        );
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          helperText={helperText}
          placeholder={placeholder}
          fullWidth
          inputProps={{ ...params.inputProps, dir: 'ltr', style: { textAlign: 'left' } }}
        />
      )}
      getOptionLabel={(option) => formatOptionLabel(typeof option === 'string' ? option : String(option))}
    />
  );
};

export default CNCodeAutocomplete;