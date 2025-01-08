  import React, { useState } from 'react';
  import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Select, MenuItem, FormControl, InputLabel, Button } from '@mui/material';
  import './DataTable.css';

  const DataTable = ({ data, asinColumns, favorites, onToggleFavorite, onAsinChange, onFetchData, onKeywordClick }) => {
    const [selectedAsin, setSelectedAsin] = useState('');
    const [minValue, setMinValue] = useState(1);
    const [maxValue, setMaxValue] = useState(1000);
    const [orderAsin, setOrderAsin] = useState('');
    const [orderSearchVolume, setOrderSearchVolume] = useState('');

    const handleAsinSelect = (event) => {
      const selectedAsin = event.target.value;
      setSelectedAsin(selectedAsin);
      onAsinChange(selectedAsin);
    };

    const handleFetchData = () => {
      onFetchData({ minValue, maxValue, orderAsin, orderSearchVolume });
    };

    return (
      <div className="table-container">
        <h2>Datos Cargados</h2>
        <FormControl fullWidth>
          <InputLabel>Seleccione un ASIN</InputLabel>
          <Select onChange={handleAsinSelect} value={selectedAsin}>
            <MenuItem value="">
              <em>None</em>
            </MenuItem>
            {asinColumns.map((asin, index) => (
              <MenuItem key={index} value={asin}>{asin}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <div className="filter-controls">
          <FormControl>
            <InputLabel>Min Value</InputLabel>
            <input type="number" value={minValue} onChange={(e) => setMinValue(Number(e.target.value))} />
          </FormControl>
          <FormControl>
            <InputLabel>Max Value</InputLabel>
            <input type="number" value={maxValue} onChange={(e) => setMaxValue(Number(e.target.value))} />
          </FormControl>
          <FormControl>
            <InputLabel>Order ASIN</InputLabel>
            <Select value={orderAsin} onChange={(e) => setOrderAsin(e.target.value)}>
              <MenuItem value="">No Order</MenuItem>
              <MenuItem value="asc">Ascending</MenuItem>
              <MenuItem value="desc">Descending</MenuItem>
            </Select>
          </FormControl>
          <FormControl>
            <InputLabel>Order Search Volume</InputLabel>
            <Select value={orderSearchVolume} onChange={(e) => setOrderSearchVolume(e.target.value)}>
              <MenuItem value="">No Order</MenuItem>
              <MenuItem value="asc">Ascending</MenuItem>
              <MenuItem value="desc">Descending</MenuItem>
            </Select>
          </FormControl>
          <Button variant="contained" color="primary" onClick={handleFetchData}>Apply Filters</Button>
        </div>

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
                  {Object.entries(row).map(([key, value], idx) => (
                    <TableCell key={idx} onClick={() => key === 'Keyword Phrase' && onKeywordClick(value)}>
                      {value}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <ul>
          {asinColumns.map((asin, index) => (
            <li key={index}>
              {asin} 
              <Button onClick={() => onToggleFavorite(asin)}>
                {favorites.includes(asin) ? 'Unfavorite' : 'Favorite'}
              </Button>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  export default DataTable;