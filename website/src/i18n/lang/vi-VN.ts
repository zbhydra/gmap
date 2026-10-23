import type { SiteContent, McpOAuthContent, ClinkReturnContent } from '../schema'
import type { CompanyContent } from '../../company/companyContent'
import type { LegalContent } from '../../legal/legalContent'

export const site: SiteContent = {
  "site": {
    "name": "MapsGrab",
    "description": "MapsGrab là bộ công cụ dữ liệu bản đồ: lấy thông tin doanh nghiệp có sẵn công khai từ bản đồ, liên kết đánh giá, ID địa điểm, v.v. bằng tiện ích mở rộng trình duyệt và công cụ web.",
    "keywords": "dữ liệu bản đồ, trình trích xuất bản đồ của google, công cụ tìm id địa điểm, trình tạo liên kết đánh giá, công cụ bản đồ"
  },
  "layout": {
    "nav": {
      "brand": "MapsGrab",
      "primaryLabel": "Điều hướng chính",
      "mobileLabel": "Điều hướng trên thiết bị di động",
      "extension": "Tiện ích",
      "online": "Trực tuyến",
      "api": "API",
      "apiScraper": "API thu thập dữ liệu",
      "apiReviews": "API đánh giá",
      "apiPhotos": "API ảnh",
      "apiMcp": "MCP thu thập dữ liệu",
      "apiScraperDesc": "Dữ liệu doanh nghiệp cho bất kỳ từ khóa và vị trí nào, dưới dạng JSON.",
      "apiReviewsDesc": "Chủ đề đánh giá đầy đủ với xếp hạng và câu trả lời của chủ sở hữu.",
      "apiPhotosDesc": "Thư viện ảnh công cộng dưới dạng danh sách URL sẵn sàng sử dụng.",
      "apiMcpDesc": "Dữ liệu Bản đồ trực tiếp cho Claude Code, Cursor và VS Code.",
      "apiFootNote": "API và MCP chia sẻ một hạn mức yêu cầu hàng tháng.",
      "apiPricing": "API giá cả",
      "pricing": "Định giá",
      "freeTools": "Công cụ miễn phí",
      "signIn": "Đăng nhập",
      "dashboard": "Bảng điều khiển"
    },
    "footer": {
      "legalLabel": "Hợp pháp",
      "resources": "Công cụ miễn phí",
      "product": "Sản phẩm",
      "rights": "© 2026 MapsGrab. Mọi quyền được bảo lưu.",
      "tools": [
        {
          "id": "place-id-finder",
          "label": "Place ID Công cụ tìm kiếm",
          "path": "/tools/place-id-finder/"
        },
        {
          "id": "review-link-generator",
          "label": "Xem lại Trình tạo liên kết",
          "path": "/tools/review-link-generator/"
        },
        {
          "id": "email-checker",
          "label": "Trình kiểm tra email",
          "path": "/tools/email-checker/"
        },
        {
          "id": "lat-long-to-dms",
          "label": "Công cụ chuyển đổi Lat Long sang DMS",
          "path": "/tools/lat-long-to-dms/"
        },
        {
          "id": "dms-to-dd",
          "label": "DMS sang Bộ chuyển đổi thập phân",
          "path": "/tools/dms-to-dd/"
        },
        {
          "id": "bulk-keywords-generator",
          "label": "Trình tạo từ khóa hàng loạt",
          "path": "/tools/bulk-keywords-generator/"
        },
        {
          "id": "merge-csv",
          "label": "Hợp nhất CSV Tệp trực tuyến",
          "path": "/tools/merge-csv-files-online/"
        }
      ]
    }
  },
  "common": {
    "installCta": "Cài đặt ngay",
    "comingSoon": "Sắp ra mắt",
    "themeLabel": "Chủ đề màu sắc",
    "themeLight": "Ánh sáng",
    "themeDark": "Tối tăm",
    "themeSystem": "Hệ thống",
    "faqLabel": "Câu hỏi thường gặp",
    "breadcrumbLabel": "vụn bánh mì",
    "languageSwitcherLabel": "Trình chuyển đổi ngôn ngữ",
    "mobileMenuLabel": "Chuyển đổi menu",
    "copied": "Đã sao chép vào bảng nhớ tạm",
    "cancel": "Hủy bỏ",
    "continue": "Tiếp tục"
  },
  "dashboard": {
    "create": {
      "title": "Trình thu thập trực tuyến",
      "newTask": "Tác vụ mới",
      "modeLabel": "Chế độ tìm kiếm",
      "modes": {
        "keywords": "Từ khóa",
        "map": "Bản đồ",
        "regions": "Khu vực"
      },
      "keywords": "Từ khóa",
      "placeholder": "quán cà phê ở Portland\nnhà hàng ở Austin",
      "count": "{count} / {limit} từ khóa",
      "duplicates": "Đã bỏ qua dòng trùng lặp: {count}",
      "contacts": "Tìm email và hồ sơ xã hội",
      "contactsPaid": "Có sẵn với gói trực tuyến trả phí.",
      "usage": "{used} / {total} hồ sơ trong tháng này",
      "reset": "Hạn mức hằng tháng được đặt lại vào ngày 1 (giờ New York).",
      "loading": "Đang tải giới hạn của bạn...",
      "optionsFailed": "Không thể tải giới hạn nhiệm vụ của bạn. Vui lòng thử lại.",
      "submit": "Bắt đầu thu thập",
      "submitting": "Đang gửi...",
      "submitted": "Đã gửi tác vụ",
      "failed": "Việc gửi nhiệm vụ không thành công. Hãy làm mới lịch sử trước khi thử lại.",
      "exhausted": "Hạn ngạch hàng tháng của bạn đã hết.",
      "invalid": "Nhập tối đa {limit} từ khóa, mỗi từ khóa không dài quá 500 ký tự.",
      "map": {
        "latitude": "Vĩ độ",
        "longitude": "Kinh độ",
        "radius": "Bán kính (km)",
        "spacing": "Khoảng cách lưới (km)",
        "sampleCount": "{count} / {limit} tìm kiếm địa điểm",
        "points": "Điểm lưới: {points} · Từ khóa: {keywords}",
        "overLimit": "Giảm bán kính hoặc tăng khoảng cách lưới để ở trong {limit} vị trí tìm kiếm.",
        "chooseCenter": "Chọn một trung tâm trên bản đồ hoặc nhập tọa độ.",
        "mapLabel": "Chọn trung tâm tìm kiếm trên bản đồ",
        "tilesUnavailable": "Không thể tải ô bản đồ. Bạn vẫn có thể nhập tọa độ.",
        "attribution": "những người đóng góp OpenStreetMap"
      },
      "region": {
        "baseKeywords": "Từ khóa cơ sở",
        "basePlaceholder": "quán cà phê\nnhà hàng",
        "country": "Quốc gia",
        "state": "Tiểu bang hoặc khu vực",
        "citySearch": "Tìm một thành phố",
        "cityPlaceholder": "Nhập ít nhất hai chữ cái",
        "city": "Thành phố",
        "selectCountry": "Chọn một quốc gia",
        "allStates": "Tất cả các tiểu bang hoặc khu vực",
        "loading": "Đang tải vị trí...",
        "loadFailed": "Không thể tải vị trí. Vui lòng thử lại.",
        "retry": "Thử lại",
        "addCountry": "Thêm quốc gia",
        "addState": "Thêm trạng thái",
        "selectedRegions": "Địa điểm đã chọn",
        "remove": "Xóa {name}",
        "noMatch": "Không có kết quả phù hợp",
        "matchMode": "Tìm kiếm cụm từ",
        "inMode": "TRONG",
        "nearMode": "Gần",
        "generate": "Tạo truy vấn",
        "finalQueries": "Truy vấn cuối cùng",
        "finalPlaceholder": "Các truy vấn đã tạo sẽ xuất hiện ở đây. Bạn có thể chỉnh sửa chúng.",
        "attribution": "Dữ liệu vị trí: GeoNames (CC BY)"
      }
    },
    "seo": {
      "title": "Trang tổng quan | MapsGrab",
      "description": "Quản lý các lần xuất MapsGrab, quyền truy cập và đăng ký API của bạn trong một không gian làm việc."
    },
    "shell": {
      "skipToContent": "Chuyển đến nội dung chính",
      "sideLabel": "Không gian làm việc",
      "homeLabel": "Trang chủ MapsGrab",
      "navLabel": "Menu không gian làm việc",
      "loading": "Đang tải không gian làm việc của bạn...",
      "retry": "Thử lại",
      "navOnline": "Trình thu thập trực tuyến",
      "navJobHistory": "Lịch sử",
      "navApi": "API quản lý",
      "navSubscriptions": "Đăng ký",
      "openMenu": "Mở menu không gian làm việc",
      "closeMenu": "Đóng menu không gian làm việc",
      "collapseSidebar": "Thu gọn thanh bên",
      "expandSidebar": "Mở rộng thanh bên",
      "back": "Quay lại"
    },
    "account": {
      "menuButtonLabel": "Mở menu tài khoản",
      "menuLabel": "Trình đơn tài khoản",
      "logout": "Đăng xuất",
      "upgrade": "Nâng cấp",
      "usageShort": "{used} / {total} bản ghi",
      "planUnavailable": "Không khả dụng",
      "theme": "Giao diện",
      "themeLight": "Sáng",
      "themeDark": "Tối",
      "themeSystem": "Theo hệ thống",
      "language": "Ngôn ngữ"
    },
    "history": {
      "title": "Lịch sử xuất dữ liệu trực tuyến",
      "description": "Các tác vụ bạn đã chạy trên Công cụ quét trực tuyến, mới nhất trước tiên. Thời gian được hiển thị theo Giờ Miền Đông (New York).",
      "refresh": "Làm cho khỏe lại",
      "autoRefresh": "Đang tự động làm mới",
      "loading": "Đang tải bản xuất của bạn...",
      "loadFailed": "Không tải được lịch sử xuất của bạn.",
      "refreshFailed": "Không thể làm mới. Đang hiển thị kết quả tải gần nhất.",
      "retry": "Thử lại",
      "emptyTitle": "Chưa có xuất dữ liệu",
      "emptyHint": "Chạy một tác vụ trên Trình thu thập trực tuyến và nó sẽ hiển thị ở đây.",
      "emptyCta": "Đến Trình thu thập trực tuyến",
      "recentTitle": "Tác vụ gần đây",
      "viewAll": "Xem tất cả",
      "recentEmptyHint": "Các tác vụ bạn bắt đầu ở trên sẽ hiển thị tại đây.",
      "noMatchTitle": "Không có tác vụ phù hợp",
      "noMatchHint": "Hãy thử mã tác vụ hoặc từ khóa khác, hoặc xóa bộ lọc.",
      "moreKeywordsShort": "+{count}",
      "moreKeywords": "và {count} từ khóa khác",
      "columns": {
        "taskNo": "Tác vụ",
        "createdAt": "Tạo lúc (ET)",
        "samples": "Tìm kiếm",
        "records": "Hồ sơ",
        "status": "Trạng thái"
      },
      "status": {
        "queued": "Đã xếp hàng",
        "collecting": "thu thập",
        "publishing": "Đang chuẩn bị CSV",
        "completed": "Hoàn thành",
        "partial": "Thành công một phần",
        "failed": "Thất bại"
      },
      "timezone": "ET",
      "search": {
        "label": "Tìm tác vụ",
        "placeholder": "Tìm theo mã tác vụ hoặc từ khóa",
        "clear": "Xóa tìm kiếm"
      },
      "filters": {
        "label": "Lọc tác vụ",
        "button": "Bộ lọc",
        "status": "Trạng thái",
        "all": "Tất cả",
        "running": "Đang chạy",
        "clear": "Xóa bộ lọc"
      },
      "range": {
        "label": "Khoảng thời gian",
        "last7": "7 ngày qua",
        "last30": "30 ngày qua",
        "all": "Mọi thời gian",
        "custom": "Tùy chỉnh",
        "from": "Từ",
        "to": "Đến",
        "apply": "Áp dụng",
        "invalid": "Chọn ngày bắt đầu không muộn hơn ngày kết thúc.",
        "hint": "Ngày theo giờ miền Đông Hoa Kỳ (New York)."
      },
      "pagination": {
        "label": "Phân trang",
        "previous": "Trước",
        "next": "Kế tiếp",
        "page": "Trang {page}",
        "pageSize": "Số dòng mỗi trang",
        "summary": "{from}–{to} trong số {total}"
      },
      "detail": {
        "show": "Chi tiết",
        "loading": "Đang tải tìm kiếm...",
        "loadFailed": "Không thể tải các tìm kiếm cho tác vụ này.",
        "keyword": "Từ khóa",
        "records": "Hồ sơ",
        "runNo": "Chạy",
        "startedAt": "Bắt đầu lúc (ET)",
        "finishedAt": "Kết thúc lúc (ET)",
        "contacts": "Email và hồ sơ xã hội",
        "contactsEnabled": "Đã bật cho tác vụ này",
        "contactsDisabled": "Tắt cho nhiệm vụ này",
        "completed": "Hoàn thành",
        "pending": "Chưa giải quyết",
        "viewport": "{lat}, {lng} · thu phóng {zoom}"
      },
      "copyJob": "Sao chép mã tác vụ",
      "dedupeHint": "Số bản ghi được tính sau khi loại bỏ trùng lặp trên toàn bộ tác vụ.",
      "finished": "Tác vụ {job}: {status}",
      "finishedRecords": "{count} bản ghi",
      "downloadCsv": "Tải xuống CSV",
      "noFile": "Không CSV",
      "errors": {
        "31301": "Không thể thu thập tìm kiếm này.",
        "31302": "Một số kết quả không có sẵn. Các hàng đã gửi sẽ được giữ lại.",
        "31303": "Người thu gom đang bận. Hãy thử lại.",
        "31304": "Không thể xuất bản bản xuất này."
      },
      "errorFailed": "Không thể hoàn thành tìm kiếm này.",
      "downloading": "Chuẩn bị...",
      "downloadUnavailable": "Không thể tải xuống CSV. Tệp có thể đã hết hạn.",
      "downloadFailed": "Không thể bắt đầu tải xuống. Vui lòng thử lại.",
      "signInPrompt": "Đăng nhập để xem lịch sử xuất trực tuyến của bạn.",
      "signInCta": "Đăng nhập",
      "unreachable": "Không thể đạt tới MapsGrab ngay bây giờ."
    },
    "api": {
      "description": "Quản lý khóa API, trợ cấp yêu cầu hàng tháng và các ứng dụng AI được kết nối của bạn.",
      "docsLink": "Xem API sản phẩm",
      "signInPrompt": "Đăng nhập để quản lý quyền truy cập API của bạn.",
      "loading": "Đang tải quyền truy cập API của bạn...",
      "loadFailed": "Không thể tải quyền truy cập API của bạn. Vui lòng thử lại.",
      "retry": "Thử lại",
      "refresh": "Làm cho khỏe lại",
      "keyTitle": "Khóa API",
      "keyEmpty": "Bạn chưa tạo khóa API.",
      "generateKey": "Tạo khóa API",
      "rotateKey": "Thay thế khóa API",
      "generatingKey": "Đang tạo...",
      "keyOnce": "Sao chép khóa này ngay bây giờ. Bạn sẽ không thể xem lại sau khi rời khỏi hoặc làm mới trang này.",
      "keyCreated": "Tạo",
      "rotateTitle": "Thay thế khóa API của bạn?",
      "rotateMessage": "Khóa hiện tại của bạn sẽ ngừng hoạt động ngay lập tức. Cập nhật mọi ứng dụng sử dụng khóa mới.",
      "cancel": "Hủy bỏ",
      "copyKey": "Sao chép khóa API",
      "copied": "Đã sao chép",
      "copyFailed": "Không thể sao chép. Chọn văn bản và sao chép nó bằng tay.",
      "keyFailed": "Không thể tạo khóa API. Vui lòng thử lại.",
      "usageTitle": "Mức sử dụng API hàng tháng",
      "usageFailed": "Không thể tải mức sử dụng API. Vui lòng thử lại.",
      "usageValue": "{used} / {total} yêu cầu",
      "usagePeriod": "Thời gian: {period}",
      "quotaExhausted": "Trợ cấp yêu cầu hàng tháng của bạn đã cạn kiệt.",
      "quotaReset": "Đặt lại ngày 1 (ET) · API và MCP dùng chung",
      "planTitle": "kế hoạch API",
      "managePlan": "Quản lý đăng ký",
      "connectionsTitle": "Địa chỉ kết nối",
      "apiUrl": "API cơ sở URL",
      "mcpUrl": "MCP máy chủ URL",
      "mcpHint": "Thêm URL này vào ứng dụng khách MCP của bạn. Đăng nhập và phê duyệt kết nối khi mở trang web này.",
      "mcpUnavailable": "Địa chỉ kết nối MCP chưa có sẵn.",
      "copyUrl": "Sao chép URL",
      "curlTitle": "Bắt đầu nhanh",
      "curlHint": "Thay phần giữ chỗ bằng khóa API đầy đủ của bạn.",
      "grants": {
        "title": "Ứng dụng được kết nối",
        "description": "Các ứng dụng bạn đã cho phép tìm kiếm doanh nghiệp và đọc các bài đánh giá cũng như ảnh công khai bằng cách sử dụng khoản trợ cấp API của bạn.",
        "loading": "Đang tải ứng dụng được kết nối...",
        "empty": "Không có ứng dụng nào được kết nối.",
        "loadFailed": "Không thể tải ứng dụng được kết nối. Vui lòng thử lại.",
        "selfDeclared": "Tên ứng dụng tự đặt: {name}",
        "createdLabel": "Đã kết nối (ET)",
        "refreshedLabel": "Làm mới lần cuối (ET)",
        "notRefreshed": "Chưa",
        "revoke": "Ngắt kết nối",
        "revokeTitle": "Ngắt kết nối ứng dụng này?",
        "revokeMessage": "{host} sẽ mất quyền truy cập ngay lập tức và cần có sự chấp thuận của bạn để kết nối lại.",
        "revokeFailed": "Không thể ngắt kết nối ứng dụng này. Vui lòng thử lại.",
        "paginationLabel": "Trang ứng dụng được kết nối",
        "pageOf": "Trang {page} trên {pages}"
      }
    },
    "subscriptions": {
      "title": "Đăng ký",
      "description": "Các kế hoạch và trạng thái gia hạn cho Công cụ quét trực tuyến, tiện ích mở rộng trình duyệt và API. Mua hoặc nâng cấp trên trang Định giá.",
      "lines": {
        "online": "Trình thu thập trực tuyến",
        "extension": "Tiện ích mở rộng trình duyệt",
        "api": "API"
      },
      "planLabel": "Kế hoạch",
      "expiresLabel": "Gia hạn/hết hạn",
      "free": "Miễn phí",
      "unavailable": "Tạm thời không có",
      "autoRenewOn": "Tự động gia hạn đang bật",
      "autoRenewOff": "Tắt tự động gia hạn",
      "paidVia": "Thanh toán qua {method}",
      "subscribeCta": "Chọn một kế hoạch",
      "pricingLink": "Xem bảng giá",
      "manageSubscription": "Quản lý đăng ký",
      "managingSubscription": "Khai mạc...",
      "manageFailed": "Không thể mở trang quản lý gói đăng ký. Vui lòng thử lại.",
      "signInPrompt": "Đăng nhập để xem đăng ký của bạn."
    },
    "cancelGuide": {
      "title": "Quản lý đăng ký của bạn tại nhà cung cấp thanh toán",
      "paths": [
        {
          "provider": "PayPal",
          "steps": [
            "Đăng nhập vào PayPal và mở Cài đặt.",
            "Chuyển đến Thanh toán, sau đó đến Thanh toán tự động.",
            "Chọn MapsGrab và chọn Hủy."
          ]
        },
        {
          "provider": "ClinkBill",
          "steps": [
            "Mở liên kết Cổng thông tin khách hàng từ email mua hàng của bạn.",
            "Đăng nhập và chọn đăng ký MapsGrab của bạn.",
            "Chọn Hủy."
          ]
        }
      ],
      "closeLabel": "Đóng"
    }
  },
  "pages": {
    "home": {
      "seo": {
        "title": "MapsGrab — Lấy Google Maps Dữ liệu doanh nghiệp vào CSV & JSON",
        "description": "MapsGrab là tiện ích mở rộng của trình duyệt và bộ công cụ web thu thập thông tin doanh nghiệp có sẵn công khai từ Google Maps — tên, điện thoại, đánh giá, ảnh, email — và xuất thông tin đó sang CSV hoặc JSON."
      },
      "hero": {
        "announce": {
          "badge": "Mới",
          "text": "MCP máy chủ dành cho đại lý AI"
        },
        "title": {
          "firstLine": "Thu thập dữ liệu Google Maps",
          "secondLine": "chỉ với",
          "accent": "một cú nhấp chuột",
          "end": "."
        },
        "lead": "Thu thập dữ liệu doanh nghiệp công khai từ Google Maps — tên, số điện thoại, trang web, bài đánh giá, ảnh và email — và xuất sạch CSV hoặc JSON trong vài giây.",
        "search": {
          "label": "Từ khóa tìm kiếm",
          "typing": [
            "quán cà phê ở Portland",
            "nha sĩ ở Austin, TX",
            "thợ sửa ống nước gần Chicago",
            "phòng tập yoga ở Brooklyn",
            "Các khách sạn ở Bãi biển Miami"
          ],
          "submit": "Xem trước kết quả",
          "loading": "Đang tìm kiếm…",
          "suggestLabel": "Thử",
          "suggestions": [
            "quán cà phê ở Portland",
            "nha sĩ ở Austin, TX",
            "thợ sửa ống nước gần Chicago"
          ]
        },
        "trust": [
          "Không cần thẻ tín dụng",
          "{records} hồ sơ miễn phí / tháng",
          "CSV & JSON xuất"
        ],
        "dashboard": "Mở Scraper trực tuyến",
        "theater": {
          "panelLabel": "MapsGrab xem trước bảng điều khiển",
          "extensionActive": "MapsGrab tiện ích mở rộng đang hoạt động",
          "mapFilters": [
            "Mở ngay bây giờ",
            "Được đánh giá cao nhất",
            "Giá"
          ],
          "live": "Sống",
          "done": "Xong",
          "start": "Bắt đầu thu thập",
          "pause": "Tạm dừng",
          "extracting": "Đang trích xuất {count}…",
          "finished": "Hoàn tất · {count} địa điểm",
          "kpis": {
            "phones": "điện thoại",
            "emails": "email",
            "websites": "các trang web"
          },
          "export": "Xuất danh sách chi tiết - {count} (.CSV)",
          "exportSaved": "Đã lưu xuất",
          "emailFound": "Đã tìm thấy email",
          "averageRating": "Đánh giá trung bình",
          "placeId": "Place ID",
          "ratingValue": "{rating} · {reviews} đánh giá"
        },
        "preview": {
          "title": "Kết quả",
          "count": "{count} doanh nghiệp trên trang kết quả đầu tiên",
          "columns": {
            "name": "Tên",
            "address": "Địa chỉ",
            "category": "Loại",
            "rating": "Đánh giá",
            "reviews": "Đánh giá",
            "phone": "Điện thoại"
          },
          "locked": "Đăng nhập và gửi từ khóa của bạn trong Công cụ thu thập trực tuyến để thu thập và xuất kết quả.",
          "signIn": "Đăng nhập để bắt đầu một nhiệm vụ đầy đủ",
          "failed": "Không thể tải bản xem trước. Vui lòng thử lại.",
          "empty": "Không tìm thấy doanh nghiệp nào trên trang kết quả đầu tiên."
        }
      },
      "facts": {
        "caption": "MapsGrab theo những con số",
        "items": [
          {
            "value": 36,
            "label": "cột dữ liệu cho mỗi doanh nghiệp"
          },
          {
            "value": 11,
            "label": "xem xét các trường, bao gồm câu trả lời của chủ sở hữu"
          },
          {
            "value": 6,
            "label": "mạng xã hội phù hợp trên mỗi trang web"
          },
          {
            "value": "freeRecords",
            "label": "hồ sơ miễn phí, hàng tháng"
          },
          {
            "value": 3,
            "plus": 1,
            "label": "cách để chạy nó: Tiện ích mở rộng, Trực tuyến, API — cộng với MCP"
          }
        ]
      },
      "how": {
        "head": {
          "kicker": "Nó hoạt động như thế nào",
          "title": {
            "lead": "Từ tìm kiếm bản đồ đến bảng tính ",
            "accent": " ",
            "tail": " theo ba bước"
          },
          "lead": "Không có mã và không sao chép-dán. MapsGrab đọc những gì Google Maps đã hiển thị cho bạn và biến nó thành các hàng có cấu trúc."
        },
        "steps": [
          {
            "title": "Tìm kiếm Google Maps",
            "body": "Mở Google Maps và tìm kiếm bất kỳ loại hình và địa điểm kinh doanh nào — chính xác như bạn thường làm."
          },
          {
            "title": "Bắt đầu thu thập",
            "body": "Nhấp vào {action}. MapsGrab cuộn kết quả, thu thập danh sách và khi được bật sẽ làm phong phú thêm địa chỉ liên hệ.",
            "action": "Bắt đầu thu thập"
          },
          {
            "title": "Xuất khẩu ở mọi nơi",
            "body": "Tải xuống CSV hoặc JSON với các cột bạn chọn — các bài đánh giá và ảnh sẽ nằm trong tệp riêng, sẵn sàng cho Excel hoặc CRM của bạn."
          }
        ],
        "searchSample": "tiệm bánh ở Seattle",
        "columnsUnit": "cột",
        "reviewsFile": "đánh giá"
      },
      "products": {
        "head": {
          "kicker": "Các sản phẩm",
          "title": {
            "lead": "Ba cách để ",
            "accent": " lấy dữ liệu Bản đồ ",
            "tail": "."
          },
          "lead": "Chọn tiện ích mở rộng của trình duyệt, Công cụ quét trực tuyến dựa trên đám mây hoặc API. Tiện ích mở rộng hoạt động bên trong trình duyệt của riêng bạn; Công cụ quét trực tuyến và API chia sẻ một công cụ đám mây."
        },
        "cards": {
          "extension": {
            "badge": "Tiện ích mở rộng trình duyệt",
            "title": "Lấy dữ liệu trong khi bạn duyệt Google Maps",
            "body": "Trích xuất dữ liệu doanh nghiệp, bài đánh giá và ảnh từ các trang Maps bạn mở, sau đó xuất mọi thứ cục bộ. Cạnh, Firefox và Chromium.",
            "link": "Khám phá tiện ích mở rộng"
          },
          "online": {
            "badge": "Trình thu thập trực tuyến",
            "title": "Đám mây chạy. Không có gì để cài đặt.",
            "body": "Dán từ khóa, thu thập thông tin chi tiết về doanh nghiệp trên đám mây và tải xuống một cột 37-cột CSV không trùng lặp cho mỗi nhiệm vụ.",
            "link": "Khám phá Scraper trực tuyến"
          },
          "api": {
            "badge": "API",
            "title": "Làm sạch JSON trên HTTP",
            "body": "Dữ liệu doanh nghiệp và đánh giá cho ứng dụng của riêng bạn — một khóa API.",
            "link": "Khám phá API"
          },
          "mcp": {
            "badge": "MCP máy chủ",
            "title": "Dữ liệu Bản đồ trực tiếp cho các đại lý AI của bạn",
            "body": "Tìm kiếm và đánh giá dưới dạng công cụ MCP cho Claude Code, Cursor, VS Code và Codex.",
            "link": "Khám phá máy chủ MCP"
          }
        },
        "extracting": "Đang trích xuất {count}…",
        "queue": {
          "rows": "{count} hàng",
          "processing": "Xử lý"
        },
        "chat": {
          "prompt": "Tìm các nha sĩ ở Austin được xếp hạng 4.5+ bằng một trang web",
          "answer": "Đã tìm thấy {count} kết quả phù hợp. Ba người đứng đầu:"
        }
      },
      "fields": {
        "head": {
          "kicker": "Dữ liệu",
          "title": {
            "lead": "Cột 36.  ",
            "accent": " Mỗi một ",
            "tail": " đều hữu ích."
          },
          "lead": "Tiện ích mở rộng xuất một lược đồ từ kết quả tìm kiếm và trang kinh doanh — chi tiết liên hệ, vị trí, hồ sơ, xếp hạng và mọi số nhận dạng bạn cần để khớp với các bản ghi sau này."
        },
        "filtersLabel": "Nhóm lĩnh vực",
        "all": "Tất cả",
        "groups": {
          "contact": {
            "filter": "Liên hệ",
            "label": "Liên hệ"
          },
          "location": {
            "filter": "Vị trí",
            "label": "Vị trí"
          },
          "profile": {
            "filter": "Hồ sơ",
            "label": "Hồ sơ doanh nghiệp"
          },
          "reviews": {
            "filter": "Xếp hạng",
            "label": "Xếp hạng và đánh giá"
          },
          "ids": {
            "filter": "ID & liên kết",
            "label": "ID & liên kết"
          }
        },
        "sampleLabel": "Giá trị mẫu",
        "emptySample": "(trống)",
        "descriptions": {
          "Name": "Tên doanh nghiệp chính xác như được hiển thị trên danh sách.",
          "Description": "Mô tả ngắn từ hồ sơ doanh nghiệp.",
          "Fulladdress": "Địa chỉ đường phố được định dạng đầy đủ.",
          "Street": "Đường phố của địa chỉ.",
          "Municipality": "Thành phố hoặc địa phương.",
          "Categories": "Mỗi danh mục được giao cho doanh nghiệp.",
          "About": "Các thuộc tính từ tab Giới thiệu.",
          "Plus Code": "Cột dành riêng cho Mã vị trí mở - hiện đã xuất trống.",
          "Time Zone": "Múi giờ IANA của địa điểm.",
          "Price": "Mức giá hiển thị trên danh sách.",
          "Note": "Ghi chú của người bán hoặc đánh dấu.",
          "Amenities": "Tiện nghi và lựa chọn dịch vụ.",
          "Hotel Class": "Hạng sao cho danh sách chỗ ở.",
          "Phone": "Số điện thoại chính hiển thị trên danh sách.",
          "Phones": "Mọi số điện thoại được tìm thấy cho doanh nghiệp.",
          "Claimed": "Liệu chủ sở hữu đã xác nhận hồ sơ hay chưa.",
          "Owner": "Tên chủ sở hữu trên hồ sơ.",
          "Owner Id": "ID người đóng góp của tài khoản chủ sở hữu.",
          "Owner Link": "Liên kết tới trang đóng góp của chủ sở hữu.",
          "Email": "Địa chỉ email được tìm thấy trên trang web doanh nghiệp.",
          "Social Medias": "Hồ sơ xã hội được liên kết từ trang web.",
          "Review Count": "Tổng số đánh giá.",
          "Average Rating": "Xếp hạng sao trung bình.",
          "Review URL": "Liên kết trực tiếp đến bảng đánh giá.",
          "Google Maps URL": "Liên kết ngắn ổn định được xây dựng từ CID.",
          "Google Knowledge URL": "Liên kết tìm kiếm bảng kiến ​​thức.",
          "Latitude": "Vĩ độ tính bằng độ thập phân.",
          "Longitude": "Kinh độ tính bằng độ thập phân.",
          "Website": "Trang web chính thức từ danh sách.",
          "Domain": "Tên miền có thể đăng ký của trang web.",
          "Opening Hours": "Giờ hàng tuần, ngày đóng cửa được đánh dấu.",
          "Featured Image": "Ảnh bìa URL của danh sách.",
          "Cid": "ID khách hàng — dạng thập phân của FID.",
          "Fid": "ID tính năng được tạo thành từ hai nửa thập lục phân.",
          "Place Id": "Ổn định Google Place ID.",
          "Kgmid": "ID máy Sơ đồ tri thức."
        },
        "reviews": {
          "title": "+ 11 cột đánh giá",
          "body": "Được xuất riêng, được phân trang theo giới hạn gói của bạn."
        },
        "photos": {
          "title": "+ danh sách ảnh URL",
          "body": "Ảnh anbom công khai URLs cho mỗi doanh nghiệp, Chế độ xem phố đã được lọc ra."
        },
        "sampleCsv": "Tải mẫu CSV"
      },
      "enrichment": {
        "head": {
          "kicker": "Làm giàu",
          "title": {
            "lead": "Từ ghim đến một người, bạn có thể ",
            "accent": " gửi email cho ",
            "tail": ""
          },
          "lead": "Khi tính năng làm giàu được bật, MapsGrab sẽ kiểm tra trang web chính thức của từng doanh nghiệp và điền vào các kênh liên hệ trực tiếp trong khi trích xuất."
        },
        "points": [
          "Địa chỉ email được tìm thấy trên trang web doanh nghiệp",
          "Hồ sơ xã hội: Facebook, Instagram, LinkedIn, X, YouTube, TikTok",
          "Bật theo mặc định trên các gói Trực tuyến trả phí, một cài đặt trong tiện ích mở rộng",
          "Được bao gồm trong API phản hồi tìm kiếm bằng một cờ — không có bước bổ sung riêng biệt"
        ]
      },
      "developers": {
        "head": {
          "kicker": "Dành cho nhà phát triển",
          "title": {
            "lead": "Cắm dữ liệu Bản đồ vào ",
            "accent": " bất cứ thứ gì ",
            "tail": " bạn xây dựng"
          },
          "lead": "Công cụ đám mây đằng sau Công cụ quét trực tuyến, được hiển thị dưới dạng máy chủ HTTP API và máy chủ MCP. Có cấu trúc JSON, một khóa, không có HTML để phân tích cú pháp."
        },
        "listLabel": "Sản phẩm dành cho nhà phát triển",
        "items": {
          "search": {
            "title": "API thu thập dữ liệu",
            "description": "Doanh nghiệp cho bất kỳ từ khóa và vị trí nào"
          },
          "reviews": {
            "title": "API đánh giá",
            "description": "Xếp hạng, văn bản và câu trả lời của chủ sở hữu"
          },
          "photos": {
            "title": "API ảnh",
            "description": "Ảnh công khai URLs mỗi doanh nghiệp"
          },
          "mcp": {
            "title": "MCP máy chủ",
            "description": "Công cụ tìm kiếm và đánh giá cho bất kỳ khách hàng MCP nào"
          }
        },
        "langLabel": "Ngôn ngữ",
        "copyLabel": "Sao chép yêu cầu",
        "sending": "Đang gửi yêu cầu…",
        "response": "Phản hồi · 200 OK · {ms} ms",
        "toolCall": "Gọi công cụ · {tool} · 200 OK",
        "exploreApi": "Khám phá API",
        "apiPricing": "API giá cả",
        "worksWith": "Hoạt động với các công cụ bạn đã sử dụng",
        "integrations": [
          "Claude Code",
          "Cursor",
          "VS Code",
          "Codex",
          "MCP Inspector",
          "Microsoft Excel",
          "CSV",
          "JSON",
          "ZIP gói"
        ]
      },
      "useCases": {
        "head": {
          "kicker": "Trường hợp sử dụng",
          "title": {
            "lead": "Được tạo cho công việc ",
            "accent": " sau ",
            "tail": " tìm kiếm"
          }
        },
        "cards": [
          {
            "label": "Tạo khách hàng tiềm năng",
            "title": "Danh sách khách hàng tiềm năng địa phương",
            "body": "Tìm kiếm một danh mục và thành phố, sau đó xuất toàn bộ trang kết quả — bao gồm điện thoại, trang web và email — vào một bảng tính."
          },
          {
            "label": "SEO địa phương",
            "title": "Điểm chuẩn của đối thủ cạnh tranh",
            "body": "Kéo xếp hạng và số lượng đánh giá của mọi đối thủ cạnh tranh trong một khu vực trong một lần chuyển và tạo báo cáo ngay từ khi xuất."
          },
          {
            "label": "Nghiên cứu thị trường",
            "title": "Bộ dữ liệu vị trí",
            "body": "Thu thập ID địa điểm và tọa độ cho mọi chi nhánh hoặc vị trí của đối thủ cạnh tranh, sẵn sàng cho các công cụ lập bản đồ và định tuyến của bạn."
          }
        ],
        "leadTags": [
          "e-mail",
          "điện thoại",
          "e-mail",
          "địa điểm"
        ]
      },
      "pricingTeaser": {
        "head": {
          "kicker": "Định giá",
          "title": {
            "lead": "Bắt đầu miễn phí.  ",
            "accent": " Thang đo ",
            "tail": " khi nó thành công."
          },
          "lead": "Mỗi sản phẩm đều có một cấp miễn phí không giới hạn thời gian. Chỉ nâng cấp bề mặt bạn thực sự sử dụng."
        },
        "lines": {
          "extension": {
            "title": "Tiện ích mở rộng trình duyệt",
            "billing": "hàng tháng",
            "link": "Xem các gói mở rộng"
          },
          "online": {
            "title": "Trình thu thập trực tuyến",
            "billing": "Một lần",
            "link": "Xem các gói trực tuyến"
          },
          "api": {
            "title": "API & MCP",
            "billing": "Một lần",
            "link": "Xem kế hoạch API"
          }
        }
      },
      "tools": {
        "head": {
          "kicker": "Công cụ miễn phí",
          "title": {
            "lead": "Các công cụ nhỏ dành cho người dùng Maps ",
            "accent": " nâng cao ",
            "tail": ""
          },
          "lead": "Bảy tiện ích chạy hoàn toàn trong trình duyệt của bạn — những gì bạn dán sẽ không bao giờ rời khỏi thiết bị của bạn."
        },
        "descriptions": {
          "place-id-finder": "Dán địa điểm trên Bản đồ URL và đọc Place ID, CID và FID của địa điểm đó.",
          "review-link-generator": "Nhận liên kết “viết đánh giá” trực tiếp cho bất kỳ doanh nghiệp nào.",
          "email-checker": "Xem ngay liệu định dạng email có hợp lệ hay không — với các gợi ý về lỗi đánh máy.",
          "lat-long-to-dms": "Tọa độ thập phân theo độ, phút và giây.",
          "dms-to-dd": "DMS tọa độ trở lại độ thập phân rõ ràng.",
          "bulk-keywords-generator": "Mọi tổ hợp “từ khóa + vị trí”, sẵn sàng để dán.",
          "merge-csv": "Hợp nhất CSV xuất thành một tệp, căn chỉnh theo tiêu đề."
        },
        "more": "Nhiều công cụ khác đang được triển khai"
      },
      "faq": {
        "kicker": "Câu hỏi thường gặp",
        "title": {
          "lead": "",
          "accent": "Câu hỏi thường gặp",
          "tail": ""
        },
        "lead": "Những câu trả lời ngắn gọn. Bất cứ điều gì khác, hỗ trợ chỉ cần một email.",
        "contact": "Liên hệ hỗ trợ",
        "items": [
          {
            "question": "MapsGrab có được sử dụng miễn phí không?",
            "answer": "Đúng. Tiện ích mở rộng hoạt động mà không cần tài khoản và bao gồm hạn mức hồ sơ miễn phí hàng tháng. Các gói trả phí trên trang Định giá sẽ tăng giới hạn khi bạn cần thêm."
          },
          {
            "question": "Những trình duyệt nào được hỗ trợ?",
            "answer": "Tải xuống MapsGrab từ trang Tiện ích mở rộng. Chrome, Edge và Brave tải ZIP đã giải nén; Firefox sử dụng một tiện ích bổ sung tạm thời riêng biệt phải được tải lại sau khi khởi động lại. Trang này bao gồm hướng dẫn cài đặt và cập nhật."
          },
          {
            "question": "Dữ liệu đến từ đâu và việc thu thập có hợp pháp không?",
            "answer": "MapsGrab chỉ thu thập thông tin được hiển thị công khai trên các trang Google Maps bạn truy cập — những thông tin tương tự mà bất kỳ khách truy cập nào cũng có thể đọc. Chúng tôi không truy cập các tài khoản riêng tư, nội dung bị kiểm soát hoặc dữ liệu không công khai."
          },
          {
            "question": "Tôi có cần cài đặt bất cứ thứ gì cho các công cụ web không?",
            "answer": "Không. Các công cụ web miễn phí chạy hoàn toàn trong trình duyệt của bạn — dữ liệu đầu vào của bạn không bao giờ rời khỏi thiết bị của bạn."
          },
          {
            "question": "Tôi có thể xuất sang những định dạng nào?",
            "answer": "Dữ liệu xuất có dạng CSV hoặc JSON với lựa chọn trường bạn chọn, được loại bỏ trùng lặp bởi Place ID."
          },
          {
            "question": "MapsGrab có thấy dữ liệu tôi thu thập không?",
            "answer": "Cài đặt và kết quả của bạn được lưu trữ cục bộ trong trình duyệt của bạn. Máy chủ của chúng tôi chỉ xử lý cấu hình từ xa, trạng thái tài khoản và hạn ngạch, email/làm phong phú mạng xã hội tùy chọn và nhật ký sử dụng tối thiểu."
          }
        ]
      },
      "cta": {
        "kicker": "Bắt đầu",
        "title": {
          "lead": "Bắt đầu lấy sau ",
          "accent": " phút ",
          "tail": ""
        },
        "lead": "Cài đặt tiện ích mở rộng, mở Google Maps, tìm kiếm và xuất danh sách đầu tiên của bạn — không cần tài khoản.",
        "install": "Cài đặt MapsGrab miễn phí",
        "online": "Hãy dùng thử Công cụ thu thập dữ liệu trực tuyến",
        "note": "Bao gồm hạn ngạch hàng tháng miễn phí. Không có thẻ tín dụng."
      }
    },
    "extension": {
      "seo": {
        "title": "MapsGrab cho Chrome, Edge & Firefox — Google Maps Tiện ích mở rộng trình trích xuất",
        "description": "Trích xuất 36 cột dữ liệu doanh nghiệp, đánh giá và ảnh từ Google Maps, làm phong phú hồ sơ bằng email và liên kết xã hội, chạy tác vụ hàng loạt và xuất sang CSV hoặc JSON."
      },
      "hero": {
        "announce": {
          "badge": "v{version}",
          "text": "Tải xuống cho Chrome, Edge & Firefox"
        },
        "title": {
          "lead": "Trình trích xuất Google Maps cho ",
          "accent": " trình duyệt của bạn ",
          "tail": ""
        },
        "lead": "Mở bất kỳ trang tìm kiếm hoặc trang doanh nghiệp Google Maps nào và lấy những gì được hiển thị công khai ở đó — dữ liệu doanh nghiệp, đánh giá, ảnh và chi tiết liên hệ. Mọi thứ đều xuất sang CSV hoặc JSON, ngay từ trình duyệt của bạn.",
        "downloadCta": "Tải xuống cho Chrome & Edge",
        "installCta": "Hướng dẫn cài đặt",
        "meta": [
          "Không cần tài khoản",
          "1,000 hồ sơ miễn phí / tháng",
          "Xuất khẩu vẫn còn trên máy của bạn"
        ],
        "theater": {
          "panelLabel": "MapsGrab xem trước bảng điều khiển",
          "extensionActive": "MapsGrab đang hoạt động trên trang này",
          "dock": "Gắn trái / phải",
          "filters": [
            "Mở ngay bây giờ",
            "Được đánh giá cao nhất",
            "Giá"
          ],
          "open": "Mở",
          "closes": "Đóng {time}",
          "endOfList": "Bạn đã đến cuối danh sách.",
          "start": "Bắt đầu thu thập",
          "extracting": "Đang trích xuất {count}…",
          "pause": "Tạm dừng",
          "complete": "Trích xuất hoàn tất.",
          "reset": "Cài lại",
          "kpis": {
            "phones": "điện thoại",
            "websites": "các trang web",
            "emails": "email"
          },
          "exportCta": "Xuất danh sách chi tiết - {count} (.CSV)",
          "saved": "Đã lưu vào mục tải xuống",
          "scrollChip": {
            "label": "Tự động cuộn",
            "value": "Nhịp độ con người, 5–10 s"
          },
          "dedupeChip": {
            "label": "Đã loại bỏ trùng lặp",
            "value": "bởi Place ID"
          }
        }
      },
      "facts": {
        "caption": "Sơ lược về phần mở rộng",
        "items": [
          {
            "value": 36,
            "label": "cột cho mỗi doanh nghiệp, từ tên đến Place ID"
          },
          {
            "value": 11,
            "label": "cột đánh giá, bao gồm câu trả lời của chủ sở hữu"
          },
          {
            "value": 6,
            "label": "mạng xã hội phù hợp trên mỗi trang web"
          },
          {
            "value": 1000,
            "label": "hồ sơ miễn phí hàng tháng, không cần tài khoản"
          },
          {
            "value": 500,
            "label": "từ khóa hoặc đánh giá URLs mỗi nhiệm vụ hàng loạt"
          }
        ]
      },
      "views": {
        "head": {
          "kicker": "Nó hoạt động ở đâu",
          "title": {
            "lead": "Một bảng điều khiển cho mỗi chế độ xem Bản đồ ",
            "accent": " ",
            "tail": ""
          },
          "lead": "Bảng MapsGrab xuất hiện ngay trên Google Maps. Mỗi kết quả tìm kiếm, trang kinh doanh và danh sách đã lưu đều có chế độ trích xuất phù hợp — không cần sao chép-dán, không cần chuyển đổi tab."
        },
        "search": {
          "title": "Kết quả tìm kiếm",
          "description": "Nhấn Bắt đầu giải nén trên bất kỳ tìm kiếm nào. MapsGrab cuộn danh sách kết quả theo tốc độ của con người và thu thập từng danh sách khi nó tải."
        },
        "place": {
          "title": "Trang kinh doanh",
          "description": "Trên trang doanh nghiệp, tab Đánh giá & Ảnh thông qua các bài đánh giá và album ảnh — xuất đánh giá với cột 11, ảnh dưới dạng danh sách URL.",
          "tabs": [
            "Tổng quan",
            "Đánh giá & Hình ảnh"
          ],
          "reviewsCta": "Bắt đầu trích xuất đánh giá",
          "photosCta": "Bắt đầu trích xuất ảnh",
          "reviewsCount": "{count} đánh giá",
          "photosCount": "{count} ảnh"
        },
        "saved": {
          "title": "Danh sách đã lưu",
          "description": "Mở danh sách đã lưu và nhấn Bắt đầu một lần. MapsGrab lần lượt mở từng địa điểm và thu thập nó - không cần nhấp chuột vào từng vật phẩm.",
          "listName": "Yêu thích · {count} địa điểm"
        }
      },
      "features": {
        "head": {
          "kicker": "Đặc trưng",
          "title": {
            "lead": "Mọi thứ mà trang Maps hiển thị, ",
            "accent": " có cấu trúc ",
            "tail": ""
          },
          "lead": "Một lược đồ trích xuất trên các kết quả tìm kiếm và trang kinh doanh, được điều chỉnh theo giao diện Google Maps hiện tại và được cập nhật từ xa khi Google thay đổi."
        },
        "tabsLabel": "Tính năng mở rộng",
        "tabs": [
          {
            "id": "business",
            "title": "Dữ liệu kinh doanh",
            "description": "36 cột cho mỗi doanh nghiệp, được ghi lại khi cuộn danh sách."
          },
          {
            "id": "reviews",
            "title": "Đánh giá",
            "description": "Đánh giá với câu trả lời của chủ sở hữu, được phân trang tự động."
          },
          {
            "id": "photos",
            "title": "Ảnh",
            "description": "Album ảnh dưới dạng danh sách URL sẵn sàng sử dụng."
          },
          {
            "id": "enrichment",
            "title": "Email và làm giàu xã hội",
            "description": "Các kênh liên hệ trực tiếp từ trang web chính thức."
          },
          {
            "id": "batch",
            "title": "Nhiệm vụ hàng loạt",
            "description": "Một hàng từ khóa hoặc bài đánh giá URLs, đi từng mục một."
          },
          {
            "id": "export",
            "title": "Xuất khẩu",
            "description": "CSV hoặc JSON, được lưu thẳng vào máy của bạn."
          }
        ],
        "business": {
          "claimed": "Đã xác nhận quyền sở hữu",
          "fields": {
            "phone": "Điện thoại",
            "website": "Trang web",
            "rating": "Đánh giá trung bình",
            "hours": "Giờ mở cửa",
            "timeZone": "Múi giờ",
            "coordinates": "tọa độ",
            "placeId": "Place ID",
            "mapsUrl": "Google Maps URL"
          },
          "reviewCount": "{count} đánh giá",
          "columns": "{count} cột cho mỗi doanh nghiệp",
          "reserved": "Mã cộng được bảo lưu",
          "more": "+{count} thêm"
        },
        "reviews": {
          "title": "Đánh giá",
          "columns": "{count} cột",
          "ownerReply": "Phản hồi từ chủ sở hữu",
          "loading": "Đang tải trang đánh giá tiếp theo"
        },
        "photos": {
          "streetView": "Chế độ xem phố · đã lọc"
        },
        "enrichment": {
          "website": "Trang web chính thức",
          "moreNetworks": "X, YouTube và TikTok cũng đã được kiểm tra"
        },
        "batch": {
          "complete": "{count} hoàn thành",
          "stuck": "{count} bị kẹt",
          "total": "tổng cộng {count}",
          "done": "Hoàn thành · {count}",
          "skipped": "Không có tiến triển trong 90 giây · bị bỏ qua",
          "running": "Đang trích xuất…",
          "queued": "Đã xếp hàng",
          "autoExport": "Tự động xuất khi tác vụ kết thúc"
        },
        "files": {
          "formats": [
            ".CSV",
            ".JSON"
          ],
          "fileMeta": "{rows} hàng · {selected} trong số {total} cột được chọn · được loại bỏ trùng lặp bởi Place ID",
          "destinations": [
            {
              "title": "Tải xuống",
              "description": "Được lưu bởi trình duyệt của bạn"
            },
            {
              "title": "Bộ chọn cột",
              "description": "Chỉ xuất các cột bạn cần"
            },
            {
              "title": "Tự động tải xuống",
              "description": "Lưu ngay khi quá trình trích xuất kết thúc"
            }
          ]
        }
      },
      "batch": {
        "head": {
          "kicker": "Nhiệm vụ hàng loạt",
          "title": {
            "lead": "Xếp hàng danh sách.  ",
            "accent": " Bỏ đi. ",
            "tail": ""
          },
          "lead": "Dán tối đa 500 từ khóa hoặc xem xét URLs vào một tác vụ. MapsGrab xem qua từng mục với tiến trình trực tiếp, bỏ qua bất kỳ thứ gì bị đình trệ và tự động xuất khi nhiệm vụ kết thúc."
        },
        "checks": [
          "Tác vụ từ khóa chạy một tìm kiếm trên Bản đồ cho mỗi từ khóa",
          "Đánh giá-URL nhiệm vụ thu thập đánh giá doanh nghiệp theo doanh nghiệp",
          "Trạng thái tác vụ được lưu vào đĩa — nó sẽ hoạt động trở lại sau khi khởi động lại trình duyệt",
          "Lên tới 150 tác vụ đã lưu, mỗi đợt chạy một đợt"
        ],
        "mock": {
          "tabs": [
            "Công cụ dữ liệu từ khóa hàng loạt",
            "Công cụ trích xuất đánh giá hàng loạt Google"
          ],
          "taskName": "Tên nhiệm vụ",
          "taskPlaceholder": "ví dụ. 100 từ khóa, công ty thiết kế",
          "keywords": "Từ khoá · mỗi dòng một từ",
          "lineCount": "{count} / {limit}",
          "start": "Bắt đầu thu thập",
          "columns": {
            "task": "Tên nhiệm vụ",
            "status": "Trạng thái",
            "actions": "hành động"
          },
          "running": "Đang chạy",
          "complete": "Hoàn thành",
          "progress": "{done} / {total}",
          "progressStuck": "{done} / {total} · {stuck} bị kẹt",
          "progressExported": "{done} / {total} · đã xuất",
          "lines": {
            "run": "chiết xuất…",
            "done": "hoàn thành",
            "stuck": "bị kẹt · bỏ qua"
          },
          "toast": "Nhiệm vụ hoàn thành - đã xuất",
          "chip": {
            "label": "Trạng thái nhiệm vụ",
            "value": "Đã lưu vào đĩa"
          }
        }
      },
      "privacy": {
        "head": {
          "kicker": "Ưu tiên địa phương",
          "title": {
            "lead": "Kết quả của bạn được lưu giữ ",
            "accent": " trong trình duyệt ",
            "tail": ""
          },
          "lead": "Cài đặt và kết quả được lưu trữ cục bộ. Máy chủ của chúng tôi chỉ xử lý cấu hình từ xa, trạng thái tài khoản và hạn ngạch, email tùy chọn và nội dung phong phú trên mạng xã hội cũng như nhật ký sử dụng tối thiểu."
        },
        "checks": [
          "Xuất được tạo trên máy của bạn",
          "Lựa chọn cột và sao chép Place ID chạy cục bộ trước khi tệp được lưu",
          "Cấu hình từ xa giúp bảng điều khiển luôn cập nhật khi Google Maps thay đổi — không cần cài đặt lại",
          "Nếu không thể đọc được nội dung nào đó, bảng điều khiển sẽ hiển thị lỗi thay vì lỗi âm thầm"
        ],
        "diagram": {
          "browser": "Trình duyệt của bạn",
          "servers": "MapsGrab máy chủ",
          "nodes": {
            "mapsTab": "tab Google Maps",
            "panel": "bảng MapsGrab",
            "storage": "Bộ nhớ cục bộ",
            "exports": "Xuất khẩu của bạn",
            "config": "Cấu hình từ xa",
            "quota": "Tài khoản & hạn ngạch",
            "enrichment": "Làm giàu"
          },
          "flows": {
            "rows": "hàng kinh doanh",
            "rules": "quy tắc",
            "usage": "cách sử dụng",
            "websites": "trang web kinh doanh → email và mạng xã hội"
          }
        }
      },
      "install": {
        "head": {
          "kicker": "Cài đặt",
          "title": {
            "lead": "Cài đặt ",
            "accent": " MapsGrab ",
            "tail": ""
          },
          "lead": "Tải xuống ZIP tại đây và làm theo các bước cho trình duyệt của bạn. Chrome, Edge và Brave tải thư mục đã giải nén. Firefox sử dụng một tiện ích bổ sung tạm thời riêng biệt phải được tải lại sau khi khởi động lại. Nhấp vào bất kỳ hình ảnh nào để xem kích thước đầy đủ."
        },
        "zip": {
          "title": "Cài đặt trực tiếp (phát hành zip)",
          "description": "Chọn ZIP cho trình duyệt của bạn. Giải nén nó vào thư mục bạn giữ, sau đó tải nó theo hướng dẫn bên dưới. Để cập nhật, hãy tải xuống ZIP mới, thay thế các tệp trong thư mục đó và tải lại tiện ích mở rộng.",
          "button": "Chrome, Cạnh & Brave ZIP",
          "firefoxButton": "Firefox ZIP (tiện ích bổ sung tạm thời)",
          "meta": "Phiên bản {version} · phát hành trước"
        },
        "browserLabel": "Trình duyệt",
        "channels": [
          {
            "id": "chromium",
            "tab": "Chrome & Cạnh",
            "note": "Edge, Chrome, Brave và các trình duyệt Chromium khác",
            "steps": [
              {
                "title": "Tải về và giải nén",
                "description": [
                  "Tải xuống ",
                  {
                    "code": "mapsgrab.zip"
                  },
                  ". Trên Windows, nhấp chuột phải vào nó và chọn “Trích xuất tất cả”. Trên macOS, nhấp đúp vào nó. Giữ thư mục đã giải nén."
                ],
                "shot": "MapsGrab ZIP được tải xuống trong Chrome"
              },
              {
                "title": "Mở trang tiện ích mở rộng",
                "description": [
                  "Mở ",
                  {
                    "code": "chrome://extensions"
                  },
                  " trong Chrome, ",
                  {
                    "code": "edge://extensions"
                  },
                  " trong Edge, hoặc ",
                  {
                    "code": "brave://extensions"
                  },
                  " trong Brave."
                ],
                "shot": "Trang quản lý tiện ích mở rộng"
              },
              {
                "title": "Bật chế độ Nhà phát triển",
                "description": [
                  "Bật chế độ Nhà phát triển trên trang tiện ích mở rộng. Trong Chrome, nút chuyển ở trên cùng bên phải."
                ],
                "shot": "Đã bật chế độ nhà phát triển và hiển thị nút Tải đã giải nén"
              },
              {
                "title": "Tải thư mục đã giải nén",
                "description": [
                  "Nhấp vào “Tải đã giải nén” và chọn thư mục đã giải nén. MapsGrab xuất hiện trong danh sách tiện ích mở rộng. Mở tìm kiếm Google Maps để sử dụng nó."
                ],
                "shot": "Tải giải nén có thêm thẻ MapsGrab"
              }
            ]
          },
          {
            "id": "firefox",
            "tab": "Firefox",
            "note": "Tiện ích bổ sung tạm thời; tải lại sau khi khởi động lại Firefox",
            "steps": [
              {
                "title": "Tải về và giải nén",
                "description": [
                  "Tải xuống ",
                  {
                    "code": "mapsgrab-firefox.zip"
                  },
                  ". Trên Windows, nhấp chuột phải vào nó và chọn “Trích xuất tất cả”. Trên macOS, nhấp đúp vào nó. Giữ thư mục đã giải nén."
                ],
                "shot": "MapsGrab Firefox ZIP được tải xuống trong Firefox"
              },
              {
                "title": "Mở trang gỡ lỗi",
                "description": [
                  "Điều hướng đến ",
                  {
                    "code": "about:debugging"
                  },
                  ", sau đó chọn trình duyệt của bạn ở thanh bên trái."
                ],
                "shot": "Firefox trang gỡ lỗi với các điều khiển tiện ích bổ sung tạm thời"
              },
              {
                "title": "Tải tiện ích bổ sung",
                "description": [
                  "Nhấp vào “Tải tiện ích bổ sung tạm thời…” và chọn ",
                  {
                    "code": "manifest.json"
                  },
                  " bên trong thư mục đã giải nén. Tiện ích bổ sung tạm thời sẽ không tải khi Firefox khởi động lại; lặp lại bước này để tải lại."
                ],
                "shot": "MapsGrab được tải dưới dạng tiện ích mở rộng Firefox tạm thời với tập lệnh nền đang chạy"
              }
            ]
          }
        ],
        "help": {
          "title": "Sự cố cài đặt?",
          "description": "Gửi cho chúng tôi tên trình duyệt và những gì bạn đã thấy - chúng tôi sẽ giúp bạn bỏ chặn.",
          "cta": "Liên hệ hỗ trợ"
        },
        "notes": {
          "kicker": "Ghi chú phát hành",
          "version": "0.1.0",
          "status": "Phát hành trước",
          "date": "Tháng 8 2026",
          "items": [
            "Bản phát hành trước đầu tiên của tiện ích mở rộng MapsGrab",
            "Google Maps trích xuất tìm kiếm bằng cách cuộn tự động và lược đồ cột 36",
            "Đánh giá và trích xuất ảnh từ các trang kinh doanh",
            "Làm phong phú email và phương tiện truyền thông xã hội cho mỗi doanh nghiệp",
            "Từ khóa hàng loạt và đánh giá-URL nhiệm vụ với trạng thái nhiệm vụ trên đĩa",
            "CSV / JSON xuất với lựa chọn trường và Place ID chống trùng lặp",
            "Bản dựng cho Microsoft Edge và Firefox"
          ]
        }
      },
      "plans": {
        "head": {
          "kicker": "Kế hoạch mở rộng",
          "title": {
            "lead": "Một tiện ích mở rộng, ba gói ",
            "accent": " ",
            "tail": ""
          },
          "lead": "Mỗi hàng mà tiện ích mở rộng thu thập — một doanh nghiệp, một bài đánh giá hoặc một bức ảnh — được tính là một bản ghi. Tất cả các kế hoạch đều bao gồm đánh giá, hình ảnh và nhiệm vụ hàng loạt; gói trả phí xuất tất cả các cột 36, bao gồm email và nội dung phong phú trên mạng xã hội, với khối lượng hàng tháng lớn hơn."
        },
        "note": "Mức sử dụng hàng tháng được đặt lại vào ngày 1 trong thời gian New York; hồ sơ không sử dụng không cuộn qua.",
        "compare": "So sánh tất cả các kế hoạch"
      },
      "faq": {
        "kicker": "Câu hỏi thường gặp",
        "title": {
          "lead": "",
          "accent": "Câu hỏi thường gặp",
          "tail": ""
        },
        "lead": "Những câu trả lời ngắn gọn. Bất cứ điều gì khác, hỗ trợ chỉ cần một email.",
        "contact": "Liên hệ hỗ trợ",
        "items": [
          {
            "question": "Tiện ích mở rộng có miễn phí sử dụng không?",
            "answer": "Đúng. Tiện ích mở rộng hoạt động mà không cần tài khoản và bao gồm 1,000 bản ghi mỗi tháng. Các gói trả phí trên trang Định giá sẽ thêm tất cả các cột 36 với email và nội dung phong phú trên mạng xã hội, đồng thời tăng số lượng hàng tháng."
          },
          {
            "question": "Những trình duyệt nào được hỗ trợ?",
            "answer": "Chrome, Edge, Brave và các trình duyệt Chromium khác tải ZIP đã giải nén được tải xuống tại đây. Firefox có ZIP riêng để tải tạm thời; tải lại nó sau mỗi lần khởi động lại trình duyệt. Làm theo hướng dẫn cài đặt ở trên."
          },
          {
            "question": "Tôi có cần đăng nhập không?",
            "answer": "Không. Trích xuất lõi hoạt động mà không cần có tài khoản. Hạn ngạch được tính cho mỗi tài khoản đã đăng nhập hoặc trên mỗi thiết bị trình duyệt khi bạn chưa đăng nhập — hãy đăng nhập bằng tài khoản sở hữu gói để áp dụng khối lượng cao hơn."
          },
          {
            "question": "Những gì được coi là một kỷ lục?",
            "answer": "Mỗi hàng mà tiện ích mở rộng thu thập được tính là một bản ghi: một doanh nghiệp từ danh sách tìm kiếm hoặc đã lưu, một bài đánh giá hoặc một bức ảnh. Email và làm giàu xã hội không thêm hồ sơ."
          },
          {
            "question": "Điều gì xảy ra khi Google Maps thay đổi?",
            "answer": "Quy tắc trích xuất được cung cấp dưới dạng cấu hình từ xa, do đó, các bản sửa lỗi sẽ đến được bảng điều khiển mà không cần cài đặt lại tiện ích mở rộng. Nếu không thể đọc được một trang, bảng điều khiển sẽ hiển thị lỗi thay vì lỗi âm thầm."
          },
          {
            "question": "MapsGrab có thấy dữ liệu tôi thu thập không?",
            "answer": "Cài đặt và kết quả của bạn được lưu trữ cục bộ trong trình duyệt của bạn. Máy chủ của chúng tôi chỉ xử lý cấu hình từ xa, trạng thái tài khoản và hạn ngạch, email tùy chọn và nội dung phong phú trên mạng xã hội cũng như nhật ký sử dụng tối thiểu."
          },
          {
            "question": "Dữ liệu đến từ đâu và việc thu thập có hợp pháp không?",
            "answer": "MapsGrab chỉ thu thập thông tin được hiển thị công khai trên các trang Google Maps bạn truy cập — những thông tin tương tự mà bất kỳ khách truy cập nào cũng có thể đọc. Chúng tôi không truy cập các tài khoản riêng tư, nội dung bị kiểm soát hoặc dữ liệu không công khai."
          }
        ]
      },
      "cta": {
        "kicker": "Bắt đầu",
        "title": {
          "lead": "Lấy danh sách đầu tiên của bạn ",
          "accent": " ngay hôm nay ",
          "tail": ""
        },
        "lead": "Cài đặt tiện ích mở rộng, tìm kiếm Google Maps và xuất bảng tính sạch — không cần tài khoản.",
        "primary": "Cài đặt MapsGrab",
        "secondary": "So sánh các kế hoạch",
        "note": "Bao gồm hạn ngạch hàng tháng miễn phí. Không có thẻ tín dụng."
      }
    },
    "account": {
      "auth": {
        "eyebrow": "Truy cập trang web",
        "title": "Đăng nhập để đồng bộ hóa Tín dụng của bạn",
        "trigger": "Đăng nhập",
        "modalTitle": "Đăng nhập để tiếp tục",
        "closeLabel": "Đóng",
        "signedInAs": "Đã đăng nhập với tư cách",
        "continueWithGoogle": "Tiếp tục với Google",
        "googleLoading": "Đang mở Google...",
        "or": "hoặc",
        "emailLabel": "E-mail",
        "emailPlaceholder": "name@example.com",
        "continueWithEmail": "Tiếp tục với email",
        "sendCode": "Gửi mã",
        "sendingCode": "Đang gửi...",
        "sendCodeSuccess": "Mã xác minh đã được gửi.",
        "sendAgain": "Gửi lại",
        "codeLabel": "Mã xác minh",
        "codePlaceholder": "123456",
        "signIn": "Đăng nhập",
        "termsNotice": "Bằng cách đăng nhập, bạn đồng ý với",
        "termsLink": "Điều khoản",
        "privacyLink": "Chính sách bảo mật",
        "logout": "Đăng xuất",
        "creditsLabel": "Tín dụng",
        "enterEmailFirst": "Vui lòng nhập địa chỉ email của bạn trước tiên.",
        "enterEmailAndCode": "Vui lòng nhập cả email và mã xác minh.",
        "sendCodeFailed": "Không gửi được mã xác minh.",
        "googleSignInFailed": "Đăng nhập Google không thành công.",
        "googleClientMissing": "Đăng nhập Google chưa được định cấu hình.",
        "signInFailed": "Không thể đăng nhập."
      },
      "paypalReturn": {
        "providerLabel": "PayPal",
        "canceledTitle": "Đã hủy thanh toán",
        "canceledMessage": "Đơn đặt hàng này đã không được thanh toán. Bạn có thể đóng tab này và chọn lại phương thức thanh toán trong cửa sổ ban đầu.",
        "canceledMetaDescription": "Khoản thanh toán PayPal của bạn đã bị hủy.",
        "waitingTitle": "Đã gửi thanh toán",
        "waitingMessage": "Bạn có thể quay lại tab ban đầu. Chúng tôi đang kiểm tra xác nhận PayPal cứ sau 3 giây và kết quả sẽ tự động xuất hiện ở đây.",
        "confirmedCreditsTitle": "Đã thêm tín dụng",
        "confirmedCreditsMessage": "Khoản thanh toán PayPal của bạn đã được xác nhận và Tín dụng đã được thêm vào. Bạn có thể đóng tab này và tiếp tục trong cửa sổ ban đầu.",
        "confirmedSubscriptionTitle": "Đã kích hoạt đăng ký",
        "confirmedSubscriptionMessage": "Khoản thanh toán PayPal của bạn đã được xác nhận và gói MapsGrab của bạn đang hoạt động. Bạn có thể đóng tab này và tiếp tục trong cửa sổ ban đầu.",
        "failedTitle": "Thanh toán cần chú ý",
        "failedMessage": "Chúng tôi không thể tự động xác nhận đơn đặt hàng này. Quay lại cửa sổ ban đầu hoặc thử làm mới trạng thái thanh toán của bạn ở đó."
      },
      "checkin": {
        "accountButtonLabel": "Mở menu tài khoản",
        "accountMenuLabel": "Trình đơn tài khoản"
      },
      "creditPurchase": {
        "title": "Nhận thêm tín dụng",
        "description": "Thêm Tín dụng và tiếp tục sử dụng các tính năng trả phí trong không gian làm việc này.",
        "successTitle": "Đã thêm tín dụng",
        "successDescription": "Số dư của bạn đã được làm mới. Đóng cửa sổ này và tiếp tục.",
        "packageEyebrow": "Thanh toán khi bạn đi",
        "cardNote": "Sử dụng Tín dụng cho các tính năng trang web trả phí. Tín dụng không bao giờ hết hạn.",
        "creditsAmount": "Tín dụng {credits}",
        "buyNow": "Mua ngay",
        "selectPackage": "Lựa chọn",
        "paymentMethodLabel": "Chọn phương thức thanh toán",
        "paymentTitle": "Chọn phương thức thanh toán",
        "selectedPackageLabel": "Gói đã chọn",
        "confirmPurchase": "Tiếp tục thanh toán",
        "backToProducts": "Mặt sau",
        "close": "Đóng",
        "agreementText": "Tôi đồng ý với các điều khoản mua hàng, Điều khoản và Chính sách quyền riêng tư.",
        "loadingConfigs": "Đang tải các gói Tín dụng...",
        "loadFailed": "Không thể tải các gói Tín dụng. Vui lòng thử lại.",
        "noConfigs": "Hiện tại không có gói Tín dụng nào có sẵn. Vui lòng thử lại sau.",
        "ready": "Chọn gói Tín dụng. Giá được hiển thị bằng USD.",
        "creatingOrder": "Đang tạo đơn hàng...",
        "pendingPayment": "Hoàn tất thanh toán trong tab mới mở. Chúng tôi sẽ tự động kiểm tra kết quả.",
        "pendingPaymentTitle": "Đang chờ thanh toán",
        "cancelPayment": "Hủy thanh toán",
        "supportMailPrefix": "Báo cáo sự cố: ",
        "success": "Thanh toán hoàn tất. Tín dụng hiện có sẵn.",
        "failed": "Thanh toán chưa hoàn tất. Bạn có thể thử lại hoặc đóng cửa sổ này.",
        "successCredits": "+ Đã thêm tín dụng {credits}",
        "successBalance": "Số dư hiện tại: Tín dụng {balance}",
        "createFailed": "Không tạo được đơn hàng. Vui lòng thử lại.",
        "invalidPaymentData": "Liên kết thanh toán không hợp lệ. Vui lòng thử lại sau.",
        "priceUpdated": "Giá đã thay đổi. Xem lại giá mới nhất và mua lại.",
        "gatewayFailed": "Mục thanh toán tạm thời không có sẵn. Vui lòng thử lại sau.",
        "paymentCanceled": "Thanh toán đã bị hủy. Chọn phương thức thanh toán và thử lại.",
        "pollFailed": "Không thể làm mới trạng thái thanh toán. Vui lòng thử lại.",
        "pollTimeout": "Hết thời gian làm mới tự động. Sử dụng nút làm mới sau khi thanh toán.",
        "orderNotFound": "Đơn đặt hàng không còn nữa. Tạo một đơn đặt hàng mới.",
        "orderExpired": "Đơn hàng đã hết hạn. Hãy mua lại.",
        "fulfillmentFailed": "Đã nhận được thanh toán nhưng Tín dụng chưa được thêm vào. Vui lòng thử lại sau.",
        "authExpired": "Đăng nhập đã hết hạn. Đăng nhập lại để tiếp tục.",
        "popupBlocked": "Trình duyệt của bạn đã chặn cửa sổ mới. Cho phép MapsGrab mở cửa sổ bật lên và thử lại."
      }
    },
    "pricing": {
      "seo": {
        "title": "Định giá - Gói trực tuyến, tiện ích mở rộng và API | MapsGrab",
        "description": "MapsGrab lên kế hoạch cho mọi bề mặt: Trình quét trực tuyến từ trình duyệt $19, Tiện ích mở rộng từ $39, và API từ $15. Các bậc miễn phí đi kèm với mọi sản phẩm — gói một tháng tự nhiên trên Trực tuyến và API, đăng ký hàng tháng trên Tiện ích mở rộng."
      },
      "hero": {
        "kicker": "Định giá",
        "title": {
          "lead": "Lập kế hoạch cho ",
          "accent": " theo ba cách ",
          "tail": " để lấy dữ liệu Bản đồ"
        },
        "lead": "Chọn bề mặt phù hợp với quy trình làm việc của bạn — Cloud Trình thu thập trực tuyến, Tiện ích mở rộng trình duyệt hoặc HTTP API — sau đó chọn số lượng hàng tháng. Nâng cấp hoặc mua từ trang này trong vài phút.",
        "meta": [
          "Cấp miễn phí trên mỗi sản phẩm",
          "Thanh toán bằng PayPal",
          "Nâng cấp bằng cách trả tiền chênh lệch"
        ],
        "switchLabel": "Dòng sản phẩm"
      },
      "popularLabel": "Phổ biến nhất",
      "tabs": {
        "online": {
          "name": "Trình thu thập trực tuyến",
          "shortName": "Trực tuyến",
          "switchMeta": "Từ {price} · một lần",
          "unit": "hồ sơ",
          "eyebrow": "Kế hoạch Scraper trực tuyến",
          "title": "Khai thác đám mây, định giá theo hồ sơ",
          "description": "Chạy công cụ MapsGrab trên cơ sở hạ tầng của chúng tôi. Một bản ghi là một hàng kinh doanh được thu thập. Các gói trả phí bao gồm email tùy chọn và làm giàu phương tiện truyền thông xã hội mà không phải trả thêm phí kỷ lục.",
          "billingChips": [
            "Thanh toán một lần",
            "Bao gồm một tháng tự nhiên",
            "Không tự động gia hạn"
          ],
          "cards": [
            {
              "id": "free",
              "productId": null,
              "name": "Miễn phí",
              "tagline": "Hãy thử công cụ quét đám mây ở quy mô nhỏ",
              "price": "$0",
              "periodLabel": "mãi mãi",
              "quota": "Bản ghi 1,000/tháng",
              "features": [
                "Trích xuất doanh nghiệp với cột 37-cột CSV xuất",
                "Tối đa từ khóa 2 cho mỗi nhiệm vụ",
                "Chế độ bản đồ và vùng để tìm kiếm khu vực",
                "Email và làm giàu xã hội trên các gói trả phí",
                "Một CSV bị trùng lặp cho mỗi nhiệm vụ"
              ],
              "ctaLabel": "Bắt đầu miễn phí",
              "status": "free",
              "featured": false
            },
            {
              "id": "lite",
              "productId": "online_lite",
              "name": "Lite",
              "tagline": "Đối với trường hợp xuất dữ liệu một lần",
              "price": "$19",
              "periodLabel": "một lần · 1 tháng",
              "quota": "Bản ghi 20,000/tháng",
              "features": [
                "Mọi thứ đều miễn phí",
                "Bản ghi 20,000 cho tháng 1",
                "Thanh toán một lần - không tự động gia hạn",
                "Tối đa từ khóa 5 cho mỗi nhiệm vụ",
                "Email và hoạt động phong phú trên mạng xã hội, được bật theo mặc định và không bắt buộc"
              ],
              "ctaLabel": "Nhận Lite",
              "status": "buyable",
              "featured": false
            },
            {
              "id": "basic",
              "productId": "online_basic",
              "name": "Nền tảng",
              "tagline": "Để thu thập khách hàng tiềm năng ổn định hàng tuần",
              "price": "$49",
              "periodLabel": "một lần · 1 tháng",
              "quota": "Bản ghi 80,000/tháng",
              "features": [
                "Mọi thứ trong Lite",
                "Bản ghi 80,000 cho tháng 1",
                "Thanh toán một lần - không tự động gia hạn",
                "Tối đa từ khóa 10 cho mỗi nhiệm vụ"
              ],
              "ctaLabel": "Nhận cơ bản",
              "status": "buyable",
              "featured": true
            },
            {
              "id": "growth",
              "productId": "online_growth",
              "name": "Sự phát triển",
              "tagline": "Để phát triển đường ống dẫn chì",
              "price": "$99",
              "periodLabel": "một lần · 1 tháng",
              "quota": "Bản ghi 250,000/tháng",
              "features": [
                "Mọi thứ ở mức cơ bản",
                "Bản ghi 250,000 cho tháng 1",
                "Thanh toán một lần - không tự động gia hạn",
                "Tối đa từ khóa 20 cho mỗi nhiệm vụ"
              ],
              "ctaLabel": "Nhận tăng trưởng",
              "status": "buyable",
              "featured": false
            },
            {
              "id": "professional",
              "productId": "online_pro",
              "name": "Chuyên nghiệp",
              "tagline": "Dành cho các cơ quan và nhóm nặng về dữ liệu",
              "price": "$149",
              "periodLabel": "một lần · 1 tháng",
              "quota": "Bản ghi 500,000/tháng",
              "features": [
                "Mọi thứ đang tăng trưởng",
                "Bản ghi 500,000 cho tháng 1",
                "Thanh toán một lần - không tự động gia hạn",
                "Tối đa từ khóa 50 cho mỗi nhiệm vụ"
              ],
              "ctaLabel": "Trở nên chuyên nghiệp",
              "status": "buyable",
              "featured": false
            }
          ],
          "quotaNote": "Thanh toán một lần trong một tháng tự nhiên — các gói trên tab này không tự động gia hạn. Bản ghi là một hàng kinh doanh được thu thập từ Google Maps; việc đặt lại mức sử dụng trên 1st và các bản ghi không sử dụng sẽ không được chuyển đổi.",
          "compare": {
            "lead": "Các gói Scraper trực tuyến — trích xuất trên đám mây, được định giá theo hồ sơ.",
            "volume": "Kỷ lục mỗi tháng",
            "groups": [
              {
                "label": "dữ liệu",
                "rows": [
                  {
                    "label": "Trích xuất doanh nghiệp với cột 37-cột CSV xuất",
                    "cells": [
                      true,
                      true,
                      true,
                      true,
                      true
                    ]
                  },
                  {
                    "label": "Email và làm giàu xã hội",
                    "cells": [
                      false,
                      "Bật theo mặc định, tùy chọn",
                      "Bật theo mặc định, tùy chọn",
                      "Bật theo mặc định, tùy chọn",
                      "Bật theo mặc định, tùy chọn"
                    ]
                  }
                ]
              },
              {
                "label": "Quy trình làm việc",
                "rows": [
                  {
                    "label": "Từ khóa cho mỗi nhiệm vụ",
                    "cells": [
                      "2",
                      "5",
                      "10",
                      "20",
                      "50"
                    ]
                  },
                  {
                    "label": "Chế độ bản đồ và khu vực",
                    "cells": [
                      true,
                      true,
                      true,
                      true,
                      true
                    ]
                  },
                  {
                    "label": "Một CSV bị trùng lặp cho mỗi nhiệm vụ",
                    "cells": [
                      true,
                      true,
                      true,
                      true,
                      true
                    ]
                  }
                ]
              }
            ]
          },
          "checkout": {
            "usageNotice": "Áp dụng cho hạn ngạch bản ghi hàng tháng của MapsGrab Trình thu thập trực tuyến.",
            "successTitle": "Đã kích hoạt gói",
            "successDescription": "Gói 1 một tháng của bạn đã có hiệu lực. Công cụ quét trực tuyến sẽ chọn nó trong lần làm mới hạn ngạch tiếp theo."
          }
        },
        "extension": {
          "name": "Tiện ích",
          "shortName": "Tiện ích",
          "switchMeta": "Từ {price} · một lần",
          "unit": "hồ sơ",
          "eyebrow": "Kế hoạch mở rộng",
          "title": "Trích xuất trình duyệt, được định giá theo bản ghi",
          "description": "Mỗi hàng mà tiện ích mở rộng thu thập — một doanh nghiệp, một bài đánh giá hoặc một bức ảnh — được tính là một bản ghi. Tất cả các kế hoạch đều bao gồm đánh giá, hình ảnh và nhiệm vụ hàng loạt; gói trả phí xuất tất cả các cột 36, bao gồm email và nội dung phong phú trên mạng xã hội.",
          "billingChips": [
            "Thanh toán một lần",
            "1 tháng truy cập",
            "Không tự động gia hạn"
          ],
          "cards": [
            {
              "id": "free",
              "productId": null,
              "name": "Miễn phí",
              "tagline": "Khai thác lõi ở quy mô nhỏ",
              "price": "$0",
              "periodLabel": "mãi mãi",
              "quota": "Bản ghi 1,000/tháng",
              "features": [
                "Khai thác dữ liệu doanh nghiệp",
                "Đánh giá (cột 11) và ảnh URLs",
                "Từ khóa và đánh giá hàng loạt-Nhiệm vụ URL",
                "Xuất CSV / JSON với lựa chọn trường"
              ],
              "ctaLabel": "Cài đặt tiện ích mở rộng",
              "status": "free",
              "featured": false
            },
            {
              "id": "pro",
              "productId": "maps_extension_pro",
              "name": "Pro",
              "tagline": "Dành cho người làm việc tự do và các kênh dẫn đầu đang phát triển",
              "price": "$39",
              "periodLabel": "một lần · 1 tháng",
              "quota": "Bản ghi 100,000/tháng",
              "features": [
                "Mọi thứ đều miễn phí",
                "Bản ghi 100,000 mỗi tháng",
                "Trích xuất doanh nghiệp cột 36 đầy đủ",
                "Làm giàu email và phương tiện truyền thông xã hội"
              ],
              "ctaLabel": "Nhận chuyên nghiệp",
              "status": "buyable",
              "featured": true
            },
            {
              "id": "business",
              "productId": "maps_extension_business",
              "name": "Việc kinh doanh",
              "tagline": "Dành cho các cơ quan và nhóm nặng về dữ liệu",
              "price": "$99",
              "periodLabel": "một lần · 1 tháng",
              "quota": "Bản ghi 500,000/tháng",
              "features": [
                "Mọi thứ trong Pro",
                "Bản ghi 500,000 mỗi tháng",
                "Phòng cho các nhiệm vụ hàng loạt đa thị trường",
                "Cùng một quy trình xuất dữ liệu đầu tiên tại địa phương"
              ],
              "ctaLabel": "Nhận doanh nghiệp",
              "status": "buyable",
              "featured": false
            }
          ],
          "quotaNote": "Mỗi hàng mà tiện ích mở rộng thu thập được tính là một bản ghi: một doanh nghiệp từ danh sách tìm kiếm hoặc đã lưu, một bài đánh giá hoặc một bức ảnh. Email và làm giàu xã hội không thêm hồ sơ. Đặt lại mức sử dụng hàng tháng trên 1st; hồ sơ không sử dụng không cuộn qua.",
          "compare": {
            "lead": "Các gói mở rộng — trích xuất trình duyệt, được định giá theo hồ sơ.",
            "volume": "Kỷ lục mỗi tháng",
            "groups": [
              {
                "label": "dữ liệu",
                "rows": [
                  {
                    "label": "Khai thác dữ liệu doanh nghiệp",
                    "cells": [
                      true,
                      true,
                      true
                    ]
                  },
                  {
                    "label": "Trích xuất doanh nghiệp cột 36 đầy đủ",
                    "cells": [
                      false,
                      true,
                      true
                    ]
                  },
                  {
                    "label": "Đánh giá (cột 11) và ảnh URLs",
                    "cells": [
                      true,
                      true,
                      true
                    ]
                  },
                  {
                    "label": "Làm giàu email và phương tiện truyền thông xã hội",
                    "cells": [
                      false,
                      true,
                      true
                    ]
                  },
                  {
                    "label": "Từ khóa và đánh giá hàng loạt-Nhiệm vụ URL",
                    "cells": [
                      true,
                      true,
                      true
                    ]
                  }
                ]
              },
              {
                "label": "Xuất khẩu",
                "rows": [
                  {
                    "label": "Xuất CSV / JSON với lựa chọn trường",
                    "cells": [
                      true,
                      true,
                      true
                    ]
                  },
                  {
                    "label": "Đường ống xuất dữ liệu đầu tiên tại địa phương",
                    "cells": [
                      true,
                      true,
                      true
                    ]
                  }
                ]
              }
            ]
          },
          "checkout": {
            "usageNotice": "Áp dụng cho hạn ngạch hàng tháng của tiện ích mở rộng trình duyệt MapsGrab.",
            "successTitle": "Đã kích hoạt gói",
            "successDescription": "Gói 1 một tháng của bạn đã có hiệu lực. Tiện ích mở rộng sẽ nhận nó vào lần làm mới hạn ngạch tiếp theo."
          }
        },
        "api": {
          "name": "API & MCP",
          "shortName": "API & MCP",
          "switchMeta": "Từ {price} · một lần",
          "unit": "yêu cầu",
          "eyebrow": "Gói API",
          "title": "Quyền truy cập có lập trình, được định giá theo yêu cầu",
          "description": "Tìm kiếm các doanh nghiệp Google Maps và lấy đánh giá của họ từ các ứng dụng của riêng bạn qua HTTP API đơn giản. Mỗi cuộc gọi thành công được tính là một yêu cầu, ngay cả khi nó không trả về kết quả hoặc một phần dữ liệu.",
          "billingChips": [
            "Thanh toán một lần",
            "Bao gồm một tháng tự nhiên",
            "Không tự động gia hạn"
          ],
          "cards": [
            {
              "id": "free",
              "productId": null,
              "name": "Miễn phí",
              "tagline": "Đánh giá API ở quy mô nhỏ",
              "price": "$0",
              "periodLabel": "mãi mãi",
              "quota": "Yêu cầu 20 / tháng",
              "features": [
                "Tìm kiếm doanh nghiệp theo từ khóa và vị trí",
                "Đánh giá điểm cuối với tính năng sắp xếp và phân trang",
                "Phản hồi JSON",
                "Khóa API được liên kết với tài khoản của bạn",
                "Hỗ trợ cộng đồng"
              ],
              "ctaLabel": "Bắt đầu miễn phí",
              "status": "free",
              "featured": false
            },
            {
              "id": "basic",
              "productId": "api_basic",
              "name": "Nền tảng",
              "tagline": "Dành cho nguyên mẫu và tích hợp ánh sáng",
              "price": "$15",
              "periodLabel": "một lần · 1 tháng",
              "quota": "Yêu cầu 1,000 / tháng",
              "features": [
                "Mọi thứ đều miễn phí",
                "Yêu cầu 1,000 cho tháng 1",
                "Thanh toán một lần - không tự động gia hạn",
                "Phản hồi JSON"
              ],
              "ctaLabel": "Nhận cơ bản",
              "status": "buyable",
              "featured": false
            },
            {
              "id": "professional",
              "productId": "api_professional",
              "name": "Chuyên nghiệp",
              "tagline": "Để tích hợp sản xuất",
              "price": "$65",
              "periodLabel": "một lần · 1 tháng",
              "quota": "Yêu cầu 5,000 / tháng",
              "features": [
                "Mọi thứ ở mức cơ bản",
                "Yêu cầu 5,000 cho tháng 1",
                "Thanh toán một lần - không tự động gia hạn",
                "Phản hồi JSON"
              ],
              "ctaLabel": "Trở nên chuyên nghiệp",
              "status": "buyable",
              "featured": true
            },
            {
              "id": "business",
              "productId": "api_business",
              "name": "Việc kinh doanh",
              "tagline": "Đối với các sản phẩm được xây dựng trên dữ liệu MapsGrab",
              "price": "$115",
              "periodLabel": "một lần · 1 tháng",
              "quota": "Yêu cầu 10,000 / tháng",
              "features": [
                "Mọi thứ chuyên nghiệp",
                "Yêu cầu 10,000 cho tháng 1",
                "Thanh toán một lần - không tự động gia hạn",
                "Phản hồi JSON"
              ],
              "ctaLabel": "Nhận doanh nghiệp",
              "status": "buyable",
              "featured": false
            },
            {
              "id": "scale",
              "productId": "api_scale",
              "name": "Tỉ lệ",
              "tagline": "Đối với các hoạt động dữ liệu khối lượng lớn",
              "price": "$365",
              "periodLabel": "một lần · 1 tháng",
              "quota": "Yêu cầu 50,000 / tháng",
              "features": [
                "Mọi thứ trong kinh doanh",
                "Yêu cầu 50,000 cho tháng 1",
                "Thanh toán một lần - không tự động gia hạn",
                "Phản hồi JSON"
              ],
              "ctaLabel": "Nhận quy mô",
              "status": "buyable",
              "featured": false
            }
          ],
          "quotaNote": "Thanh toán một lần trong một tháng tự nhiên — các gói trên tab này không tự động gia hạn. Mỗi cuộc gọi API hoặc MCP thành công được tính là một yêu cầu, bao gồm cả kết quả trống và một phần; cuộc gọi thất bại không được tính. Việc đặt lại mức sử dụng trên 1st và các yêu cầu không sử dụng sẽ không được chuyển tiếp.",
          "compare": {
            "lead": "Gói API — quyền truy cập theo chương trình, được định giá theo yêu cầu.",
            "volume": "Yêu cầu mỗi tháng",
            "groups": [
              {
                "label": "Điểm cuối",
                "rows": [
                  {
                    "label": "Tìm kiếm doanh nghiệp theo từ khóa và vị trí",
                    "cells": [
                      true,
                      true,
                      true,
                      true,
                      true
                    ]
                  },
                  {
                    "label": "Đánh giá điểm cuối với tính năng sắp xếp và phân trang",
                    "cells": [
                      true,
                      true,
                      true,
                      true,
                      true
                    ]
                  },
                  {
                    "label": "Phản hồi JSON",
                    "cells": [
                      true,
                      true,
                      true,
                      true,
                      true
                    ]
                  },
                  {
                    "label": "Máy chủ MCP có cùng khóa API",
                    "cells": [
                      true,
                      true,
                      true,
                      true,
                      true
                    ]
                  }
                ]
              },
              {
                "label": "Truy cập",
                "rows": [
                  {
                    "label": "Khóa API được liên kết với tài khoản của bạn",
                    "cells": [
                      true,
                      true,
                      true,
                      true,
                      true
                    ]
                  },
                  {
                    "label": "Hỗ trợ cộng đồng",
                    "cells": [
                      true,
                      true,
                      true,
                      true,
                      true
                    ]
                  }
                ]
              }
            ]
          },
          "checkout": {
            "usageNotice": "Áp dụng cho hạn ngạch yêu cầu hàng tháng MapsGrab API.",
            "successTitle": "Đã kích hoạt gói",
            "successDescription": "Gói 1 một tháng của bạn đã có hiệu lực. Khóa API của bạn sẽ nhận hạn ngạch mới cho yêu cầu tiếp theo."
          }
        }
      },
      "plansSection": {
        "label": "kế hoạch",
        "finder": {
          "label": "Bạn cần bao nhiêu {unit} một tháng?",
          "result": "{value} {unit}",
          "valueText": "{value} {unit} một tháng — gói {plan}",
          "fits": "Phù hợp"
        }
      },
      "compare": {
        "kicker": "So sánh",
        "title": {
          "lead": "Mọi kế hoạch, ",
          "accent": " sát cánh bên nhau ",
          "tail": ""
        },
        "plan": "Kế hoạch",
        "volumeGroup": "Khối lượng & thanh toán",
        "billing": "Thanh toán",
        "included": "Bao gồm",
        "notIncluded": "Không bao gồm",
        "allPlans": "Có trong mọi gói"
      },
      "usage": {
        "head": {
          "kicker": "Cách sử dụng",
          "title": {
            "lead": "Những gì được tính vào hạn ngạch ",
            "accent": " của bạn ",
            "tail": ""
          },
          "lead": "Hai đơn vị: bản ghi cho tiện ích mở rộng và Trình quét trực tuyến, yêu cầu cho API — và cả hai đều được đặt lại trên 1st hàng tháng."
        },
        "records": {
          "meter": "Hồ sơ được sử dụng trong tháng này",
          "badge": "Gia hạn · Trực tuyến",
          "title": "Bản ghi 1 = hàng được thu thập 1",
          "body": "Mỗi hàng bạn thu thập được tính là một bản ghi: một doanh nghiệp trên Công cụ thu thập trực tuyến; một doanh nghiệp, một bài đánh giá hoặc một bức ảnh trong tiện ích mở rộng. Email và làm giàu xã hội không thêm hồ sơ.",
          "count": "+Bản ghi 1",
          "attachments": [
            "Điện thoại và trang web",
            "Giờ mở cửa",
            "Email & mạng xã hội"
          ]
        },
        "requests": {
          "meter": "Các yêu cầu đã sử dụng trong tháng này",
          "badge": "API · MCP",
          "title": "Yêu cầu 1 = 1 cuộc gọi thành công",
          "body": "Một yêu cầu là một lệnh gọi API thành công, ngay cả khi nó không trả về kết quả hoặc một phần dữ liệu; cuộc gọi thất bại không được tính. Các lệnh gọi công cụ MCP dựa trên cùng một hạn ngạch yêu cầu.",
          "counted": "Cuộc gọi thành công — được tính",
          "notCounted": "Cuộc gọi không thành công - không được tính"
        },
        "reset": {
          "title": "Đặt lại trên 1st",
          "body": "Việc đặt lại mức sử dụng trên 1st hàng tháng. Các bản ghi và yêu cầu không sử dụng sẽ không được chuyển đổi.",
          "limit": "Giới hạn gói",
          "unused": "Chưa sử dụng · không lăn",
          "flag": "Cài lại"
        }
      },
      "billing": {
        "head": {
          "kicker": "Thanh toán",
          "title": {
            "lead": "Thanh toán đơn giản, ",
            "accent": " không có gì ngạc nhiên ",
            "tail": ""
          },
          "lead": "Cách thanh toán, gia hạn và nâng cấp hoạt động trên ba dòng sản phẩm."
        },
        "items": {
          "channels": {
            "title": "PayPal",
            "body": "Thanh toán cho bất kỳ gói nào thông qua PayPal. Hoàn tất thanh toán của bạn trên PayPal và quay lại đây để kích hoạt gói của bạn."
          },
          "cadence": {
            "title": "Thanh toán một lần",
            "body": "Mỗi gói trả phí bao gồm một tháng tự nhiên. Thanh toán một lần mà không bị tính phí tự động; mua lại khi bạn cần một tháng nữa."
          },
          "upgrade": {
            "title": "Nâng cấp bằng cách trả tiền chênh lệch",
            "body": "Chuyển gói đang hoạt động sang cấp cao hơn đủ điều kiện thông qua nhà cung cấp thanh toán hiện tại của bạn. Ngày hết hạn và cách sử dụng của bạn cho đến nay vẫn không thay đổi."
          },
          "independent": {
            "title": "Kế hoạch độc lập",
            "body": "Các kế hoạch trên các tab khác nhau là độc lập. Khi gói hết hạn, tài khoản sẽ tự động trở về cấp miễn phí."
          }
        }
      },
      "plans": {
        "loading": "Đang tải các tùy chọn thanh toán...",
        "loadFailed": "Không thể tải các tùy chọn thanh toán. Hãy làm mới trang để thử lại.",
        "noChannels": "Hiện tại không có phương thức thanh toán nào cho gói này.",
        "productTitlePrefix": "MapsGrab",
        "failedTitle": "Thanh toán chưa hoàn tất",
        "billingPeriodMonthly": "1 tháng",
        "billingAutoRenew": "Tự động gia hạn cho đến khi bị hủy",
        "billingOneTime": "Thanh toán một lần"
      },
      "upgrade": {
        "currentPlan": "Gói hiện tại",
        "button": "Nâng cấp · {amount}",
        "title": "Nâng cấp kế hoạch của bạn",
        "confirm": "Xác nhận nâng cấp",
        "oneTime": "Chênh lệch một lần qua {channel}. Ngày hết hạn của bạn vẫn là {date}.",
        "autoRenew": "Khoản chênh lệch sẽ được tính ngay qua {channel}. Ngày hết hạn của bạn vẫn là {date}; những lần gia hạn trong tương lai sẽ sử dụng giá gói mới.",
        "pendingTitle": "Đang chờ nâng cấp của bạn",
        "pendingDescription": "Nhà cung cấp dịch vụ thanh toán của bạn đang áp dụng bản nâng cấp. Gói hiện tại của bạn vẫn hoạt động cho đến khi được xác nhận.",
        "successTitle": "Đã nâng cấp gói",
        "successDescription": "Hạn ngạch mới của bạn đang hoạt động. Ngày hết hạn của bạn vẫn là {date}.",
        "quoteFailed": "Không thể tải giá nâng cấp của bạn. Hãy làm mới trang để thử lại.",
        "failed": "Không thể xác nhận nâng cấp của bạn. Hãy làm mới trang để kiểm tra gói của bạn trước khi thử lại.",
        "reasons": {
          "no_active_subscription": "Kế hoạch của bạn không còn hoạt động. Làm mới trang để chọn một kế hoạch.",
          "not_higher_tier": "Chọn cấp cao hơn để nâng cấp hoặc đợi cho đến khi gói của bạn hết hạn rồi mới thay đổi cấp.",
          "non_positive_diff": "Giá trị gói còn lại của bạn không thấp hơn cấp này. Bạn có thể thay đổi cấp độ sau khi gói của bạn hết hạn.",
          "channel_unavailable": "Việc nâng cấp không khả dụng với phương thức thanh toán hiện tại của bạn. Bạn có thể thay đổi gói sau khi hết hạn."
        }
      },
      "faq": {
        "kicker": "Câu hỏi thường gặp",
        "title": {
          "lead": "",
          "accent": "Câu hỏi thường gặp",
          "tail": ""
        },
        "lead": "Những điều cơ bản về thanh toán. Bất cứ điều gì khác, hỗ trợ chỉ cần một email.",
        "contact": "Liên hệ hỗ trợ",
        "items": [
          {
            "question": "Những gì được coi là một kỷ lục?",
            "answer": "Một bản ghi là một hàng được thu thập — cùng đơn vị tính với các gói miễn phí. Trên Trình thu thập dữ liệu trực tuyến đó là một doanh nghiệp; trong tiện ích mở rộng, mỗi doanh nghiệp, bài đánh giá hoặc ảnh mà nó thu thập là một bản ghi. Email và làm giàu xã hội không thêm hồ sơ. Thay vào đó, trên tab API, việc sử dụng được tính vào các yêu cầu thành công."
          },
          {
            "question": "Tôi có cần gói trả phí để dùng thử MapsGrab không?",
            "answer": "Không. Mọi sản phẩm đều có cấp độ miễn phí không giới hạn thời gian: Công cụ quét trực tuyến và tiện ích mở rộng bao gồm các bản ghi 1,000 mỗi tháng và API bao gồm các yêu cầu 20 mỗi tháng. Các gói miễn phí của Trình quét trực tuyến và tiện ích mở rộng không bao gồm email hoặc nội dung phong phú trên mạng xã hội. Các gói Trực tuyến trả phí bao gồm nó theo mặc định và bạn có thể tắt nó cho từng tác vụ."
          },
          {
            "question": "Hạn ngạch áp dụng cho tài khoản của tôi như thế nào?",
            "answer": "Hạn ngạch được tính cho mỗi tài khoản đã đăng nhập (và mỗi thiết bị trình duyệt dành cho tiện ích mở rộng khi bạn chưa đăng nhập). Đăng nhập bằng tài khoản sở hữu gói để áp dụng mức trần cao hơn. Khi gói hết hạn, tài khoản sẽ tự động trở về cấp miễn phí."
          },
          {
            "question": "Gói của tôi có tự động gia hạn không?",
            "answer": "Không. Tất cả các gói đều là khoản thanh toán PayPal một lần trong một tháng tự nhiên. Khi gói của bạn hết hạn, bạn sẽ quay trở lại cấp độ miễn phí. Mua lại để tiếp tục với gói trả phí."
          },
          {
            "question": "Tôi có thể chuyển đổi giữa các tầng không?",
            "answer": "Bạn có thể nâng cấp gói đang hoạt động lên cấp cao hơn đủ điều kiện bằng cách thanh toán phần chênh lệch thông qua PayPal. Ngày hết hạn và cách sử dụng của bạn cho đến nay vẫn không thay đổi. Các kế hoạch trên các tab khác nhau là độc lập."
          }
        ]
      },
      "cta": {
        "kicker": "Bắt đầu",
        "title": {
          "lead": "Bắt đầu trên ",
          "accent": " bậc miễn phí ",
          "tail": ""
        },
        "lead": "Mỗi sản phẩm đều có cấp độ miễn phí không giới hạn thời gian — 1,000 ghi lại một tháng trên tiện ích mở rộng và Công cụ quét trực tuyến, 20 yêu cầu một tháng trên API.",
        "primary": "Cài đặt tiện ích mở rộng",
        "secondary": "Hãy dùng thử Công cụ thu thập dữ liệu trực tuyến",
        "note": "Bao gồm hạn ngạch hàng tháng miễn phí. Không có thẻ tín dụng."
      }
    },
    "extensionLogin": {
      "title": "Đăng nhập tiện ích | MapsGrab",
      "description": "Đăng nhập để kết nối phiên trang web MapsGrab của bạn với tiện ích mở rộng trình duyệt.",
      "eyebrow": "Tiện ích mở rộng trình duyệt",
      "heading": "Đăng nhập tiện ích mở rộng",
      "checkingState": "Kiểm tra",
      "signInRequiredState": "Yêu cầu đăng nhập",
      "confirmState": "Xác nhận tài khoản",
      "errorState": "Lỗi",
      "preparingTitle": "Đang chuẩn bị đăng nhập của bạn",
      "preparingText": "Đang thiết lập cầu đăng nhập tiện ích mở rộng.",
      "invalidParamsTitle": "Liên kết đăng nhập không hợp lệ",
      "invalidParamsText": "Liên kết đăng nhập này thiếu các tham số bảo mật bắt buộc. Vui lòng bắt đầu đăng nhập lại từ tiện ích mở rộng.",
      "checkingSessionTitle": "Kiểm tra phiên của bạn",
      "checkingSessionText": "Đang xác minh phiên trang web hiện tại của bạn.",
      "finishingGoogleTitle": "Hoàn tất đăng nhập Google",
      "finishingGoogleText": "Trao đổi ủy quyền Google của bạn để lấy phiên trang web.",
      "signInRequiredTitle": "Đăng nhập để tiếp tục",
      "signInRequiredText": "Đăng nhập để kết nối phiên trang web của bạn với tiện ích mở rộng.",
      "signInButtonLabel": "Đăng nhập",
      "confirmTitle": "Xác nhận tài khoản của bạn",
      "confirmText": "Tiện ích mở rộng đang yêu cầu đăng nhập bằng tài khoản bên dưới. Chỉ tiếp tục nếu bạn mới bắt đầu đăng nhập từ tiện ích mở rộng.",
      "continueButtonLabel": "Tiếp tục",
      "useAnotherAccountLabel": "Sử dụng tài khoản khác",
      "issuingTitle": "Hoàn tất đăng nhập",
      "issuingText": "Cấp mã đăng nhập một lần cho tiện ích mở rộng.",
      "issueFailedTitle": "Đã xảy ra lỗi",
      "retryButtonLabel": "Thử lại",
      "verificationFailedPrefix": "Xác minh mã thông báo trang web không thành công",
      "issueFailedPrefix": "Yêu cầu mã đăng nhập tiện ích mở rộng không thành công",
      "googleSignInFailedPrefix": "Đăng nhập Google không thành công",
      "googleCompletionFailedPrefix": "Không thể hoàn tất đăng nhập Google"
    },
    "online": {
      "seo": {
        "title": "Trình thu thập dữ liệu Google Maps trực tuyến — Chạy trích xuất trên đám mây | MapsGrab",
        "description": "Chạy tìm kiếm từ khóa Google Maps trên đám mây, thu thập dữ liệu kinh doanh và tải xuống một CSV cho mỗi tác vụ."
      },
      "hero": {
        "announce": {
          "badge": "Chế độ 3",
          "text": "Từ khóa, một khu vực bản đồ hoặc toàn bộ khu vực"
        },
        "title": {
          "lead": "Trích xuất Google Maps ",
          "accent": " trên đám mây, ",
          "tail": " không cài đặt"
        },
        "lead": "Gửi từ khóa, thu thập thông tin chi tiết về doanh nghiệp trên đám mây và tải xuống một CSV cho mỗi nhiệm vụ từ trang tổng quan của bạn.",
        "primaryCta": "Bắt đầu thu thập",
        "pricingCta": "Xem giá",
        "meta": [
          "1,000 hồ sơ miễn phí / tháng",
          "Hoạt động trong mọi trình duyệt",
          "Một CSV bị trùng lặp cho mỗi nhiệm vụ"
        ],
        "theater": {
          "files": "1 CSV · Đã lưu vào phần tải xuống",
          "csv": "CSV",
          "processed": "Đã xử lý",
          "parallelChip": {
            "label": "Từ khóa chạy",
            "value": "Song song"
          },
          "billingChip": {
            "label": "Thanh toán bởi",
            "value": "Hàng đã gửi"
          }
        }
      },
      "facts": {
        "caption": "Sơ lược về Công cụ quét trực tuyến",
        "items": [
          {
            "value": 37,
            "label": "các cột công khai, bao gồm số hàng liên tục"
          },
          {
            "value": 6,
            "label": "cột hồ sơ xã hội trên gói trả phí"
          },
          {
            "value": 50,
            "label": "tìm kiếm vị trí cho mỗi tác vụ ở chế độ bản đồ"
          },
          {
            "value": 60,
            "suffix": " phút",
            "label": "cửa sổ thu thập cho mỗi nhiệm vụ"
          },
          {
            "value": 1000,
            "label": "hồ sơ miễn phí mỗi tháng"
          }
        ]
      },
      "flow": {
        "head": {
          "kicker": "Nó hoạt động như thế nào",
          "title": {
            "lead": "Từ bản xem trước nhanh đến ",
            "accent": " xuất đầy đủ ",
            "tail": ""
          },
          "lead": "Hãy thử một từ khóa trên trang chủ mà không cần có tài khoản. Khi bạn muốn có toàn bộ danh sách, hãy đăng nhập và chạy nó như một tác vụ trong Trang tổng quan của bạn."
        },
        "steps": [
          {
            "title": "Xem trước trên trang chủ",
            "description": "Một từ khóa, không có tài khoản. Xem có bao nhiêu doanh nghiệp trên trang kết quả đầu tiên, với các hàng 3 đầu tiên."
          },
          {
            "title": "Đăng nhập",
            "description": "Bản xem trước không được lưu và không bao giờ sử dụng hạn ngạch của bạn. Sau khi đăng nhập, bạn gửi lại từ khóa."
          },
          {
            "title": "Tạo nhiệm vụ",
            "description": "Trong Bảng điều khiển > Công cụ quét trực tuyến, nhập một từ khóa trên mỗi dòng — hoặc để một khu vực bản đồ hoặc các vùng xây dựng danh sách."
          },
          {
            "title": "Từ khóa chạy song song",
            "description": "Thực hiện theo các trạng thái xếp hàng, thu thập và chuẩn bị CSV, sau đó hoàn thành, thành công một phần hoặc thất bại. Các tác vụ đang hoạt động làm mới mỗi giây 5."
          },
          {
            "title": "Tải xuống",
            "description": "Tải xuống một CSV cho toàn bộ tác vụ khi có sẵn tệp. Thành công một phần sẽ tiếp tục phân phối các hàng; không có kết quả không có tập tin."
          }
        ],
        "lock": "Đăng nhập để có danh sách đầy đủ",
        "email": "you@company.com",
        "links": {
          "preview": "Hãy thử xem trước trang chủ",
          "dashboard": "Mở Bảng điều khiển > Công cụ quét trực tuyến"
        }
      },
      "modes": {
        "head": {
          "kicker": "Chế độ tìm kiếm",
          "title": {
            "lead": "Ba cách để nói ",
            "accent": " tìm ",
            "tail": " ở đâu"
          },
          "lead": "Nhập từ khóa theo từng dòng, lấy mẫu khu vực bản đồ xung quanh điểm trung tâm hoặc chuyển các quốc gia, tiểu bang và thành phố thành các truy vấn được tạo sẵn."
        },
        "tabsLabel": "Chế độ tìm kiếm",
        "notes": {
          "keywords": "Một từ khóa trên mỗi dòng, tối đa giới hạn kế hoạch của bạn",
          "map": "Lấy mẫu một vòng tròn xung quanh một điểm trung tâm",
          "regions": "Quốc gia, tiểu bang và thành phố từ GeoNames"
        },
        "keywords": {
          "hint": "Một từ khóa trên mỗi dòng. Các dòng trống và các dòng trùng lặp sẽ bị loại bỏ trước khi đếm và toàn bộ tác vụ sẽ tạo ra một CSV bị trùng lặp.",
          "blank": "Dòng trống · bỏ qua",
          "duplicate": "Trùng lặp · bỏ qua",
          "limitsTitle": "Từ khóa cho mỗi nhiệm vụ",
          "limitsCaption": "bởi kế hoạch trực tuyến",
          "limitsHint": "Bắt đầu thu thập vẫn bị vô hiệu hóa khi danh sách trống, vượt quá giới hạn gói của bạn hoặc hạn ngạch hàng tháng của bạn đã được sử dụng hết."
        },
        "map": {
          "formula": "Từ khóa {keywords} × Điểm lưới {points}",
          "scale": "{value} km",
          "facts": [
            "Điểm được tìm kiếm từ trung tâm ra ngoài.",
            "Vòng tròn chỉ đặt các trung tâm tìm kiếm - kết quả không được cắt bớt vào đó.",
            "Một doanh nghiệp được tìm thấy qua các từ khóa hoặc điểm sẽ được lưu giữ một lần trong nhiệm vụ."
          ]
        },
        "regions": {
          "hint": "Bạn có thể chỉnh sửa các truy vấn được tạo trước khi gửi. Mỗi cái được tính là một từ khóa.",
          "addCity": "Thêm thành phố"
        }
      },
      "results": {
        "head": {
          "kicker": "Kết quả",
          "title": {
            "lead": "Một nhiệm vụ, ",
            "accent": " một CSV ",
            "tail": ""
          },
          "lead": "Tải xuống các cột công khai 37 trong một CSV cho toàn bộ tác vụ, với số hàng liên tục và doanh nghiệp được loại bỏ trùng lặp trong các tìm kiếm."
        },
        "csvMeta": "1 CSV · {count} đã giao hàng",
        "rows": "{count} hàng",
        "searches": "Hàng được phân phối theo tìm kiếm",
        "notes": [
          "Hàng 1 chứa các tên cột tiếng Anh cố định, bao gồm cả cột # liên tục.",
          "Hàng 2 mô tả từng cột bằng ngôn ngữ giao diện được sử dụng khi tạo tác vụ.",
          "Nhiệm vụ đã hoàn thành không có kết quả và không có tệp. Thành công một phần sẽ tiếp tục phân phối hàng.",
          "Hàng nhãn không bao giờ được tính vào bản ghi của bạn."
        ],
        "language": "Ngôn ngữ tác vụ: tiếng Việt",
        "rowLabel": "Hàng ngang",
        "legend": {
          "fields": "Hàng 1 · tên trường",
          "labels": "Hàng 2 · ngôn ngữ tác vụ",
          "data": "Hàng 3+ · doanh nghiệp"
        },
        "more": "+{count} thêm cột",
        "csvLabels": {
          "#": "số hàng",
          "Name": "Tên doanh nghiệp",
          "Fulladdress": "Địa chỉ đầy đủ",
          "Categories": "Danh mục kinh doanh",
          "Phone": "Điện thoại chính",
          "Review Count": "Số lượng đánh giá",
          "Average Rating": "Đánh giá trung bình",
          "Website": "Trang web kinh doanh",
          "Emails": "Email trang web công cộng",
          "Search Keyword": "Từ khóa tìm kiếm"
        }
      },
      "features": {
        "head": {
          "kicker": "Khả năng",
          "title": {
            "lead": "Trình thu thập dữ liệu trực tuyến ",
            "accent": " làm gì ",
            "tail": ""
          },
          "lead": "Thông tin chi tiết về doanh nghiệp được thu thập trên đám mây, với các email và hồ sơ xã hội tùy chọn trên các gói trả phí."
        },
        "items": [
          {
            "id": "keywords",
            "title": "Nhiệm vụ từ khóa",
            "description": "Gửi loại hình doanh nghiệp và vị trí dưới dạng từ khóa riêng biệt. Kế hoạch của bạn xác định giới hạn từ khóa và hạn ngạch hồ sơ hàng tháng.",
            "meta": "2 · 5 · 10 · 20 · 50 từ khóa cho mỗi nhiệm vụ"
          },
          {
            "id": "history",
            "title": "Lịch sử nhiệm vụ",
            "description": "Theo dõi tiến độ nhiệm vụ và xem số lượng bản ghi cho từng từ khóa trong trang tổng quan của bạn.",
            "meta": "Đã hoàn thành · Thành công một phần · Thất bại"
          },
          {
            "id": "details",
            "title": "Chi tiết doanh nghiệp",
            "description": "Thu thập tên, địa chỉ, số điện thoại, trang web, xếp hạng, giờ, tọa độ và số nhận dạng địa điểm khi có sẵn.",
            "meta": "Cột công khai 37 cho mỗi doanh nghiệp"
          },
          {
            "id": "enrichment",
            "title": "Email và làm giàu xã hội",
            "description": "Với gói Trực tuyến trả phí, các trang web doanh nghiệp được kiểm tra địa chỉ email và hồ sơ mạng xã hội theo mặc định. Bạn có thể tắt tính năng này cho từng tác vụ.",
            "meta": "Gói trả phí · bật theo mặc định"
          },
          {
            "id": "downloads",
            "title": "Một nhiệm vụ CSV",
            "description": "Tải xuống toàn bộ tác vụ dưới dạng một CSV khi có sẵn tệp. Không cần tập tin cho mỗi lần tìm kiếm.",
            "meta": "{job}.csv · Cột 37"
          },
          {
            "id": "browser",
            "title": "Không có gì để cài đặt",
            "description": "Chạy trên đám mây từ bất kỳ trình duyệt nào — Edge, Firefox hoặc bất kỳ trình duyệt nào khác. Tải xuống kết quả từ lịch sử nhiệm vụ của bạn.",
            "meta": "Edge · Firefox · mọi trình duyệt"
          }
        ]
      },
      "usage": {
        "head": {
          "kicker": "Cách sử dụng",
          "title": {
            "lead": "Tính phí theo hàng ",
            "accent": " bạn thực sự nhận được ",
            "tail": ""
          },
          "lead": "Nhiệm vụ trực tuyến được tính theo hàng doanh nghiệp đã phân phối sau khi nhiệm vụ hoàn thành. Không có gì được đặt sang một bên khi bạn gửi và hàng nhãn trong mỗi CSV không bao giờ được tính."
        },
        "checks": [
          "Việc gửi một nhiệm vụ không giữ lại gì từ hạn ngạch của bạn",
          "Một tác vụ đang chạy sẽ kết thúc, thậm chí vượt quá hạn mức còn lại của bạn",
          "Sau khi sử dụng hết hạn ngạch, bạn không thể gửi nhiệm vụ mới",
          "Việc đặt lại mức sử dụng trên 1st sau New York; hồ sơ không sử dụng không được cuộn lại"
        ],
        "mock": {
          "recordsLabel": "Kỷ lục tháng này",
          "left": "{count} còn lại",
          "exhausted": "Hết hạn ngạch",
          "task": "Nhiệm vụ {id}…",
          "pending": "Đã gửi cho đến nay · được tính khi nhiệm vụ hoàn thành",
          "counted": "Tính vào tháng này",
          "rows": "{count} hàng",
          "running": "Đang chạy",
          "delta": "+Bản ghi {count}"
        }
      },
      "plans": {
        "head": {
          "kicker": "Kế hoạch Scraper trực tuyến",
          "title": {
            "lead": "Trích xuất đám mây, ",
            "accent": " được định giá theo bản ghi ",
            "tail": ""
          },
          "lead": "Chạy công cụ MapsGrab trên cơ sở hạ tầng của chúng tôi. Một bản ghi là một hàng kinh doanh được phân phối; gói trả phí bao gồm email và làm giàu xã hội mà không phải trả thêm phí kỷ lục."
        },
        "specs": {
          "keywords": "Từ khóa cho mỗi nhiệm vụ",
          "contacts": "Email & mạng xã hội",
          "included": "Bật theo mặc định",
          "excluded": "Không bao gồm"
        },
        "note": "Thanh toán một lần trong một tháng tự nhiên — Các gói trực tuyến không tự động gia hạn. Việc đặt lại mức sử dụng trên 1st trong thời gian New York và các bản ghi không sử dụng sẽ không được chuyển đổi.",
        "compare": "So sánh tất cả các kế hoạch"
      },
      "faq": {
        "kicker": "Câu hỏi thường gặp",
        "title": {
          "lead": "",
          "accent": "Câu hỏi thường gặp",
          "tail": ""
        },
        "lead": "Những câu trả lời ngắn gọn. Bất cứ điều gì khác, hỗ trợ chỉ cần một email.",
        "contact": "Liên hệ hỗ trợ",
        "items": [
          {
            "question": "Công cụ quét trực tuyến khác với tiện ích mở rộng như thế nào?",
            "answer": "Tiện ích mở rộng thu thập dữ liệu trong trình duyệt của bạn. Công cụ quét trực tuyến chạy các tác vụ từ khóa trên đám mây và cung cấp kết quả cho trang tổng quan của bạn."
          },
          {
            "question": "Dữ liệu đến từ đâu và việc thu thập có hợp pháp không?",
            "answer": "MapsGrab chỉ thu thập thông tin được hiển thị công khai trên Google Maps — thông tin tương tự mà bất kỳ khách truy cập nào cũng có thể đọc được. Chúng tôi không truy cập các tài khoản riêng tư, nội dung bị kiểm soát hoặc dữ liệu không công khai."
          },
          {
            "question": "Tôi có thể xuất sang những định dạng nào?",
            "answer": "Các tác vụ có kết quả cung cấp một UTF-8 CSV với các cột công khai 37, số hàng liên tục và hai hàng tiêu đề. Các doanh nghiệp được loại bỏ trùng lặp trên tất cả các tìm kiếm. Nhiệm vụ không có kết quả không có tập tin."
          },
          {
            "question": "Nó có giá bao nhiêu?",
            "answer": "Công cụ quét trực tuyến tuân theo các gói MapsGrab trên trang Định giá, bao gồm cả hạn ngạch hồ sơ miễn phí hàng tháng. Các gói trả phí sẽ tăng giới hạn khi bạn cần nhiều hơn."
          },
          {
            "question": "Tôi có cần gói trả phí cho email và hồ sơ mạng xã hội không?",
            "answer": "Trực tuyến Miễn phí không bao gồm email hoặc nội dung phong phú trên mạng xã hội. Các gói Trực tuyến trả phí bao gồm nó theo mặc định và bạn có thể tắt nó cho từng tác vụ. Sự lựa chọn được cố định sau khi nhiệm vụ được gửi."
          },
          {
            "question": "Một tác vụ có thể chạy trong bao lâu?",
            "answer": "Mỗi nhiệm vụ có một cửa sổ thu thập phút 60. Thành công một phần có thể phân phối các hàng đã thu thập và bất kỳ email hoặc hồ sơ nào được tìm thấy. Lịch sử của bạn cho biết liệu CSV có khả dụng hay không."
          },
          {
            "question": "Bản xem trước trang chủ của tôi có được lưu khi tôi đăng nhập không?",
            "answer": "Không. Bản xem trước trang chủ là bản xem nhanh và không được lưu trữ. Sau khi bạn đăng nhập, hãy mở Công cụ quét trực tuyến trong Trang tổng quan của bạn và gửi lại từ khóa dưới dạng tác vụ đầy đủ."
          }
        ]
      },
      "cta": {
        "kicker": "Bắt đầu",
        "title": {
          "lead": "Xếp hàng tác vụ đám mây ",
          "accent": " đầu tiên của bạn ",
          "tail": ""
        },
        "lead": "Gửi từ khóa, theo dõi tiến độ nhiệm vụ của bạn và tải xuống dữ liệu kinh doanh từ trang tổng quan của bạn.",
        "primary": "Bắt đầu thu thập",
        "secondary": "Xem giá",
        "note": "Bao gồm hạn ngạch hàng tháng miễn phí. Không có thẻ tín dụng."
      }
    },
    "apiPage": {
      "switchLabel": "Điểm cuối API",
      "switchItems": {
        "search": "cái cạp",
        "reviews": "Đánh giá",
        "photos": "Ảnh"
      },
      "primaryCta": "Nhận khóa API",
      "pricingCta": "Xem giá",
      "console": {
        "label": "Ví dụ về yêu cầu và phản hồi API",
        "langLabel": "Yêu cầu ngôn ngữ",
        "langs": {
          "curl": "cURL",
          "python": "Python",
          "node": "Node.js"
        },
        "copy": "Sao chép yêu cầu",
        "replay": "Yêu cầu phát lại",
        "ready": "Sẵn sàng",
        "composing": "Đang soạn yêu cầu…",
        "sending": "Đang gửi yêu cầu…",
        "done": "Phản hồi · 200 OK · ứng dụng/json",
        "waiting": "// chờ phản hồi…",
        "response": "Phản hồi mẫu"
      },
      "endpoints": {
        "kicker": "Điểm cuối",
        "title": {
          "lead": "Một chìa khóa.  ",
          "accent": "Ba",
          "tail": "."
        },
        "lead": "Tìm địa điểm rồi truyền `fid` từ kết quả sang API đánh giá hoặc ảnh. Cả ba API dùng chung một khóa và hạn mức yêu cầu hằng tháng.",
        "here": "Bạn đang ở đây",
        "paramsLabel": "Thông số",
        "mcp": {
          "title": "Xây dựng với các tác nhân AI?",
          "description": "Tìm địa điểm Google Maps, đọc đánh giá và lấy URL ảnh công khai của doanh nghiệp qua một kết nối MCP.",
          "link": "Khám phá MCP"
        }
      },
      "chain": {
        "kicker": "Điểm cuối chuỗi",
        "title": {
          "lead": "",
          "accent": "cái cạp → Đánh giá / Ảnh",
          "tail": ""
        },
        "lead": "Tìm địa điểm rồi truyền `fid` từ kết quả sang API đánh giá hoặc ảnh. Cả ba API dùng chung một khóa và hạn mức yêu cầu hằng tháng.",
        "label": "Tìm địa điểm rồi truyền fid từ kết quả sang API đánh giá hoặc ảnh. Cả ba API dùng chung một khóa và hạn mức yêu cầu hằng tháng.",
        "places": [
          {
            "name": "Ember & Oak Coffee",
            "meta": "4.7 · 1,284 đánh giá"
          },
          {
            "name": "Rose City Roasters",
            "meta": "4.6 · 892 đánh giá"
          },
          {
            "name": "Hawthorne Bean Co.",
            "meta": "4.8 · 2,106 đánh giá"
          }
        ],
        "reviews": [
          {
            "rating": 5,
            "text": "“Best cortado on Division. Friendly crew.”",
            "meta": "Maya R. · 2 weeks ago",
            "reply": "Owner: Thanks Maya — see you soon!"
          },
          {
            "rating": 4,
            "text": "“Great beans. Cozy but small — come early on weekends.”",
            "meta": "Daniel K. · 3 weeks ago",
            "reply": ""
          }
        ],
        "photos": {
          "note": "Khi thành công, status là partial; reason cho biết vì sao quá trình thu thập dừng. reported_total là số do nguồn báo hoặc null, không phải tổng số ảnh album đã xác minh."
        }
      },
      "reference": {
        "kicker": "Thẩm quyền giải quyết",
        "title": {
          "lead": "Yêu cầu vào, ",
          "accent": " JSON ",
          "tail": " ra"
        },
        "lead": "Gửi khóa của bạn dưới dạng `Authorization: Bearer YOUR_API_KEY` với phần thân JSON. Mọi phản hồi đều được gói gọn trong `{code, data, msg}` và `code` 10000 có nghĩa là thành công.",
        "baseUrl": "Đế URL",
        "copyBaseUrl": "Sao chép cơ sở URL",
        "request": "Lời yêu cầu",
        "response": "Phản ứng",
        "columns": {
          "parameter": "tham số",
          "field": "Cánh đồng",
          "type": "Kiểu",
          "description": "Sự miêu tả",
          "example": "Ví dụ"
        },
        "required": "yêu cầu",
        "groupsLabel": "Nhóm lĩnh vực",
        "notes": [
          {
            "icon": "gauge",
            "title": "Một yêu cầu cho mỗi cuộc gọi thành công",
            "description": "Mỗi lệnh gọi thành công tính là một yêu cầu, kể cả khi chỉ trả một phần ảnh, bất kể số ảnh. Nếu không thể trả ảnh hợp lệ, lệnh gọi báo lỗi và không trừ hạn mức. Tìm kiếm, đánh giá, ảnh và MCP dùng chung hạn mức tháng."
          },
          {
            "icon": "key",
            "title": "401 có nghĩa là kiểm tra chìa khóa của bạn",
            "description": "Khóa bị thiếu hoặc không hợp lệ trả về HTTP 401. Các lỗi khác trả về HTTP 200 không phải 10000 `code` và `msg`."
          },
          {
            "icon": "locate",
            "title": "Vị trí là sự thiên vị, không phải là hàng rào",
            "description": "`ll` cho Maps biết nơi tìm kiếm. Những địa điểm bên ngoài chế độ xem đó vẫn có thể xuất hiện."
          },
          {
            "icon": "target",
            "title": "Đặt tên cho địa điểm",
            "description": "Đặt thành phố, tiểu bang hoặc ZIP vào `q` — “gần tôi” không có gì để neo trên máy chủ."
          }
        ]
      },
      "plans": {
        "kicker": "Gói API",
        "title": {
          "lead": "Truy cập có lập trình, ",
          "accent": " được định giá theo yêu cầu ",
          "tail": ""
        },
        "lead": "Mỗi lệnh gọi thành công tính là một yêu cầu, kể cả khi chỉ trả một phần ảnh, bất kể số ảnh. Nếu không thể trả ảnh hợp lệ, lệnh gọi báo lỗi và không trừ hạn mức. Tìm kiếm, đánh giá, ảnh và MCP dùng chung hạn mức tháng."
      },
      "faq": {
        "lead": "Những câu trả lời ngắn gọn. Bất cứ điều gì khác, hỗ trợ chỉ cần một email.",
        "contact": "Liên hệ hỗ trợ"
      },
      "cta": {
        "kicker": "Bắt đầu",
        "note": "Bao gồm hạn ngạch hàng tháng miễn phí. Không có thẻ tín dụng."
      }
    },
    "scraperApi": {
      "seo": {
        "title": "Máy cạp Google Maps API — Dữ liệu kinh doanh trong JSON | MapsGrab",
        "description": "Công cụ quét MapsGrab API trả về kết quả tìm kiếm Google Maps dưới dạng JSON: tên, địa chỉ, số điện thoại, trang web, xếp hạng, giờ, tọa độ, Place ID và fid — cùng với email và hồ sơ mạng xã hội theo yêu cầu."
      },
      "hero": {
        "title": {
          "lead": "API ",
          "accent": "thu thập dữ liệu",
          "tail": " Google Maps"
        },
        "lead": "Gửi từ khóa qua HTTPS và nhận lại các doanh nghiệp Google Maps dưới dạng JSON: tên, địa chỉ, số điện thoại, trang web, xếp hạng, giờ mở cửa, tọa độ, Place ID và fid — cùng với email và hồ sơ mạng xã hội theo yêu cầu.",
        "meta": [
          "Gói miễn phí: {quota}",
          "Một chìa khóa cho Tìm kiếm và Đánh giá",
          "JSON trên HTTPS"
        ],
        "chips": [
          {
            "label": "Mỗi nơi",
            "value": "Trường dữ liệu 29"
          },
          {
            "label": "Mỗi trang",
            "value": "Lên tới địa điểm 20"
          }
        ]
      },
      "endpoint": {
        "name": "API thu thập dữ liệu",
        "description": "Doanh nghiệp cho bất kỳ từ khóa và vị trí tùy chọn nào — các trường 29 cho mỗi địa điểm, cùng với email và hồ sơ mạng xã hội với `extra`.",
        "link": "Khám phá Máy cạp API"
      },
      "caps": {
        "title": {
          "lead": "Trình thu thập dữ liệu ",
          "accent": " API ",
          "tail": " trả về những gì"
        },
        "lead": "Một từ khóa và một sự thiên vị vị trí tùy chọn trong; những nơi tìm kiếm Google Maps hiển thị, dưới dạng JSON có cấu trúc.",
        "items": [
          {
            "icon": "search",
            "title": "Tìm kiếm theo từ khóa và vị trí",
            "description": "Gửi `q` với độ lệch vị trí `ll` tùy chọn. `page` đặt số lượng trang kết quả cần thu thập, 1–10, cho đến 20 đặt mỗi trang, tất cả trong một phản hồi."
          },
          {
            "icon": "table",
            "title": "Các trường 29 cho mỗi vị trí",
            "description": "Tên, danh mục, địa chỉ đầy đủ, số điện thoại, trang web, số lượng xếp hạng và đánh giá, giờ mở cửa, tọa độ, Place ID, CID, fid, chủ sở hữu và hơn thế nữa."
          },
          {
            "icon": "mail",
            "title": "Email và làm giàu xã hội",
            "description": "Đặt `extra` thành `true` để thêm hồ sơ `emails` và `medias`: Instagram, Facebook, YouTube, TikTok, LinkedIn và X được tìm thấy trên mỗi trang web doanh nghiệp."
          },
          {
            "icon": "braces",
            "title": "JSON rõ ràng, có thể dự đoán được",
            "description": "Các trường snake_case trong một phong bì `{code, data, msg}`. Các giá trị Google Maps không hiển thị sẽ trở lại dưới dạng `null` hoặc một danh sách trống, không bao giờ dưới dạng chuỗi trống."
          },
          {
            "icon": "layers",
            "title": "Dữ liệu một phần được gắn cờ",
            "description": "Nếu không thể điền một số chi tiết, bạn vẫn nhận được các địa điểm - với `partial` được đặt thành `true` và `warnings` cho biết nội dung còn thiếu."
          },
          {
            "icon": "shield",
            "title": "Chỉ dữ liệu công khai",
            "description": "Kết quả chỉ chứa những gì Google Maps hiển thị công khai — những chi tiết tương tự mà bất kỳ khách truy cập nào cũng có thể đọc được."
          }
        ]
      },
      "reference": {
        "shape": "data: { places, partial, warnings }",
        "params": [
          {
            "name": "q",
            "type": "string",
            "required": true,
            "description": "Nội dung cần tìm kiếm, tối đa ký tự 300 — loại hình doanh nghiệp cộng với địa điểm, ví dụ: `coffee shop in Portland, OR`."
          },
          {
            "name": "page",
            "type": "integer",
            "required": false,
            "description": "Có bao nhiêu trang kết quả cần thu thập, 1–10, cho đến 20 đặt mỗi trang, tất cả đều được trả về trong một phản hồi. Bộ sưu tập dừng sớm khi một trang có ít hơn vị trí 20 hoặc không có gì mới. `1` mặc định."
          },
          {
            "name": "hl",
            "type": "string",
            "required": false,
            "description": "Ngôn ngữ kết quả, ví dụ: `en` hoặc `fr`. `en` mặc định."
          },
          {
            "name": "ll",
            "type": "string",
            "required": false,
            "description": "Độ lệch vị trí tùy chọn như `@lat,lng,zoom`, zoom 0–21. Nó cho Maps biết nơi tìm kiếm; kết quả không được cắt theo bán kính."
          },
          {
            "name": "extra",
            "type": "boolean",
            "required": false,
            "description": "`true` thêm `emails` và `medias` vào mọi nơi. `false` mặc định."
          }
        ],
        "groups": [
          {
            "label": "Danh tính",
            "fields": [
              {
                "name": "name",
                "type": "string",
                "example": "\"Ember & Oak Coffee\""
              },
              {
                "name": "categories",
                "type": "string[]",
                "example": "[\"Coffee shop\", \"Espresso bar\"]"
              },
              {
                "name": "place_id",
                "type": "string",
                "example": "\"ChIJ8Qv2kSIKlVQRq-DRw_KltL4\""
              },
              {
                "name": "cid",
                "type": "string",
                "example": "\"13741790825100206251\""
              },
              {
                "name": "fid",
                "type": "string",
                "example": "\"0x54950a2291f60bf1:0xbeb4a5f2c3d1e0ab\""
              },
              {
                "name": "kgmid",
                "type": "string",
                "example": "\"/g/11c5x9_qk_\""
              },
              {
                "name": "google_maps_url",
                "type": "string",
                "example": "\"https://www.google.com/maps?cid=13741790825100206251\""
              },
              {
                "name": "google_knowledge_url",
                "type": "string",
                "example": "\"https://www.google.com/search?kgmid=/g/11c5x9_qk_\""
              },
              {
                "name": "search_keyword",
                "type": "string",
                "example": "\"coffee shop in Portland, OR\""
              }
            ]
          },
          {
            "label": "Liên hệ",
            "fields": [
              {
                "name": "phone",
                "type": "string",
                "example": "\"(503) 555-0142\""
              },
              {
                "name": "phones",
                "type": "string[]",
                "example": "[\"(503) 555-0142\", \"+1 503-555-0142\"]"
              },
              {
                "name": "website",
                "type": "string",
                "example": "\"emberandoak.coffee/\""
              },
              {
                "name": "domain",
                "type": "string",
                "example": "\"emberandoak.coffee\""
              },
              {
                "name": "emails",
                "type": "string[]",
                "example": "[\"hello@emberandoak.coffee\"]",
                "badge": "thêm"
              },
              {
                "name": "medias",
                "type": "object",
                "example": "{\"instagram\": \"https://www.instagram.com/emberandoak\", …}",
                "badge": "thêm"
              }
            ]
          },
          {
            "label": "Vị trí",
            "fields": [
              {
                "name": "full_address",
                "type": "string",
                "example": "\"3021 SE Division St, Portland, OR 97202\""
              },
              {
                "name": "street",
                "type": "string",
                "example": "\"3021 SE Division St\""
              },
              {
                "name": "municipality",
                "type": "string",
                "example": "\"Portland, OR 97202\""
              },
              {
                "name": "latitude",
                "type": "number",
                "example": "45.504912"
              },
              {
                "name": "longitude",
                "type": "number",
                "example": "-122.635377"
              },
              {
                "name": "time_zone",
                "type": "string",
                "example": "\"America/Los_Angeles\""
              }
            ]
          },
          {
            "label": "Xếp hạng",
            "fields": [
              {
                "name": "average_rating",
                "type": "number",
                "example": "4.7"
              },
              {
                "name": "review_count",
                "type": "integer",
                "example": "1284"
              },
              {
                "name": "review_url",
                "type": "string",
                "example": "\"https://search.google.com/local/reviews?placeid=ChIJ…\""
              }
            ]
          },
          {
            "label": "Hồ sơ",
            "fields": [
              {
                "name": "about",
                "type": "string",
                "example": "\"Service options: [Dine-in, Takeout], Highlights: [Great coffee]\""
              },
              {
                "name": "opening_hours",
                "type": "object[]",
                "example": "[{\"name\": \"Thursday(2026-10-15)\", \"values\": [\"7 AM–6 PM\"]}, …]"
              },
              {
                "name": "claimed",
                "type": "boolean",
                "example": "true"
              },
              {
                "name": "owner",
                "type": "string",
                "example": "\"Ember & Oak Coffee (Owner)\""
              },
              {
                "name": "owner_id",
                "type": "string",
                "example": "\"104287731665220398123\""
              },
              {
                "name": "owner_link",
                "type": "string",
                "example": "\"https://www.google.com/maps/contrib/1042877316…\""
              },
              {
                "name": "featured_image",
                "type": "string",
                "example": "\"https://lh5.googleusercontent.com/p/AF1Qip…\""
              }
            ]
          },
          {
            "label": "Trang",
            "fields": [
              {
                "name": "places",
                "type": "place[]",
                "example": "[{…}, …]"
              },
              {
                "name": "partial",
                "type": "boolean",
                "example": "false"
              },
              {
                "name": "warnings",
                "type": "string[]",
                "example": "[]"
              }
            ]
          }
        ]
      },
      "faq": {
        "title": {
          "lead": "",
          "accent": "Câu hỏi thường gặp",
          "tail": ""
        },
        "items": [
          {
            "question": "API thu thập dữ liệu trả về cái gì?",
            "answer": "JSON với tối đa 20 vị trí trên mỗi trang được thu thập. Mỗi địa điểm đều có các trường 29 — tên, danh mục, địa chỉ, số điện thoại, trang web, xếp hạng, số lượng đánh giá, giờ mở cửa, tọa độ, Place ID, CID, fid và hơn thế nữa — cùng với email và hồ sơ mạng xã hội khi thông tin bổ sung là đúng."
          },
          {
            "question": "Làm cách nào để xác thực?",
            "answer": "Gửi khóa MapsGrab API của bạn dưới dạng mã thông báo mang trong tiêu đề Authorization. Mỗi tài khoản có một chìa khóa. Nó chỉ được hiển thị đầy đủ khi bạn tạo nó và việc tạo khóa mới sẽ vô hiệu hóa khóa cũ ngay lập tức."
          },
          {
            "question": "Các yêu cầu được tính như thế nào?",
            "answer": "Mỗi lệnh gọi thành công tính là một yêu cầu, kể cả khi chỉ trả một phần ảnh, bất kể số ảnh. Nếu không thể trả ảnh hợp lệ, lệnh gọi báo lỗi và không trừ hạn mức. Tìm kiếm, đánh giá, ảnh và MCP dùng chung hạn mức tháng."
          },
          {
            "question": "Trang làm gì?",
            "answer": "trang là số lượng trang kết quả cần thu thập trong một lệnh gọi, từ 1 đến 10. Mỗi trang thêm tối đa địa điểm 20 và bộ sưu tập sẽ dừng sớm khi Google Maps không có gì mới. Nó không phải là số trang."
          },
          {
            "question": "Dữ liệu có được công khai không?",
            "answer": "Đúng. API chỉ trả về thông tin được hiển thị công khai trên Google Maps — chi tiết tương tự mà bất kỳ khách truy cập nào cũng có thể đọc được. Nó không truy cập tài khoản riêng tư hoặc dữ liệu không công khai."
          }
        ]
      },
      "cta": {
        "title": {
          "lead": "Đưa dữ liệu Bản đồ vào ứng dụng ",
          "accent": " ",
          "tail": " của bạn"
        },
        "lead": "Một yêu cầu HTTP cho mỗi tìm kiếm, được cấu trúc JSON trong phản hồi — dành cho CRM, đường dẫn dữ liệu và các sản phẩm của riêng bạn."
      }
    },
    "reviewsApi": {
      "seo": {
        "title": "Google Maps Đánh giá API thu thập dữ liệu — Các đánh giá trong JSON | MapsGrab",
        "description": "Đánh giá MapsGrab API trả về các đánh giá công khai về doanh nghiệp Google Maps dưới dạng JSON: xếp hạng, văn bản và bản dịch, tác giả, ngày tháng, đánh giá ảnh và trả lời của chủ sở hữu - tối đa 60 trên mỗi trang bằng một con trỏ."
      },
      "hero": {
        "title": {
          "lead": "Google Maps ",
          "accent": " Đánh giá ",
          "tail": " Máy cạp API"
        },
        "lead": "Yêu cầu các đánh giá công khai về bất kỳ doanh nghiệp Google Maps nào theo fid của nó và nhận lại JSON có cấu trúc: xếp hạng, văn bản và bản dịch, tác giả, ngày tháng, đánh giá ảnh và trả lời của chủ sở hữu - từng trang bằng một con trỏ.",
        "meta": [
          "Gói miễn phí: {quota}",
          "Lên đến 60 đánh giá trên mỗi trang",
          "JSON trên HTTPS"
        ],
        "chips": [
          {
            "label": "Mỗi trang",
            "value": "Đánh giá lên tới 60"
          },
          {
            "label": "Sắp xếp theo",
            "value": "Mức độ liên quan · mới nhất · xếp hạng"
          }
        ]
      },
      "endpoint": {
        "name": "API đánh giá",
        "description": "Đánh giá công khai về một doanh nghiệp của `fid` — lên tới 60 trên mỗi trang, được sắp xếp theo cách của bạn, phân trang bằng con trỏ.",
        "link": "Khám phá các bài đánh giá API"
      },
      "caps": {
        "title": {
          "lead": "Đánh giá ",
          "accent": " API ",
          "tail": " trả về những gì"
        },
        "lead": "Mỗi đánh giá công khai về một doanh nghiệp — xếp hạng, văn bản, tác giả, ảnh và câu trả lời của chủ sở hữu — một trang cho mỗi yêu cầu.",
        "items": [
          {
            "icon": "review",
            "title": "Đánh giá của fid",
            "description": "Giải quyết một doanh nghiệp bằng `fid` từ bất kỳ kết quả API thu thập dữ liệu nào, sau đó chuyển `next_cursor` trở lại để đọc trang tiếp theo, tối đa 60 đánh giá từng trang."
          },
          {
            "icon": "filter",
            "title": "Sắp xếp theo cách của bạn",
            "description": "`sort_by` trả về các bài đánh giá có liên quan nhất (1), mới nhất (2), được xếp hạng cao nhất (3) hoặc được xếp hạng thấp nhất (4) trước tiên."
          },
          {
            "icon": "list",
            "title": "Văn bản, bản dịch và ngày tháng",
            "description": "Xếp hạng, văn bản đánh giá, `translated_text` và `language`, kèm theo `published_at_ms` và ngày tương đối cho mỗi bài đánh giá."
          },
          {
            "icon": "user",
            "title": "Chi tiết tác giả",
            "description": "Tên tác giả và liên kết hồ sơ, số lượng đánh giá của tác giả và trạng thái Hướng dẫn địa phương."
          },
          {
            "icon": "image",
            "title": "Hình ảnh và câu trả lời của chủ sở hữu",
            "description": "`images` liệt kê ảnh URLs được đính kèm vào bài đánh giá; `owner_response` mang theo câu trả lời của chủ sở hữu và `owner_response_at_ms` đã đến lúc."
          },
          {
            "icon": "shield",
            "title": "Chỉ dữ liệu công khai",
            "description": "Chỉ các bài đánh giá được hiển thị công khai trên Google Maps — cùng một nội dung mà bất kỳ khách truy cập nào cũng có thể đọc."
          }
        ]
      },
      "reference": {
        "shape": "data: { reviews, next_cursor }",
        "params": [
          {
            "name": "fid",
            "type": "string",
            "required": true,
            "description": "ID tính năng doanh nghiệp, ví dụ: `0x5495…:0xbeb4…`. Mỗi địa điểm API thu thập dữ liệu đều có nó."
          },
          {
            "name": "cursor",
            "type": "string",
            "required": false,
            "description": "`next_cursor` từ trang trước. Bỏ qua nó cho trang đầu tiên."
          },
          {
            "name": "sort_by",
            "type": "integer",
            "required": false,
            "description": "`1` phù hợp nhất · `2` mới nhất · `3` xếp hạng cao nhất · `4` xếp hạng thấp nhất. `1` mặc định."
          },
          {
            "name": "hl",
            "type": "string",
            "required": false,
            "description": "Mã ngôn ngữ, ví dụ: `en`. `en` mặc định."
          }
        ],
        "groups": [
          {
            "label": "Ôn tập",
            "fields": [
              {
                "name": "review_id",
                "type": "string",
                "example": "\"ChdDSUhNMG9nS0VJQ0FnSUR3…\""
              },
              {
                "name": "rating",
                "type": "integer",
                "example": "5"
              },
              {
                "name": "text",
                "type": "string",
                "example": "\"Best cortado on Division. Friendly crew.\""
              },
              {
                "name": "translated_text",
                "type": "string",
                "example": "null"
              },
              {
                "name": "language",
                "type": "string",
                "example": "\"en\""
              },
              {
                "name": "published_at_ms",
                "type": "integer",
                "example": "1790553600000"
              },
              {
                "name": "relative_date",
                "type": "string",
                "example": "\"2 weeks ago\""
              },
              {
                "name": "images",
                "type": "string[]",
                "example": "[\"https://lh5.googleusercontent.com/p/AF1QipN…\"]"
              },
              {
                "name": "origin",
                "type": "string",
                "example": "\"Google\""
              }
            ]
          },
          {
            "label": "Tác giả",
            "fields": [
              {
                "name": "author_name",
                "type": "string",
                "example": "\"Maya R.\""
              },
              {
                "name": "author_url",
                "type": "string",
                "example": "\"https://www.google.com/maps/contrib/1123…\""
              },
              {
                "name": "author_review_count",
                "type": "integer",
                "example": "38"
              },
              {
                "name": "author_is_local_guide",
                "type": "boolean",
                "example": "true"
              }
            ]
          },
          {
            "label": "Trả lời của chủ sở hữu",
            "fields": [
              {
                "name": "owner_response",
                "type": "string",
                "example": "\"Thanks Maya — see you soon!\""
              },
              {
                "name": "owner_response_at_ms",
                "type": "integer",
                "example": "1790640000000"
              }
            ]
          },
          {
            "label": "Trang",
            "fields": [
              {
                "name": "reviews",
                "type": "review[]",
                "example": "[{…}, …]"
              },
              {
                "name": "next_cursor",
                "type": "string",
                "example": "\"CAESBkVnSUlDZw…\""
              }
            ]
          }
        ]
      },
      "faq": {
        "title": {
          "lead": "",
          "accent": "Câu hỏi thường gặp",
          "tail": ""
        },
        "items": [
          {
            "question": "Làm cách nào để giải quyết một doanh nghiệp cụ thể?",
            "answer": "Với fid của nó, ID tính năng mà mọi địa điểm API thu thập dữ liệu đều có. Trình tìm kiếm Place ID miễn phí cũng đọc FID từ bất kỳ địa điểm Google Maps nào URL."
          },
          {
            "question": "Đánh giá bao gồm những lĩnh vực nào?",
            "answer": "Đánh giá ID, xếp hạng, văn bản với bản dịch và ngôn ngữ của nó, thời gian xuất bản và ngày tương đối, tên tác giả, liên kết hồ sơ, số lượng đánh giá và trạng thái Hướng dẫn địa phương, ảnh đính kèm và câu trả lời của chủ sở hữu kèm theo thời gian."
          },
          {
            "question": "Tôi có thể thu thập bao nhiêu đánh giá?",
            "answer": "Mỗi yêu cầu trả về một trang chứa tối đa các bài đánh giá 60 cộng với next_cursor. Đưa lại để đọc trang tiếp theo; khi next_cursor rỗng, không còn trang nào nữa."
          },
          {
            "question": "Các yêu cầu được tính như thế nào?",
            "answer": "Mỗi lệnh gọi thành công tính là một yêu cầu, kể cả khi chỉ trả một phần ảnh, bất kể số ảnh. Nếu không thể trả ảnh hợp lệ, lệnh gọi báo lỗi và không trừ hạn mức. Tìm kiếm, đánh giá, ảnh và MCP dùng chung hạn mức tháng."
          },
          {
            "question": "Dữ liệu có được công khai không?",
            "answer": "Đúng. API chỉ trả về các đánh giá được hiển thị công khai trên Google Maps — cùng nội dung mà bất kỳ khách truy cập nào cũng có thể đọc. Nó không truy cập tài khoản riêng tư hoặc dữ liệu không công khai."
          }
        ]
      },
      "cta": {
        "title": {
          "lead": "Theo dõi đánh giá ",
          "accent": " ở quy mô ",
          "tail": ""
        },
        "lead": "Các chủ đề đánh giá được phân trang Cursor trong JSON sạch — để theo dõi, nghiên cứu và báo cáo."
      }
    },
    "photosApi": {
      "seo": {
        "title": "API ảnh — URL ảnh công khai của doanh nghiệp | MapsGrab",
        "description": "Lấy URL ảnh công khai của doanh nghiệp dưới dạng JSON bằng fid. max_results giới hạn số ảnh trả về; kết quả chỉ là một phần và không bảo đảm toàn bộ album."
      },
      "hero": {
        "title": {
          "lead": "Google Maps ",
          "accent": " Ảnh ",
          "tail": " API"
        },
        "lead": "Lấy URL ảnh công khai của doanh nghiệp dưới dạng JSON bằng fid. max_results giới hạn số ảnh trả về; kết quả chỉ là một phần và không bảo đảm toàn bộ album.",
        "meta": [
          "Gói miễn phí: {quota}",
          "URL ảnh công khai của doanh nghiệp",
          " được định giá theo yêu cầu "
        ],
        "chips": [
          {
            "label": "Trạng thái trả dữ liệu",
            "value": "partial"
          },
          {
            "label": "Số lượng",
            "value": "returned_count"
          }
        ]
      },
      "endpoint": {
        "name": "API ảnh",
        "description": "Lấy URL ảnh công khai của doanh nghiệp dưới dạng JSON bằng fid. max_results giới hạn số ảnh trả về; kết quả chỉ là một phần và không bảo đảm toàn bộ album.",
        "link": "Khám phá API ảnh"
      },
      "caps": {
        "title": {
          "lead": "",
          "accent": "API ảnh",
          "tail": ""
        },
        "lead": "URL ảnh công khai của doanh nghiệp",
        "items": [
          {
            "icon": "image",
            "title": "Lấy ảnh bằng fid",
            "description": "Dùng `fid` từ tìm kiếm hoặc Place ID Finder. Mỗi mục trong `photos` chứa `url` của một ảnh công khai."
          },
          {
            "icon": "filter",
            "title": "Giới hạn từng yêu cầu",
            "description": "`max_results` là số nguyên dương, mặc định 200. Số ảnh thực tế có thể ít hơn. Không có số trang hay con trỏ."
          },
          {
            "icon": "list",
            "title": "Đọc trạng thái trả dữ liệu",
            "description": "Khi thành công, `status` là `partial`; `reason` cho biết vì sao quá trình thu thập dừng. `reported_total` là số do nguồn báo hoặc `null`, không phải tổng số ảnh album đã xác minh."
          }
        ]
      },
      "reference": {
        "shape": "{ photos: [{url}], returned_count, reported_total, status, reason }",
        "params": [
          {
            "name": "fid",
            "type": "string",
            "required": true,
            "description": "FID doanh nghiệp từ tìm kiếm hoặc Place ID Finder, dạng `0x…:0x…`, mỗi phần có 12–20 chữ số thập lục phân."
          },
          {
            "name": "max_results",
            "type": "integer",
            "required": false,
            "description": "Giới hạn trả ảnh là số nguyên dương, mặc định 200. Không bảo đảm đủ số ảnh này."
          }
        ],
        "groups": [
          {
            "label": "Ảnh",
            "fields": [
              {
                "name": "photos",
                "type": "photo[]",
                "example": "[{\"url\": \"https://lh5.googleusercontent.com/p/AF1Qip…\"}]"
              },
              {
                "name": "url",
                "type": "string",
                "example": "\"https://lh5.googleusercontent.com/p/AF1Qip…\""
              }
            ]
          },
          {
            "label": "Trạng thái trả dữ liệu",
            "fields": [
              {
                "name": "returned_count",
                "type": "integer",
                "example": "2"
              },
              {
                "name": "reported_total",
                "type": "integer | null",
                "example": "178"
              },
              {
                "name": "status",
                "type": "string",
                "example": "\"partial\""
              },
              {
                "name": "reason",
                "type": "string",
                "example": "\"limit_reached\""
              }
            ]
          }
        ]
      },
      "faq": {
        "title": {
          "lead": "",
          "accent": "Câu hỏi thường gặp",
          "tail": ""
        },
        "items": [
          {
            "question": "Làm sao để yêu cầu ảnh doanh nghiệp?",
            "answer": "Gửi POST tới /photos với fid và max_results tùy chọn. Dùng cùng khóa Bearer API như API tìm kiếm và đánh giá."
          },
          {
            "question": "Có nhận được toàn bộ album không?",
            "answer": "Khi thành công, status là partial; reason cho biết vì sao quá trình thu thập dừng. reported_total là số do nguồn báo hoặc null, không phải tổng số ảnh album đã xác minh. max_results là số nguyên dương, mặc định 200. Số ảnh thực tế có thể ít hơn. Không có số trang hay con trỏ."
          },
          {
            "question": "Làm thế nào để tôi có được fior của một doanh nghiệp?",
            "answer": "Mỗi địa điểm API thu thập dữ liệu đều bao gồm fid của nó và Place ID Finder miễn phí đọc FID từ bất kỳ địa điểm Google Maps nào URL."
          },
          {
            "question": "Các yêu cầu được tính như thế nào?",
            "answer": "Mỗi lệnh gọi thành công tính là một yêu cầu, kể cả khi chỉ trả một phần ảnh, bất kể số ảnh. Nếu không thể trả ảnh hợp lệ, lệnh gọi báo lỗi và không trừ hạn mức. Tìm kiếm, đánh giá, ảnh và MCP dùng chung hạn mức tháng."
          },
          {
            "question": "Dữ liệu có được công khai không?",
            "answer": "Đúng. Hình ảnh URLs trỏ tới các ảnh được hiển thị công khai trên Google Maps — những hình ảnh tương tự mà bất kỳ khách truy cập nào cũng có thể nhìn thấy."
          }
        ]
      },
      "cta": {
        "title": {
          "lead": "",
          "accent": "Đưa ảnh doanh nghiệp vào ứng dụng",
          "tail": ""
        },
        "lead": "Dùng khóa API hiện có để lấy URL ảnh công khai và trạng thái trả dữ liệu."
      }
    },
    "scraperMcp": {
      "seo": {
        "title": "Máy cạp Google Maps Máy chủ MCP | MapsGrab",
        "description": "Tìm địa điểm Google Maps, đọc đánh giá và lấy URL ảnh công khai của doanh nghiệp qua một kết nối MCP."
      },
      "clients": {
        "claude": "Claude Code",
        "cursor": "Cursor",
        "vscode": "VS Code",
        "codex": "Codex"
      },
      "connectCta": "Kết nối đại lý của bạn",
      "hero": {
        "kicker": "MCP máy chủ",
        "title": {
          "lead": "Máy chủ ",
          "accent": "MCP",
          "tail": " thu thập dữ liệu Google Maps"
        },
        "lead": "Tìm địa điểm Google Maps, đọc đánh giá và lấy URL ảnh công khai của doanh nghiệp qua một kết nối MCP.",
        "meta": [
          "Streamable HTTP",
          "Đăng nhập bằng OAuth",
          "Gói miễn phí: {quota}"
        ],
        "chips": [
          {
            "label": "Chuyên chở",
            "value": "Streamable HTTP"
          },
          {
            "label": "Kết quả công cụ",
            "value": "Cấu trúc JSON"
          }
        ]
      },
      "agent": {
        "label": "Phiên tổng đài viên mẫu: câu hỏi về doanh nghiệp địa phương, lệnh gọi công cụ MapsGrab với kết quả có cấu trúc và câu trả lời của tổng đài viên",
        "session": "Phiên đại lý",
        "connected": "Máy chủ MCP {server} được kết nối",
        "placeholder": "Hỏi về bất kỳ địa điểm nào trên Google Maps…",
        "thinking": "Đang suy nghĩ…",
        "running": "đang chạy",
        "scenes": [
          {
            "prompt": "Tìm các nha sĩ ở Austin, TX được xếp hạng 4.8 trở lên và liệt kê số điện thoại của họ.",
            "calls": [
              {
                "tool": "search_places",
                "args": "{\"q\": \"dentist in Austin, TX\"}",
                "state": "Địa điểm 20",
                "out": [
                  "{\"name\": \"Bluebonnet Family Dental\", \"average_rating\": 4.9, \"phone\": \"(512) 555-0134\", …}",
                  "{\"name\": \"Barton Hills Smile Studio\", \"average_rating\": 4.8, \"phone\": \"(512) 555-0161\", …}",
                  "{\"name\": \"Live Oak Dentistry\", \"average_rating\": 4.8, \"phone\": \"(512) 555-0187\", …}"
                ],
                "more": "+ 17 nhiều địa điểm hơn"
              }
            ],
            "answer": [
              "Ba trong số kết quả 20 đầu tiên được xếp hạng ",
              {
                "strong": "4.8 hoặc cao hơn"
              },
              ":"
            ],
            "rows": [
              [
                "Bluebonnet Family Dental",
                "4.9",
                "(512) 555-0134"
              ],
              [
                "Barton Hills Smile Studio",
                "4.8",
                "(512) 555-0161"
              ],
              [
                "Live Oak Dentistry",
                "4.8",
                "(512) 555-0187"
              ]
            ]
          },
          {
            "prompt": "Mọi người đang nói gì trong các bài đánh giá mới nhất về Ember & Oak Coffee ở Portland?",
            "calls": [
              {
                "tool": "search_places",
                "args": "{\"q\": \"Ember & Oak Coffee, Portland, OR\"}",
                "state": "Địa điểm 1",
                "out": [
                  "{\"name\": \"Ember & Oak Coffee\", \"fid\": \"0x5495…e0ab\", \"average_rating\": 4.7, …}"
                ],
                "more": ""
              },
              {
                "tool": "list_reviews",
                "args": "{\"fid\": \"0x5495…e0ab\", \"sort_by\": 2}",
                "state": "đánh giá 60",
                "out": [
                  "{\"rating\": 5, \"text\": \"Best cortado on Division. Friendly crew.\", …}",
                  "{\"rating\": 4, \"text\": \"Great beans. Cozy but small — come early on weekends.\", …}",
                  "{\"rating\": 5, \"text\": \"Oat flat white is excellent and the staff remembers names.\", …}"
                ],
                "more": "\"next_cursor\": \"…\""
              }
            ],
            "answer": [
              "Hầu hết ",
              {
                "strong": "5-sao"
              },
              " — mọi người khen ngợi cà phê espresso và đội ngũ nhân viên thân thiện. Một lưu ý định kỳ: ",
              {
                "strong": "chỗ ngồi chật vào cuối tuần"
              },
              "."
            ],
            "rows": []
          },
          {
            "prompt": "Thợ sửa ống nước nào ở Chicago không liệt kê trang web? Đặt chúng vào một cái bàn.",
            "calls": [
              {
                "tool": "search_places",
                "args": "{\"q\": \"plumber in Chicago, IL\"}",
                "state": "Địa điểm 20",
                "out": [
                  "{\"name\": \"Windy City Pipe Works\", \"website\": null, \"phone\": \"(312) 555-0112\", …}",
                  "{\"name\": \"Lakeview Drain & Sewer\", \"website\": null, \"phone\": \"(312) 555-0148\", …}",
                  "{\"name\": \"North Branch Plumbing\", \"website\": null, \"phone\": \"(312) 555-0175\", …}"
                ],
                "more": "+ 17 nhiều địa điểm hơn"
              }
            ],
            "answer": [
              {
                "strong": "4 của 20"
              },
              " không có trang web được liệt kê Ba điều đầu tiên:"
            ],
            "rows": [
              [
                "Windy City Pipe Works",
                "4.6",
                "(312) 555-0112"
              ],
              [
                "Lakeview Drain & Sewer",
                "4.4",
                "(312) 555-0148"
              ],
              [
                "North Branch Plumbing",
                "4.8",
                "(312) 555-0175"
              ]
            ]
          },
          {
            "prompt": "Lấy các bài đánh giá được xếp hạng thấp nhất về Rose City Roasters và soạn thảo các câu trả lời lịch sự.",
            "calls": [
              {
                "tool": "search_places",
                "args": "{\"q\": \"Rose City Roasters, Portland, OR\"}",
                "state": "Địa điểm 1",
                "out": [
                  "{\"name\": \"Rose City Roasters\", \"fid\": \"0x5495…8f7a\", \"average_rating\": 4.6, …}"
                ],
                "more": ""
              },
              {
                "tool": "list_reviews",
                "args": "{\"fid\": \"0x5495…8f7a\", \"sort_by\": 4}",
                "state": "đánh giá 60",
                "out": [
                  "{\"rating\": 2, \"text\": \"Waited 20 minutes for a latte at noon.\", \"owner_response\": null, …}",
                  "{\"rating\": 2, \"text\": \"Great beans, but the line barely moves on Saturdays.\", \"owner_response\": null, …}",
                  "{\"rating\": 3, \"text\": \"Good coffee, hard to find a seat.\", \"owner_response\": \"Thanks — more seats are coming!\", …}"
                ],
                "more": "\"next_cursor\": \"…\""
              }
            ],
            "answer": [
              "Xếp hạng thấp nhất chủ yếu đề cập đến ",
              {
                "strong": "dịch vụ chậm vào giờ cao điểm"
              },
              ". ",
              {
                "strong": "2 của 3"
              },
              " chưa có câu trả lời của chủ sở hữu nào - tôi đã soạn thảo một câu trả lời cho mỗi người."
            ],
            "rows": []
          }
        ]
      },
      "tools": {
        "kicker": "Công cụ",
        "title": {
          "lead": "Máy chủ MCP ",
          "accent": " tiết lộ những gì ",
          "tail": ""
        },
        "lead": "Ba công cụ: Search / Reviews / Photos.",
        "kind": "Dụng cụ",
        "returns": "Trả lại",
        "items": [
          {
            "name": "search_places",
            "icon": "search",
            "title": "Tìm kiếm địa điểm",
            "description": "Tìm kiếm từ khóa và vị trí trả về những gì tìm kiếm Google Maps hiển thị - tên, số điện thoại, xếp hạng, giờ, tọa độ, ID địa điểm và fids.",
            "args": [
              {
                "name": "q",
                "description": "Từ khóa cộng với thành phố, tiểu bang hoặc ZIP"
              },
              {
                "name": "page",
                "description": "Các trang kết quả cần thu thập, 1–10 · tối đa 20 đặt mỗi trang"
              },
              {
                "name": "hl",
                "description": "Ngôn ngữ kết quả, ví dụ: `en`"
              },
              {
                "name": "ll",
                "description": "Độ lệch vị trí, `@lat,lng,zoom`"
              },
              {
                "name": "extra",
                "description": "`true` thêm email và hồ sơ xã hội"
              }
            ],
            "returns": "places · partial · warnings",
            "link": "Dữ liệu tương tự như API thu thập dữ liệu"
          },
          {
            "name": "list_reviews",
            "icon": "review",
            "title": "Liệt kê đánh giá",
            "description": "Xếp hạng, văn bản đánh giá, tác giả, ngày tháng, hình ảnh và câu trả lời của chủ sở hữu cho bất kỳ doanh nghiệp nào mà đại lý của bạn đang xem xét.",
            "args": [
              {
                "name": "fid",
                "description": "Từ bất kỳ kết quả tìm kiếm nào"
              },
              {
                "name": "cursor",
                "description": "`next_cursor` từ trang cuối cùng; bỏ qua lần đầu tiên"
              },
              {
                "name": "sort_by",
                "description": "1 có liên quan · 2 mới nhất · 3 cao nhất · 4 thấp nhất"
              },
              {
                "name": "hl",
                "description": "Ngôn ngữ, ví dụ: `en`"
              }
            ],
            "returns": "reviews ≤ 60 · next_cursor",
            "link": "Dữ liệu tương tự như Đánh giá API"
          },
          {
            "name": "list_photos",
            "icon": "image",
            "title": "Lấy ảnh bằng fid",
            "description": "Lấy URL ảnh công khai của doanh nghiệp dưới dạng JSON bằng fid. max_results giới hạn số ảnh trả về; kết quả chỉ là một phần và không bảo đảm toàn bộ album.",
            "args": [
              {
                "name": "fid",
                "description": "FID doanh nghiệp từ tìm kiếm hoặc Place ID Finder, dạng `0x…:0x…`, mỗi phần có 12–20 chữ số thập lục phân."
              },
              {
                "name": "max_results",
                "description": "Giới hạn trả ảnh là số nguyên dương, mặc định 200. Không bảo đảm đủ số ảnh này."
              }
            ],
            "returns": "photos · returned_count · reported_total · status · reason",
            "link": "Khám phá API ảnh"
          }
        ]
      },
      "flow": {
        "kicker": "Nó kết nối như thế nào",
        "title": {
          "lead": "Một điểm cuối giữa đại lý của bạn và dữ liệu Bản đồ trực tiếp ",
          "accent": " ",
          "tail": ""
        },
        "lead": "Khách hàng của bạn kết nối qua Streamable HTTP và đăng nhập thông qua trình duyệt của bạn. Tác nhân phát hiện ra các công cụ, gọi chúng khi có lời nhắc cần dữ liệu Bản đồ và đọc lại JSON có cấu trúc.",
        "label": "Tìm địa điểm Google Maps, đọc đánh giá và lấy URL ảnh công khai của doanh nghiệp qua một kết nối MCP. search_places / list_reviews / list_photos.",
        "clientsLabel": "Khách hàng MCP",
        "anyClient": "Bất kỳ khách hàng MCP nào",
        "toolsLabel": "Công cụ",
        "hub": "MapsGrab MCP",
        "publicData": "Dữ liệu Google Maps công khai",
        "resultLabel": "kết quả",
        "results": [
          "Địa điểm 20",
          "đánh giá 60",
          "2 Ảnh"
        ],
        "steps": [
          {
            "title": "Kết nối",
            "description": "Thêm điểm cuối vào ứng dụng khách của bạn, sau đó đăng nhập vào MapsGrab thông qua trình duyệt của bạn."
          },
          {
            "title": "Phát hiện",
            "description": "Tác nhân của bạn liệt kê các công cụ MapsGrab và lược đồ đầu vào của chúng."
          },
          {
            "title": "Gọi",
            "description": "Khi lời nhắc cần dữ liệu Bản đồ, tác nhân sẽ gọi một công cụ và đọc kết quả JSON."
          }
        ]
      },
      "setup": {
        "kicker": "Cài đặt",
        "title": {
          "lead": "Một khối cấu hình ",
          "accent": " cho mỗi khách hàng ",
          "tail": ""
        },
        "lead": "Trỏ ứng dụng khách của bạn đến điểm cuối MapsGrab và đăng nhập thông qua trình duyệt của bạn — không cần khóa API để sao chép, không cần SDK, không cần chạy quy trình cục bộ.",
        "tabsLabel": "Máy khách MCP",
        "copy": "Sao chép cấu hình",
        "clients": {
          "claude": {
            "file": "Phần cuối",
            "steps": [
              {
                "title": "Thêm máy chủ",
                "description": "Chạy lệnh để đăng ký `mapsgrab` trên HTTP."
              },
              {
                "title": "Đăng nhập",
                "description": "Trong Claude Code, chạy `/mcp`, chọn `mapsgrab` và xác thực — MapsGrab mở trong trình duyệt của bạn để bạn phê duyệt."
              },
              {
                "title": "Yêu cầu dữ liệu Maps",
                "description": "Claude Code liệt kê các công cụ MapsGrab và gọi chúng khi có lời nhắc cần đến chúng."
              }
            ]
          },
          "cursor": {
            "file": "~/.cursor/mcp.json",
            "steps": [
              {
                "title": "Chỉnh sửa mcp.json",
                "description": "Thêm khối vào `~/.cursor/mcp.json` cho mọi dự án hoặc `.cursor/mcp.json` cho một dự án."
              },
              {
                "title": "Đăng nhập",
                "description": "Trong Cài đặt Cursor → MCP, nhấp vào Kết nối bên cạnh `mapsgrab` và phê duyệt nó trong trình duyệt của bạn."
              },
              {
                "title": "Sử dụng các công cụ",
                "description": "`mapsgrab` hiển thị các công cụ của mình trong danh sách máy chủ MCP, sẵn sàng cho đại lý."
              }
            ]
          },
          "vscode": {
            "file": ".vscode/mcp.json",
            "steps": [
              {
                "title": "Thêm .vscode/mcp.json",
                "description": "Dán khối - nó chỉ giữ điểm cuối URL, không có gì bí mật."
              },
              {
                "title": "Đăng nhập",
                "description": "Khởi động máy chủ. VS Code yêu cầu xác thực bằng MapsGrab và mở trình duyệt của bạn để phê duyệt."
              },
              {
                "title": "Sử dụng chế độ đại lý",
                "description": "Mở Trò chuyện ở chế độ tổng đài viên và bật công cụ MapsGrab."
              }
            ]
          },
          "codex": {
            "file": "Phần cuối",
            "steps": [
              {
                "title": "Thêm máy chủ",
                "description": "Chạy `codex mcp add` để đăng ký `mapsgrab` bằng URL."
              },
              {
                "title": "Đăng nhập",
                "description": "Chạy `codex mcp login mapsgrab` và phê duyệt MapsGrab trong trình duyệt của bạn."
              },
              {
                "title": "Bắt đầu Codex",
                "description": "Phiên mới tải `mapsgrab` và các công cụ của nó."
              }
            ]
          }
        },
        "apiKey": {
          "title": "Không thể đăng nhập từ trình duyệt? Sử dụng khóa API",
          "description": "Nếu ứng dụng khách của bạn không hỗ trợ ủy quyền MCP hoặc chạy trên máy chủ hoặc trong CI, hãy thêm khóa API của bạn làm tiêu đề `Authorization` thay thế. Giữ khóa trong biến môi trường hoặc đầu vào bí mật của khách hàng của bạn, không phải tệp cấu hình được chia sẻ.",
          "link": "Nhận khóa API",
          "snippet": "Bất kỳ khách hàng HTTP nào"
        },
        "spec": {
          "title": "Bất kỳ ứng dụng khách MCP nào khác",
          "subtitle": "Bao gồm MCP Inspector",
          "transport": "Chuyên chở",
          "transportValue": "Streamable HTTP",
          "endpoint": "Điểm cuối",
          "copyEndpoint": "Sao chép điểm cuối",
          "auth": "Xác thực",
          "authValue": "Đăng nhập OAuth (dự phòng: Authorization: Bearer YOUR_API_KEY)"
        }
      },
      "prompts": {
        "kicker": "Lời nhắc ví dụ",
        "title": {
          "lead": "Hỏi bằng ngôn ngữ đơn giản.  ",
          "accent": " Lấy lại hàng. ",
          "tail": ""
        },
        "lead": "Tìm kiếm khách hàng tiềm năng, nghiên cứu thị trường địa phương, giám sát đánh giá - mô tả công việc và đại lý của bạn sẽ quyết định nên gọi công cụ MapsGrab nào.",
        "rows": [
          [
            {
              "icon": "target",
              "tag": "thăm dò",
              "quote": "“Tìm các nha sĩ ở Austin, TX được xếp hạng 4.8 trở lên và liệt kê số điện thoại của họ.”",
              "tools": [
                "search_places"
              ],
              "fields": ""
            },
            {
              "icon": "review",
              "tag": "Danh tiếng",
              "quote": "“Tóm tắt những gì mọi người nói trong các bài đánh giá mới nhất về Ember & Oak Coffee ở Portland.”",
              "tools": [
                "search_places",
                "list_reviews"
              ],
              "fields": ""
            },
            {
              "icon": "list-plus",
              "tag": "Danh sách khách hàng tiềm năng",
              "quote": "“Xây dựng danh sách các phòng tập yoga ở Denver bằng email và hồ sơ Instagram của họ.”",
              "tools": [
                "search_places"
              ],
              "fields": "extra: true · emails · medias"
            },
            {
              "icon": "chart",
              "tag": "Nghiên cứu thị trường",
              "quote": "“So sánh xếp hạng và số lượng đánh giá cho các quán cà phê trên đường Division St ở Portland.”",
              "tools": [
                "search_places"
              ],
              "fields": "average_rating · review_count"
            },
            {
              "icon": "table",
              "tag": "Làm giàu",
              "quote": "“Thêm Place ID, số điện thoại và trang web cho mọi doanh nghiệp vào bảng tính này.”",
              "tools": [
                "search_places"
              ],
              "fields": "place_id · phone · website"
            },
            {
              "icon": "mail",
              "tag": "Trả lời của chủ sở hữu",
              "quote": "“Lấy các bài đánh giá được xếp hạng thấp nhất về Rose City Roasters và soạn thảo câu trả lời lịch sự.”",
              "tools": [
                "search_places",
                "list_reviews"
              ],
              "fields": "sort_by: 4"
            }
          ],
          [
            {
              "icon": "web",
              "tag": "Khoảng trống trang web",
              "quote": "\"Thợ sửa ống nước nào ở Chicago không liệt kê một trang web? Hãy đặt họ vào một bảng.\"",
              "tools": [
                "search_places"
              ],
              "fields": "website: null"
            },
            {
              "icon": "clock",
              "tag": "Giờ mở cửa",
              "quote": "“Cửa hàng sửa chữa ô tô nào gần 60614 mở cửa vào Chủ nhật?”",
              "tools": [
                "search_places"
              ],
              "fields": "opening_hours"
            },
            {
              "icon": "map",
              "tag": "Lập bản đồ",
              "quote": "“Xuất các nhà hàng thuần chay ở Brooklyn với tọa độ là GeoJSON.”",
              "tools": [
                "search_places"
              ],
              "fields": "latitude · longitude"
            },
            {
              "icon": "globe",
              "tag": "Bản địa hóa",
              "quote": "“Tìm kiếm các tiệm bánh ở Lyon và trả lại thông tin chi tiết về danh sách bằng tiếng Pháp.”",
              "tools": [
                "search_places"
              ],
              "fields": "hl: fr"
            },
            {
              "icon": "check-circle",
              "tag": "Danh sách được xác nhận quyền sở hữu",
              "quote": "“Kiểm tra xem phòng tập thể dục nào ở Austin đã xác nhận danh sách Doanh nghiệp Google của họ.”",
              "tools": [
                "search_places"
              ],
              "fields": "claimed"
            },
            {
              "icon": "user",
              "tag": "Hướng dẫn viên địa phương",
              "quote": "“Những bài đánh giá gần đây nào về Hawthorne Bean Co. đến từ Hướng dẫn viên địa phương?”",
              "tools": [
                "search_places",
                "list_reviews"
              ],
              "fields": "author_is_local_guide"
            },
            {
              "icon": "trend",
              "tag": "Thời gian đáp ứng",
              "quote": "“Những tiệm này có trả lời đánh giá của họ không và chủ sở hữu mất bao lâu để trả lời?”",
              "tools": [
                "list_reviews"
              ],
              "fields": "owner_response_at_ms"
            }
          ]
        ]
      },
      "trust": {
        "kicker": "Xác thực & dữ liệu",
        "title": {
          "lead": "Đăng nhập một lần. ",
          "accent": "Chỉ dữ liệu công khai.",
          "tail": ""
        },
        "lead": "Mọi cuộc gọi đến điểm cuối MCP đều mang thông tin xác thực mang theo — mã thông báo OAuth khi đăng nhập hoặc khóa API của bạn nếu khách hàng của bạn không thể đăng nhập — và mọi kết quả đều đến từ những gì Google Maps hiển thị công khai.",
        "inspector": {
          "label": "Ví dụ về yêu cầu MCP với tiêu đề Authorization mang và phản hồi JSON-RPC của nó với nội dung có cấu trúc",
          "request": "Lời yêu cầu",
          "response": "Phản ứng",
          "verified": "Đã xác minh mã thông báo"
        },
        "items": [
          {
            "icon": "key",
            "title": "Đăng nhập hoặc quay lại một phím",
            "description": "Đăng nhập thông qua trình duyệt của bạn và phê duyệt khách hàng. Thay vào đó, những khách hàng không có ủy quyền MCP có thể chuyển khóa API của bạn dưới dạng mã thông báo mang - cả hai đều sử dụng cùng một công cụ."
          },
          {
            "icon": "eye",
            "title": "Đọc Google Maps, không bao giờ viết",
            "description": "Các công cụ chỉ tìm kiếm và đọc danh sách công khai. Một điều mà cuộc gọi thay đổi là việc sử dụng yêu cầu của bạn."
          },
          {
            "icon": "lock",
            "title": "Không có bí mật trong tập tin cấu hình",
            "description": "Khi đăng nhập, cấu hình của bạn chỉ giữ điểm cuối URL. Nếu bạn sử dụng khóa API, hãy giữ nó trong biến môi trường chứ không phải tệp được chia sẻ."
          },
          {
            "icon": "shield",
            "title": "Thu hồi quyền truy cập bất cứ lúc nào",
            "description": "Các ứng dụng khách đã đăng nhập được liệt kê trong Bảng điều khiển → API, nơi bạn có thể thu hồi chúng. Việc tạo khóa API mới sẽ vô hiệu hóa khóa cũ ngay lập tức."
          }
        ]
      },
      "billing": {
        "kicker": "Định giá",
        "title": {
          "lead": "Được bao trả bởi gói ",
          "accent": " API ",
          "tail": " của bạn"
        },
        "lead": "Máy chủ MCP sử dụng cùng hạn mức yêu cầu hàng tháng như API thu thập dữ liệu và API đánh giá. Mỗi cuộc gọi công cụ thành công được tính là một yêu cầu.",
        "compare": "So sánh các gói API",
        "head": {
          "plan": "Kế hoạch",
          "requests": "Yêu cầu hàng tháng",
          "scale": "(thang đo log)",
          "price": "Giá"
        }
      },
      "faq": {
        "title": {
          "lead": "",
          "accent": "Câu hỏi thường gặp",
          "tail": ""
        },
        "items": [
          {
            "question": "Máy chủ MapsGrab MCP là gì?",
            "answer": "Tìm địa điểm Google Maps, đọc đánh giá và lấy URL ảnh công khai của doanh nghiệp qua một kết nối MCP. search_places / list_reviews / list_photos."
          },
          {
            "question": "Những khách hàng nào có thể kết nối?",
            "answer": "Bất kỳ máy khách MCP nào hỗ trợ Streamable HTTP: Claude Code, Cursor, VS Code, Codex, MCP Inspector và các máy khách khác. Sử dụng điểm cuối URL chính xác như được hiển thị, bao gồm cả dấu gạch chéo ở cuối."
          },
          {
            "question": "Nó được xác thực như thế nào?",
            "answer": "Với đăng nhập OAuth: Claude Code, Cursor, VS Code, Codex và các ứng dụng khách khác hỗ trợ ủy quyền MCP, hãy mở MapsGrab trong trình duyệt của bạn; bạn phê duyệt khách hàng và có thể thu hồi nó sau trong Bảng điều khiển → API. Chỉ khi khách hàng của bạn không thể đăng nhập, hãy chuyển khóa API của bạn làm mã thông báo mang trong tiêu đề Authorization."
          },
          {
            "question": "Các cuộc gọi công cụ được tính như thế nào?",
            "answer": "Mỗi lệnh gọi thành công tính là một yêu cầu, kể cả khi chỉ trả một phần ảnh, bất kể số ảnh. Nếu không thể trả ảnh hợp lệ, lệnh gọi báo lỗi và không trừ hạn mức. Tìm kiếm, đánh giá, ảnh và MCP dùng chung hạn mức tháng."
          },
          {
            "question": "Đại lý của tôi có thể lấy ảnh doanh nghiệp không?",
            "answer": "list_photos(fid, max_results): Lấy URL ảnh công khai của doanh nghiệp dưới dạng JSON bằng fid. max_results giới hạn số ảnh trả về; kết quả chỉ là một phần và không bảo đảm toàn bộ album. Giới hạn trả ảnh là số nguyên dương, mặc định 200. Không bảo đảm đủ số ảnh này."
          }
        ]
      },
      "cta": {
        "title": {
          "lead": "Cung cấp cho đại lý của bạn ",
          "accent": " dữ liệu Bản đồ trực tiếp ",
          "tail": ""
        },
        "lead": "Tìm địa điểm Google Maps, đọc đánh giá và lấy URL ảnh công khai của doanh nghiệp qua một kết nối MCP."
      }
    },
    "tools": {
      "common": {
        "crumbRoot": "Công cụ miễn phí",
        "guide": {
          "kicker": "Giới thiệu về công cụ này",
          "title": {
            "lead": "Nó có tác dụng gì và ",
            "accent": " cách sử dụng ",
            "tail": ""
          },
          "lead": "Mọi thứ đều chạy trong trình duyệt của bạn — không có gì bạn dán hoặc tải lên rời khỏi thiết bị của bạn."
        },
        "related": {
          "kicker": "Công cụ liên quan",
          "title": {
            "lead": "Các công cụ miễn phí khác dành cho ",
            "accent": " Dữ liệu bản đồ ",
            "tail": ""
          },
          "lead": "Các tiện ích nhỏ chạy hoàn toàn trong trình duyệt của bạn — những gì bạn dán sẽ không bao giờ rời khỏi thiết bị của bạn."
        },
        "faq": {
          "kicker": "Câu hỏi thường gặp",
          "lead": "Những câu trả lời ngắn gọn. Bất cứ điều gì khác, hỗ trợ chỉ cần một email.",
          "contact": "Liên hệ hỗ trợ"
        },
        "cta": {
          "kicker": "Khai thác hàng loạt",
          "primary": "Cài đặt MapsGrab",
          "secondary": "Xem giá",
          "note": "Bao gồm hạn ngạch hàng tháng miễn phí. Không có thẻ tín dụng."
        },
        "resultHeading": "Kết quả",
        "copy": "Sao chép",
        "copied": "Đã sao chép vào bảng nhớ tạm.",
        "downloadCsv": "Tải xuống CSV",
        "genericError": "Đã xảy ra lỗi. Hãy kiểm tra thông tin đầu vào của bạn và thử lại."
      },
      "placeIdFinder": {
        "seo": {
          "title": "Công cụ tìm Place ID - Nhận Google Maps Place ID từ URL | MapsGrab",
          "description": "Dán Google Maps vào vị trí URL và nhận Place ID, CID và FID ngay lập tức. Công cụ tìm Place ID dựa trên trình duyệt miễn phí - không cần đăng nhập, URL không bao giờ rời khỏi thiết bị của bạn."
        },
        "hero": {
          "title": {
            "lead": "Công cụ tìm Place ID ",
            "accent": " ",
            "tail": ""
          },
          "description": "Dán Google Maps đầy đủ vào vị trí URL và đọc Place ID, CID và FID của nó chỉ bằng một cú nhấp chuột. Mọi thứ đều được giải mã trong trình duyệt của bạn - URL không bao giờ được tải lên."
        },
        "form": {
          "urlLabel": "Google Maps địa điểm URL",
          "urlPlaceholder": "https://www.google.com/maps/place/…/data=…",
          "submit": "Tìm Place ID",
          "errorShortLink": "Liên kết ngắn (maps.app.goo.gl) không được hỗ trợ. Mở liên kết trong trình duyệt của bạn và dán URL đầy đủ từ thanh địa chỉ.",
          "errorInvalidUrl": "Đây không giống Google Maps đặt URL. Mở một địa điểm trong Google Maps và sao chép toàn bộ URL (nó phải chứa \"/maps/place/\" và \"@\" hoặc \"data=\").",
          "errorNoIds": "Không tìm thấy số nhận dạng địa điểm nào trong URL này. Đảm bảo bạn đã sao chép URL của trang địa điểm chứ không phải trang kết quả tìm kiếm.",
          "examplesLabel": "Thử",
          "examples": {
            "city": "San Francisco",
            "business": "Quán cà phê · Portland",
            "shortLink": "Liên kết ngắn"
          }
        },
        "result": {
          "placeId": "Place ID",
          "cid": "CID",
          "fid": "FID",
          "placeIdNote": "base64url của hai nửa FID",
          "cidNote": "FID 2nửa nửa, thập lục phân → thập phân",
          "fidNote": "hai phân đoạn 0x… cuối cùng trong URL",
          "anatomy": {
            "fidHigh": "FID · 1 nửa đầu",
            "fidLow": "FID · 2nd nửa",
            "empty": "Dán một địa điểm URL — các mã nhận dạng mà nó mang sẽ sáng lên ở đây."
          },
          "missing": "Không có trong liên kết này",
          "copyLabel": "Sao chép {label}",
          "privacy": "Được giải mã trong trình duyệt của bạn - URL không bao giờ được tải lên."
        },
        "chips": [
          {
            "label": "Phím Google API",
            "value": "Không cần thiết"
          },
          {
            "label": "URL của bạn",
            "value": "Chưa bao giờ tải lên"
          }
        ],
        "steps": {
          "head": {
            "kicker": "Nó hoạt động như thế nào",
            "title": {
              "lead": "Từ liên kết Bản đồ đến ",
              "accent": " Place ID ",
              "tail": ""
            },
            "lead": "Không có khóa API và không đăng nhập - số nhận dạng đã có sẵn ở vị trí URL mà bạn sao chép."
          },
          "items": [
            {
              "heading": "Mở địa điểm trong Google Maps",
              "body": "Tìm kiếm doanh nghiệp và nhấp vào danh sách của doanh nghiệp đó để mở trang địa điểm."
            },
            {
              "heading": "Sao chép đầy đủ URL",
              "body": "Sao chép URL dài từ thanh địa chỉ — nó chứa tên doanh nghiệp, phân đoạn tọa độ \"@\" và tham số \"data=\"."
            },
            {
              "heading": "Dán và giải mã",
              "body": "Dán nó lên trên và nhấn \"Tìm Place ID\". Place ID, CID và FID xuất hiện, mỗi nút có một nút sao chép."
            }
          ],
          "copiedBadge": "Đã sao chép",
          "note": "Không thể giải mã các liên kết ngắn như maps.app.goo.gl nếu không theo dõi chúng trên các tên miền, vì vậy hãy mở liên kết trước và dán địa chỉ đầy đủ."
        },
        "identifiers": {
          "head": {
            "kicker": "Các định danh",
            "title": {
              "lead": "Ba ID, ",
              "accent": " một nơi ",
              "tail": ""
            },
            "lead": "Place ID là mã định danh ổn định của Google cho một vị trí — một chuỗi bắt đầu bằng \"ChIJ\" vẫn hợp lệ ngay cả khi doanh nghiệp đổi tên hoặc di chuyển."
          },
          "keys": {
            "placeId": "Chuỗi \"ChIJ...\" được sử dụng bởi API của Địa điểm, tiện ích đánh giá và hệ thống đặt chỗ.",
            "fid": "Một cặp giá trị thập lục phân xác định cùng một tính năng bên trong.",
            "cid": "Dạng thập phân của nửa sau của FID, được sử dụng bởi Maps URLs cũ hơn và công cụ quảng cáo."
          },
          "derive": {
            "label": "Place ID và CID có nguồn gốc từ FID như thế nào",
            "source": "FID từ URL",
            "protobuf": "protobuf · endian nhỏ",
            "base64": "base64url",
            "secondHalf": "2và một nửa",
            "hexToDecimal": "hex → thập phân"
          },
          "features": [
            {
              "heading": "Không có khóa API",
              "body": "Place ID đã được mã hóa bên trong vị trí URL bạn dán nên công cụ có thể giải mã ngoại tuyến."
            },
            {
              "heading": "Không có giới hạn tỷ lệ",
              "body": "Không có dịch vụ tra cứu nào liên quan — việc chuyển đổi từ Maps URL sang Place ID là mang tính quyết định."
            },
            {
              "heading": "Chưa bao giờ tải lên",
              "body": "Toàn bộ quá trình tính toán chạy trong tab trình duyệt của bạn - URL bạn dán không bao giờ được gửi đến bất kỳ máy chủ nào."
            }
          ]
        },
        "faq": {
          "title": {
            "lead": "",
            "accent": "Câu hỏi thường gặp",
            "tail": ""
          },
          "items": [
            {
              "question": "Place ID có bao giờ thay đổi không?",
              "answer": "Hiếm khi. Tài liệu Google Đặt ID làm số nhận dạng ổn định lâu dài nhưng một số lượng nhỏ ID có thể bị loại bỏ khi các vị trí được hợp nhất hoặc cơ cấu lại. Nếu người dùng Place ID báo cáo nó là không hợp lệ, hãy tra cứu lại vị trí đó và làm mới giá trị được lưu trữ."
            },
            {
              "question": "Place ID có giống với CID không?",
              "answer": "Không. CID là số nhận dạng thập phân được sử dụng bởi các công cụ quảng cáo và liên kết Maps cũ hơn, trong khi Place ID là chuỗi \"ChIJ...\" được sử dụng bởi API của Địa điểm. Chúng xác định cùng một tính năng nhưng không thể thay thế cho nhau, đó là lý do tại sao công cụ này báo cáo cả hai."
            },
            {
              "question": "Tại sao liên kết maps.app.goo.gl của tôi bị từ chối?",
              "answer": "Các liên kết ngắn chỉ phân giải đến vị trí đầy đủ URL sau khi chuyển hướng giữa nhiều tên miền, điều mà một công cụ chỉ dành cho trình duyệt không thể tuân theo nếu không gửi liên kết của bạn cho bên thứ ba. Mở liên kết ngắn trong trình duyệt của bạn và dán URL đầy đủ xuất hiện trên thanh địa chỉ."
            },
            {
              "question": "Tôi có cần khóa Google API cho việc này không?",
              "answer": "Không. Place ID đã được mã hóa bên trong vị trí URL bạn dán nên công cụ có thể giải mã ngoại tuyến. Khóa Google API chỉ cần thiết khi bạn muốn gọi Địa điểm API bằng ID sau đó."
            }
          ]
        },
        "cta": {
          "title": {
            "lead": "Cần ID địa điểm ",
            "accent": " trên quy mô lớn? ",
            "tail": ""
          },
          "lead": "MapsGrab trích xuất Place ID, CID và FID cho mọi doanh nghiệp mà nó thu thập — cùng với các cột 33 khác — và xuất thẳng sang CSV hoặc JSON."
        }
      },
      "reviewLinkGenerator": {
        "seo": {
          "title": "Trình tạo liên kết đánh giá Google - Đánh giá trực tiếp miễn phí URL | MapsGrab",
          "description": "Biến địa điểm Google Maps URL thành liên kết đánh giá Google trực tiếp mà bạn có thể chia sẻ với khách hàng. Miễn phí, dựa trên trình duyệt và không có gì được tải lên."
        },
        "hero": {
          "title": {
            "lead": "Liên kết đánh giá Google Máy phát điện ",
            "accent": " ",
            "tail": ""
          },
          "description": "Dán địa điểm Google Maps URL và nhận liên kết \"viết đánh giá\" trực tiếp cho doanh nghiệp đó — con đường ngắn nhất từ ​​một khách hàng hài lòng đến một bài đánh giá Google."
        },
        "form": {
          "urlLabel": "Google Maps địa điểm URL",
          "urlPlaceholder": "https://www.google.com/maps/place/…/data=…",
          "submit": "Tạo liên kết đánh giá",
          "errorShortLink": "Liên kết ngắn (maps.app.goo.gl) không được hỗ trợ. Mở liên kết trong trình duyệt của bạn và dán URL đầy đủ từ thanh địa chỉ.",
          "errorInvalidUrl": "Đây không giống Google Maps đặt URL. Mở một địa điểm trong Google Maps và sao chép toàn bộ URL (nó phải chứa \"/maps/place/\" và \"@\" hoặc \"data=\").",
          "errorNoIds": "Không tìm thấy số nhận dạng địa điểm nào trong URL này. Đảm bảo bạn đã sao chép URL của trang địa điểm chứ không phải trang kết quả tìm kiếm."
        },
        "result": {
          "linkLabel": "Liên kết đánh giá",
          "open": "Mở"
        },
        "howTo": [
          {
            "heading": "Link đánh giá Google là gì?",
            "body": "Liên kết đánh giá là lối tắt mở hộp thoại đánh giá của một doanh nghiệp cụ thể trên Google. Thay vì yêu cầu khách hàng tìm kiếm doanh nghiệp của bạn, hãy cuộn tới phần đánh giá và nhấn \"Viết đánh giá\", bạn gửi cho họ một URL — search.google.com/local/reviews?placeid=… — thông tin này sẽ xuất hiện trực tiếp trên biểu mẫu đánh giá. Các doanh nghiệp đặt các liên kết này trong email theo dõi, mã QR tại quầy và tin nhắn SMS sau giao dịch."
          },
          {
            "heading": "Cách tạo liên kết đánh giá",
            "body": "Mở Google Maps, tìm doanh nghiệp của bạn và mở trang địa điểm của doanh nghiệp đó. Sao chép URL dài từ thanh địa chỉ và dán lên trên. Nhấn \"Tạo liên kết đánh giá\" và công cụ sẽ tạo liên kết trực tiếp với ID địa điểm được mã hóa, sẵn sàng sao chép hoặc mở. Liên kết này rất phổ biến: nó hoạt động trên các trình duyệt trên máy tính để bàn và trên ứng dụng di động Google Maps."
          },
          {
            "heading": "ID địa điểm đến từ đâu",
            "body": "Công cụ này sử dụng lại giải mã cục bộ giống như Trình tìm kiếm Place ID: mã định danh đã có trong Maps URL và việc chuyển đổi sang biểu mẫu \"ChIJ...\" diễn ra hoàn toàn trong trình duyệt của bạn. Nếu bạn quản lý một số vị trí, hãy lặp lại quy trình cho mỗi vị trí — hoặc để MapsGrab mang cột Place ID trong mỗi lần xuất để có thể tạo hàng loạt liên kết đánh giá từ bảng tính."
          }
        ],
        "faq": {
          "title": {
            "lead": "",
            "accent": "Câu hỏi thường gặp",
            "tail": ""
          },
          "items": [
            {
              "question": "Các liên kết đánh giá có hết hạn không?",
              "answer": "Không. Liên kết được liên kết với ID địa điểm của vị trí mà Google giữ ổn định. Miễn là địa điểm đó tồn tại trên Google Maps, liên kết sẽ tiếp tục mở hộp thoại đánh giá."
            },
            {
              "question": "Tôi có thể sử dụng một liên kết cho nhiều địa điểm không?",
              "answer": "Mỗi liên kết đánh giá thuộc về chính xác một nơi. Tạo một liên kết riêng cho mỗi vị trí — các doanh nghiệp đa địa điểm thường giữ một bảng ID địa điểm và lấy các liên kết từ đó."
            },
            {
              "question": "Yêu cầu đánh giá bằng liên kết có được phép không?",
              "answer": "Yêu cầu khách hàng đánh giá trung thực là được; khuyến khích hoặc lọc đánh giá thì không. Chính sách của Google cấm bồi thường cho các đánh giá và kiểm soát đánh giá - gửi cùng một liên kết đến mọi khách hàng và để phản hồi tự nói lên điều đó."
            },
            {
              "question": "Tại sao liên kết của tôi mở ra một trang tìm kiếm thay vì mẫu đánh giá?",
              "answer": "Điều đó xảy ra khi ID địa điểm trong liên kết bị sai — thường là do URL được chỉnh sửa thủ công. Tạo lại liên kết từ vị trí Bản đồ ban đầu URL và xác minh Place ID bắt đầu bằng \"ChIJ\"."
            }
          ]
        },
        "cta": {
          "title": {
            "lead": "Theo dõi mọi đánh giá mà bạn ",
            "accent": " kiếm được ",
            "tail": ""
          },
          "lead": "MapsGrab lấy các bài đánh giá của bất kỳ trang kinh doanh nào — xếp hạng, văn bản, ngày tháng và câu trả lời của chủ sở hữu — để bạn có thể xem vùng phản hồi và trả lời nhanh hơn."
        }
      },
      "emailChecker": {
        "seo": {
          "title": "Trình kiểm tra email - Trình xác thực định dạng email miễn phí | MapsGrab",
          "description": "Kiểm tra địa chỉ email để tìm lỗi cú pháp và lỗi chính tả phổ biến ngay lập tức. Xác thực định dạng miễn phí chạy trong trình duyệt của bạn - không cần thăm dò SMTP, không có gì được gửi đi bất cứ đâu."
        },
        "hero": {
          "title": {
            "lead": "Email Trình kiểm tra ",
            "accent": " ",
            "tail": ""
          },
          "description": "Nhập địa chỉ email và ngay lập tức xem liệu định dạng của nó có hợp lệ hay không — cùng với gợi ý về các lỗi chính tả phổ biến nhất. Mọi thứ đều chạy trong trình duyệt của bạn."
        },
        "form": {
          "emailLabel": "Địa chỉ email",
          "emailPlaceholder": "name@example.com",
          "submit": "Xác minh email",
          "validHeading": "Địa chỉ email này có vẻ hợp lệ.",
          "invalidHeading": "Địa chỉ email này có vấn đề:",
          "issues": {
            "empty": "Nhập địa chỉ email đầu tiên.",
            "multipleAt": "Địa chỉ chứa nhiều hơn một ký hiệu \"@\".",
            "missingAt": "Địa chỉ thiếu \"@\" để phân tách phần cục bộ với miền.",
            "localEmpty": "Phần trước \"@\" trống.",
            "localTooLong": "Phần trước \"@\" dài hơn các ký tự 64 được tiêu chuẩn email cho phép.",
            "localInvalidChars": "Phần trước \"@\" chứa các ký tự không được phép trong địa chỉ email (dấu cách, dấu ngoặc kép hoặc ký tự điều khiển).",
            "localDotPosition": "Các dấu chấm ở phần cục bộ không thể ở vị trí đầu tiên, cuối cùng hoặc xuất hiện hai lần liên tiếp.",
            "domainEmpty": "Phần sau \"@\" trống.",
            "domainNoTld": "Miền không có phần cuối (TLD) — hãy thêm nội dung nào đó như \".com\" hoặc \".org\".",
            "domainInvalidChars": "Miền chứa các ký tự không được phép (dấu cách, dấu gạch dưới hoặc ký hiệu).",
            "domainLabelHyphen": "Nhãn tên miền không thể bắt đầu hoặc kết thúc bằng dấu gạch nối.",
            "domainEmptyLabel": "Miền chứa hai dấu chấm liên tiếp hoặc một đoạn trống.",
            "domainTooLong": "Tên miền dài hơn các ký tự 253 được tiêu chuẩn email cho phép.",
            "typoDomain": "Tên miền này trông giống như lỗi đánh máy của một nhà cung cấp dịch vụ thư phổ biến."
          }
        },
        "howTo": [
          {
            "heading": "Trình kiểm tra này làm gì - và nó cố tình không làm gì",
            "body": "Công cụ này xác thực định dạng của địa chỉ email: hình dạng của phần cục bộ, \"@\" và miền, tuân theo các quy tắc thực tế của thông số kỹ thuật RFC mà máy chủ thư thực sự thực thi. Nó cũng gắn cờ các lỗi đánh máy có thể xảy ra của các nhà cung cấp hộp thư phổ biến, nguyên nhân phổ biến nhất khiến các địa chỉ không hoạt động trong danh sách khách hàng tiềm năng. Nó không gửi bất kỳ cuộc thăm dò nào đến máy chủ thư: xác minh SMTP sẽ tiết lộ địa chỉ cho bên thứ ba, điều này mâu thuẫn với việc chạy toàn bộ kiểm tra cục bộ trong trình duyệt của bạn."
          },
          {
            "heading": "Cách kiểm tra địa chỉ email",
            "body": "Nhập hoặc dán địa chỉ và nhấn \"Xác minh email\". Kết quả màu xanh lá cây có nghĩa là định dạng có hình dạng có thể phân phối được; kết quả màu đỏ liệt kê mọi quy tắc mà địa chỉ đó vi phạm và — khi miền trông giống như một nhà cung cấp sai chính tả — gợi ý quy tắc dự định. Khắc phục sự cố được báo cáo và xác minh lại cho đến khi vượt qua địa chỉ."
          },
          {
            "heading": "Nơi kiểm tra định dạng phù hợp với quy trình làm việc dữ liệu",
            "body": "Xác thực định dạng là bộ lọc đầu tiên, rẻ nhất cho bất kỳ danh sách email nào: nó loại bỏ các địa chỉ không bao giờ có thể tiếp cận hộp thư trước khi bạn chi tiêu ngân sách khả năng gửi hoặc tăng cường cho chúng. MapsGrab áp dụng suy nghĩ này cho toàn bộ quy trình làm việc của khách hàng tiềm năng — tiện ích mở rộng làm phong phú thêm mọi doanh nghiệp được thu thập bằng các địa chỉ email được tìm thấy trên trang web chính thức của nó, vì vậy, bước xác minh tiếp theo sẽ bắt đầu từ một danh sách rõ ràng hơn nhiều."
          }
        ],
        "faq": {
          "title": {
            "lead": "",
            "accent": "Câu hỏi thường gặp",
            "tail": ""
          },
          "items": [
            {
              "question": "Công cụ này có kiểm tra xem hộp thư có thực sự tồn tại không?",
              "answer": "Không - cố ý. Việc kiểm tra sự tồn tại yêu cầu truy vấn máy chủ thư của người nhận (thăm dò SMTP), việc này không thể thực hiện riêng tư trong trình duyệt và có thể khiến IP của bạn bị gắn cờ. Công cụ này xác minh mọi thứ có thể được xác minh mà không cần chạm vào mạng: cấu trúc, ký tự được phép và lỗi chính tả phổ biến của nhà cung cấp."
            },
            {
              "question": "Một địa chỉ có thể vượt qua đây và vẫn bị trả lại không?",
              "answer": "Đúng. Một địa chỉ hoàn hảo về mặt cú pháp vẫn có thể bị đóng, đầy đủ hoặc bị bỏ qua. Xác thực định dạng sẽ loại bỏ các địa chỉ sai thậm chí trước khi cố gắng gửi - nó không thể đảm bảo rằng hộp thư trông hợp lệ sẽ được con người đọc."
            },
            {
              "question": "Tại sao \"name@localhost\" bị từ chối?",
              "answer": "Trình kiểm tra yêu cầu một miền có đuôi công khai (TLD) vì các địa chỉ không có đuôi công khai sẽ không thể nhận thư từ internet bên ngoài. Các tiêu chuẩn chỉ cho phép tên miền nội bộ không liên quan đến danh sách khách hàng tiềm năng và dữ liệu khách hàng."
            },
            {
              "question": "Dữ liệu đầu vào của tôi có được lưu trữ ở đâu không?",
              "answer": "Không. Quá trình xác thực diễn ra dưới dạng JavaScript đơn giản trong tab trình duyệt của bạn; không có gì được truyền đi, ghi lại hoặc lưu trữ - hãy tải lại trang và nội dung đầu vào sẽ biến mất."
            }
          ]
        },
        "cta": {
          "title": {
            "lead": "Thu thập các email có giá trị ",
            "accent": " xác minh ",
            "tail": ""
          },
          "lead": "MapsGrab tìm thấy địa chỉ email và hồ sơ xã hội đằng sau mỗi doanh nghiệp mà nó trích xuất — trực tiếp từ trang web riêng của mỗi doanh nghiệp."
        }
      },
      "latLongToDms": {
        "seo": {
          "title": "Chuyển đổi Lat Long sang DMS — Độ thập phân thành Độ Phút Giây | MapsGrab",
          "description": "Chuyển đổi vĩ độ và kinh độ thập phân sang định dạng độ, phút, giây (DMS) ngay lập tức. Trình chuyển đổi tọa độ dựa trên trình duyệt miễn phí, không có gì được tải lên."
        },
        "hero": {
          "title": {
            "lead": "Chuyển đổi Lat Long sang ",
            "accent": " DMS ",
            "tail": ""
          },
          "description": "Nhập vĩ độ và kinh độ thập phân và đọc cùng tọa độ theo độ, phút, giây — với các chữ cái bán cầu, sẵn sàng để sao chép."
        },
        "form": {
          "latitudeLabel": "Vĩ độ (thập phân, -90 đến 90)",
          "longitudeLabel": "Kinh độ (thập phân, -180 đến 180)",
          "placeholder": "37.774929",
          "submit": "Chuyển đổi sang DMS",
          "errorLatitude": "Vĩ độ phải là một số nằm trong khoảng -90 và 90.",
          "errorLongitude": "Kinh độ phải là một số nằm trong khoảng -180 và 180."
        },
        "result": {
          "dms": "Tọa độ trong DMS"
        },
        "howTo": [
          {
            "heading": "Độ thập phân và DMS là gì?",
            "body": "Bản đồ và bảng tính lưu trữ tọa độ dưới dạng độ thập phân — một số có dấu trên mỗi trục, như 37.774929, -122.419416. Khảo sát, biểu đồ hàng hải và nhiều tài liệu tài sản sử dụng ký hiệu thập lục phân cũ hơn: độ, phút và giây với các chữ cái bán cầu, như 37° 46' 29.74\" N, 122° 25' 9.90\" W. Cả hai đều mô tả cùng một điểm; biểu mẫu DMS chỉ đơn giản là chia phân số thành các đơn vị nhỏ hơn liên tiếp, trong đó một phút là độ 1/60 và một giây là phút 1/60."
          },
          {
            "heading": "Làm thế nào để chuyển đổi",
            "body": "Dán vĩ độ và kinh độ thập phân và nhấn \"Chuyển đổi sang DMS\". Các giá trị âm ánh xạ tới bán cầu nam và tây và được báo cáo là S và W. Giây được hiển thị bằng hai số thập phân - độ phân giải mặt đất khoảng một mét, chính xác hơn bất kỳ bản chụp GPS nào của người tiêu dùng. Sao chép kết quả dưới dạng một dòng cho tài liệu hoặc dưới dạng các trường riêng biệt cho bảng tính."
          },
          {
            "heading": "Tại sao điều này lại quan trọng đối với hoạt động của dữ liệu bản đồ",
            "body": "Các chuyến đi khứ hồi phối hợp là điểm xung đột hàng ngày khi di chuyển dữ liệu kinh doanh giữa các công cụ: Google Maps xuất số thập phân, trong khi quy trình địa chính và quy trình in yêu cầu DMS. MapsGrab giữ cho ma sát này ở mức thấp — mọi doanh nghiệp được trích xuất đều mang theo vĩ độ và kinh độ trong quá trình xuất và chuyển đổi tọa độ hàng loạt có thể chạy ngoại tuyến với cùng một công thức mà trang này sử dụng."
          }
        ],
        "faq": {
          "title": {
            "lead": "",
            "accent": "Câu hỏi thường gặp",
            "tail": ""
          },
          "items": [
            {
              "question": "Kết quả DMS chính xác đến mức nào?",
              "answer": "Giây được hiển thị đến hai số thập phân. Một giây vĩ độ bằng khoảng 30 mét, do đó, hai số thập phân có độ phân giải thành khoảng 30 centimet — chặt chẽ hơn nhiều so với dữ liệu GPS cơ bản. Độ chính xác bị giới hạn bởi đầu vào của bạn chứ không phải chuyển đổi."
            },
            {
              "question": "N, S, E và W ở đây có ý nghĩa gì?",
              "answer": "Chúng thay thế dấu của giá trị thập phân: vĩ độ dương là phía bắc (N) và vĩ độ âm là phía nam (S); kinh độ dương là phía đông (E) và âm là phía tây (W). Công cụ sẽ tự động chọn các chữ cái từ dấu hiệu."
            },
            {
              "question": "Tôi có thể chuyển DMS về dạng thập phân ở đây không?",
              "answer": "Có - sử dụng công cụ đồng hành \"Chuyển đổi DMS sang DD\" trên trang web này. Việc chuyển đổi cả hai cách với cùng cách thực hiện sẽ tránh được độ lệch làm tròn giữa các công thức khác nhau."
            },
            {
              "question": "Dữ liệu tọa độ của tôi có được tải lên không?",
              "answer": "Không. Việc chuyển đổi là số học đơn giản trong tab trình duyệt của bạn; không có gì bạn gõ rời khỏi trang."
            }
          ]
        },
        "cta": {
          "title": {
            "lead": "Tọa độ cho mọi doanh nghiệp, ",
            "accent": " đã trích xuất ",
            "tail": ""
          },
          "lead": "MapsGrab ghi vĩ độ và kinh độ vào mỗi hàng mà nó xuất — không cần tra cứu tọa độ thủ công cho dự án định tuyến hoặc lãnh thổ tiếp theo của bạn."
        }
      },
      "dmsToDd": {
        "seo": {
          "title": "Chuyển đổi DMS sang DD — Độ Phút Giây thành Độ thập phân | MapsGrab",
          "description": "Chuyển đổi độ, phút, giây tọa độ sang độ thập phân ngay lập tức. Trình chuyển đổi DMS sang DD miễn phí dựa trên trình duyệt, không có gì được tải lên."
        },
        "hero": {
          "title": {
            "lead": "Chuyển đổi DMS sang DD ",
            "accent": " (Lat, Long) ",
            "tail": ""
          },
          "description": "Nhập độ, phút và giây cho cả hai trục và nhận được độ thập phân rõ ràng — định dạng Google Maps, bảng tính và MapsGrab đều được hiểu."
        },
        "form": {
          "latitudeHeading": "Vĩ độ (N/S)",
          "longitudeHeading": "Kinh độ (E/W)",
          "degreesLabel": "Độ",
          "minutesLabel": "Phút cung",
          "secondsLabel": "Giây cung",
          "latitudeHemisphereLabel": "N / S",
          "longitudeHemisphereLabel": "E / W",
          "submit": "Chuyển đổi sang số thập phân",
          "errorValues": "Độ phải bằng 0 hoặc số nguyên dương, phút và giây phải nằm trong khoảng từ 0 đến 60."
        },
        "result": {
          "dd": "Tọa độ theo độ thập phân"
        },
        "howTo": [
          {
            "heading": "Tại sao chuyển đổi DMS về độ thập phân?",
            "body": "Độ-phút-giây là ký hiệu đối với con người, nhưng hầu như mọi hệ thống đối mặt với máy đều muốn có độ thập phân: tìm kiếm Google Maps, nhập GIS, công thức khoảng cách bảng tính và quy trình mã hóa địa lý. Việc chuyển đổi là một tổng có trọng số đơn giản — độ cộng với phút chia cho 60 cộng với giây chia cho 3600 — với chữ cái bán cầu quyết định dấu."
          },
          {
            "heading": "Làm thế nào để chuyển đổi",
            "body": "Điền độ, phút và giây cho vĩ độ và kinh độ rồi chọn các chữ cái bán cầu (N/S và E/W). Nhấn \"Chuyển đổi sang thập phân\" và công cụ xuất ra cả hai trục dưới dạng số thập phân có dấu với sáu chữ số thập phân, độ phân giải thành khoảng 11 cm trên mặt đất — quá đủ cho bất kỳ mục đích sử dụng địa điểm kinh doanh nào. Dán kết quả trực tiếp vào Google Maps hoặc bảng tính của bạn."
          },
          {
            "heading": "Giữ dữ liệu tọa độ nhất quán",
            "body": "Các ký hiệu hỗn hợp là lý do thông thường khiến các vị trí bị đưa vào nhầm đại dương sau khi nhập. Quyết định độ thập phân một lần và chuyển đổi mọi thứ ở ranh giới giúp đường ống luôn hoạt động tốt. MapsGrab đã xuất tọa độ theo độ thập phân, do đó dữ liệu được thu thập bằng tiện ích mở rộng sẽ được đưa vào các công cụ GIS và BI mà không cần bất kỳ bước chuyển đổi nào."
          }
        ],
        "faq": {
          "title": {
            "lead": "",
            "accent": "Câu hỏi thường gặp",
            "tail": ""
          },
          "items": [
            {
              "question": "Tôi cần bao nhiêu chữ số thập phân?",
              "answer": "Sáu chữ số thập phân có độ phân giải thành khoảng 11 centimet — vượt xa độ chính xác của GPS dành cho người tiêu dùng. Năm địa điểm (khoảng 1 mét) là đủ cho địa điểm kinh doanh; ít số thập phân cố tình làm mờ điểm."
            },
            {
              "question": "Các trường phải đáp ứng phạm vi nào?",
              "answer": "Phút và giây nằm trong khoảng từ 0 đến dưới 60. Độ vĩ độ lên tới 90 và kinh độ lên tới 180; bộ chuyển đổi sẽ báo cáo khi một giá trị xuất hiện bên ngoài địa cầu."
            },
            {
              "question": "Tôi có nên nhập số âm khi chọn S hoặc W không?",
              "answer": "Không - chữ bán cầu đã mã hóa dấu hiệu. Nếu bạn nhập một giá trị có dấu và một chữ cái xung đột cùng lúc, công cụ sẽ đánh dấu sự mâu thuẫn thay vì đoán."
            },
            {
              "question": "Việc chuyển đổi có được thực hiện trên máy chủ không?",
              "answer": "Không. Công thức chạy trong trình duyệt của bạn; không có gì bạn gõ được truyền đi bất cứ đâu."
            }
          ]
        },
        "cta": {
          "title": {
            "lead": "Bỏ qua công việc tọa độ thủ công ",
            "accent": " ở tỷ lệ ",
            "tail": ""
          },
          "lead": "MapsGrab xuất vĩ độ và kinh độ thập phân cho mọi doanh nghiệp mà nó thu thập, bên cạnh các cột địa chỉ, số điện thoại và Place ID."
        }
      },
      "bulkKeywords": {
        "seo": {
          "title": "Trình tạo từ khóa hàng loạt — Kết hợp từ khóa + vị trí | MapsGrab",
          "description": "Tạo hàng loạt kết hợp từ khóa và vị trí cho các tác vụ tìm kiếm bản đồ và SEO địa phương. Dán hai danh sách, nhận mọi kết hợp, tải xuống dưới dạng CSV. Miễn phí."
        },
        "hero": {
          "title": {
            "lead": "Từ khóa hàng loạt Trình tạo ",
            "accent": " ",
            "tail": ""
          },
          "description": "Dán từ khóa và vị trí của bạn và nhận mọi kết hợp \"từ khóa + vị trí\" dưới dạng danh sách sẵn sàng dán hoặc CSV — cách nhanh nhất để tạo chiến dịch tìm kiếm địa phương."
        },
        "form": {
          "keywordsLabel": "Từ khóa (mỗi dòng một từ)",
          "keywordsPlaceholder": "cơ quan thiết kế\nquán cà phê\nthợ sửa ống nước",
          "locationsLabel": "Vị trí (một trên mỗi dòng)",
          "locationsPlaceholder": "New York\nChicago\nAustin",
          "orderLabel": "Thứ tự kết hợp",
          "keywordFirst": "từ khóa + địa điểm (cơ quan thiết kế New York)",
          "locationFirst": "vị trí + từ khóa (cơ quan thiết kế New York)",
          "submit": "Tạo kết hợp",
          "resultCount": "Các kết hợp {count} được tạo.",
          "errorKeywords": "Thêm ít nhất một từ khóa.",
          "errorLocations": "Thêm ít nhất một vị trí."
        },
        "howTo": [
          {
            "heading": "Tạo từ khóa số lượng lớn để làm gì?",
            "body": "Chiến dịch tìm kiếm địa phương hoạt động dựa trên sự kết hợp: cùng một dịch vụ được lặp lại trên mọi thành phố, quận hoặc vùng lân cận mà bạn phục vụ. Mười từ khóa trên mười địa điểm là một trăm cụm từ tìm kiếm — \"đại lý thiết kế New York\", \"đại lý thiết kế Chicago\", v.v. Viết chúng bằng tay rất dễ mắc lỗi; việc tạo chúng từ hai danh sách chỉ mất vài giây và đảm bảo không bỏ sót điều gì."
          },
          {
            "heading": "Cách tạo kết hợp",
            "body": "Dán từ khóa của bạn vào hộp đầu tiên — mỗi từ khóa trên một dòng — và vị trí của bạn vào hộp thứ hai. Chọn xem từ khóa hoặc vị trí xuất hiện trước, sau đó nhấn \"Tạo\". Mỗi từ khóa được ghép nối với mọi vị trí, loại bỏ các dòng trống và trùng lặp và danh sách đầy đủ xuất hiện bên dưới cùng với số lượng. Sao chép thẳng vào danh sách từ khóa Quảng cáo Google, kiểm tra Xu hướng Google hoặc hàng đợi tác vụ quét bản đồ."
          },
          {
            "heading": "Từ danh sách từ khóa đến dữ liệu được thu thập",
            "body": "Bước cổ điển tiếp theo là chạy từng kết hợp dưới dạng tìm kiếm Google Maps và thu thập kết quả. Vòng lặp đó chính xác là những gì MapsGrab tự động hóa: tiện ích mở rộng chấp nhận danh sách từ khóa dưới dạng tác vụ hàng loạt, duyệt từng tìm kiếm một và xuất mọi doanh nghiệp mà nó tìm thấy — vì vậy, các kết hợp bạn tạo ở đây trở thành các hàng có cấu trúc mà không cần sao chép thủ công."
          }
        ],
        "faq": {
          "title": {
            "lead": "",
            "accent": "Câu hỏi thường gặp",
            "tail": ""
          },
          "items": [
            {
              "question": "Tôi có thể tạo bao nhiêu kết hợp?",
              "answer": "Trình duyệt của bạn có thể chứa bao nhiêu — công cụ sẽ nhân hai danh sách và loại bỏ chúng trùng lặp cục bộ. Mười nghìn sự kết hợp đều được; đối với các lô rất lớn, việc tải xuống CSV thực tế hơn việc sao chép vùng văn bản."
            },
            {
              "question": "Các bản sao có bị loại bỏ không?",
              "answer": "Đúng. Các dòng trùng lặp trong mỗi danh sách sẽ bị loại bỏ trước khi ghép nối và đầu ra chứa mỗi cặp từ khóa-vị trí đúng một lần, theo thứ tự bạn đã chọn."
            },
            {
              "question": "Tôi nên sử dụng thứ tự nào?",
              "answer": "Cả hai đều là hành vi tìm kiếm thực sự. \"Thợ sửa ống nước Austin\" đọc giống như cách mọi người nhập vào Maps; \"Thợ sửa ống nước Austin\" đọc giống như cụm từ SEO truyền thống. Tạo cả hai đơn hàng là cách phổ biến để bao gồm các biến thể tìm kiếm."
            },
            {
              "question": "Tôi có thể sử dụng các quận hoặc mã bưu điện của thành phố làm địa điểm không?",
              "answer": "Có — bất kỳ điều gì có ý nghĩa khi hậu tố tìm kiếm trên Maps hoạt động: quận, mã bưu điện, khu vực đô thị lớn hoặc các cặp \"thành phố, tiểu bang\" đầy đủ. Một dòng cho mỗi vị trí."
            }
          ]
        },
        "cta": {
          "title": {
            "lead": "Biến danh sách từ khóa thành kết quả ",
            "accent": " ",
            "tail": ""
          },
          "lead": "Nhiệm vụ hàng loạt của MapsGrab chạy mọi từ khóa dưới dạng tìm kiếm trên Bản đồ và xuất các doanh nghiệp đằng sau chúng — CSV hoặc JSON, cùng với các bài đánh giá, ảnh và thông tin liên hệ phong phú."
        }
      },
      "mergeCsv": {
        "seo": {
          "title": "Hợp nhất các tệp CSV trực tuyến - Kết hợp nhiều tệp CSV miễn phí | MapsGrab",
          "description": "Hợp nhất nhiều tệp CSV trực tuyến thành một tệp. Tiêu đề cột được căn chỉnh tự động theo liên kết - miễn phí, riêng tư và hoàn toàn dựa trên trình duyệt."
        },
        "hero": {
          "title": {
            "lead": "Hợp nhất các tệp CSV ",
            "accent": " trực tuyến ",
            "tail": ""
          },
          "description": "Tải lên hai hoặc nhiều tệp CSV và tải xuống một tệp đã hợp nhất. Các cột được căn chỉnh theo tiêu đề - các trường bị thiếu sẽ được để trống. Các tập tin không bao giờ rời khỏi trình duyệt của bạn."
        },
        "form": {
          "filesLabel": "Các tập tin CSV",
          "filesHint": "Chọn hai hoặc nhiều tệp .csv. Kiểm tra từng tệp có nhãn đã dịch trên hàng 2 để bỏ qua hàng đó. CSV được hợp nhất giữ một hàng tiêu đề tên trường. Các tập tin vẫn ở trong trình duyệt của bạn.",
          "translationRow": "Bỏ qua hàng 2 (nhãn đã dịch) trong {name}",
          "submit": "Hợp nhất các tập tin",
          "errorNoFiles": "Chọn ít nhất hai tệp CSV để hợp nhất.",
          "errorEmptyFile": "Một trong các tệp trống hoặc không có hàng tiêu đề: {name}",
          "fileSummary": "{name} - Hàng dữ liệu {rows}",
          "resultSummary": "Đã hợp nhất các tệp {files} thành các hàng {rows} × cột {columns}.",
          "previewLabel": "Đã hợp nhất bản xem trước CSV"
        },
        "howTo": [
          {
            "heading": "Việc sáp nhập làm gì ở đây?",
            "body": "Hợp nhất các ngăn xếp một số CSV xuất vào một bảng: các cột được căn chỉnh theo tên tiêu đề trên tất cả các tệp và mỗi hàng dữ liệu giữ các giá trị của nó dưới tiêu đề phù hợp. Các tệp được kết hợp từ trên xuống dưới theo thứ tự bạn đã chọn, do đó kết quả sẽ được đọc dưới dạng một tập dữ liệu liên tục. Các cột chỉ tồn tại trong một số tệp vẫn ở đầu ra; các hàng từ các tệp không có chúng sẽ nhận được các ô trống — sự kết hợp của tất cả các tiêu đề."
          },
          {
            "heading": "Cách hợp nhất các tệp CSV",
            "body": "Chọn hai hoặc nhiều tệp .csv — ví dụ: xuất hàng tuần quy trình quét bản đồ. Nhấn \"Hợp nhất tệp\" và công cụ sẽ phân tích cú pháp mọi tệp trong trình duyệt của bạn, báo cáo số lượng hàng của từng tệp và xây dựng bảng đã hợp nhất. Tải xuống dưới dạng một CSV duy nhất mở rõ ràng trong Excel, Trang tính Google hoặc bất kỳ thao tác nhập cơ sở dữ liệu nào."
          },
          {
            "heading": "Được xây dựng để thu thập dữ liệu nhiều lần",
            "body": "Trường hợp sử dụng điển hình là nối thêm các lần chạy: mỗi phiên trích xuất MapsGrab xuất CSV của riêng nó và việc hợp nhất sẽ đưa các phiên trong tuần vào một tập dữ liệu trước khi loại bỏ trùng lặp và làm sạch. Trình phân tích cú pháp xử lý các trường được trích dẫn, dấu phẩy được nhúng và dòng mới bên trong các ô (RFC 4180), do đó các bản xuất có địa chỉ nhiều dòng hoặc đoạn đánh giá sẽ hợp nhất một cách chính xác."
          }
        ],
        "faq": {
          "title": {
            "lead": "",
            "accent": "Câu hỏi thường gặp",
            "tail": ""
          },
          "items": [
            {
              "question": "Điều gì xảy ra khi các tệp có các cột khác nhau?",
              "answer": "Tệp đã hợp nhất chứa sự kết hợp của tất cả các tiêu đề theo thứ tự chúng xuất hiện lần đầu tiên. Các hàng từ các tệp thiếu cột sẽ nhận được một ô trống trong cột đó. Không có gì bị bỏ hoặc đổi tên."
            },
            {
              "question": "Các tập tin của tôi có được tải lên máy chủ không?",
              "answer": "Không. Các tệp được đọc bằng FileReader API của trình duyệt và được hợp nhất vào bộ nhớ trong tab của bạn. Không có gì được truyền đi và việc đóng trang sẽ xóa mọi thứ."
            },
            {
              "question": "Việc hợp nhất có loại bỏ các hàng trùng lặp không?",
              "answer": "Không - hợp nhất là nối thẳng với các cột được căn chỉnh. Chống trùng lặp (ví dụ: bởi Place ID) là một bước dọn dẹp riêng biệt mà bạn chạy trên tệp đã hợp nhất."
            },
            {
              "question": "Các tập tin có thể lớn đến mức nào?",
              "answer": "Giới hạn là bộ nhớ của tab trình duyệt của bạn chứ không phải là một con số cố định. Đối với việc xuất dữ liệu kinh doanh điển hình — hàng nghìn đến vài trăm nghìn hàng — việc hợp nhất diễn ra ngay lập tức. Đối với các tệp rất lớn, hợp nhất theo đợt."
            }
          ]
        },
        "cta": {
          "title": {
            "lead": "Một lần xuất cho mỗi lần chạy - hoặc ",
            "accent": " một tập dữ liệu ",
            "tail": ""
          },
          "lead": "MapsGrab xuất CSV/JSON sạch mỗi phiên với lựa chọn trường và chống trùng lặp Place ID, do đó, các bộ dữ liệu nhiều lần chạy gần như đã được hợp nhất."
        }
      }
    }
  }
}

