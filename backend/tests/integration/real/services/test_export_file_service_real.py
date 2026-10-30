"""真实本地文件系统：公开 CSV 转义；不依赖 MySQL、Redis 或外部存储。"""

import csv
from pathlib import Path

import pytest

from app.core.config import settings
from app.provider.export.export_base import ExportColumn
from app.provider.export.gmap_columns import GMAP_DESCRIPTIONS, GMAP_PUBLIC_COLUMNS
from app.services.export_file_service import export_file_service


@pytest.mark.real
def test_real_public_csv_prefixes_leading_equals_without_changing_work_file(
    tmp_path: Path, monkeypatch: pytest.MonkeyPatch
) -> None:
    monkeypatch.setattr(settings, "root_path", str(tmp_path))
    work_columns = tuple(
        ExportColumn(column.key, column.key) for column in GMAP_PUBLIC_COLUMNS[1:]
    )
    values = {
        "name": "=1+1",
        "address": '=A,"B"\nC',
        "street": " =1+1",
        "owner": "'=1+1",
        "phone": "+1 212-555-0000",
        "rating": "4.5",
        "longitude": "-73.1",
    }
    work_path = export_file_service.run_path(
        job_no="csv-equals", run_no="one", name="increment.csv"
    )
    work_path.parent.mkdir(parents=True)
    with work_path.open("w", encoding="utf-8-sig", newline="") as handle:
        writer = csv.writer(handle, lineterminator="\n")
        writer.writerow([column.header for column in work_columns])
        writer.writerow([values.get(column.key, "") for column in work_columns])
    original = work_path.read_bytes()

    public_path = export_file_service.project_gmap_csv(
        job_no="csv-equals",
        run_no="one",
        work_columns=work_columns,
        public_columns=GMAP_PUBLIC_COLUMNS,
        descriptions=GMAP_DESCRIPTIONS["en-US"],
    )

    with public_path.open(encoding="utf-8-sig", newline="") as handle:
        rows = list(csv.reader(handle))
    assert rows[0] == [column.header for column in GMAP_PUBLIC_COLUMNS]
    assert rows[1] == list(GMAP_DESCRIPTIONS["en-US"])
    expected = {**values, "name": "'=1+1", "address": '\'=A,"B"\nC'}
    assert rows[2] == [
        "1",
        *(expected.get(column.key, "") for column in GMAP_PUBLIC_COLUMNS[1:]),
    ]
    assert work_path.read_bytes() == original
