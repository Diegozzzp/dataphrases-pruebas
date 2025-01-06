import React from 'react';

const DataTable = ({ data, asinColumns, favorites, onToggleFavorite, onAsinChange }) => {
  const handleAsinSelect = (event) => {
    const selectedAsin = event.target.value;
    onAsinChange(selectedAsin);
  };

  return (
    <div>
      <h2>Datos Cargados</h2>
      <table>
        <thead>
          <tr>
            {data.length > 0 && Object.keys(data[0]).map((key) => (
              <th key={key}>{key}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr key={index}>
              {Object.values(row).map((value, idx) => (
                <td key={idx}>{value}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <h2>ASINs</h2>
      <select onChange={handleAsinSelect}>
        <option value="">Seleccione un ASIN</option>
        {asinColumns.map((asin, index) => (
          <option key={index} value={asin}>{asin}</option>
        ))}
      </select>
      <ul>
        {asinColumns.map((asin, index) => (
          <li key={index}>
            {asin} <button onClick={() => onToggleFavorite(asin)}>{favorites.includes(asin) ? '★' : '☆'}</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default DataTable;