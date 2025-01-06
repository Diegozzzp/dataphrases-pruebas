import React from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Select, MenuItem, FormControl, InputLabel, IconButton } from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import './DataTable.css';

const DataTable = ({ data, asinColumns, favorites, onToggleFavorite, onAsinChange }) => {
  const handleAsinSelect = (event) => {
    const selectedAsin = event.target.value;
    onAsinChange(selectedAsin);
  };

  return (
    <div className="table-container">
      <h2>Datos Cargados</h2>
      <FormControl fullWidth>
        <InputLabel>Seleccione un ASIN</InputLabel>
        <Select onChange={handleAsinSelect} defaultValue="">
          <MenuItem value="">
            <em>None</em>
          </MenuItem>
          {asinColumns.map((asin, index) => (
            <MenuItem key={index} value={asin}>{asin}</MenuItem>
          ))}
        </Select>
      </FormControl>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              {data.length > 0 && Object.keys(data[0]).map((key) => (
                <TableCell key={key}>{key}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((row, index) => (
              <TableRow key={index}>
                {Object.values(row).map((value, idx) => (
                  <TableCell key={idx}>{value}</TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <FormControl fullWidth>
        <InputLabel>Seleccione un ASIN</InputLabel>
        <Select onChange={handleAsinSelect} defaultValue="">
          <MenuItem value="">
            <em>None</em>
          </MenuItem>
          {asinColumns.map((asin, index) => (
            <MenuItem key={index} value={asin}>{asin}</MenuItem>
          ))}
        </Select>
      </FormControl>      <ul>
        {asinColumns.map((asin, index) => (
          <li key={index}>
            {asin} 
            <IconButton onClick={() => onToggleFavorite(asin)}>
              {favorites.includes(asin) ? <StarIcon /> : <StarBorderIcon />}
            </IconButton>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default DataTable;