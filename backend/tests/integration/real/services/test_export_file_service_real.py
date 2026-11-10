"""真实本地文件系统：公开 CSV 转义与发布核验；不依赖 MySQL、Redis 或外部存储。"""

import csv
import hashlib
from io import StringIO
from pathlib import Path

import pytest

from app.core.config import settings
from app.provider.export.export_base import ExportColumn
from app.provider.export.gmap_columns import GMAP_DESCRIPTIONS, GMAP_PUBLIC_COLUMNS
from app.schemas.export_run_schema import ExportRunResult
from app.services.export_file_service import ExportFileError, export_file_service


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
    content = public_path.read_bytes()
    export_file_service.verify_prepared(
        path=public_path,
        result=ExportRunResult(
            object_key="test.csv",
            size_bytes=len(content),
            output_count=1,
            sha256=hashlib.sha256(content).hexdigest(),
            columns=[column.header for column in GMAP_PUBLIC_COLUMNS],
        ),
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


@pytest.mark.real
@pytest.mark.parametrize(
    ("tamper", "error"),
    [
        ("size", "大小或 SHA256 不符"),
        ("hash", "大小或 SHA256 不符"),
        ("columns", "列名不符"),
        ("descriptions", "说明行不符"),
        ("short_row", "数据行列数不符"),
        ("wide_row", "数据行列数不符"),
        ("first_number", "行号不连续"),
        ("skipped_number", "行号不连续"),
        ("repeated_number", "行号不连续"),
        ("fewer_rows", "数据行数不符"),
        ("extra_rows", "数据行数不符"),
        ("missing_header", "列名不符"),
        ("missing_descriptions", "说明行不符"),
        ("encoding", "无法读取 CSV"),
        ("malformed_csv", "无法读取 CSV"),
    ],
)
def test_real_verify_prepared_rejects_tampered_csv(
    tmp_path: Path, tamper: str, error: str
) -> None:
    columns = ["#", "Name"]
    descriptions = ("行序号", "名称")
    rows = [columns.copy(), list(descriptions), ["1", "商家甲,\n换行"], ["2", "商家乙"]]
    match tamper:
        case "columns":
            rows[0][1] = "Other"
        case "descriptions":
            rows[1][1] = "其他说明"
        case "short_row":
            rows[2].pop()
        case "wide_row":
            rows[2].append("多余列")
        case "first_number":
            rows[2][0] = "0"
        case "skipped_number":
            rows[3][0] = "3"
        case "repeated_number":
            rows[3][0] = "1"
        case "fewer_rows" | "malformed_csv":
            rows.pop()
        case "extra_rows":
            rows.append(["3", "商家丙"])
        case "missing_header":
            rows.clear()
        case "missing_descriptions":
            rows = rows[:1]
    buffer = StringIO(newline="")
    csv.writer(buffer, lineterminator="\n").writerows(rows)
    content = buffer.getvalue().encode("utf-8-sig")
    if tamper == "encoding":
        content += b"\xff"
    elif tamper == "malformed_csv":
        content += b'2,"unterminated'
    path = tmp_path / "prepared.csv"
    path.write_bytes(content)
    # 内容篡改后重新固定身份，确保结构错误不会只被 size/hash 提前挡住。
    result = ExportRunResult(
        object_key="test.csv",
        size_bytes=len(content) + (tamper == "size"),
        output_count=2,
        sha256="0" * 64 if tamper == "hash" else hashlib.sha256(content).hexdigest(),
        columns=columns,
    )
    with pytest.raises(ExportFileError, match=error):
        export_file_service.verify_prepared(
            path=path, result=result, descriptions=descriptions
        )
