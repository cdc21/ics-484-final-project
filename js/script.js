Papa.parse('data/table01.csv', {
  download: true,
  header: true,
  dynamicTyping: true,
  complete: function(results) {
    const data = results.data;

    // Log the data to verify CSV parsing
    console.log(data);

    // Get unique attributes and years
    const attributes = [...new Set(data.map(d => d.Attribute))];
    const years = [...new Set(data.map(d => d.Year))];

    // Log the unique attributes and years
    console.log('Attributes:', attributes);
    console.log('Years:', years);

    // Define a color palette for attributes
    const colorPalette = ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd', '#8c564b', '#e377c2', '#7f7f7f', '#bcbd22', '#17becf'];

    // Initialize an object to hold data for each attribute
    const traceData = {};

    // Organize data by attributes
    attributes.forEach((attribute, index) => {
      traceData[attribute] = {
        x: [],
        y: [],
        mode: 'lines',
        name: attribute,
        line: { color: colorPalette[index % colorPalette.length] }, // Assign a distinct color
        hovertemplate: `<b>${attribute}</b><br>Year: %{x}<br>Value: %{y}<extra></extra>` // Custom hovertemplate
      };
    });

    // Fill the traceData with year and value for each attribute
    data.forEach(d => {
      if (traceData[d.Attribute]) {
        traceData[d.Attribute].x.push(d.Year);
        traceData[d.Attribute].y.push(d.Value);
      }
    });

    // Create traces for the graph
    let traces = [];
    attributes.forEach(attribute => {
      if (traceData[attribute].x.length > 0) {
        traces.push({
          x: traceData[attribute].x,
          y: traceData[attribute].y,
          mode: 'lines',
          name: attribute,
          visible: true, // Initially make all traces visible
          line: traceData[attribute].line,
          hovertemplate: traceData[attribute].hovertemplate // Apply custom hovertemplate
        });
      }
    });

    // Define frames for animation
    const frames = years.map((year, index) => {
      const yearData = traces.map(trace => ({
        x: years.slice(0, index + 1), // Add years up to the current year
        y: traceData[trace.name].y.slice(0, index + 1), // Add values for each trace up to the current year
        name: trace.name
      }));

      return {
        name: year.toString(),
        data: yearData
      };
    });

    // Layout with range slider and animation settings
    const layout = {
      title: 'Farm Outputs, Inputs, and Productivity (1948–2021)',
      xaxis: {
        title: 'Year',
        range: [Math.min(...years), Math.max(...years)],
        rangeslider: { visible: true }, // Add range slider at the bottom
        showgrid: false
      },
      yaxis: {
        title: 'Value',
        autorange: true // Automatically adjust the y-axis range
      },
      updatemenus: [{
        type: 'buttons',
        showactive: false,
        buttons: [
          {
            label: 'Play',
            method: 'animate',
            args: [null, {
              frame: { duration: 500, redraw: true },
              transition: { duration: 0 },
              fromcurrent: true
            }]
          },
          {
            label: 'Pause',
            method: 'animate',
            args: [[null], { mode: 'immediate', frame: { duration: 0 } }]
          }
        ]
      }],
      sliders: [{
        active: 0,
        pad: { t: 50 },
        steps: frames.map((frame, index) => ({
          label: frame.name,
          method: 'animate',
          args: [[frame.name], {
            mode: 'immediate',
            frame: { duration: 500, redraw: true },
            transition: { duration: 0 }
          }]
        }))
      }]
    };

    // Plot the graph
    Plotly.newPlot('graph', traces, layout).then(() => {
      Plotly.addFrames('graph', frames); // Add the frames for animation
    });

    // Populate filter menu dynamically
    const filterMenu = document.getElementById('attribute-filter');
    attributes.forEach(attribute => {
      const container = document.createElement('div');
      container.classList.add('checkbox-container');
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.value = attribute;
      checkbox.id = `checkbox-${attribute}`;
      checkbox.checked = true; // Default is checked
      const label = document.createElement('label');
      label.setAttribute('for', checkbox.id);
      label.textContent = attribute;
      container.appendChild(checkbox);
      container.appendChild(label);
      filterMenu.appendChild(container);
    });

    // Handle Select All and Deselect All buttons
    const selectAllButton = document.getElementById('select-all');
    const deselectAllButton = document.getElementById('deselect-all');

    selectAllButton.addEventListener('click', () => {
      const checkboxes = filterMenu.querySelectorAll('input[type="checkbox"]');
      checkboxes.forEach(checkbox => checkbox.checked = true);
      updateGraphVisibility();
    });

    deselectAllButton.addEventListener('click', () => {
      const checkboxes = filterMenu.querySelectorAll('input[type="checkbox"]');
      checkboxes.forEach(checkbox => checkbox.checked = false);
      updateGraphVisibility();
    });

    // Update graph visibility based on checkbox selection
    function updateGraphVisibility() {
      const checkboxes = filterMenu.querySelectorAll('input[type="checkbox"]');
      checkboxes.forEach((checkbox, index) => {
        traces[index].visible = checkbox.checked;
      });
      Plotly.update('graph', {}, { visible: traces.map(trace => trace.visible) });
    }

    // Attach event listener to each checkbox
    const checkboxes = filterMenu.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach((checkbox, index) => {
      checkbox.addEventListener('change', updateGraphVisibility);
    });

    // Add 'selected' event to highlight the selected trace
    document.getElementById('graph').on('plotly_selected', function(eventData) {
      const selectedTraceIndex = eventData.points[0].curveNumber;

      // Highlight the selected trace by increasing the line width
      traces.forEach((trace, index) => {
        if (index === selectedTraceIndex) {
          trace.line.width = 4; // Make the selected line thicker
        } else {
          trace.line.width = 1; // Reset the other lines to normal width
        }
      });

      // Update the graph with the new line width settings
      Plotly.update('graph', { line: traces.map(trace => trace.line) });
    });
  }
});
