import React from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { Card, CardBody, CardTitle, Button, Row, Col } from 'reactstrap';
import './ASINList.css';  // Asegúrate de agregar estilos aquí

const ASINList = ({ asinColumns }) => {
  const navigate = useNavigate();

  const handleASINClick = (asin) => {
    navigate(`/asin/${asin}`);
  };

  return (
    <div className="asin-list-container">
      <Row>
        {asinColumns.map((asin, index) => (
          <Col xs={12} sm={6} md={4} lg={3} key={index} className="mb-4">
            <Card>
              <CardBody>
                <CardTitle tag="h5">{asin}</CardTitle>
                <Button color="primary" onClick={() => handleASINClick(asin)}>
                  Ver Detalles
                </Button>
              </CardBody>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

ASINList.propTypes = {
  asinColumns: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default React.memo(ASINList);