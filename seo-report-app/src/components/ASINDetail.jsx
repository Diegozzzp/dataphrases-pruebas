import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  Button,
  Table,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Alert
} from 'reactstrap';

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
        console.log("Datos recibidos:", response.data);

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

  const handleCloseAlert = () => setError("");

  return (
    <Container fluid>
      <div className="page-title-box">
        <Row className="align-items-center">
          <Col md={8}>
            <h6 className="page-title">ASIN Detail</h6>
            <ol className="breadcrumb m-0">
              <li className="breadcrumb-item"><Link to="/dashboard">Dashboard</Link></li>
              <li className="breadcrumb-item active">Detalles del ASIN: {asin}</li>
            </ol>
          </Col>
        </Row>
      </div>

      <Row>
        <Col xl={12}>
          <Card>
            <CardBody>
              <h4 className="card-title mb-4">Detalles del ASIN: {asin}</h4>
              <div className="table-responsive">
                <Table className="table-hover table-centered table-nowrap mb-0">
                  <thead>
                    <tr>
                      <th>Keyword Phrase</th>
                      <th>Search Volume</th>
                      <th>Keyword Sales</th>
                      <th>CPR</th>
                      {asinColumns.map(col => (
                        <th key={col}>{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((row, index) => (
                      <tr key={index}>
                        <td>
                          <Button color="link" onClick={() => handleClickOpen(row['Keyword Phrase'])}>
                            {row['Keyword Phrase']}
                          </Button>
                        </td>
                        <td>{row['Search Volume']}</td>
                        <td>{row['Keyword Sales']}</td>
                        <td>{row['CPR']}</td>
                        {asinColumns.map(col => (
                          <td key={col}>{row[col]}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </CardBody>
          </Card>
        </Col>
      </Row>

      <Modal isOpen={open} toggle={handleClose}>
        <ModalHeader toggle={handleClose}>Campañas para: {selectedKeyword}</ModalHeader>
        <ModalBody>
          {campaigns.length > 0 ? (
            <Table className="table-hover table-centered table-nowrap mb-0">
              <thead>
                <tr>
                  {Object.keys(campaigns[0]).map((col) => (
                    <th key={col}>{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {campaigns.map((campaign, index) => (
                  <tr key={index}>
                    {Object.keys(campaign).map((col) => (
                      <td key={col}>{campaign[col]}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : (
            <p>No hay campañas disponibles para esta frase clave.</p>
          )}
        </ModalBody>
        <ModalFooter>
          <Button color="primary" onClick={handleClose}>Cerrar</Button>
        </ModalFooter>
      </Modal>

      {error && (
        <Alert color="danger" isOpen={!!error} toggle={handleCloseAlert}>
          {error}
        </Alert>
      )}
    </Container>
  );
};

export default React.memo(ASINDetail);