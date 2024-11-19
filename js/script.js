// Data for the chart
const data = [
  {
    x: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    y: [10, 15, 13, 17, 20, 25],
    type: 'scatter'
  }
];

// Layout for the chart
const layout = {
  title: 'Monthly Data Trends',
  xaxis: { title: 'Months' },
  yaxis: { title: 'Values' }
};

// Render the chart
Plotly.newPlot('chart', data, layout);
