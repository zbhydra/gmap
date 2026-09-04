"""数据库结构同步器的真实 MySQL 索引收敛测试。"""

import pytest
from sqlalchemy import BigInteger, Column, String, Table, inspect, text

from app.core.database import Base, get_engine
from app.init.sync_database_schema import SchemaComparator, SchemaSync, TableDiff

pytestmark = [pytest.mark.real, pytest.mark.asyncio]


async def test_real_schema_sync_drops_model_undeclared_non_unique_index(
    real_mysql_ready: None,
    test_run_id: str,
) -> None:
    """模型未声明的普通索引会被识别并由同步器删除。"""

    table_name = f"schema_sync_{test_run_id.replace('-', '')[:16]}"
    index_name = "idx_extra_payload"
    table = Table(
        table_name,
        Base.metadata,
        Column("id", BigInteger, primary_key=True, comment="测试ID"),
        Column("payload", String(32), nullable=False, comment="测试载荷"),
    )
    engine = get_engine()
    try:
        async with engine.begin() as conn:
            await conn.run_sync(table.create)
            await conn.execute(
                text(f"CREATE INDEX {index_name} ON {table_name} (payload)")
            )

        diff = TableDiff()
        comparator = SchemaComparator(engine)
        async with engine.begin() as conn:
            await comparator._compare_indexes(conn, table_name, diff)

        assert [(item.index_name, item.diff_type) for item in diff.index_diffs] == [
            (index_name, "extra_non_unique")
        ]
        assert await SchemaSync(engine).sync(diff) == [
            f"✅ DROP INDEX {index_name} ON {table_name}"
        ]

        async with engine.connect() as conn:
            indexes = await conn.run_sync(
                lambda sync_conn: inspect(sync_conn).get_indexes(table_name)
            )
        assert index_name not in {index["name"] for index in indexes}
    finally:
        async with engine.begin() as conn:
            await conn.run_sync(table.drop)
        Base.metadata.remove(table)
