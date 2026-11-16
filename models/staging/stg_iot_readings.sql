select
    cast(id as varchar) as reading_id,
    nullif(trim(cast(room_id as varchar)), '') as room_id,
    try_strptime(
        trim(cast(noted_date as varchar)),
        '%d-%m-%Y %H:%M'
    ) as reading_at,
    try_cast(temp as integer) as temperature,
    upper(trim(cast(out_in as varchar))) as position
from {{ ref('iot_temperature') }}
