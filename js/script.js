const fs = require('fs');
const csv = require('csv-parser');

// Load the CSV file
const filePath = 'table01.csv';
let data = [];

fs.createReadStream(filePath)
  .pipe(csv())
  .on('data', (row) => {
    data.push(row);
  })
  .on('end', () => {
    console.log('CSV file successfully processed.');

    // Filter rows based on the 'Attribute' column
    const filteredData = data.filter(row =>
      row.Attribute && row.Attribute.toLowerCase().includes('crops output: food grains')
    );

    // Print filtered rows
    console.log(filteredData);
  });