export const company: CompanyContent = {
  "footerGroupLabel": "Công ty",
  "about": {
    "navLabel": "Về",
    "seoTitle": "Giới thiệu về MapsGrab | Sản phẩm và ranh giới",
    "seoDescription": "MapsGrab là bộ công cụ dữ liệu bản đồ dành cho dữ liệu doanh nghiệp công cộng: tiện ích mở rộng trình duyệt, Trình quét trực tuyến trên đám mây, máy chủ API và MCP cũng như các công cụ web miễn phí. Tìm hiểu ranh giới dữ liệu ở đâu.",
    "hero": {
      "eyebrow": "Giới thiệu về MapsGrab",
      "title": {
        "lead": "Dữ liệu bản đồ, lấy ",
        "accent": " theo cách ",
        "tail": " đơn giản"
      },
      "intro": "MapsGrab xây dựng các công cụ thu thập thông tin doanh nghiệp có sẵn công khai từ Google Maps và biến nó thành dữ liệu có cấu trúc, rõ ràng — tiện ích mở rộng trình duyệt cho Edge và Firefox, Trình quét trực tuyến dựa trên đám mây, máy chủ API và MCP, cùng với các công cụ web miễn phí chạy hoàn toàn trong trình duyệt của bạn.",
      "contactLabel": "Liên hệ hỗ trợ",
      "extensionLabel": "Khám phá tiện ích mở rộng",
      "stageLabel": "Quyền truy cập sớm",
      "updatedLabel": "Đã xuất bản và xem xét",
      "updatedAt": "Tháng Tám 31, 2026",
      "chips": [
        {
          "label": "Thu thập",
          "value": "Chỉ dữ liệu công khai"
        },
        {
          "label": "Kết quả mở rộng",
          "value": "Trong trình duyệt của bạn"
        },
        {
          "label": "Xuất khẩu",
          "value": "CSV · JSON"
        }
      ],
      "dragHint": "Kéo để quay"
    },
    "build": {
      "kicker": "Những gì chúng tôi xây dựng",
      "title": {
        "lead": "Một bộ công cụ, ",
        "accent": " có bốn cách ",
        "tail": ""
      },
      "lead": "Chọn tiện ích mở rộng của trình duyệt, Công cụ quét trực tuyến dựa trên đám mây hoặc API. Tiện ích mở rộng hoạt động bên trong trình duyệt của riêng bạn; Công cụ quét trực tuyến và API chia sẻ một công cụ đám mây và máy chủ MCP mang API đó đến các đại lý AI.",
      "hub": {
        "title": "Bộ công cụ dữ liệu MapsGrab",
        "detail": "Dữ liệu doanh nghiệp · đánh giá · ảnh · email & làm giàu xã hội"
      },
      "tags": {
        "extension": [
          "Trích xuất cột 36",
          "Đánh giá và hình ảnh",
          "Nhiệm vụ hàng loạt"
        ],
        "online": [
          "Từ khóa hàng loạt",
          "Làm giàu liên hệ",
          "Một cột 37 CSV cho mỗi nhiệm vụ"
        ],
        "api": [
          "Dữ liệu kinh doanh",
          "Đánh giá",
          "Cấu trúc JSON"
        ],
        "mcp": [
          "Ba công cụ",
          "Streamable HTTP",
          "Phím OAuth hoặc API"
        ]
      },
      "toolsLead": "Cộng với các công cụ web miễn phí.",
      "toolsText": "Các công cụ web miễn phí trên trang web này xử lý các công việc nhỏ — đặt ID, xem lại liên kết, điều phối chuyển đổi, hợp nhất CSV — mà không cần cài đặt bất kỳ thứ gì.",
      "toolsLabel": "Công cụ web miễn phí"
    },
    "principles": {
      "kicker": "Nguyên tắc",
      "title": {
        "lead": "Trong đó ranh giới ",
        "accent": " ",
        "tail": " là"
      },
      "lead": "MapsGrab cố tình bảo thủ về dữ liệu. Đây là những quy tắc sản phẩm mà chúng tôi tuân thủ.",
      "publicData": {
        "title": "Chỉ dữ liệu công khai",
        "text": "Chỉ thông tin doanh nghiệp được cung cấp công khai — thông tin mà bất kỳ khách truy cập nào vào trang đều có thể thấy.",
        "visibleTag": "Hiển thị với bất kỳ khách truy cập nào",
        "privateTag": "Tài khoản riêng tư"
      },
      "localFirst": {
        "title": "Ưu tiên địa phương",
        "text": "Với tiện ích mở rộng và các công cụ web miễn phí, cài đặt và kết quả của bạn sẽ hiển thị trong trình duyệt của bạn chứ không phải trên máy chủ của chúng tôi. Trình quét trực tuyến, API và máy chủ MCP chạy trên đám mây của chúng tôi và kết quả của Trình quét trực tuyến được lưu vào tài khoản của bạn.",
        "storage": "lưu trữ cục bộ",
        "rows": [
          "Cài đặt",
          "Kết quả",
          "Nhiệm vụ hàng loạt"
        ]
      },
      "backend": {
        "title": "Công cụ mở rộng và miễn phí: bốn công việc phụ trợ",
        "text": "Đối với tiện ích mở rộng và các công cụ web miễn phí, phần phụ trợ của chúng tôi xử lý chính xác bốn việc: cấu hình từ xa, trạng thái tài khoản và hạn ngạch, email/làm giàu cho mạng xã hội tùy chọn và nhật ký sử dụng tối thiểu.",
        "chips": [
          "Cấu hình",
          "hạn ngạch",
          "Làm giàu",
          "Nhật ký sử dụng"
        ]
      },
      "never": {
        "title": "Không có quảng cáo. Không có máy theo dõi. Không bán dữ liệu.",
        "text": "Không có quảng cáo, không có trình theo dõi của bên thứ ba trong tiện ích mở rộng và không bán hoặc cho thuê dữ liệu.",
        "chips": [
          "Quảng cáo",
          "Trình theo dõi của bên thứ ba",
          "Bán dữ liệu"
        ]
      },
      "inWriting": {
        "kicker": "Bằng văn bản",
        "title": "Chính sách bảo mật & Điều khoản",
        "text": "Mỗi quy tắc này được nêu rõ trong Chính sách quyền riêng tư và Điều khoản dịch vụ.",
        "link": "Đọc Chính sách quyền riêng tư"
      }
    },
    "dataFlow": {
      "kicker": "Dữ liệu di chuyển như thế nào",
      "title": {
        "lead": "Điều gì ở lại với bạn và điều gì ",
        "accent": " đến với chúng ta ",
        "tail": ""
      },
      "lead": "Tiện ích mở rộng hoạt động trên dữ liệu được hiển thị công khai và lưu kết quả trong trình duyệt của bạn. Đối với tiện ích mở rộng và các công cụ web miễn phí, chương trình phụ trợ của chúng tôi chỉ hỗ trợ cấu hình, hạn ngạch, nội dung phong phú tùy chọn và nhật ký sử dụng tối thiểu. Thay vào đó, Trình quét trực tuyến, API và máy chủ MCP chạy trên đám mây của chúng tôi và kết quả của Trình quét trực tuyến được lưu vào tài khoản của bạn.",
      "source": {
        "label": "Nguồn",
        "title": "Các trang Google Maps bạn truy cập",
        "text": "Dữ liệu doanh nghiệp công khai — tên, địa chỉ, số điện thoại, trang web, xếp hạng, đánh giá, ảnh."
      },
      "browser": {
        "label": "Trình duyệt của bạn · ưu tiên địa phương",
        "storage": "bộ nhớ cục bộ · IndexedDB",
        "rows": [
          "Cài đặt",
          "Kết quả trích xuất",
          "Trạng thái nhiệm vụ hàng loạt"
        ],
        "badge": "Được lưu trữ trong trình duyệt của bạn"
      },
      "backend": {
        "label": "Phần phụ trợ MapsGrab · bốn mục đích",
        "lanes": [
          {
            "title": "Cấu hình từ xa",
            "text": "Các cài đặt trước cấu trúc trang giúp quá trình trích xuất tiếp tục hoạt động"
          },
          {
            "title": "Tài khoản & hạn ngạch",
            "text": "Đăng nhập, trạng thái gói, kế toán sử dụng hàng tháng"
          },
          {
            "title": "Email và làm giàu xã hội",
            "text": "Các liên hệ được liệt kê công khai khi tính năng này được sử dụng"
          },
          {
            "title": "Ghi nhật ký sử dụng",
            "text": "Hồ sơ tối thiểu về việc sử dụng tính năng và lỗi"
          }
        ]
      },
      "never": {
        "label": "Không bao giờ",
        "items": [
          "Không có quảng cáo",
          "Không có trình theo dõi của bên thứ ba trong tiện ích mở rộng",
          "Không bán hoặc cho thuê dữ liệu cá nhân",
          "Không có bộ sưu tập lịch sử duyệt web nào của bạn ngoài các trang Google Maps mà bạn trích xuất từ ​​đó"
        ]
      },
      "note": "Trang web này sử dụng Google Analytics 4 để đo mức độ sử dụng trang tổng hợp — bản thân tiện ích mở rộng không chứa phân tích.",
      "noteLink": "Đọc Chính sách quyền riêng tư"
    },
    "status": {
      "kicker": "Trạng thái",
      "title": {
        "lead": "Truy cập sớm, ",
        "accent": " miễn phí ",
        "tail": " để bắt đầu"
      },
      "access": {
        "title": "Quyền truy cập sớm",
        "text": "Sản phẩm đang trong giai đoạn truy cập sớm. Danh sách cửa hàng dành cho Tiện ích bổ sung Edge và Tiện ích bổ sung Firefox đang được hoàn thiện.",
        "link": "Hướng dẫn cài đặt"
      },
      "quota": {
        "title": "Hạn ngạch hàng tháng miễn phí",
        "text": "Tiện ích mở rộng hoạt động mà không cần có tài khoản trong hạn mức miễn phí hàng tháng.",
        "link": "Bao gồm những gì"
      },
      "paid": {
        "title": "Các gói trả phí để sử dụng nhiều hơn",
        "text": "Các gói trả phí nâng cao giới hạn cho việc sử dụng nhiều hơn. Xem trang Định giá để biết các cấp độ hiện tại.",
        "link": "Xem giá"
      }
    }
  },
  "contact": {
    "navLabel": "Liên hệ",
    "seoTitle": "Liên hệ Hỗ trợ MapsGrab",
    "seoDescription": "Liên hệ với MapsGrab về tài khoản, tiện ích mở rộng trình duyệt, thanh toán, công cụ hoặc yêu cầu về quyền riêng tư.",
    "eyebrow": "Liên hệ MapsGrab",
    "title": {
      "lead": "Nói chuyện với con người ",
      "accent": " ",
      "tail": ""
    },
    "intro": "Viết thư cho chúng tôi và một người sẽ đọc nó. Hỗ trợ hiện được xử lý trực tiếp bởi nhóm xây dựng MapsGrab.",
    "emailCardLabel": "Email hỗ trợ",
    "copyEmail": "Sao chép {email}",
    "emailLabel": "Hỗ trợ qua email",
    "emailSubject": "Yêu cầu hỗ trợ MapsGrab",
    "responseTimes": "Chúng tôi trả lời email hỗ trợ trong vòng một ngày làm việc, thường là nhanh hơn. Yêu cầu về quyền riêng tư có thể mất vài ngày khi chúng tôi cần xác minh quyền sở hữu tài khoản trước tiên.",
    "include": {
      "title": "Những gì cần bao gồm",
      "text": "Báo cáo chính xác giúp chúng tôi xác định quy trình làm việc bị ảnh hưởng mà không yêu cầu thông tin tài khoản nhạy cảm.",
      "items": [
        "Trang URL và hành động bạn đã thực hiện",
        "Tên và phiên bản trình duyệt của bạn",
        "Thông báo lỗi chính xác và ảnh chụp màn hình khi hữu ích",
        "Số đơn đặt hàng cho các câu hỏi về thanh toán, không có chi tiết thẻ thanh toán"
      ]
    },
    "topics": {
      "title": "Chúng tôi có thể giúp gì",
      "items": [
        "Cài đặt và thiết lập tiện ích mở rộng trình duyệt",
        "Sự cố truy cập và đăng nhập tài khoản",
        "Hạn ngạch, đăng ký, gia hạn và câu hỏi thanh toán",
        "Sự cố về công cụ web và yêu cầu tính năng",
        "Yêu cầu về quyền riêng tư và dữ liệu tài khoản"
      ]
    },
    "aboutLabel": "Về",
    "privacyLabel": "Chính sách bảo mật",
    "termsLabel": "Điều khoản dịch vụ"
  }
}

