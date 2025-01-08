import React, { useState, useEffect } from 'react';
import axios from 'axios';
import FileUpload from './components/FileUpload';
import DataTable from './components/DataTable';
import CampaignTable from './components/CampaignTable';
import { Container, Typography, Snackbar } from '@mui/material';

function App() {
  const [data, setData] = useState([]);
  const [asinColumns, setAsinColumns] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [currentAsin, setCurrentAsin] = useState("");
  const [campaigns, setCampaigns] = useState([]);
  const [selectedKeyword, setSelectedKeyword] = useState("");
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

  const fetchCampaigns = async (keyword) => {
    try {
      const response = await axios.get('http://localhost:8000/campaigns/', {
        params: { keyword_phrase: keyword }
      });
      setCampaigns(response.data);
      setSelectedKeyword(keyword);
    } catch (error) {
      setError("Error al obtener las campañas");
      console.error("Error al obtener las campañas:", error);
    }
  };

  const toggleFavorite = async (asin) => {
    try {
      const response = await axios.post('http://localhost:8000/favoritos/', { asin });
      setFavorites(response.data.favoritos);
    } catch (error) {
      setError("Error al gestionar favoritos");
      console.error("Error al gestionar favoritos:", error);
    }
  };

  const handleAsinChange = async (asin) => {
    try {
      const formData = new FormData();
      formData.append("asin", asin);

      await axios.post('http://localhost:8000/set_asin/', formData);
      setCurrentAsin(asin);
    } catch (error) {
      setError("Error al establecer el ASIN");
      console.error("Error al establecer el ASIN:", error);
    }
  };

  const handleCloseSnackbar = () => setError("");

  return (
    <Container>
      <Typography variant="h3" gutterBottom>
        Generador de Reportes SEO y Publicidad
      </Typography>
      <FileUpload onFileUpload={(file) => handleFileUpload(file, "data")} label="Subir archivo de datos" />
      <FileUpload onFileUpload={(file) => handleFileUpload(file, "campaigns")} label="Subir archivo de campañas" />
      <DataTable
        data={data}
        asinColumns={asinColumns}
        favorites={favorites}
        onToggleFavorite={toggleFavorite}
        onAsinChange={handleAsinChange}
        onFetchData={fetchData}
        onKeywordClick={fetchCampaigns} // Añadir onKeywordClick para manejar clics en palabras clave
      />
      {selectedKeyword && (
        <CampaignTable
          campaigns={campaigns}
          keyword={selectedKeyword}
        />
      )}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        message={error}
      />
    </Container>
  );
}

export default App;