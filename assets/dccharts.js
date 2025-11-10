document.addEventListener('DOMContentLoaded', () => {
  // Paleta domyślnych kolorów Design Cart
  const colors = ['#007ec3','#64b25d','#f3c53c','#8c7ae6','#f66d6d','#ff9f43','#00cec9'];

  /**
   * Plugin globalny: pokazuje wartości / procenty na wykresach
   */
  const valuePlugin = {
    id: 'valuePlugin',
    afterDatasetsDraw(chart) {
      const {ctx, data} = chart;
      ctx.save();
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#333';

      chart.data.datasets.forEach((dataset, i) => {
        const meta = chart.getDatasetMeta(i);
        meta.data.forEach((element, index) => {
          const value = dataset.data[index];
          if (!value) return;

          // Pozycja tekstu
          const pos = element.tooltipPosition();

          // Wykresy kołowe – pokazujemy procenty
          if (chart.config.type === 'pie' || chart.config.type === 'doughnut') {
            const total = dataset.data.reduce((a, b) => a + b, 0);
            const percent = ((value / total) * 100).toFixed(1) + '%';
            ctx.fillText(percent, pos.x, pos.y);
          }

          // Wykresy słupkowe i liniowe – pokazujemy wartości
          if (chart.config.type === 'bar' || chart.config.type === 'line') {
            ctx.fillText(value, pos.x, pos.y - 6);
          }
        });
      });

      ctx.restore();
    }
  };

  /**
   * Inicjalizacja wykresów
   */
  document.querySelectorAll('.dcchart').forEach((canvas, i) => {
    const ctx = canvas.getContext('2d');

    const type = canvas.dataset.type || 'pie';
    const labels = (canvas.dataset.labels || '').split(',').map(s => s.trim());
    const values = (canvas.dataset.values || '').split(',').map(Number);
    const title = canvas.dataset.title || '';
    const legend = canvas.dataset.legend || 'bottom';
    const color = canvas.dataset.color || '';
    const xlabel = canvas.dataset.xlabel || '';
    const ylabel = canvas.dataset.ylabel || '';

    const dataset = {
      label: ylabel || 'Wartość',
      data: values,
      backgroundColor: (type === 'line')
        ? color ? color.split(',') : [colors[0]]
        : color ? color.split(',') : colors.slice(0, values.length),
      borderColor: (type === 'line')
        ? (color ? color.split(',')[0] : colors[0])
        : '#fff',
      borderWidth: (type === 'line') ? 2 : 0,
      tension: (type === 'line') ? 0.3 : 0,
      fill: (type !== 'line'),
      pointRadius: (type === 'line') ? 4 : 0,
      pointHoverRadius: (type === 'line') ? 5 : 0
    };

    new Chart(ctx, {
      type: type,
      data: { labels: labels, datasets: [dataset] },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: legend !== 'none', position: legend },
          title: {
            display: !!title,
            text: title,
            font: { size: 16, weight: 'bold' }
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                const val = context.parsed;
                const pct = ((val / total) * 100).toFixed(1);
                return `${context.label}: ${val} (${pct}%)`;
              }
            }
          }
        },
        scales: (type === 'bar' || type === 'line') ? {
          x: { title: { display: !!xlabel, text: xlabel } },
          y: { title: { display: !!ylabel, text: ylabel }, beginAtZero: true }
        } : {}
      },
      plugins: [valuePlugin]
    });
  });
});
