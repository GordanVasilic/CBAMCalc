import React from 'react';
import { Autocomplete, TextField } from '@mui/material';
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
  // Helper to compute aggregated CN category for display
  const getCategoryForCN = (code: string): string => {
    if (!code) return "";
    const c = (code || "").replace(/\D/g, "");
    if (c.startsWith("2523")) return "Cement";
    if (c.startsWith("72") || c.startsWith("73")) return "Gvožđe ili proizvodi od čelika";
    return "";
  };
  
  const formatOptionLabel = (code: string): string => {
    const category = getCategoryForCN(code);
    return category ? `${code} — ${category}` : code;
  };
  return (
    <Autocomplete
      freeSolo
      options={cnCodes}
      value={value || ''}
      inputValue={value || ''}
      onInputChange={(_, newInputValue) => onChange(newInputValue || '')}
      onChange={(_, newValue) => onChange((newValue as string) || '')}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          helperText={helperText}
          placeholder={placeholder}
          fullWidth
        />
      )}
      getOptionLabel={(option) => formatOptionLabel(typeof option === 'string' ? option : String(option))}
    />
  );
};

export default CNCodeAutocomplete;