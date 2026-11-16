# IoT Data Engineering con dbt y DuckDB

Pipeline por lotes que convierte lecturas IoT en un modelo analítico diario. Usa dbt Core 1.x para organizar transformaciones SQL, DuckDB como base analítica local y GitHub Actions + GitHub Pages para publicar un pequeño tablero estático.

**Demo pública:** https://sofxx7.github.io/iot-data-engineering-dbt-duckdb/

## Datos

El repositorio incluye una muestra **sintética**, creada para que el pipeline y la demo se puedan reproducir sin redistribuir el archivo del curso. Conserva el mismo esquema de `IOT-temp.csv`: `id`, `room_id`, `noted_date`, `temp` y `out_in`. Puedes reemplazar `seeds/iot_temperature.csv` con el CSV del laboratorio para trabajar con sus lecturas.

## Flujo

1. dbt carga `seeds/iot_temperature.csv` en DuckDB.
2. `stg_iot_readings` convierte tipos y normaliza la posición del sensor.
3. `daily_temperature_summary` calcula métricas por fecha, sala y posición.
4. El script de exportación genera `site/data.json` para el tablero.
5. Al hacer push a `main`, GitHub Actions reconstruye el flujo y publica el sitio en GitHub Pages.

## Ejecución local

Requiere Python 3.12 o superior.

```powershell
py -m venv .venv
.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
dbt seed --profiles-dir .
dbt run --profiles-dir .
python scripts/export_site_data.py
python -m http.server 8000 --directory site
```

Abre `http://localhost:8000`. El archivo local `iot_temperature.duckdb` se puede consultar con DuckDB. Para ejecutar los controles declarados en `models/schema.yml`, usa `dbt test --profiles-dir .`.

## Despliegue

El workflow `.github/workflows/deploy.yml` se ejecuta en cada push a `main` y también puede iniciarse manualmente desde la pestaña **Actions**. En un repositorio público, GitHub Pages sirve el tablero como sitio público.

## Límites del ejemplo

La demo es por lotes y presenta una muestra sintética. No consume telemetría en tiempo real ni estima lecturas que falten. DuckDB se ejecuta dentro del proceso de CI para producir el artefacto estático; la base local no se publica como servicio remoto.

## Referencias

- [dbt SQL models](https://docs.getdbt.com/docs/build/sql-models)
- [dbt DuckDB setup](https://docs.getdbt.com/docs/local/connect-data-platform/duckdb-setup)
- [DuckDB CSV import](https://duckdb.org/docs/stable/data/csv/overview)
