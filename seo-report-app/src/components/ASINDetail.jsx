import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Container, Typography, Table, TableBody, TableCell, TableHead, TableRow, Snackbar, Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';

const ASINDetail = () => {
  const { asin } = useParams();
  const [data, setData] = useState([]);
  const [error, setError] = useState("");
  const [asinColumns, setAsinColumns] = useState([]);
  const [open, setOpen] = useState(false);
  const [campaigns, setCampaigns] = useState([]);
  const [selectedKeyword, setSelectedKeyword] = useState("");
  const columnsToExclude = ['currency', 'End Date', 'Match Type', 'Click-Thru Rate (CTR)'];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:8000/data/', {
          params: { asin }
        });
        console.log("Datos recibidos:", response.data);  // Debug: Mostrar los datos recibidos

        // Extraer las columnas de ASIN dinámicamente
        if (response.data.length > 0) {
          const firstRow = response.data[0];
          const asinCols = Object.keys(firstRow).filter(key => key.includes('B0'));
          setAsinColumns(asinCols);
        }

        setData(response.data);
      } catch (error) {
        setError(`Error al obtener los datos: ${error.response?.data?.detail || error.message}`);
        console.error("Error al obtener los datos:", error);
      }
    };

    fetchData();
  }, [asin]);

  const handleClickOpen = async (keyword) => {
    setSelectedKeyword(keyword);
    try {
      const response = await axios.get('http://localhost:8000/campaigns/', {
        params: { keyword_phrase: keyword }
      });
      // Filtrar las columnas no deseadas
      const filteredCampaigns = response.data.map(campaign => {
        const filtered = {};
        Object.keys(campaign).forEach(key => {
          if (!columnsToExclude.includes(key)) {
            filtered[key] = campaign[key];
          }
        });
        return filtered;
      });
      setCampaigns(filteredCampaigns);
      setOpen(true);
    } catch (error) {
      setError(`Error al obtener las campañas: ${error.response?.data?.detail || error.message}`);
      console.error("Error al obtener las campañas:", error);
    }
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleCloseSnackbar = () => setError("");

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Detalles del ASIN: {asin}
      </Typography>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Keyword Phrase</TableCell>
            <TableCell>Search Volume</TableCell>
            <TableCell>Keyword Sales</TableCell>
            <TableCell>CPR</TableCell>
            {asinColumns.map(col => (
              <TableCell key={col}>{col}</TableCell>  // Mostrar todas las columnas de ASIN
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((row, index) => (
            <TableRow key={index}>
              <TableCell>
                <Button onClick={() => handleClickOpen(row['Keyword Phrase'])}>
                  {row['Keyword Phrase']}
                </Button>
              </TableCell>
              <TableCell>{row['Search Volume']}</TableCell>
              <TableCell>{row['Keyword Sales']}</TableCell>
              <TableCell>{row['CPR']}</TableCell>
              {asinColumns.map(col => (
                <TableCell key={col}>{row[col]}</TableCell>  // Mostrar los datos específicos del ASIN
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Campañas para: {selectedKeyword}</DialogTitle>
        <DialogContent>
          {campaigns.length > 0 ? (
            <Table>
              <TableHead>
                <TableRow>
                  {Object.keys(campaigns[0]).map((col) => (
                    <TableCell key={col}>{col}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {campaigns.map((campaign, index) => (
                  <TableRow key={index}>
                    {Object.keys(campaign).map((col) => (
                      <TableCell key={col}>{campaign[col]}</TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <Typography>No hay campañas disponibles para esta frase clave.</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        message={error}
      />
    </Container>
  );
};

export default ASINDetail;