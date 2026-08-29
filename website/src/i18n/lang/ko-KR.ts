import type { SiteContent } from '../schema'
import { downloadDisabledChannelWorkaroundContent } from '../downloadDisabledChannelWorkaround'
import { koKRPricingContent } from '../pricing'

export const koKR: SiteContent = {
  site: {
    name: 'Telegram 동영상 다운로드 | TG Downloader',
    description:
      'Telegram Web에서 Telegram 동영상 다운로드 를 진행하고 이미 로드한 파일과 미디어를 저장한 뒤 Telegram 비공개 채널 흐름으로 이어가세요.',
    keywords:
      'Telegram 동영상 다운로드, Telegram 미디어 다운로드, Telegram 동영상 저장, Telegram 파일 다운로드, Telegram 비공개 채널'
  },
  layout: {
    nav: {
      brand: 'TG 다운로더',
      home: '홈',
      pricing: '요금',
      solutions: '솔루션',
      changelog: '변경 로그'
    },
    footer: {
      resources: '자료',
      rights: '© 2026 TG Downloader. All rights reserved.'
    }
  },
  common: {
    installCta: '지금 설치'
  },
  sections: {
    features: {
      title: 'Telegram 미디어 다운로드 기능',
      subtitle:
        '이 Telegram 미디어 다운로드 기능은 파일, 이미지, 동영상, 대형 배치, Telegram Web에서 이미 로드한 콘텐츠를 함께 다룹니다.',
      metaDescription:
        'TG Downloader 기능: 다중 파일 일괄 저장, 비공개 채널 지원, 1GB 이상 대용량 파일 다운로드, 실시간 미디어 감지, 그리고 로그인이 필요 없는 프라이버시 우선 설계.',
      items: [
        {
          title: '일괄 다운로드',
          description:
            '다중 선택 일괄 다운로드 지원, 원클릭으로 채널 또는 그룹의 모든 미디어 파일 다운로드',
          details: [
            '다중 선택 일괄 다운로드 지원',
            '원클릭으로 전체 채널/그룹 다운로드',
            '파일 유형별 스마트 필터링',
            '다운로드 큐 관리'
          ]
        },
        {
          title: '제한된 콘텐츠',
          description: '권한이 없어도 제한된 채널 및 비공개 그룹의 미디어 콘텐츠 다운로드 가능',
          details: [
            '제한된 채널 콘텐츠 액세스',
            '비공개 그룹에서 다운로드',
            '권한 검증 불필요',
            'A/K 버전 지원'
          ]
        },
        {
          title: '다중 형식 지원',
          description: '이미지, 비디오, GIF, 오디오 등 다양한 미디어 형식 지원',
          details: [
            '이미지: JPG, PNG, WEBP, GIF',
            '비디오: MP4, WEBM, MOV',
            '오디오: MP3, M4A, OGG',
            '자동 형식 감지'
          ]
        },
        {
          title: '안전하고 보안',
          description:
            '비밀번호 또는 API 로그인이 필요하지 않으며 사용자 데이터를 수집하지 않습니다',
          details: [
            '비밀번호 또는 API 로그인 불필요',
            '사용자 데이터 수집 없음',
            '바이러스 및 광고 없음',
            '엄격한 보안 테스트'
          ]
        },
        {
          title: '대형 파일 지원',
          description: '재개 지원으로 1GB 이상의 대형 파일을 안정적으로 다운로드',
          details: [
            '1GB+ 대형 파일 안정 다운로드',
            '중단된 다운로드 재개 지원',
            '빠르고 안정적인 전송',
            '진행 상황 추적'
          ]
        },
        {
          title: '실시간 감지',
          description:
            '미디어 리소스를 자동으로 스캔하고 감지하여 다운로드 목록을 실시간으로 업데이트',
          details: [
            '페이지 미디어 리소스 자동 스캔',
            '실시간 리소스 감지',
            '자동 목록 업데이트',
            '스마트 리소스 캐싱'
          ]
        }
      ]
    },
    steps: {
      title: 'Telegram 동영상 저장 가이드',
      subtitle:
        '이 Telegram 동영상 저장 가이드에서는 Telegram Web에서 메시지를 열고 동영상이나 다른 미디어를 몇 단계 안에 저장할 수 있습니다.',
      metaDescription:
        'TG Downloader로 Telegram 동영상, 파일, 앨범을 저장하는 단계별 가이드. 확장 프로그램 설치, Telegram Web에서 미디어 감지, 콘텐츠 일괄 다운로드 방법을 알아보세요.',
      items: [
        {
          title: '확장 프로그램 설치',
          description: '브라우저 확장 프로그램 스토어에서 검색하여 TG Downloader 설치'
        },
        {
          title: '확장 프로그램 고정',
          description: '브라우저 도구 모음을 클릭하여 빠른 액세스를 위해 확장 프로그램 아이콘 고정'
        },
        {
          title: 'Telegram Web 열기',
          description:
            'web.telegram.org에 접속하면 확장 프로그램이 자동으로 미디어 리소스 스캔 시작'
        },
        {
          title: '일괄 다운로드',
          description: '다운로드할 파일을 선택하고 다운로드 버튼을 클릭하여 로컬로 저장'
        }
      ]
    },
    cta: {
      title: '지금 시작하세요',
      description: '확장 프로그램을 설치하고 지금 바로 Telegram에서 미디어를 다운로드하세요.'
    },
    techSpecs: {
      title: '기술 사양',
      browsersLabel: '브라우저',
      browsers: 'Chrome, Edge, Brave 및 모든 Chromium 기반 브라우저',
      telegramVersionsLabel: 'Telegram 버전',
      telegramVersions: 'Web K 버전 및 A 버전',
      permissionsLabel: '권한',
      permissions: '최소 권한 필요',
      updatesLabel: '업데이트',
      updates: '확장 프로그램 스토어에서 자동 업데이트'
    }
  },
  pages: {
    homepage: {
      hero: {
        title: 'Telegram 비공개 채널 및 제한된 채널에서 미디어 다운로드',
        description:
          '원클릭, 로그인 불필요, 1GB+ 파일 지원. 비공개 채널 및 제한된 콘텐츠를 일괄 다운로드하세요.'
      },
      stats: {
        users: '전 세계 사용자',
        downloads: '총 다운로드'
      },
      seo: {
        title: 'Telegram 비공개 동영상 다운로더: 모든 비공개 미디어 다운로드',
        description:
          '쉬운 다운로더 가이드로 Telegram 비공개 채널 동영상을 저장하세요. 접근 가능한 동영상과 미디어를 다운로드하고, 실패한 다운로드를 해결하며, 기기에 맞는 방법을 찾아보세요.',
        keywords:
          'Telegram 비공개 동영상 다운로더, Telegram 비공개 채널 동영상 다운로더, Telegram 비공개 동영상 다운로드, Telegram 비공개 미디어 다운로더, telegram private video downloader'
      },
      heroTrustPoints: [
        'HD 동영상 다운로드',
        '회원가입 불필요',
        '모바일 친화적',
        'Windows, Mac, Android, iPhone 지원'
      ],
      situation: {
        title: '여기서 시작: 어떤 상황에 해당하나요?',
        intro:
          'Telegram 비공개 동영상 다운로더를 찾는 대부분의 사용자는 다음 중 하나의 문제를 해결하려고 합니다:',
        headers: ['상황', '먼저 시도할 방법'],
        rows: [
          {
            cells: [
              '채널이나 채팅에서 받은 Telegram 동영상 링크가 있는 경우',
              '온라인 Telegram 동영상 다운로더에 링크를 붙여넣으세요'
            ]
          },
          {
            cells: [
              '비공개 채널에서 동영상을 볼 수는 있지만 저장할 수 없는 경우',
              'Telegram Desktop의 Save Video As 옵션을 사용해 보세요'
            ]
          },
          {
            cells: [
              '동영상은 재생되지만 다운로드와 전달이 차단된 경우',
              '사본을 보관할 권한이 있는 경우에만 화면 녹화를 사용하세요'
            ]
          },
          {
            cells: [
              '다운로더가 동영상을 찾을 수 없다고 표시되는 경우',
              '접근 권한, 링크 유형, 채널 제한, 그리고 동영상이 Telegram 외부에서 열리는지 확인하세요'
            ]
          }
        ]
      },
      solutions: {
        title: 'Telegram 비공개 동영상에는 무엇이 효과적인가요?',
        intro:
          'Telegram 비공개 동영상은 보통 비공개 채널, 비공개 그룹 또는 1:1 채팅에서 공유된 동영상을 의미합니다. 이러한 동영상은 승인된 멤버에게만 표시되므로, 공개 채널의 미디어를 저장하는 것과는 다릅니다.',
        quickAnswer:
          '간단한 답변: 링크에 접근할 수 있다면 온라인 Telegram 비공개 동영상 다운로더를 사용하세요. 동영상이 Telegram 내부에서만 보인다면 Telegram Desktop을 사용해 보세요. 저장이 차단되어 있지만 콘텐츠를 보관할 권한이 있다면 화면 녹화가 현실적인 대안이 될 수 있습니다.',
        items: [
          {
            title: '솔루션 1: 온라인 Telegram 동영상 다운로더',
            description:
              '접근 가능한 Telegram 링크에 가장 적합합니다. 앱, 확장 프로그램 또는 봇을 설치하지 않고 온라인에서 Telegram 동영상을 다운로드하려는 사용자에게 가장 간단한 방법입니다.',
            useWhenLabel: '이런 경우에 사용하세요:',
            useWhen: [
              'Telegram 동영상 링크가 공개되어 있거나 접근 가능한 경우.',
              '온라인에서 Telegram 동영상을 다운로드하고 싶은 경우.',
              '빠르게 HD 동영상 파일이 필요한 경우.',
              '브라우저 확장 프로그램이나 데스크톱 앱을 설치하고 싶지 않은 경우.'
            ]
          },
          {
            title: '솔루션 2: Telegram Desktop Save Video As',
            description:
              '동영상을 Telegram Desktop에서 볼 수 있고 다운로드가 허용된 경우, 동영상을 마우스 오른쪽 버튼으로 클릭하여 컴퓨터의 폴더에 저장하세요. 이미 Telegram 내부에서 인증된 상태이므로 비공개 채널 멤버에게 더 잘 작동하는 경우가 많습니다.',
            useWhenLabel: '이런 경우에 사용하세요:',
            useWhen: [
              'Telegram Desktop에서 동영상을 볼 수 있는 경우.',
              '채널 소유자가 저장을 비활성화하지 않은 경우.',
              'Windows나 Mac에 직접 다운로드하는 것을 선호하는 경우.'
            ]
          },
          {
            title: '솔루션 3: 모바일 또는 데스크톱 화면 녹화',
            description:
              '다운로드 옵션이 비활성화되어 있지만 콘텐츠를 보고 보관할 권한이 있는 경우, 화면 녹화기로 재생 중인 동영상과 오디오를 캡처할 수 있습니다. 시간이 더 오래 걸리고 재생 화질에 따라 달라지므로 첫 번째 방법이 아닌 대안입니다.',
            useWhenLabel: '이런 경우에 사용하세요:',
            useWhen: [
              '동영상을 보고 보관할 권한이 있는 경우.',
              'Telegram 링크를 다운로더가 파싱할 수 없는 경우.',
              '참고용으로 개인 오프라인 사본이 필요한 경우.'
            ]
          },
          {
            title: '솔루션 4: Android 파일 관리자 확인',
            description:
              '일부 Android의 경우, Telegram이 로드된 미디어를 로컬 앱 폴더에 임시로 저장할 수 있습니다. 파일 관리자를 통해 기기에 이미 로드된 동영상을 찾을 수도 있지만, 이는 앱 버전, 저장소 권한, 캐시 동작에 따라 달라집니다.',
            useWhenLabel: '이런 경우에 사용하세요:',
            useWhen: [
              'Android의 Telegram에서 이미 동영상을 재생한 경우.',
              '앱 저장소 권한을 이해하고 있는 경우.',
              '기기에 이미 캐시된 파일만 복구하면 되는 경우.'
            ]
          }
        ]
      },
      benefits: {
        title: '온라인 Telegram 동영상 다운로더를 사용하는 이유',
        intro:
          '좋은 다운로더는 한 가지 질문에 빠르게 답할 수 있게 해줍니다: 내가 가진 링크에서 이 Telegram 동영상을 저장할 수 있는가? 최고의 경험은 비공개 링크를 처리할 수 없을 때 직접적이고 명확하며 솔직하게 알려주는 것입니다.',
        items: [
          {
            title: '고화질로 동영상 저장',
            description:
              '오프라인 재생, 학습, 교육, 보관 또는 개인 참고용으로 Telegram 동영상을 사용 가능한 최고 화질로 보관하세요.'
          },
          {
            title: '모든 기기에서 작동',
            description:
              'Android, iPhone, Windows, Mac 또는 태블릿의 브라우저에서 다운로더를 사용하세요. 동영상이 휴대폰에 있지만 다른 기기에 저장하고 싶을 때 유용합니다.'
          },
          {
            title: 'Telegram 로그인 불필요',
            description:
              'Telegram 비밀번호, 인증 코드, 세션 파일 또는 비공개 계정 자격 증명을 요구하지 않고 동영상 링크를 처리하는 도구를 선택하세요.'
          },
          {
            title: '간편한 오프라인 재생',
            description:
              '가능한 경우 일반적인 동영상 형식으로 파일을 다운로드하여 Telegram을 열거나 모바일 데이터를 사용하지 않고도 나중에 볼 수 있습니다.'
          },
          {
            title: '빠른 링크 기반 프로세스',
            description:
              '복사, 붙여넣기, 분석, 다운로드. 링크가 실패하면 페이지가 그 이유를 설명하고 다음에 시도할 방법을 알려줍니다.'
          },
          {
            title: '명확한 권한 경계',
            description:
              '접근하고 저장할 권한이 있는 동영상만 다운로드하세요. 채널 규칙, 크리에이터 권리, Telegram 정책을 존중하세요.'
          }
        ]
      },
      troubleshooting: {
        title: 'Telegram 동영상 링크가 작동하지 않는 경우',
        intro:
          '실패한 링크가 모두 다운로더의 문제를 의미하지는 않습니다. Telegram 비공개 동영상은 파일을 Telegram 외부에서 사용할 수 없어 실패하는 경우가 많습니다. 다음 체크리스트를 시도해 보세요:',
        items: [
          '브라우저에서 링크를 열어 정상적으로 로드되는지 확인하세요.',
          '비공개 채널 또는 그룹의 멤버 자격이 여전히 유효한지 확인하세요.',
          '채널 소유자가 저장, 복사 또는 전달을 비활성화했는지 확인하세요.',
          '동영상이 앱 내부에서만 재생되는 경우 Telegram Desktop을 사용해 보세요.',
          '페이지가 Telegram에 연결할 수 없는 경우 다른 브라우저나 네트워크를 사용하세요.',
          'Telegram 로그인 코드를 요구하는 도구는 사용하지 마세요.'
        ]
      },
      permission: {
        title: '중요한 권한 안내',
        note:
          'Telegram 비공개 동영상 다운로더는 개인정보 보호, 저작권 또는 접근 제한을 우회하는 데 사용해서는 안 됩니다. 소유자의 허가가 있거나 법률 및 Telegram 약관에서 허용하는 경우에만 동영상을 저장하세요.'
      },
      comparison: {
        title: '올바른 Telegram 다운로드 방법 선택',
        headers: ['상황', '권장 솔루션', '적합한 용도', '확인 사항'],
        rows: [
          {
            cells: [
              '공개되었거나 접근 가능한 Telegram 동영상 링크',
              '온라인 Telegram 동영상 다운로더',
              '앱 없이 빠른 HD 다운로드',
              '링크가 열리고 도구가 동영상에 접근할 수 있음'
            ]
          },
          {
            cells: [
              '다운로드가 허용된 비공개 채널 동영상',
              'Telegram Desktop Save Video As',
              '컴퓨터에 직접 저장',
              '멤버이며 소유자가 저장을 비활성화하지 않음'
            ]
          },
          {
            cells: [
              '저장은 제한되지만 재생은 가능',
              '내장 또는 타사 화면 녹화기',
              '권한이 있는 개인 오프라인 참고용',
              '오디오 캡처, 화면 영역, 현지 법률 또는 플랫폼 규칙'
            ]
          },
          {
            cells: [
              'Android 캐시된 미디어',
              '파일 관리자 확인',
              '기기에 이미 로드된 미디어 찾기',
              '앱 저장소 접근 권한 및 Telegram의 로컬 캐시 보관 여부'
            ]
          }
        ]
      },
      howTo: {
        title: '3단계로 Telegram 동영상 다운로드하는 방법',
        subtitle:
          '가장 빠른 방법은 링크 기반 Telegram 동영상 다운로더입니다. Telegram 동영상 링크가 공개되어 있거나 접근 가능하거나 Telegram 앱 외부에서 읽을 수 있을 때 가장 잘 작동합니다.',
        steps: [
          {
            title: '동영상 링크 복사',
            description:
              'Telegram을 열고 저장하려는 동영상을 찾은 다음 공유 메뉴에서 메시지 링크 또는 동영상 링크를 복사하세요. 채널에서 링크 복사를 허용하지 않는 경우 아래 비공개 채널 솔루션으로 이동하세요.'
          },
          {
            title: '붙여넣고 분석',
            description:
              '다운로더 입력란에 Telegram 링크를 붙여넣으세요. 도구가 해당 링크에서 다운로드 가능한 동영상 파일에 접근할 수 있는지 확인합니다.'
          },
          {
            title: 'HD로 다운로드',
            description:
              '사용 가능한 화질이나 형식을 선택한 다음 Telegram 동영상을 휴대폰, 태블릿 또는 컴퓨터에 직접 저장하세요. 파일이 나타나지 않으면 링크가 손상된 것이 아니라 제한되어 있을 가능성이 높습니다.'
          }
        ]
      },
      faq: {
        title: '자주 묻는 질문',
        description:
          'Telegram Web에서 Telegram 동영상 다운로드 또는 Telegram 파일 다운로드 전에 사람들이 묻는 질문들입니다.',
        items: [
          {
            question: 'Telegram 비공개 동영상을 다운로드할 수 있나요?',
            answer:
              '비공개 Telegram 동영상은 접근 권한이 있고 동영상 소스를 사용할 수 있는 경우에만 다운로드하거나 저장할 수 있습니다. 일부 비공개 채널은 저장, 전달, 링크 복사 또는 외부 접근을 차단합니다.'
          },
          {
            question: 'Telegram 비공개 채널 동영상을 어떻게 다운로드하나요?',
            answer:
              '사용 가능한 Telegram 동영상 링크가 있다면 먼저 링크 기반 다운로더를 사용해 보세요. 작동하지 않으면 Telegram Desktop에서 Save Video As 옵션을 확인하세요. 다운로드가 차단되어 있지만 콘텐츠를 보관할 권한이 있다면 화면 녹화가 대안이 될 수 있습니다.'
          },
          {
            question: 'Telegram 동영상 다운로더가 동영상을 찾을 수 없다고 표시되는 이유는 무엇인가요?',
            answer:
              '링크가 제한되었거나, 삭제되었거나, 만료되었거나, Telegram 내부에서만 보이거나, 채널 소유자에 의해 차단되었을 수 있습니다. 먼저 직접 링크를 열어 동영상이 여전히 재생되는지 확인하세요. Telegram에 로그인한 후에만 작동한다면 온라인 다운로더로는 접근하지 못할 수 있습니다.'
          },
          {
            question: '소프트웨어를 설치해야 하나요?',
            answer:
              '접근 가능한 링크의 경우 필요 없습니다. 온라인 Telegram 동영상 다운로더는 브라우저에서 작동합니다. 특정 비공개 또는 제한된 경우에는 Telegram Desktop, 파일 관리자 또는 화면 녹화기가 필요할 수 있습니다.'
          },
          {
            question: '링크 없이 Telegram 동영상을 다운로드할 수 있나요?',
            answer:
              '대개 불가능합니다. 온라인 다운로더는 파일을 찾기 위해 Telegram 동영상 링크가 필요합니다. 링크를 복사할 수 없지만 Telegram에서 동영상을 볼 수 있다면 Telegram Desktop이나 허용된 다른 로컬 방법을 사용하세요.'
          },
          {
            question: '다운로더에 Telegram 로그인 코드를 입력해도 안전한가요?',
            answer:
              '안전하지 않습니다. 다운로더는 Telegram 비밀번호, 인증 코드 또는 세션 자격 증명을 필요로 하지 않습니다. 사이트가 이를 요구하면 페이지를 떠나세요.'
          },
          {
            question: 'Telegram 미디어 다운로더는 무료인가요?',
            answer:
              '많은 링크 기반 Telegram 미디어 다운로더는 기본 다운로드에 무료입니다. 의심스러운 설치, 로그인 요청 또는 오해를 일으키는 버튼을 강요하는 도구는 피하세요.'
          },
          {
            question: 'Telegram 동영상을 다운로드하는 것이 합법인가요?',
            answer:
              '콘텐츠, 권한, 사용 목적에 따라 다릅니다. 저작권이 있거나 비공개이거나 제한된 콘텐츠를 허가 없이 다운로드하거나 재배포하지 마세요.'
          }
        ]
      },
      workspace: {
        auth: {
          eyebrow: '웹 로그인',
          title: '로그인해서 크레딧 동기화',
          signedInAs: '현재 로그인 계정',
          continueWithGoogle: 'Google로 계속',
          googleLoading: 'Google 여는 중...',
          or: '또는',
          emailLabel: '이메일',
          emailPlaceholder: 'name@example.com',
          continueWithEmail: '이메일로 계속',
          sendCode: '인증 코드 보내기',
          sendingCode: '전송 중...',
          sendCodeSuccess: '인증 코드를 보냈습니다.',
          sendAgain: '다시 보내기',
          codeLabel: '인증 코드',
          codePlaceholder: '123456',
          signIn: '로그인',
          termsNotice: '로그인하면 다음에 동의하게 됩니다',
          termsLink: '이용약관',
          privacyLink: '개인정보 처리방침',
          logout: '로그아웃',
          creditsLabel: '크레딧'
        },
        quota: {
          eyebrow: '웹 할당량',
          title: '현재 크레딧 잔액',
          planLabel: '플랜',
          remainingLabel: '남은 수량',
          dailyLimitLabel: '일일 한도',
          unlimited: '무제한'
        },
        checkin: {
          creditsLoading: '크레딧',
          creditsButtonLabel: '일일 체크인 열기',
          accountButtonLabel: '계정 메뉴 열기',
          accountMenuLabel: '계정 메뉴',
          title: '오늘의 무료 크레딧을 받을 수 있습니다',
          todayRewardText: '오늘의 보상: {credits} 크레딧',
          claimedRewardText: '오늘 {credits} 크레딧을 받았습니다.',
          nextCountdown: '다음 수령까지 {time}',
          nextAt: '(다음 갱신: {time} EST)',
          claimButton: '{credits} 크레딧 받기',
          claimingButton: '받는 중...',
          notNow: '나중에',
          close: '닫기',
          loadFailed: '체크인 상태를 불러오지 못했습니다.',
          claimFailed: '크레딧 수령에 실패했습니다.'
        },
        creditPurchase: {
          title: '크레딧 구매',
          description: '크레딧을 추가하고 이 작업 공간에서 계속 다운로드하세요.',
          successTitle: '크레딧이 추가되었습니다',
          successDescription: '잔액이 새로고침되었습니다. 이 창을 닫고 다운로드를 다시 시작하세요.',
          packageEyebrow: '필요할 때 구매',
          cardNote: '크레딧은 웹 다운로드에 사용할 수 있으며 만료되지 않습니다.',
          creditsAmount: '{credits} 크레딧',
          buyNow: '지금 구매',
          selectPackage: '선택',
          paymentMethodLabel: '결제 수단 선택',
          paymentTitle: '결제 수단 선택',
          selectedPackageLabel: '선택한 상품',
          confirmPurchase: '결제 계속',
          backToProducts: '뒤로',
          close: '닫기',
          agreementText: '구매 조건, 이용 약관 및 개인정보 처리방침에 동의합니다.',
          loadingConfigs: '크레딧 패키지를 불러오는 중...',
          loadFailed: '크레딧 패키지를 불러오지 못했습니다. 다시 시도하세요.',
          noConfigs: '현재 구매 가능한 크레딧 패키지가 없습니다. 나중에 다시 시도하세요.',
          ready: '크레딧 패키지를 선택하세요. 가격은 USD로 표시됩니다.',
          creatingOrder: '주문을 생성하는 중...',
          pendingPayment: '새로 열린 탭에서 결제를 완료하세요. 결과는 자동으로 확인됩니다.',
          pendingPaymentTitle: '결제 대기 중',
          cancelPayment: '결제 취소',
          supportMailPrefix: '문제 신고: ',
          success: '결제가 완료되었습니다. 이제 크레딧을 사용할 수 있습니다.',
          failed: '결제가 아직 완료되지 않았습니다. 다시 시도하거나 이 창을 닫을 수 있습니다.',
          successCredits: '+{credits} 크레딧 추가됨',
          successBalance: '현재 잔액: {balance} 크레딧',
          createFailed: '주문 생성에 실패했습니다. 다시 시도하세요.',
          invalidPaymentData: '결제 링크가 올바르지 않습니다. 나중에 다시 시도하세요.',
          priceUpdated: '가격이 변경되었습니다. 최신 가격을 확인하고 다시 구매하세요.',
          gatewayFailed: '결제 진입점을 일시적으로 사용할 수 없습니다. 나중에 다시 시도하세요.',
          paymentCanceled: '결제가 취소되었습니다. 결제 수단을 선택하고 다시 시도하세요.',
          pollFailed: '결제 상태를 새로고침하지 못했습니다. 다시 시도하세요.',
          pollTimeout: '자동 새로고침 시간이 초과되었습니다. 결제 후 수동으로 결과를 새로고침하세요.',
          orderNotFound: '주문을 더 이상 사용할 수 없습니다. 새 주문을 생성하세요.',
          orderExpired: '주문이 만료되었습니다. 다시 구매하세요.',
          fulfillmentFailed: '결제는 수신되었지만 크레딧이 아직 추가되지 않았습니다. 나중에 다시 시도하세요.',
          authExpired: '로그인이 만료되었습니다. 다시 로그인하여 계속하세요.'
        },
        parse: {
          eyebrow: '직접 파싱',
          title: 'Telegram 비공개 동영상 다운로더: 모든 비공개 미디어 다운로드',
          helperText:
            '쉬운 다운로더 가이드로 Telegram 비공개 채널 동영상을 저장하세요. 접근 가능한 동영상과 미디어를 다운로드하고, 실패한 다운로드를 해결하며, 기기에 맞는 방법을 찾아보세요.',
          telegramMessageListLinkError:
            '이 Telegram 링크는 특정 메시지가 아니라 채팅 또는 채널을 엽니다. 정확한 메시지 링크를 복사한 뒤 여기에 붙여넣으세요.',
          linkLabel: 'Telegram 링크',
          linkPlaceholder: 'https://t.me/example/123',
          clearInput: '입력 지우기',
          submit: 'Telegram 동영상 링크 붙여넣기',
          submitting: '파싱 중...',
          noResults: '이 메시지에서는 다운로드 가능한 파일을 찾지 못했습니다.',
          download: '다운로드',
          downloading: '다운로드 중...',
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
          largeFileExtensionInlineChromeTitle: 'Chrome 확장 프로그램',
          largeFileExtensionInlineChromeDescription:
            'Chrome 브라우저 전용 확장 프로그램으로 Telegram 미디어를 한 번에 감지하고 저장합니다.',
          largeFileExtensionInlineChromeCta: '확장 프로그램 설치',
          largeFileExtensionInlineEdgeTitle: 'Edge 확장 프로그램',
          largeFileExtensionInlineEdgeDescription:
            'Microsoft Edge 전용 확장 프로그램으로 Telegram 콘텐츠 다운로드에 맞게 동작합니다.',
          largeFileExtensionInlineEdgeCta: '확장 프로그램 설치'
        },
        errors: {
          enterEmailFirst: '먼저 이메일 주소를 입력하세요.',
          enterEmailAndCode: '이메일과 인증 코드를 모두 입력하세요.',
          sendCodeFailed: '인증 코드 전송에 실패했습니다.',
          googleSignInFailed: 'Google 로그인에 실패했습니다.',
          googleClientMissing: 'Google 로그인이 설정되어 있지 않습니다.',
          restoreSessionFailed: '세션 복원에 실패했습니다.',
          signInFailed: '로그인에 실패했습니다.',
          logoutFailed: '로그아웃에 실패했습니다.',
          loadQuotaFailed: '크레딧을 불러오지 못했습니다.',
          enterLink: '미디어 링크를 입력하세요.',
          invalidLink: '올바른 URL이 아닙니다.',
          parseFailed: '이 링크를 파싱하지 못했습니다.',
          downloadFailed: '다운로드에 실패했습니다.',
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
          xParseFailed: '이 X 링크는 지원되지 않습니다. 공개 동영상 게시물을 사용해 주세요.',
          instagramParseFailed: '이 Instagram 링크는 지원되지 않습니다. 공개 게시물을 사용해 주세요.',
          instagramImageParseFailed: '이 Instagram 링크는 지원되지 않습니다. 공개 사진 게시물을 사용해 주세요.',
          threadsParseFailed: '이 Threads 링크는 지원되지 않습니다. 공개 게시물을 사용해 주세요.',
          redditParseFailed: 'Reddit 미디어를 가져오지 못했습니다. 공개 동영상, 이미지 또는 갤러리 게시물을 사용해 주세요.',
          douyinParseFailed: 'Douyin 동영상을 가져오지 못했습니다. 공개 동영상 링크를 사용해 주세요.',
          quotaExceeded: '이 파일을 다운로드할 크레딧이 부족합니다.',
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
        title: '더 많은 비디오 다운로더',
        items: [
          {
            label: 'TikTok Downloader',
            href: '/tiktok-downloader/',
            description: '워터마크 없이 HD 화질로 TikTok 동영상을 다운로드하세요.'
          },
          {
            label: 'X (Twitter) Downloader',
            href: '/x-downloader/',
            description: 'X/Twitter 동영상과 GIF를 HD 화질로 다운로드하세요.'
          },
          {
            label: 'Vimeo Downloader',
            href: '/vimeo-downloader/',
            description: '다양한 해상도로 Vimeo 동영상을 HD로 다운로드하세요.'
          },
          {
            label: 'Instagram Downloader',
            href: '/instagram-downloader/',
            description: 'Instagram 사진, 릴스, 캐러셀을 HD 화질로 다운로드하세요.'
          },
          {
            label: 'Threads Downloader',
            href: '/threads-downloader/',
            description: 'Threads 동영상과 사진을 원본 화질로 다운로드하세요.'
          }
        ]
      }
    },
    changelog: {
      title: 'Telegram 동영상 다운로드 변경 로그',
      description:
        'Telegram 동영상 다운로드, 웹 흐름, 더 긴 저장 세션에 관한 업데이트를 확인하세요.',
      seoTitle: 'Telegram 동영상 다운로드 변경 로그 | TG Downloader',
      seoDescription:
        '이 Telegram 동영상 다운로드 변경 로그에서 웹 흐름, 대용량 파일, 최신 버전 변화를 함께 확인하세요.',
      entries: [
        {
          version: '1.1.3',
          date: '2025-01-15',
          title: '성능 향상',
          description: '더 나은 사용자 경험을 위한 주요 성능 개선 사항。',
          features: [
            '리소스 감지 속도 50% 향상',
            '대용량 파일 다운로드 안정성 최적화',
            'UI 응답 속도 개선'
          ]
        },
        {
          version: '1.1.2',
          date: '2024-11-10',
          title: '다국어 지원',
          description: '전 세계 14개 언어 지원이 추가되었습니다。',
          features: [
            '일본어, 한국어 등 다양한 언어 지원 추가',
            '번역 정확도 향상',
            '자동 언어 감지 추가'
          ]
        },
        {
          version: '1.1.0',
          date: '2024-09-01',
          title: '사이드바 다운로드',
          description: '일괄 다운로드를 지원하는 새로운 사이드바 다운로드 기능。',
          features: [
            '사이드바 단일 파일 다운로드 추가',
            '일괄 다운로드 기능 추가',
            '다운로드 큐 관리 개선'
          ]
        },
        {
          version: '1.0.2',
          date: '2024-08-15',
          title: '보안 및 프라이버시',
          description: '보안 개선 사항 및 프라이버시 강화。',
          features: ['모든 분석 추적 제거', '로컬 전용 처리 모드 추가', '데이터 암호화 개선']
        },
        {
          version: '1.0.0',
          date: '2024-07-01',
          title: '최초 릴리스',
          description: '채팅 창 다운로드를 지원하는 첫 번째 릴리스。',
          features: [
            '채팅 창 다운로드 기능',
            'Telegram Web K 및 A 버전 지원',
            '기본 미디어 형식 지원'
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
    pricing: koKRPricingContent,
    downloadDisabledChannelWorkaround: downloadDisabledChannelWorkaroundContent['ko-KR'],
    extensionLoginV2: {
      title: '확장 프로그램 로그인 | TG Downloader',
      description: 'TG Downloader에 로그인하고 웹사이트 세션을 브라우저 확장 프로그램에 동기화합니다.',
      eyebrow: '브라우저 확장 프로그램',
      heading: 'TG Downloader에 로그인',
      checkingState: '세션 확인 중',
      signInRequiredState: '로그인 필요',
      syncedState: '로그인됨',
      verificationFailedState: '인증 실패',
      preparingTitle: '로그인 준비 중…',
      preparingText: 'TG Downloader가 웹사이트 세션 확인을 준비하고 있습니다.',
      checkingSessionTitle: '웹사이트 세션 확인 중…',
      checkingSessionText: 'TG Downloader가 이 브라우저에 저장된 웹사이트 토큰을 확인하고 있습니다.',
      finishingGoogleTitle: 'Google 로그인 완료 중…',
      finishingGoogleText: 'TG Downloader가 Google 로그인 결과를 웹사이트 세션으로 교환하고 있습니다.',
      signInRequiredTitle: '계속하려면 로그인하세요',
      signInRequiredText: '웹사이트와 동일한 TG Downloader 로그인 창을 사용하세요.',
      signInButtonLabel: '로그인',
      syncingTitle: '확장 프로그램 토큰 동기화 중…',
      syncingText: 'TG Downloader가 웹사이트 세션을 확장 프로그램 토큰으로 교환하고 있습니다.',
      syncedTitle: '로그인 성공',
      syncedText: '확장 프로그램이 TG Downloader 계정에 연결되었습니다. "Telegram으로 돌아가기"를 클릭해 돌아갑니다.',
      returnButtonLabel: 'Telegram으로 돌아가기',
      returningButtonLabel: '돌아가는 중…',
      verificationFailedTitle: '확장 프로그램 로그인을 완료할 수 없습니다',
      retryButtonLabel: '다시 시도',
    },
    platformDownloaders: {
      tiktok: {
        seo: {
          title: 'TikTok 동영상 다운로드 워터마크 없음 - HD 화질 | TG Downloader',
          description:
            '워터마크 없이 HD 화질로 TikTok 동영상을 무료 다운로드하세요. 앱 설치 불필요. TikTok 동영상, 슬라이드쇼, 스토리를 즉시 저장하세요.',
          keywords:
            'TikTok 다운로드, 틱톡 동영상 저장, 틱톡 워터마크 제거, TikTok 동영상 다운로드, 틱톡 다운로더, 틱톡 HD 다운로드'
        },
        workspace: {
          title: 'TikTok 동영상 다운로드 워터마크 없음',
          helperText:
            'TikTok 동영상 링크를 붙여넣으면 워터마크 없이 HD 화질로 다운로드할 수 있습니다. Telegram, X, Vimeo 링크도 지원합니다.',
          linkPlaceholder: 'https://www.tiktok.com/@user/video/1234567890'
        },
        features: {
          title: 'TikTok 다운로더를 사용하는 이유',
          subtitle: '최고 화질로 워터마크 없이 TikTok 동영상을 무료로 저장하세요.',
          items: [
            {
              title: '워터마크 없음',
              description:
                'TikTok 워터마크 없이 동영상을 다운로드하세요. 깨끗한 원본 화질의 동영상을 바로 저장하거나 공유할 수 있습니다.'
            },
            {
              title: 'HD 화질',
              description:
                'TikTok 동영상을 원본 HD 해상도로 저장하세요. 화질 손실 없이 크리에이터가 업로드한 그대로 받을 수 있습니다.'
            },
            {
              title: '빠르고 무료',
              description:
                '앱 설치, 회원가입, 숨겨진 비용 없이 링크를 붙여넣으면 바로 동영상을 받을 수 있습니다. 모든 브라우저에서 즉시 작동합니다.'
            }
          ]
        },
        howTo: {
          title: '워터마크 없이 TikTok 동영상 다운로드하는 방법',
          subtitle:
            '간단한 3단계로 HD 화질의 TikTok 동영상을 워터마크 없이 저장하세요.',
          steps: [
            {
              title: 'TikTok 동영상 링크 복사',
              description:
                'TikTok을 열고 동영상의 공유 버튼을 탭한 후 "링크 복사"를 선택하세요.'
            },
            {
              title: '위 입력란에 링크 붙여넣기',
              description:
                '복사한 TikTok URL을 입력란에 붙여넣고 파싱 버튼을 클릭하세요.'
            },
            {
              title: '워터마크 없이 다운로드',
              description:
                '다운로드 버튼을 클릭하면 워터마크 없는 HD TikTok 동영상이 저장됩니다.'
            }
          ]
        },
        faq: {
          title: 'TikTok 다운로더 FAQ',
          items: [
            {
              question: '이 TikTok 다운로더는 정말 무료인가요?',
              answer:
                '네, 숨겨진 비용 없이 완전히 무료입니다. 워터마크 없이 TikTok 동영상을 무료로 다운로드할 수 있습니다.'
            },
            {
              question: '다운로드한 동영상에 워터마크가 있나요?',
              answer:
                '아니요. 저희 다운로더는 TikTok 워터마크를 제거하고 HD 화질의 깨끗한 원본 동영상을 제공합니다.'
            },
            {
              question: '다운로드된 TikTok 동영상의 화질은 어떤가요?',
              answer:
                '동영상은 크리에이터가 업로드한 원본 HD 해상도로 저장되며 화질 손실이 없습니다.'
            },
            {
              question: '앱이나 확장 프로그램을 설치해야 하나요?',
              answer:
                '설치가 필요 없습니다. 모든 기기의 브라우저에서 바로 사용할 수 있는 웹 기반 도구입니다.'
            },
            {
              question: 'TikTok 스토리와 슬라이드쇼도 다운로드할 수 있나요?',
              answer:
                '네, TikTok 동영상, 사진 슬라이드쇼, 스토리를 모두 지원합니다. 링크를 붙여넣고 다운로드하세요.'
            }
          ]
        },
        crossLinks: {
          title: '더 많은 비디오 다운로더',
          items: [
            {
              label: 'X (Twitter) Downloader',
              href: '/x-downloader/',
              description: 'X/Twitter 동영상과 GIF를 HD 화질로 다운로드하세요.'
            },
            {
              label: 'Vimeo Downloader',
              href: '/vimeo-downloader/',
              description: '다양한 해상도로 Vimeo 동영상을 HD로 다운로드하세요.'
            },
            {
              label: 'Instagram Downloader',
              href: '/instagram-downloader/',
              description: 'Instagram 사진, 릴스, 캐러셀을 HD 화질로 다운로드하세요.'
            },
            {
              label: 'Threads Downloader',
              href: '/threads-downloader/',
              description: 'Threads 동영상과 사진을 원본 화질로 다운로드하세요.'
            },
            {
              label: 'Telegram Downloader',
              href: '/',
              description: 'Telegram 채널과 그룹에서 HD 동영상을 다운로드하세요.'
            }
          ]
        }
      },
      x: {
        seo: {
          title: 'X (Twitter) 동영상 다운로드 - HD 비디오 및 GIF 저장 | TG Downloader',
          description:
            'X (Twitter) 동영상과 GIF를 HD 화질로 무료 다운로드하세요. 앱 불필요. 공개 트윗의 동영상이나 GIF를 즉시 저장하세요.',
          keywords:
            'X 다운로드, 트위터 동영상 저장, Twitter 동영상 다운로드, X 비디오 다운로더, 트위터 GIF 저장, 트위터 동영상 다운로드'
        },
        workspace: {
          title: 'X (Twitter) 동영상 다운로더',
          helperText:
            'X 또는 Twitter 동영상 링크를 붙여넣으면 최고 화질로 다운로드할 수 있습니다. Telegram, TikTok, Vimeo 링크도 지원합니다.',
          linkPlaceholder: 'https://x.com/user/status/1234567890'
        },
        features: {
          title: 'X 동영상 다운로더를 사용하는 이유',
          subtitle: 'X/Twitter 동영상과 GIF를 원본 화질 그대로 무료로 저장하세요.',
          items: [
            {
              title: '동영상 및 GIF',
              description:
                'X (Twitter)의 동영상 게시물과 애니메이션 GIF를 모두 다운로드하세요. 트윗에 표시되는 그대로의 미디어를 받을 수 있습니다.'
            },
            {
              title: '원본 HD 화질',
              description:
                'X 동영상을 최고 해상도로 저장하세요. 화질 저하 없이 원본과 동일한 비트레이트를 제공합니다.'
            },
            {
              title: '빠르고 무료',
              description:
                '앱 설치, 로그인 불필요. 트윗 URL을 붙여넣으면 몇 초 만에 동영상이나 GIF를 다운로드할 수 있습니다.'
            }
          ]
        },
        howTo: {
          title: 'X (Twitter) 동영상 다운로드하는 방법',
          subtitle:
            '간단한 3단계로 X/Twitter의 동영상이나 GIF를 저장하세요.',
          steps: [
            {
              title: '트윗 URL 복사',
              description:
                'X (Twitter)에서 트윗의 공유 아이콘을 클릭하고 "링크 복사"를 선택하세요.'
            },
            {
              title: '위 입력란에 링크 붙여넣기',
              description:
                '복사한 X/Twitter URL을 입력란에 붙여넣고 파싱 버튼을 클릭하세요.'
            },
            {
              title: '동영상 또는 GIF 다운로드',
              description:
                '다운로드 버튼을 클릭하면 HD 화질의 동영상이나 GIF가 기기에 저장됩니다.'
            }
          ]
        },
        faq: {
          title: 'X 동영상 다운로더 FAQ',
          items: [
            {
              question: 'X (Twitter)에서 동영상을 어떻게 다운로드하나요?',
              answer:
                '동영상이 포함된 트윗 URL을 복사하여 위 입력란에 붙여넣고 파싱을 클릭하세요. 그런 다음 다운로드를 클릭하여 동영상을 저장합니다.'
            },
            {
              question: 'X에서 GIF를 다운로드할 수 있나요?',
              answer:
                '네. X/Twitter 게시물의 동영상과 애니메이션 GIF를 모두 지원합니다. GIF는 최고의 호환성을 위해 MP4 파일로 저장됩니다.'
            },
            {
              question: '어떤 동영상 화질을 제공하나요?',
              answer:
                '각 트윗에서 사용 가능한 최고 화질을 제공하며, 보통 게시자가 업로드한 원본 HD 해상도입니다.'
            },
            {
              question: '이 X 다운로더는 무료인가요?',
              answer:
                '네, 회원가입 없이 완전히 무료입니다. 비용 없이 X 동영상과 GIF를 다운로드하세요.'
            },
            {
              question: '다운로드하려면 X/Twitter 계정이 필요한가요?',
              answer:
                '계정이 필요 없습니다. 트윗이 공개되어 있다면 로그인 없이 동영상이나 GIF를 다운로드할 수 있습니다.'
            }
          ]
        },
        crossLinks: {
          title: '더 많은 비디오 다운로더',
          items: [
            {
              label: 'TikTok Downloader',
              href: '/tiktok-downloader/',
              description: '워터마크 없이 HD 화질로 TikTok 동영상을 다운로드하세요.'
            },
            {
              label: 'Vimeo Downloader',
              href: '/vimeo-downloader/',
              description: '다양한 해상도로 Vimeo 동영상을 HD로 다운로드하세요.'
            },
            {
              label: 'Instagram Downloader',
              href: '/instagram-downloader/',
              description: 'Instagram 사진, 릴스, 캐러셀을 HD 화질로 다운로드하세요.'
            },
            {
              label: 'Threads Downloader',
              href: '/threads-downloader/',
              description: 'Threads 동영상과 사진을 원본 화질로 다운로드하세요.'
            },
            {
              label: 'Telegram Downloader',
              href: '/',
              description: 'Telegram 채널과 그룹에서 HD 동영상을 다운로드하세요.'
            }
          ]
        }
      },
      vimeo: {
        seo: {
          title: 'Vimeo 동영상 다운로드 HD - 다양한 해상도 | TG Downloader',
          description:
            'Vimeo 동영상을 다양한 해상도 옵션으로 HD 화질 무료 다운로드하세요. 앱 불필요. 공개 Vimeo 동영상을 즉시 저장하세요.',
          keywords:
            'Vimeo 다운로드, Vimeo 동영상 저장, 비메오 다운로더, Vimeo HD 다운로드, 비메오 동영상 다운로드, Vimeo 무료 다운로드'
        },
        workspace: {
          title: 'Vimeo 동영상 다운로드 HD',
          helperText:
            'Vimeo 동영상 링크를 붙여넣으면 해상도를 선택하여 HD로 다운로드할 수 있습니다. Telegram, TikTok, X 링크도 지원합니다.',
          linkPlaceholder: 'https://vimeo.com/123456789'
        },
        features: {
          title: 'Vimeo 다운로더를 사용하는 이유',
          subtitle: '원하는 해상도를 선택하여 Vimeo 동영상을 HD 화질로 무료 저장하세요.',
          items: [
            {
              title: 'HD 원본 화질',
              description:
                'Vimeo 동영상을 풀 HD 해상도로 다운로드하세요. 크리에이터가 업로드한 선명한 화질 그대로 받을 수 있습니다.'
            },
            {
              title: '다양한 해상도',
              description:
                '사용 가능한 해상도(360p, 720p, 1080p 등)에서 선택하세요. 필요에 맞는 화질을 고를 수 있습니다.'
            },
            {
              title: '빠르고 무료',
              description:
                '앱 설치, 계정 불필요. Vimeo 링크를 붙여넣고 해상도를 선택한 후 바로 다운로드하세요.'
            }
          ]
        },
        howTo: {
          title: 'Vimeo 동영상을 HD로 다운로드하는 방법',
          subtitle:
            '간단한 3단계로 원하는 해상도의 Vimeo 동영상을 저장하세요.',
          steps: [
            {
              title: 'Vimeo 동영상 링크 복사',
              description:
                'Vimeo 동영상 페이지를 열고 브라우저 주소창에서 URL을 복사하세요.'
            },
            {
              title: '위 입력란에 링크 붙여넣기',
              description:
                '복사한 Vimeo URL을 입력란에 붙여넣고 파싱 버튼을 클릭하세요.'
            },
            {
              title: '해상도 선택 후 다운로드',
              description:
                '원하는 동영상 해상도를 선택하고 다운로드 버튼을 클릭하여 HD 동영상을 저장하세요.'
            }
          ]
        },
        faq: {
          title: 'Vimeo 다운로더 FAQ',
          items: [
            {
              question: 'Vimeo에서 동영상을 어떻게 다운로드하나요?',
              answer:
                'Vimeo 동영상 페이지 URL을 복사하여 위 입력란에 붙여넣고 파싱을 클릭하세요. 원하는 해상도를 선택한 후 다운로드하면 됩니다.'
            },
            {
              question: '동영상 해상도를 선택할 수 있나요?',
              answer:
                '네. 파싱 후 360p, 720p, 1080p 등 사용 가능한 모든 해상도에서 선택할 수 있습니다.'
            },
            {
              question: '이 Vimeo 다운로더는 무료인가요?',
              answer:
                '네, 완전히 무료입니다. 비용이나 회원가입 없이 HD 화질로 Vimeo 동영상을 다운로드하세요.'
            },
            {
              question: '다운로드하려면 Vimeo 계정이 필요한가요?',
              answer:
                '계정이 필요 없습니다. 공개된 Vimeo 동영상이라면 로그인 없이 다운로드할 수 있습니다.'
            },
            {
              question: '다운로드 파일 형식은 무엇인가요?',
              answer:
                'Vimeo 동영상은 MP4 형식으로 다운로드되며, 거의 모든 기기와 플레이어에서 호환됩니다.'
            }
          ]
        },
        crossLinks: {
          title: '더 많은 비디오 다운로더',
          items: [
            {
              label: 'TikTok Downloader',
              href: '/tiktok-downloader/',
              description: '워터마크 없이 HD 화질로 TikTok 동영상을 다운로드하세요.'
            },
            {
              label: 'X (Twitter) Downloader',
              href: '/x-downloader/',
              description: 'X/Twitter 동영상과 GIF를 HD 화질로 다운로드하세요.'
            },
            {
              label: 'Instagram Downloader',
              href: '/instagram-downloader/',
              description: 'Instagram 사진, 릴스, 캐러셀을 HD 화질로 다운로드하세요.'
            },
            {
              label: 'Threads Downloader',
              href: '/threads-downloader/',
              description: 'Threads 동영상과 사진을 원본 화질로 다운로드하세요.'
            },
            {
              label: 'Telegram Downloader',
              href: '/',
              description: 'Telegram 채널과 그룹에서 HD 동영상을 다운로드하세요.'
            }
          ]
        }
      },
      instagram: {
        seo: {
          title: 'Instagram 사진 및 동영상 다운로더 - HD 화질 | TG Downloader',
          description:
            'Instagram 사진, 릴스, 캐러셀 앨범을 HD 화질로 무료 다운로드. 앱 설치 불필요, 즉시 저장.',
          keywords:
            'Instagram 다운로드, Instagram 사진 다운로드, Instagram 릴스 다운로드, Instagram 캐러셀 다운로드, Instagram 동영상 저장, 무료 Instagram 다운로더'
        },
        workspace: {
          title: 'Instagram 사진 및 동영상 다운로드',
          helperText:
            'Instagram 게시물 링크를 붙여넣으면 사진, 릴스, 캐러셀을 HD 화질로 다운로드합니다. Telegram, TikTok, X 링크도 지원.',
          linkPlaceholder: 'https://www.instagram.com/p/ABC123xyz/'
        },
        features: {
          title: 'Instagram 다운로더를 선택하는 이유',
          subtitle: 'Instagram 사진, 릴스, 캐러셀 앨범을 원본 HD 화질로 저장. 완전 무료.',
          items: [
            {
              title: '사진 및 릴스',
              description:
                'Instagram 사진과 릴스 동영상을 원본 화질로 다운로드. 크리에이터가 게시한 그대로의 미디어를 받으세요.'
            },
            {
              title: '캐러셀 일괄 다운로드',
              description:
                'Instagram 캐러셀 게시물의 모든 이미지와 동영상을 한 번에 다운로드. 하나씩 저장할 필요 없음.'
            },
            {
              title: 'HD 원본 화질',
              description:
                '최고 해상도로 Instagram 미디어를 저장. 압축 없음, 화질 손실 없음. 업로드 시 그대로.'
            }
          ]
        },
        howTo: {
          title: 'Instagram 사진과 동영상을 다운로드하는 방법',
          subtitle:
            '3단계로 Instagram 게시물을 HD 화질로 저장하세요.',
          steps: [
            {
              title: 'Instagram 게시물 링크 복사',
              description:
                'Instagram을 열고, 게시물 우측 상단의 점 세 개를 탭하여 "링크 복사"를 선택하세요.'
            },
            {
              title: '링크 붙여넣기',
              description:
                '복사한 Instagram URL을 위 입력란에 붙여넣고 "분석"을 클릭하세요.'
            },
            {
              title: 'HD로 다운로드',
              description:
                '"다운로드" 버튼을 클릭하여 사진, 릴스 또는 캐러셀을 원본 화질로 저장하세요.'
            }
          ]
        },
        faq: {
          title: 'Instagram 다운로더 FAQ',
          items: [
            {
              question: '이 Instagram 다운로더는 정말 무료인가요?',
              answer:
                '네, 완전 무료이며 숨겨진 비용이 없습니다. Instagram 사진, 릴스, 캐러셀을 무료로 다운로드하세요.'
            },
            {
              question: '지원되는 형식은?',
              answer:
                'Instagram 사진(JPG), 릴스 동영상(MP4), 모든 미디어가 포함된 캐러셀 앨범 다운로드를 지원합니다.'
            },
            {
              question: '다운로드 파일의 화질은?',
              answer:
                '모든 미디어는 크리에이터가 업로드한 원본 HD 해상도로 저장됩니다. 화질 손실이나 압축 없음.'
            },
            {
              question: '다운로드에 Instagram 계정이 필요한가요?',
              answer:
                '필요 없습니다. 게시물이 공개인 한, 로그인 없이 미디어를 다운로드할 수 있습니다.'
            },
            {
              question: 'Instagram 스토리도 다운로드할 수 있나요?',
              answer:
                '현재 게시물, 릴스, 캐러셀을 지원합니다. 스토리 다운로드는 직접 링크로 공개 접근 가능한 경우에 한합니다.'
            }
          ]
        },
        crossLinks: {
          title: '더 많은 동영상 다운로더',
          items: [
            {
              label: 'TikTok Downloader',
              href: '/tiktok-downloader/',
              description: '워터마크 없이 TikTok 동영상을 HD로 다운로드.'
            },
            {
              label: 'X (Twitter) Downloader',
              href: '/x-downloader/',
              description: 'X/Twitter 동영상과 GIF를 HD 화질로 다운로드.'
            },
            {
              label: 'Vimeo Downloader',
              href: '/vimeo-downloader/',
              description: '다양한 해상도로 Vimeo 동영상을 HD 다운로드.'
            },
            {
              label: 'Threads Downloader',
              href: '/threads-downloader/',
              description: 'Threads 동영상과 사진을 원본 화질로 다운로드.'
            },
            {
              label: 'Telegram Downloader',
              href: '/',
              description: 'Telegram 채널과 그룹의 동영상을 HD로 다운로드.'
            }
          ]
        }
      },
      threads: {
        seo: {
          title: 'Threads 동영상 및 사진 다운로더 - 원본 화질 | TG Downloader',
          description:
            'Threads 동영상과 사진을 원본 화질로 무료 다운로드. 앱 설치 불필요, 캐러셀 포함 즉시 저장.',
          keywords:
            'Threads 다운로드, Threads 동영상 다운로드, Threads 동영상 저장, Threads 미디어 다운로드, 무료 Threads 다운로더'
        },
        workspace: {
          title: 'Threads 동영상 및 사진 다운로드',
          helperText:
            'Threads 게시물 링크를 붙여넣으면 동영상과 사진을 원본 화질로 다운로드합니다. Telegram, TikTok, Instagram 링크도 지원.',
          linkPlaceholder: 'https://www.threads.net/@user/post/ABC123xyz'
        },
        features: {
          title: 'Threads 다운로더를 선택하는 이유',
          subtitle: 'Threads 동영상과 사진을 원본 화질로 저장. 완전 무료.',
          items: [
            {
              title: '혼합 미디어',
              description:
                'Threads 게시물의 동영상과 사진을 다운로드. 여러 콘텐츠 유형을 포함한 혼합 미디어 게시물 지원.'
            },
            {
              title: '원본 화질',
              description:
                '최고 해상도로 Threads 미디어를 저장. 압축 없음, 화질 손실 없음. 게시 시 그대로.'
            },
            {
              title: '캐러셀 지원',
              description:
                'Threads 캐러셀 게시물의 모든 미디어를 한 번에 다운로드. 한 번의 작업으로 모든 사진과 동영상을 받으세요.'
            }
          ]
        },
        howTo: {
          title: 'Threads 동영상과 사진을 다운로드하는 방법',
          subtitle:
            '3단계로 Threads 게시물을 원본 화질로 저장하세요.',
          steps: [
            {
              title: 'Threads 게시물 링크 복사',
              description:
                'Threads를 열고, 게시물의 공유 아이콘을 탭하여 "링크 복사"를 선택하세요.'
            },
            {
              title: '링크 붙여넣기',
              description:
                '복사한 Threads URL을 위 입력란에 붙여넣고 "분석"을 클릭하세요.'
            },
            {
              title: '미디어 다운로드',
              description:
                '"다운로드" 버튼을 클릭하여 동영상과 사진을 원본 화질로 저장하세요.'
            }
          ]
        },
        faq: {
          title: 'Threads 다운로더 FAQ',
          items: [
            {
              question: '이 Threads 다운로더는 정말 무료인가요?',
              answer:
                '네, 완전 무료이며 숨겨진 비용이 없습니다. Threads 동영상과 사진을 무료로 다운로드하세요.'
            },
            {
              question: '지원되는 미디어 유형은?',
              answer:
                'Threads의 동영상, 사진, 혼합 미디어 게시물 다운로드를 지원하며, 여러 항목이 포함된 캐러셀 게시물도 지원합니다.'
            },
            {
              question: '다운로드 파일의 화질은?',
              answer:
                '모든 미디어는 크리에이터가 게시한 원본 해상도로 저장됩니다. 화질 손실 없음.'
            },
            {
              question: '다운로드에 Threads 계정이 필요한가요?',
              answer:
                '필요 없습니다. 게시물이 공개인 한, 로그인 없이 미디어를 다운로드할 수 있습니다.'
            },
            {
              question: '여러 사진이 포함된 캐러셀 게시물도 다운로드할 수 있나요?',
              answer:
                '네, Threads 캐러셀 게시물을 완벽하게 지원합니다. 캐러셀의 모든 사진과 동영상을 다운로드할 수 있습니다.'
            }
          ]
        },
        crossLinks: {
          title: '더 많은 동영상 다운로더',
          items: [
            {
              label: 'TikTok Downloader',
              href: '/tiktok-downloader/',
              description: '워터마크 없이 TikTok 동영상을 HD로 다운로드.'
            },
            {
              label: 'X (Twitter) Downloader',
              href: '/x-downloader/',
              description: 'X/Twitter 동영상과 GIF를 HD 화질로 다운로드.'
            },
            {
              label: 'Vimeo Downloader',
              href: '/vimeo-downloader/',
              description: '다양한 해상도로 Vimeo 동영상을 HD 다운로드.'
            },
            {
              label: 'Instagram Downloader',
              href: '/instagram-downloader/',
              description: 'Instagram 사진, 릴스, 캐러셀을 HD 화질로 다운로드.'
            },
            {
              label: 'Telegram Downloader',
              href: '/',
              description: 'Telegram 채널과 그룹의 동영상을 HD로 다운로드.'
            }
          ]
        }
      }
    }
  }
}
