import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';

const CSVReader = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    // Fetch the CSV file
    fetch('/mahesh.csv') // Ensure your file is in the 'public' folder
      .then(response => response.text())
      .then(csvText => {
        Papa.parse(csvText, {
          complete: (result) => {
            console.log("Parsed CSV Data:", result.data); // Log the parsed data
            setData(result.data); // Store the parsed data
          },
          header: true, // Assumes the first row is the header
        });
      })
      .catch(error => {
        console.error("Error reading CSV:", error);
      });
  }, []);

  return (
    <div>
      <h1>CSV Data</h1>
      {data.length > 0 ? (
        <table>
          <thead>
            <tr>
              {/* Dynamically generate table headers from CSV columns */}
              {Object.keys(data[0]).map((key, index) => (
                <th key={index}>{key}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {/* Map through the data and display rows */}
            {data.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {Object.values(row).map((value, valueIndex) => (
                  <td key={valueIndex}>{value}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>Loading CSV data...</p>
      )}
    </div>
  );
};

export default CSVReader;
