import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Container, Typography, Table, TableBody, TableCell, TableHead, TableRow, Snackbar } from '@mui/material';

const ASINDetail = () => {
  const { asin } = useParams();
  const [data, setData] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:8000/data/', {
          params: { asin }
        });
        setData(response.data);
      } catch (error) {
        setError(`Error al obtener los datos: ${error.response?.data?.detail || error.message}`);
        console.error("Error al obtener los datos:", error);
      }
    };

    fetchData();
  }, [asin]);

  const handleCloseSnackbar = () => setError("");

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Detalles del ASIN: {asin}
      </Typography>
      <Table>
        <TableHead>
          <TableRow>
            {/* Añade aquí las columnas que necesitas mostrar */}
            <TableCell>Keyword Phrase</TableCell>
            <TableCell>Search Volume</TableCell>
            <TableCell>Competing Products</TableCell>
            <TableCell>Keyword Sales</TableCell>
            <TableCell>CPR</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((row, index) => (
            <TableRow key={index}>
              <TableCell>{row['Keyword Phrase']}</TableCell>
              <TableCell>{row['Search Volume']}</TableCell>
              <TableCell>{row['Competing Products']}</TableCell>
              <TableCell>{row['Keyword Sales']}</TableCell>
              <TableCell>{row['CPR']}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
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