import type { SiteContent } from '../schema'
import { downloadDisabledChannelWorkaroundContent } from '../downloadDisabledChannelWorkaround'
import { viVNPricingContent } from '../pricing'

export const viVN: SiteContent = {
  site: {
    name: 'Tải video Telegram | TG Downloader',
    description:
      'Dùng TG Downloader cho tải video Telegram trong Telegram Web, lưu tệp và media đã tải và tiếp tục với từng kênh riêng tư Telegram.',
    keywords:
      'tải video Telegram, tải media Telegram, lưu video Telegram, tải file Telegram, kênh riêng tư Telegram'
  },
  layout: {
    nav: {
      brand: 'TG Trình Tải',
      home: 'Trang Chủ',
      pricing: 'Giá',
      solutions: 'Giải pháp',
      changelog: 'Thay Đổi'
    },
    footer: {
      resources: 'Tài nguyên',
      rights: '© 2026 TG Downloader. Đã đăng ký bản quyền.'
    }
  },
  common: {
    installCta: 'Cài Đặt Ngay'
  },
  sections: {
    features: {
      title: 'Tính năng tải media Telegram',
      subtitle:
        'Các tính năng tải media Telegram này bao gồm tệp, hình ảnh, video, lô lớn và nội dung đã được tải trong Telegram Web.',
      metaDescription:
        'TG Downloader features: multi-file batch saves, private channel support, 1GB+ large file downloads, real-time media detection, and privacy-first design with no login required.',
      items: [
        {
          title: 'Tải Xuống Hàng Loạt',
          description:
            'Hỗ trợ tải xuống hàng loạt với lựa chọn nhiều, tải tất cả tệp media từ kênh hoặc nhóm bằng một cú nhấp chuột',
          details: [
            'Hỗ trợ tải xuống hàng loạt với lựa chọn nhiều',
            'Tải xuống toàn bộ kênh/nhóm bằng một cú nhấp chuột',
            'Bộ lọc thông minh theo loại tệp',
            'Quản lý hàng đợi tải xuống'
          ]
        },
        {
          title: 'Nội Dung Hạn Chế',
          description: 'Tải xuống media từ kênh hạn chế và nhóm riêng ngay cả khi không có quyền',
          details: [
            'Truy cập nội dung kênh hạn chế',
            'Tải xuống từ nhóm riêng tư',
            'Không cần xác minh quyền',
            'Hoạt động với phiên bản A/K'
          ]
        },
        {
          title: 'Hỗ Trợ Đa Định Dạng',
          description: 'Hỗ trợ hình ảnh, video, GIF, âm thanh và các định dạng media khác',
          details: [
            'Hình ảnh: JPG, PNG, WEBP, GIF',
            'Video: MP4, WEBM, MOV',
            'Tệp âm thanh: MP3, M4A, OGG',
            'Phát hiện định dạng tự động'
          ]
        },
        {
          title: 'An Toàn & Bảo Mật',
          description: 'Không cần mật khẩu hoặc đăng nhập API, không thu thập dữ liệu người dùng',
          details: [
            'Không cần mật khẩu hoặc đăng nhập API',
            'Không thu thập dữ liệu người dùng',
            'Không virus không quảng cáo',
            'Kiểm tra bảo mật nghiêm ngặt'
          ]
        },
        {
          title: 'Hỗ Trợ Tệp Lớn',
          description: 'Tải xuống ổn định các tệp lớn hơn 1GB với hỗ trợ tiếp tục',
          details: [
            'Tải xuống ổn định các tệp lớn hơn 1GB',
            'Hỗ trợ tiếp tục cho tải xuống bị gián đoạn',
            'Truyền nhanh và ổn định',
            'Theo dõi tiến trình'
          ]
        },
        {
          title: 'Phát Hiện Thời Gian Thực',
          description:
            'Tự động quét và phát hiện tài nguyên media, cập nhật danh sách tải xuống trong thời gian thực',
          details: [
            'Quét tự động tài nguyên media của trang',
            'Phát hiện tài nguyên theo thời gian thực',
            'Cập nhật danh sách tự động',
            'Bộ nhớ đệm tài nguyên thông minh'
          ]
        }
      ]
    },
    steps: {
      title: 'Hướng dẫn lưu video Telegram',
      subtitle:
        'Làm theo hướng dẫn lưu video Telegram này, mở tin nhắn trong Telegram Web và giữ lại video hoặc media khác chỉ với vài bước.',
      metaDescription:
        'Step-by-step guide to saving Telegram videos, files, and albums with TG Downloader. Learn to install the extension, detect media in Telegram Web, and batch-download content.',
      items: [
        {
          title: 'Cài Đặt Tiện Ích',
          description:
            'Tìm kiếm và cài đặt TG Downloader từ cửa hàng tiện ích mở rộng trình duyệt của bạn'
        },
        {
          title: 'Ghim Tiện Ích',
          description:
            'Nhấp vào thanh công cụ trình duyệt để ghim icon tiện ích mở rộng để truy cập nhanh'
        },
        {
          title: 'Mở Telegram Web',
          description:
            'Truy cập web.telegram.org, tiện ích sẽ tự động bắt đầu quét tài nguyên media'
        },
        {
          title: 'Tải Xuống Hàng Loạt',
          description: 'Chọn tệp để tải xuống và nhấp nút tải xuống để lưu chúng vào máy'
        }
      ]
    },
    cta: {
      title: 'Sẵn Sàng Để Bắt Đầu?',
      description: 'Cài đặt tiện ích và bắt đầu tải xuống media từ Telegram ngay bây giờ.'
    },
    techSpecs: {
      title: 'Thông Số Kỹ Thuật',
      browsersLabel: 'Trình Duyệt',
      browsers: 'Chrome, Edge, Brave và tất cả trình duyệt dựa trên Chromium',
      telegramVersionsLabel: 'Phiên Bản Telegram',
      telegramVersions: 'Phiên bản Web K và phiên bản A',
      permissionsLabel: 'Quyền',
      permissions: 'Chỉ cần quyền tối thiểu',
      updatesLabel: 'Cập Nhật',
      updates: 'Cập nhật tự động từ cửa hàng tiện ích'
    }
  },
  pages: {
    homepage: {
      hero: {
        title: 'Tải Media từ Kênh Riêng và Định Giới của Telegram',
        description:
          'Một cú nhấp, không cần đăng nhập, hỗ trợ tệp 1GB+. Tải hàng loạt từ kênh riêng và nội dung định giới.'
      },
      stats: {
        users: 'Người Dùng Trên Thế Giới',
        downloads: 'Tổng Lượt Tải'
      },
      seo: {
        title: 'Trình Tải Video Riêng Tư Telegram: Tải Mọi Media Riêng Tư',
        description:
          'Lưu video kênh riêng tư Telegram với hướng dẫn tải đơn giản. Tải video và media có thể truy cập, khắc phục lỗi tải xuống và tìm phương pháp phù hợp cho thiết bị của bạn.',
        keywords:
          'trình tải video riêng tư telegram, tải video kênh riêng tư telegram, tải video telegram riêng tư, telegram private video downloader'
      },
      heroTrustPoints: [
        'Tải video HD',
        'Không cần đăng ký',
        'Thân thiện với di động',
        'Hoạt động trên Windows, Mac, Android và iPhone'
      ],
      situation: {
        title: 'Bắt Đầu Tại Đây: Tình Huống Nào Giống Bạn?',
        intro:
          'Hầu hết người dùng tìm kiếm trình tải video riêng tư Telegram đều đang cố giải quyết một trong các vấn đề sau:',
        headers: ['Tình huống của bạn', 'Hãy thử cách này trước'],
        rows: [
          {
            cells: [
              'Bạn có liên kết video Telegram từ một kênh hoặc cuộc trò chuyện',
              'Dán liên kết vào trình tải video Telegram trực tuyến'
            ]
          },
          {
            cells: [
              'Bạn có thể xem video trong kênh riêng tư nhưng không lưu được',
              'Thử tùy chọn Save Video As của Telegram Desktop'
            ]
          },
          {
            cells: [
              'Video phát được nhưng tải xuống và chuyển tiếp bị chặn',
              'Chỉ dùng quay màn hình nếu bạn được phép giữ một bản sao'
            ]
          },
          {
            cells: [
              'Trình tải báo không tìm thấy video',
              'Kiểm tra quyền truy cập, loại liên kết, hạn chế của kênh và liệu video có mở được bên ngoài Telegram không'
            ]
          }
        ]
      },
      solutions: {
        title: 'Cách Nào Hiệu Quả Với Video Riêng Tư Telegram?',
        intro:
          'Video riêng tư Telegram thường là video được chia sẻ trong kênh riêng tư, nhóm riêng tư hoặc cuộc trò chuyện trực tiếp. Những video này chỉ hiển thị với thành viên được duyệt, nên việc tải chúng khác với lưu media từ kênh công khai.',
        quickAnswer:
          'Câu trả lời nhanh: Nếu liên kết có thể truy cập, hãy dùng trình tải video riêng tư Telegram trực tuyến. Nếu video chỉ hiển thị bên trong Telegram, hãy thử Telegram Desktop. Nếu việc lưu bị chặn nhưng bạn được phép giữ nội dung, quay màn hình có thể là phương án dự phòng thực tế.',
        items: [
          {
            title: 'Giải pháp 1: Trình tải video Telegram trực tuyến',
            description:
              'Tốt nhất cho các liên kết Telegram có thể truy cập. Đây là cách đơn giản nhất cho người dùng muốn tải video Telegram trực tuyến mà không cần cài ứng dụng, tiện ích mở rộng hay bot.',
            useWhenLabel: 'Dùng cách này khi:',
            useWhen: [
              'Liên kết video Telegram là công khai hoặc có thể truy cập.',
              'Bạn muốn tải video Telegram trực tuyến.',
              'Bạn cần một tệp video HD nhanh chóng.',
              'Bạn không muốn cài tiện ích trình duyệt hay ứng dụng máy tính.'
            ]
          },
          {
            title: 'Giải pháp 2: Telegram Desktop Save Video As',
            description:
              'Khi video có sẵn trong Telegram Desktop và được phép tải, hãy nhấp chuột phải vào video và lưu vào một thư mục trên máy tính. Cách này thường hiệu quả hơn với thành viên kênh riêng tư vì bạn đã được xác thực bên trong Telegram.',
            useWhenLabel: 'Dùng cách này khi:',
            useWhen: [
              'Bạn có thể xem video trong Telegram Desktop.',
              'Chủ kênh chưa tắt tính năng lưu.',
              'Bạn muốn tải trực tiếp về Windows hoặc Mac.'
            ]
          },
          {
            title: 'Giải pháp 3: Quay màn hình trên di động hoặc máy tính',
            description:
              'Nếu tùy chọn tải xuống bị tắt nhưng bạn được phép xem và giữ nội dung, một công cụ quay màn hình có thể ghi lại video và âm thanh khi đang phát. Đây là phương án dự phòng, không phải cách đầu tiên, vì nó tốn thời gian hơn và phụ thuộc vào chất lượng phát.',
            useWhenLabel: 'Dùng cách này khi:',
            useWhen: [
              'Bạn được phép xem và giữ video.',
              'Liên kết Telegram không thể được trình tải phân tích.',
              'Bạn cần một bản sao ngoại tuyến cá nhân để tham khảo.'
            ]
          },
          {
            title: 'Giải pháp 4: Kiểm tra trình quản lý tệp trên Android',
            description:
              'Trong một số trường hợp trên Android, Telegram có thể tạm thời lưu media đã tải trong các thư mục ứng dụng cục bộ. Trình quản lý tệp đôi khi có thể giúp bạn tìm những video đã được tải về thiết bị, nhưng điều này phụ thuộc vào phiên bản ứng dụng, quyền lưu trữ và cách hoạt động của bộ nhớ đệm.',
            useWhenLabel: 'Dùng cách này khi:',
            useWhen: [
              'Bạn đã phát video trong Telegram trên Android.',
              'Bạn hiểu về quyền lưu trữ của ứng dụng.',
              'Bạn chỉ cần khôi phục một tệp đã được lưu trong bộ nhớ đệm trên thiết bị.'
            ]
          }
        ]
      },
      benefits: {
        title: 'Tại Sao Nên Dùng Trình Tải Video Telegram Trực Tuyến?',
        intro:
          'Một trình tải tốt nên giúp bạn trả lời nhanh một câu hỏi: video Telegram này có thể lưu được từ liên kết tôi đang có không? Trải nghiệm tốt nhất là trực tiếp, rõ ràng và trung thực khi một liên kết riêng tư không thể xử lý.',
        items: [
          {
            title: 'Lưu Video Chất Lượng Cao',
            description:
              'Giữ video Telegram ở chất lượng tốt nhất có sẵn để xem ngoại tuyến, học tập, đào tạo, lưu trữ hoặc tham khảo cá nhân.'
          },
          {
            title: 'Hoạt Động Trên Mọi Thiết Bị',
            description:
              'Dùng trình tải từ trình duyệt trên Android, iPhone, Windows, Mac hoặc máy tính bảng. Điều này quan trọng khi video nằm trên điện thoại nhưng bạn muốn lưu sang thiết bị khác.'
          },
          {
            title: 'Không Cần Đăng Nhập Telegram',
            description:
              'Chọn các công cụ xử lý liên kết video mà không yêu cầu mật khẩu Telegram, mã xác minh, tệp phiên hay thông tin tài khoản riêng tư của bạn.'
          },
          {
            title: 'Xem Ngoại Tuyến Dễ Dàng',
            description:
              'Tải tệp ở các định dạng video phổ biến khi có sẵn, để bạn xem lại mà không cần mở Telegram hay dùng dữ liệu di động.'
          },
          {
            title: 'Quy Trình Nhanh Dựa Trên Liên Kết',
            description:
              'Sao chép, dán, phân tích và tải. Nếu liên kết thất bại, trang sẽ giải thích lý do và hướng dẫn bạn nên thử gì tiếp theo.'
          },
          {
            title: 'Ranh Giới Quyền Rõ Ràng',
            description:
              'Chỉ tải những video bạn có quyền truy cập và lưu. Hãy tôn trọng quy định của kênh, quyền của người tạo và chính sách của Telegram.'
          },
          {
            title: 'Tải file và ảnh Telegram bằng liên kết',
            description:
              'Dán liên kết Telegram có thể truy cập để tải tệp và ảnh, bao gồm từng tệp đính kèm trong bài đăng có nhiều nội dung.'
          }
        ]
      },
      troubleshooting: {
        title: 'Nếu Liên Kết Video Telegram Không Hoạt Động',
        intro:
          'Không phải liên kết thất bại nào cũng có nghĩa là trình tải bị lỗi. Video riêng tư Telegram thường thất bại vì tệp không có sẵn bên ngoài Telegram. Hãy thử danh sách kiểm tra sau:',
        items: [
          'Mở liên kết trong trình duyệt và xác nhận nó tải được.',
          'Đảm bảo bạn vẫn là thành viên của kênh hoặc nhóm riêng tư.',
          'Kiểm tra xem chủ kênh có tắt tính năng lưu, sao chép hay chuyển tiếp không.',
          'Thử Telegram Desktop nếu video chỉ phát được bên trong ứng dụng.',
          'Dùng trình duyệt hoặc mạng khác nếu trang không kết nối được tới Telegram.',
          'Tránh mọi công cụ yêu cầu mã đăng nhập Telegram của bạn.'
        ]
      },
      permission: {
        title: 'Lưu Ý Quan Trọng Về Quyền',
        note:
          'Trình tải video riêng tư Telegram không nên được dùng để vượt qua các hạn chế về quyền riêng tư, bản quyền hay quyền truy cập. Chỉ lưu video khi bạn được chủ sở hữu cho phép hoặc khi việc sử dụng được pháp luật và điều khoản của Telegram cho phép.'
      },
      comparison: {
        title: 'Chọn Phương Pháp Tải Telegram Phù Hợp',
        headers: ['Tình huống', 'Giải pháp đề xuất', 'Tốt nhất cho', 'Cần kiểm tra'],
        rows: [
          {
            cells: [
              'Liên kết video Telegram công khai hoặc có thể truy cập',
              'Trình tải video Telegram trực tuyến',
              'Tải HD nhanh mà không cần ứng dụng',
              'Liên kết mở được và công cụ có thể truy cập video'
            ]
          },
          {
            cells: [
              'Video kênh riêng tư được phép tải',
              'Telegram Desktop Save Video As',
              'Lưu trực tiếp về máy tính',
              'Bạn là thành viên và chủ kênh chưa tắt tính năng lưu'
            ]
          },
          {
            cells: [
              'Bị hạn chế lưu nhưng vẫn xem được',
              'Công cụ quay màn hình tích hợp hoặc bên thứ ba',
              'Tham khảo ngoại tuyến cá nhân khi được phép',
              'Thu âm thanh, vùng màn hình và luật pháp địa phương hoặc quy định nền tảng'
            ]
          },
          {
            cells: [
              'Media đã lưu trong bộ nhớ đệm Android',
              'Kiểm tra trình quản lý tệp',
              'Tìm media đã được tải về thiết bị',
              'Quyền truy cập bộ nhớ ứng dụng và liệu Telegram có giữ bộ nhớ đệm cục bộ không'
            ]
          }
        ]
      },
      howTo: {
        title: 'Cách Tải Video Telegram Trong 3 Bước',
        subtitle:
          'Cách nhanh nhất là dùng trình tải video Telegram dựa trên liên kết. Nó hiệu quả nhất khi liên kết video Telegram là công khai, có thể truy cập hoặc đọc được bên ngoài ứng dụng Telegram.',
        steps: [
          {
            title: 'Sao chép liên kết video',
            description:
              'Mở Telegram, tìm video bạn muốn lưu và sao chép liên kết tin nhắn hoặc liên kết video từ menu chia sẻ. Nếu kênh không cho phép sao chép liên kết, hãy chuyển sang các giải pháp cho kênh riêng tư bên dưới.'
          },
          {
            title: 'Dán và phân tích',
            description:
              'Dán liên kết Telegram vào ô của trình tải. Công cụ sẽ kiểm tra xem có thể truy cập một tệp video tải được từ liên kết đó không.'
          },
          {
            title: 'Tải về HD',
            description:
              'Chọn chất lượng hoặc định dạng có sẵn, rồi lưu video Telegram trực tiếp về điện thoại, máy tính bảng hoặc máy tính của bạn. Nếu không có tệp nào hiện ra, có lẽ liên kết bị hạn chế chứ không phải bị lỗi.'
          }
        ]
      },
      faq: {
        title: 'Câu Hỏi Thường Gặp',
        description: 'Những câu hỏi mọi người đặt ra trước khi tải video Telegram hoặc tải file Telegram trong Telegram Web.',
        items: [
          {
            question: 'Tôi có thể tải video riêng tư Telegram không?',
            answer:
              'Bạn chỉ có thể tải hoặc lưu video riêng tư Telegram khi bạn có quyền truy cập chúng và nguồn video còn khả dụng. Một số kênh riêng tư chặn việc lưu, chuyển tiếp, sao chép liên kết hoặc truy cập từ bên ngoài.'
          },
          {
            question: 'Làm thế nào để tải video kênh riêng tư Telegram?',
            answer:
              'Hãy thử trình tải dựa trên liên kết trước nếu bạn có liên kết video Telegram dùng được. Nếu cách đó không hiệu quả, hãy kiểm tra tùy chọn Save Video As trong Telegram Desktop. Nếu việc tải bị chặn nhưng bạn được phép giữ nội dung, quay màn hình có thể là phương án dự phòng.'
          },
          {
            question: 'Tại sao trình tải video Telegram báo không tìm thấy video?',
            answer:
              'Liên kết có thể bị hạn chế, đã xóa, hết hạn, chỉ hiển thị bên trong Telegram hoặc bị chủ kênh chặn. Hãy tự mở liên kết trước và xác nhận video vẫn phát được. Nếu nó chỉ hoạt động sau khi bạn đăng nhập Telegram, một trình tải trực tuyến có thể không truy cập được.'
          },
          {
            question: 'Tôi có cần cài phần mềm không?',
            answer:
              'Không cần với các liên kết có thể truy cập. Trình tải video Telegram trực tuyến hoạt động trong trình duyệt. Bạn có thể cần Telegram Desktop, trình quản lý tệp hoặc công cụ quay màn hình cho những trường hợp riêng tư hoặc bị hạn chế cụ thể.'
          },
          {
            question: 'Tôi có thể tải video Telegram mà không cần liên kết không?',
            answer:
              'Thường là không. Các trình tải trực tuyến cần liên kết video Telegram để định vị tệp. Nếu bạn không thể sao chép liên kết nhưng có thể xem video trong Telegram, hãy dùng Telegram Desktop hoặc một phương pháp cục bộ được phép khác.'
          },
          {
            question: 'Nhập mã đăng nhập Telegram vào trình tải có an toàn không?',
            answer:
              'Không. Một trình tải không cần mật khẩu Telegram, mã xác minh hay thông tin phiên của bạn. Nếu một trang web yêu cầu chúng, hãy rời khỏi trang đó.'
          },
          {
            question: 'Trình tải media Telegram có miễn phí không?',
            answer:
              'Nhiều trình tải media Telegram dựa trên liên kết là miễn phí cho các bản tải cơ bản. Hãy tránh các công cụ ép cài đặt đáng ngờ, yêu cầu đăng nhập hoặc các nút gây hiểu lầm.'
          },
          {
            question: 'Tải video Telegram có hợp pháp không?',
            answer:
              'Điều đó phụ thuộc vào nội dung, quyền của bạn và mục đích sử dụng. Đừng tải hoặc phát tán lại nội dung có bản quyền, riêng tư hoặc bị hạn chế khi chưa được phép.'
          }
        ]
      },
      workspace: {
        auth: {
          eyebrow: 'Truy cập web',
          title: 'Đăng nhập để đồng bộ điểm',
          signedInAs: 'Đã đăng nhập bằng',
          continueWithGoogle: 'Tiếp tục với Google',
          googleLoading: 'Đang mở Google...',
          or: 'hoặc',
          emailLabel: 'Email',
          emailPlaceholder: 'name@example.com',
          continueWithEmail: 'Tiếp tục với email',
          sendCode: 'Gửi mã',
          sendingCode: 'Đang gửi...',
          sendCodeSuccess: 'Đã gửi mã xác minh.',
          sendAgain: 'Gửi lại',
          codeLabel: 'Mã xác minh',
          codePlaceholder: '123456',
          signIn: 'Đăng nhập',
          termsNotice: 'Khi đăng nhập, bạn đồng ý với',
          termsLink: 'Điều khoản',
          privacyLink: 'Chính sách quyền riêng tư',
          logout: 'Đăng xuất',
          creditsLabel: 'điểm'
        },
        quota: {
          eyebrow: 'Hạn mức web',
          title: 'Số dư điểm hiện tại',
          planLabel: 'Gói',
          remainingLabel: 'Còn lại',
          dailyLimitLabel: 'Giới hạn mỗi ngày',
          unlimited: 'Không giới hạn'
        },
        checkin: {
          creditsLoading: 'Điểm',
          creditsButtonLabel: 'Mở điểm danh hằng ngày',
          accountButtonLabel: 'Mở menu tài khoản',
          accountMenuLabel: 'Menu tài khoản',
          title: 'Điểm miễn phí hôm nay đã sẵn sàng',
          todayRewardText: 'Phần thưởng hôm nay: {credits} điểm',
          claimedRewardText: 'Hôm nay bạn đã nhận {credits} điểm.',
          nextCountdown: 'Lần nhận tiếp theo sau {time}',
          nextAt: '(Lần làm mới tiếp theo: {time} EST)',
          claimButton: 'Nhận {credits} điểm',
          claimingButton: 'Đang nhận...',
          notNow: 'Để sau',
          close: 'Đóng',
          loadFailed: 'Không thể tải trạng thái điểm danh.',
          claimFailed: 'Không thể nhận điểm.'
        },
        creditPurchase: {
          title: 'Mua điểm',
          description: 'Thêm điểm và tiếp tục tải xuống trong không gian làm việc này.',
          successTitle: 'Đã cộng điểm',
          successDescription: 'Số dư đã được cập nhật. Đóng cửa sổ này rồi bắt đầu tải lại.',
          packageEyebrow: 'Dùng đến đâu trả đến đó',
          cardNote: 'Dùng điểm cho tải xuống trên web. Điểm không hết hạn.',
          creditsAmount: '{credits} điểm',
          buyNow: 'Mua ngay',
          selectPackage: 'Chọn',
          paymentMethodLabel: 'Chọn phương thức thanh toán',
          paymentTitle: 'Chọn phương thức thanh toán',
          selectedPackageLabel: 'Sản phẩm đã chọn',
          confirmPurchase: 'Tiếp tục thanh toán',
          backToProducts: 'Quay lại',
          close: 'Đóng',
          agreementText: 'Tôi đồng ý với điều khoản mua hàng, Điều khoản và Chính sách quyền riêng tư.',
          loadingConfigs: 'Đang tải các gói điểm...',
          loadFailed: 'Không thể tải các gói điểm. Vui lòng thử lại.',
          noConfigs: 'Hiện không có gói điểm nào khả dụng. Vui lòng thử lại sau.',
          ready: 'Chọn một gói điểm. Giá được hiển thị bằng USD.',
          creatingOrder: 'Đang tạo đơn hàng...',
          pendingPayment: 'Hoàn tất thanh toán trong tab vừa mở. Chúng tôi sẽ tự động kiểm tra kết quả.',
          pendingPaymentTitle: 'Đang chờ thanh toán',
          cancelPayment: 'Hủy thanh toán',
          supportMailPrefix: 'Báo cáo sự cố: ',
          success: 'Thanh toán hoàn tất. Điểm đã có thể sử dụng.',
          failed: 'Thanh toán chưa hoàn tất. Bạn có thể thử lại hoặc đóng cửa sổ này.',
          successCredits: '+{credits} điểm đã cộng',
          successBalance: 'Số dư hiện tại: {balance} điểm',
          createFailed: 'Không thể tạo đơn hàng. Vui lòng thử lại.',
          invalidPaymentData: 'Liên kết thanh toán không hợp lệ. Vui lòng thử lại sau.',
          priceUpdated: 'Giá đã thay đổi. Kiểm tra giá mới nhất rồi mua lại.',
          gatewayFailed: 'Cổng thanh toán tạm thời không khả dụng. Vui lòng thử lại sau.',
          paymentCanceled: 'Thanh toán đã bị hủy. Chọn phương thức thanh toán và thử lại.',
          pollFailed: 'Không thể cập nhật trạng thái thanh toán. Vui lòng thử lại.',
          pollTimeout: 'Tự động cập nhật đã hết thời gian. Hãy làm mới kết quả sau khi thanh toán.',
          orderNotFound: 'Đơn hàng không còn khả dụng. Hãy tạo đơn mới.',
          orderExpired: 'Đơn hàng đã hết hạn. Hãy mua lại.',
          fulfillmentFailed: 'Đã nhận thanh toán nhưng điểm chưa được cộng. Vui lòng thử lại sau.',
          authExpired: 'Phiên đăng nhập đã hết hạn. Đăng nhập lại để tiếp tục.'
        },
        parse: {
          eyebrow: 'Phân tích trực tiếp',
          title: 'Trình Tải Video Riêng Tư Telegram: Tải Mọi Media Riêng Tư',
          helperText:
            'Lưu video kênh riêng tư Telegram với hướng dẫn tải đơn giản. Tải video và media có thể truy cập, khắc phục lỗi tải xuống và tìm phương pháp phù hợp cho thiết bị của bạn.',
          telegramMessageListLinkError:
            'Liên kết Telegram này mở cuộc trò chuyện hoặc kênh, không phải một tin nhắn cụ thể. Hãy sao chép đúng liên kết tin nhắn rồi dán vào đây.',
          linkLabel: 'Liên kết Telegram',
          linkPlaceholder: 'https://t.me/example/123',
          clearInput: 'Xóa nội dung nhập',
          submit: 'Dán Liên Kết Video Telegram',
          submitting: 'Đang phân tích...',
          noResults: 'Không tìm thấy tệp nào có thể tải xuống trong tin nhắn này.',
          download: 'Tải xuống',
          downloading: 'Đang tải xuống...',
          downloadAll: 'Download all',
          downloadingAll: 'Downloading all...',
          platformTelegram: 'Telegram',
          platformTikTok: 'TikTok',
          platformInstagram: 'Instagram',
          platformThreads: 'Threads',
          platformReddit: 'Reddit',
          platformDouyin: 'Douyin',
          unknownSize: 'Unknown size',
          play: 'Play',
          preparingPlayback: 'Preparing playback...',
          preparingMp4: 'Preparing MP4...',
          closePlayer: 'Close',
          continuePlayback: 'Continue playback',
          upgradeToPlay: 'Upgrade to play',
          playQuotaExhausted: 'Playback quota is used up for today.',
          playerRestoring: 'Restoring playback...',
          playerRestoredPaused: 'Ready. Continue from where you left off.',
          playerResumeFailed: 'Could not restore playback session. Please start again.',
          playerRefreshing: 'Refreshing playback...',
          playerRecreating: 'Recreating playback session...',
          playerUnsupported: 'This browser cannot play this video.',
          playerSessionExpired: 'Playback session expired. Start playback again.',
          playerFailed: 'Playback failed.',
          playQuotaUnavailable: 'Playback quota is unavailable. Sign in and try again.',
          playQuotaReached: 'Playback quota reached for today.',
          playerResourceBusy: 'This video is still being prepared. Try again in a moment.',
          resumeNotice:
            'Detected an unfinished download "{filename}" ({progress}). Do you want to continue?',
          resumeAction: 'Continue',
          pendingRestartText: 'Previous download record for "{filename}" can be restarted.',
          pendingRestartButton: 'Restart download',
          resumeUnavailableText: 'The local recovery record has expired.',
          resumeDismiss: 'Ignore',
          resuming: 'Resuming...',
          largeFileExtensionInlineChromeTitle: 'Tiện ích Chrome',
          largeFileExtensionInlineChromeDescription:
            'Tiện ích dành riêng cho Chrome để phát hiện media Telegram chỉ với một lần nhấp.',
          largeFileExtensionInlineChromeCta: 'Cài tiện ích',
          largeFileExtensionInlineEdgeTitle: 'Tiện ích Edge',
          largeFileExtensionInlineEdgeDescription:
            'Tiện ích dành riêng cho Microsoft Edge, tương thích với tải nội dung Telegram.',
          largeFileExtensionInlineEdgeCta: 'Cài tiện ích'
        },
        errors: {
          enterEmailFirst: 'Vui lòng nhập địa chỉ email trước.',
          enterEmailAndCode: 'Vui lòng nhập email và mã xác minh.',
          sendCodeFailed: 'Không thể gửi mã xác minh.',
          googleSignInFailed: 'Không thể đăng nhập bằng Google.',
          googleClientMissing: 'Chưa cấu hình đăng nhập Google.',
          restoreSessionFailed: 'Không thể khôi phục phiên đăng nhập.',
          signInFailed: 'Không thể đăng nhập.',
          logoutFailed: 'Không thể đăng xuất.',
          loadQuotaFailed: 'Không thể tải điểm.',
          enterLink: 'Vui lòng nhập liên kết phương tiện.',
          invalidLink: 'Đây không phải là URL hợp lệ.',
          parseFailed: 'Không thể phân tích liên kết này.',
          downloadFailed: 'Không thể tải tệp này.',
          unsafeFileTypeUseExtension:
            'Installers, scripts, and similar files may carry unknown risks. For security reasons, the website cannot provide downloads for this file type. You can still use the browser extension to download it.',
          unsafeFileTypeConfirmTitle: 'Use the browser extension',
          unsafeFileTypeConfirmViewExtension: 'View extension download',
          unsafeFileTypeConfirmCancel: 'Cancel',
          clientMuxFailed: 'Failed to generate MP4.',
          clientMuxTooLarge: 'This Reddit video is over the current 50MB browser merge limit.',
          trackFetchFailed: 'Failed to download Reddit video tracks.',
          unsupportedPlatform: 'This link platform is not supported.',
          tiktokUnsupported: 'This TikTok link cannot be parsed yet. Use a public single video or photo post link.',
          vimeoParseFailed: 'This Vimeo video is private or cannot be parsed.',
          xParseFailed: 'Liên kết X này không được hỗ trợ. Hãy dùng trạng thái video công khai.',
          instagramParseFailed: 'Liên kết Instagram này không được hỗ trợ. Hãy dùng bài đăng công khai.',
          instagramImageParseFailed: 'Liên kết Instagram này không được hỗ trợ. Hãy dùng bài đăng ảnh công khai.',
          threadsParseFailed: 'Liên kết Threads này không được hỗ trợ. Hãy dùng bài đăng công khai.',
          redditParseFailed: 'Không thể tải nội dung Reddit. Hãy dùng bài đăng video, ảnh hoặc thư viện công khai.',
          douyinParseFailed: 'Không thể tải video Douyin này. Hãy dùng liên kết video công khai.',
          quotaExceeded: 'Không đủ điểm để tải tệp này.',
          rateLimitExceeded: 'Too many requests. Please try again later.'
        },
        downloadAll: {
          allSuccess: 'All files downloaded.',
          partialFailed: 'Some files downloaded. Some files failed.',
          allFailed: 'All downloads failed.'
        },
        requiresClient: {
          privateChannel:
            'Unable to parse Telegram private channel content here. The free browser extension can download videos from any private channel you can access in Telegram Web.\nYou can try:\nPath 1 (recommended): click the "Download free extension" button to install the desktop browser extension.\nPath 2:\n1. Go back to Telegram.\n2. Right-click the message you want to download and choose Forward to send it to a public channel or group.\n3. Open that public channel or group.\n4. Right-click the forwarded message, copy its public message link, then paste it here.',
          privateChannelCta: 'Download free extension',
          restrictedFile: 'This restricted file needs TG Downloader inside Telegram Web.',
          floodWait:
            'The website Telegram accounts are cooling down. Install TG Downloader and continue from Telegram Web with your browser session.'
        }
      },
      crossLinks: {
        title: 'Thêm Công Cụ Tải Video',
        items: [
          {
            label: 'TikTok Downloader',
            href: '/tiktok-downloader/',
            description: 'Tải video TikTok không có watermark với chất lượng HD.'
          },
          {
            label: 'X (Twitter) Downloader',
            href: '/x-downloader/',
            description: 'Tải video và GIF từ X/Twitter với chất lượng HD.'
          },
          {
            label: 'Vimeo Downloader',
            href: '/vimeo-downloader/',
            description: 'Tải video Vimeo HD với nhiều tùy chọn độ phân giải.'
          },
          {
            label: 'Instagram Downloader',
            href: '/instagram-downloader/',
            description: 'Tải ảnh, Reels và carousel Instagram chất lượng HD.'
          },
          {
            label: 'Threads Downloader',
            href: '/threads-downloader/',
            description: 'Tải video và ảnh Threads chất lượng gốc.'
          }
        ]
      }
    },
    changelog: {
      title: 'Nhật ký tải video Telegram',
      description:
        'Theo dõi từng cập nhật về tải video Telegram, luồng web và các phiên lưu dài hơn.',
      seoTitle: 'Nhật ký tải video Telegram | TG Downloader',
      seoDescription:
        'Đọc nhật ký tải video Telegram này để xem thay đổi về luồng web, tệp lớn và các phiên bản mới nhất.',
      entries: [
        {
          version: '1.1.3',
          date: '2025-01-15',
          title: 'Cải Hiện Hiệu Suất',
          description: 'Cải tiến hiệu suất đáng kể để mang lại trải nghiệm người dùng tốt hơn.',
          features: [
            'Tốc độ phát hiện tài nguyên được cải thiện 50%',
            'Tối ưu hóa độ ổn định khi tải tệp lớn',
            'Cải thiện khả năng phản hồi của giao diện'
          ]
        },
        {
          version: '1.1.2',
          date: '2024-11-10',
          title: 'Hỗ Đa Ngôn Ngữ',
          description: 'Đã thêm hỗ trợ cho 14 ngôn ngữ trên toàn cầu.',
          features: [
            'Đã thêm hỗ trợ tiếng Nhật, Hàn Quốc và nhiều ngôn ngữ khác',
            'Cải thiện độ chính xác của bản dịch',
            'Đã thêm tính năng phát hiện ngôn ngữ tự động'
          ]
        },
        {
          version: '1.1.0',
          date: '2024-09-01',
          title: 'Tải Xuống Thanh Bên',
          description: 'Tính năng tải xuống thanh bên mới với hỗ trợ hàng loạt.',
          features: [
            'Đã thêm tải xuống tệp đơn thanh bên',
            'Đã thêm tính năng tải xuống hàng loạt',
            'Cải thiện quản lý hàng đợi tải xuống'
          ]
        },
        {
          version: '1.0.2',
          date: '2024-08-15',
          title: 'Bảo Mật và Quyền Riêng Tư',
          description: 'Cải tiến bảo mật và tăng cường quyền riêng tư.',
          features: [
            'Đã xóa tất cả theo dõi phân tích',
            'Đã thêm chế độ xử lý chỉ cục bộ',
            'Cải thiện mã hóa dữ liệu'
          ]
        },
        {
          version: '1.0.0',
          date: '2024-07-01',
          title: 'Phiên Bản Ban Đầu',
          description: 'Phiên bản đầu tiên với hỗ trợ tải xuống cửa sổ chat.',
          features: [
            'Tính năng tải xuống cửa sổ chat',
            'Hỗ trợ Telegram Web phiên bản K và A',
            'Hỗ trợ định dạng media cơ bản'
          ]
        }
      ],
      labels: {
        features: 'New Features',
        fixes: 'Bug Fixes'
      }
    } as SiteContent['pages']['changelog'] & {
      seoTitle: string
      seoDescription: string
    },
    pricing: viVNPricingContent,
    downloadDisabledChannelWorkaround: downloadDisabledChannelWorkaroundContent['vi-VN'],
    extensionLoginV2: {
      title: 'Đăng nhập tiện ích | TG Downloader',
      description:
        'Đăng nhập TG Downloader và đồng bộ phiên trang web của bạn với tiện ích trình duyệt.',
      eyebrow: 'Tiện ích trình duyệt',
      heading: 'Đăng nhập TG Downloader',
      checkingState: 'Đang kiểm tra phiên',
      signInRequiredState: 'Cần đăng nhập',
      syncedState: 'Đã đăng nhập',
      verificationFailedState: 'Xác minh thất bại',
      preparingTitle: 'Đang chuẩn bị đăng nhập…',
      preparingText: 'TG Downloader đang chuẩn bị kiểm tra phiên trang web.',
      checkingSessionTitle: 'Đang kiểm tra phiên trang web…',
      checkingSessionText:
        'TG Downloader đang xác minh mã thông báo trang web được lưu trong trình duyệt này.',
      finishingGoogleTitle: 'Đang hoàn tất đăng nhập Google…',
      finishingGoogleText:
        'TG Downloader đang trao đổi kết quả đăng nhập Google để lấy phiên trang web.',
      signInRequiredTitle: 'Đăng nhập để tiếp tục',
      signInRequiredText: 'Hãy dùng cùng cửa sổ đăng nhập TG Downloader như trên trang web.',
      signInButtonLabel: 'Đăng nhập',
      syncingTitle: 'Đang đồng bộ mã thông báo tiện ích…',
      syncingText:
        'TG Downloader đang trao đổi phiên trang web của bạn để lấy mã thông báo tiện ích.',
      syncedTitle: 'Đăng nhập thành công',
      syncedText:
        'Tiện ích đã kết nối với tài khoản TG Downloader của bạn. Nhấp vào Quay lại Telegram để trở về.',
      returnButtonLabel: 'Quay lại Telegram',
      returningButtonLabel: 'Đang quay lại…',
      verificationFailedTitle: 'Không thể hoàn tất đăng nhập tiện ích',
      retryButtonLabel: 'Thử lại',
    },
    platformDownloaders: {
      tiktok: {
        seo: {
          title: 'Tải Video TikTok Không Watermark - Chất Lượng HD | TG Downloader',
          description:
            'Tải video TikTok không watermark với chất lượng HD miễn phí. Không cần cài ứng dụng. Lưu video, slideshow và story TikTok ngay lập tức.',
          keywords:
            'tải video tiktok, tải tiktok không watermark, tải video tiktok hd, lưu video tiktok, tải tiktok miễn phí, tiktok downloader'
        },
        workspace: {
          title: 'Tải Video TikTok Không Watermark',
          helperText:
            'Dán liên kết video TikTok bất kỳ để tải không watermark với chất lượng HD. Cũng hỗ trợ liên kết Telegram, X và Vimeo.',
          linkPlaceholder: 'https://www.tiktok.com/@user/video/1234567890'
        },
        features: {
          title: 'Tại Sao Dùng Công Cụ Tải TikTok Của Chúng Tôi',
          subtitle: 'Lưu video TikTok với chất lượng cao nhất không watermark, hoàn toàn miễn phí.',
          items: [
            {
              title: 'Không Watermark',
              description:
                'Tải video TikTok không có lớp watermark TikTok. Nhận video gốc sạch, chất lượng cao sẵn sàng lưu hoặc chia sẻ.'
            },
            {
              title: 'Chất Lượng HD',
              description:
                'Lưu video TikTok ở độ phân giải HD gốc. Không giảm chất lượng, không nén — đúng như người tạo đã tải lên.'
            },
            {
              title: 'Nhanh & Miễn Phí',
              description:
                'Không cần cài ứng dụng, không đăng ký, không phí ẩn. Dán liên kết, nhận video. Hoạt động ngay trên mọi trình duyệt.'
            }
          ]
        },
        howTo: {
          title: 'Cách Tải Video TikTok Không Watermark',
          subtitle:
            'Ba bước đơn giản để lưu bất kỳ video TikTok nào với chất lượng HD không watermark.',
          steps: [
            {
              title: 'Sao chép liên kết video TikTok',
              description:
                'Mở TikTok, nhấn nút Chia sẻ trên video và chọn "Sao chép liên kết".'
            },
            {
              title: 'Dán liên kết ở trên',
              description:
                'Dán URL TikTok đã sao chép vào ô nhập liệu và nhấp Phân tích.'
            },
            {
              title: 'Tải không watermark',
              description:
                'Nhấp nút Tải xuống để lưu video TikTok HD không có watermark.'
            }
          ]
        },
        faq: {
          title: 'Câu Hỏi Thường Gặp Về Tải TikTok',
          items: [
            {
              question: 'Công cụ tải TikTok này có thực sự miễn phí không?',
              answer:
                'Có, hoàn toàn miễn phí không có phí ẩn. Bạn có thể tải video TikTok không watermark mà không mất chi phí.'
            },
            {
              question: 'Video tải về có watermark không?',
              answer:
                'Không. Công cụ của chúng tôi loại bỏ watermark TikTok và cung cấp video gốc sạch với chất lượng HD.'
            },
            {
              question: 'Chất lượng video TikTok tải về như thế nào?',
              answer:
                'Video được lưu ở độ phân giải HD gốc như người tạo đã tải lên, không giảm chất lượng.'
            },
            {
              question: 'Tôi có cần cài ứng dụng hoặc tiện ích không?',
              answer:
                'Không cần cài đặt. Đây là công cụ trên web hoạt động trực tiếp trong trình duyệt trên mọi thiết bị.'
            },
            {
              question: 'Tôi có thể tải TikTok Story và Slideshow không?',
              answer:
                'Có, công cụ hỗ trợ video TikTok, slideshow ảnh và story. Dán liên kết và tải xuống.'
            }
          ]
        },
        crossLinks: {
          title: 'Thêm Công Cụ Tải Video',
          items: [
            {
              label: 'X (Twitter) Downloader',
              href: '/x-downloader/',
              description: 'Tải video và GIF từ X/Twitter với chất lượng HD.'
            },
            {
              label: 'Vimeo Downloader',
              href: '/vimeo-downloader/',
              description: 'Tải video Vimeo HD với nhiều tùy chọn độ phân giải.'
            },
            {
              label: 'Instagram Downloader',
              href: '/instagram-downloader/',
              description: 'Tải ảnh, Reels và carousel Instagram chất lượng HD.'
            },
            {
              label: 'Threads Downloader',
              href: '/threads-downloader/',
              description: 'Tải video và ảnh Threads chất lượng gốc.'
            },
            {
              label: 'Telegram Downloader',
              href: '/',
              description: 'Tải video Telegram từ kênh và nhóm với chất lượng HD.'
            }
          ]
        }
      },
      x: {
        seo: {
          title: 'Tải Video X (Twitter) - Lưu Video & GIF HD | TG Downloader',
          description:
            'Tải video và GIF từ X (Twitter) với chất lượng HD miễn phí. Không cần ứng dụng. Lưu video hoặc GIF từ bất kỳ tweet công khai nào ngay lập tức.',
          keywords:
            'tải video twitter, tải video x, x downloader, tải gif twitter, lưu video twitter, tải video x miễn phí'
        },
        workspace: {
          title: 'Tải Video X (Twitter)',
          helperText:
            'Dán liên kết video X hoặc Twitter bất kỳ để tải với chất lượng cao nhất. Cũng hỗ trợ liên kết Telegram, TikTok và Vimeo.',
          linkPlaceholder: 'https://x.com/user/status/1234567890'
        },
        features: {
          title: 'Tại Sao Dùng Công Cụ Tải Video X Của Chúng Tôi',
          subtitle: 'Lưu video và GIF từ X/Twitter với chất lượng gốc, hoàn toàn miễn phí.',
          items: [
            {
              title: 'Video & GIF',
              description:
                'Tải cả bài đăng video và GIF động từ X (Twitter). Nhận đúng media như hiển thị trong tweet.'
            },
            {
              title: 'Chất Lượng HD Gốc',
              description:
                'Lưu video X ở độ phân giải cao nhất có sẵn. Không giảm chất lượng — nhận cùng bitrate như nguồn.'
            },
            {
              title: 'Nhanh & Miễn Phí',
              description:
                'Không cần cài ứng dụng, không cần đăng nhập. Dán URL tweet, nhận video hoặc GIF tải về trong vài giây.'
            }
          ]
        },
        howTo: {
          title: 'Cách Tải Video X (Twitter)',
          subtitle:
            'Ba bước đơn giản để lưu bất kỳ video hoặc GIF nào từ X/Twitter.',
          steps: [
            {
              title: 'Sao chép URL tweet',
              description:
                'Trên X (Twitter), nhấp biểu tượng Chia sẻ trên tweet và chọn "Sao chép liên kết".'
            },
            {
              title: 'Dán liên kết ở trên',
              description:
                'Dán URL X/Twitter đã sao chép vào ô nhập liệu và nhấp Phân tích.'
            },
            {
              title: 'Tải video hoặc GIF',
              description:
                'Nhấp Tải xuống để lưu video hoặc GIF với chất lượng HD về thiết bị của bạn.'
            }
          ]
        },
        faq: {
          title: 'Câu Hỏi Thường Gặp Về Tải Video X',
          items: [
            {
              question: 'Làm thế nào để tải video từ X (Twitter)?',
              answer:
                'Sao chép URL tweet chứa video, dán vào ô nhập liệu ở trên và nhấp Phân tích. Sau đó nhấp Tải xuống để lưu video.'
            },
            {
              question: 'Tôi có thể tải GIF từ X không?',
              answer:
                'Có. Công cụ hỗ trợ cả video và GIF động từ bài đăng X/Twitter. GIF được lưu dưới dạng MP4 để tương thích tốt nhất.'
            },
            {
              question: 'Chất lượng video có sẵn là gì?',
              answer:
                'Chúng tôi cung cấp chất lượng cao nhất có sẵn cho mỗi tweet, thường là độ phân giải HD gốc do người đăng tải lên.'
            },
            {
              question: 'Công cụ tải X này có miễn phí không?',
              answer:
                'Có, hoàn toàn miễn phí không cần đăng ký. Tải video và GIF từ X mà không mất chi phí.'
            },
            {
              question: 'Tôi có cần tài khoản X/Twitter để tải không?',
              answer:
                'Không cần tài khoản. Miễn là tweet công khai, bạn có thể tải video hoặc GIF mà không cần đăng nhập.'
            }
          ]
        },
        crossLinks: {
          title: 'Thêm Công Cụ Tải Video',
          items: [
            {
              label: 'TikTok Downloader',
              href: '/tiktok-downloader/',
              description: 'Tải video TikTok không watermark với chất lượng HD.'
            },
            {
              label: 'Vimeo Downloader',
              href: '/vimeo-downloader/',
              description: 'Tải video Vimeo HD với nhiều tùy chọn độ phân giải.'
            },
            {
              label: 'Instagram Downloader',
              href: '/instagram-downloader/',
              description: 'Tải ảnh, Reels và carousel Instagram chất lượng HD.'
            },
            {
              label: 'Threads Downloader',
              href: '/threads-downloader/',
              description: 'Tải video và ảnh Threads chất lượng gốc.'
            },
            {
              label: 'Telegram Downloader',
              href: '/',
              description: 'Tải video Telegram từ kênh và nhóm với chất lượng HD.'
            }
          ]
        }
      },
      vimeo: {
        seo: {
          title: 'Tải Video Vimeo HD - Nhiều Độ Phân Giải | TG Downloader',
          description:
            'Tải video Vimeo với chất lượng HD và nhiều tùy chọn độ phân giải miễn phí. Không cần ứng dụng. Lưu bất kỳ video Vimeo công khai nào ngay lập tức.',
          keywords:
            'tải video vimeo, vimeo downloader, tải vimeo hd, lưu video vimeo, tải video vimeo miễn phí, vimeo hd download'
        },
        workspace: {
          title: 'Tải Video Vimeo HD',
          helperText:
            'Dán liên kết video Vimeo bất kỳ để tải với chất lượng HD và chọn độ phân giải. Cũng hỗ trợ liên kết Telegram, TikTok và X.',
          linkPlaceholder: 'https://vimeo.com/123456789'
        },
        features: {
          title: 'Tại Sao Dùng Công Cụ Tải Vimeo Của Chúng Tôi',
          subtitle: 'Lưu video Vimeo với chất lượng HD và tùy chọn độ phân giải, hoàn toàn miễn phí.',
          items: [
            {
              title: 'Chất Lượng HD Gốc',
              description:
                'Tải video Vimeo ở độ phân giải HD đầy đủ. Nhận cùng chất lượng sắc nét mà người tạo đã tải lên.'
            },
            {
              title: 'Nhiều Độ Phân Giải',
              description:
                'Chọn từ các độ phân giải có sẵn (360p, 720p, 1080p và hơn). Chọn chất lượng phù hợp nhu cầu.'
            },
            {
              title: 'Nhanh & Miễn Phí',
              description:
                'Không cần cài ứng dụng, không cần tài khoản. Dán liên kết Vimeo, chọn độ phân giải và tải ngay.'
            }
          ]
        },
        howTo: {
          title: 'Cách Tải Video Vimeo HD',
          subtitle:
            'Ba bước đơn giản để lưu bất kỳ video Vimeo nào với độ phân giải ưa thích.',
          steps: [
            {
              title: 'Sao chép liên kết video Vimeo',
              description:
                'Mở trang video Vimeo và sao chép URL từ thanh địa chỉ trình duyệt.'
            },
            {
              title: 'Dán liên kết ở trên',
              description:
                'Dán URL Vimeo đã sao chép vào ô nhập liệu và nhấp Phân tích.'
            },
            {
              title: 'Chọn độ phân giải và tải',
              description:
                'Chọn độ phân giải video ưa thích và nhấp Tải xuống để lưu video HD.'
            }
          ]
        },
        faq: {
          title: 'Câu Hỏi Thường Gặp Về Tải Vimeo',
          items: [
            {
              question: 'Làm thế nào để tải video từ Vimeo?',
              answer:
                'Sao chép URL trang video Vimeo, dán vào ô nhập liệu ở trên, nhấp Phân tích, sau đó chọn độ phân giải ưa thích và tải xuống.'
            },
            {
              question: 'Tôi có thể chọn độ phân giải video không?',
              answer:
                'Có. Sau khi phân tích, bạn có thể chọn từ tất cả độ phân giải có sẵn bao gồm 360p, 720p, 1080p và cao hơn khi có.'
            },
            {
              question: 'Công cụ tải Vimeo này có miễn phí không?',
              answer:
                'Có, hoàn toàn miễn phí. Tải video Vimeo với chất lượng HD mà không mất chi phí hoặc cần đăng ký.'
            },
            {
              question: 'Tôi có cần tài khoản Vimeo để tải không?',
              answer:
                'Không cần tài khoản. Bạn có thể tải bất kỳ video Vimeo công khai nào mà không cần đăng nhập.'
            },
            {
              question: 'Video tải về có định dạng gì?',
              answer:
                'Video Vimeo được tải ở định dạng MP4, tương thích với hầu hết mọi thiết bị và trình phát.'
            }
          ]
        },
        crossLinks: {
          title: 'Thêm Công Cụ Tải Video',
          items: [
            {
              label: 'TikTok Downloader',
              href: '/tiktok-downloader/',
              description: 'Tải video TikTok không watermark với chất lượng HD.'
            },
            {
              label: 'X (Twitter) Downloader',
              href: '/x-downloader/',
              description: 'Tải video và GIF từ X/Twitter với chất lượng HD.'
            },
            {
              label: 'Instagram Downloader',
              href: '/instagram-downloader/',
              description: 'Tải ảnh, Reels và carousel Instagram chất lượng HD.'
            },
            {
              label: 'Threads Downloader',
              href: '/threads-downloader/',
              description: 'Tải video và ảnh Threads chất lượng gốc.'
            },
            {
              label: 'Telegram Downloader',
              href: '/',
              description: 'Tải video Telegram từ kênh và nhóm với chất lượng HD.'
            }
          ]
        }
      },
      instagram: {
        seo: {
          title: 'Tải Ảnh và Video Instagram - Chất Lượng HD | TG Downloader',
          description:
            'Tải ảnh, Reels và carousel Instagram chất lượng HD miễn phí. Không cần cài app, lưu ngay lập tức.',
          keywords:
            'tải Instagram, tải ảnh Instagram, tải Reels Instagram, tải carousel Instagram, lưu video Instagram, trình tải Instagram miễn phí'
        },
        workspace: {
          title: 'Tải Ảnh và Video Instagram',
          helperText:
            'Dán link bài viết Instagram để tải ảnh, Reels và carousel chất lượng HD. Hỗ trợ cả link Telegram, TikTok và X.',
          linkPlaceholder: 'https://www.instagram.com/p/ABC123xyz/'
        },
        features: {
          title: 'Tại sao chọn trình tải Instagram của chúng tôi',
          subtitle: 'Lưu ảnh, Reels và carousel Instagram chất lượng HD gốc. Hoàn toàn miễn phí.',
          items: [
            {
              title: 'Ảnh và Reels',
              description:
                'Tải ảnh và video Reels Instagram chất lượng gốc. Nhận chính xác nội dung mà người tạo đã đăng.'
            },
            {
              title: 'Tải hàng loạt carousel',
              description:
                'Tải tất cả ảnh và video từ bài carousel Instagram cùng lúc. Không cần lưu từng cái một.'
            },
            {
              title: 'Chất lượng HD gốc',
              description:
                'Lưu media Instagram ở độ phân giải cao nhất có sẵn. Không nén, không giảm chất lượng.'
            }
          ]
        },
        howTo: {
          title: 'Cách tải ảnh và video từ Instagram',
          subtitle:
            'Ba bước đơn giản để lưu bất kỳ bài viết Instagram nào chất lượng HD.',
          steps: [
            {
              title: 'Sao chép link bài viết Instagram',
              description:
                'Mở Instagram, nhấn vào ba chấm ở bài viết và chọn "Sao chép liên kết".'
            },
            {
              title: 'Dán link ở trên',
              description:
                'Dán URL Instagram đã sao chép vào ô nhập liệu và nhấn "Phân tích".'
            },
            {
              title: 'Tải về HD',
              description:
                'Nhấn nút "Tải xuống" để lưu ảnh, Reels hoặc carousel chất lượng gốc.'
            }
          ]
        },
        faq: {
          title: 'Câu hỏi thường gặp về trình tải Instagram',
          items: [
            {
              question: 'Trình tải Instagram này có thực sự miễn phí không?',
              answer:
                'Có, hoàn toàn miễn phí không có phí ẩn. Tải ảnh, Reels và carousel Instagram miễn phí.'
            },
            {
              question: 'Hỗ trợ những định dạng nào?',
              answer:
                'Chúng tôi hỗ trợ tải ảnh Instagram (JPG), video Reels (MP4) và album carousel đầy đủ với tất cả media.'
            },
            {
              question: 'Chất lượng file tải về như thế nào?',
              answer:
                'Tất cả media được lưu ở độ phân giải HD gốc của người tạo, không giảm chất lượng hay nén.'
            },
            {
              question: 'Có cần tài khoản Instagram để tải không?',
              answer:
                'Không cần. Chỉ cần bài viết là công khai, bạn có thể tải media mà không cần đăng nhập.'
            },
            {
              question: 'Có thể tải Instagram Stories không?',
              answer:
                'Hiện tại chúng tôi hỗ trợ bài viết, Reels và carousel. Tải Stories yêu cầu nội dung có thể truy cập công khai qua link trực tiếp.'
            }
          ]
        },
        crossLinks: {
          title: 'Thêm trình tải video',
          items: [
            {
              label: 'TikTok Downloader',
              href: '/tiktok-downloader/',
              description: 'Tải video TikTok không watermark chất lượng HD.'
            },
            {
              label: 'X (Twitter) Downloader',
              href: '/x-downloader/',
              description: 'Tải video và GIF X/Twitter chất lượng HD.'
            },
            {
              label: 'Vimeo Downloader',
              href: '/vimeo-downloader/',
              description: 'Tải video Vimeo HD với nhiều tùy chọn độ phân giải.'
            },
            {
              label: 'Threads Downloader',
              href: '/threads-downloader/',
              description: 'Tải video và ảnh Threads chất lượng gốc.'
            },
            {
              label: 'Telegram Downloader',
              href: '/',
              description: 'Tải video từ kênh và nhóm Telegram chất lượng HD.'
            }
          ]
        }
      },
      threads: {
        seo: {
          title: 'Tải Video và Ảnh Threads - Chất Lượng Gốc | TG Downloader',
          description:
            'Tải video và ảnh từ Threads chất lượng gốc miễn phí. Không cần cài app, lưu media bao gồm carousel ngay lập tức.',
          keywords:
            'tải Threads, tải video Threads, download video Threads, tải media Threads, lưu video Threads, trình tải Threads miễn phí'
        },
        workspace: {
          title: 'Tải Video và Ảnh Threads',
          helperText:
            'Dán link bài viết Threads để tải video và ảnh chất lượng gốc. Hỗ trợ cả link Telegram, TikTok và Instagram.',
          linkPlaceholder: 'https://www.threads.net/@user/post/ABC123xyz'
        },
        features: {
          title: 'Tại sao chọn trình tải Threads của chúng tôi',
          subtitle: 'Lưu video và ảnh Threads chất lượng gốc. Hoàn toàn miễn phí.',
          items: [
            {
              title: 'Media hỗn hợp',
              description:
                'Tải video và ảnh từ bài viết Threads. Hỗ trợ bài viết có nhiều loại nội dung.'
            },
            {
              title: 'Chất lượng gốc',
              description:
                'Lưu media Threads ở độ phân giải cao nhất có sẵn. Không nén, không giảm chất lượng.'
            },
            {
              title: 'Hỗ trợ carousel',
              description:
                'Tải tất cả media từ bài carousel Threads cùng lúc. Nhận mọi ảnh và video trong một thao tác.'
            }
          ]
        },
        howTo: {
          title: 'Cách tải video và ảnh từ Threads',
          subtitle:
            'Ba bước đơn giản để lưu bất kỳ bài viết Threads nào chất lượng gốc.',
          steps: [
            {
              title: 'Sao chép link bài viết Threads',
              description:
                'Mở Threads, nhấn vào biểu tượng chia sẻ của bài viết và chọn "Sao chép liên kết".'
            },
            {
              title: 'Dán link ở trên',
              description:
                'Dán URL Threads đã sao chép vào ô nhập liệu và nhấn "Phân tích".'
            },
            {
              title: 'Tải media',
              description:
                'Nhấn nút "Tải xuống" để lưu video và ảnh chất lượng gốc.'
            }
          ]
        },
        faq: {
          title: 'Câu hỏi thường gặp về trình tải Threads',
          items: [
            {
              question: 'Trình tải Threads này có thực sự miễn phí không?',
              answer:
                'Có, hoàn toàn miễn phí không có phí ẩn. Tải video và ảnh Threads miễn phí.'
            },
            {
              question: 'Hỗ trợ những loại media nào?',
              answer:
                'Chúng tôi hỗ trợ tải video, ảnh và bài viết media hỗn hợp từ Threads, bao gồm bài carousel có nhiều mục.'
            },
            {
              question: 'Chất lượng file tải về như thế nào?',
              answer:
                'Tất cả media được lưu ở độ phân giải gốc của người tạo, không giảm chất lượng.'
            },
            {
              question: 'Có cần tài khoản Threads để tải không?',
              answer:
                'Không cần. Chỉ cần bài viết là công khai, bạn có thể tải media mà không cần đăng nhập.'
            },
            {
              question: 'Có thể tải bài carousel có nhiều ảnh không?',
              answer:
                'Có, trình tải của chúng tôi hỗ trợ đầy đủ bài carousel Threads. Tất cả ảnh và video trong carousel đều có thể tải.'
            }
          ]
        },
        crossLinks: {
          title: 'Thêm trình tải video',
          items: [
            {
              label: 'TikTok Downloader',
              href: '/tiktok-downloader/',
              description: 'Tải video TikTok không watermark chất lượng HD.'
            },
            {
              label: 'X (Twitter) Downloader',
              href: '/x-downloader/',
              description: 'Tải video và GIF X/Twitter chất lượng HD.'
            },
            {
              label: 'Vimeo Downloader',
              href: '/vimeo-downloader/',
              description: 'Tải video Vimeo HD với nhiều tùy chọn độ phân giải.'
            },
            {
              label: 'Instagram Downloader',
              href: '/instagram-downloader/',
              description: 'Tải ảnh, Reels và carousel Instagram chất lượng HD.'
            },
            {
              label: 'Telegram Downloader',
              href: '/',
              description: 'Tải video từ kênh và nhóm Telegram chất lượng HD.'
            }
          ]
        }
      }

    }
  }
}
