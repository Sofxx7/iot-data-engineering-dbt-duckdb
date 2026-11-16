from __future__ import annotations

import json
from pathlib import Path

import duckdb


ROOT = Path(__file__).resolve().parents[1]
DATABASE = ROOT / "iot_temperature.duckdb"
OUTPUT = ROOT / "site" / "data.json"


def main() -> None:
    with duckdb.connect(str(DATABASE), read_only=True) as connection:
        rows = connection.execute(
            """
            select
                cast(reading_date as varchar), room_id, position, reading_count,
                round(min_temperature, 2), round(avg_temperature, 2),
                round(max_temperature, 2)
            from daily_temperature_summary
            order by reading_date, room_id, position
            """
        ).fetchall()
        totals = connection.execute(
            """
            select
                count(*) as readings,
                round(avg(temperature), 2) as average_temperature,
                count(distinct cast(reading_at as date)) as days
            from stg_iot_readings
            where reading_at is not null and temperature is not null
            """
        ).fetchone()

    payload = {
        "source": "synthetic-demo",
        "totals": {
            "readings": totals[0],
            "average_temperature": totals[1],
            "days": totals[2],
        },
        "daily": [
            {
                "date": row[0],
                "room": row[1],
                "position": row[2],
                "readings": row[3],
                "min": row[4],
                "average": row[5],
                "max": row[6],
            }
            for row in rows
        ],
    }
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Generated {OUTPUT.relative_to(ROOT)} with {len(rows)} daily groups")


if __name__ == "__main__":
    main()
