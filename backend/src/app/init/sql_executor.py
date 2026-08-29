#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""一次性 SQL 命令行执行工具。

所有数据库连接参数和 SQL 都由命令行传入。脚本不读取 config.yaml
或其他外部状态文件，适合部署时直接执行单条修复 SQL。
"""

import argparse
import sys
from dataclasses import dataclass
from typing import Any
from urllib.parse import quote_plus

from sqlalchemy import create_engine
from sqlalchemy.engine import Engine


@dataclass(frozen=True, slots=True)
class DatabaseOptions:
    """数据库连接参数。"""

    host: str
    port: int
    user: str
    password: str
    database: str


@dataclass(frozen=True, slots=True)
class SQLExecutionResult:
    """SQL 执行结果。"""

    rows: list[dict[str, Any]]
    rowcount: int
    returns_rows: bool


class SQLExecutor:
    """按命令行参数连接 MySQL 并执行一条 SQL。"""

    def __init__(self, database_options: DatabaseOptions) -> None:
        """初始化执行器。

        Args:
            database_options: MySQL 连接参数。
        """

        self.database_options = database_options

    def execute(self, sql: str) -> SQLExecutionResult:
        """执行一条 SQL。

        Args:
            sql: 要执行的 SQL 语句。

        Returns:
            SQLExecutionResult: 查询行或影响行数。
        """

        statement = sql.strip()
        if not statement:
            raise ValueError("SQL 不能为空")

        engine = self._create_engine()
        try:
            with engine.begin() as connection:
                result = connection.exec_driver_sql(statement)
                if result.returns_rows:
                    return SQLExecutionResult(
                        rows=[dict(row._mapping) for row in result],
                        rowcount=result.rowcount,
                        returns_rows=True,
                    )
                return SQLExecutionResult(
                    rows=[],
                    rowcount=result.rowcount,
                    returns_rows=False,
                )
        finally:
            engine.dispose()

    def _create_engine(self) -> Engine:
        """创建 MySQL SQLAlchemy engine。"""

        options = self.database_options
        connection_string = (
            "mysql+pymysql://"
            f"{quote_plus(options.user)}:{quote_plus(options.password)}"
            f"@{options.host}:{options.port}/{options.database}"
            "?charset=utf8mb4"
        )
        return create_engine(connection_string)


def parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    """解析命令行参数。"""

    parser = argparse.ArgumentParser(description="执行一条 MySQL SQL")
    parser.add_argument("--host", required=True, help="MySQL host")
    parser.add_argument("--port", type=int, default=3306, help="MySQL port")
    parser.add_argument("--user", required=True, help="MySQL user")
    parser.add_argument("--password", required=True, help="MySQL password")
    parser.add_argument("--database", required=True, help="MySQL database")
    parser.add_argument("--sql", required=True, help="要执行的 SQL")
    return parser.parse_args(argv)


def print_result(result: SQLExecutionResult) -> None:
    """打印 SQL 执行结果。"""

    if result.returns_rows:
        print(f"查询完成: rows={len(result.rows)}")
        for row in result.rows:
            print(row)
        return

    print(f"执行完成: rowcount={result.rowcount}")


def main(argv: list[str] | None = None) -> int:
    """命令行入口。"""

    args = parse_args(argv)
    options = DatabaseOptions(
        host=args.host,
        port=args.port,
        user=args.user,
        password=args.password,
        database=args.database,
    )
    try:
        result = SQLExecutor(options).execute(args.sql)
        print_result(result)
        return 0
    except Exception as exc:
        print(f"执行失败: {exc}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    sys.exit(main())
