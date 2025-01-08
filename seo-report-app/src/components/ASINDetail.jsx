import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { Container, Typography, Paper, Table, TableBody, TableCell, TableHead, TableRow } from "@mui/material";

const ASINDetail = () => {
  const { asin } = useParams();
  const [data, setData] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [selectedKeyword, setSelectedKeyword] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/data/`, {
          params: { asin }
        });
        setData(response.data);
      } catch (error) {
        console.error("Error fetching data", error);
      }
    };

    fetchData();
  }, [asin]);

  const handleKeywordClick = async (keyword) => {
    try {
      const response = await axios.get(`http://localhost:8000/campaigns/`, {
        params: { keyword_phrase: keyword }
      });
      setCampaigns(response.data);
      setSelectedKeyword(keyword);
    } catch (error) {
      console.error("Error fetching campaigns", error);
    }
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Detalles del ASIN: {asin}
      </Typography>
      <Paper>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Keyword Phrase</TableCell>
              <TableCell>Search Volume</TableCell>
              <TableCell>{asin}</TableCell>
              <TableCell>Competing Products</TableCell>
              <TableCell>Keyword Sales</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((row, index) => (
              <TableRow key={index}>
                <TableCell onClick={() => handleKeywordClick(row['Keyword Phrase'])} style={{ cursor: 'pointer' }}>
                  {row['Keyword Phrase']}
                </TableCell>
                <TableCell>{row['Search Volume']}</TableCell>
                <TableCell>{row[asin]}</TableCell>
                <TableCell>{row['Competing Products']}</TableCell>
                <TableCell>{row['Keyword Sales']}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
      {selectedKeyword && (
        <div>
          <Typography variant="h5" gutterBottom style={{ marginTop: '20px' }}>
            Campañas Publicitarias para "{selectedKeyword}"
          </Typography>
          <Paper>
            <Table>
              <TableHead>
                <TableRow>
                  {campaigns.length > 0 && Object.keys(campaigns[0]).map((key) => (
                    <TableCell key={key}>{key}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {campaigns.map((campaign, index) => (
                  <TableRow key={index}>
                    {Object.values(campaign).map((value, idx) => (
                      <TableCell key={idx}>{value}</TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        </div>
      )}
    </Container>
  );
};

export default ASINDetail;