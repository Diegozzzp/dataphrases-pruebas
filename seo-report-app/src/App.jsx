import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import FileUpload from './components/FileUpload';
import DataTable from './components/DataTable';
import ASINList from './components/ASINList';
import ASINDetail from './components/ASINDetail';
import { Container, Typography, Snackbar } from '@mui/material';

function App() {
  const [data, setData] = useState([]);
  const [asinColumns, setAsinColumns] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [currentAsin, setCurrentAsin] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (currentAsin) {
      fetchData();
    }
  }, [currentAsin]);

  const handleFileUpload = async (file, fileType) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("file_type", fileType);

    try {
      const response = await axios.post('http://localhost:8000/upload/', formData);
      if (fileType === "data") {
        setAsinColumns(response.data.asin_columns);
        fetchData();
      }
    } catch (error) {
      setError("Error al cargar el archivo");
      console.error("Error al cargar el archivo:", error);
    }
  };

  const fetchData = async (filters = {}) => {
    const { minValue = 1, maxValue = 1000, orderAsin = "", orderSearchVolume = "" } = filters;
    try {
      const response = await axios.get('http://localhost:8000/data/', {
        params: { minValue, maxValue, orderAsin, orderSearchVolume }
      });
      setData(response.data);
    } catch (error) {
      setError("Error al obtener los datos");
      console.error("Error al obtener los datos:", error);
    }
  };

  const handleCloseSnackbar = () => setError("");

  return (
    <Router>
      <Container>
        <Typography variant="h3" gutterBottom>
          Generador de Reportes SEO y Publicidad
        </Typography>
        <FileUpload onFileUpload={(file) => handleFileUpload(file, "data")} label="Subir archivo de datos" />
        <FileUpload onFileUpload={(file) => handleFileUpload(file, "campaigns")} label="Subir archivo de campañas" />
        
        <Routes>
          <Route path="/asin/:asin" element={<ASINDetail />} />
          <Route path="/" element={
            <>
              <ASINList asinColumns={asinColumns} />
              <DataTable
                data={data}
                asinColumns={asinColumns}
                favorites={favorites}
                onToggleFavorite={setFavorites}
                onAsinChange={setCurrentAsin}
                onFetchData={fetchData}
              />
            </>
          } />
        </Routes>

        <Snackbar
          open={!!error}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          message={error}
        />
      </Container>
    </Router>
  );
}

export default App;