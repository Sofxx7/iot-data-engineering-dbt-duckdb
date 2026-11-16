select
    cast(reading_at as date) as reading_date,
    room_id,
    position,
    count(*) as reading_count,
    min(temperature) as min_temperature,
    avg(temperature) as avg_temperature,
    max(temperature) as max_temperature
from {{ ref('stg_iot_readings') }}
where reading_at is not null
  and temperature is not null
  and room_id is not null
group by 1, 2, 3
