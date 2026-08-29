"""数据库结构同步脚本测试。"""

import pytest

from app.core.database import get_engine
from app.init.sync_database_schema import (
    ColumnDiff,
    ColumnInfo,
    IndexDiff,
    SchemaComparator,
    SchemaSync,
    TableDiff,
)
from app.models.order_model import OrderModel  # noqa: F401
from app.models.user_model import UserModel  # noqa: F401


@pytest.mark.asyncio
async def test_generate_column_sql_uses_model_nullable_for_missing_column(monkeypatch):
    """新增列 SQL 必须按模型生成 nullable 与注释。"""
    sync = SchemaSync(get_engine())

    async def no_old_primary_key(conn, table_name: str, column_name: str):
        return None

    monkeypatch.setattr(sync, "_find_old_primary_key_column", no_old_primary_key)

    not_null_sql = await sync._generate_column_sql(
        None,
        ColumnDiff(
            table_name="orders",
            column_name="amount",
            expected_type="BIGINT",
            actual_type=None,
            diff_types=("missing",),
        ),
    )
    nullable_sql = await sync._generate_column_sql(
        None,
        ColumnDiff(
            table_name="orders",
            column_name="paid_amount",
            expected_type="BIGINT",
            actual_type=None,
            diff_types=("missing",),
        ),
    )

    assert not_null_sql == (
        "ALTER TABLE orders ADD COLUMN amount BIGINT NOT NULL "
        "COMMENT '订单金额，统一 6 位精度整数'"
    )
    assert nullable_sql == (
        "ALTER TABLE orders ADD COLUMN paid_amount BIGINT "
        "COMMENT '渠道回调支付金额，统一 6 位精度整数'"
    )


@pytest.mark.asyncio
async def test_generate_column_sql_uses_model_nullable_for_nullable_mismatch():
    """修复 nullable 差异时必须按模型生成完整列定义。"""
    sync = SchemaSync(get_engine())

    sql = await sync._generate_column_sql(
        None,
        ColumnDiff(
            table_name="orders",
            column_name="amount",
            expected_type="BIGINT",
            actual_type="bigint",
            diff_types=("nullable_mismatch",),
        ),
    )

    assert sql == (
        "ALTER TABLE orders MODIFY COLUMN amount BIGINT NOT NULL "
        "COMMENT '订单金额，统一 6 位精度整数'"
    )


@pytest.mark.asyncio
async def test_generate_column_sql_handles_comment_mismatch():
    """修复注释差异时必须生成 MODIFY COLUMN。"""
    sync = SchemaSync(get_engine())

    sql = await sync._generate_column_sql(
        None,
        ColumnDiff(
            table_name="orders",
            column_name="amount",
            expected_type="BIGINT",
            actual_type="bigint",
            diff_types=("comment_mismatch",),
            expected_comment="订单金额，统一 6 位精度整数",
            actual_comment="",
        ),
    )

    assert sql == (
        "ALTER TABLE orders MODIFY COLUMN amount BIGINT NOT NULL "
        "COMMENT '订单金额，统一 6 位精度整数'"
    )


@pytest.mark.asyncio
async def test_generate_column_sql_uses_full_definition_for_primary_key_rename(
    monkeypatch,
):
    """主键列重命名时必须保留 AUTO_INCREMENT 与注释。"""
    sync = SchemaSync(get_engine())

    async def old_primary_key(conn, table_name: str, column_name: str):
        return "old_id"

    monkeypatch.setattr(sync, "_find_old_primary_key_column", old_primary_key)

    sql = await sync._generate_column_sql(
        None,
        ColumnDiff(
            table_name="orders",
            column_name="id",
            expected_type="BIGINT",
            actual_type=None,
            diff_types=("missing",),
        ),
    )

    assert sql == (
        "ALTER TABLE orders CHANGE COLUMN old_id id BIGINT NOT NULL "
        "COMMENT '订单ID' AUTO_INCREMENT"
    )


@pytest.mark.asyncio
async def test_compare_columns_reports_comment_mismatch(monkeypatch):
    """数据库注释与模型不一致时必须产生列差异。"""
    comparator = SchemaComparator(get_engine())
    result = TableDiff()

    monkeypatch.setattr(
        comparator,
        "_get_model_columns",
        lambda table_name: {
            "amount": ColumnInfo(
                name="amount",
                type="BIGINT",
                nullable=False,
                primary_key=False,
                comment="订单金额，统一 6 位精度整数",
            )
        },
    )

    async def get_db_columns(conn, table_name: str):
        return {
            "amount": ColumnInfo(
                name="amount",
                type="bigint",
                nullable=False,
                primary_key=False,
                comment="",
            )
        }

    monkeypatch.setattr(comparator, "_get_db_columns", get_db_columns)

    await comparator._compare_columns(None, "orders", result)

    assert len(result.column_diffs) == 1
    diff = result.column_diffs[0]
    assert diff.diff_type == "comment_mismatch"
    assert diff.diff_types == ("comment_mismatch",)
    assert diff.expected_comment == "订单金额，统一 6 位精度整数"
    assert diff.actual_comment == ""


