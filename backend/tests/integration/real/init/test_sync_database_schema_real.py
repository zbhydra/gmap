"""数据库结构同步器的真实 MySQL 索引收敛测试。"""

import pytest
from sqlalchemy import (
    BigInteger,
    Column,
    String,
    Table,
    UniqueConstraint,
    inspect,
    text,
)

from app.core.database import Base, get_engine
from app.init.sync_database_schema import SchemaComparator, SchemaSync, TableDiff

pytestmark = [pytest.mark.real, pytest.mark.asyncio]


async def test_real_schema_sync_renames_preserve_data_and_unique_index(
    real_mysql_ready: None, test_run_id: str
) -> None:
    """原地改名保留值和唯一约束，重复同步没有差异。"""
    table_name = f"schema_rename_{test_run_id.replace('-', '')[:16]}"
    table = Table(
        table_name,
        Base.metadata,
        Column("id", BigInteger, primary_key=True, comment="测试ID"),
        Column("kind", String(32), nullable=False, comment="类别"),
        UniqueConstraint("kind", name="uk_kind"),
        info={
            "schema_sync_rename_columns": {"kind": "old_kind"},
            "schema_sync_rename_indexes": {"uk_kind": "uk_old_kind"},
        },
    )
    engine = get_engine()
    try:
        async with engine.begin() as conn:
            await conn.execute(
                text(
                    f"CREATE TABLE {table_name} (id BIGINT PRIMARY KEY COMMENT '测试ID', "
                    "old_kind VARCHAR(32) NOT NULL COMMENT '类别', UNIQUE KEY uk_old_kind (old_kind))"
                )
            )
            await conn.execute(
                text(f"INSERT INTO {table_name} VALUES (1, 'maps_online')")
            )
        comparator = SchemaComparator(engine)
        diff = TableDiff()
        async with engine.connect() as conn:
            await comparator._compare_columns(conn, table_name, diff)
            await comparator._compare_indexes(conn, table_name, diff)
        await SchemaSync(engine).sync(diff)
        async with engine.connect() as conn:
            assert (
                await conn.execute(text(f"SELECT kind FROM {table_name} WHERE id=1"))
            ).scalar_one() == "maps_online"
            indexes = await conn.run_sync(lambda c: inspect(c).get_indexes(table_name))
            assert [(i["name"], i["column_names"], i["unique"]) for i in indexes] == [
                ("uk_kind", ["kind"], True)
            ]
            repeated = TableDiff()
            await comparator._compare_columns(conn, table_name, repeated)
            await comparator._compare_indexes(conn, table_name, repeated)
            assert not repeated.column_diffs and not repeated.index_diffs
    finally:
        async with engine.begin() as conn:
            await conn.execute(text(f"DROP TABLE IF EXISTS {table_name}"))
        Base.metadata.remove(table)


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


async def test_real_schema_sync_adds_columns_before_dropping_declared_removed(
    real_mysql_ready: None,
    test_run_id: str,
) -> None:
    """模型声明删除的列按 removed 差异输出，且同步先补列后删列。"""

    table_name = f"schema_drop_{test_run_id.replace('-', '')[:16]}"
    table = Table(
        table_name,
        Base.metadata,
        Column("id", BigInteger, primary_key=True, comment="测试ID"),
        Column("keep_col", String(32), nullable=False, comment="保留列"),
        Column("extra_col", String(32), nullable=False, comment="待补列"),
        info={"schema_sync_drop_columns": ("legacy_col",)},
    )
    engine = get_engine()
    try:
        async with engine.begin() as conn:
            await conn.execute(
                text(
                    f"CREATE TABLE {table_name} ("
                    "id BIGINT PRIMARY KEY COMMENT '测试ID', "
                    "keep_col VARCHAR(32) NOT NULL COMMENT '保留列', "
                    "legacy_col VARCHAR(32) NULL)"
                )
            )

        diff = TableDiff()
        comparator = SchemaComparator(engine)
        async with engine.begin() as conn:
            await comparator._compare_columns(conn, table_name, diff)

        assert [(item.column_name, item.diff_type) for item in diff.column_diffs] == [
            ("legacy_col", "removed"),
            ("extra_col", "missing"),
        ]

        executed = await SchemaSync(engine).sync(diff)

        assert executed == [
            f"✅ ALTER TABLE {table_name} ADD COLUMN extra_col VARCHAR(32) "
            "NOT NULL COMMENT '待补列'",
            f"✅ ALTER TABLE {table_name} DROP COLUMN legacy_col",
        ]

        async with engine.begin() as conn:
            columns = await conn.execute(text(f"SHOW COLUMNS FROM {table_name}"))
            names = {row[0] for row in columns}
        assert "legacy_col" not in names
        assert "extra_col" in names
    finally:
        async with engine.begin() as conn:
            await conn.execute(text(f"DROP TABLE IF EXISTS {table_name}"))
        Base.metadata.remove(table)
