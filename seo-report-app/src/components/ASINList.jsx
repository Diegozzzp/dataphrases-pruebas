import React from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, Typography, Grid, Button } from '@mui/material';
import './ASINList.css';  // Asegúrate de agregar estilos aquí

const ASINList = ({ asinColumns }) => {
  const navigate = useNavigate();

  const handleASINClick = (asin) => {
    navigate(`/asin/${asin}`);
  };

  return (
    <div className="asin-list-container">
      <Grid container spacing={3}>
        {asinColumns.map((asin, index) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
            <Card>
              <CardContent>
                <Typography variant="h5" component="div">
                  {asin}
                </Typography>
                <Button variant="contained" color="primary" onClick={() => handleASINClick(asin)}>
                  Ver Detalles
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </div>
  );
};

ASINList.propTypes = {
  asinColumns: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default ASINList;