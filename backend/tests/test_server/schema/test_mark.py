"""Mark type enum tests."""

from app.constants.mark import MarkType


def test_mark_type_includes_website_events():
    expected_marks = {
        "WEB_FIRST_OPENED": "web_first_opened",
        "WEB_EXTENSION_STORE_REVIEW_CLICK": "web_extension_store_review_click",
        "WEB_EXTENSION_INSTALL_CLICK": "web_extension_install_click",
        "WEB_CREDIT_PURCHASE_MODAL_OPEN": "web_credit_purchase_modal_open",
        "WEB_CREDIT_PURCHASE_BUY_CLICK": "web_credit_purchase_buy_click",
    }
    actual_marks = {name: member.value for name, member in MarkType.__members__.items()}

    for name, value in expected_marks.items():
        assert actual_marks.get(name) == value