export const legal: LegalContent = {
  "page": {
    "crumbHome": "Trang chủ",
    "crumbLegal": "Hợp pháp",
    "switchLabel": "Văn bản pháp luật",
    "readTime": "{minutes} phút đọc",
    "sectionCount": "Phần {count}",
    "tocTitle": "Trên trang này",
    "tocLabel": "Phần {title}",
    "glanceKicker": "Trong nháy mắt",
    "glanceNote": "Tóm tắt toàn văn dưới đây.",
    "anchorLabel": "Sao chép liên kết vào “{title}”",
    "copyEmail": "Sao chép {email}",
    "contactSupport": "Liên hệ hỗ trợ",
    "nextLabel": "Tài liệu tiếp theo"
  },
  "terms": {
    "navLabel": "Điều khoản",
    "seoTitle": "Điều khoản dịch vụ | MapsGrab",
    "seoDescription": "Điều khoản dịch vụ của MapsGrab: cách sử dụng được chấp nhận, trách nhiệm của người dùng đối với dữ liệu được thu thập, giao dịch mua, tuyên bố từ chối trách nhiệm và cách liên hệ với chúng tôi.",
    "title": "Điều khoản dịch vụ",
    "intro": "Các Điều khoản này chi phối việc bạn sử dụng MapsGrab: tiện ích mở rộng trình duyệt, trang web này và các công cụ web miễn phí. Vui lòng đọc chúng trước khi sử dụng dịch vụ.",
    "updatedLabel": "Cập nhật lần cuối",
    "updatedAt": "Tháng Tám 31, 2026",
    "updatedAtISO": "2026-08-31",
    "summary": "Việc sử dụng được chấp nhận, trách nhiệm của người dùng đối với dữ liệu được thu thập, giao dịch mua, tuyên bố từ chối trách nhiệm và cách liên hệ với chúng tôi.",
    "helpTitle": "Bạn có câu hỏi về các Điều khoản này?",
    "glance": [
      {
        "section": "publicly-available-data",
        "icon": "eye",
        "tone": "ok",
        "title": "Chỉ dữ liệu công khai",
        "text": "Dịch vụ chỉ hoạt động với thông tin được hiển thị công khai trên các trang bạn duyệt."
      },
      {
        "section": "your-responsibility",
        "icon": "user",
        "tone": "pin",
        "title": "Việc bạn sử dụng, trách nhiệm của bạn",
        "text": "Bạn quyết định thu thập những gì và sử dụng nó như thế nào — theo luật áp dụng cho bạn."
      },
      {
        "section": "accounts-and-quotas",
        "icon": "key",
        "title": "Không cần tài khoản để bắt đầu",
        "text": "Tiện ích mở rộng hoạt động mà không cần có tài khoản trong hạn mức miễn phí hàng tháng."
      },
      {
        "section": "purchases-and-subscriptions",
        "icon": "refresh",
        "title": "Hủy bất cứ lúc nào",
        "text": "Đăng ký được gia hạn cho đến khi bị hủy; việc hủy bỏ dừng gia hạn trong tương lai."
      }
    ],
    "sections": [
      {
        "id": "acceptance-of-terms",
        "title": "Chấp nhận các điều khoản",
        "paragraphs": [
          "Bằng cách truy cập hoặc sử dụng MapsGrab, bạn đồng ý với các Điều khoản này. Nếu bạn không đồng ý với họ, đừng cài đặt tiện ích mở rộng hoặc sử dụng trang web và công cụ."
        ]
      },
      {
        "id": "what-the-service-does",
        "title": "Dịch vụ làm gì",
        "paragraphs": [
          "MapsGrab giúp bạn thu thập thông tin được hiển thị công khai trên các trang Google Maps mà bạn truy cập — chi tiết doanh nghiệp, đánh giá, ảnh và thông tin liên hệ có liên quan — và xuất thông tin đó. Dịch vụ này bao gồm phần mở rộng trình duyệt cho Microsoft Edge và Firefox, trang web này và các công cụ web miễn phí chạy trong trình duyệt của bạn."
        ]
      },
      {
        "id": "publicly-available-data",
        "title": "Dữ liệu có sẵn công khai",
        "paragraphs": [
          "Dịch vụ này được thiết kế để chỉ hoạt động với thông tin được hiển thị công khai trên các trang bạn duyệt. Nó không truy cập vào các tài khoản riêng tư, nội dung bị kiểm soát hoặc dữ liệu yêu cầu quyền truy cập đặc biệt ngoài những gì mà bất kỳ khách truy cập nào cũng có thể nhìn thấy."
        ]
      },
      {
        "id": "your-responsibility",
        "title": "Trách nhiệm của bạn",
        "paragraphs": [
          "Bạn quyết định những gì cần thu thập và cách sử dụng nó và bạn chịu trách nhiệm về việc sử dụng đó. Khi bạn sử dụng thông tin được thu thập, hãy tuân thủ luật pháp áp dụng cho bạn và cho mục đích của bạn.",
          "Đặc biệt, bạn đồng ý không:"
        ],
        "items": [
          "Sử dụng dịch vụ cho bất kỳ hoạt động trái pháp luật nào hoặc vi phạm quyền của bên thứ ba.",
          "Xác định lại cá nhân hoặc xây dựng hồ sơ cá nhân từ dữ liệu kinh doanh được thu thập.",
          "Sử dụng thông tin liên hệ đã thu thập để gửi thư rác hoặc tin nhắn hàng loạt không theo yêu cầu.",
          "Bán lại dữ liệu thô được thu thập dưới dạng sản phẩm dữ liệu cạnh tranh mà không có thỏa thuận riêng với chúng tôi.",
          "Can thiệp, làm quá tải hoặc cố gắng làm gián đoạn dịch vụ hoặc nền tảng mà dịch vụ đó hoạt động cùng."
        ],
        "prohibitions": true
      },
      {
        "id": "accounts-and-quotas",
        "title": "Tài khoản và hạn ngạch",
        "paragraphs": [
          "Tiện ích mở rộng hoạt động mà không cần có tài khoản trong hạn mức miễn phí hàng tháng. Một số tính năng — giới hạn cao hơn, mua hàng, tích hợp đám mây — yêu cầu phải có tài khoản. Bạn có trách nhiệm giữ an toàn cho thông tin đăng nhập tài khoản của mình và cho hoạt động diễn ra trong tài khoản của bạn."
        ]
      },
      {
        "id": "purchases-and-subscriptions",
        "title": "Mua hàng và đăng ký",
        "paragraphs": [
          "Các gói trả phí được mô tả trên trang Định giá. Giá, hạn ngạch và thời hạn thanh toán được hiển thị trước khi bạn mua và việc mua hàng được xử lý thông qua nhà cung cấp dịch vụ thanh toán được cung cấp khi thanh toán. Gói đăng ký tự động gia hạn cho đến khi bị hủy và bạn có thể hủy bất kỳ lúc nào; việc hủy bỏ dừng gia hạn trong tương lai."
        ]
      },
      {
        "id": "the-service-is-provided-as-is",
        "title": "Dịch vụ được cung cấp như hiện tại",
        "paragraphs": [
          "Dịch vụ được cung cấp \"nguyên trạng\" và \"có sẵn\". Nền tảng thay đổi thường xuyên và các tính năng thu thập có thể ngừng hoạt động một phần hoặc toàn bộ bất kỳ lúc nào. MapsGrab không đảm bảo, rõ ràng hay ngụ ý, về tính khả dụng không bị gián đoạn, tính đầy đủ của dữ liệu được thu thập hoặc sự phù hợp cho một mục đích cụ thể.",
          "Chúng tôi có thể thay đổi, tạm dừng hoặc ngừng bất kỳ phần nào của dịch vụ và chúng tôi có thể cập nhật các Điều khoản này. Khi có những thay đổi quan trọng, chúng tôi sẽ công bố chúng trên trang web này. Việc tiếp tục sử dụng sau khi các thay đổi có hiệu lực nghĩa là bạn chấp nhận Điều khoản đã cập nhật."
        ]
      },
      {
        "id": "limitation-of-liability",
        "title": "Giới hạn trách nhiệm pháp lý",
        "paragraphs": [
          "Trong phạm vi tối đa được pháp luật cho phép, MapsGrab và các nhà khai thác của nó không chịu trách nhiệm về các thiệt hại gián tiếp, ngẫu nhiên, đặc biệt hoặc do hậu quả - bao gồm mất lợi nhuận hoặc dữ liệu - phát sinh từ việc bạn sử dụng hoặc không thể sử dụng dịch vụ."
        ]
      },
      {
        "id": "contact",
        "title": "Liên hệ",
        "paragraphs": [
          "Các câu hỏi về các Điều khoản này có thể được gửi tới support@mapsgrab.com."
        ]
      }
    ],
    "coverage": {
      "label": "Ghi chú bảo hiểm",
      "badge": "TBD",
      "lead": "Chưa được bảo hiểm:",
      "text": "Công cụ quét trực tuyến (chạy trên nền tảng đám mây), Công cụ quét / Đánh giá / Ảnh API và máy chủ MCP. Văn bản trên mô tả tiện ích mở rộng, trang web này và các công cụ web miễn phí."
    }
  },
  "privacy": {
    "navLabel": "Sự riêng tư",
    "seoTitle": "Chính sách bảo mật | MapsGrab",
    "seoDescription": "Chính sách quyền riêng tư của MapsGrab: tiện ích và trang web xử lý dữ liệu gì, nơi lưu trữ dữ liệu, chương trình phụ trợ của chúng tôi được sử dụng để làm gì và các ranh giới mà chúng tôi tuân theo.",
    "title": "Chính sách bảo mật",
    "intro": "Chính sách này giải thích dữ liệu nào MapsGrab xử lý, nơi lưu trữ dữ liệu và nội dung nào đến máy chủ của chúng tôi. Phiên bản ngắn: tiện ích mở rộng hoạt động trên dữ liệu được hiển thị công khai và lưu kết quả trong trình duyệt của bạn; ngoài các dịch vụ đám mây của chúng tôi, chương trình phụ trợ của chúng tôi chỉ hỗ trợ cấu hình, hạn ngạch, nội dung phong phú tùy chọn và nhật ký sử dụng tối thiểu; và chúng tôi không chạy quảng cáo cũng như không có trình theo dõi của bên thứ ba trong tiện ích mở rộng. Các yêu cầu đối với dịch vụ đám mây của chúng tôi — Máy quét trực tuyến, API và máy chủ MCP — được xử lý trên máy chủ của chúng tôi và các kết quả của Máy quét trực tuyến được liên kết với tài khoản của bạn để bạn có thể tải chúng xuống.",
    "updatedLabel": "Cập nhật lần cuối",
    "updatedAt": "Tháng 10 16, 2026",
    "updatedAtISO": "2026-10-16",
    "summary": "Dữ liệu nào trong tiện ích mở rộng và quy trình trang web, nơi nó được lưu trữ, phần phụ trợ của chúng tôi được sử dụng để làm gì và các ranh giới mà chúng tôi tuân theo.",
    "helpTitle": "Câu hỏi về chính sách này?",
    "glance": [
      {
        "section": "where-data-is-stored",
        "icon": "lock",
        "tone": "ok",
        "title": "Nơi lưu trữ kết quả",
        "text": "Tiện ích mở rộng và các công cụ web miễn phí sẽ lưu giữ dữ liệu của bạn trong trình duyệt; Kết quả Scraper trực tuyến được liên kết với tài khoản của bạn."
      },
      {
        "section": "what-our-backend-processes",
        "icon": "database",
        "title": "Điều gì đến được với máy chủ của chúng tôi",
        "text": "Yêu cầu tới Máy quét trực tuyến, máy chủ API và MCP, cùng với cấu hình, tài khoản và hạn ngạch, nội dung phong phú tùy chọn và nhật ký sử dụng tối thiểu."
      },
      {
        "section": "what-we-never-do",
        "icon": "shield",
        "tone": "pin",
        "title": "Không có quảng cáo, không có trình theo dõi",
        "text": "Không có trình theo dõi của bên thứ ba trong tiện ích mở rộng và không bán hoặc cho thuê dữ liệu cá nhân."
      },
      {
        "section": "data-removal",
        "icon": "x",
        "title": "Xóa dữ liệu",
        "text": "Xóa tiện ích mở rộng sẽ xóa dữ liệu cục bộ; gửi email cho chúng tôi để xóa dữ liệu tài khoản phụ trợ."
      }
    ],
    "sections": [
      {
        "id": "data-the-extension-processes",
        "title": "Dữ liệu các quy trình mở rộng",
        "paragraphs": [
          "Tiện ích mở rộng xử lý các loại dữ liệu sau:"
        ],
        "items": [
          "Dữ liệu doanh nghiệp công khai - thông tin được hiển thị trên các trang Google Maps bạn truy cập (tên, địa chỉ, số điện thoại, trang web, xếp hạng, đánh giá, ảnh, v.v.) trong khi bạn sử dụng các tính năng trích xuất.",
          "Cài đặt của bạn - tùy chọn bạn định cấu hình (định dạng xuất, chọn trường, chuyển đổi tự động hóa, ngôn ngữ giao diện).",
          "Dữ liệu kỹ thuật và tương tác — các sự kiện sử dụng tối thiểu (bộ đếm mức sử dụng tính năng, thông báo lỗi) được sử dụng để giữ cho tiện ích mở rộng hoạt động trước các thay đổi của trang Google.",
          "Số nhận dạng tài khoản mà chúng tôi cấp — số nhận dạng thiết bị ẩn danh và nếu bạn đăng nhập, email tài khoản của bạn cũng như trạng thái gói hoặc hạn ngạch."
        ]
      },
      {
        "id": "where-data-is-stored",
        "title": "Nơi dữ liệu được lưu trữ",
        "paragraphs": [
          "Với tiện ích mở rộng, cài đặt, kết quả trích xuất và trạng thái tác vụ hàng loạt được lưu trữ cục bộ trong trình duyệt của bạn (bộ nhớ cục bộ tiện ích mở rộng và IndexedDB). Chúng không bao giờ rời khỏi thiết bị của bạn trừ khi bạn kích hoạt xuất hoặc một trong các tích hợp tùy chọn được mô tả bên dưới. Các công cụ web miễn phí cũng xử lý những gì bạn nhập vào trình duyệt của mình.",
          "Mã thông báo Google Drive và HubSpot OAuth, nếu bạn kết nối chúng, cũng chỉ được lưu trữ trong trình duyệt của bạn.",
          "Nhiệm vụ Scraper trực tuyến chạy trên máy chủ của chúng tôi. Kết quả của họ được lưu trữ cùng với tài khoản của bạn để bạn có thể tải chúng xuống từ Trang tổng quan của mình."
        ]
      },
      {
        "id": "what-our-backend-processes",
        "title": "Quy trình phụ trợ của chúng tôi là gì",
        "paragraphs": [
          "Các yêu cầu bạn thực hiện đối với các dịch vụ đám mây của chúng tôi — Máy quét trực tuyến, máy chủ API và MCP — được xử lý trên máy chủ của chúng tôi. Máy chủ của chúng tôi cũng quản lý quyền truy cập vào các dịch vụ này, bao gồm khóa API của bạn và ủy quyền ứng dụng khách MCP mà bạn phê duyệt và lưu giữ hồ sơ về việc sử dụng của bạn.",
          "Máy khách MCP mà bạn ủy quyền sẽ nhận được kết quả của các yêu cầu mà nó đưa ra. Bạn có thể thu hồi ủy quyền từ Trang tổng quan của mình.",
          "Ngoài các dịch vụ đám mây này, tiện ích mở rộng và trang web này còn liên hệ với máy chủ của chúng tôi vì bốn mục đích:"
        ],
        "items": [
          "Cấu hình từ xa - cài đặt trước cấu trúc trang giúp quá trình trích xuất tiếp tục hoạt động khi Google thay đổi trang của nó.",
          "Dịch vụ tài khoản và hạn ngạch — đăng nhập, trạng thái gói và tính toán mức sử dụng hàng tháng.",
          "Làm phong phú email và mạng xã hội — tra cứu chi tiết liên hệ được liệt kê công khai trên các trang web doanh nghiệp được thu thập khi tính năng này được sử dụng.",
          "Ghi nhật ký sử dụng - bản ghi tối thiểu về việc sử dụng tính năng và lỗi được sử dụng để duy trì và cải thiện dịch vụ."
        ]
      },
      {
        "id": "optional-google-drive-and-hubspot-integrations",
        "title": "Tích hợp Google Drive và HubSpot tùy chọn",
        "paragraphs": [
          "Chỉ khi bạn kết nối chúng một cách rõ ràng trong cài đặt, dữ liệu đã xuất sẽ được tải lên Google Drive của riêng bạn hoặc được đồng bộ hóa với tài khoản HubSpot của riêng bạn. Các tiện ích tích hợp này sử dụng ủy quyền của bạn, hành động thay mặt bạn và có thể bị thu hồi bất kỳ lúc nào từ cài đặt tiện ích mở rộng hoặc từ tài khoản Google / HubSpot của bạn."
        ]
      },
      {
        "id": "website-analytics",
        "title": "Phân tích trang web",
        "paragraphs": [
          "Trang web này sử dụng Google Analytics 4 (GA4) để đo lường mức sử dụng trang tổng hợp. GA4 là công cụ phân tích bên thứ ba duy nhất mà chúng tôi sử dụng và nó chỉ chạy trên trang web này — bản thân tiện ích mở rộng không chứa phân tích."
        ]
      },
      {
        "id": "what-we-never-do",
        "title": "Điều chúng tôi không bao giờ làm",
        "paragraphs": [
          "Những ranh giới này được áp dụng trên toàn bộ tiện ích mở rộng và trang web:"
        ],
        "items": [
          "Không có quảng cáo.",
          "Không có trình theo dõi của bên thứ ba trong tiện ích mở rộng.",
          "Không bán hoặc cho thuê dữ liệu cá nhân.",
          "Không có bộ sưu tập lịch sử duyệt web nào của bạn ngoài các trang Google Maps mà bạn trích xuất từ ​​đó."
        ],
        "prohibitions": true
      },
      {
        "id": "data-removal",
        "title": "Xóa dữ liệu",
        "paragraphs": [
          "Việc xóa tiện ích mở rộng sẽ xóa tất cả dữ liệu được lưu trữ cục bộ. Nếu bạn muốn xóa dữ liệu tài khoản phụ trợ của mình, hãy liên hệ với chúng tôi theo địa chỉ support@mapsgrab.com và chúng tôi sẽ xóa dữ liệu đó."
        ]
      },
      {
        "id": "changes-to-this-policy",
        "title": "Những thay đổi đối với chính sách này",
        "paragraphs": [
          "Chúng tôi cập nhật chính sách này khi dịch vụ thay đổi. Ngày trên phản ánh bản sửa đổi mới nhất và những thay đổi quan trọng sẽ được công bố trên trang web này."
        ]
      },
      {
        "id": "contact",
        "title": "Liên hệ",
        "paragraphs": [
          "Các câu hỏi hoặc yêu cầu về quyền riêng tư có thể được gửi tới support@mapsgrab.com."
        ]
      }
    ]
  }
}

