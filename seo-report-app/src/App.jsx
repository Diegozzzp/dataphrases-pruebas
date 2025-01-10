import React, { useState } from 'react';
import axios from 'axios';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import FileUpload from './components/FileUpload';
import ASINList from './components/ASINList';
import ASINDetail from './components/ASINDetail';
import { Container, Alert } from 'reactstrap';

function App() {
  const [asinColumns, setAsinColumns] = useState([]);
  const [error, setError] = useState("");

  const handleFileUpload = async (file, fileType) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("file_type", fileType);

    try {
      const response = await axios.post('http://localhost:8000/upload/', formData);
      if (fileType === "data") {
        setAsinColumns(response.data.asin_columns);
      }
    } catch (error) {
      setError(`Error al cargar el archivo: ${error.response?.data?.detail || error.message}`);
      console.error("Error al cargar el archivo:", error);
    }
  };

  const handleCloseAlert = () => setError("");

  return (
    <Router>
      <Container>
        <h3 className="my-4">Generador de Reportes SEO y Publicidad</h3>
        <FileUpload onFileUpload={(file) => handleFileUpload(file, "data")} label="Subir archivo de datos" />
        <FileUpload onFileUpload={(file) => handleFileUpload(file, "campaigns")} label="Subir archivo de campañas" />

        <Routes>
          <Route path="/asin/:asin" element={<ASINDetail />} />
          <Route path="/" element={<ASINList asinColumns={asinColumns} />} />
        </Routes>

        {error && (
          <Alert color="danger" isOpen={!!error} toggle={handleCloseAlert}>
            {error}
          </Alert>
        )}
      </Container>
    </Router>
  );
}

export default App;