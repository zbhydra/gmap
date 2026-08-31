"""Maps 远程配置 API 契约形状测试。"""

import pytest


@pytest.mark.asyncio
async def test_maps_config_returns_config_groups(async_client):
    """Maps 配置端点返回 dom/parseSchema/scrape 功能组 + operations 运营组的信封结构。"""
    response = await async_client.get("/api/client/maps/config")
    body = response.json()

    assert response.status_code == 200
    assert body["code"] == 10000
    data = body["data"]
    assert set(data.keys()) == {"dom", "parseSchema", "scrape", "operations"}

    dom = data["dom"]
    assert dom["feed"] == "div[role=feed]"
    assert "searchInput" in dom

    parse_schema = data["parseSchema"]
    assert parse_schema["listLocator"] == "len-8"
    assert parse_schema["detailPath"] == "[i][1]"
    assert parse_schema["formatADirectNavEnabled"] is True
    assert parse_schema["formatBSpaXhrEnabled"] is True
    assert parse_schema["fields"]["name"] == [11]

    scrape = data["scrape"]
    assert scrape["scrollIntervalSec"] == 8
    assert scrape["scrollIntervalOptionsSec"] == [5, 6, 8, 9, 10]

    operations = data["operations"]
    assert operations["announcementHtml"] == ""
    assert operations["announcementVersion"] == ""
    assert operations["minPluginVersion"] == ""
    # W7 插件联动登记：升级入口落地页常量随配置下发
    assert operations["pricingUrl"] == "https://mapsgrab.com/pricing/"