@pytest.mark.asyncio
async def test_compare_columns_merges_multiple_diffs_for_one_column(monkeypatch):
    """同一列多种差异必须合并，最终只执行一次完整 MODIFY。"""
    comparator = SchemaComparator(get_engine())
    result = TableDiff()

    monkeypatch.setattr(
        comparator,
        "_get_model_columns",
        lambda table_name: {
            "amount": ColumnInfo(
                name="amount",
                type="BIGINT",
                nullable=False,
                primary_key=False,
                comment="订单金额，统一 6 位精度整数",
            )
        },
    )

    async def get_db_columns(conn, table_name: str):
        return {
            "amount": ColumnInfo(
                name="amount",
                type="int",
                nullable=True,
                primary_key=False,
                comment="",
            )
        }

    monkeypatch.setattr(comparator, "_get_db_columns", get_db_columns)

    await comparator._compare_columns(None, "orders", result)

    assert len(result.column_diffs) == 1
    assert result.column_diffs[0].diff_types == (
        "type_mismatch",
        "nullable_mismatch",
        "comment_mismatch",
    )


def test_normalize_type_treats_mysql_tinyint_one_as_bool():
    """MySQL Boolean 反射为 TINYINT(1)，不应被误报为类型差异。"""
    engine = get_engine()
    comparator = SchemaComparator(engine)
    sync = SchemaSync(engine)

    assert comparator._normalize_type("TINYINT(1)") == "BOOL"  # noqa: SLF001
    assert sync._normalize_type("TINYINT(1)") == "BOOL"  # noqa: SLF001


def test_generate_index_sql_creates_unique_index():
    """唯一索引缺失时必须生成 CREATE UNIQUE INDEX。"""
    sync = SchemaSync(get_engine())

    sqls = sync._generate_index_sql(
        IndexDiff(
            table_name="admins",
            index_name="uk_admins_api_key_hash",
            diff_type="missing",
            expected_columns=["api_key_hash"],
            expected_unique=True,
        )
    )

    assert sqls == [
        "CREATE UNIQUE INDEX uk_admins_api_key_hash ON admins (api_key_hash)"
    ]


def test_get_model_indexes_includes_unique_column_constraints():
    """列级 unique 约束也必须进入索引对比，避免漏删同列普通索引。"""
    comparator = SchemaComparator(get_engine())

    user_indexes = comparator._get_model_indexes("users")  # noqa: SLF001
    order_indexes = comparator._get_model_indexes("orders")  # noqa: SLF001

    assert user_indexes["email"] == {
        "name": "email",
        "columns": ["email"],
        "unique": True,
    }
    assert "idx_email" not in user_indexes
    assert order_indexes["order_no"] == {
        "name": "order_no",
        "columns": ["order_no"],
        "unique": True,
    }


def test_generate_index_sql_rebuilds_index_when_unique_differs():
    """同名索引 unique 属性不一致时必须重建。"""
    sync = SchemaSync(get_engine())

    sqls = sync._generate_index_sql(
        IndexDiff(
            table_name="admins",
            index_name="uk_admins_api_key_hash",
            diff_type="columns_mismatch",
            expected_columns=["api_key_hash"],
            expected_unique=True,
            actual_columns=["api_key_hash"],
            actual_unique=False,
        )
    )

    assert sqls == [
        "DROP INDEX uk_admins_api_key_hash ON admins",
        "CREATE UNIQUE INDEX uk_admins_api_key_hash ON admins (api_key_hash)",
    ]


def test_generate_index_sql_drops_redundant_non_unique_index():
    """同列唯一索引覆盖普通索引时必须删除普通重复索引。"""
    sync = SchemaSync(get_engine())

    sqls = sync._generate_index_sql(
        IndexDiff(
            table_name="admins",
            index_name="idx_admins_api_key_hash",
            diff_type="redundant_non_unique",
            actual_columns=["api_key_hash"],
            actual_unique=False,
        )
    )

    assert sqls == ["DROP INDEX idx_admins_api_key_hash ON admins"]
