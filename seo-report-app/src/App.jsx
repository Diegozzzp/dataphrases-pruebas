import React, { useState, useEffect } from 'react';
import axios from 'axios';
import FileUpload from './components/FileUpload';
import DataTable from './components/DataTable';

function App() {
  const [data, setData] = useState([]);
  const [asinColumns, setAsinColumns] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [currentAsin, setCurrentAsin] = useState("");

  useEffect(() => {
    if (currentAsin) {
      fetchData();
    }
  }, [currentAsin]);

  const handleFileUpload = async (file) => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post('http://localhost:8000/upload/', formData);
      setAsinColumns(response.data.asin_columns);
      fetchData();
    } catch (error) {
      console.error("Error al cargar el archivo:", error);
    }
  };

  const fetchData = async () => {
    try {
      const response = await axios.get('http://localhost:8000/data/');
      setData(response.data);
    } catch (error) {
      console.error("Error al obtener los datos:", error);
    }
  };

  const toggleFavorite = async (asin) => {
    try {
      const response = await axios.post('http://localhost:8000/favoritos/', { asin });
      setFavorites(response.data.favoritos);
    } catch (error) {
      console.error("Error al gestionar favoritos:", error);
    }
  };

  const handleAsinChange = async (asin) => {
    try {
      await axios.post('http://localhost:8000/set_asin/', { asin });
      setCurrentAsin(asin);
    } catch (error) {
      console.error("Error al establecer el ASIN:", error);
    }
  };

  return (
    <div className="App">
      <h1>Generador de Reportes SEO y Publicidad</h1>
      <FileUpload onFileUpload={handleFileUpload} />
      <DataTable
        data={data}
        asinColumns={asinColumns}
        favorites={favorites}
        onToggleFavorite={toggleFavorite}
        onAsinChange={handleAsinChange}
      />
    </div>
  );
}

export default App;