export const mcpOAuth: McpOAuthContent = {
  "seoTitle": "Ủy quyền cho ứng dụng AI | MapsGrab",
  "title": "Kết nối ứng dụng AI với tài khoản của bạn",
  "intro": "Một ứng dụng đang yêu cầu truy cập vào tài khoản MapsGrab của bạn. Chỉ cho phép nó nếu bạn tự mình bắt đầu kết nối này.",
  "loading": "Đang tải yêu cầu kết nối...",
  "hostLabel": "Địa chỉ ứng dụng",
  "selfDeclared": "Tên ứng dụng tự đặt: {name}",
  "loopbackTitle": "Ứng dụng địa phương",
  "loopbackText": "Ứng dụng này chạy trên máy tính nên địa chỉ của nó không thể hiển thị ai đã tạo ra nó. Chỉ cho phép nếu bạn vừa bắt đầu kết nối này từ một ứng dụng mà bạn tin tưởng.",
  "loopbackHost": "Máy tính này",
  "accountLabel": "Đã đăng nhập với tư cách",
  "switchAccount": "Chuyển đổi tài khoản",
  "permissionsTitle": "Nếu bạn cho phép, ứng dụng này có thể",
  "permissions": [
    "Tìm kiếm doanh nghiệp và đọc đánh giá cũng như ảnh công khai của họ trên Google Maps.",
    "Sử dụng trợ cấp yêu cầu hàng tháng của gói API của bạn."
  ],
  "revokeNote": "Bạn có thể ngắt kết nối nó bất cứ lúc nào trong Ứng dụng được kết nối trong quản lý API.",
  "approve": "Cho phép",
  "deny": "Từ chối và quay lại {host}",
  "denyLoopback": "Từ chối và quay lại ứng dụng",
  "redirecting": "Đang quay lại ứng dụng...",
  "invalidTitle": "Yêu cầu kết nối này không hợp lệ hoặc đã hết hạn",
  "invalidText": "Quay lại ứng dụng AI của bạn và bắt đầu kết nối lại.",
  "errorTitle": "Yêu cầu kết nối này không thể hoàn thành",
  "errorReasons": {
    "rate_limited": "Quá nhiều lần thử kết nối đến từ mạng của bạn. Đợi vài phút trước khi thử lại.",
    "invalid_client": "Ứng dụng chưa được đăng ký hoặc đăng ký chưa đầy đủ.",
    "invalid_redirect_uri": "Địa chỉ trả lại do ứng dụng gửi không khớp với địa chỉ mà ứng dụng đã đăng ký.",
    "unsupported_response_type": "Ứng dụng đã yêu cầu loại ủy quyền không được hỗ trợ.",
    "invalid_pkce": "Ứng dụng không gửi yêu cầu kiểm tra bảo mật (PKCE với S256).",
    "invalid_resource": "Ứng dụng không yêu cầu quyền truy cập vào máy chủ MapsGrab MCP hoặc yêu cầu một máy chủ khác.",
    "server_error": "MapsGrab không thể lưu yêu cầu này ngay bây giờ. Vui lòng thử lại trong thời gian ngắn."
  },
  "errorHint": "Bắt đầu kết nối lại từ ứng dụng AI của bạn. Nếu sự cố vẫn tiếp diễn, hãy liên hệ với nhà phát triển ứng dụng.",
  "signInTitle": "Đăng nhập để tiếp tục",
  "signInText": "Đăng nhập vào tài khoản MapsGrab mà bạn muốn kết nối. Yêu cầu này sẽ chờ bạn.",
  "signIn": "Đăng nhập",
  "loadFailed": "Không thể tải yêu cầu kết nối. Hãy kiểm tra mạng của bạn và thử lại.",
  "decideFailed": "Không thể hoàn tất hành động này. Hãy kiểm tra mạng của bạn và thử lại.",
  "retry": "Thử lại"
}

export const clink: ClinkReturnContent = {
  "success": {
    "waiting": {
      "title": "Đã gửi thanh toán",
      "description": "Chúng tôi đang xác nhận thanh toán của bạn. Tab gốc sẽ tự động cập nhật."
    },
    "confirmedCredits": {
      "title": "Đã thêm tín dụng",
      "description": "Khoản thanh toán ClinkBill của bạn đã được xác nhận và Tín dụng đã được thêm vào. Bạn có thể quay lại tab ban đầu."
    },
    "confirmedSubscription": {
      "title": "Đã kích hoạt gói",
      "description": "Khoản thanh toán ClinkBill của bạn đã được xác nhận và gói MapsGrab của bạn đang hoạt động. Bạn có thể quay lại tab ban đầu."
    },
    "failed": {
      "title": "Thanh toán cần chú ý",
      "description": "Chúng tôi không thể xác nhận đơn đặt hàng này. Quay lại tab ban đầu và thử lại."
    }
  },
  "cancel": {
    "title": "Đã hủy thanh toán",
    "description": "Không có khoản thanh toán nào được hoàn thành. Bạn có thể quay lại và chọn phương thức thanh toán khác."
  }
}
