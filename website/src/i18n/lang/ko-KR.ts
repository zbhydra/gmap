import type { SiteContent, McpOAuthContent, ClinkReturnContent } from '../schema'
import type { CompanyContent } from '../../company/companyContent'
import type { LegalContent } from '../../legal/legalContent'

export const site: SiteContent = {
  "site": {
    "name": "MapsGrab",
    "description": "MapsGrab은 지도 데이터 도구 키트입니다. 브라우저 확장 프로그램과 웹 도구를 사용하여 지도에서 공개적으로 사용 가능한 비즈니스 정보를 가져오고, 링크를 리뷰하고, 장소 ID 등을 얻을 수 있습니다.",
    "keywords": "지도 데이터, Google 지도 추출기, 장소 ID 찾기, 리뷰 링크 생성기, 지도 도구"
  },
  "layout": {
    "nav": {
      "brand": "MapsGrab",
      "primaryLabel": "기본 탐색",
      "mobileLabel": "모바일 내비게이션",
      "extension": "확장 프로그램",
      "online": "온라인",
      "api": "API",
      "apiScraper": "수집 API",
      "apiReviews": "리뷰 API",
      "apiPhotos": "사진 API",
      "apiMcp": "수집 MCP",
      "apiScraperDesc": "JSON과 같은 모든 키워드 및 위치에 대한 비즈니스 데이터.",
      "apiReviewsDesc": "평가 및 소유자 답변이 포함된 전체 리뷰 스레드입니다.",
      "apiPhotosDesc": "바로 사용할 수 있는 URL 목록의 공개 사진 갤러리.",
      "apiMcpDesc": "Claude Code, Cursor 및 VS Code에 대한 실시간 지도 데이터입니다.",
      "apiFootNote": "API 및 MCP은 하나의 월별 요청 할당량을 공유합니다.",
      "apiPricing": "API 가격",
      "pricing": "가격",
      "freeTools": "무료 도구",
      "signIn": "로그인",
      "dashboard": "대시보드"
    },
    "footer": {
      "legalLabel": "합법적인",
      "resources": "무료 도구",
      "product": "제품",
      "rights": "© 2026 MapsGrab. 모든 권리 보유.",
      "tools": [
        {
          "id": "place-id-finder",
          "label": "Place ID 찾기",
          "path": "/tools/place-id-finder/"
        },
        {
          "id": "review-link-generator",
          "label": "링크 생성기 리뷰",
          "path": "/tools/review-link-generator/"
        },
        {
          "id": "email-checker",
          "label": "이메일 검사기",
          "path": "/tools/email-checker/"
        },
        {
          "id": "lat-long-to-dms",
          "label": "위도 경도를 DMS로 변환기",
          "path": "/tools/lat-long-to-dms/"
        },
        {
          "id": "dms-to-dd",
          "label": "DMS 를 십진수 변환기",
          "path": "/tools/dms-to-dd/"
        },
        {
          "id": "bulk-keywords-generator",
          "label": "대량 키워드 생성기",
          "path": "/tools/bulk-keywords-generator/"
        },
        {
          "id": "merge-csv",
          "label": "온라인으로 CSV 파일 병합",
          "path": "/tools/merge-csv-files-online/"
        }
      ]
    }
  },
  "common": {
    "installCta": "지금 설치",
    "comingSoon": "곧 출시 예정",
    "themeLabel": "색상 테마",
    "themeLight": "빛",
    "themeDark": "어두운",
    "themeSystem": "체계",
    "faqLabel": "자주 묻는 질문",
    "breadcrumbLabel": "탐색경로",
    "languageSwitcherLabel": "언어 전환기",
    "mobileMenuLabel": "토글 메뉴",
    "copied": "클립보드에 복사됨",
    "cancel": "취소",
    "continue": "계속하다"
  },
  "dashboard": {
    "create": {
      "title": "온라인 스크레이퍼",
      "newTask": "새 작업",
      "modeLabel": "검색 모드",
      "modes": {
        "keywords": "키워드",
        "map": "지도",
        "regions": "지역"
      },
      "keywords": "키워드",
      "regionsCta": "지역으로 검색어 만들기",
      "placeholder": "포틀랜드의 커피숍\n오스틴의 레스토랑",
      "count": "{count} / {limit} 키워드",
      "duplicates": "중복 줄 제외됨: {count}",
      "contacts": "이메일 및 소셜 프로필 찾기",
      "contactsPaid": "유료 온라인 플랜으로 이용 가능합니다.",
      "usage": "{used} / {total} 이번 달 기록",
      "reset": "월간 할당량은 매월 1일(뉴욕 시간)에 초기화됩니다.",
      "loading": "한도 로드 중...",
      "optionsFailed": "작업 한도를 로드할 수 없습니다. 다시 시도해 주세요.",
      "submit": "데이터 수집 시작",
      "submitting": "제출 중...",
      "submitted": "작업이 제출되었습니다",
      "failed": "작업 제출에 실패했습니다. 다시 시도하기 전에 기록을 새로 고치세요.",
      "exhausted": "월별 할당량이 소진되었습니다.",
      "invalid": "최대 {limit}개의 키워드를 입력하세요. 각 키워드는 500자를 초과하지 마세요.",
      "map": {
        "invalidKeyword": "500자 이하의 키워드 하나를 입력하세요.",
        "keyword": "키워드",
        "keywordPlaceholder": "예: 커피숍",
        "locationSearch": "지역 검색",
        "locate": "지역으로 위치 지정",
        "locationPlaceholder": "국가 / 주 / 도시 선택",
        "coordinates": "좌표 입력",
        "latitude": "위도",
        "longitude": "경도",
        "radius": "반경(km)",
        "spacing": "그리드 간격(km)",
        "sampleCount": "{count} / {limit} 위치 검색",
        "points": "그리드 지점: {points}",
        "overLimit": "{limit} 검색 위치 내에 머물도록 반경을 줄이거나 그리드 간격을 늘립니다.",
        "chooseCenter": "지역을 선택하거나 지도를 클릭해 중심을 설정하세요.",
        "mapLabel": "지도에서 검색센터를 선택하세요",
        "tilesUnavailable": "지도 타일을 로드할 수 없습니다. 여전히 좌표를 입력할 수 있습니다.",
        "attribution": "OpenStreetMap 기여자"
      },
      "region": {
        "baseKeywords": "기본 키워드",
        "basePlaceholder": "커피숍\n레스토랑",
        "country": "국가",
        "state": "주 또는 지역",
        "citySearch": "도시 찾기",
        "cityPlaceholder": "선택 사항: 도시 선택",
        "city": "도시",
        "selectCountry": "국가를 선택하세요",
        "allStates": "모든 주 또는 지역",
        "loading": "위치 로드 중...",
        "loadFailed": "위치를 로드할 수 없습니다. 다시 시도해 주세요.",
        "retry": "다시 해 보다",
        "filter": "필터",
        "selectAll": "모두 선택 ({count})",
        "clear": "선택 해제",
        "selectedCount": "{count}개 선택됨",
        "more": "{total}개 중 {shown}개 표시 중입니다. 입력해서 범위를 좁히세요.",
        "selectedRegions": "선택된 위치",
        "remove": "{name} 제거",
        "noMatch": "일치하는 항목이 없습니다",
        "matchMode": "구문 검색",
        "inMode": "~ 안에",
        "nearMode": "가까운",
        "generate": "쿼리 생성",
        "needBase": "먼저 기본 키워드를 입력하세요.",
        "needCountry": "먼저 국가를 선택하세요.",
        "willGenerate": "검색어 {count}개가 생성됩니다.",
        "finalQueries": "최종 쿼리",
        "finalPlaceholder": "생성된 쿼리가 여기에 표시됩니다. 편집할 수 있습니다.",
        "attribution": "위치 데이터: GeoNames (CC BY)"
      }
    },
    "seo": {
      "title": "대시보드 | MapsGrab",
      "description": "하나의 작업 공간에서 MapsGrab 내보내기, API 액세스 및 구독을 관리하세요."
    },
    "shell": {
      "skipToContent": "본문으로 건너뛰기",
      "sideLabel": "작업 공간",
      "homeLabel": "MapsGrab 홈",
      "navLabel": "작업 공간 메뉴",
      "loading": "작업공간 로드 중...",
      "retry": "다시 해 보다",
      "navOnline": "온라인 스크레이퍼",
      "navJobHistory": "기록",
      "navApi": "API 관리",
      "navSubscriptions": "구독",
      "openMenu": "작업공간 메뉴 열기",
      "closeMenu": "작업공간 메뉴 닫기",
      "collapseSidebar": "사이드바 접기",
      "expandSidebar": "사이드바 펼치기",
      "back": "뒤로"
    },
    "account": {
      "menuButtonLabel": "계정 메뉴 열기",
      "menuLabel": "계정 메뉴",
      "logout": "로그아웃",
      "upgrade": "업그레이드",
      "usageShort": "{used} / {total}개 레코드",
      "planUnavailable": "사용 불가",
      "theme": "테마",
      "themeLight": "라이트",
      "themeDark": "다크",
      "themeSystem": "시스템",
      "language": "언어"
    },
    "history": {
      "title": "온라인 내보내기 내역",
      "description": "온라인 스크레이퍼에서 실행한 작업이 최신 항목부터 표시됩니다.",
      "refresh": "새로 고치다",
      "autoRefresh": "자동 새로고침 중",
      "loading": "내보내기 로드 중...",
      "loadFailed": "내보내기 기록을 로드하지 못했습니다.",
      "refreshFailed": "새로고침하지 못했습니다. 마지막으로 불러온 결과를 표시합니다.",
      "retry": "다시 해 보다",
      "emptyTitle": "아직 내보내기가 없습니다.",
      "emptyHint": "온라인 스크레이퍼에서 작업을 실행하면 여기에 표시됩니다.",
      "emptyCta": "온라인 스크레이퍼로 이동",
      "recentTitle": "최근 작업",
      "viewAll": "모두 보기",
      "recentEmptyHint": "위에서 시작한 작업이 여기에 표시됩니다.",
      "noMatchTitle": "일치하는 작업이 없습니다",
      "noMatchHint": "다른 작업 번호나 키워드로 검색하거나 필터를 지우세요.",
      "moreKeywordsShort": "+{count}",
      "moreKeywords": "외 {count}개",
      "columns": {
        "taskNo": "작업",
        "createdAt": "생성 시간",
        "samples": "검색",
        "records": "기록",
        "status": "상태"
      },
      "status": {
        "queued": "대기 중",
        "collecting": "수집",
        "publishing": "준비 중 CSV",
        "completed": "완전한",
        "partial": "부분적인 성공",
        "failed": "실패한"
      },
      "search": {
        "label": "작업 검색",
        "placeholder": "작업 번호 또는 키워드로 검색",
        "clear": "검색어 지우기"
      },
      "filters": {
        "label": "작업 필터",
        "button": "필터",
        "status": "상태",
        "all": "전체",
        "running": "진행 중",
        "clear": "필터 지우기"
      },
      "range": {
        "label": "기간",
        "last7": "최근 7일",
        "last30": "최근 30일",
        "all": "전체 기간",
        "custom": "사용자 지정 기간",
        "from": "시작",
        "to": "종료",
        "apply": "적용",
        "invalid": "시작일은 종료일과 같거나 이전이어야 합니다."
      },
      "pagination": {
        "label": "페이지 이동",
        "previous": "이전의",
        "next": "다음",
        "page": "{page}페이지",
        "pageSize": "페이지당 행 수",
        "summary": "{from}–{to} 중 {total}"
      },
      "detail": {
        "show": "세부",
        "loading": "검색 로드 중...",
        "loadFailed": "이 작업에 대한 검색을 로드하지 못했습니다.",
        "keyword": "예어",
        "records": "기록",
        "runNo": "달리다",
        "startedAt": "시작 시간",
        "finishedAt": "종료 시간",
        "contacts": "이메일 및 소셜 프로필",
        "contactsEnabled": "이 작업에 활성화됨",
        "contactsDisabled": "이 작업을 위해 꺼짐",
        "completed": "완전한",
        "pending": "보류 중",
        "viewport": "{lat}, {lng} · 줌 {zoom}"
      },
      "copyJob": "작업 번호 복사",
      "dedupeHint": "레코드 수는 작업 전체에서 중복을 제거한 뒤 계산됩니다.",
      "finished": "작업 {job}: {status}",
      "finishedRecords": "레코드 {count}개",
      "downloadCsv": "다운로드 CSV",
      "noFile": "아니요 CSV",
      "errors": {
        "31301": "이 검색을 수집할 수 없습니다.",
        "31302": "일부 결과를 사용할 수 없습니다. 전달된 행은 유지됩니다.",
        "31303": "수집가가 바쁩니다. 다시 시도해 보세요.",
        "31304": "이 내보내기를 게시할 수 없습니다."
      },
      "errorFailed": "이 검색을 완료할 수 없습니다.",
      "downloading": "준비 중...",
      "downloadUnavailable": "다운로드할 수 없습니다 CSV. 파일이 만료되었을 수 있습니다.",
      "downloadFailed": "다운로드를 시작할 수 없습니다. 다시 시도해 주세요.",
      "signInPrompt": "온라인 내보내기 기록을 보려면 로그인하세요.",
      "signInCta": "로그인",
      "unreachable": "지금은 MapsGrab에 도달할 수 없습니다."
    },
    "api": {
      "description": "API 키, 월별 요청 허용량 및 연결된 AI 앱을 관리하세요.",
      "docsLink": "API 제품 보기",
      "signInPrompt": "API 액세스를 관리하려면 로그인하세요.",
      "loading": "API 액세스 로드 중...",
      "loadFailed": "API 액세스 권한을 로드할 수 없습니다. 다시 시도해 주세요.",
      "retry": "다시 해 보다",
      "refresh": "새로 고치다",
      "keyTitle": "API 키",
      "keyEmpty": "아직 API 키를 생성하지 않았습니다.",
      "generateKey": "API 키 생성",
      "rotateKey": "API 키 교체",
      "generatingKey": "생성 중...",
      "keyOnce": "지금 이 키를 복사하세요. 이 페이지를 나가거나 새로 고친 후에는 다시 볼 수 없습니다.",
      "keyCreated": "생성됨",
      "rotateTitle": "API 키를 교체하시겠습니까?",
      "rotateMessage": "현재 키는 즉시 작동이 중지됩니다. 이를 사용하는 모든 앱을 새 키로 업데이트하세요.",
      "cancel": "취소",
      "copyKey": "API 키 복사",
      "copied": "복사됨",
      "copyFailed": "복사할 수 없습니다. 텍스트를 선택하고 수동으로 복사합니다.",
      "keyFailed": "API 키를 생성할 수 없습니다. 다시 시도해 주세요.",
      "usageTitle": "월별 API 사용량",
      "usageFailed": "API 사용량을 불러오지 못했습니다. 다시 시도해 주세요.",
      "usageValue": "{used} / {total} 요청",
      "usagePeriod": "기간: {period}",
      "quotaExhausted": "월별 요청 허용량이 소진되었습니다.",
      "quotaReset": "매월 1일 초기화(ET) · API와 MCP 공용",
      "planTitle": "API 계획",
      "managePlan": "구독 관리",
      "connectionsTitle": "연결",
      "connectTabsLabel": "연결 방식",
      "connectDocs": {
        "api": "API 참조",
        "mcp": "MCP 설정 가이드",
        "mcpKey": "API 키 설정 가이드"
      },
      "connectTabs": {
        "api": "API",
        "mcp": "MCP",
        "mcpKey": "MCP + API 키"
      },
      "apiUrl": "API 기본 URL",
      "mcpUrl": "MCP 서버 URL",
      "mcpHint": "MCP 클라이언트에 URL을 추가하세요. 이 웹사이트가 열리면 로그인하고 연결을 승인하세요.",
      "mcpKeyHint": "브라우저로 로그인할 수 없는 클라이언트용입니다. 요청은 API 키로 인증되며 연결 승인 단계가 없습니다.",
      "mcpConfigTitle": "클라이언트 설정",
      "mcpConfigHint": "이 항목을 MCP 클라이언트 설정에 추가하세요. 필드 이름은 클라이언트마다 조금씩 다릅니다.",
      "mcpUnavailable": "MCP 연결 주소는 아직 사용할 수 없습니다.",
      "copyUrl": "복사 URL",
      "curlTitle": "빠른 시작",
      "curlHint": "자리 표시자를 전체 API 키로 바꾸세요.",
      "grants": {
        "title": "연결된 앱",
        "description": "API 허용량을 사용하여 업체를 검색하고 리뷰 및 공개 사진을 읽을 수 있도록 허용한 앱입니다.",
        "loading": "연결된 앱 로드 중...",
        "empty": "연결된 앱이 없습니다.",
        "loadFailed": "연결된 앱을 로드할 수 없습니다. 다시 시도해 주세요.",
        "selfDeclared": "앱 자체에서 제공하는 이름: {name}",
        "createdLabel": "연결됨",
        "refreshedLabel": "마지막 새로 고침",
        "notRefreshed": "아직 아님",
        "revoke": "연결 끊기",
        "revokeTitle": "이 앱을 연결 해제하시겠습니까?",
        "revokeMessage": "{host}은 즉시 액세스 권한을 잃게 되며 다시 연결하려면 승인이 필요합니다.",
        "revokeFailed": "이 앱을 연결 해제할 수 없습니다. 다시 시도해 주세요.",
        "paginationLabel": "연결된 앱 페이지",
        "pageOf": "페이지 {page}/{pages}"
      }
    },
    "subscriptions": {
      "title": "구독",
      "description": "온라인 스크레이퍼, 브라우저 확장 프로그램 및 API에 대한 계획 및 갱신 상태. 가격 페이지에서 구매하거나 업그레이드하세요.",
      "lines": {
        "online": "온라인 스크레이퍼",
        "extension": "브라우저 확장",
        "api": "API"
      },
      "planLabel": "계획",
      "expiresLabel": "갱신/만료",
      "free": "무료",
      "unavailable": "일시적으로 이용할 수 없습니다",
      "autoRenewOn": "자동 갱신 날짜",
      "autoRenewOff": "자동 갱신 꺼짐",
      "paidVia": "결제 수단: {method}",
      "subscribeCta": "플랜을 선택하세요",
      "pricingLink": "요금 보기",
      "manageSubscription": "구독 관리",
      "managingSubscription": "열기...",
      "manageFailed": "구독 관리를 열지 못했습니다. 다시 시도해 주세요.",
      "signInPrompt": "구독 내용을 보려면 로그인하세요."
    },
    "cancelGuide": {
      "title": "결제 제공업체에서 구독을 관리하세요",
      "paths": [
        {
          "provider": "PayPal",
          "steps": [
            "PayPal에 로그인하고 설정을 엽니다.",
            "결제로 이동한 다음 자동 결제로 이동하세요.",
            "MapsGrab을 선택하고 취소를 선택합니다."
          ]
        },
        {
          "provider": "ClinkBill",
          "steps": [
            "구매 이메일에서 고객 포털 링크를 엽니다.",
            "로그인하고 MapsGrab 구독을 선택하세요.",
            "취소를 선택합니다."
          ]
        }
      ],
      "closeLabel": "닫다"
    }
  },
  "pages": {
    "home": {
      "seo": {
        "title": "MapsGrab — Google Maps 비즈니스 데이터를 CSV 및 JSON로 가져옵니다.",
        "description": "MapsGrab은 Google Maps에서 이름, 전화번호, 리뷰, 사진, 이메일 등 공개적으로 사용 가능한 비즈니스 정보를 수집하여 CSV 또는 JSON로 내보내는 브라우저 확장 프로그램이자 웹 툴킷입니다."
      },
      "hero": {
        "announce": {
          "badge": "새로운",
          "text": "MCP AI 에이전트용 서버"
        },
        "title": {
          "firstLine": "Google Maps 데이터를",
          "secondLine": "",
          "accent": "클릭 한 번으로 수집",
          "end": ""
        },
        "lead": "이름, 전화번호, 웹사이트, 리뷰, 사진, 이메일 등 Google Maps에서 공개 비즈니스 데이터를 수집하고 단 몇 초 만에 CSV 또는 JSON를 깔끔하게 내보낼 수 있습니다.",
        "search": {
          "label": "검색 키워드",
          "typing": [
            "포틀랜드의 커피숍",
            "텍사스주 오스틴의 치과의사",
            "시카고 근처 배관공",
            "브루클린의 요가 스튜디오",
            "마이애미 비치의 호텔"
          ],
          "submit": "결과 미리보기",
          "loading": "수색…",
          "suggestLabel": "노력하다",
          "suggestions": [
            "포틀랜드의 커피숍",
            "텍사스주 오스틴의 치과의사",
            "시카고 근처 배관공"
          ]
        },
        "trust": [
          "신용 카드가 필요하지 않습니다",
          "{records} 무료 기록/월",
          "CSV & JSON 내보내기"
        ],
        "dashboard": "온라인 스크레이퍼 열기",
        "theater": {
          "panelLabel": "MapsGrab 패널 미리보기",
          "extensionActive": "MapsGrab 확장 프로그램 활성화됨",
          "mapFilters": [
            "지금 열기",
            "최고 평점",
            "가격"
          ],
          "live": "살다",
          "done": "완료",
          "start": "데이터 수집 시작",
          "pause": "정지시키다",
          "extracting": "{count} 추출 중…",
          "finished": "완료 · {count}개 장소",
          "kpis": {
            "phones": "전화",
            "emails": "이메일",
            "websites": "웹사이트"
          },
          "export": "상세 목록 내보내기 - {count} (.CSV)",
          "exportSaved": "내보내기가 저장되었습니다.",
          "emailFound": "이메일을 찾았습니다.",
          "averageRating": "평균 평점",
          "placeId": "Place ID",
          "ratingValue": "{rating} · {reviews} 리뷰"
        },
        "preview": {
          "title": "결과",
          "count": "첫 번째 결과 페이지에 {count}개 업체",
          "columns": {
            "name": "이름",
            "address": "주소",
            "category": "범주",
            "rating": "평가",
            "reviews": "리뷰",
            "phone": "핸드폰"
          },
          "locked": "결과를 수집하고 내보내려면 로그인하고 온라인 스크레이퍼에 키워드를 제출하세요.",
          "signIn": "전체 작업을 시작하려면 로그인하세요.",
          "failed": "미리보기를 로드할 수 없습니다. 다시 시도해 주세요.",
          "empty": "첫 번째 결과 페이지에 업체가 없습니다."
        }
      },
      "facts": {
        "caption": "MapsGrab 숫자로 보기",
        "items": [
          {
            "value": 36,
            "label": "비즈니스별 데이터 열"
          },
          {
            "value": 11,
            "label": "리뷰 필드, 소유자 답변 포함"
          },
          {
            "value": 6,
            "label": "웹사이트별로 일치하는 소셜 네트워크"
          },
          {
            "value": "freeRecords",
            "label": "매달 무료 녹음"
          },
          {
            "value": 3,
            "plus": 1,
            "label": "실행 방법: 확장, 온라인, API — 플러스 MCP"
          }
        ]
      },
      "how": {
        "head": {
          "kicker": "작동 원리",
          "title": {
            "lead": "지도 검색에서 ",
            "accent": "스프레드시트",
            "tail": "까지 3단계로 완료"
          },
          "lead": "코드도 없고 복사 붙여넣기도 없습니다. MapsGrab은 Google Maps이 이미 표시한 내용을 읽고 이를 구조화된 행으로 변환합니다."
        },
        "steps": [
          {
            "title": "검색 Google Maps",
            "body": "Google Maps를 열고 평소와 똑같이 업체 유형과 위치를 검색하세요."
          },
          {
            "title": "데이터 수집 시작",
            "body": "{action}을 클릭하세요. MapsGrab은 결과를 스크롤하고 목록을 수집하며 활성화되면 연락처를 풍부하게 합니다.",
            "action": "데이터 수집 시작"
          },
          {
            "title": "어디서나 내보내기",
            "body": "선택한 열과 함께 CSV 또는 JSON을 다운로드하세요. 리뷰와 사진은 Excel이나 CRM에서 바로 사용할 수 있는 자체 파일로 저장됩니다."
          }
        ],
        "searchSample": "시애틀의 빵집",
        "columnsUnit": "기둥",
        "reviewsFile": "리뷰"
      },
      "products": {
        "head": {
          "kicker": "제품",
          "title": {
            "lead": "",
            "accent": "",
            "tail": " 지도 데이터를 가져오는 세 가지 방법."
          },
          "lead": "브라우저 확장 프로그램, 클라우드 기반 온라인 스크레이퍼 또는 API을 선택하세요. 확장 프로그램은 귀하의 브라우저 내에서 작동합니다. 온라인 스크레이퍼와 API은 하나의 클라우드 엔진을 공유합니다."
        },
        "cards": {
          "extension": {
            "badge": "브라우저 확장",
            "title": "탐색하는 동안 데이터를 확보하세요 Google Maps",
            "body": "열려 있는 지도 페이지에서 비즈니스 데이터, 리뷰, 사진을 추출한 다음 모든 것을 로컬로 내보냅니다. 가장자리, Firefox 및 Chromium.",
            "link": "확장 프로그램 살펴보기"
          },
          "online": {
            "badge": "온라인 스크레이퍼",
            "title": "클라우드가 실행됩니다. 설치할 것이 없습니다.",
            "body": "키워드를 붙여넣고, 클라우드에서 비즈니스 세부정보를 수집하고, 작업별로 중복 제거된 37열 CSV 하나를 다운로드하세요.",
            "link": "온라인 스크레이퍼 살펴보기"
          },
          "api": {
            "badge": "API",
            "title": "HTTP 이상 JSON 청소",
            "body": "귀하의 애플리케이션에 대한 비즈니스 데이터 및 리뷰 — 하나의 API 키.",
            "link": "API 탐색"
          },
          "mcp": {
            "badge": "MCP 서버",
            "title": "AI 에이전트를 위한 실시간 지도 데이터",
            "body": "Claude Code, Cursor, VS Code 및 Codex에 대한 MCP 도구로 검색하고 리뷰합니다.",
            "link": "MCP 서버 탐색"
          }
        },
        "extracting": "{count} 추출 중…",
        "queue": {
          "rows": "{count}행",
          "processing": "처리"
        },
        "chat": {
          "prompt": "웹사이트를 통해 오스틴에서 4.5+ 등급을 받은 치과의사를 찾아보세요",
          "answer": "{count} 일치하는 항목을 찾았습니다. 상위 3개:"
        }
      },
      "fields": {
        "head": {
          "kicker": "데이터",
          "title": {
            "lead": "36열. ",
            "accent": "모두",
            "tail": " 유용합니다."
          },
          "lead": "확장 프로그램은 검색 결과 및 비즈니스 페이지에서 하나의 스키마(연락처 세부 정보, 위치, 프로필, 평가 및 나중에 기록을 일치시키는 데 필요한 모든 식별자)를 내보냅니다."
        },
        "filtersLabel": "필드 그룹",
        "all": "모두",
        "groups": {
          "contact": {
            "filter": "연락하다",
            "label": "연락하다"
          },
          "location": {
            "filter": "위치",
            "label": "위치"
          },
          "profile": {
            "filter": "윤곽",
            "label": "비즈니스 프로필"
          },
          "reviews": {
            "filter": "평가",
            "label": "평가 및 리뷰"
          },
          "ids": {
            "filter": "ID 및 링크",
            "label": "ID 및 링크"
          }
        },
        "sampleLabel": "샘플 값",
        "emptySample": "(비어 있는)",
        "descriptions": {
          "Name": "업체 이름은 목록에 표시된 것과 정확히 같습니다.",
          "Description": "비즈니스 프로필의 간단한 설명입니다.",
          "Fulladdress": "완전한 형식의 주소입니다.",
          "Street": "주소의 거리입니다.",
          "Municipality": "도시 또는 지역.",
          "Categories": "비즈니스에 할당된 모든 카테고리입니다.",
          "About": "정보 탭의 속성.",
          "Plus Code": "개방 위치 코드용으로 예약된 열 — 현재는 비어 있습니다.",
          "Time Zone": "해당 위치의 IANA 시간대입니다.",
          "Price": "목록에 표시된 가격 수준.",
          "Note": "판매자 메모 또는 강조표시.",
          "Amenities": "편의시설 및 서비스 옵션.",
          "Hotel Class": "숙박 목록에 대한 스타 클래스입니다.",
          "Phone": "목록에 표시된 기본 전화번호입니다.",
          "Phones": "업체에 대해 검색된 모든 전화번호입니다.",
          "Claimed": "소유자가 프로필에 대한 소유권을 주장했는지 여부입니다.",
          "Owner": "프로필의 소유자 이름입니다.",
          "Owner Id": "소유자 계정의 기여자 ID입니다.",
          "Owner Link": "소유자의 기여자 페이지에 대한 링크입니다.",
          "Email": "비즈니스 웹사이트에서 찾은 이메일 주소입니다.",
          "Social Medias": "웹사이트에서 연결된 소셜 프로필입니다.",
          "Review Count": "총 리뷰 수입니다.",
          "Average Rating": "평균 별점.",
          "Review URL": "리뷰 패널에 대한 직접 링크입니다.",
          "Google Maps URL": "CID에서 구축된 안정적인 짧은 링크입니다.",
          "Google Knowledge URL": "지식 패널 검색 링크.",
          "Latitude": "십진수 도 단위의 위도입니다.",
          "Longitude": "십진수 도 단위의 경도입니다.",
          "Website": "목록의 공식 웹 사이트.",
          "Domain": "웹사이트의 등록 가능한 도메인입니다.",
          "Opening Hours": "주간 영업시간, 휴무일이 표시되어 있습니다.",
          "Featured Image": "목록의 표지 사진 URL.",
          "Cid": "고객 ID — FID의 10진수 형식입니다.",
          "Fid": "두 개의 16진수로 구성된 기능 ID입니다.",
          "Place Id": "안정적 Google Place ID.",
          "Kgmid": "지식 그래프 시스템 ID."
        },
        "reviews": {
          "title": "+ 11 리뷰 열",
          "body": "별도로 내보내고 계획 한도까지 페이지를 매겼습니다."
        },
        "photos": {
          "title": "+ 사진 URL 목록",
          "body": "업체당 공개 앨범 사진 URLs, 스트리트 뷰가 필터링되었습니다."
        },
        "sampleCsv": "샘플 다운로드 CSV"
      },
      "enrichment": {
        "head": {
          "kicker": "농축",
          "title": {
            "lead": "핀에서 사람까지 ",
            "accent": "이메일",
            "tail": "을 보낼 수 있습니다."
          },
          "lead": "농축이 켜져 있으면 MapsGrab 각 업체 공식 홈페이지를 확인하고 추출하면서 직접 연락 채널을 채워넣습니다."
        },
        "points": [
          "비즈니스 웹사이트에서 찾은 이메일 주소",
          "소셜 프로필: Facebook, Instagram, LinkedIn, X, YouTube, TikTok",
          "유료 온라인 요금제에서는 기본적으로 확장 기능에 하나의 설정이 있습니다.",
          "하나의 플래그로 API 검색 응답에 포함됨 - 별도의 강화 단계 없음"
        ]
      },
      "developers": {
        "head": {
          "kicker": "개발자용",
          "title": {
            "lead": "지도 데이터를 귀하가 구축한 ",
            "accent": "모든 것",
            "tail": "에 연결하세요."
          },
          "lead": "HTTP API 및 MCP 서버로 노출되는 온라인 스크레이퍼 뒤에 있는 클라우드 엔진입니다. 구조화된 JSON, 하나의 키, 구문 분석할 HTML이 없습니다."
        },
        "listLabel": "개발자 제품",
        "items": {
          "search": {
            "title": "수집 API",
            "description": "모든 키워드 및 위치에 대한 업체"
          },
          "reviews": {
            "title": "리뷰 API",
            "description": "평가, 텍스트 및 소유자 답변"
          },
          "photos": {
            "title": "사진 API",
            "description": "업체당 공개 사진 URLs"
          },
          "mcp": {
            "title": "MCP 서버",
            "description": "모든 MCP 클라이언트를 위한 검색 및 리뷰 도구"
          }
        },
        "langLabel": "언어",
        "copyLabel": "복사요청",
        "sending": "요청을 보내는 중…",
        "response": "응답 · 200 OK · {ms} ms",
        "toolCall": "도구 호출 · {tool} · 200 확인",
        "exploreApi": "API 탐색",
        "apiPricing": "API 가격",
        "worksWith": "이미 사용하고 있는 도구와 함께 작동",
        "integrations": [
          "Claude Code",
          "Cursor",
          "VS Code",
          "Codex",
          "MCP Inspector",
          "마이크로소프트 엑셀",
          "CSV",
          "JSON",
          "ZIP 묶음"
        ]
      },
      "useCases": {
        "head": {
          "kicker": "사용 사례",
          "title": {
            "lead": "작업용으로 제작 ",
            "accent": "후",
            "tail": " 검색"
          }
        },
        "cards": [
          {
            "label": "리드 생성",
            "title": "지역 리드 목록",
            "body": "카테고리와 도시를 검색한 다음 전화, 웹사이트, 이메일을 포함한 전체 결과 페이지를 하나의 스프레드시트로 내보냅니다."
          },
          {
            "label": "로컬 SEO",
            "title": "경쟁사 벤치마크",
            "body": "한 번의 패스로 해당 지역의 모든 경쟁업체에 대한 평가 및 리뷰 수를 가져오고 내보내기에서 바로 보고서를 작성합니다."
          },
          {
            "label": "시장 조사",
            "title": "위치 데이터세트",
            "body": "모든 지점이나 경쟁업체 위치에 대한 장소 ID와 좌표를 수집하여 매핑 및 경로 지정 도구를 사용할 수 있습니다."
          }
        ],
        "leadTags": [
          "이메일",
          "핸드폰",
          "이메일",
          "대지"
        ]
      },
      "pricingTeaser": {
        "head": {
          "kicker": "가격",
          "title": {
            "lead": "무료로 시작하세요. ",
            "accent": "규모",
            "tail": " 성과를 거두면."
          },
          "lead": "모든 제품에는 시간 제한이 없는 무료 등급이 있습니다. 실제로 사용하는 표면만 업그레이드하세요."
        },
        "lines": {
          "extension": {
            "title": "브라우저 확장",
            "billing": "월간 간행물",
            "link": "확장 계획 보기"
          },
          "online": {
            "title": "온라인 스크레이퍼",
            "billing": "일회성",
            "link": "온라인 요금제 보기"
          },
          "api": {
            "title": "API & MCP",
            "billing": "일회성",
            "link": "API 계획 보기"
          }
        }
      },
      "tools": {
        "head": {
          "kicker": "무료 도구",
          "title": {
            "lead": "지도용 소형 도구 ",
            "accent": "고급 사용자",
            "tail": ""
          },
          "lead": "브라우저에서 완전히 실행되는 7가지 유틸리티 - 붙여넣은 내용이 장치 밖으로 나가지 않습니다. 단, 이메일 검사기는 예외로, 검증을 위해 주소를 당사 서버로 보냅니다."
        },
        "descriptions": {
          "place-id-finder": "지도 장소 URL를 붙여넣고 Place ID, CID 및 FID을 읽어보세요.",
          "review-link-generator": "모든 비즈니스에 대해 직접 \"리뷰 작성\" 링크를 받으세요.",
          "email-checker": "이메일 주소가 실제로 메일을 받을 수 있는지 확인하세요.",
          "lat-long-to-dms": "도, 분, 초 단위의 십진수 좌표입니다.",
          "dms-to-dd": "DMS은 깨끗한 십진수 각도로 다시 조정됩니다.",
          "bulk-keywords-generator": "모든 '키워드 + 위치' 조합을 붙여넣을 수 있습니다.",
          "merge-csv": "CSV 내보내기를 헤더별로 정렬된 하나의 파일로 병합합니다."
        },
        "more": "더 많은 도구 제공 예정"
      },
      "faq": {
        "kicker": "자주 묻는 질문",
        "title": {
          "lead": "",
          "accent": "자주 묻는 질문",
          "tail": ""
        },
        "lead": "짧은 답변. 그 밖의 지원은 이메일 한 번으로 가능합니다.",
        "contact": "지원팀에 문의",
        "items": [
          {
            "question": "MapsGrab은 무료로 사용할 수 있나요?",
            "answer": "예. 확장 프로그램은 계정 없이 작동하며 무료 월간 기록 할당량을 포함합니다. 가격 페이지의 유료 요금제는 더 필요할 때 한도를 높입니다."
          },
          {
            "question": "어떤 브라우저가 지원되나요?",
            "answer": "확장 프로그램 페이지에서 MapsGrab을 다운로드하세요. Chrome, Edge 및 Brave는 압축을 푼 ZIP을 로드합니다. Firefox는 다시 시작한 후 다시 로드해야 하는 별도의 임시 추가 기능을 사용합니다. 이 페이지에는 설치 및 업데이트 지침이 포함되어 있습니다."
          },
          {
            "question": "데이터의 출처는 어디이며, 수집하는 것이 합법적인가요?",
            "answer": "MapsGrab은 귀하가 방문하는 Google Maps 페이지에 공개적으로 표시되는 정보만 수집합니다. 이는 모든 방문자가 읽을 수 있는 것과 동일한 세부정보입니다. 우리는 개인 계정, 비공개 콘텐츠 또는 비공개 데이터에 접근하지 않습니다."
          },
          {
            "question": "웹 도구를 설치해야 합니까?",
            "answer": "아니요. 무료 웹 도구는 전적으로 브라우저에서 실행됩니다. 입력 내용이 장치를 떠나지 않습니다. 단, 이메일 검사기는 예외로, 입력한 주소를 당사 서버로 보내 이메일 검증 서비스 업체가 확인하며, 이 과정에서 이메일은 발송되지 않습니다."
          },
          {
            "question": "어떤 형식으로 내보낼 수 있나요?",
            "answer": "내보내기는 선택한 필드 선택에 따라 CSV 또는 JSON로 제공되며 Place ID로 중복이 제거됩니다."
          },
          {
            "question": "MapsGrab가 내가 수집한 데이터를 볼 수 있나요?",
            "answer": "귀하의 설정과 결과는 귀하의 브라우저에 로컬로 저장됩니다. 당사 서버는 원격 구성, 계정 및 할당량 상태, 선택적 이메일/소셜 강화 및 최소 사용 로그만 처리합니다."
          }
        ]
      },
      "cta": {
        "kicker": "시작하기",
        "title": {
          "lead": "",
          "accent": "분",
          "tail": " 후에 잡기 시작하세요"
        },
        "lead": "확장 프로그램을 설치하고, Google Maps을 열고, 검색하고, 첫 번째 목록을 내보냅니다. 계정은 필요하지 않습니다.",
        "install": "MapsGrab 무료 설치",
        "online": "온라인 스크레이퍼를 사용해 보세요",
        "note": "무료 월별 할당량이 포함되어 있습니다. 신용카드가 없습니다."
      }
    },
    "extension": {
      "seo": {
        "title": "MapsGrab for Chrome, Edge & Firefox — Google Maps 추출기 확장",
        "description": "Google Maps에서 비즈니스 데이터, 리뷰 및 사진의 36열을 추출하고, 이메일 및 소셜 링크로 기록을 보강하고, 일괄 작업을 실행하고, CSV 또는 JSON로 내보냅니다."
      },
      "hero": {
        "announce": {
          "badge": "v{version}",
          "text": "Chrome, Edge 및 Firefox용 다운로드"
        },
        "title": {
          "lead": "",
          "accent": "브라우저",
          "tail": "용 Google Maps 추출기"
        },
        "lead": "Google Maps 검색 또는 비즈니스 페이지를 열고 거기에 공개적으로 표시되는 비즈니스 데이터, 리뷰, 사진, 연락처 정보를 가져옵니다. 모든 것이 브라우저에서 바로 CSV 또는 JSON로 내보내집니다.",
        "downloadCta": "Chrome 및 Edge용 다운로드",
        "installCta": "설치 가이드",
        "meta": [
          "계정이 필요하지 않습니다",
          "1,000 무료 기록/월",
          "내보내기는 컴퓨터에 유지됩니다."
        ],
        "theater": {
          "panelLabel": "MapsGrab 패널 미리보기",
          "extensionActive": "MapsGrab이 페이지에서 활성화되었습니다.",
          "dock": "도킹 왼쪽/오른쪽",
          "filters": [
            "지금 열기",
            "최고 평점",
            "가격"
          ],
          "open": "열려 있는",
          "closes": "마감 {time}",
          "endOfList": "목록의 끝에 도달했습니다.",
          "start": "데이터 수집 시작",
          "extracting": "{count} 추출 중…",
          "pause": "정지시키다",
          "complete": "추출이 완료되었습니다.",
          "reset": "다시 놓기",
          "kpis": {
            "phones": "전화",
            "websites": "웹사이트",
            "emails": "이메일"
          },
          "exportCta": "상세 목록 내보내기 - {count} (.CSV)",
          "saved": "다운로드에 저장됨",
          "scrollChip": {
            "label": "자동 스크롤",
            "value": "인간 속도, 5–10초"
          },
          "dedupeChip": {
            "label": "중복 제거됨",
            "value": "Place ID 기준"
          }
        }
      },
      "facts": {
        "caption": "확장 프로그램 개요",
        "items": [
          {
            "value": 36,
            "label": "업체당 열(이름부터 Place ID까지)"
          },
          {
            "value": 11,
            "label": "리뷰 열, 소유자 답변 포함"
          },
          {
            "value": 6,
            "label": "웹사이트별로 일치하는 소셜 네트워크"
          },
          {
            "value": 1000,
            "label": "매달 무료 기록, 계정 필요 없음"
          },
          {
            "value": 500,
            "label": "키워드 또는 리뷰 일괄 작업당 URLs"
          }
        ]
      },
      "views": {
        "head": {
          "kicker": "그것이 작동하는 곳",
          "title": {
            "lead": "",
            "accent": "지도 보기",
            "tail": "당 하나의 패널"
          },
          "lead": "MapsGrab 패널이 Google Maps 바로 위에 나타납니다. 검색 결과, 비즈니스 페이지 및 저장된 목록은 각각 올바른 추출 모드를 갖습니다. 복사-붙여넣기나 탭 저글링이 필요하지 않습니다."
        },
        "search": {
          "title": "검색결과",
          "description": "검색에서 추출 시작을 누르세요. MapsGrab는 사람의 속도로 결과 목록을 스크롤하고 로드되는 각 목록을 수집합니다."
        },
        "place": {
          "title": "비즈니스 페이지",
          "description": "비즈니스 페이지의 리뷰 및 사진 탭에서는 리뷰와 사진 앨범 페이지를 볼 수 있습니다. 리뷰는 11 열로, 사진은 URL 목록으로 내보냅니다.",
          "tabs": [
            "개요",
            "리뷰 및 사진"
          ],
          "reviewsCta": "리뷰 추출 시작",
          "photosCta": "사진 추출 시작",
          "reviewsCount": "{count} 리뷰",
          "photosCount": "{count} 사진"
        },
        "saved": {
          "title": "저장된 목록",
          "description": "저장된 목록을 열고 시작을 한 번 누르세요. MapsGrab 각 장소를 차례로 열고 수집합니다. 항목별 클릭이 없습니다.",
          "listName": "즐겨찾기 · {count} 장소"
        }
      },
      "features": {
        "head": {
          "kicker": "특징",
          "title": {
            "lead": "지도 페이지에 표시되는 모든 것, ",
            "accent": "구조화",
            "tail": ""
          },
          "lead": "검색 결과와 비즈니스 페이지 전반에 걸쳐 하나의 추출 스키마가 현재 Google Maps 인터페이스에 맞춰 조정되고 Google 변경 시 원격으로 업데이트됩니다."
        },
        "tabsLabel": "확장 기능",
        "tabs": [
          {
            "id": "business",
            "title": "비즈니스 데이터",
            "description": "업체당 36 열(목록 스크롤로 캡처됨)"
          },
          {
            "id": "reviews",
            "title": "리뷰",
            "description": "소유자의 답글이 포함된 리뷰가 자동으로 페이징됩니다."
          },
          {
            "id": "photos",
            "title": "사진",
            "description": "바로 사용할 수 있는 URL 목록의 앨범 사진."
          },
          {
            "id": "enrichment",
            "title": "이메일 및 소셜 강화",
            "description": "공식 웹사이트의 직접 연락 채널."
          },
          {
            "id": "batch",
            "title": "일괄 작업",
            "description": "키워드 대기열 또는 리뷰 URLs, 항목별로 이동했습니다."
          },
          {
            "id": "export",
            "title": "내보내다",
            "description": "CSV 또는 JSON, 컴퓨터에 바로 저장됩니다."
          }
        ],
        "business": {
          "claimed": "청구됨",
          "fields": {
            "phone": "핸드폰",
            "website": "웹사이트",
            "rating": "평균 평점",
            "hours": "영업시간",
            "timeZone": "시간대",
            "coordinates": "좌표",
            "placeId": "Place ID",
            "mapsUrl": "Google Maps URL"
          },
          "reviewCount": "{count} 리뷰",
          "columns": "업체당 {count}열",
          "reserved": "플러스 코드 예약됨",
          "more": "+{count} 더보기"
        },
        "reviews": {
          "title": "리뷰",
          "columns": "{count}열",
          "ownerReply": "소유자의 응답",
          "loading": "다음 리뷰 페이지 로드 중"
        },
        "photos": {
          "streetView": "스트리트 뷰 · 필터링됨"
        },
        "enrichment": {
          "website": "공식 홈페이지",
          "moreNetworks": "X, YouTube 및 TikTok도 확인했습니다."
        },
        "batch": {
          "complete": "{count} 완료",
          "stuck": "{count} 멈춤",
          "total": "{count} 합계",
          "done": "완료 · {count}",
          "skipped": "90초 동안 진행이 없습니다. · 건너뛰었습니다.",
          "running": "적출…",
          "queued": "대기 중",
          "autoExport": "작업이 완료되면 자동으로 내보내기"
        },
        "files": {
          "formats": [
            ".CSV",
            ".JSON"
          ],
          "fileMeta": "{rows} 행 · {total} 열 중 {selected} 선택됨 · Place ID에 의해 중복 제거됨",
          "destinations": [
            {
              "title": "다운로드",
              "description": "브라우저에 저장됨"
            },
            {
              "title": "열 선택기",
              "description": "필요한 열만 내보내기"
            },
            {
              "title": "자동 다운로드",
              "description": "추출이 끝나면 바로 저장"
            }
          ]
        }
      },
      "batch": {
        "head": {
          "kicker": "일괄 작업",
          "title": {
            "lead": "목록을 대기열에 넣습니다. ",
            "accent": "가라.",
            "tail": ""
          },
          "lead": "하나의 작업에 최대 500개의 키워드를 붙여넣거나 URLs을 리뷰하세요. MapsGrab 실시간 진행 상황을 통해 항목별로 살펴보고, 지연되는 항목을 건너뛰고, 작업이 완료되면 자동으로 내보냅니다."
        },
        "checks": [
          "키워드 작업은 키워드당 하나의 지도 검색을 실행합니다.",
          "리뷰-URL 작업은 업체별 리뷰를 수집합니다.",
          "작업 상태는 디스크에 저장되며 브라우저를 다시 시작한 후에 다시 표시됩니다.",
          "최대 150 작업 저장, 한 번에 하나의 배치 실행"
        ],
        "mock": {
          "tabs": [
            "대량 키워드 데이터 도구",
            "대량 Google 리뷰 추출기"
          ],
          "taskName": "작업 이름",
          "taskPlaceholder": "예를 들어 100 키워드, 디자인 에이전시",
          "keywords": "키워드 · 한 줄에 하나씩",
          "lineCount": "{count} / {limit}",
          "start": "데이터 수집 시작",
          "columns": {
            "task": "작업 이름",
            "status": "상태",
            "actions": "행위"
          },
          "running": "달리기",
          "complete": "완벽한",
          "progress": "{done} / {total}",
          "progressStuck": "{done} / {total} · {stuck} 멈춤",
          "progressExported": "{done} / {total} · 내보냈습니다.",
          "lines": {
            "run": "적출…",
            "done": "완벽한",
            "stuck": "멈춤 · 건너뛰기"
          },
          "toast": "작업 완료 — 내보냈습니다.",
          "chip": {
            "label": "태스크 상태",
            "value": "디스크에 저장됨"
          }
        }
      },
      "privacy": {
        "head": {
          "kicker": "로컬 우선",
          "title": {
            "lead": "결과는 ",
            "accent": "브라우저",
            "tail": "에 유지됩니다."
          },
          "lead": "설정과 결과는 로컬에 저장됩니다. 당사 서버는 원격 구성, 계정 및 할당량 상태, 선택적 이메일 및 소셜 강화, 최소 사용 로그만 처리합니다."
        },
        "checks": [
          "내보내기는 컴퓨터에서 생성됩니다.",
          "파일이 저장되기 전에 열 선택 및 Place ID 중복 제거가 로컬에서 실행됩니다.",
          "원격 구성은 Google Maps 변경 시 패널을 최신 상태로 유지하므로 재설치가 필요하지 않습니다.",
          "읽을 수 없는 항목이 있으면 패널에 자동으로 실패하는 대신 오류가 표시됩니다."
        ],
        "diagram": {
          "browser": "귀하의 브라우저",
          "servers": "MapsGrab 서버",
          "nodes": {
            "mapsTab": "Google Maps 탭",
            "panel": "MapsGrab 패널",
            "storage": "로컬 저장소",
            "exports": "귀하의 내보내기",
            "config": "원격 구성",
            "quota": "계정 및 할당량",
            "enrichment": "농축"
          },
          "flows": {
            "rows": "비즈니스 행",
            "rules": "규칙",
            "usage": "용법",
            "websites": "비즈니스 웹사이트 → 이메일 및 소셜 미디어"
          }
        }
      },
      "install": {
        "head": {
          "kicker": "설치하다",
          "title": {
            "lead": "",
            "accent": "MapsGrab",
            "tail": " 설치"
          },
          "lead": "여기에서 ZIP을 다운로드하고 브라우저에 맞는 단계를 따르세요. Chrome, Edge 및 Brave는 압축이 풀린 폴더를 로드합니다. Firefox은 다시 시작한 후 다시 로드해야 하는 별도의 임시 추가 기능을 사용합니다. 전체 크기로 보려면 이미지를 클릭하세요."
        },
        "zip": {
          "title": "직접 설치(릴리스 zip)",
          "description": "브라우저에서 ZIP을 선택하세요. 보관 중인 폴더에 압축을 푼 다음 아래 가이드를 사용하여 로드하세요. 업데이트하려면 새 ZIP을 다운로드하고 해당 폴더의 파일을 교체한 후 확장 프로그램을 다시 로드하세요.",
          "button": "Chrome, 엣지 & Brave ZIP",
          "firefoxButton": "Firefox ZIP (임시 추가 기능)",
          "meta": "버전 {version} · 시험판"
        },
        "browserLabel": "브라우저",
        "channels": [
          {
            "id": "chromium",
            "tab": "Chrome 및 엣지",
            "note": "Edge, Chrome, Brave 및 기타 Chromium 브라우저",
            "steps": [
              {
                "title": "다운로드하고 압축을 푼다",
                "description": [
                  "다운로드 ",
                  {
                    "code": "mapsgrab.zip"
                  },
                  ". Windows에서 마우스 오른쪽 버튼을 클릭하고 \"모두 추출\"을 선택합니다. macOS에서 더블클릭하세요. 추출된 폴더를 유지하십시오."
                ],
                "shot": "MapsGrab ZIP Chrome에 다운로드됨"
              },
              {
                "title": "확장 프로그램 페이지 열기",
                "description": [
                  "열려 있는 ",
                  {
                    "code": "chrome://extensions"
                  },
                  " Chrome에, ",
                  {
                    "code": "edge://extensions"
                  },
                  " 엣지에서 또는 ",
                  {
                    "code": "brave://extensions"
                  },
                  " Brave에."
                ],
                "shot": "확장 프로그램 관리 페이지"
              },
              {
                "title": "개발자 모드 활성화",
                "description": [
                  "확장 프로그램 페이지에서 개발자 모드를 활성화하세요. Chrome에서는 스위치가 오른쪽 상단에 있습니다."
                ],
                "shot": "압축이 풀린 로드 버튼이 표시된 개발자 모드가 활성화되었습니다."
              },
              {
                "title": "압축을 푼 폴더를 로드합니다.",
                "description": [
                  "\"압축해제된 파일 로드\"를 클릭하고 추출된 폴더를 선택하세요. MapsGrab이 확장 프로그램 목록에 나타납니다. Google Maps 검색을 열어서 사용하세요."
                ],
                "shot": "MapsGrab 카드가 추가된 상태로 포장을 풀고 로드하세요."
              }
            ]
          },
          {
            "id": "firefox",
            "tab": "Firefox",
            "note": "임시 추가 기능; 다시 시작한 후 다시 로드하세요 Firefox",
            "steps": [
              {
                "title": "다운로드하고 압축을 푼다",
                "description": [
                  "다운로드 ",
                  {
                    "code": "mapsgrab-firefox.zip"
                  },
                  ". Windows에서 마우스 오른쪽 버튼을 클릭하고 \"모두 추출\"을 선택합니다. macOS에서 더블클릭하세요. 추출된 폴더를 유지하십시오."
                ],
                "shot": "MapsGrab Firefox ZIP Firefox에 다운로드됨"
              },
              {
                "title": "디버깅 페이지 열기",
                "description": [
                  "다음으로 이동 ",
                  {
                    "code": "about:debugging"
                  },
                  "을 클릭한 다음 왼쪽 사이드바에서 브라우저를 선택하세요."
                ],
                "shot": "Firefox 임시 추가 기능 컨트롤이 있는 디버깅 페이지"
              },
              {
                "title": "추가 기능 로드",
                "description": [
                  "“임시 추가 기능 로드…”를 클릭하고 선택하세요. ",
                  {
                    "code": "manifest.json"
                  },
                  " 압축을 푼 폴더 안에 있습니다. Firefox이 다시 시작되면 임시 추가 기능이 언로드됩니다. 다시 로드하려면 이 단계를 반복하세요."
                ],
                "shot": "MapsGrab는 백그라운드 스크립트가 실행 중인 임시 Firefox 확장으로 로드됩니다."
              }
            ]
          }
        ],
        "help": {
          "title": "설치에 문제가 있나요?",
          "description": "브라우저 이름과 본 내용을 보내주시면 차단을 해제해 드리겠습니다.",
          "cta": "지원팀에 문의"
        },
        "notes": {
          "kicker": "릴리스 노트",
          "version": "0.1.0",
          "status": "시험판",
          "date": "8월 2026",
          "items": [
            "MapsGrab 확장 프로그램의 첫 번째 사전 출시",
            "Google Maps 자동 스크롤 및 36 열 스키마를 사용한 검색 추출",
            "비즈니스 페이지에서 리뷰 및 사진 추출",
            "비즈니스별 이메일 및 소셜 미디어 강화",
            "일괄 키워드 및 리뷰-URL 디스크 작업 상태가 있는 작업",
            "CSV / JSON 필드 선택 및 Place ID 중복 제거를 통해 내보내기",
            "Microsoft Edge 및 Firefox용 빌드"
          ]
        }
      },
      "plans": {
        "head": {
          "kicker": "확장 계획",
          "title": {
            "lead": "하나의 확장, 세 개의 ",
            "accent": "계획",
            "tail": ""
          },
          "lead": "확장 프로그램이 수집하는 모든 행(비즈니스, 리뷰 또는 사진)은 하나의 기록으로 계산됩니다. 모든 계획에는 리뷰, 사진 및 일괄 작업이 포함됩니다. 유료 플랜은 이메일 및 소셜 강화를 포함하여 모든 36 열을 더 많은 월별 볼륨으로 내보냅니다."
        },
        "note": "월간 사용량은 New York 시간의 1일에 재설정됩니다. 사용되지 않은 레코드는 롤오버되지 않습니다.",
        "compare": "모든 요금제 비교"
      },
      "faq": {
        "kicker": "자주 묻는 질문",
        "title": {
          "lead": "",
          "accent": "자주 묻는 질문",
          "tail": ""
        },
        "lead": "짧은 답변. 그 밖의 지원은 이메일 한 번으로 가능합니다.",
        "contact": "지원팀에 문의",
        "items": [
          {
            "question": "확장 프로그램은 무료로 사용할 수 있나요?",
            "answer": "예. 확장 프로그램은 계정 없이 작동하며 매달 1,000 기록을 포함합니다. 가격 페이지의 유료 플랜은 이메일 및 소셜 미디어 강화 기능이 포함된 모든 36 열을 추가하고 월별 볼륨을 높입니다."
          },
          {
            "question": "어떤 브라우저가 지원되나요?",
            "answer": "Chrome, Edge, Brave 및 기타 Chromium 브라우저는 여기에서 다운로드한 압축을 푼 ZIP을 로드합니다. Firefox에는 임시 로딩을 위한 별도의 ZIP이 있습니다. 브라우저를 다시 시작할 때마다 다시 로드하세요. 위의 설치 가이드를 따르세요."
          },
          {
            "question": "로그인해야 하나요?",
            "answer": "아니요. 코어 추출은 계정 없이 작동합니다. 할당량은 로그인한 계정별로 계산되거나, 로그인하지 않은 경우 브라우저 장치별로 계산됩니다. 더 높은 볼륨이 적용되도록 플랜을 소유한 계정으로 로그인하세요."
          },
          {
            "question": "기록으로 간주되는 것은 무엇입니까?",
            "answer": "확장 프로그램이 수집하는 각 행은 검색 또는 저장된 목록의 업체, 리뷰, 사진 등 하나의 기록으로 계산됩니다. 이메일 및 소셜 강화는 기록을 추가하지 않습니다."
          },
          {
            "question": "Google Maps이 변경되면 어떻게 되나요?",
            "answer": "추출 규칙은 원격 구성으로 제공되므로 확장을 다시 설치하지 않고도 수정 사항이 패널에 적용됩니다. 페이지를 읽을 수 없으면 패널에 자동으로 실패하는 대신 오류가 표시됩니다."
          },
          {
            "question": "MapsGrab가 내가 수집한 데이터를 볼 수 있나요?",
            "answer": "귀하의 설정과 결과는 귀하의 브라우저에 로컬로 저장됩니다. 당사 서버는 원격 구성, 계정 및 할당량 상태, 선택적 이메일 및 소셜 강화, 최소 사용 로그만 처리합니다."
          },
          {
            "question": "데이터의 출처는 어디이며, 수집하는 것이 합법적인가요?",
            "answer": "MapsGrab은 귀하가 방문하는 Google Maps 페이지에 공개적으로 표시되는 정보만 수집합니다. 이는 모든 방문자가 읽을 수 있는 것과 동일한 세부정보입니다. 우리는 개인 계정, 비공개 콘텐츠 또는 비공개 데이터에 접근하지 않습니다."
          }
        ]
      },
      "cta": {
        "kicker": "시작하기",
        "title": {
          "lead": "첫 번째 목록을 확보하세요 ",
          "accent": "오늘",
          "tail": ""
        },
        "lead": "확장 프로그램을 설치하고, Google Maps을 검색하고, 깨끗한 스프레드시트를 내보냅니다. 계정은 필요하지 않습니다.",
        "primary": "설치 MapsGrab",
        "secondary": "요금제 비교",
        "note": "무료 월별 할당량이 포함되어 있습니다. 신용카드가 없습니다."
      }
    },
    "account": {
      "auth": {
        "eyebrow": "웹사이트 접속",
        "title": "크레딧을 동기화하려면 로그인하세요",
        "trigger": "로그인",
        "modalTitle": "계속하려면 로그인하세요.",
        "closeLabel": "닫다",
        "signedInAs": "다음 계정으로 로그인됨",
        "continueWithGoogle": "Google로 계속하기",
        "googleLoading": "Google를 여는 중...",
        "or": "또는",
        "emailLabel": "이메일",
        "emailPlaceholder": "name@example.com",
        "continueWithEmail": "이메일로 계속",
        "sendCode": "코드 보내기",
        "sendingCode": "배상...",
        "sendCodeSuccess": "인증 코드가 전송되었습니다.",
        "sendAgain": "다시 보내기",
        "codeLabel": "인증코드",
        "codePlaceholder": "123456",
        "signIn": "로그인",
        "termsNotice": "로그인하면 다음에 동의하게 됩니다.",
        "termsLink": "자귀",
        "privacyLink": "개인 정보 보호 정책",
        "logout": "로그아웃",
        "creditsLabel": "크레딧",
        "enterEmailFirst": "먼저 이메일 주소를 입력해주세요.",
        "enterEmailAndCode": "이메일과 인증번호를 모두 입력해주세요.",
        "sendCodeFailed": "인증코드 전송에 실패했습니다.",
        "googleSignInFailed": "Google 로그인에 실패했습니다.",
        "googleClientMissing": "Google 로그인이 구성되지 않았습니다.",
        "signInFailed": "로그인하지 못했습니다."
      },
      "paypalReturn": {
        "providerLabel": "PayPal",
        "canceledTitle": "결제가 취소되었습니다.",
        "canceledMessage": "이 주문은 결제되지 않았습니다. 이 탭을 닫고 원래 창에서 결제 수단을 다시 선택할 수 있습니다.",
        "canceledMetaDescription": "PayPal 결제가 취소되었습니다.",
        "waitingTitle": "결제가 완료되었습니다.",
        "waitingMessage": "원래 탭으로 돌아갈 수 있습니다. 3초마다 PayPal 확인을 확인하고 있으며 결과가 자동으로 여기에 표시됩니다.",
        "confirmedCreditsTitle": "크레딧이 충전되었습니다",
        "confirmedCreditsMessage": "PayPal 결제가 확인되었으며 크레딧이 추가되었습니다. 이 탭을 닫고 원래 창에서 계속할 수 있습니다.",
        "confirmedSubscriptionTitle": "구독이 활성화되었습니다",
        "confirmedSubscriptionMessage": "귀하의 PayPal 결제가 확인되었으며 귀하의 MapsGrab 요금제가 활성화되었습니다. 이 탭을 닫고 원래 창에서 계속할 수 있습니다.",
        "failedTitle": "결제에 주의가 필요함",
        "failedMessage": "이 주문을 자동으로 확인할 수 없습니다. 원래 창으로 돌아가거나 결제 상태를 새로고침해 보세요."
      },
      "checkin": {
        "accountButtonLabel": "계정 메뉴 열기",
        "accountMenuLabel": "계정 메뉴"
      },
      "creditPurchase": {
        "title": "더 많은 크레딧 받기",
        "description": "크레딧을 추가하고 이 작업 공간에서 유료 기능을 계속 사용하세요.",
        "successTitle": "크레딧이 충전되었습니다",
        "successDescription": "잔액이 새로 고쳐졌습니다. 이 창을 닫고 계속하세요.",
        "packageEyebrow": "사용한 만큼 지불하세요",
        "cardNote": "유료 웹사이트 기능에 크레딧을 사용하세요. 크레딧은 만료되지 않습니다.",
        "creditsAmount": "{credits} 크레딧",
        "buyNow": "지금 구매",
        "selectPackage": "선택하다",
        "paymentMethodLabel": "결제 수단 선택",
        "paymentTitle": "결제 수단 선택",
        "selectedPackageLabel": "선택한 패키지",
        "confirmPurchase": "결제를 계속하세요",
        "backToProducts": "뒤쪽에",
        "close": "닫다",
        "agreementText": "구매약관, 이용약관, 개인정보취급방침에 동의합니다.",
        "loadingConfigs": "크레딧 패키지 로드 중...",
        "loadFailed": "크레딧 패키지를 로드하지 못했습니다. 다시 시도해 주세요.",
        "noConfigs": "현재 사용할 수 있는 크레딧 패키지가 없습니다. 나중에 다시 시도해 주세요.",
        "ready": "크레딧 패키지를 선택하세요. 가격은 USD로 표시됩니다.",
        "creatingOrder": "주문 생성 중...",
        "pendingPayment": "새로 열린 탭에서 결제를 완료하세요. 자동으로 결과를 확인하겠습니다.",
        "pendingPaymentTitle": "결제 대기 중",
        "cancelPayment": "결제 취소",
        "supportMailPrefix": "문제 신고: ",
        "success": "결제가 완료되었습니다. 지금 크레딧을 사용할 수 있습니다.",
        "failed": "결제가 완료되지 않았습니다. 다시 시도하거나 이 창을 닫으세요.",
        "successCredits": "+{credits} 크레딧 추가됨",
        "successBalance": "현재 잔액: {balance} 크레딧",
        "createFailed": "주문을 생성하지 못했습니다. 다시 시도해 주세요.",
        "invalidPaymentData": "결제 링크가 잘못되었습니다. 나중에 다시 시도해 주세요.",
        "priceUpdated": "가격이 변경되었습니다. 최신 가격을 리뷰하고 다시 구매하세요.",
        "gatewayFailed": "일시적으로 결제 입력이 불가능합니다. 나중에 다시 시도해 주세요.",
        "paymentCanceled": "결제가 취소되었습니다. 결제 수단을 선택하고 다시 시도하세요.",
        "pollFailed": "결제 상태를 새로고침하지 못했습니다. 다시 시도해 주세요.",
        "pollTimeout": "자동 새로 고침 시간이 초과되었습니다. 결제 후 새로고침 버튼을 이용해 주세요.",
        "orderNotFound": "더 이상 주문할 수 없습니다. 새 주문을 생성합니다.",
        "orderExpired": "주문이 만료되었습니다. 다시 구매해주세요.",
        "fulfillmentFailed": "결제가 접수되었지만 아직 크레딧이 추가되지 않았습니다. 나중에 다시 시도해 주세요.",
        "authExpired": "로그인이 만료되었습니다. 계속하려면 다시 로그인하세요.",
        "popupBlocked": "귀하의 브라우저가 새 창을 차단했습니다. MapsGrab가 팝업을 열도록 허용하고 다시 시도하세요."
      }
    },
    "pricing": {
      "seo": {
        "title": "가격 — 온라인, 확장 및 API 계획 | MapsGrab",
        "description": "모든 표면에 대한 MapsGrab 계획: $19, 브라우저 확장의 온라인 스크레이퍼 $39, 및 API $15. 모든 제품에는 무료 등급이 포함되어 있습니다. 온라인에서는 일회성 일반 월간 요금제, Extension에서는 API 월간 구독이 가능합니다."
      },
      "hero": {
        "kicker": "가격",
        "title": {
          "lead": "지도 데이터를 확보하기 위한 ",
          "accent": "세 가지 방법",
          "tail": " 계획"
        },
        "lead": "클라우드 온라인 스크레이퍼, 브라우저 확장 또는 HTTP API 등 귀하의 워크플로에 맞는 표면을 선택한 다음 월별 볼륨을 선택하세요. 몇 분 안에 이 페이지에서 업그레이드하거나 구매하세요.",
        "meta": [
          "모든 제품에 무료 등급 제공",
          "PayPal로 결제하세요",
          "차액을 지불하여 업그레이드하세요"
        ],
        "switchLabel": "제품 라인"
      },
      "popularLabel": "가장 인기있는",
      "tabs": {
        "online": {
          "name": "온라인 스크레이퍼",
          "shortName": "온라인",
          "switchMeta": "{price}부터 · 일회성",
          "unit": "기록",
          "eyebrow": "온라인 스크레이퍼 계획",
          "title": "기록에 따라 가격이 책정되는 클라우드 추출",
          "description": "인프라에서 MapsGrab 엔진을 실행하세요. 레코드는 수집된 하나의 비즈니스 행입니다. 유료 플랜에는 추가 기록 비용 없이 선택적 이메일 및 소셜 미디어 강화 기능이 포함됩니다.",
          "billingChips": [
            "일회성 결제",
            "자연적인 한 달을 다룹니다.",
            "자동 갱신 없음"
          ],
          "cards": [
            {
              "id": "free",
              "productId": null,
              "name": "무료",
              "tagline": "소규모로 클라우드 스크레이퍼를 사용해 보세요",
              "price": "$0",
              "periodLabel": "영원히",
              "quota": "1,000 기록/월",
              "features": [
                "37열 CSV 내보내기로 비즈니스 추출",
                "작업당 최대 2개의 키워드",
                "지역 검색을 위한 지도 및 지역 모드",
                "유료 플랜의 이메일 및 소셜 강화",
                "작업당 하나의 중복 제거 CSV"
              ],
              "ctaLabel": "무료로 시작하세요",
              "status": "free",
              "featured": false
            },
            {
              "id": "lite",
              "productId": "online_lite",
              "name": "Lite",
              "tagline": "가끔 일회성 내보내기용",
              "price": "$19",
              "periodLabel": "일회성 · 1월",
              "quota": "20,000 기록/월",
              "features": [
                "모든 것이 무료로 제공됩니다.",
                "1개월 동안의 기록 20,000개",
                "일회성 결제 — 자동 갱신 없음",
                "작업당 최대 5개의 키워드",
                "이메일 및 소셜 강화(기본 및 선택 사항)"
              ],
              "ctaLabel": "라이트 받기",
              "status": "buyable",
              "featured": false
            },
            {
              "id": "basic",
              "productId": "online_basic",
              "name": "기초적인",
              "tagline": "매주 꾸준한 리드 수집을 위해",
              "price": "$49",
              "periodLabel": "일회성 · 1월",
              "quota": "80,000 기록/월",
              "features": [
                "Lite의 모든 것",
                "1개월 동안의 기록 80,000개",
                "일회성 결제 — 자동 갱신 없음",
                "작업당 최대 10개의 키워드"
              ],
              "ctaLabel": "기본 받기",
              "status": "buyable",
              "featured": true
            },
            {
              "id": "growth",
              "productId": "online_growth",
              "name": "성장",
              "tagline": "리드 파이프라인 성장을 위해",
              "price": "$99",
              "periodLabel": "일회성 · 1월",
              "quota": "250,000 기록/월",
              "features": [
                "기본의 모든 것",
                "1개월 동안의 기록 250,000개",
                "일회성 결제 — 자동 갱신 없음",
                "작업당 최대 20개의 키워드"
              ],
              "ctaLabel": "성장을 얻으세요",
              "status": "buyable",
              "featured": false
            },
            {
              "id": "professional",
              "productId": "online_pro",
              "name": "전문적인",
              "tagline": "대행사 및 데이터 사용량이 많은 팀용",
              "price": "$149",
              "periodLabel": "일회성 · 1월",
              "quota": "500,000 기록/월",
              "features": [
                "성장의 모든 것",
                "1개월 동안의 기록 500,000개",
                "일회성 결제 — 자동 갱신 없음",
                "작업당 최대 50개의 키워드"
              ],
              "ctaLabel": "전문적인 지식을 얻으세요",
              "status": "buyable",
              "featured": false
            }
          ],
          "quotaNote": "한 달 동안의 일회성 결제 — 이 탭의 요금제는 자동 갱신되지 않습니다. 레코드는 Google Maps에서 수집된 하나의 비즈니스 행입니다. 1번째에 사용량이 재설정되고 사용하지 않은 기록은 이월되지 않습니다.",
          "compare": {
            "lead": "온라인 스크레이퍼 계획 — 기록에 따라 가격이 책정되는 클라우드 추출.",
            "volume": "월별 기록",
            "groups": [
              {
                "label": "데이터",
                "rows": [
                  {
                    "label": "37열 CSV 내보내기로 비즈니스 추출",
                    "cells": [
                      true,
                      true,
                      true,
                      true,
                      true
                    ]
                  },
                  {
                    "label": "이메일 및 소셜 강화",
                    "cells": [
                      false,
                      "기본적으로 켜져 있음, 선택 사항",
                      "기본적으로 켜져 있음, 선택 사항",
                      "기본적으로 켜져 있음, 선택 사항",
                      "기본적으로 켜져 있음, 선택 사항"
                    ]
                  }
                ]
              },
              {
                "label": "작업 흐름",
                "rows": [
                  {
                    "label": "작업별 키워드",
                    "cells": [
                      "2",
                      "5",
                      "10",
                      "20",
                      "50"
                    ]
                  },
                  {
                    "label": "지도 및 지역 모드",
                    "cells": [
                      true,
                      true,
                      true,
                      true,
                      true
                    ]
                  },
                  {
                    "label": "작업당 하나의 중복 제거 CSV",
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
            "usageNotice": "MapsGrab 온라인 스크레이퍼 월별 기록 할당량에 적용됩니다.",
            "successTitle": "계획이 활성화되었습니다",
            "successDescription": "일회성 1개월 계획이 실행되었습니다. 온라인 스크레이퍼는 다음 할당량 새로 고침 시 이를 선택합니다."
          }
        },
        "extension": {
          "name": "확장 프로그램",
          "shortName": "확장 프로그램",
          "switchMeta": "{price}부터 · 일회성",
          "unit": "기록",
          "eyebrow": "확장 계획",
          "title": "기록에 따라 가격이 책정되는 브라우저 추출",
          "description": "확장 프로그램이 수집하는 모든 행(비즈니스, 리뷰 또는 사진)은 하나의 기록으로 계산됩니다. 모든 계획에는 리뷰, 사진 및 일괄 작업이 포함됩니다. 유료 플랜은 이메일 및 소셜 강화를 포함하여 모든 36 열을 내보냅니다.",
          "billingChips": [
            "일회성 결제",
            "1 접속 월",
            "자동 갱신 없음"
          ],
          "cards": [
            {
              "id": "free",
              "productId": null,
              "name": "무료",
              "tagline": "소규모로 코어 추출",
              "price": "$0",
              "periodLabel": "영원히",
              "quota": "1,000 기록/월",
              "features": [
                "비즈니스 데이터 추출",
                "리뷰(11열) 및 사진 URLs",
                "일괄 키워드 및 리뷰-URL 작업",
                "CSV / JSON 필드 선택으로 내보내기"
              ],
              "ctaLabel": "확장 프로그램 설치",
              "status": "free",
              "featured": false
            },
            {
              "id": "pro",
              "productId": "maps_extension_pro",
              "name": "Pro",
              "tagline": "프리랜서 및 성장하는 리드 파이프라인용",
              "price": "$39",
              "periodLabel": "일회성 · 1월",
              "quota": "100,000 기록/월",
              "features": [
                "모든 것이 무료로 제공됩니다.",
                "100,000매월 기록",
                "전체 36열 비즈니스 추출",
                "이메일 및 소셜 미디어 강화"
              ],
              "ctaLabel": "프로 가입",
              "status": "buyable",
              "featured": true
            },
            {
              "id": "business",
              "productId": "maps_extension_business",
              "name": "사업",
              "tagline": "대행사 및 데이터 사용량이 많은 팀용",
              "price": "$99",
              "periodLabel": "일회성 · 1월",
              "quota": "500,000 기록/월",
              "features": [
                "프로의 모든 것",
                "500,000매월 기록",
                "다중 시장 배치 작업을 위한 공간",
                "동일한 로컬 우선 내보내기 파이프라인"
              ],
              "ctaLabel": "사업을 시작하세요",
              "status": "buyable",
              "featured": false
            }
          ],
          "quotaNote": "확장 프로그램이 수집하는 각 행은 검색 또는 저장된 목록의 업체, 리뷰, 사진 등 하나의 기록으로 계산됩니다. 이메일 및 소셜 강화는 기록을 추가하지 않습니다. 월간 사용량은 1일에 재설정됩니다. 사용되지 않은 레코드는 롤오버되지 않습니다.",
          "compare": {
            "lead": "확장 계획 — 기록에 따라 가격이 책정되는 브라우저 추출.",
            "volume": "월별 기록",
            "groups": [
              {
                "label": "데이터",
                "rows": [
                  {
                    "label": "비즈니스 데이터 추출",
                    "cells": [
                      true,
                      true,
                      true
                    ]
                  },
                  {
                    "label": "전체 36열 비즈니스 추출",
                    "cells": [
                      false,
                      true,
                      true
                    ]
                  },
                  {
                    "label": "리뷰(11열) 및 사진 URLs",
                    "cells": [
                      true,
                      true,
                      true
                    ]
                  },
                  {
                    "label": "이메일 및 소셜 미디어 강화",
                    "cells": [
                      false,
                      true,
                      true
                    ]
                  },
                  {
                    "label": "일괄 키워드 및 리뷰-URL 작업",
                    "cells": [
                      true,
                      true,
                      true
                    ]
                  }
                ]
              },
              {
                "label": "내보내다",
                "rows": [
                  {
                    "label": "CSV / JSON 필드 선택으로 내보내기",
                    "cells": [
                      true,
                      true,
                      true
                    ]
                  },
                  {
                    "label": "로컬 우선 내보내기 파이프라인",
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
            "usageNotice": "MapsGrab 브라우저 확장 월별 할당량에 적용됩니다.",
            "successTitle": "계획이 활성화되었습니다",
            "successDescription": "일회성 1개월 계획이 실행되었습니다. 확장 프로그램은 다음 할당량 새로 고침 시 이를 선택합니다."
          }
        },
        "api": {
          "name": "API & MCP",
          "shortName": "API & MCP",
          "switchMeta": "{price}부터 · 일회성",
          "unit": "요청",
          "eyebrow": "API 계획",
          "title": "요청에 따라 가격이 책정되는 프로그래밍 방식 액세스",
          "description": "간단한 HTTP API를 통해 Google Maps개 업체를 검색하고 자신의 애플리케이션에서 리뷰를 가져옵니다. 성공적인 각 호출은 결과가 없거나 부분적인 데이터를 반환하는 경우에도 하나의 요청으로 계산됩니다.",
          "billingChips": [
            "일회성 결제",
            "자연적인 한 달을 다룹니다.",
            "자동 갱신 없음"
          ],
          "cards": [
            {
              "id": "free",
              "productId": null,
              "name": "무료",
              "tagline": "API를 소규모로 평가해 보세요.",
              "price": "$0",
              "periodLabel": "영원히",
              "quota": "20 요청/월",
              "features": [
                "키워드 및 위치로 비즈니스 검색",
                "정렬 및 페이징을 통해 엔드포인트 리뷰",
                "JSON 응답",
                "API 키가 귀하의 계정에 연결되어 있습니다",
                "커뮤니티 지원"
              ],
              "ctaLabel": "무료로 시작하세요",
              "status": "free",
              "featured": false
            },
            {
              "id": "basic",
              "productId": "api_basic",
              "name": "기초적인",
              "tagline": "프로토타입 및 조명 통합용",
              "price": "$15",
              "periodLabel": "일회성 · 1월",
              "quota": "1,000 요청/월",
              "features": [
                "모든 것이 무료로 제공됩니다.",
                "1개월 동안 1,000 요청",
                "일회성 결제 — 자동 갱신 없음",
                "JSON 응답"
              ],
              "ctaLabel": "기본 받기",
              "status": "buyable",
              "featured": false
            },
            {
              "id": "professional",
              "productId": "api_professional",
              "name": "전문적인",
              "tagline": "생산 통합의 경우",
              "price": "$65",
              "periodLabel": "일회성 · 1월",
              "quota": "5,000 요청/월",
              "features": [
                "기본의 모든 것",
                "1개월 동안 5,000 요청",
                "일회성 결제 — 자동 갱신 없음",
                "JSON 응답"
              ],
              "ctaLabel": "전문적인 지식을 얻으세요",
              "status": "buyable",
              "featured": true
            },
            {
              "id": "business",
              "productId": "api_business",
              "name": "사업",
              "tagline": "MapsGrab 데이터를 기반으로 구축된 제품의 경우",
              "price": "$115",
              "periodLabel": "일회성 · 1월",
              "quota": "10,000 요청/월",
              "features": [
                "프로페셔널의 모든 것",
                "1개월 동안 10,000 요청",
                "일회성 결제 — 자동 갱신 없음",
                "JSON 응답"
              ],
              "ctaLabel": "사업을 시작하세요",
              "status": "buyable",
              "featured": false
            },
            {
              "id": "scale",
              "productId": "api_scale",
              "name": "규모",
              "tagline": "대용량 데이터 작업용",
              "price": "$365",
              "periodLabel": "일회성 · 1월",
              "quota": "50,000 요청/월",
              "features": [
                "비즈니스의 모든 것",
                "1개월 동안 50,000 요청",
                "일회성 결제 — 자동 갱신 없음",
                "JSON 응답"
              ],
              "ctaLabel": "규모 확보",
              "status": "buyable",
              "featured": false
            }
          ],
          "quotaNote": "한 달 동안의 일회성 결제 — 이 탭의 요금제는 자동 갱신되지 않습니다. 각각의 성공적인 API 또는 MCP 호출은 비어 있거나 부분적인 결과를 포함하여 하나의 요청으로 계산됩니다. 실패한 통화는 계산되지 않습니다. 1번째에 사용량이 재설정되고 사용되지 않은 요청은 이월되지 않습니다.",
          "compare": {
            "lead": "API 계획 — 프로그래밍 방식 액세스, 요청에 따라 가격 책정.",
            "volume": "월별 요청",
            "groups": [
              {
                "label": "엔드포인트",
                "rows": [
                  {
                    "label": "키워드 및 위치로 비즈니스 검색",
                    "cells": [
                      true,
                      true,
                      true,
                      true,
                      true
                    ]
                  },
                  {
                    "label": "정렬 및 페이징을 통해 엔드포인트 리뷰",
                    "cells": [
                      true,
                      true,
                      true,
                      true,
                      true
                    ]
                  },
                  {
                    "label": "JSON 응답",
                    "cells": [
                      true,
                      true,
                      true,
                      true,
                      true
                    ]
                  },
                  {
                    "label": "동일한 API 키를 가진 MCP 서버",
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
                "label": "입장",
                "rows": [
                  {
                    "label": "API 키가 귀하의 계정에 연결되어 있습니다",
                    "cells": [
                      true,
                      true,
                      true,
                      true,
                      true
                    ]
                  },
                  {
                    "label": "커뮤니티 지원",
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
            "usageNotice": "MapsGrab API 월별 요청 할당량에 적용됩니다.",
            "successTitle": "계획이 활성화되었습니다",
            "successDescription": "일회성 1개월 계획이 실행되었습니다. API 키는 다음 요청 시 새 할당량을 선택합니다."
          }
        }
      },
      "plansSection": {
        "label": "계획",
        "finder": {
          "label": "한 달에 몇 {unit}이 필요합니까?",
          "result": "{value} {unit}",
          "valueText": "{value} {unit} 월 — {plan} 계획",
          "fits": "적합"
        }
      },
      "compare": {
        "kicker": "비교하다",
        "title": {
          "lead": "모든 계획, ",
          "accent": "나란히",
          "tail": ""
        },
        "plan": "계획",
        "volumeGroup": "볼륨 및 청구",
        "billing": "청구",
        "included": "포함됨",
        "notIncluded": "포함되지 않음",
        "allPlans": "모든 요금제에 포함"
      },
      "usage": {
        "head": {
          "kicker": "용법",
          "title": {
            "lead": "",
            "accent": "할당량",
            "tail": "에 포함되는 사항"
          },
          "lead": "2개 단위: 확장 및 온라인 스크래퍼에 대한 기록, API에 대한 요청 — 둘 다 매월 1일에 재설정됩니다."
        },
        "records": {
          "meter": "이번 달에 사용한 기록",
          "badge": "확장 · 온라인",
          "title": "1 레코드 = 1 수집된 행",
          "body": "수집하는 각 행은 하나의 기록으로 간주됩니다. 즉, 온라인 스크래퍼의 비즈니스; 확장 프로그램에 업체, 리뷰, 사진이 있습니다. 이메일 및 소셜 강화는 기록을 추가하지 않습니다.",
          "count": "+1 기록",
          "attachments": [
            "전화 및 웹사이트",
            "영업시간",
            "이메일 및 소셜 미디어"
          ]
        },
        "requests": {
          "meter": "이번 달에 사용된 요청",
          "badge": "API · MCP",
          "title": "1 요청 = 1 호출 성공",
          "body": "요청은 결과가 없거나 부분적인 데이터를 반환하는 경우에도 성공적인 API 호출입니다. 실패한 통화는 계산되지 않습니다. MCP 도구 호출은 동일한 요청 할당량을 사용합니다.",
          "counted": "성공적인 통화 — 계산됨",
          "notCounted": "통화 실패 — 계산되지 않음"
        },
        "reset": {
          "title": "1일에 재설정됩니다.",
          "body": "매월 1일에 사용량이 재설정됩니다. 사용하지 않은 기록과 요청은 이월되지 않습니다.",
          "limit": "요금제 한도",
          "unused": "미사용 · 전복되지 않음",
          "flag": "다시 놓기"
        }
      },
      "billing": {
        "head": {
          "kicker": "청구",
          "title": {
            "lead": "간단한 청구, ",
            "accent": "놀랄 일이 없습니다",
            "tail": ""
          },
          "lead": "세 가지 제품 라인에서 결제, 갱신 및 업그레이드가 작동하는 방식."
        },
        "items": {
          "channels": {
            "title": "PayPal",
            "body": "PayPal을 통해 모든 요금제를 결제하세요. PayPal에서 결제를 완료하고 여기로 돌아와서 요금제를 활성화하세요."
          },
          "cadence": {
            "title": "일회성 결제",
            "body": "모든 유료 플랜에는 한 달이 포함됩니다. 자동 청구 없이 한 번만 결제하세요. 한 달 더 필요할 때 다시 구매하세요."
          },
          "upgrade": {
            "title": "차액을 지불하여 업그레이드하세요",
            "body": "현재 결제 제공업체를 통해 활성 요금제를 적격한 상위 등급으로 이동하세요. 만료 날짜와 사용량은 지금까지 변경되지 않습니다."
          },
          "independent": {
            "title": "독립 계획",
            "body": "다른 탭의 계획은 독립적입니다. 플랜이 만료되면 계정은 자동으로 무료 등급으로 돌아갑니다."
          }
        }
      },
      "plans": {
        "loading": "결제 옵션 로드 중...",
        "loadFailed": "결제 옵션을 로드하지 못했습니다. 다시 시도하려면 페이지를 새로고침하세요.",
        "noChannels": "현재 이 요금제에 사용할 수 있는 결제 수단이 없습니다.",
        "productTitlePrefix": "MapsGrab",
        "failedTitle": "결제 미완료",
        "billingPeriodMonthly": "1개월",
        "billingAutoRenew": "취소할 때까지 자동 갱신",
        "billingOneTime": "일회성 결제"
      },
      "upgrade": {
        "currentPlan": "현재 계획",
        "button": "업그레이드 · {amount}",
        "title": "계획을 업그레이드하세요",
        "confirm": "업그레이드 확인",
        "oneTime": "{channel}을 통한 일회성 차이. 만료일은 {date}로 유지됩니다.",
        "autoRenew": "차액은 {channel}을 통해 즉시 청구됩니다. 만료일은 {date}로 유지됩니다. 향후 갱신에는 새 요금제 가격이 사용됩니다.",
        "pendingTitle": "업그레이드를 기다리는 중",
        "pendingDescription": "결제 서비스 제공업체가 업그레이드를 적용 중입니다. 현재 계획은 확인될 때까지 활성 상태로 유지됩니다.",
        "successTitle": "업그레이드된 요금제",
        "successDescription": "새 할당량이 활성화되었습니다. 만료일은 {date}로 유지됩니다.",
        "quoteFailed": "업그레이드 가격을 로드할 수 없습니다. 다시 시도하려면 페이지를 새로고침하세요.",
        "failed": "업그레이드를 확인할 수 없습니다. 다시 시도하기 전에 페이지를 새로 고쳐 계획을 확인하세요.",
        "reasons": {
          "no_active_subscription": "귀하의 계획은 더 이상 활성화되지 않습니다. 요금제를 선택하려면 페이지를 새로고침하세요.",
          "not_higher_tier": "업그레이드하려면 더 높은 등급을 선택하거나, 등급을 변경하려면 요금제가 만료될 때까지 기다리세요.",
          "non_positive_diff": "남은 플랜 가치는 이 등급보다 낮지 않습니다. 요금제가 만료된 후에도 등급을 변경할 수 있습니다.",
          "channel_unavailable": "현재 결제 방법으로는 업그레이드를 사용할 수 없습니다. 만료 후 요금제를 변경할 수 있습니다."
        }
      },
      "faq": {
        "kicker": "자주 묻는 질문",
        "title": {
          "lead": "",
          "accent": "자주 묻는 질문",
          "tail": ""
        },
        "lead": "청구 기본 사항입니다. 그 밖의 지원은 이메일 한 번으로 가능합니다.",
        "contact": "지원팀에 문의",
        "items": [
          {
            "question": "기록으로 간주되는 것은 무엇입니까?",
            "answer": "레코드는 수집된 하나의 행으로, 무료 플랜에서 계산되는 것과 동일한 단위입니다. 하나의 비즈니스인 온라인 스크레이퍼에서; 확장 프로그램에서는 수집한 각 비즈니스, 리뷰 또는 사진이 하나의 기록입니다. 이메일 및 소셜 강화는 기록을 추가하지 않습니다. 대신 API 탭에서는 성공적인 요청으로 사용량이 계산됩니다."
          },
          {
            "question": "MapsGrab을 사용해 보려면 유료 요금제가 필요합니까?",
            "answer": "아니요. 모든 제품에는 시간 제한이 없는 무료 등급이 있습니다. 온라인 스크레이퍼 및 확장에는 월별 1,000 레코드가 포함되고, API에는 월별 20 요청이 포함됩니다. 온라인 스크레이퍼 및 확장 무료 계획에는 이메일 또는 소셜 미디어 강화가 포함되지 않습니다. 유료 온라인 플랜에는 기본적으로 이 기능이 포함되어 있으며 각 작업마다 기능을 끌 수 있습니다."
          },
          {
            "question": "할당량은 내 계정에 어떻게 적용됩니까?",
            "answer": "할당량은 로그인한 계정별로 계산됩니다(로그인하지 않은 경우에는 확장 프로그램의 브라우저 장치별로 계산됩니다). 더 높은 한도가 적용되도록 플랜을 소유한 계정으로 로그인하세요. 플랜이 만료되면 계정은 자동으로 무료 등급으로 돌아갑니다."
          },
          {
            "question": "내 요금제가 자동으로 갱신되나요?",
            "answer": "아니요. 모든 플랜은 한 달에 걸쳐 일회성 PayPal 결제입니다. 요금제가 만료되면 무료 등급으로 돌아갑니다. 유료 요금제를 계속 사용하려면 다시 구매하세요."
          },
          {
            "question": "등급 간에 전환할 수 있나요?",
            "answer": "PayPal을 통해 차액을 지불하면 활성 요금제를 적격한 상위 등급으로 업그레이드할 수 있습니다. 만료 날짜와 사용량은 지금까지 변경되지 않습니다. 다른 탭의 계획은 독립적입니다."
          }
        ]
      },
      "cta": {
        "kicker": "시작하기",
        "title": {
          "lead": "",
          "accent": "무료 등급",
          "tail": "에서 시작하세요"
        },
        "lead": "모든 제품에는 시간 제한이 없는 무료 등급이 있습니다. 1,000는 확장 프로그램과 온라인 스크레이퍼에 한 달 동안 기록하고, 20은 API에 한 달 동안 요청합니다.",
        "primary": "확장 프로그램 설치",
        "secondary": "온라인 스크레이퍼를 사용해 보세요",
        "note": "무료 월별 할당량이 포함되어 있습니다. 신용카드가 없습니다."
      }
    },
    "extensionLogin": {
      "title": "확장 로그인 | MapsGrab",
      "description": "MapsGrab 웹사이트 세션을 브라우저 확장 프로그램에 연결하려면 로그인하세요.",
      "eyebrow": "브라우저 확장",
      "heading": "확장 로그인",
      "checkingState": "확인 중",
      "signInRequiredState": "로그인이 필요합니다",
      "confirmState": "계정 확인",
      "errorState": "오류",
      "preparingTitle": "로그인 준비",
      "preparingText": "확장 로그인 브리지를 설정합니다.",
      "invalidParamsTitle": "잘못된 로그인 링크",
      "invalidParamsText": "이 로그인 링크에는 필수 보안 매개변수가 누락되었습니다. 확장 프로그램에서 로그인을 다시 시작하세요.",
      "checkingSessionTitle": "세션 확인 중",
      "checkingSessionText": "기존 웹사이트 세션을 확인하는 중입니다.",
      "finishingGoogleTitle": "완료 Google 로그인",
      "finishingGoogleText": "웹사이트 세션을 위해 Google 인증을 교환합니다.",
      "signInRequiredTitle": "계속하려면 로그인하세요.",
      "signInRequiredText": "웹사이트 세션을 확장 프로그램에 연결하려면 로그인하세요.",
      "signInButtonLabel": "로그인",
      "confirmTitle": "계정 확인",
      "confirmText": "확장 프로그램이 아래 계정으로 로그인을 요청하고 있습니다. 확장 프로그램에서 방금 로그인을 시작한 경우에만 계속하세요.",
      "continueButtonLabel": "계속하다",
      "useAnotherAccountLabel": "다른 계정 사용",
      "issuingTitle": "로그인 완료 중",
      "issuingText": "확장 프로그램에 대한 일회성 로그인 코드를 발급합니다.",
      "issueFailedTitle": "문제가 발생했습니다.",
      "retryButtonLabel": "다시 해 보다",
      "verificationFailedPrefix": "웹사이트 토큰 확인에 실패했습니다.",
      "issueFailedPrefix": "확장 로그인 코드 요청에 실패했습니다.",
      "googleSignInFailedPrefix": "Google 로그인 실패",
      "googleCompletionFailedPrefix": "Google 로그인을 완료할 수 없습니다."
    },
    "online": {
      "seo": {
        "title": "온라인 Google Maps 스크레이퍼 — 클라우드에서 추출 실행 | MapsGrab",
        "description": "클라우드에서 Google Maps 키워드 검색을 실행하고, 비즈니스 데이터를 수집하고, 작업당 하나의 CSV을 다운로드하세요."
      },
      "hero": {
        "announce": {
          "badge": "3 모드",
          "text": "키워드, 지도 영역 또는 전체 지역"
        },
        "title": {
          "lead": "Google Maps 추출 ",
          "accent": "클라우드,",
          "tail": " 설치 없음"
        },
        "lead": "키워드를 제출하고, 클라우드에서 비즈니스 세부정보를 수집하고, 대시보드에서 작업당 하나의 CSV를 다운로드하세요.",
        "primaryCta": "데이터 수집 시작",
        "pricingCta": "가격 보기",
        "meta": [
          "1,000 무료 기록/월",
          "모든 브라우저에서 작동",
          "작업당 하나의 중복 제거 CSV"
        ],
        "theater": {
          "files": "1 CSV · 다운로드에 저장됨",
          "csv": "CSV",
          "processed": "처리됨",
          "parallelChip": {
            "label": "키워드 실행",
            "value": "병렬로"
          },
          "billingChip": {
            "label": "청구자",
            "value": "전달된 행"
          }
        }
      },
      "facts": {
        "caption": "온라인 스크레이퍼 개요",
        "items": [
          {
            "value": 37,
            "label": "연속 행 번호를 포함한 공개 열"
          },
          {
            "value": 6,
            "label": "유료 플랜의 소셜 프로필 열"
          },
          {
            "value": 50,
            "label": "지도 모드 작업별 위치 검색"
          },
          {
            "value": 60,
            "suffix": " 분",
            "label": "작업별 수집 창"
          },
          {
            "value": 1000,
            "label": "매달 무료 음반"
          }
        ]
      },
      "flow": {
        "head": {
          "kicker": "작동 원리",
          "title": {
            "lead": "빠른 미리보기부터 ",
            "accent": "전체 내보내기",
            "tail": "까지"
          },
          "lead": "계정 없이 홈페이지에서 하나의 키워드를 사용해 보세요. 전체 목록을 원할 경우 로그인하여 대시보드에서 작업으로 실행하세요."
        },
        "steps": [
          {
            "title": "홈페이지에서 미리보기",
            "description": "하나의 키워드, 계정은 없습니다. 첫 번째 3 행을 사용하여 첫 번째 결과 페이지에 포함된 업체 수를 확인하세요."
          },
          {
            "title": "로그인",
            "description": "미리보기는 저장되지 않으며 할당량을 사용하지 않습니다. 로그인한 후 키워드를 다시 제출하세요."
          },
          {
            "title": "작업 만들기",
            "description": "대시보드 › 온라인 스크래퍼에서 한 줄에 하나의 키워드를 입력하거나 지도 영역 또는 지역이 목록을 작성하도록 합니다."
          },
          {
            "title": "키워드는 병렬로 실행됩니다.",
            "description": "대기 중, 수집 및 CSV 준비 상태를 따른 다음 완료, 부분 성공 또는 실패합니다. 활성 작업은 5초마다 새로 고쳐집니다."
          },
          {
            "title": "다운로드",
            "description": "파일이 사용 가능한 경우 전체 작업에 대해 하나의 CSV을 다운로드하세요. 부분적인 성공은 전달된 행을 유지합니다. 0개 결과에는 파일이 없습니다."
          }
        ],
        "lock": "전체 목록을 보려면 로그인하세요.",
        "email": "you@company.com",
        "links": {
          "preview": "홈페이지 미리보기를 사용해 보세요",
          "dashboard": "대시보드 열기 › 온라인 스크레이퍼"
        }
      },
      "modes": {
        "head": {
          "kicker": "검색 모드",
          "title": {
            "lead": "말하는 세 가지 방법 ",
            "accent": "찾을 곳",
            "tail": ""
          },
          "lead": "키워드를 한 줄씩 입력하고, 중심점 주변의 지도 영역을 샘플링하거나, 국가, 주 및 도시를 미리 만들어진 쿼리로 전환하세요."
        },
        "tabsLabel": "검색 모드",
        "notes": {
          "keywords": "계획 한도 내에서 한 줄에 하나의 키워드",
          "map": "중심점 주위의 원 샘플링",
          "regions": "GeoNames의 국가, 주, 도시"
        },
        "keywords": {
          "hint": "한 줄에 하나의 키워드입니다. 빈 줄과 중복 항목은 계산 전에 삭제되며 전체 작업에서 중복 제거된 CSV 하나가 생성됩니다.",
          "blank": "빈 줄 · 건너뛰었습니다",
          "duplicate": "중복 · 건너뛰었습니다",
          "limitsTitle": "작업별 키워드",
          "limitsCaption": "온라인 플랜으로",
          "limitsHint": "목록이 비어 있거나 계획 한도를 초과하거나 월별 할당량을 모두 사용한 경우 스크래핑 시작이 비활성화된 상태로 유지됩니다."
        },
        "map": {
          "formula": "{keywords} 키워드 × {points} 그리드 포인트",
          "scale": "{value}km",
          "facts": [
            "포인트는 중심에서 바깥쪽으로 검색됩니다.",
            "원은 검색 센터만 배치하며 결과는 잘리지 않습니다.",
            "키워드나 포인트에 걸쳐 발견된 비즈니스는 작업에 한 번만 유지됩니다."
          ]
        },
        "regions": {
          "hint": "제출하기 전에 생성된 쿼리를 편집할 수 있습니다. 각각은 키워드로 간주됩니다.",
          "addCity": "도시 추가"
        }
      },
      "results": {
        "head": {
          "kicker": "결과",
          "title": {
            "lead": "작업 하나, ",
            "accent": "하나 CSV",
            "tail": ""
          },
          "lead": "전체 작업에 대해 37 공개 열을 하나의 CSV로 다운로드하세요. 검색에서 연속된 행 번호와 기업이 중복 제거됩니다."
        },
        "csvMeta": "1 CSV · {count} 전달된 행",
        "rows": "{count}행",
        "searches": "검색으로 전달된 행",
        "notes": [
          "행 1에는 연속 # 열을 포함하여 고정된 영어 열 이름이 포함되어 있습니다.",
          "행 2은 작업을 생성할 때 사용되는 인터페이스 언어의 각 열을 설명합니다.",
          "결과가 0인 완료된 작업에는 파일이 없습니다. 부분적으로 성공하면 전달된 행이 유지됩니다.",
          "라벨 행은 기록에 포함되지 않습니다."
        ],
        "language": "작업 언어: 한국어",
        "rowLabel": "열",
        "legend": {
          "fields": "행 1 · 필드 이름",
          "labels": "행 2 · 작업 언어",
          "data": "행 3+ · 기업"
        },
        "more": "+{count} 열 더보기",
        "csvLabels": {
          "#": "행 번호",
          "Name": "업체명",
          "Fulladdress": "전체 주소",
          "Categories": "사업 카테고리",
          "Phone": "기본 전화",
          "Review Count": "리뷰 수",
          "Average Rating": "평균 리뷰 평점",
          "Website": "비즈니스 웹사이트",
          "Emails": "공개 웹사이트 이메일",
          "Search Keyword": "검색 키워드"
        }
      },
      "features": {
        "head": {
          "kicker": "기능",
          "title": {
            "lead": "온라인 스크레이퍼 ",
            "accent": "의 기능",
            "tail": ""
          },
          "lead": "유료 플랜의 이메일 및 소셜 프로필(선택 사항)과 함께 클라우드에 수집된 비즈니스 세부정보입니다."
        },
        "items": [
          {
            "id": "keywords",
            "title": "키워드 작업",
            "description": "업체 유형과 위치를 별도의 키워드로 제출하세요. 귀하의 계획에 따라 키워드 제한 및 월별 기록 할당량이 결정됩니다.",
            "meta": "2 · 5 · 10 · 20 · 50 작업당 키워드"
          },
          {
            "id": "history",
            "title": "작업 내역",
            "description": "작업 진행 상황을 확인하고 대시보드에서 각 키워드에 대한 기록 수를 확인하세요.",
            "meta": "완료 · 부분 성공 · 실패"
          },
          {
            "id": "details",
            "title": "사업 내용",
            "description": "가능한 경우 이름, 주소, 전화번호, 웹사이트, 평가, 시간, 좌표 및 장소 식별자를 수집합니다.",
            "meta": "기업당 37 공개 열"
          },
          {
            "id": "enrichment",
            "title": "이메일 및 소셜 강화",
            "description": "유료 온라인 요금제를 사용하면 비즈니스 웹사이트에서 기본적으로 이메일 주소와 소셜 프로필을 확인합니다. 각 작업에 대해 이 기능을 끌 수 있습니다.",
            "meta": "유료 요금제 · 기본적으로 켜져 있음"
          },
          {
            "id": "downloads",
            "title": "작업 하나 CSV",
            "description": "파일이 사용 가능한 경우 전체 작업을 하나로 CSV 다운로드하세요. 검색별 파일은 필요하지 않습니다.",
            "meta": "{job}.csv · 37 열"
          },
          {
            "id": "browser",
            "title": "설치할 것이 없습니다.",
            "description": "Edge, Firefox 등 모든 브라우저에서 클라우드에서 실행됩니다. 작업 기록에서 결과를 다운로드하세요.",
            "meta": "Edge · Firefox · 모든 브라우저"
          }
        ]
      },
      "usage": {
        "head": {
          "kicker": "용법",
          "title": {
            "lead": "행별로 청구됨 ",
            "accent": "실제로 받는 금액",
            "tail": ""
          },
          "lead": "온라인 작업은 작업이 완료되면 제공된 비즈니스 행을 기준으로 측정됩니다. 제출할 때 아무것도 따로 설정되지 않으며 각 CSV의 라벨 행은 계산되지 않습니다."
        },
        "checks": [
          "작업을 제출하면 할당량에서 아무것도 예약되지 않습니다.",
          "남은 할당량을 초과하더라도 이미 실행 중인 작업이 완료됩니다.",
          "할당량을 모두 사용하면 새 작업을 제출할 수 없습니다.",
          "New York 시간 중 1번째에 사용량이 재설정됩니다. 사용하지 않은 기록은 이월되지 않습니다"
        ],
        "mock": {
          "recordsLabel": "이번 달의 기록",
          "left": "{count} 남음",
          "exhausted": "할당량이 소진되었습니다.",
          "task": "작업 {id}…",
          "pending": "지금까지 전달됨 · 작업이 완료되면 계산됨",
          "counted": "이번 달에 계산됩니다",
          "rows": "{count}행",
          "running": "달리기",
          "delta": "+{count} 기록"
        }
      },
      "plans": {
        "head": {
          "kicker": "온라인 스크레이퍼 계획",
          "title": {
            "lead": "클라우드 추출, ",
            "accent": "기록에 따라 가격 책정",
            "tail": ""
          },
          "lead": "인프라에서 MapsGrab 엔진을 실행하세요. 레코드는 전달된 하나의 비즈니스 행입니다. 유료 플랜에는 추가 기록 비용 없이 이메일과 사회적 풍요로움이 포함됩니다."
        },
        "specs": {
          "keywords": "작업별 키워드",
          "contacts": "이메일 및 소셜",
          "included": "기본적으로 켜짐",
          "excluded": "포함되지 않음"
        },
        "note": "한 달 동안의 일회성 결제 — 온라인 플랜은 자동 갱신되지 않습니다. New York시간 중 1번째에 사용량이 재설정되며 사용하지 않은 기록은 이월되지 않습니다.",
        "compare": "모든 요금제 비교"
      },
      "faq": {
        "kicker": "자주 묻는 질문",
        "title": {
          "lead": "",
          "accent": "자주 묻는 질문",
          "tail": ""
        },
        "lead": "짧은 답변. 그 밖의 지원은 이메일 한 번으로 가능합니다.",
        "contact": "지원팀에 문의",
        "items": [
          {
            "question": "온라인 스크레이퍼는 확장 프로그램과 어떻게 다릅니까?",
            "answer": "확장 프로그램은 브라우저에서 데이터를 수집합니다. 온라인 스크레이퍼는 클라우드에서 키워드 작업을 실행하고 결과를 대시보드에 전달합니다."
          },
          {
            "question": "데이터의 출처는 어디이며, 수집하는 것이 합법적인가요?",
            "answer": "MapsGrab은 Google Maps에 공개적으로 표시되는 정보만 수집합니다. 이는 모든 방문자가 읽을 수 있는 것과 동일한 세부정보입니다. 우리는 개인 계정, 비공개 콘텐츠 또는 비공개 데이터에 접근하지 않습니다."
          },
          {
            "question": "어떤 형식으로 내보낼 수 있나요?",
            "answer": "결과가 있는 작업은 37 공개 열, 연속 행 번호 및 두 개의 헤더 행이 포함된 하나의 UTF-8 CSV을 제공합니다. 모든 검색에서 업체의 중복이 제거됩니다. 결과가 없는 작업에는 파일이 없습니다."
          },
          {
            "question": "비용은 얼마입니까?",
            "answer": "온라인 스크레이퍼는 무료 월별 레코드 할당량을 포함하여 가격 페이지의 MapsGrab 계획을 따릅니다. 유료 플랜은 더 많은 것이 필요할 때 한도를 높입니다."
          },
          {
            "question": "이메일과 소셜 프로필을 이용하려면 유료 플랜이 필요합니까?",
            "answer": "온라인 무료에는 이메일이나 소셜 미디어 강화가 포함되지 않습니다. 유료 온라인 플랜에는 기본적으로 이 기능이 포함되어 있으며 각 작업마다 기능을 끌 수 있습니다. 작업이 제출되면 선택 사항이 수정됩니다."
          },
          {
            "question": "작업을 얼마나 오래 실행할 수 있나요?",
            "answer": "각 작업에는 60분의 수집 기간이 있습니다. 부분적으로 성공하면 수집된 행과 발견된 이메일 또는 프로필을 전달할 수 있습니다. 기록에는 CSV 사용 가능 여부가 표시됩니다."
          },
          {
            "question": "로그인하면 홈페이지 미리보기가 저장되나요?",
            "answer": "아니요. 홈페이지 미리보기는 저장되지 않는 퀵뷰입니다. 로그인한 후 대시보드에서 온라인 스크레이퍼를 열고 전체 작업으로 키워드를 다시 제출하세요."
          }
        ]
      },
      "cta": {
        "kicker": "시작하기",
        "title": {
          "lead": "첫 번째 ",
          "accent": "클라우드 작업",
          "tail": "을 대기열에 추가하세요"
        },
        "lead": "키워드를 제출하고, 작업 진행 상황을 따르고, 대시보드에서 비즈니스 데이터를 다운로드하세요.",
        "primary": "데이터 수집 시작",
        "secondary": "가격 보기",
        "note": "무료 월별 할당량이 포함되어 있습니다. 신용카드가 없습니다."
      }
    },
    "apiPage": {
      "switchLabel": "API 엔드포인트",
      "switchItems": {
        "search": "스크레이퍼",
        "reviews": "리뷰",
        "photos": "사진"
      },
      "primaryCta": "API 키 받기",
      "pricingCta": "가격 보기",
      "console": {
        "label": "예시 API 요청 및 응답",
        "langLabel": "요청 언어",
        "langs": {
          "curl": "cURL",
          "python": "Python",
          "node": "Node.js"
        },
        "copy": "복사요청",
        "replay": "재생 요청",
        "ready": "준비가 된",
        "composing": "요청 작성 중…",
        "sending": "요청을 보내는 중…",
        "done": "응답 · 200 OK · 애플리케이션/json",
        "waiting": "// 응답을 기다리는 중…",
        "response": "예시 응답"
      },
      "endpoints": {
        "kicker": "엔드포인트",
        "title": {
          "lead": "열쇠 하나. ",
          "accent": "세 가지",
          "tail": " 끝점."
        },
        "lead": "장소를 검색한 뒤 결과의 `fid`를 리뷰 또는 사진 API에 전달하세요. 세 API는 동일한 API 키와 월간 요청 한도를 공유합니다.",
        "here": "당신은 여기 있어요",
        "paramsLabel": "매개변수",
        "mcp": {
          "title": "AI 에이전트로 구축하시나요?",
          "description": "하나의 MCP 연결로 Google Maps 장소를 검색하고 리뷰와 공개 비즈니스 사진 URL을 가져오세요.",
          "link": "탐색 MCP"
        }
      },
      "chain": {
        "kicker": "체인 끝점",
        "title": {
          "lead": "",
          "accent": "스크레이퍼 → 리뷰 / 사진",
          "tail": ""
        },
        "lead": "장소를 검색한 뒤 결과의 `fid`를 리뷰 또는 사진 API에 전달하세요. 세 API는 동일한 API 키와 월간 요청 한도를 공유합니다.",
        "label": "장소를 검색한 뒤 결과의 fid를 리뷰 또는 사진 API에 전달하세요. 세 API는 동일한 API 키와 월간 요청 한도를 공유합니다.",
        "places": [
          {
            "name": "Ember & Oak Coffee",
            "meta": "4.7 · 1,284 리뷰"
          },
          {
            "name": "Rose City Roasters",
            "meta": "4.6 · 892 리뷰"
          },
          {
            "name": "Hawthorne Bean Co.",
            "meta": "4.8 · 2,106 리뷰"
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
          "note": "성공 응답의 status는 partial이며 reason은 수집이 멈춘 이유를 나타냅니다. reported_total은 상위 서비스가 보고한 수 또는 null이며, 검증된 전체 앨범 수가 아닙니다."
        }
      },
      "reference": {
        "kicker": "참조",
        "title": {
          "lead": "요청 인, ",
          "accent": "JSON",
          "tail": " 아웃"
        },
        "lead": "JSON 본문을 사용하여 키를 `Authorization: Bearer YOUR_API_KEY`로 보냅니다. 모든 응답은 `{code, data, msg}`로 래핑되며 `code` 10000는 성공을 의미합니다.",
        "baseUrl": "기본 URL",
        "copyBaseUrl": "베이스 복사 URL",
        "request": "요구",
        "response": "응답",
        "columns": {
          "parameter": "매개변수",
          "field": "필드",
          "type": "유형",
          "description": "설명",
          "example": "예"
        },
        "required": "필수의",
        "groupsLabel": "필드 그룹",
        "notes": [
          {
            "icon": "gauge",
            "title": "성공적인 호출당 하나의 요청",
            "description": "사진 일부 반환을 포함해 성공한 호출은 사진 수와 관계없이 요청 1회로 계산합니다. 유효한 사진을 반환할 수 없으면 오류가 발생하며 차감하지 않습니다. 검색, 리뷰, 사진, MCP는 월간 한도를 공유합니다."
          },
          {
            "icon": "key",
            "title": "401은 키를 확인하라는 의미입니다.",
            "description": "누락되거나 유효하지 않은 키는 HTTP 401을 반환합니다. 다른 오류는 HTTP 200이 아닌 10000 `code` 및 `msg`을 반환합니다."
          },
          {
            "icon": "locate",
            "title": "위치는 울타리가 아니라 편견이다",
            "description": "`ll`는 지도에 검색할 위치를 알려줍니다. 해당 보기 외부의 장소는 계속 표시될 수 있습니다."
          },
          {
            "icon": "target",
            "title": "장소 이름 지정",
            "description": "시, 주 또는 ZIP을 `q`에 넣으세요. \"내 근처\"에는 서버에 고정할 항목이 없습니다."
          }
        ]
      },
      "plans": {
        "kicker": "API 계획",
        "title": {
          "lead": "프로그래밍 방식 액세스, ",
          "accent": "요청에 따라 가격 책정",
          "tail": ""
        },
        "lead": "사진 일부 반환을 포함해 성공한 호출은 사진 수와 관계없이 요청 1회로 계산합니다. 유효한 사진을 반환할 수 없으면 오류가 발생하며 차감하지 않습니다. 검색, 리뷰, 사진, MCP는 월간 한도를 공유합니다."
      },
      "faq": {
        "lead": "짧은 답변. 그 밖의 지원은 이메일 한 번으로 가능합니다.",
        "contact": "지원팀에 문의"
      },
      "cta": {
        "kicker": "시작하기",
        "note": "무료 월별 할당량이 포함되어 있습니다. 신용카드가 없습니다."
      }
    },
    "scraperApi": {
      "seo": {
        "title": "Google Maps 스크레이퍼 API — JSON의 비즈니스 데이터 | MapsGrab",
        "description": "MapsGrab 스크레이퍼 API는 Google Maps 검색 결과를 JSON로 반환합니다: 이름, 주소, 전화, 웹사이트, 등급, 시간, 좌표, Place ID 및 fid — 요청 시 이메일 및 소셜 프로필도 제공됩니다."
      },
      "hero": {
        "title": {
          "lead": "Google Maps ",
          "accent": "스크레이퍼",
          "tail": " API"
        },
        "lead": "HTTPS 이상의 키워드를 보내면 Google Maps 업체를 JSON(이름, 주소, 전화번호, 웹사이트, 평가, 영업 시간, 좌표, Place ID 및 FID)로 다시 받을 수 있으며 요청 시 이메일과 소셜 프로필도 받을 수 있습니다.",
        "meta": [
          "무료 플랜: {quota}",
          "검색 및 리뷰를 위한 하나의 열쇠",
          "JSON 이상 HTTPS"
        ],
        "chips": [
          {
            "label": "장소당",
            "value": "29 데이터 필드"
          },
          {
            "label": "페이지당",
            "value": "최대 20개 장소"
          }
        ]
      },
      "endpoint": {
        "name": "수집 API",
        "description": "모든 키워드 및 선택적 위치에 대한 비즈니스 — 장소당 29 필드와 `extra`이 포함된 이메일 및 소셜 프로필.",
        "link": "스크레이퍼 탐색 API"
      },
      "caps": {
        "title": {
          "lead": "",
          "accent": "수집 API",
          "tail": "가 반환하는 것"
        },
        "lead": "키워드 및 선택적 위치 편향; Google Maps 검색으로 표시되는 장소는 JSON 구조로 표시됩니다.",
        "items": [
          {
            "icon": "search",
            "title": "키워드 및 위치로 검색",
            "description": "선택 사항인 `ll` 위치 바이어스를 포함하여 `q`를 보냅니다. `page`는 수집할 결과 페이지 수를 설정합니다. 1~10, 최대 20개 장소를 모두 하나의 응답으로 설정합니다."
          },
          {
            "icon": "table",
            "title": "장소당 29 필드",
            "description": "이름, 카테고리, 전체 주소, 전화, 웹사이트, 평가 및 리뷰 수, 영업시간, 좌표, Place ID, CID, FID, 소유자 등."
          },
          {
            "icon": "mail",
            "title": "이메일 및 소셜 강화",
            "description": "`extra`을 `true`로 설정하면 `emails` 및 `medias`을 추가할 수 있습니다: 각 비즈니스 웹사이트에 있는 Instagram, Facebook, YouTube, TikTok, LinkedIn 및 X 프로필."
          },
          {
            "icon": "braces",
            "title": "깨끗하고 예측 가능 JSON",
            "description": "하나의 `{code, data, msg}` 봉투에 snake_case 필드가 있습니다. 값 Google Maps는 복귀를 `null` 또는 빈 목록으로 표시하지 않으며 결코 빈 문자열로 표시하지 않습니다."
          },
          {
            "icon": "layers",
            "title": "부분 데이터가 플래그 지정되었습니다.",
            "description": "일부 세부 사항을 채울 수 없는 경우에도 `partial`을 `true`로 설정하고 `warnings`를 사용하여 누락된 부분을 알 수 있습니다."
          },
          {
            "icon": "shield",
            "title": "공개 데이터만",
            "description": "결과에는 Google Maps이 공개적으로 표시하는 내용만 포함됩니다. 이는 모든 방문자가 읽을 수 있는 것과 동일한 세부정보입니다."
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
            "description": "검색 대상(최대 300자) — 업체 유형과 장소(예: `coffee shop in Portland, OR`."
          },
          {
            "name": "page",
            "type": "integer",
            "required": false,
            "description": "수집할 결과 페이지 수, 각각 1~10, 최대 20개 장소가 모두 하나의 응답으로 반환됩니다. 페이지에 장소가 20개 미만이거나 새로운 항목이 없으면 수집이 일찍 중지됩니다. 기본값 `1`."
          },
          {
            "name": "hl",
            "type": "string",
            "required": false,
            "description": "결과 언어(예: `en` 또는 `fr`. 기본값은 `en`입니다."
          },
          {
            "name": "ll",
            "type": "string",
            "required": false,
            "description": "선택적인 위치 바이어스는 `@lat,lng,zoom`, 확대/축소 0–21입니다. 검색할 위치를 지도에 알려줍니다. 결과는 반경에 맞게 잘리지 않습니다."
          },
          {
            "name": "extra",
            "type": "boolean",
            "required": false,
            "description": "`true`은 모든 위치에 `emails` 및 `medias`를 추가합니다. 기본값 `false`."
          }
        ],
        "groups": [
          {
            "label": "신원",
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
            "label": "연락하다",
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
                "badge": "추가의"
              },
              {
                "name": "medias",
                "type": "object",
                "example": "{\"instagram\": \"https://www.instagram.com/emberandoak\", …}",
                "badge": "추가의"
              }
            ]
          },
          {
            "label": "위치",
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
            "label": "평가",
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
            "label": "윤곽",
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
            "label": "페이지",
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
          "accent": "자주 묻는 질문",
          "tail": ""
        },
        "items": [
          {
            "question": "스크레이퍼 API는 무엇을 반환하나요?",
            "answer": "JSON 수집된 페이지당 최대 20 장소. 각 장소에는 이름, 카테고리, 주소, 전화번호, 웹사이트, 평가, 리뷰 수, 영업 시간, 좌표, Place ID, CID, ID 등 29 필드와 extra가 true인 경우 이메일 및 소셜 프로필이 있습니다."
          },
          {
            "question": "어떻게 인증하나요?",
            "answer": "MapsGrab API 키를 Authorization 헤더의 전달자 토큰으로 보냅니다. 각 계정에는 하나의 키가 있습니다. 생성한 경우에만 전체가 표시되며, 새 키를 생성하면 이전 키가 즉시 비활성화됩니다."
          },
          {
            "question": "요청은 어떻게 계산되나요?",
            "answer": "사진 일부 반환을 포함해 성공한 호출은 사진 수와 관계없이 요청 1회로 계산합니다. 유효한 사진을 반환할 수 없으면 오류가 발생하며 차감하지 않습니다. 검색, 리뷰, 사진, MCP는 월간 한도를 공유합니다."
          },
          {
            "question": "페이지는 무엇을 하나요?",
            "answer": "페이지는 한 번의 호출로 수집할 결과 페이지 수를 1부터 10까지 나타냅니다. 각 페이지에 최대 20개의 장소가 추가되며, Google Maps에 새로운 항목이 없으면 수집이 일찍 중단됩니다. 페이지 번호가 아닙니다."
          },
          {
            "question": "데이터가 공개되나요?",
            "answer": "예. API은 Google Maps에 공개적으로 표시된 정보만 반환합니다. 이는 모든 방문자가 읽을 수 있는 것과 동일한 세부정보입니다. 개인 계정이나 비공개 데이터에는 액세스하지 않습니다."
          }
        ]
      },
      "cta": {
        "title": {
          "lead": "",
          "accent": "애플리케이션",
          "tail": "에 지도 데이터를 넣으세요."
        },
        "lead": "검색당 하나의 HTTP 요청이 응답으로 구조화되어 JSON — CRM, 데이터 파이프라인 및 자체 제품에 대한 것입니다."
      }
    },
    "reviewsApi": {
      "seo": {
        "title": "Google Maps 리뷰 스크레이퍼 API — JSON의 리뷰 | MapsGrab",
        "description": "MapsGrab 리뷰 API는 Google Maps 업체에 대한 공개 리뷰를 JSON로 반환합니다. 평점, 텍스트 및 번역, 작성자, 날짜, 리뷰 사진 및 소유자 답변 — 커서가 있는 페이지당 최대 60까지."
      },
      "hero": {
        "title": {
          "lead": "Google Maps ",
          "accent": "리뷰",
          "tail": " 스크레이퍼 API"
        },
        "lead": "모든 Google Maps 업체에 대한 공개 리뷰를 FID로 요청하고 체계적으로 JSON 돌아오세요: 평가, 텍스트 및 번역, 작성자, 날짜, 리뷰 사진 및 소유자 답변 — 커서가 있는 페이지별로.",
        "meta": [
          "무료 플랜: {quota}",
          "페이지당 최대 60개의 리뷰",
          "JSON 이상 HTTPS"
        ],
        "chips": [
          {
            "label": "페이지당",
            "value": "최대 60 리뷰"
          },
          {
            "label": "정렬 기준",
            "value": "관련성 · 최신 · 평가"
          }
        ]
      },
      "endpoint": {
        "name": "리뷰 API",
        "description": "한 업체에 대한 공개 리뷰는 `fid`개입니다. 페이지당 최대 60개까지, 원하는 방식으로 정렬하고 커서로 페이지를 표시합니다.",
        "link": "리뷰 살펴보기 API"
      },
      "caps": {
        "title": {
          "lead": "",
          "accent": "리뷰 API",
          "tail": "가 반환하는 것"
        },
        "lead": "평가, 텍스트, 작성자, 사진, 소유자 답변 등 비즈니스에 대한 모든 공개 리뷰는 요청당 한 페이지에 표시됩니다.",
        "items": [
          {
            "icon": "review",
            "title": "FID의 리뷰",
            "description": "수집 API 결과에서 `fid`로 업체 주소를 지정한 다음 `next_cursor`를 다시 전달하여 각각 최대 60개의 리뷰를 읽고 다음 페이지를 읽습니다."
          },
          {
            "icon": "filter",
            "title": "원하는 대로 정렬됨",
            "description": "`sort_by`는 가장 관련성이 높은(1), 최신(2), 최고 등급(3) 또는 최저 등급(4) 리뷰를 먼저 반환합니다."
          },
          {
            "icon": "list",
            "title": "텍스트, 번역 및 날짜",
            "description": "평가, 리뷰 텍스트, `translated_text` 및 `language`, `published_at_ms` 및 모든 리뷰에 대한 상대 날짜."
          },
          {
            "icon": "user",
            "title": "작성자 세부정보",
            "description": "작성자 이름과 프로필 링크, 작성자의 리뷰 수, 지역 가이드 상태."
          },
          {
            "icon": "image",
            "title": "사진 및 소유자 답변",
            "description": "`images`는 리뷰에 첨부된 사진 URLs을 나열합니다. `owner_response`는 소유자의 응답을 전달하고 `owner_response_at_ms`은 시간을 전달합니다."
          },
          {
            "icon": "shield",
            "title": "공개 데이터만",
            "description": "Google Maps에는 공개된 리뷰만 표시됩니다. 모든 방문자가 읽을 수 있는 동일한 콘텐츠입니다."
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
            "description": "비즈니스 기능 ID(예: `0x5495…:0xbeb4…`. 모든 수집 API 장소에는 이 기능이 포함되어 있습니다."
          },
          {
            "name": "cursor",
            "type": "string",
            "required": false,
            "description": "이전 페이지의 `next_cursor`입니다. 첫 페이지에서는 생략하세요."
          },
          {
            "name": "sort_by",
            "type": "integer",
            "required": false,
            "description": "`1` 가장 관련성이 높은 · `2` 최신 · `3` 최고 등급 · `4` 최저 등급. 기본값 `1`."
          },
          {
            "name": "hl",
            "type": "string",
            "required": false,
            "description": "언어 코드(예: `en`. 기본값은 `en`입니다."
          }
        ],
        "groups": [
          {
            "label": "리뷰",
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
            "label": "작가",
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
            "label": "소유자 답변",
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
            "label": "페이지",
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
          "accent": "자주 묻는 질문",
          "tail": ""
        },
        "items": [
          {
            "question": "특정 비즈니스를 어떻게 처리합니까?",
            "answer": "FID에는 모든 수집 API 장소에 기능 ID가 포함되어 있습니다. 무료 Place ID Finder는 Google Maps 장소 URL에서 FID를 읽을 수도 있습니다."
          },
          {
            "question": "리뷰에는 어떤 필드가 포함되나요?",
            "answer": "리뷰 ID, 평가, 번역 및 언어가 포함된 텍스트, 게시 시간 및 관련 날짜, 작성자 이름, 프로필 링크, 리뷰 수 및 지역 가이드 상태, 첨부된 사진, 시간과 함께 소유자 답변."
          },
          {
            "question": "리뷰는 몇 개까지 수집할 수 있나요?",
            "answer": "각 요청은 최대 60개 리뷰와 next_cursor개 리뷰로 구성된 한 페이지를 반환합니다. 다음 페이지를 읽으려면 다시 전달하세요. next_cursor이 null이면 더 이상 페이지가 없습니다."
          },
          {
            "question": "요청은 어떻게 계산되나요?",
            "answer": "사진 일부 반환을 포함해 성공한 호출은 사진 수와 관계없이 요청 1회로 계산합니다. 유효한 사진을 반환할 수 없으면 오류가 발생하며 차감하지 않습니다. 검색, 리뷰, 사진, MCP는 월간 한도를 공유합니다."
          },
          {
            "question": "데이터가 공개되나요?",
            "answer": "예. API은 Google Maps에 공개적으로 표시된 리뷰만 반환합니다. 이는 방문자가 읽을 수 있는 것과 동일한 콘텐츠입니다. 개인 계정이나 비공개 데이터에는 액세스하지 않습니다."
          }
        ]
      },
      "cta": {
        "title": {
          "lead": "리뷰 모니터링 ",
          "accent": "대규모",
          "tail": ""
        },
        "lead": "Cursor 페이지 리뷰 스레드가 깔끔하게 JSON — 모니터링, 연구 및 보고용입니다."
      }
    },
    "photosApi": {
      "seo": {
        "title": "사진 API — 공개 비즈니스 사진 URL | MapsGrab",
        "description": "비즈니스의 fid로 공개 사진 URL을 JSON으로 받으세요. max_results는 반환 수의 상한이며, 결과는 일부 사진이므로 전체 앨범을 보장하지 않습니다."
      },
      "hero": {
        "title": {
          "lead": "Google Maps ",
          "accent": "사진",
          "tail": " API"
        },
        "lead": "비즈니스의 fid로 공개 사진 URL을 JSON으로 받으세요. max_results는 반환 수의 상한이며, 결과는 일부 사진이므로 전체 앨범을 보장하지 않습니다.",
        "meta": [
          "무료 플랜: {quota}",
          "공개 비즈니스 사진 URL",
          "요청에 따라 가격 책정"
        ],
        "chips": [
          {
            "label": "반환 상태",
            "value": "partial"
          },
          {
            "label": "반환 수",
            "value": "returned_count"
          }
        ]
      },
      "endpoint": {
        "name": "사진 API",
        "description": "비즈니스의 fid로 공개 사진 URL을 JSON으로 받으세요. max_results는 반환 수의 상한이며, 결과는 일부 사진이므로 전체 앨범을 보장하지 않습니다.",
        "link": "사진 API 살펴보기"
      },
      "caps": {
        "title": {
          "lead": "",
          "accent": "사진 API",
          "tail": ""
        },
        "lead": "공개 비즈니스 사진 URL",
        "items": [
          {
            "icon": "image",
            "title": "fid로 사진 가져오기",
            "description": "검색 결과 또는 Place ID Finder의 `fid`를 사용하세요. `photos`의 각 항목에는 공개 사진의 `url`이 포함됩니다."
          },
          {
            "icon": "filter",
            "title": "요청별 반환 수 제한",
            "description": "`max_results`는 양의 정수이며 기본값은 200입니다. 실제 반환 수는 더 적을 수 있습니다. 페이지 번호나 커서는 제공하지 않습니다."
          },
          {
            "icon": "list",
            "title": "반환 상태 확인",
            "description": "성공 응답의 `status`는 `partial`이며 `reason`은 수집이 멈춘 이유를 나타냅니다. `reported_total`은 상위 서비스가 보고한 수 또는 `null`이며, 검증된 전체 앨범 수가 아닙니다."
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
            "description": "검색 결과 또는 Place ID Finder의 비즈니스 FID. `0x…:0x…` 형식이며 각 부분은 12~20자리 16진수입니다."
          },
          {
            "name": "max_results",
            "type": "integer",
            "required": false,
            "description": "이번 요청의 사진 반환 상한. 양의 정수이며 기본값은 200입니다. 해당 수량을 보장하지 않습니다."
          }
        ],
        "groups": [
          {
            "label": "사진",
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
            "label": "반환 상태",
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
          "accent": "자주 묻는 질문",
          "tail": ""
        },
        "items": [
          {
            "question": "비즈니스 사진은 어떻게 요청하나요?",
            "answer": "fid와 선택 사항인 max_results를 포함해 /photos에 POST 요청을 보내세요. 검색 및 리뷰 API와 동일한 Bearer API 키를 사용합니다."
          },
          {
            "question": "전체 앨범을 가져올 수 있나요?",
            "answer": "성공 응답의 status는 partial이며 reason은 수집이 멈춘 이유를 나타냅니다. reported_total은 상위 서비스가 보고한 수 또는 null이며, 검증된 전체 앨범 수가 아닙니다. max_results는 양의 정수이며 기본값은 200입니다. 실제 반환 수는 더 적을 수 있습니다. 페이지 번호나 커서는 제공하지 않습니다."
          },
          {
            "question": "기업의 신용 정보를 어떻게 얻을 수 있나요?",
            "answer": "모든 수집 API 장소에는 FID가 포함되어 있으며, 무료 Place ID Finder는 모든 Google Maps 장소 URL에서 FID를 읽습니다."
          },
          {
            "question": "요청은 어떻게 계산되나요?",
            "answer": "사진 일부 반환을 포함해 성공한 호출은 사진 수와 관계없이 요청 1회로 계산합니다. 유효한 사진을 반환할 수 없으면 오류가 발생하며 차감하지 않습니다. 검색, 리뷰, 사진, MCP는 월간 한도를 공유합니다."
          },
          {
            "question": "데이터가 공개되나요?",
            "answer": "예. 이미지 URLs는 Google Maps에 공개된 사진을 가리킵니다. 모든 방문자가 볼 수 있는 동일한 이미지입니다."
          }
        ]
      },
      "cta": {
        "title": {
          "lead": "",
          "accent": "앱에 비즈니스 사진 연결",
          "tail": ""
        },
        "lead": "기존 API 키로 공개 사진 URL과 반환 상태를 가져오세요."
      }
    },
    "scraperMcp": {
      "seo": {
        "title": "Google Maps 스크레이퍼 MCP 서버 | MapsGrab",
        "description": "하나의 MCP 연결로 Google Maps 장소를 검색하고 리뷰와 공개 비즈니스 사진 URL을 가져오세요."
      },
      "clients": {
        "claude": "Claude Code",
        "cursor": "Cursor",
        "vscode": "VS Code",
        "codex": "Codex"
      },
      "connectCta": "에이전트 연결",
      "hero": {
        "kicker": "MCP 서버",
        "title": {
          "lead": "Google Maps 스크레이퍼 ",
          "accent": "MCP",
          "tail": " 서버"
        },
        "lead": "하나의 MCP 연결로 Google Maps 장소를 검색하고 리뷰와 공개 비즈니스 사진 URL을 가져오세요.",
        "meta": [
          "Streamable HTTP",
          "OAuth로 로그인",
          "무료 플랜: {quota}"
        ],
        "chips": [
          {
            "label": "수송",
            "value": "Streamable HTTP"
          },
          {
            "label": "도구 결과",
            "value": "구조화됨 JSON"
          }
        ]
      },
      "agent": {
        "label": "에이전트 세션 예시: 지역 비즈니스에 대한 질문, 구조화된 결과가 포함된 MapsGrab 도구 호출 및 에이전트의 답변",
        "session": "에이전트 세션",
        "connected": "MCP 서버 {server} 연결됨",
        "placeholder": "Google Maps에 있는 어떤 장소에 대해 물어보세요...",
        "thinking": "생각…",
        "running": "달리기",
        "scenes": [
          {
            "prompt": "텍사스주 오스틴에서 4.8 이상 등급을 받은 치과의사를 찾아 전화번호를 나열하세요.",
            "calls": [
              {
                "tool": "search_places",
                "args": "{\"q\": \"dentist in Austin, TX\"}",
                "state": "20개 장소",
                "out": [
                  "{\"name\": \"Bluebonnet Family Dental\", \"average_rating\": 4.9, \"phone\": \"(512) 555-0134\", …}",
                  "{\"name\": \"Barton Hills Smile Studio\", \"average_rating\": 4.8, \"phone\": \"(512) 555-0161\", …}",
                  "{\"name\": \"Live Oak Dentistry\", \"average_rating\": 4.8, \"phone\": \"(512) 555-0187\", …}"
                ],
                "more": "+ 17 더 많은 장소"
              }
            ],
            "answer": [
              "처음 20 결과 중 3개가 평가되었습니다. ",
              {
                "strong": "4.8 이상"
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
            "prompt": "포틀랜드에 있는 Ember & Oak Coffee의 최신 리뷰에서 사람들은 무엇을 말하고 있나요?",
            "calls": [
              {
                "tool": "search_places",
                "args": "{\"q\": \"Ember & Oak Coffee, Portland, OR\"}",
                "state": "1 장소",
                "out": [
                  "{\"name\": \"Ember & Oak Coffee\", \"fid\": \"0x5495…e0ab\", \"average_rating\": 4.7, …}"
                ],
                "more": ""
              },
              {
                "tool": "list_reviews",
                "args": "{\"fid\": \"0x5495…e0ab\", \"sort_by\": 2}",
                "state": "60 리뷰",
                "out": [
                  "{\"rating\": 5, \"text\": \"Best cortado on Division. Friendly crew.\", …}",
                  "{\"rating\": 4, \"text\": \"Great beans. Cozy but small — come early on weekends.\", …}",
                  "{\"rating\": 5, \"text\": \"Oat flat white is excellent and the staff remembers names.\", …}"
                ],
                "more": "\"next_cursor\": \"…\""
              }
            ],
            "answer": [
              "주로 ",
              {
                "strong": "5별"
              },
              " — 사람들은 에스프레소와 친절한 직원을 칭찬합니다. 반복되는 메모: ",
              {
                "strong": "주말에는 자리가 꽉 차서"
              },
              "."
            ],
            "rows": []
          },
          {
            "prompt": "시카고의 어느 배관공이 웹사이트를 나열하지 않습니까? 테이블에 넣으십시오.",
            "calls": [
              {
                "tool": "search_places",
                "args": "{\"q\": \"plumber in Chicago, IL\"}",
                "state": "20개 장소",
                "out": [
                  "{\"name\": \"Windy City Pipe Works\", \"website\": null, \"phone\": \"(312) 555-0112\", …}",
                  "{\"name\": \"Lakeview Drain & Sewer\", \"website\": null, \"phone\": \"(312) 555-0148\", …}",
                  "{\"name\": \"North Branch Plumbing\", \"website\": null, \"phone\": \"(312) 555-0175\", …}"
                ],
                "more": "+ 17 더 많은 장소"
              }
            ],
            "answer": [
              {
                "strong": "4 중 20"
              },
              " 등록된 웹사이트가 없습니다. 처음 3개:"
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
            "prompt": "Rose City Roasters의 가장 낮은 평가를 받고 정중한 답변을 작성하세요.",
            "calls": [
              {
                "tool": "search_places",
                "args": "{\"q\": \"Rose City Roasters, Portland, OR\"}",
                "state": "1 장소",
                "out": [
                  "{\"name\": \"Rose City Roasters\", \"fid\": \"0x5495…8f7a\", \"average_rating\": 4.6, …}"
                ],
                "more": ""
              },
              {
                "tool": "list_reviews",
                "args": "{\"fid\": \"0x5495…8f7a\", \"sort_by\": 4}",
                "state": "60 리뷰",
                "out": [
                  "{\"rating\": 2, \"text\": \"Waited 20 minutes for a latte at noon.\", \"owner_response\": null, …}",
                  "{\"rating\": 2, \"text\": \"Great beans, but the line barely moves on Saturdays.\", \"owner_response\": null, …}",
                  "{\"rating\": 3, \"text\": \"Good coffee, hard to find a seat.\", \"owner_response\": \"Thanks — more seats are coming!\", …}"
                ],
                "more": "\"next_cursor\": \"…\""
              }
            ],
            "answer": [
              "가장 낮은 평점은 주로 언급됩니다. ",
              {
                "strong": "피크 시간대에는 느린 서비스"
              },
              ". ",
              {
                "strong": "2 중 3"
              },
              " 아직 소유자 답변이 없습니다. 각각에 대해 초안을 작성했습니다."
            ],
            "rows": []
          }
        ]
      },
      "tools": {
        "kicker": "도구",
        "title": {
          "lead": "MCP 서버 ",
          "accent": "가 노출하는 것",
          "tail": ""
        },
        "lead": "세 가지 도구: Search / Reviews / Photos.",
        "kind": "도구",
        "returns": "보고",
        "items": [
          {
            "name": "search_places",
            "icon": "search",
            "title": "장소 검색",
            "description": "이름, 전화번호, 평점, 시간, 좌표, 장소 ID, FID 등 Google Maps 검색 결과를 반환하는 키워드 및 위치 검색입니다.",
            "args": [
              {
                "name": "q",
                "description": "키워드에 도시, 주 또는 ZIP를 더한 값"
              },
              {
                "name": "page",
                "description": "수집할 결과 페이지, 1~10 · 각 최대 20개 장소"
              },
              {
                "name": "hl",
                "description": "결과 언어(예: `en`"
              },
              {
                "name": "ll",
                "description": "위치 편견, `@lat,lng,zoom`"
              },
              {
                "name": "extra",
                "description": "`true` 이메일과 소셜 프로필을 추가합니다."
              }
            ],
            "returns": "places · partial · warnings",
            "link": "스크레이퍼와 동일한 데이터 API"
          },
          {
            "name": "list_reviews",
            "icon": "review",
            "title": "리뷰 나열",
            "description": "귀하의 대리인이 조사 중인 모든 비즈니스에 대한 평가, 리뷰 텍스트, 작성자, 날짜, 사진 및 소유자 답변입니다.",
            "args": [
              {
                "name": "fid",
                "description": "모든 검색 결과에서"
              },
              {
                "name": "cursor",
                "description": "`next_cursor` 마지막 페이지부터; 처음에는 생략"
              },
              {
                "name": "sort_by",
                "description": "1 관련 · 2 최신 · 3 최고 · 4 최저"
              },
              {
                "name": "hl",
                "description": "언어(예: `en`"
              }
            ],
            "returns": "reviews ≤ 60 · next_cursor",
            "link": "리뷰와 동일한 데이터 API"
          },
          {
            "name": "list_photos",
            "icon": "image",
            "title": "fid로 사진 가져오기",
            "description": "비즈니스의 fid로 공개 사진 URL을 JSON으로 받으세요. max_results는 반환 수의 상한이며, 결과는 일부 사진이므로 전체 앨범을 보장하지 않습니다.",
            "args": [
              {
                "name": "fid",
                "description": "검색 결과 또는 Place ID Finder의 비즈니스 FID. `0x…:0x…` 형식이며 각 부분은 12~20자리 16진수입니다."
              },
              {
                "name": "max_results",
                "description": "이번 요청의 사진 반환 상한. 양의 정수이며 기본값은 200입니다. 해당 수량을 보장하지 않습니다."
              }
            ],
            "returns": "photos · returned_count · reported_total · status · reason",
            "link": "사진 API 살펴보기"
          }
        ]
      },
      "flow": {
        "kicker": "연결 방법",
        "title": {
          "lead": "에이전트와 ",
          "accent": "실시간 지도 데이터",
          "tail": " 사이의 하나의 엔드포인트"
        },
        "lead": "클라이언트는 Streamable HTTP를 통해 연결하고 브라우저를 통해 로그인합니다. 에이전트는 도구를 검색하고 프롬프트에 지도 데이터가 필요할 때 도구를 호출하고 구조화된 JSON를 다시 읽습니다.",
        "label": "하나의 MCP 연결로 Google Maps 장소를 검색하고 리뷰와 공개 비즈니스 사진 URL을 가져오세요. search_places / list_reviews / list_photos.",
        "clientsLabel": "MCP 고객",
        "anyClient": "모든 MCP 클라이언트",
        "toolsLabel": "도구",
        "hub": "MapsGrab MCP",
        "publicData": "공개 Google Maps 데이터",
        "resultLabel": "결과",
        "results": [
          "20개 장소",
          "60 리뷰",
          "2 사진"
        ],
        "steps": [
          {
            "title": "연결하다",
            "description": "클라이언트에 엔드포인트를 추가한 다음 브라우저를 통해 MapsGrab에 로그인하세요."
          },
          {
            "title": "발견하다",
            "description": "에이전트는 MapsGrab 도구와 해당 입력 스키마를 나열합니다."
          },
          {
            "title": "부르다",
            "description": "프롬프트에 지도 데이터가 필요한 경우 에이전트는 도구를 호출하고 JSON 결과를 읽습니다."
          }
        ]
      },
      "setup": {
        "kicker": "설정",
        "title": {
          "lead": "하나의 구성 블록 ",
          "accent": "클라이언트당",
          "tail": ""
        },
        "lead": "클라이언트를 MapsGrab 엔드포인트로 지정하고 브라우저를 통해 로그인하세요. 복사할 API 키도 없고, SDK도 없고, 실행할 로컬 프로세스도 없습니다.",
        "tabsLabel": "MCP 고객",
        "copy": "구성 복사",
        "clients": {
          "claude": {
            "file": "단말기",
            "steps": [
              {
                "title": "서버 추가",
                "description": "HTTP를 통해 `mapsgrab`를 등록하는 명령을 실행합니다."
              },
              {
                "title": "로그인",
                "description": "Claude Code에서 `/mcp`를 실행하고 `mapsgrab`를 선택한 후 인증하세요. 승인할 수 있도록 MapsGrab가 브라우저에서 열립니다."
              },
              {
                "title": "지도 데이터 요청",
                "description": "Claude Code는 MapsGrab 도구를 나열하고 프롬프트에 필요할 때 호출합니다."
              }
            ]
          },
          "cursor": {
            "file": "~/.cursor/mcp.json",
            "steps": [
              {
                "title": "mcp.json 편집",
                "description": "모든 프로젝트의 경우 `~/.cursor/mcp.json`에 블록을 추가하고, 프로젝트의 경우 `.cursor/mcp.json`에 블록을 추가하세요."
              },
              {
                "title": "로그인",
                "description": "Cursor 설정 → MCP에서 `mapsgrab` 옆 연결을 클릭하고 브라우저에서 승인합니다."
              },
              {
                "title": "도구를 사용하세요",
                "description": "`mapsgrab`는 에이전트를 위해 준비된 MCP 서버 목록에 해당 도구를 표시합니다."
              }
            ]
          },
          "vscode": {
            "file": ".vscode/mcp.json",
            "steps": [
              {
                "title": ".vscode/mcp.json 추가",
                "description": "블록을 붙여넣습니다. 엔드포인트 URL만 포함하며 비밀은 없습니다."
              },
              {
                "title": "로그인",
                "description": "서버를 시작합니다. VS Code는 MapsGrab 인증을 요청하고 브라우저를 열어 승인합니다."
              },
              {
                "title": "에이전트 모드 사용",
                "description": "상담원 모드에서 채팅을 열고 MapsGrab 도구를 활성화하세요."
              }
            ]
          },
          "codex": {
            "file": "단말기",
            "steps": [
              {
                "title": "서버 추가",
                "description": "`codex mcp add`를 실행하여 URL로 `mapsgrab`를 등록합니다."
              },
              {
                "title": "로그인",
                "description": "`codex mcp login mapsgrab`를 실행하고 브라우저에서 MapsGrab를 승인하세요."
              },
              {
                "title": "시작 Codex",
                "description": "새 세션에서는 `mapsgrab` 및 해당 도구가 로드됩니다."
              }
            ]
          }
        },
        "apiKey": {
          "title": "브라우저에서 로그인할 수 없나요? API 키를 사용하세요",
          "description": "클라이언트가 MCP 인증을 지원하지 않거나 서버 또는 CI에서 실행되는 경우 대신 API 키를 `Authorization` 헤더로 추가하세요. 공유 구성 파일이 아닌 환경 변수 또는 클라이언트의 비밀 입력에 키를 보관하세요.",
          "link": "API 키 받기",
          "snippet": "모든 HTTP 클라이언트"
        },
        "spec": {
          "title": "기타 MCP 클라이언트",
          "subtitle": "MCP Inspector 포함됨",
          "transport": "수송",
          "transportValue": "Streamable HTTP",
          "endpoint": "엔드포인트",
          "copyEndpoint": "끝점 복사",
          "auth": "인증",
          "authValue": "OAuth 로그인(대체: Authorization: Bearer YOUR_API_KEY)"
        }
      },
      "prompts": {
        "kicker": "예시 프롬프트",
        "title": {
          "lead": "쉬운 언어로 물어보세요. ",
          "accent": "행을 다시 가져옵니다.",
          "tail": ""
        },
        "lead": "잠재 고객 발굴, 현지 시장 조사, 리뷰 모니터링 — 작업을 설명하면 상담원이 어떤 MapsGrab 도구를 호출할지 결정합니다.",
        "rows": [
          [
            {
              "icon": "target",
              "tag": "탐사",
              "quote": "\"텍사스주 오스틴에서 등급이 4.8 이상인 치과의사를 찾아 전화번호를 기재하세요.\"",
              "tools": [
                "search_places"
              ],
              "fields": ""
            },
            {
              "icon": "review",
              "tag": "평판",
              "quote": "\"포틀랜드의 Ember & Oak Coffee에 대한 최신 리뷰에서 사람들이 말하는 내용을 요약하세요.\"",
              "tools": [
                "search_places",
                "list_reviews"
              ],
              "fields": ""
            },
            {
              "icon": "list-plus",
              "tag": "리드 목록",
              "quote": "\"이메일과 Instagram 프로필을 사용하여 덴버에 있는 요가 스튜디오 목록을 구축하세요.\"",
              "tools": [
                "search_places"
              ],
              "fields": "extra: true · emails · medias"
            },
            {
              "icon": "chart",
              "tag": "시장 조사",
              "quote": "“포틀랜드 Division St에 있는 커피숍의 평점과 리뷰 수를 비교해 보세요.”",
              "tools": [
                "search_places"
              ],
              "fields": "average_rating · review_count"
            },
            {
              "icon": "table",
              "tag": "농축",
              "quote": "“이 스프레드시트에 모든 업체의 Place ID, 전화번호, 웹사이트를 추가하세요.”",
              "tools": [
                "search_places"
              ],
              "fields": "place_id · phone · website"
            },
            {
              "icon": "mail",
              "tag": "소유자 답변",
              "quote": "\"Rose City Roasters의 가장 낮은 평가를 받은 리뷰를 가져와 정중한 답변을 작성하세요.\"",
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
              "tag": "웹사이트 격차",
              "quote": "\"시카고의 어떤 배관공이 웹사이트를 나열하지 않습니까? 표에 올려두세요.\"",
              "tools": [
                "search_places"
              ],
              "fields": "website: null"
            },
            {
              "icon": "clock",
              "tag": "영업시간",
              "quote": "“60614 근처에 일요일에 문을 여는 자동차 수리점은 어디인가요?”",
              "tools": [
                "search_places"
              ],
              "fields": "opening_hours"
            },
            {
              "icon": "map",
              "tag": "매핑",
              "quote": "“GeoJSON으로 좌표를 지정하여 브루클린의 채식 레스토랑을 내보냅니다.”",
              "tools": [
                "search_places"
              ],
              "fields": "latitude · longitude"
            },
            {
              "icon": "globe",
              "tag": "현지화",
              "quote": "“리옹의 빵집을 검색하고 목록 세부정보를 프랑스어로 반환하세요.”",
              "tools": [
                "search_places"
              ],
              "fields": "hl: fr"
            },
            {
              "icon": "check-circle",
              "tag": "청구된 목록",
              "quote": "\"오스틴의 어떤 체육관이 Google 업체 목록을 등록했는지 확인하세요.\"",
              "tools": [
                "search_places"
              ],
              "fields": "claimed"
            },
            {
              "icon": "user",
              "tag": "지역 가이드",
              "quote": "\"지역 가이드에서 가져온 Hawthorne Bean Co.에 대한 최근 리뷰는 무엇인가요?\"",
              "tools": [
                "search_places",
                "list_reviews"
              ],
              "fields": "author_is_local_guide"
            },
            {
              "icon": "trend",
              "tag": "응답 시간",
              "quote": "\"이 미용실은 리뷰에 답변을 합니까? 그리고 소유자의 답변은 얼마나 걸리나요?\"",
              "tools": [
                "list_reviews"
              ],
              "fields": "owner_response_at_ms"
            }
          ]
        ]
      },
      "trust": {
        "kicker": "인증 및 데이터",
        "title": {
          "lead": "한 번 로그인해 보세요. ",
          "accent": "공개 데이터에만 해당됩니다.",
          "tail": ""
        },
        "lead": "MCP 엔드포인트에 대한 모든 호출은 로그인 시 OAuth 토큰, 클라이언트가 로그인할 수 없는 경우 API 키 등 전달자 자격 증명을 전달하며 모든 결과는 Google Maps가 공개적으로 표시하는 내용에서 나옵니다.",
        "inspector": {
          "label": "예: 베어러 Authorization 헤더가 있는 MCP 요청 및 구조화된 콘텐츠가 있는 JSON-RPC 응답",
          "request": "요구",
          "response": "응답",
          "verified": "토큰이 확인되었습니다."
        },
        "items": [
          {
            "icon": "key",
            "title": "로그인하거나 키로 돌아가세요",
            "description": "브라우저를 통해 로그인하고 클라이언트를 승인하세요. MCP 인증이 없는 클라이언트는 대신 API 키를 전달자 토큰으로 전달할 수 있습니다. 둘 다 동일한 도구에 도달합니다."
          },
          {
            "icon": "eye",
            "title": "Google Maps을 읽고 쓰지 않습니다.",
            "description": "이 도구는 공개 목록을 검색하고 읽기만 합니다. 호출이 변경하는 한 가지는 요청 사용입니다."
          },
          {
            "icon": "lock",
            "title": "구성 파일에 비밀이 없습니다",
            "description": "로그인하면 구성에 URL 엔드포인트만 보관됩니다. API 키를 사용하는 경우 공유 파일이 아닌 환경 변수에 보관하세요."
          },
          {
            "icon": "shield",
            "title": "언제든지 액세스 권한을 취소하세요.",
            "description": "로그인한 클라이언트는 대시보드 → API에 나열되며 여기서 이를 취소할 수 있습니다. 새로운 API 키를 생성하면 이전 키가 즉시 비활성화됩니다."
          }
        ]
      },
      "billing": {
        "kicker": "가격",
        "title": {
          "lead": "귀하의 ",
          "accent": "API 계획",
          "tail": "이 보장됩니다"
        },
        "lead": "MCP 서버는 수집 API 및 리뷰 API와 동일한 월별 요청 할당량을 사용합니다. 성공적인 각 도구 호출은 하나의 요청으로 계산됩니다.",
        "compare": "API 요금제 비교",
        "head": {
          "plan": "계획",
          "requests": "월별 요청",
          "scale": "(로그 스케일)",
          "price": "가격"
        }
      },
      "faq": {
        "title": {
          "lead": "",
          "accent": "자주 묻는 질문",
          "tail": ""
        },
        "items": [
          {
            "question": "MapsGrab MCP 서버란 무엇인가요?",
            "answer": "하나의 MCP 연결로 Google Maps 장소를 검색하고 리뷰와 공개 비즈니스 사진 URL을 가져오세요. search_places / list_reviews / list_photos."
          },
          {
            "question": "어떤 클라이언트가 연결할 수 있나요?",
            "answer": "Streamable HTTP를 지원하는 모든 MCP 클라이언트: Claude Code, Cursor, VS Code, Codex, MCP Inspector 및 기타. 후행 슬래시를 포함하여 표시된 대로 정확하게 URL 엔드포인트를 사용하십시오."
          },
          {
            "question": "어떻게 인증되나요?",
            "answer": "OAuth 로그인 사용: Claude Code, Cursor, VS Code, Codex 및 MCP 인증을 지원하는 기타 클라이언트는 브라우저에서 MapsGrab를 엽니다. 클라이언트를 승인하고 나중에 대시보드 → API에서 취소할 수 있습니다. 클라이언트가 로그인할 수 없는 경우에만 API 키를 Authorization 헤더의 전달자 토큰으로 전달하세요."
          },
          {
            "question": "도구 호출은 어떻게 계산되나요?",
            "answer": "사진 일부 반환을 포함해 성공한 호출은 사진 수와 관계없이 요청 1회로 계산합니다. 유효한 사진을 반환할 수 없으면 오류가 발생하며 차감하지 않습니다. 검색, 리뷰, 사진, MCP는 월간 한도를 공유합니다."
          },
          {
            "question": "내 대리인이 비즈니스 사진을 받을 수 있나요?",
            "answer": "list_photos(fid, max_results): 비즈니스의 fid로 공개 사진 URL을 JSON으로 받으세요. max_results는 반환 수의 상한이며, 결과는 일부 사진이므로 전체 앨범을 보장하지 않습니다. 이번 요청의 사진 반환 상한. 양의 정수이며 기본값은 200입니다. 해당 수량을 보장하지 않습니다."
          }
        ]
      },
      "cta": {
        "title": {
          "lead": "에이전트에게 ",
          "accent": "실시간 지도 데이터",
          "tail": "를 제공하세요."
        },
        "lead": "하나의 MCP 연결로 Google Maps 장소를 검색하고 리뷰와 공개 비즈니스 사진 URL을 가져오세요."
      }
    },
    "tools": {
      "common": {
        "crumbRoot": "무료 도구",
        "guide": {
          "kicker": "이 도구 정보",
          "title": {
            "lead": "기능 및 ",
            "accent": "사용 방법",
            "tail": ""
          },
          "lead": "모든 것이 브라우저에서 실행됩니다. 붙여넣거나 업로드하는 어떤 것도 장치 밖으로 나가지 않습니다."
        },
        "related": {
          "kicker": "관련 도구",
          "title": {
            "lead": "",
            "accent": "지도 데이터",
            "tail": "를 위한 추가 무료 도구"
          },
          "lead": "브라우저에서 완전히 실행되는 작은 유틸리티입니다. 붙여넣은 내용은 장치 밖으로 나가지 않습니다. 단, 이메일 검사기는 예외로, 검증을 위해 주소를 당사 서버로 보냅니다."
        },
        "faq": {
          "kicker": "자주 묻는 질문",
          "lead": "짧은 답변. 그 밖의 지원은 이메일 한 번으로 가능합니다.",
          "contact": "지원팀에 문의"
        },
        "cta": {
          "kicker": "대량 추출",
          "primary": "설치 MapsGrab",
          "secondary": "가격 보기",
          "note": "무료 월별 할당량이 포함되어 있습니다. 신용카드가 없습니다."
        },
        "resultHeading": "결과",
        "copy": "복사",
        "copied": "클립보드에 복사되었습니다.",
        "downloadCsv": "다운로드 CSV",
        "genericError": "문제가 발생했습니다. 입력 내용을 확인하고 다시 시도하세요."
      },
      "placeIdFinder": {
        "seo": {
          "title": "Place ID Finder — URL에서 Google Maps Place ID을 얻습니다 | MapsGrab",
          "description": "Google Maps 장소 URL를 붙여넣으면 Place ID, CID 및 FID를 즉시 얻을 수 있습니다. 무료 브라우저 기반 Place ID 찾기 — 로그인이 필요 없으며 URL이 기기를 떠나지 않습니다."
        },
        "hero": {
          "title": {
            "lead": "Place ID ",
            "accent": "파인더",
            "tail": ""
          },
          "description": "전체 Google Maps 장소 URL를 붙여넣고 한 번의 클릭으로 Place ID, CID 및 FID를 읽어보세요. 모든 것은 브라우저에서 디코딩됩니다. URL는 업로드되지 않습니다."
        },
        "form": {
          "urlLabel": "Google Maps 장소 URL",
          "urlPlaceholder": "https://www.google.com/maps/place/…/data=…",
          "submit": "Place ID 찾기",
          "errorShortLink": "짧은 링크(maps.app.goo.gl)는 지원되지 않습니다. 브라우저에서 링크를 열고 주소 표시줄에 전체 URL를 붙여넣으세요.",
          "errorInvalidUrl": "이곳은 Google Maps 장소 URL처럼 보이지 않습니다. Google Maps에서 장소를 열고 전체 URL를 복사하세요(\"/maps/place/\" 및 \"@\" 또는 \"data=\"를 포함해야 함).",
          "errorNoIds": "URL에서는 장소 식별자를 찾을 수 없습니다. 검색결과 페이지가 아닌 장소 페이지의 URL을 복사했는지 확인하세요.",
          "examplesLabel": "노력하다",
          "examples": {
            "city": "샌프란시스코",
            "business": "커피숍 · 포틀랜드",
            "shortLink": "짧은 링크"
          }
        },
        "result": {
          "placeId": "Place ID",
          "cid": "CID",
          "fid": "FID",
          "placeIdNote": "base64url 둘 중 FID 반쪽",
          "cidNote": "FID 2반쪽, 16진수 → 10진수",
          "fidNote": "URL의 마지막 두 0x… 세그먼트",
          "anatomy": {
            "fidHigh": "FID · 1전반",
            "fidLow": "FID · 2후반",
            "empty": "장소 URL를 붙여넣으세요. 해당 장소에 포함된 식별자가 여기에 표시됩니다."
          },
          "missing": "이 링크에는 없습니다",
          "copyLabel": "복사 {label}",
          "privacy": "브라우저에서 디코딩됩니다. URL은 업로드되지 않습니다."
        },
        "chips": [
          {
            "label": "Google API 키",
            "value": "필요하지 않음"
          },
          {
            "label": "당신의 URL",
            "value": "업로드되지 않음"
          }
        ],
        "steps": {
          "head": {
            "kicker": "작동 원리",
            "title": {
              "lead": "지도 링크에서 ",
              "accent": "Place ID",
              "tail": "로"
            },
            "lead": "API 키도 없고 로그인도 없습니다. 식별자는 이미 복사한 장소 URL 내부에 있습니다."
          },
          "items": [
            {
              "heading": "Google Maps에 장소를 엽니다",
              "body": "업체를 검색하고 목록을 클릭하면 장소 페이지가 열립니다."
            },
            {
              "heading": "전체 복사 URL",
              "body": "주소 표시줄에서 긴 URL를 복사하세요. 여기에는 회사 이름, \"@\" 좌표 세그먼트 및 \"data=\" 매개변수가 포함되어 있습니다."
            },
            {
              "heading": "붙여넣기 및 디코딩",
              "body": "위에 붙여넣고 \"찾기 Place ID\"를 누르세요. Place ID, CID 및 FID이 각각 복사 버튼과 함께 나타납니다."
            }
          ],
          "copiedBadge": "복사됨",
          "note": "maps.app.goo.gl과 같은 짧은 링크는 도메인 전체에서 링크를 따르지 않으면 디코딩할 수 없으므로 먼저 링크를 열고 전체 주소를 붙여넣으세요."
        },
        "identifiers": {
          "head": {
            "kicker": "식별자",
            "title": {
              "lead": "ID 3개, ",
              "accent": "한 곳",
              "tail": ""
            },
            "lead": "Place ID은 위치에 대한 Google의 안정적인 식별자입니다. 업체 이름이 바뀌거나 이전하더라도 유효한 \"ChIJ\"로 시작하는 문자열입니다."
          },
          "keys": {
            "placeId": "장소 API, 리뷰 위젯 및 예약 시스템에서 사용되는 \"ChIJ…\" 문자열입니다.",
            "fid": "내부적으로 동일한 기능을 식별하는 16진수 값 쌍입니다.",
            "cid": "FID 후반부의 십진수 형식으로, 이전 지도 URLs 및 광고 도구에서 사용됩니다."
          },
          "derive": {
            "label": "Place ID 및 CID이 FID에서 파생되는 방법",
            "source": "FID에서 URL",
            "protobuf": "protobuf · 리틀 엔디안",
            "base64": "base64url",
            "secondHalf": "2후반",
            "hexToDecimal": "16진수 → 10진수"
          },
          "features": [
            {
              "heading": "API 키 없음",
              "body": "Place ID은 붙여넣은 위치 URL 내부에 이미 인코딩되어 있으므로 도구가 오프라인에서 디코딩할 수 있습니다."
            },
            {
              "heading": "속도 제한 없음",
              "body": "조회 서비스는 포함되지 않습니다. 지도 URL에서 Place ID로의 변환은 결정적입니다."
            },
            {
              "heading": "업로드되지 않음",
              "body": "전체 계산은 브라우저 탭에서 실행됩니다. 붙여넣은 URL은 어떤 서버로도 전송되지 않습니다."
            }
          ]
        },
        "faq": {
          "title": {
            "lead": "",
            "accent": "자주 묻는 질문",
            "tail": ""
          },
          "items": [
            {
              "question": "Place ID이 변경되나요?",
              "answer": "드물게. Google 문서에는 장소 ID가 안정적인 장기 식별자로 사용되지만, 위치가 병합되거나 재구성될 때 소수의 ID가 폐기될 수 있습니다. Place ID 소비자가 유효하지 않은 것으로 보고하면 해당 위치를 다시 찾아 저장된 값을 새로 고치십시오."
            },
            {
              "question": "Place ID은 CID과 동일합니까?",
              "answer": "아니요. CID는 이전 지도 링크 및 광고 도구에서 사용되는 십진수 식별자인 반면, Place ID은 장소 API에서 사용되는 \"ChIJ…\" 문자열입니다. 이는 동일한 기능을 식별하지만 상호 교환이 불가능하므로 이 도구는 두 가지를 모두 보고합니다."
            },
            {
              "question": "내 Maps.app.goo.gl 링크가 거부된 이유는 무엇입니까?",
              "answer": "짧은 링크는 도메인 간 리디렉션 후에만 전체 위치 URL로 확인되며, 브라우저 전용 도구는 링크를 제3자에게 보내지 않고는 따라갈 수 없습니다. 브라우저에서 짧은 링크를 열고 주소 표시줄에 나타나는 전체 URL를 붙여넣으세요."
            },
            {
              "question": "이를 위해 Google API 키가 필요합니까?",
              "answer": "아니요. Place ID는 붙여넣은 위치 URL 내부에 이미 인코딩되어 있으므로 도구가 오프라인에서 디코딩할 수 있습니다. Google API 키는 나중에 해당 ID로 Places API를 호출하려는 경우에만 필요합니다."
            }
          ]
        },
        "cta": {
          "title": {
            "lead": "대규모 장소 ID ",
            "accent": "가 필요하십니까?",
            "tail": ""
          },
          "lead": "MapsGrab는 수집한 모든 비즈니스에 대해 33 다른 열과 함께 Place ID, CID 및 FID을 추출하고 CSV 또는 JSON로 바로 내보냅니다."
        }
      },
      "reviewLinkGenerator": {
        "seo": {
          "title": "Google 리뷰 링크 생성기 — 무료 직접 리뷰 URL | MapsGrab",
          "description": "Google Maps 장소 URL를 고객과 공유할 수 있는 직접 Google 리뷰 링크로 전환하세요. 무료이며 브라우저 기반이며 아무것도 업로드되지 않습니다."
        },
        "hero": {
          "title": {
            "lead": "Google 리뷰 링크 ",
            "accent": "생성기",
            "tail": ""
          },
          "description": "Google Maps 장소 URL를 붙여넣고 해당 업체에 대한 직접 \"리뷰 작성\" 링크를 얻으세요. 이는 행복한 고객이 Google 리뷰를 작성하는 최단 경로입니다."
        },
        "form": {
          "urlLabel": "Google Maps 장소 URL",
          "urlPlaceholder": "https://www.google.com/maps/place/…/data=…",
          "submit": "리뷰 링크 생성",
          "errorShortLink": "짧은 링크(maps.app.goo.gl)는 지원되지 않습니다. 브라우저에서 링크를 열고 주소 표시줄에 전체 URL를 붙여넣으세요.",
          "errorInvalidUrl": "이곳은 Google Maps 장소 URL처럼 보이지 않습니다. Google Maps에서 장소를 열고 전체 URL를 복사하세요(\"/maps/place/\" 및 \"@\" 또는 \"data=\"를 포함해야 함).",
          "errorNoIds": "URL에서는 장소 식별자를 찾을 수 없습니다. 검색결과 페이지가 아닌 장소 페이지의 URL을 복사했는지 확인하세요."
        },
        "result": {
          "linkLabel": "링크 리뷰",
          "open": "열려 있는"
        },
        "howTo": [
          {
            "heading": "Google 리뷰 링크란 무엇인가요?",
            "body": "리뷰 링크는 Google에서 특정 업체의 리뷰 대화 상자를 여는 바로가기입니다. 고객에게 귀하의 업체를 검색하라고 요청하는 대신 리뷰 섹션으로 스크롤한 다음 '리뷰 작성'을 누르세요. 그러면 리뷰 양식에 바로 표시되는 URL — search.google.com/local/reviews?placeid=… 리뷰를 보내세요. 기업에서는 후속 이메일, 카운터의 QR 코드, 거래 후 SMS 메시지에 이러한 링크를 넣습니다."
          },
          {
            "heading": "리뷰 링크를 생성하는 방법",
            "body": "Google Maps을 열고 업체를 찾은 후 장소 페이지를 엽니다. 주소 표시줄에서 긴 URL를 복사하여 위에 붙여넣으세요. \"리뷰 링크 생성\"을 누르면 도구가 인코딩된 장소 ID로 직접 링크를 생성하여 복사하거나 열 수 있습니다. 링크는 보편적입니다. 데스크톱 브라우저와 Google Maps 모바일 앱에서 작동합니다."
          },
          {
            "heading": "장소 ID의 출처",
            "body": "이 도구는 Place ID Finder와 동일한 로컬 디코딩을 재사용합니다. 식별자는 이미 지도 URL에 있으며 \"ChIJ…\" 형식으로의 변환은 전적으로 브라우저에서 발생합니다. 여러 위치를 관리하는 경우 위치별로 프로세스를 반복하거나 모든 내보내기에서 MapsGrab에 Place ID 열을 전달하여 스프레드시트에서 리뷰 링크가 대량으로 생성될 수 있도록 하세요."
          }
        ],
        "faq": {
          "title": {
            "lead": "",
            "accent": "자주 묻는 질문",
            "tail": ""
          },
          "items": [
            {
              "question": "리뷰 링크가 만료되나요?",
              "answer": "아니요. 링크는 해당 위치의 장소 ID에 연결되어 있어 Google 안정적으로 유지됩니다. 장소가 Google Maps에 존재하는 한 링크는 리뷰 대화상자를 계속 엽니다."
            },
            {
              "question": "여러 위치에 대해 하나의 링크를 사용할 수 있습니까?",
              "answer": "각 리뷰 링크는 정확히 한 장소에 속합니다. 위치별로 별도의 링크를 생성합니다. 여러 위치에 있는 기업은 일반적으로 장소 ID 테이블을 유지하고 여기에서 링크를 파생합니다."
            },
            {
              "question": "링크를 사용하여 리뷰를 요청하는 것이 허용됩니까?",
              "answer": "고객에게 솔직한 리뷰를 요청하는 것은 괜찮습니다. 인센티브를 제공하거나 리뷰를 필터링하는 것은 아닙니다. Google의 정책은 리뷰에 대한 보상 및 리뷰 제한을 금지합니다. 모든 고객에게 동일한 링크를 보내고 피드백이 스스로를 대변하도록 하십시오."
            },
            {
              "question": "내 링크가 리뷰 양식 대신 검색 페이지를 여는 이유는 무엇입니까?",
              "answer": "이는 링크의 장소 ID가 잘못된 경우에 발생합니다. 일반적으로 수동으로 편집한 URL의 결과입니다. 원래 지도 장소 URL에서 링크를 다시 생성하고 Place ID가 \"ChIJ\"로 시작하는지 확인하세요."
            }
          ]
        },
        "cta": {
          "title": {
            "lead": "",
            "accent": "획득",
            "tail": "한 모든 리뷰를 추적하세요."
          },
          "lead": "MapsGrab는 평가, 텍스트, 날짜, 소유자 답변 등 모든 비즈니스 페이지의 리뷰를 가져오므로 피드백을 확인하고 더 빠르게 답변할 수 있습니다."
        }
      },
      "emailChecker": {
        "seo": {
          "title": "이메일 검사기 — 이메일 주소 무료 검증 | MapsGrab",
          "description": "이메일 주소가 메일을 받을 수 있는지 확인하세요. 무료 이메일 검사기가 메일 서버에 직접 확인해 상태, 전송 가능 여부, MX 레코드, 계정 유형을 알려 줍니다."
        },
        "hero": {
          "title": {
            "lead": "이메일 ",
            "accent": "체커",
            "tail": ""
          },
          "description": "이메일 주소를 입력하면 해당 메일 서버에 실제로 메일을 받을 수 있는지 확인하고 상태, MX 레코드, 계정 유형과 점수를 보여 줍니다."
        },
        "guideLead": "형식 검사는 브라우저에서 이루어지며, 주소 자체는 메일 서버 검증을 위해 저희 서버로 전송됩니다.",
        "form": {
          "emailLabel": "이메일 주소",
          "emailPlaceholder": "name@example.com",
          "submit": "이메일 확인",
          "submitting": "확인 중…",
          "verifyingHint": "메일 서버에 확인하는 중입니다. 최대 1분 정도 걸릴 수 있습니다.",
          "invalidHeading": "이 이메일 주소에 문제가 있습니다:",
          "issues": {
            "empty": "먼저 이메일 주소를 입력하세요.",
            "multipleAt": "주소에 \"@\" 기호가 두 개 이상 포함되어 있습니다.",
            "missingAt": "주소에 도메인과 로컬 부분을 구분하는 \"@\"이 없습니다.",
            "localEmpty": "\"@\" 앞 부분은 비어있습니다.",
            "localTooLong": "\"@\" 앞 부분이 이메일 표준에서 허용하는 64 문자보다 깁니다.",
            "localInvalidChars": "\"@\" 앞 부분에는 이메일 주소에 허용되지 않는 문자(공백, 따옴표 또는 제어 문자)가 포함되어 있습니다.",
            "localDotPosition": "로컬 부분의 점은 첫 번째, 마지막 또는 두 번 연속으로 나타날 수 없습니다.",
            "domainEmpty": "\"@\" 뒤의 부분은 비어있습니다.",
            "domainNoTld": "도메인에는 끝이 없습니다(TLD). \".com\" 또는 \".org\"와 같은 이름을 추가하세요.",
            "domainInvalidChars": "도메인에 허용되지 않는 문자(공백, 밑줄 또는 기호)가 포함되어 있습니다.",
            "domainLabelHyphen": "도메인 라벨은 하이픈으로 시작하거나 끝날 수 없습니다.",
            "domainEmptyLabel": "도메인에는 두 개의 점이 연속으로 포함되어 있거나 빈 세그먼트가 포함되어 있습니다.",
            "domainTooLong": "도메인이 이메일 표준에서 허용하는 253자를 초과합니다.",
            "typoDomain": "이 도메인은 유명한 메일 제공업체의 오타처럼 보입니다."
          }
        },
        "result": {
          "labels": {
            "status": "상태",
            "deliverable": "전송 가능",
            "mxRecords": "MX 레코드",
            "email": "이메일 주소",
            "domain": "도메인",
            "accountType": "계정 유형",
            "catchAll": "캐치올 도메인",
            "score": "점수"
          },
          "statuses": {
            "safe": "안전",
            "invalid": "유효하지 않음",
            "disabled": "비활성화됨",
            "disposable": "일회용",
            "inbox_full": "받은편지함 가득 참",
            "catch_all": "캐치올",
            "role_account": "역할 계정",
            "spamtrap": "스팸 트랩",
            "unknown": "알 수 없음"
          },
          "accountTypes": {
            "standard": "일반",
            "role": "역할 계정",
            "disposable": "일회용",
            "free": "무료 이메일"
          },
          "yes": "예",
          "no": "아니요",
          "noMx": "찾을 수 없음",
          "unavailable": "검증 서비스에 연결할 수 없습니다. 잠시 후 다시 시도해 주세요.",
          "rateLimited": "오늘 무료 검증 횟수를 모두 사용했습니다. 내일 다시 시도해 주세요."
        },
        "howTo": [
          {
            "heading": "이 검사기가 확인하는 내용",
            "body": "수신 측 메일 서버에 해당 사서함이 존재하고 메일을 받는지 묻습니다. 발신 서버가 전송 전에 확인하는 방식과 같으며, 실제로 메일을 보내지는 않습니다. 결과에는 전체 상태, 전송 가능 여부, 도메인의 MX 레코드, 계정 유형(일반, info@나 sales@ 같은 역할 계정, 일회용, 무료 이메일), 도메인의 캐치올 여부, 0~100점의 점수가 표시됩니다."
          },
          {
            "heading": "이메일 주소를 확인하는 방법",
            "body": "주소 하나를 입력하거나 붙여넣고 \"이메일 확인\"을 누르세요. 형식 문제는 브라우저에서 바로 표시되며 해당 주소는 전송되지 않습니다. \"gmial.com\"처럼 유명 제공업체 도메인의 오타로 보이면 알려 드리지만 검증은 그대로 진행됩니다. 형식이 올바른 주소는 저희 서버로 전송되어 메일 서버에서 확인되며, 보통 몇 초, 길게는 1분 정도 걸립니다."
          },
          {
            "heading": "결과 읽는 법",
            "body": "\"안전\"은 사서함이 존재하고 메일을 받는다는 뜻입니다. \"유효하지 않음\"과 \"비활성화됨\" 주소는 반송되며, \"스팸 트랩\"에는 절대 보내면 안 됩니다. 캐치올 도메인은 모든 주소를 받기 때문에 사서함 자체를 확인할 수 없습니다. 역할 계정, 일회용 주소, 받은편지함이 가득 찬 주소는 영업 연락에 위험합니다. \"알 수 없음\"은 메일 서버가 명확한 답을 주지 않았다는 뜻이니 나중에 다시 시도하세요. MapsGrab은 각 업체의 공식 웹사이트에서 이메일 주소를 수집하며, 연락하기 전에 이 검사기로 빠르게 확인할 수 있습니다."
          }
        ],
        "faq": {
          "title": {
            "lead": "",
            "accent": "자주 묻는 질문",
            "tail": ""
          },
          "items": [
            {
              "question": "이 도구는 사서함이 실제로 존재하는지 확인하나요?",
              "answer": "네. 형식뿐 아니라 수신 측 메일 서버에 해당 주소로 오는 메일을 받는지 확인하며, 실제로 메일을 보내지는 않습니다. 캐치올 도메인처럼 서버가 명확한 답을 주지 않으면 추측하지 않고 그대로 표시합니다."
            },
            {
              "question": "몇 개까지 확인할 수 있나요?",
              "answer": "하루 5개까지 무료로, 한 번에 하나씩 확인할 수 있습니다. 형식 검사를 통과하지 못한 주소는 전송되지 않으므로 횟수에 포함되지 않습니다."
            },
            {
              "question": "여기서 통과해도 반송될 수 있나요?",
              "answer": "네. 확인 후에 사서함이 폐쇄되거나 가득 찰 수 있고, 일단 메일을 받은 뒤 나중에 반송하는 서버도 있습니다. \"안전\"은 확인 시점에 메일을 받았다는 뜻일 뿐, 누군가 읽는다는 보장은 아닙니다."
            },
            {
              "question": "\"name@localhost\"는 왜 거부되나요?",
              "answer": "검사기는 공개 최상위 도메인(TLD)이 있는 도메인을 요구합니다. TLD가 없는 주소는 외부 인터넷에서 메일을 받을 수 없기 때문입니다. 이런 주소는 브라우저에서 바로 표시되며 검증을 위해 전송되지 않습니다."
            },
            {
              "question": "입력한 이메일 주소는 어떻게 처리되나요?",
              "answer": "저희 서버로 전송되며, 저희가 이용하는 이메일 검증 서비스가 수신 측 메일 서버에 확인합니다. 해당 주소로 메일이 발송되지는 않습니다."
            }
          ]
        },
        "cta": {
          "title": {
            "lead": "",
            "accent": "확인",
            "tail": " 가치가 있는 이메일을 수집하세요"
          },
          "lead": "MapsGrab은 추출한 모든 비즈니스의 이메일 주소와 소셜 프로필을 각 비즈니스의 자체 웹사이트에서 직접 찾습니다."
        }
      },
      "latLongToDms": {
        "seo": {
          "title": "위도 경도를 DMS로 변환 — 십진수 도를 도 분 초로 변환 | MapsGrab",
          "description": "십진수 위도와 경도를 도, 분, 초(DMS) 형식으로 즉시 변환합니다. 무료 브라우저 기반 좌표 변환기, 아무것도 업로드되지 않았습니다."
        },
        "hero": {
          "title": {
            "lead": "위도 경도를 ",
            "accent": "DMS",
            "tail": "로 변환"
          },
          "description": "십진수 위도와 경도를 입력하고 동일한 좌표를 도, 분, 초 단위로 읽습니다. 반구 문자로 복사할 수 있습니다."
        },
        "form": {
          "latitudeLabel": "위도(십진수, -90 ~ 90)",
          "longitudeLabel": "경도(십진수, -180 ~ 180)",
          "placeholder": "37.774929",
          "submit": "DMS로 변환",
          "errorLatitude": "위도는 -90에서 90 사이의 숫자여야 합니다.",
          "errorLongitude": "경도는 -180에서 180 사이의 숫자여야 합니다."
        },
        "result": {
          "dms": "DMS의 좌표"
        },
        "howTo": [
          {
            "heading": "십진수 도수와 DMS은 무엇인가요?",
            "body": "지도와 스프레드시트는 좌표를 소수점 각도(37.774929, -122.419416와 같이 축당 하나의 부호 있는 숫자)로 저장합니다. 측량, 해양 차트 및 많은 자산 문서는 37° 46' 29.74\" N, 122° 25' 9.90\" W와 같은 반구 문자와 함께 도, 분, 초 등 오래된 60진수 표기법을 사용합니다. 둘 다 동일한 점을 설명합니다. DMS 형식은 분수를 연속적으로 작은 단위로 나누는 것입니다. 여기서 1분은 1/60도이고 1초는 1/60분입니다."
          },
          {
            "heading": "변환 방법",
            "body": "소수점 위도와 경도를 붙여넣고 \"DMS로 변환\"을 누르세요. 음수 값은 남반구와 서반구에 매핑되며 S와 W로 보고됩니다. 초는 소수점 두 자리로 표시됩니다. 이는 일반 소비자 GPS 캡처보다 더 정확한 지상 해상도 약 1미터입니다. 결과를 문서의 경우 한 줄로 복사하거나 스프레드시트의 경우 별도의 필드로 복사합니다."
          },
          {
            "heading": "이것이 지도 데이터 작업에 중요한 이유",
            "body": "좌표 왕복은 도구 간에 비즈니스 데이터를 이동할 때 일상적인 마찰 지점입니다. Google Maps은 소수점을 내보내는 반면 지적 및 인쇄 작업 흐름에서는 DMS을 기대합니다. MapsGrab는 이러한 마찰을 규모에 맞게 낮게 유지합니다. 추출된 모든 비즈니스는 이미 내보내기에서 위도와 경도를 전달하며 일괄 좌표 변환은 이 페이지에서 사용하는 것과 동일한 공식을 사용하여 오프라인에서 실행할 수 있습니다."
          }
        ],
        "faq": {
          "title": {
            "lead": "",
            "accent": "자주 묻는 질문",
            "tail": ""
          },
          "items": [
            {
              "question": "DMS 결과는 얼마나 정확합니까?",
              "answer": "초는 소수점 이하 두 자리까지 표시됩니다. 위도 1초는 대략 30미터이므로 소수 두 자리는 약 30센티미터로 해석됩니다. 이는 기본 GPS 데이터보다 훨씬 더 정확합니다. 정밀도는 변환이 아닌 입력에 의해 제한됩니다."
            },
            {
              "question": "여기서 N, S, E, W는 무엇을 의미하나요?",
              "answer": "이는 소수점 값의 부호를 대체합니다. 양의 위도는 북쪽(N)이고 음의 위도는 남쪽(S)입니다. 양의 경도는 동쪽(E)이고 음의 경도는 서쪽(W)입니다. 이 도구는 표지판에서 문자를 자동으로 선택합니다."
            },
            {
              "question": "여기서 DMS을 다시 십진수로 변환할 수 있나요?",
              "answer": "예. 이 사이트의 \"DMS을 DD로 변환\" 도구를 사용하세요. 동일한 구현으로 두 가지 방법을 모두 변환하면 서로 다른 수식 간의 반올림 드리프트를 피할 수 있습니다."
            },
            {
              "question": "내 좌표 데이터가 업로드되나요?",
              "answer": "아니요. 변환은 브라우저 탭에서 일반 산술적으로 수행됩니다. 당신이 입력하는 어떤 것도 페이지를 떠나지 않습니다."
            }
          ]
        },
        "cta": {
          "title": {
            "lead": "모든 업체의 좌표는 이미 ",
            "accent": "추출됨",
            "tail": ""
          },
          "lead": "MapsGrab은 내보내는 각 행에 위도와 경도를 기록합니다. 다음 라우팅 또는 지역 프로젝트에 대한 수동 좌표 조회가 없습니다."
        }
      },
      "dmsToDd": {
        "seo": {
          "title": "DMS을 DD로 변환 — 도 분 초를 십진수 도으로 변환 | MapsGrab",
          "description": "도, 분, 초 좌표를 즉시 십진수로 변환합니다. 무료 브라우저 기반 DMS-DD 변환기, 아무것도 업로드되지 않았습니다."
        },
        "hero": {
          "title": {
            "lead": "DMS를 DD ",
            "accent": "(위도, 경도)",
            "tail": "로 변환"
          },
          "description": "두 축 모두에 대해 도, 분, 초를 입력하고 깨끗한 십진수 도를 얻으세요. 형식 Google Maps, 스프레드시트 및 MapsGrab이 이해됩니다."
        },
        "form": {
          "latitudeHeading": "위도(N/S)",
          "longitudeHeading": "경도(E/W)",
          "degreesLabel": "학위",
          "minutesLabel": "각분",
          "secondsLabel": "각초",
          "latitudeHemisphereLabel": "N / S",
          "longitudeHemisphereLabel": "E / W",
          "submit": "십진수로 변환",
          "errorValues": "도는 0 또는 양의 정수여야 하며, 분과 초는 0에서 60 사이여야 합니다."
        },
        "result": {
          "dd": "십진수 좌표"
        },
        "howTo": [
          {
            "heading": "DMS을 다시 십진수로 변환하는 이유는 무엇입니까?",
            "body": "도-분-초는 인간이 사용하는 표기법이지만 거의 모든 기계를 사용하는 시스템에서는 Google Maps 검색, GIS 가져오기, 스프레드시트 거리 공식 및 지오코딩 파이프라인과 같은 십진수 도를 원합니다. 변환은 기호를 결정하는 반구 문자를 사용하여 도 더하기 분을 60로 더하기 초를 3600로 나누는 간단한 가중 합계입니다."
          },
          {
            "heading": "변환 방법",
            "body": "위도와 경도에 대한 도, 분, 초를 입력하고 반구 문자(N/S 및 E/W)를 선택합니다. \"십진수로 변환\"을 누르면 도구는 두 축을 소수점 6자리의 부호 있는 십진수로 출력합니다. 이는 지상에서 약 11센티미터로 해석됩니다. 이는 모든 사업장에서 사용하기에 충분한 수치입니다. 결과를 Google Maps 또는 스프레드시트에 직접 붙여넣으세요."
          },
          {
            "heading": "좌표 데이터의 일관성 유지",
            "body": "혼합된 표기법은 수입 후 위치가 잘못된 바다에 빠지게 되는 일반적인 이유입니다. 소수점 이하도를 한 번 결정하고 경계의 모든 것을 변환하면 파이프라인이 정상적으로 유지됩니다. MapsGrab은 이미 십진수 단위로 좌표를 내보내므로 확장 프로그램으로 수집된 데이터는 변환 단계 없이 GIS 및 BI 도구에 저장됩니다."
          }
        ],
        "faq": {
          "title": {
            "lead": "",
            "accent": "자주 묻는 질문",
            "tail": ""
          },
          "items": [
            {
              "question": "소수점 이하 몇 자리가 필요합니까?",
              "answer": "소수점 이하 6자리는 소비자 GPS의 정확도를 넘어서 대략 11센티미터로 분해됩니다. 사업장 위치로는 5곳(약 1미터)이면 충분합니다. 소수점 이하의 숫자는 의도적으로 요점을 흐리게 합니다."
            },
            {
              "question": "필드는 어떤 범위를 충족해야 합니까?",
              "answer": "분과 초의 범위는 0부터 60 미만입니다. 위도는 최대 90까지, 경도는 최대 180까지 도달합니다. 변환기는 값이 지구 외부에 도달할 때 이를 보고합니다."
            },
            {
              "question": "S나 W를 선택할 때 음수를 입력해야 하나요?",
              "answer": "아니요 - 반구 문자가 이미 기호를 인코딩합니다. 부호 있는 값과 충돌하는 문자를 동시에 입력하면 도구는 추측하는 대신 모순에 플래그를 지정합니다."
            },
            {
              "question": "변환이 서버에서 수행됩니까?",
              "answer": "아니요. 수식은 브라우저에서 실행됩니다. 당신이 입력하는 어떤 것도 어디에도 전송되지 않습니다."
            }
          ]
        },
        "cta": {
          "title": {
            "lead": "수동 좌표 작업 건너뛰기 ",
            "accent": "규모",
            "tail": ""
          },
          "lead": "MapsGrab은 수집하는 모든 비즈니스의 십진수 위도와 경도를 주소, 전화번호 및 Place ID 열 옆에 내보냅니다."
        }
      },
      "bulkKeywords": {
        "seo": {
          "title": "대량 키워드 생성기 — 키워드 + 위치 조합 | MapsGrab",
          "description": "로컬 SEO 및 지도 스크래핑 작업을 위해 키워드 및 위치 조합을 대량으로 생성합니다. 두 개의 목록을 붙여넣고 모든 조합을 얻은 다음 CSV로 다운로드하세요. 무료."
        },
        "hero": {
          "title": {
            "lead": "대량 키워드 ",
            "accent": "생성기",
            "tail": ""
          },
          "description": "키워드와 위치를 붙여넣고 모든 '키워드 + 위치' 조합을 바로 붙여넣을 수 있는 목록 또는 CSV으로 가져오세요. 이는 지역 검색 캠페인을 시작하는 가장 빠른 방법입니다."
        },
        "form": {
          "keywordsLabel": "키워드(한 줄에 하나씩)",
          "keywordsPlaceholder": "디자인 에이전시\n커피숍\n배관공",
          "locationsLabel": "위치(한 줄에 하나씩)",
          "locationsPlaceholder": "New York\n시카고\n오스틴",
          "orderLabel": "조합 순서",
          "keywordFirst": "키워드 + 위치 (디자인 에이전시 New York)",
          "locationFirst": "위치 + 키워드 (New York 디자인 에이전시)",
          "submit": "조합 생성",
          "resultCount": "{count} 조합이 생성되었습니다.",
          "errorKeywords": "키워드를 하나 이상 추가하세요.",
          "errorLocations": "위치를 하나 이상 추가하세요."
        },
        "howTo": [
          {
            "heading": "대량 키워드 생성이란 무엇입니까?",
            "body": "지역 검색 캠페인은 귀하가 서비스를 제공하는 모든 도시, 지역 또는 동네에서 동일한 서비스가 반복되는 조합으로 진행됩니다. 10개 위치의 10개 키워드는 \"디자인 에이전시 New York\", \"디자인 에이전시 시카고\" 등 100개의 검색 문구입니다. 손으로 작성하는 것은 오류가 발생하기 쉽습니다. 두 목록에서 생성하는 데 몇 초가 걸리며 누락된 항목이 없음을 보장합니다."
          },
          {
            "heading": "조합을 생성하는 방법",
            "body": "첫 번째 상자에 키워드를 한 줄에 하나씩 붙여넣고 두 번째 상자에 위치를 붙여넣습니다. 키워드가 먼저 나올지, 위치가 먼저 나올지 선택한 후 '생성'을 누르세요. 모든 키워드는 모든 위치와 쌍을 이루고 빈 줄과 중복 항목은 제거되며 전체 목록은 개수와 함께 아래에 표시됩니다. Google 광고 키워드 목록, Google 동향 확인 또는 지도 스크래핑 작업 대기열에 바로 복사하세요."
          },
          {
            "heading": "키워드 목록부터 수집된 데이터까지",
            "body": "일반적인 다음 단계는 각 조합을 Google Maps 검색으로 실행하고 결과를 수집하는 것입니다. 이 루프는 바로 MapsGrab이 자동화하는 것입니다. 확장 프로그램은 키워드 목록을 일괄 작업으로 받아들이고, 검색을 하나씩 진행하고, 찾은 모든 비즈니스를 내보냅니다. 따라서 여기에서 생성한 조합은 수동으로 복사하지 않고도 구조화된 행이 됩니다."
          }
        ],
        "faq": {
          "title": {
            "lead": "",
            "accent": "자주 묻는 질문",
            "tail": ""
          },
          "items": [
            {
              "question": "얼마나 많은 조합을 생성할 수 있나요?",
              "answer": "브라우저가 보유할 수 있는 만큼 — 도구는 두 목록을 곱하고 로컬에서 중복을 제거합니다. 10,000개의 조합은 괜찮습니다. 매우 큰 배치의 경우 CSV 다운로드가 텍스트 영역을 복사하는 것보다 더 실용적입니다."
            },
            {
              "question": "중복이 제거되나요?",
              "answer": "예. 각 목록 내의 중복 행은 페어링 전에 삭제되며 출력에는 선택한 순서대로 각 키워드-위치 쌍이 정확히 한 번씩 포함됩니다."
            },
            {
              "question": "어떤 순서를 사용해야 합니까?",
              "answer": "둘 다 실제 검색 행동입니다. \"Plumber Austin\"은 사람들이 지도에 입력하는 방식과 비슷합니다. \"오스틴 배관공\"은 전통적인 SEO 문구처럼 읽혀집니다. 두 가지 주문을 모두 생성하는 것은 검색 변형을 다루는 일반적인 방법입니다."
            },
            {
              "question": "구/군/우편번호를 위치로 사용할 수 있나요?",
              "answer": "예. 지역, 우편번호, 대도시 지역 또는 전체 '도시, 주' 쌍 등 지도 검색 접미사로 의미 있는 모든 것이 작동합니다. 위치당 한 줄입니다."
            }
          ]
        },
        "cta": {
          "title": {
            "lead": "키워드 목록을 ",
            "accent": "결과",
            "tail": "로 전환"
          },
          "lead": "MapsGrab 일괄 작업은 모든 키워드를 지도 검색으로 실행하고 그 뒤에 있는 비즈니스(CSV 또는 JSON)를 리뷰, 사진 및 연락처 강화와 함께 내보냅니다."
        }
      },
      "mergeCsv": {
        "seo": {
          "title": "온라인으로 CSV 파일 병합 — 여러 CSV 파일 무료 결합 | MapsGrab",
          "description": "온라인에서 여러 개의 CSV 파일을 하나의 파일로 병합합니다. 열 헤더는 무료, 비공개 및 완전한 브라우저 기반 통합 방식으로 자동 정렬됩니다."
        },
        "hero": {
          "title": {
            "lead": "CSV 파일 ",
            "accent": "온라인",
            "tail": " 병합"
          },
          "description": "두 개 이상의 CSV 파일을 업로드하고 병합된 단일 파일을 다운로드하세요. 열은 헤더를 기준으로 정렬됩니다. 누락된 필드는 비어 있습니다. 파일은 브라우저를 떠나지 않습니다."
        },
        "form": {
          "filesLabel": "CSV 파일",
          "filesHint": "두 개 이상의 .csv 파일을 선택합니다. 해당 행을 건너뛰려면 2 행에서 번역된 라벨이 있는 각 파일을 확인하세요. 병합된 CSV은 하나의 필드 이름 헤더 행을 유지합니다. 파일은 브라우저에 남아 있습니다.",
          "translationRow": "{name}에서 행 2(번역된 라벨) 건너뛰기",
          "submit": "파일 병합",
          "errorNoFiles": "병합할 CSV 파일을 2개 이상 선택하세요.",
          "errorEmptyFile": "파일 중 하나가 비어 있거나 헤더 행이 없습니다: {name}",
          "fileSummary": "{name} — {rows} 데이터 행",
          "resultSummary": "{files} 파일을 {rows} 행 × {columns} 열로 병합했습니다.",
          "previewLabel": "병합됨 CSV 미리보기"
        },
        "howTo": [
          {
            "heading": "여기서 병합은 무엇을 합니까?",
            "body": "여러 개의 CSV 내보내기 스택을 하나의 테이블로 병합합니다. 열은 모든 파일에서 헤더 이름을 기준으로 정렬되고 모든 데이터 행은 해당 값을 일치하는 헤더 아래에 유지합니다. 파일은 선택한 순서대로 위에서 아래로 결합되므로 결과는 하나의 연속 데이터 세트로 읽혀집니다. 일부 파일에만 존재하는 열은 출력에 유지됩니다. 헤더가 없는 파일의 행은 모든 헤더의 통합인 빈 셀을 얻습니다."
          },
          {
            "heading": "CSV 파일을 병합하는 방법",
            "body": "2개 이상의 .csv 파일을 선택합니다(예: 지도 스크랩 작업 흐름의 주간 내보내기). \"파일 병합\"을 누르면 도구가 브라우저의 모든 파일을 구문 분석하고 각 파일의 행 수를 보고하며 병합된 테이블을 작성합니다. Excel, Google 스프레드시트 또는 기타 데이터베이스 가져오기에서 깔끔하게 열리는 단일 CSV로 다운로드하세요."
          },
          {
            "heading": "다중 실행 데이터 수집을 위해 제작됨",
            "body": "일반적인 사용 사례는 실행을 추가하는 것입니다. 각 MapsGrab 추출 세션은 자체 CSV을 내보내고, 병합하면 중복 제거 및 정리 전에 해당 주의 세션을 하나의 데이터 세트로 가져옵니다. 파서는 인용된 필드, 포함된 쉼표 및 셀 내부의 줄 바꿈(RFC 4180)을 처리하므로 여러 줄 주소로 내보내기 또는 리뷰 조각이 올바르게 병합됩니다."
          }
        ],
        "faq": {
          "title": {
            "lead": "",
            "accent": "자주 묻는 질문",
            "tail": ""
          },
          "items": [
            {
              "question": "파일에 다른 열이 있으면 어떻게 되나요?",
              "answer": "병합된 파일에는 처음 나타나는 순서대로 모든 헤더의 통합이 포함됩니다. 열이 없는 파일의 행은 해당 열에 빈 셀을 갖습니다. 삭제되거나 이름이 변경된 항목은 없습니다."
            },
            {
              "question": "내 파일이 서버에 업로드되나요?",
              "answer": "아니요. 파일은 브라우저의 FileReader API로 읽혀지고 탭의 메모리에 병합됩니다. 아무 것도 전송되지 않으며 페이지를 닫으면 모든 내용이 지워집니다."
            },
            {
              "question": "병합하면 중복 행이 제거되나요?",
              "answer": "아니요 - 병합은 정렬된 열을 직선으로 연결하는 것입니다. 중복 제거(예: Place ID)는 병합된 파일에 대해 실행하는 별도의 정리 단계입니다."
            },
            {
              "question": "파일 크기는 얼마나 됩니까?",
              "answer": "한도는 고정된 숫자가 아니라 브라우저 탭의 메모리입니다. 수천 행에서 수십만 행에 이르는 일반적인 비즈니스 데이터 내보내기의 경우 병합이 즉시 이루어집니다. 매우 큰 파일의 경우 일괄적으로 병합합니다."
            }
          ]
        },
        "cta": {
          "title": {
            "lead": "실행당 하나의 내보내기 — 또는 ",
            "accent": "하나의 데이터세트",
            "tail": ""
          },
          "lead": "MapsGrab은 필드 선택 및 Place ID 중복 제거를 통해 세션당 깨끗한 CSV/JSON을 내보냅니다. 따라서 다중 실행 데이터세트는 이미 거의 병합되기 시작합니다."
        }
      }
    }
  }
}

export const company: CompanyContent = {
  "footerGroupLabel": "회사",
  "about": {
    "navLabel": "에 대한",
    "seoTitle": "약 MapsGrab | 제품과 경계",
    "seoDescription": "MapsGrab은 브라우저 확장, 클라우드 온라인 스크레이퍼, API 및 MCP 서버, 무료 웹 도구 등 공공 비즈니스 데이터를 위한 지도 데이터 도구 키트입니다. 데이터 경계가 어디에 있는지 알아보세요.",
    "hero": {
      "eyebrow": "약 MapsGrab",
      "title": {
        "lead": "지도 데이터, ",
        "accent": "직접",
        "tail": " 방식으로 확보"
      },
      "intro": "MapsGrab은 Google Maps에서 공개적으로 사용 가능한 비즈니스 정보를 수집하여 이를 깨끗하고 구조화된 데이터로 변환하는 도구를 구축합니다. Edge 및 Firefox, 클라우드 기반 온라인 스크레이퍼, API 및 MCP 서버용 브라우저 확장 프로그램과 대부분이 브라우저에서 완전히 실행되는 무료 웹 도구입니다.",
      "contactLabel": "지원팀에 문의",
      "extensionLabel": "확장 프로그램 살펴보기",
      "stageLabel": "조기 액세스",
      "updatedLabel": "게시 및 검토됨",
      "updatedAt": "8월 31, 2026",
      "chips": [
        {
          "label": "수집",
          "value": "공개 데이터만"
        },
        {
          "label": "확장 결과",
          "value": "브라우저에서"
        },
        {
          "label": "내보내기",
          "value": "CSV · JSON"
        }
      ],
      "dragHint": "드래그하여 회전"
    },
    "build": {
      "kicker": "우리가 만드는 것",
      "title": {
        "lead": "하나의 툴킷, ",
        "accent": "4가지",
        "tail": " 방법"
      },
      "lead": "브라우저 확장 프로그램, 클라우드 기반 온라인 스크레이퍼 또는 API을 선택하세요. 확장 프로그램은 귀하의 브라우저 내에서 작동합니다. 온라인 스크레이퍼와 API은 하나의 클라우드 엔진을 공유하고, MCP 서버는 API을 AI 에이전트에 제공합니다.",
      "hub": {
        "title": "MapsGrab 데이터 툴킷",
        "detail": "비즈니스 데이터 · 리뷰 · 사진 · 이메일 및 소셜 강화"
      },
      "tags": {
        "extension": [
          "36-열 추출",
          "리뷰 및 사진",
          "일괄 작업"
        ],
        "online": [
          "일괄 키워드",
          "연락처 강화",
          "작업당 하나의 37 열 CSV"
        ],
        "api": [
          "비즈니스 데이터",
          "리뷰",
          "구조화됨 JSON"
        ],
        "mcp": [
          "세 가지 도구",
          "Streamable HTTP",
          "OAuth 또는 API 키"
        ]
      },
      "toolsLead": "게다가 무료 웹 도구.",
      "toolsText": "이 사이트의 무료 웹 도구는 아무것도 설치하지 않고도 장소 ID, 링크 리뷰, 변환 조정, CSV 병합 등의 작은 작업을 처리합니다.",
      "toolsLabel": "무료 웹 도구"
    },
    "principles": {
      "kicker": "원칙",
      "title": {
        "lead": "",
        "accent": "경계",
        "tail": "가 있는 곳"
      },
      "lead": "MapsGrab은 데이터에 대해 의도적으로 보수적입니다. 이것이 우리가 준수하는 제품 규칙입니다.",
      "publicData": {
        "title": "공개 데이터만",
        "text": "공개적으로 사용 가능한 비즈니스 정보만 — 페이지 방문자가 이미 볼 수 있는 정보입니다.",
        "visibleTag": "모든 방문자에게 공개",
        "privateTag": "개인 계정"
      },
      "localFirst": {
        "title": "로컬 우선",
        "text": "확장 기능과 무료 웹 도구를 사용하면 귀하의 설정과 결과가 당사 서버가 아닌 귀하의 브라우저에 저장됩니다. 단, 이메일 검사기는 예외로, 입력한 주소를 당사 서버로 보내 이메일 검증 서비스 업체가 확인하며, 이 과정에서 이메일은 발송되지 않습니다. 온라인 스크레이퍼, API 및 MCP 서버는 당사 클라우드에서 실행되며 온라인 스크레이퍼 결과는 귀하의 계정에 저장됩니다.",
        "storage": "로컬 저장소",
        "rows": [
          "설정",
          "결과",
          "일괄 작업"
        ]
      },
      "backend": {
        "title": "확장 및 무료 도구: 백엔드 작업 4개",
        "text": "확장 프로그램과 무료 웹 도구의 경우 백엔드는 원격 구성, 계정 및 할당량 상태, 선택적 이메일/소셜 강화, 최소 사용 로그 등 정확히 4가지 작업을 처리합니다. 유일한 예외는 이메일 검사기로, 백엔드가 입력한 주소를 이메일 검증 서비스 업체에 전달해 확인하며, 이메일은 발송되지 않습니다.",
        "chips": [
          "구성",
          "몫",
          "농축",
          "사용 로그"
        ]
      },
      "never": {
        "title": "광고가 없습니다. 추적자가 없습니다. 데이터 판매는 하지 않습니다.",
        "text": "확장 프로그램에는 광고가 없고, 타사 추적기가 없으며, 데이터를 판매하거나 대여할 수 없습니다.",
        "chips": [
          "광고",
          "타사 추적기",
          "데이터 판매"
        ]
      },
      "inWriting": {
        "kicker": "서면으로",
        "title": "개인정보 보호정책 및 약관",
        "text": "이러한 각 규칙은 개인정보 보호정책 및 서비스 약관에 명시되어 있습니다.",
        "link": "개인 정보 보호 정책 읽기"
      }
    },
    "dataFlow": {
      "kicker": "데이터 이동 방법",
      "title": {
        "lead": "당신과 함께하는 것, 그리고 ",
        "accent": "우리에게 도달하는 것",
        "tail": ""
      },
      "lead": "확장 프로그램은 공개적으로 표시된 데이터에 대해 작동하며 브라우저에 결과를 유지합니다. 확장 및 무료 웹 도구의 경우 백엔드는 구성, 할당량, 선택적 강화 및 최소 사용 로그만 지원합니다. 단, 이메일 검사기는 예외로, 입력한 주소를 당사 서버로 보내 이메일 검증 서비스 업체가 확인하며, 이 과정에서 이메일은 발송되지 않습니다. 온라인 스크레이퍼, API 및 MCP 서버는 대신 클라우드에서 실행되며 온라인 스크레이퍼 결과는 귀하의 계정에 저장됩니다.",
      "source": {
        "label": "원천",
        "title": "Google Maps 방문 페이지",
        "text": "공개 비즈니스 데이터 — 이름, 주소, 전화, 웹사이트, 평가, 리뷰, 사진."
      },
      "browser": {
        "label": "귀하의 브라우저 · 로컬 우선",
        "storage": "로컬 저장소 · IndexedDB",
        "rows": [
          "설정",
          "추출 결과",
          "일괄 작업 상태"
        ],
        "badge": "브라우저에 저장됨"
      },
      "backend": {
        "label": "MapsGrab 백엔드 · 네 가지 목적",
        "lanes": [
          {
            "title": "원격 구성",
            "text": "추출 작업을 계속하는 페이지 구조 사전 설정"
          },
          {
            "title": "계정 및 할당량",
            "text": "로그인, 요금제 현황, 월별 사용량 집계"
          },
          {
            "title": "이메일 및 소셜 강화",
            "text": "공개적으로 나열된 연락처(기능 사용 시)"
          },
          {
            "title": "사용량 로깅",
            "text": "기능 사용 및 오류에 대한 최소한의 기록"
          }
        ]
      },
      "never": {
        "label": "절대",
        "items": [
          "광고 없음",
          "확장 프로그램에는 타사 추적기가 없습니다.",
          "개인정보를 판매하거나 대여하지 않습니다.",
          "추출한 Google Maps 페이지 이상의 검색 기록은 수집되지 않습니다."
        ]
      },
      "note": "이 웹사이트는 Google Analytics 4을 사용하여 전체 페이지 사용량을 측정합니다. 확장 프로그램 자체에는 분석 기능이 포함되어 있지 않습니다.",
      "noteLink": "개인 정보 보호 정책 읽기"
    },
    "status": {
      "kicker": "상태",
      "title": {
        "lead": "사전 체험판, ",
        "accent": "무료",
        "tail": " 시작"
      },
      "access": {
        "title": "조기 액세스",
        "text": "해당 제품은 얼리 액세스 단계에 있습니다. Edge 애드온 및 Firefox 애드온의 스토어 목록이 마무리되고 있습니다.",
        "link": "설치 가이드"
      },
      "quota": {
        "title": "무료 월별 할당량",
        "text": "확장 프로그램은 월별 무료 할당량 내에서 계정 없이도 작동합니다.",
        "link": "무엇이 포함되어 있나요?"
      },
      "paid": {
        "title": "사용량이 많은 경우 유료 요금제",
        "text": "유료 요금제는 사용량이 많을수록 한도가 높아집니다. 현재 등급은 가격 페이지를 참조하세요.",
        "link": "가격 보기"
      }
    }
  },
  "contact": {
    "navLabel": "연락하다",
    "seoTitle": "문의 MapsGrab 지원",
    "seoDescription": "계정, 브라우저 확장 프로그램, 결제, 도구 또는 개인 정보 보호 요청에 대해서는 MapsGrab에 문의하세요.",
    "eyebrow": "연락처 MapsGrab",
    "title": {
      "lead": "",
      "accent": "인간",
      "tail": "과 대화하세요"
    },
    "intro": "우리에게 편지를 보내면 사람이 그것을 읽을 것입니다. 현재 지원은 MapsGrab을 빌드하는 팀에서 직접 처리합니다.",
    "emailCardLabel": "지원 이메일",
    "copyEmail": "복사 {email}",
    "emailLabel": "이메일 지원",
    "emailSubject": "MapsGrab 지원 요청",
    "responseTimes": "영업일 기준 1일 이내에 지원 이메일에 답변해 드리며 일반적으로 더 빠릅니다. 개인정보 보호 요청은 계정 소유권을 먼저 확인해야 하는 경우 며칠이 걸릴 수 있습니다.",
    "include": {
      "title": "포함할 내용",
      "text": "정확한 보고서는 민감한 계정 정보를 요청하지 않고도 영향을 받은 워크플로를 식별하는 데 도움이 됩니다.",
      "items": [
        "페이지 URL 및 시도한 작업",
        "브라우저 이름 및 버전",
        "정확한 오류 메시지와 유용할 경우 스크린샷",
        "결제 카드 세부정보가 포함되지 않은 결제 문의용 주문 번호"
      ]
    },
    "topics": {
      "title": "우리가 도와드릴 수 있는 것",
      "items": [
        "브라우저 확장 설치 및 설정",
        "계정 액세스 및 로그인 문제",
        "할당량, 구독, 갱신 및 결제 관련 질문",
        "웹 도구 문제 및 기능 요청",
        "개인정보 보호 및 계정 데이터 요청"
      ]
    },
    "aboutLabel": "에 대한",
    "privacyLabel": "개인 정보 보호 정책",
    "termsLabel": "서비스 약관"
  }
}

export const legal: LegalContent = {
  "page": {
    "crumbHome": "집",
    "crumbLegal": "합법적인",
    "switchLabel": "법률 문서",
    "readTime": "{minutes}분 읽음",
    "sectionCount": "{count} 섹션",
    "tocTitle": "이 페이지에서",
    "tocLabel": "{title} 섹션",
    "glanceKicker": "한눈에",
    "glanceNote": "아래는 전문 요약입니다.",
    "anchorLabel": "'{title}'에 링크 복사",
    "copyEmail": "복사 {email}",
    "contactSupport": "지원팀에 문의",
    "nextLabel": "다음 문서"
  },
  "terms": {
    "navLabel": "자귀",
    "seoTitle": "서비스 약관 | MapsGrab",
    "seoDescription": "MapsGrab 서비스 약관: 사용 제한, 수집된 데이터에 대한 사용자 책임, 구매, 면책 조항 및 당사에 연락하는 방법.",
    "title": "서비스 약관",
    "intro": "본 약관은 브라우저 확장 프로그램, 이 웹사이트 및 무료 웹 도구인 MapsGrab 사용에 적용됩니다. 서비스를 이용하시기 전에 꼭 읽어보시기 바랍니다.",
    "updatedLabel": "마지막 업데이트",
    "updatedAt": "8월 31, 2026",
    "updatedAtISO": "2026-08-31",
    "summary": "허용되는 사용, 수집된 데이터에 대한 사용자 책임, 구매, 면책 조항 및 당사에 연락하는 방법.",
    "helpTitle": "본 약관에 대해 질문이 있으십니까?",
    "glance": [
      {
        "section": "publicly-available-data",
        "icon": "eye",
        "tone": "ok",
        "title": "공개 데이터만",
        "text": "이 서비스는 귀하가 탐색하는 페이지에 공개적으로 표시된 정보로만 작동합니다."
      },
      {
        "section": "your-responsibility",
        "icon": "user",
        "tone": "pin",
        "title": "귀하의 사용, 귀하의 책임",
        "text": "귀하에게 적용되는 법률 내에서 무엇을 수집하고 어떻게 사용할 것인지는 귀하가 결정합니다."
      },
      {
        "section": "accounts-and-quotas",
        "icon": "key",
        "title": "시작하는 데 계정이 필요하지 않습니다",
        "text": "확장 프로그램은 월별 무료 할당량 내에서 계정 없이도 작동합니다."
      },
      {
        "section": "purchases-and-subscriptions",
        "icon": "refresh",
        "title": "언제든지 취소",
        "text": "구독은 취소될 때까지 갱신됩니다. 취소하면 향후 갱신이 중단됩니다."
      }
    ],
    "sections": [
      {
        "id": "acceptance-of-terms",
        "title": "약관 동의",
        "paragraphs": [
          "MapsGrab에 액세스하거나 사용하면 본 약관에 동의하는 것으로 간주됩니다. 이에 동의하지 않으면 확장 프로그램을 설치하지 말고 웹사이트와 도구를 사용하지 마세요."
        ]
      },
      {
        "id": "what-the-service-does",
        "title": "서비스의 기능",
        "paragraphs": [
          "MapsGrab은 귀하가 방문하는 Google Maps 페이지에 공개적으로 표시되는 정보(업체 세부 정보, 리뷰, 사진 및 관련 연락처 정보)를 수집하고 내보내는 데 도움이 됩니다. 이 서비스는 이 웹사이트인 Microsoft Edge 및 Firefox에 대한 브라우저 확장과 브라우저에서 실행되는 무료 웹 도구로 구성됩니다."
        ]
      },
      {
        "id": "publicly-available-data",
        "title": "공개적으로 사용 가능한 데이터",
        "paragraphs": [
          "이 서비스는 귀하가 탐색하는 페이지에 공개적으로 표시되는 정보에 대해서만 작동하도록 설계되었습니다. 방문자가 볼 수 있는 것 이상으로 특별한 액세스가 필요한 개인 계정, 제한 콘텐츠 또는 데이터에는 액세스하지 않습니다."
        ]
      },
      {
        "id": "your-responsibility",
        "title": "귀하의 책임",
        "paragraphs": [
          "무엇을 수집하고 어떻게 사용할지는 귀하가 결정하며, 해당 사용에 대한 책임은 귀하에게 있습니다. 수집된 정보를 사용할 때 귀하와 귀하의 목적에 적용되는 법률을 준수하십시오.",
          "특히 귀하는 다음 사항을 준수하지 않을 것에 동의합니다."
        ],
        "items": [
          "불법적인 활동이나 제3자의 권리를 침해하는 목적으로 서비스를 사용하십시오.",
          "수집된 비즈니스 데이터를 바탕으로 개인을 재식별하거나 개인 프로필을 구축합니다.",
          "스팸이나 원치 않는 대량 메시지에 대해 수집된 연락처 정보를 사용하세요.",
          "수집된 원시 데이터를 당사와 별도의 계약 없이 경쟁 데이터 상품으로 재판매합니다.",
          "서비스 또는 서비스와 함께 작동하는 플랫폼을 방해하거나 과부하하거나 방해하려고 시도하는 행위."
        ],
        "prohibitions": true
      },
      {
        "id": "accounts-and-quotas",
        "title": "계정 및 할당량",
        "paragraphs": [
          "확장 프로그램은 월별 무료 할당량 내에서 계정 없이도 작동합니다. 더 높은 한도, 구매, 클라우드 통합 등 일부 기능에는 계정이 필요합니다. 귀하는 귀하의 계정 자격 증명을 안전하게 유지하고 귀하의 계정에서 발생하는 활동에 대한 책임이 있습니다."
        ]
      },
      {
        "id": "purchases-and-subscriptions",
        "title": "구매 및 구독",
        "paragraphs": [
          "유료 플랜은 가격 페이지에 설명되어 있습니다. 구매하기 전에 가격, 할당량, 청구 기간이 표시되며 결제 시 제공되는 결제 서비스 제공업체를 통해 구매가 처리됩니다. 구독 계획은 취소할 때까지 자동으로 갱신되며 언제든지 취소할 수 있습니다. 취소하면 향후 갱신이 중단됩니다."
        ]
      },
      {
        "id": "the-service-is-provided-as-is",
        "title": "서비스는 그대로 제공됩니다",
        "paragraphs": [
          "서비스는 \"있는 그대로\", \"사용 가능한 대로\" 제공됩니다. 플랫폼은 자주 변경되며 컬렉션 기능은 언제든지 부분적으로 또는 전체적으로 작동이 중지될 수 있습니다. MapsGrab은 중단 없는 가용성, 수집된 데이터의 완전성 또는 특정 목적에 대한 적합성에 대해 명시적이든 묵시적이든 어떠한 보증도 하지 않습니다.",
          "당사는 서비스의 일부를 변경, 일시 중지 또는 중단할 수 있으며 본 약관을 업데이트할 수 있습니다. 중요한 변경 사항이 있을 경우 당사는 이를 이 웹사이트에 공지할 것입니다. 변경 사항이 적용된 후에도 계속 사용한다는 것은 업데이트된 약관에 동의한다는 것을 의미합니다."
        ]
      },
      {
        "id": "limitation-of-liability",
        "title": "책임의 제한",
        "paragraphs": [
          "법률이 허용하는 최대 한도 내에서 MapsGrab 및 그 운영자는 귀하의 서비스 이용 또는 이용 불가로 인해 발생하는 수익 또는 데이터 손실을 포함하여 간접적, 우발적, 특수적 또는 결과적 손해에 대해 책임을 지지 않습니다."
        ]
      },
      {
        "id": "contact",
        "title": "연락하다",
        "paragraphs": [
          "본 약관에 관한 질문은 support@mapsgrab.com로 문의하세요."
        ]
      }
    ],
    "coverage": {
      "label": "적용 범위 참고 사항",
      "badge": "미정",
      "lead": "아직 다루지 않음:",
      "text": "온라인 스크레이퍼(클라우드 실행), 스크레이퍼/리뷰/사진 API 및 MCP 서버. 위의 텍스트는 확장 프로그램, 이 웹사이트 및 무료 웹 도구에 대해 설명합니다."
    }
  },
  "privacy": {
    "navLabel": "은둔",
    "seoTitle": "개인정보 보호정책 | MapsGrab",
    "seoDescription": "MapsGrab 개인정보 보호정책: 확장 프로그램과 웹사이트에서 처리하는 데이터, 저장 위치, 백엔드의 용도, 준수 경계.",
    "title": "개인 정보 보호 정책",
    "intro": "이 정책은 MapsGrab이 처리하는 데이터, 저장 위치, 서버에 도달하는 데이터에 대해 설명합니다. 짧은 버전: 확장 프로그램은 공개적으로 표시된 데이터에 대해 작동하고 브라우저에 결과를 유지합니다. 클라우드 서비스와 별도로 백엔드는 구성, 할당량, 선택적 강화 및 최소 사용 로그만 지원합니다. 확장 프로그램에서는 광고나 타사 추적기를 실행하지 않습니다. 온라인 스크레이퍼, API 및 MCP 서버와 같은 클라우드 서비스에 대한 요청은 당사 서버에서 처리되며 온라인 스크레이퍼 결과는 귀하의 계정에 연결되어 다운로드할 수 있습니다.",
    "updatedLabel": "마지막 업데이트",
    "updatedAt": "10월 16, 2026",
    "updatedAtISO": "2026-10-16",
    "summary": "확장 프로그램과 웹사이트가 처리하는 데이터, 저장 위치, 백엔드의 용도, 우리가 따르는 경계.",
    "helpTitle": "이 정책에 대해 질문이 있으십니까?",
    "glance": [
      {
        "section": "where-data-is-stored",
        "icon": "lock",
        "tone": "ok",
        "title": "결과가 저장되는 위치",
        "text": "확장 기능과 무료 웹 도구는 귀하의 데이터를 브라우저에 보관합니다. 온라인 스크레이퍼 결과는 귀하의 계정에 연결됩니다."
      },
      {
        "section": "what-our-backend-processes",
        "icon": "database",
        "title": "우리 서버에 도달하는 것",
        "text": "온라인 스크레이퍼, API 및 MCP 서버에 대한 요청과 구성, 계정 및 할당량, 선택적 강화 및 최소 사용 로그."
      },
      {
        "section": "what-we-never-do",
        "icon": "shield",
        "tone": "pin",
        "title": "광고 없음, 추적기 없음",
        "text": "확장 프로그램에는 제3자 추적기가 없으며 개인 데이터를 판매하거나 대여할 수 없습니다."
      },
      {
        "section": "data-removal",
        "icon": "x",
        "title": "데이터 제거",
        "text": "확장 프로그램을 제거하면 로컬 데이터가 삭제됩니다. 백엔드 계정 데이터를 삭제하려면 이메일을 보내주세요."
      }
    ],
    "sections": [
      {
        "id": "data-the-extension-processes",
        "title": "확장이 처리하는 데이터",
        "paragraphs": [
          "확장 프로그램은 다음과 같은 데이터 범주를 처리합니다."
        ],
        "items": [
          "공개 비즈니스 데이터 — 추출 기능을 사용하는 동안 귀하가 방문하는 Google Maps 페이지에 표시되는 정보(이름, 주소, 전화, 웹사이트, 평가, 리뷰, 사진 등)입니다.",
          "귀하의 설정 — 귀하가 구성하는 기본 설정(내보내기 형식, 필드 선택, 자동화 스위치, 인터페이스 언어)",
          "기술 및 상호 작용 데이터 — Google 페이지 변경에 대해 확장 프로그램이 작동하도록 유지하는 데 사용되는 최소 사용 이벤트(기능 사용 카운터, 오류 메시지)입니다.",
          "당사가 발행하는 계정 식별자 - 익명의 장치 식별자, 로그인하는 경우 계정 이메일, 요금제 또는 할당량 상태."
        ]
      },
      {
        "id": "where-data-is-stored",
        "title": "데이터가 저장되는 위치",
        "paragraphs": [
          "확장 프로그램을 사용하면 설정, 추출 결과 및 일괄 작업 상태가 브라우저에 로컬로 저장됩니다(확장 로컬 저장소 및 IndexedDB). 내보내기나 아래에 설명된 선택적 통합 중 하나를 실행하지 않는 한 기기를 떠나지 않습니다. 무료 웹 도구는 브라우저에 입력한 내용도 처리합니다.",
          "Google Drive 및 HubSpot OAuth 토큰을 연결하면 브라우저에만 저장됩니다.",
          "온라인 스크레이퍼 작업은 당사 서버에서 실행됩니다. 결과는 귀하의 계정에 저장되므로 대시보드에서 다운로드할 수 있습니다."
        ]
      },
      {
        "id": "what-our-backend-processes",
        "title": "백엔드 프로세스",
        "paragraphs": [
          "온라인 스크레이퍼, API 및 MCP 서버 등 당사 클라우드 서비스에 대한 귀하의 요청은 당사 서버에서 처리됩니다. 또한 당사 서버는 귀하의 API 키와 귀하가 승인한 MCP 클라이언트 인증을 포함하여 이러한 서비스에 대한 액세스를 관리하고 귀하의 사용 기록을 유지합니다.",
          "귀하가 승인한 MCP 클라이언트는 요청의 결과를 받습니다. 대시보드에서 승인을 취소할 수 있습니다.",
          "이러한 클라우드 서비스 외에도 확장 프로그램과 이 웹 사이트는 다음 네 가지 목적을 위해 자체 서버에 연결합니다."
        ],
        "items": [
          "원격 구성 — Google이 페이지를 변경할 때 추출이 계속 작동하는 페이지 구조 사전 설정입니다.",
          "계정 및 할당량 서비스 — 로그인, 계획 상태 및 월간 사용량 계산.",
          "이메일 및 소셜 미디어 강화 - 이 기능을 사용할 때 수집된 비즈니스 웹사이트에 공개적으로 나열된 연락처 세부 정보를 조회합니다.",
          "사용 로깅 — 서비스를 유지하고 개선하는 데 사용되는 기능 사용 및 오류에 대한 최소한의 기록입니다."
        ]
      },
      {
        "id": "optional-google-drive-and-hubspot-integrations",
        "title": "선택적 Google Drive 및 HubSpot 통합",
        "paragraphs": [
          "설정에서 명시적으로 연결하는 경우에만 내보낸 데이터가 귀하의 Google Drive에 업로드되거나 귀하의 HubSpot 계정에 동기화됩니다. 이러한 통합은 귀하의 승인을 사용하고 귀하를 대신하여 작동하며 확장 설정 또는 Google / HubSpot 계정에서 언제든지 취소할 수 있습니다."
        ]
      },
      {
        "id": "website-analytics",
        "title": "웹사이트 분석",
        "paragraphs": [
          "이 웹사이트는 Google Analytics 4(GA4)을 사용하여 전체 페이지 사용량을 측정합니다. GA4은 우리가 사용하는 유일한 제3자 분석이며 이 웹사이트에서만 실행됩니다. 확장 프로그램 자체에는 분석이 포함되어 있지 않습니다."
        ]
      },
      {
        "id": "what-we-never-do",
        "title": "우리가 절대 하지 않는 일",
        "paragraphs": [
          "이러한 경계는 확장 프로그램과 웹사이트 전체에 적용됩니다."
        ],
        "items": [
          "광고가 없습니다.",
          "확장 프로그램에는 타사 추적기가 없습니다.",
          "개인정보를 판매하거나 대여하지 않습니다.",
          "추출한 Google Maps 페이지 이상의 검색 기록은 수집되지 않습니다."
        ],
        "prohibitions": true
      },
      {
        "id": "data-removal",
        "title": "데이터 제거",
        "paragraphs": [
          "확장 프로그램을 제거하면 로컬에 저장된 모든 데이터가 삭제됩니다. 백엔드 계정 데이터를 삭제하려면 support@mapsgrab.com으로 문의해 주세요. 삭제해 드리겠습니다."
        ]
      },
      {
        "id": "changes-to-this-policy",
        "title": "이 정책의 변경 사항",
        "paragraphs": [
          "서비스가 변경되면 본 정책을 업데이트합니다. 위 날짜는 최신 개정 내용을 반영하며, 중요한 변경 사항은 본 웹사이트를 통해 공지됩니다."
        ]
      },
      {
        "id": "contact",
        "title": "연락하다",
        "paragraphs": [
          "개인정보 보호에 관한 질문이나 요청은 support@mapsgrab.com로 보내주세요."
        ]
      }
    ]
  }
}

export const mcpOAuth: McpOAuthContent = {
  "seoTitle": "AI 앱 인증 | MapsGrab",
  "title": "AI 앱을 계정에 연결하세요",
  "intro": "앱에서 귀하의 MapsGrab 계정에 대한 액세스를 요청하고 있습니다. 이 연결을 직접 시작한 경우에만 허용하십시오.",
  "loading": "연결 요청 로드 중...",
  "hostLabel": "앱 주소",
  "selfDeclared": "앱 자체에서 제공하는 이름: {name}",
  "loopbackTitle": "로컬 앱",
  "loopbackText": "이 앱은 컴퓨터에서 실행되므로 해당 앱을 만든 사람이 주소로 표시될 수 없습니다. 신뢰하는 앱에서 방금 연결을 시작한 경우에만 허용하세요.",
  "loopbackHost": "이 컴퓨터",
  "accountLabel": "다음 계정으로 로그인됨",
  "switchAccount": "계정 전환",
  "permissionsTitle": "허용하면 이 앱에서 다음을 수행할 수 있습니다.",
  "permissions": [
    "Google Maps에서 업체를 검색하고 리뷰와 공개 사진을 읽어보세요.",
    "API 계획의 월별 요청 허용량을 사용하세요."
  ],
  "revokeNote": "API 관리의 연결된 앱에서 언제든지 연결을 해제할 수 있습니다.",
  "approve": "허용하다",
  "deny": "거부하고 {host}로 돌아갑니다.",
  "denyLoopback": "거부하고 앱으로 돌아가기",
  "redirecting": "앱으로 돌아가는 중...",
  "invalidTitle": "이 연결 요청은 유효하지 않거나 만료되었습니다.",
  "invalidText": "AI 앱으로 돌아가서 다시 연결을 시작하세요.",
  "errorTitle": "이 연결 요청을 완료할 수 없습니다.",
  "errorReasons": {
    "rate_limited": "네트워크에서 너무 많은 연결 시도가 이루어졌습니다. 다시 시도하기 전에 몇 분 정도 기다리십시오.",
    "invalid_client": "앱이 등록되지 않았거나 등록이 완료되지 않았습니다.",
    "invalid_redirect_uri": "앱에서 보낸 반송 주소가 등록된 주소와 일치하지 않습니다.",
    "unsupported_response_type": "앱에서 지원되지 않는 인증 유형을 요청했습니다.",
    "invalid_pkce": "앱이 필수 보안 확인(PKCE과 S256)을 전송하지 않았습니다.",
    "invalid_resource": "앱에서 MapsGrab MCP 서버 접근을 요청하지 않았거나, 다른 서버를 요청했습니다.",
    "server_error": "MapsGrab 지금은 이 요청을 저장할 수 없습니다. 잠시 후 다시 시도해 주세요."
  },
  "errorHint": "AI 앱에서 연결을 다시 시작하세요. 문제가 계속되면 앱 개발자에게 문의하세요.",
  "signInTitle": "계속하려면 로그인하세요.",
  "signInText": "연결하려는 MapsGrab 계정에 로그인하세요. 이 요청은 당신을 기다릴 것입니다.",
  "signIn": "로그인",
  "loadFailed": "연결 요청을 로드할 수 없습니다. 네트워크를 확인하고 다시 시도하세요.",
  "decideFailed": "이 작업을 완료할 수 없습니다. 네트워크를 확인하고 다시 시도하세요.",
  "retry": "다시 시도하세요"
}

export const clink: ClinkReturnContent = {
  "success": {
    "waiting": {
      "title": "결제가 완료되었습니다.",
      "description": "귀하의 결제를 확인하는 중입니다. 원본 탭은 자동으로 업데이트됩니다."
    },
    "confirmedCredits": {
      "title": "크레딧이 충전되었습니다",
      "description": "ClinkBill 결제가 확인되었으며 크레딧이 추가되었습니다. 원래 탭으로 돌아갈 수 있습니다."
    },
    "confirmedSubscription": {
      "title": "계획이 활성화되었습니다",
      "description": "귀하의 ClinkBill 결제가 확인되었으며 귀하의 MapsGrab 요금제가 활성화되었습니다. 원래 탭으로 돌아갈 수 있습니다."
    },
    "failed": {
      "title": "결제에 주의가 필요함",
      "description": "이 주문을 확인할 수 없습니다. 원래 탭으로 돌아가서 다시 시도하세요."
    }
  },
  "cancel": {
    "title": "결제가 취소되었습니다.",
    "description": "결제가 완료되지 않았습니다. 반품하고 다른 결제 방법을 선택할 수 있습니다."
  }
}
