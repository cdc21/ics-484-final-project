// Famine Clock Countdown
function updateCountdown() {
  const targetDate = new Date("2025-01-01T00:00:00").getTime();
  const now = new Date().getTime();
  const timeLeft = targetDate - now;

  if (timeLeft > 0) {
    const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
    document.getElementById("famine-countdown").textContent =
      `${days}d ${hours}h ${minutes}m ${seconds}s`;
  } else {
    document.getElementById("famine-countdown").textContent = "The famine crisis has started.";
  }
}
setInterval(updateCountdown, 1000);
updateCountdown();

// Plotly Map for US Crop Production
const cropData = {
  type: 'choropleth',
  locationmode: 'USA-states',
  locations: ['IA', 'IL', 'NE', 'MN', 'KS', 'IN', 'TX', 'SD', 'MO', 'WI'],
  z: [8.1, 7.5, 6.8, 6.4, 6.0, 5.8, 5.5, 5.3, 5.1, 4.9],
  text: ['Iowa', 'Illinois', 'Nebraska', 'Minnesota', 'Kansas', 'Indiana', 'Texas', 'South Dakota', 'Missouri', 'Wisconsin'],
  colorscale: 'Greens',
  colorbar: { title: 'Crop Intensity' },
  marker: { line: { color: 'rgb(255,255,255)', width: 2 } }
};

const mapLayout = {
  title: 'US Crop Production by State',
  geo: { scope: 'usa', showlakes: true, lakecolor: 'rgb(255,255,255)' }
};

Plotly.newPlot('us-crop-map', [cropData], mapLayout);

// Fetch CSV File for CO2 Emissions
fetch('data/annual-co2-emissions-per-country.csv')
  .then(response => response.text())
  .then(csvData => {
    const rows = csvData.split('\n');
    const headers = rows[0].split(',');

    const yearIndex = headers.indexOf('Year');
    const emissionsIndex = headers.indexOf('Annual CO₂ emissions');
    const entityIndex = headers.indexOf('Entity');

    const usData = rows
      .slice(1)
      .map(row => row.split(','))
      .filter(cols => cols[entityIndex] === 'United States')
      .map(cols => ({
        year: parseInt(cols[yearIndex], 10),
        emissions: parseFloat(cols[emissionsIndex])
      }));

    const xYears = usData.map(row => row.year);
    const yEmissions = usData.map(row => row.emissions);

    const co2Data = {
      x: xYears,
      y: yEmissions,
      mode: 'lines',
      name: 'CO₂ Emissions',
      line: { color: 'blue' }
    };

    const lineLayout = {
      title: 'US CO₂ Emissions Over Time',
      xaxis: { title: 'Year' },
      yaxis: { title: 'Annual CO₂ Emissions (Metric Tons)' }
    };

    Plotly.newPlot('line-graph', [co2Data], lineLayout);
  })
  .catch(error => console.error('Error fetching or processing the CSV file:', error));
