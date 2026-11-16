const number = new Intl.NumberFormat('es-PE');
const decimal = new Intl.NumberFormat('es-PE', { maximumFractionDigits: 2 });
let payload;

function render() {
  const filter = document.querySelector('#position-filter').value;
  const rows = payload.daily.filter(row => filter === 'all' || row.position === filter);
  const totalReadings = rows.reduce((sum, row) => sum + row.readings, 0);
  const weightedSum = rows.reduce((sum, row) => sum + row.average * row.readings, 0);
  const overallAverage = totalReadings ? weightedSum / totalReadings : 0;
  const uniqueDays = new Set(rows.map(row => row.date)).size;
  document.querySelector('#readings').textContent = number.format(totalReadings);
  document.querySelector('#average').textContent = `${decimal.format(overallAverage)}°`;
  document.querySelector('#days').textContent = number.format(uniqueDays);

  const byDay = new Map();
  for (const row of rows) {
    const item = byDay.get(row.date) || { sum: 0, count: 0 };
    item.sum += row.average * row.readings;
    item.count += row.readings;
    byDay.set(row.date, item);
  }
  const series = [...byDay.entries()].map(([date, item]) => ({ date, average: item.sum / item.count }));
  const min = Math.min(...series.map(item => item.average));
  const max = Math.max(...series.map(item => item.average));
  const range = Math.max(1, max - min);
  document.querySelector('#chart').innerHTML = series.map(item => {
    const height = 42 + ((item.average - min) / range) * 100;
    return `<div class="bar-group"><span class="bar-value">${decimal.format(item.average)}°</span><div class="bar" style="height:${height}%"></div><span class="bar-label">${item.date}</span></div>`;
  }).join('') || '<p>No hay lecturas para este filtro.</p>';

  document.querySelector('#daily-rows').innerHTML = rows.map(row => `
    <tr><td>${row.date}</td><td>${row.room}</td>
    <td><span class="pill ${row.position === 'OUT' ? 'out' : ''}">${row.position === 'IN' ? 'Interior' : 'Exterior'}</span></td>
    <td>${number.format(row.readings)}</td><td>${decimal.format(row.min)}</td>
    <td>${decimal.format(row.average)}</td><td>${decimal.format(row.max)}</td></tr>`).join('') || '<tr><td colspan="7">No hay registros.</td></tr>';
}

fetch('data.json')
  .then(response => { if (!response.ok) throw new Error('No se pudo cargar data.json'); return response.json(); })
  .then(data => { payload = data; render(); })
  .catch(error => { document.querySelector('#status').textContent = `${error.message}. Ejecuta el flujo de datos antes de abrir el sitio.`; });

document.querySelector('#position-filter').addEventListener('change', () => payload && render());
