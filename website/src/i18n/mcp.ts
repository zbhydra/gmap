import type { McpPageContent } from './schema'

/**
 * MCP 落地页文案（en-US 基线，W4）。
 *
 * 工具名、参数、端点与鉴权按 014 合同（docs/feat/014.Maps云端/tech-API与MCP.md）：search_places / list_reviews / list_photos，
 * 入口 /mcp/，API Key 或 OAuth access token 均以 Authorization: Bearer 携带；接入优先引导 OAuth 登录，客户端不支持时才用 API Key。
 * 会话与提示词里的商户、电话（555-01xx）均为虚构；额度与价格逐字取自 pricing.ts。
 */
export const scraperMcpContent: McpPageContent = {
  seo: {
    title: 'Google Maps Scraper MCP Server | MapsGrab',
    description:
      'Connect AI agents to Google Maps data: search places, read reviews and get public business photo URLs from Claude Code, Cursor, VS Code, Codex or any MCP client.'
  },
  clients: {
    claude: 'Claude Code',
    cursor: 'Cursor',
    vscode: 'VS Code',
    codex: 'Codex'
  },
  connectCta: 'Connect your agent',
  hero: {
    kicker: 'MCP server',
    title: { lead: 'Google Maps Scraper ', accent: 'MCP', tail: ' Server' },
    lead: 'Give AI agents Google Maps search, reviews and public business photo URLs over one Streamable HTTP endpoint — for Claude Code, Cursor, VS Code, Codex and other MCP clients.',
    meta: ['Streamable HTTP', 'Sign in with OAuth', 'Free plan: {quota}'],
    chips: [
      { label: 'Transport', value: 'Streamable HTTP' },
      { label: 'Tool results', value: 'Structured JSON' }
    ]
  },
  agent: {
    label:
      'Example agent session: a question about local businesses, a MapsGrab tool call with structured results, and the agent’s answer',
    session: 'Agent session',
    connected: 'MCP server {server} connected',
    placeholder: 'Ask about any place on Google Maps…',
    thinking: 'Thinking…',
    running: 'running',
    scenes: [
      {
        prompt: 'Find dentists in Austin, TX rated 4.8 or higher and list their phone numbers.',
        calls: [
          {
            tool: 'search_places',
            args: '{"q": "dentist in Austin, TX"}',
            state: '20 places',
            out: [
              '{"name": "Bluebonnet Family Dental", "average_rating": 4.9, "phone": "(512) 555-0134", …}',
              '{"name": "Barton Hills Smile Studio", "average_rating": 4.8, "phone": "(512) 555-0161", …}',
              '{"name": "Live Oak Dentistry", "average_rating": 4.8, "phone": "(512) 555-0187", …}'
            ],
            more: '+ 17 more places'
          }
        ],
        answer: ['Three of the first 20 results are rated ', { strong: '4.8 or higher' }, ':'],
        rows: [
          ['Bluebonnet Family Dental', '4.9', '(512) 555-0134'],
          ['Barton Hills Smile Studio', '4.8', '(512) 555-0161'],
          ['Live Oak Dentistry', '4.8', '(512) 555-0187']
        ]
      },
      {
        prompt: 'What are people saying in the newest reviews of Ember & Oak Coffee in Portland?',
        calls: [
          {
            tool: 'search_places',
            args: '{"q": "Ember & Oak Coffee, Portland, OR"}',
            state: '1 place',
            out: ['{"name": "Ember & Oak Coffee", "fid": "0x5495…e0ab", "average_rating": 4.7, …}'],
            more: ''
          },
          {
            tool: 'list_reviews',
            args: '{"fid": "0x5495…e0ab", "sort_by": 2}',
            state: '60 reviews',
            out: [
              '{"rating": 5, "text": "Best cortado on Division. Friendly crew.", …}',
              '{"rating": 4, "text": "Great beans. Cozy but small — come early on weekends.", …}',
              '{"rating": 5, "text": "Oat flat white is excellent and the staff remembers names.", …}'
            ],
            more: '"next_cursor": "…"'
          }
        ],
        answer: [
          'Mostly ',
          { strong: '5-star' },
          ' — people praise the espresso and the friendly staff. The one recurring note: ',
          { strong: 'seating is tight on weekends' },
          '.'
        ],
        rows: []
      },
      {
        prompt: 'Which plumbers in Chicago don’t list a website? Put them in a table.',
        calls: [
          {
            tool: 'search_places',
            args: '{"q": "plumber in Chicago, IL"}',
            state: '20 places',
            out: [
              '{"name": "Windy City Pipe Works", "website": null, "phone": "(312) 555-0112", …}',
              '{"name": "Lakeview Drain & Sewer", "website": null, "phone": "(312) 555-0148", …}',
              '{"name": "North Branch Plumbing", "website": null, "phone": "(312) 555-0175", …}'
            ],
            more: '+ 17 more places'
          }
        ],
        answer: [{ strong: '4 of 20' }, ' have no website listed. The first three:'],
        rows: [
          ['Windy City Pipe Works', '4.6', '(312) 555-0112'],
          ['Lakeview Drain & Sewer', '4.4', '(312) 555-0148'],
          ['North Branch Plumbing', '4.8', '(312) 555-0175']
        ]
      },
      {
        prompt: 'Pull the lowest-rated reviews of Rose City Roasters and draft polite replies.',
        calls: [
          {
            tool: 'search_places',
            args: '{"q": "Rose City Roasters, Portland, OR"}',
            state: '1 place',
            out: ['{"name": "Rose City Roasters", "fid": "0x5495…8f7a", "average_rating": 4.6, …}'],
            more: ''
          },
          {
            tool: 'list_reviews',
            args: '{"fid": "0x5495…8f7a", "sort_by": 4}',
            state: '60 reviews',
            out: [
              '{"rating": 2, "text": "Waited 20 minutes for a latte at noon.", "owner_response": null, …}',
              '{"rating": 2, "text": "Great beans, but the line barely moves on Saturdays.", "owner_response": null, …}',
              '{"rating": 3, "text": "Good coffee, hard to find a seat.", "owner_response": "Thanks — more seats are coming!", …}'
            ],
            more: '"next_cursor": "…"'
          }
        ],
        answer: [
          'The lowest ratings mostly mention ',
          { strong: 'slow service at peak hours' },
          '. ',
          { strong: '2 of the 3' },
          ' have no owner reply yet — I drafted one for each.'
        ],
        rows: []
      }
    ]
  },
  tools: {
    kicker: 'Tools',
    title: { lead: 'What the MCP server ', accent: 'exposes', tail: '' },
    lead: 'Three tools over one endpoint, with the same inputs and results as the Search, Reviews and Photos APIs.',
    kind: 'Tool',
    returns: 'Returns',
    items: [
      {
        name: 'search_places',
        icon: 'search',
        title: 'Search places',
        description:
          'Keyword and location searches that return what a Google Maps search shows — names, phones, ratings, hours, coordinates, Place IDs and fids.',
        args: [
          { name: 'q', description: 'Keyword plus city, state or ZIP' },
          { name: 'page', description: 'Result pages to collect, 1–10 · up to 20 places each' },
          { name: 'hl', description: 'Result language, e.g. `en`' },
          { name: 'll', description: 'Location bias, `@lat,lng,zoom`' },
          { name: 'extra', description: '`true` adds emails and social profiles' }
        ],
        returns: 'places · partial · warnings',
        link: 'Same data as the Scraper API'
      },
      {
        name: 'list_reviews',
        icon: 'review',
        title: 'List reviews',
        description:
          'Ratings, review text, authors, dates, photos and owner replies for any business your agent is looking into.',
        args: [
          { name: 'fid', description: 'From any search result' },
          { name: 'cursor', description: '`next_cursor` from the last page; omit for the first' },
          { name: 'sort_by', description: '1 relevant · 2 newest · 3 highest · 4 lowest' },
          { name: 'hl', description: 'Language, e.g. `en`' }
        ],
        returns: 'reviews ≤ 60 · next_cursor',
        link: 'Same data as the Reviews API'
      },
      {
        name: 'list_photos',
        icon: 'image',
        title: 'List business photos',
        description: 'Public photo URLs by fid with partial delivery status. A complete album is not guaranteed.',
        args: [
          { name: 'fid', description: 'From Search or the Place ID Finder' },
          { name: 'max_results', description: 'Positive delivery limit, default 200' }
        ],
        returns: 'photos · returned_count · reported_total · status · reason',
        link: 'Same data as the Photos API'
      }
    ]
  },
  flow: {
    kicker: 'How it connects',
    title: { lead: 'One endpoint between your agent and ', accent: 'live Maps data', tail: '' },
    lead: 'Your client connects over Streamable HTTP and signs in through your browser. The agent discovers the tools, calls them when a prompt needs Maps data, and reads structured JSON back.',
    label:
      'MCP clients connect to MapsGrab and call search_places, list_reviews and list_photos for structured Google Maps data.',
    clientsLabel: 'MCP clients',
    anyClient: 'Any MCP client',
    toolsLabel: 'Tools',
    hub: 'MapsGrab MCP',
    publicData: 'Public Google Maps data',
    resultLabel: 'result',
    results: ['20 places', '60 reviews', '2 photos'],
    steps: [
      {
        title: 'Connect',
        description: 'Add the endpoint to your client, then sign in to MapsGrab through your browser.'
      },
      { title: 'Discover', description: 'Your agent lists the MapsGrab tools and their input schemas.' },
      { title: 'Call', description: 'When a prompt needs Maps data, the agent calls a tool and reads the JSON result.' }
    ]
  },
  setup: {
    kicker: 'Setup',
    title: { lead: 'One config block ', accent: 'per client', tail: '' },
    lead: 'Point your client at the MapsGrab endpoint and sign in through your browser — no API key to copy, no SDK, no local process to run.',
    tabsLabel: 'MCP client',
    copy: 'Copy configuration',
    clients: {
      claude: {
        file: 'Terminal',
        steps: [
          { title: 'Add the server', description: 'Run the command to register `mapsgrab` over HTTP.' },
          {
            title: 'Sign in',
            description: 'In Claude Code, run `/mcp`, choose `mapsgrab` and authenticate — MapsGrab opens in your browser for you to approve.'
          },
          {
            title: 'Ask for Maps data',
            description: 'Claude Code lists the MapsGrab tools and calls them when a prompt needs them.'
          }
        ]
      },
      cursor: {
        file: '~/.cursor/mcp.json',
        steps: [
          {
            title: 'Edit mcp.json',
            description: 'Add the block to `~/.cursor/mcp.json` for every project, or `.cursor/mcp.json` for one.'
          },
          {
            title: 'Sign in',
            description: 'In Cursor Settings → MCP, click Connect next to `mapsgrab` and approve it in your browser.'
          },
          { title: 'Use the tools', description: '`mapsgrab` shows its tools in the MCP server list, ready for the agent.' }
        ]
      },
      vscode: {
        file: '.vscode/mcp.json',
        steps: [
          { title: 'Add .vscode/mcp.json', description: 'Paste the block — it only holds the endpoint URL, nothing secret.' },
          {
            title: 'Sign in',
            description: 'Start the server. VS Code asks to authenticate with MapsGrab and opens your browser to approve.'
          },
          { title: 'Use agent mode', description: 'Open Chat in agent mode and enable the MapsGrab tools.' }
        ]
      },
      codex: {
        file: 'Terminal',
        steps: [
          { title: 'Add the server', description: 'Run `codex mcp add` to register `mapsgrab` by URL.' },
          { title: 'Sign in', description: 'Run `codex mcp login mapsgrab` and approve MapsGrab in your browser.' },
          { title: 'Start Codex', description: 'New sessions load `mapsgrab` and its tools.' }
        ]
      }
    },
    apiKey: {
      title: 'Can’t sign in from a browser? Use an API key',
      description:
        'If your client doesn’t support MCP authorization, or runs on a server or in CI, add your API key as an `Authorization` header instead. Keep the key in an environment variable or your client’s secret input, not a shared config file.',
      link: 'Get API key',
      snippet: 'Any HTTP client'
    },
    spec: {
      title: 'Any other MCP client',
      subtitle: 'MCP Inspector included',
      transport: 'Transport',
      transportValue: 'Streamable HTTP',
      endpoint: 'Endpoint',
      copyEndpoint: 'Copy endpoint',
      auth: 'Auth',
      authValue: 'OAuth sign-in (fallback: Authorization: Bearer YOUR_API_KEY)'
    }
  },
  prompts: {
    kicker: 'Example prompts',
    title: { lead: 'Ask in plain language. ', accent: 'Get rows back.', tail: '' },
    lead: 'Prospecting, local market research, review monitoring — describe the job, and your agent decides which MapsGrab tool to call.',
    rows: [
      [
        {
          icon: 'target',
          tag: 'Prospecting',
          quote: '“Find dentists in Austin, TX rated 4.8 or higher and list their phone numbers.”',
          tools: ['search_places'],
          fields: ''
        },
        {
          icon: 'review',
          tag: 'Reputation',
          quote: '“Summarize what people say in the newest reviews of Ember & Oak Coffee in Portland.”',
          tools: ['search_places', 'list_reviews'],
          fields: ''
        },
        {
          icon: 'list-plus',
          tag: 'Lead lists',
          quote: '“Build a list of yoga studios in Denver with their emails and Instagram profiles.”',
          tools: ['search_places'],
          fields: 'extra: true · emails · medias'
        },
        {
          icon: 'chart',
          tag: 'Market research',
          quote: '“Compare ratings and review counts for the coffee shops on Division St in Portland.”',
          tools: ['search_places'],
          fields: 'average_rating · review_count'
        },
        {
          icon: 'table',
          tag: 'Enrichment',
          quote: '“Add the Place ID, phone and website for every business in this spreadsheet.”',
          tools: ['search_places'],
          fields: 'place_id · phone · website'
        },
        {
          icon: 'mail',
          tag: 'Owner replies',
          quote: '“Pull the lowest-rated reviews of Rose City Roasters and draft polite replies.”',
          tools: ['search_places', 'list_reviews'],
          fields: 'sort_by: 4'
        }
      ],
      [
        {
          icon: 'web',
          tag: 'Website gaps',
          quote: '“Which plumbers in Chicago don’t list a website? Put them in a table.”',
          tools: ['search_places'],
          fields: 'website: null'
        },
        {
          icon: 'clock',
          tag: 'Opening hours',
          quote: '“Which auto repair shops near 60614 are open on Sundays?”',
          tools: ['search_places'],
          fields: 'opening_hours'
        },
        {
          icon: 'map',
          tag: 'Mapping',
          quote: '“Export the vegan restaurants in Brooklyn with coordinates as GeoJSON.”',
          tools: ['search_places'],
          fields: 'latitude · longitude'
        },
        {
          icon: 'globe',
          tag: 'Localization',
          quote: '“Search for bakeries in Lyon and return the listing details in French.”',
          tools: ['search_places'],
          fields: 'hl: fr'
        },
        {
          icon: 'check-circle',
          tag: 'Claimed listings',
          quote: '“Check which gyms in Austin have claimed their Google Business listing.”',
          tools: ['search_places'],
          fields: 'claimed'
        },
        {
          icon: 'user',
          tag: 'Local Guides',
          quote: '“Which recent reviews of Hawthorne Bean Co. come from Local Guides?”',
          tools: ['search_places', 'list_reviews'],
          fields: 'author_is_local_guide'
        },
        {
          icon: 'trend',
          tag: 'Response time',
          quote: '“Do these salons answer their reviews, and how long do owner replies take?”',
          tools: ['list_reviews'],
          fields: 'owner_response_at_ms'
        }
      ]
    ]
  },
  trust: {
    kicker: 'Auth & data',
    title: { lead: 'Sign in once. ', accent: 'Public data only.', tail: '' },
    lead: 'Every call to the MCP endpoint carries a bearer credential — an OAuth token from signing in, or your API key if your client can’t sign in — and every result comes from what Google Maps shows publicly.',
    inspector: {
      label: 'Example MCP request with a bearer Authorization header, and its JSON-RPC response with structured content',
      request: 'Request',
      response: 'Response',
      verified: 'Token verified'
    },
    items: [
      {
        icon: 'key',
        title: 'Sign in, or fall back to a key',
        description:
          'Sign in through your browser and approve the client. Clients without MCP authorization can pass your API key as a bearer token instead — both reach the same tools.'
      },
      {
        icon: 'eye',
        title: 'Reads Google Maps, never writes',
        description: 'The tools only search and read public listings. The one thing a call changes is your request usage.'
      },
      {
        icon: 'lock',
        title: 'No secrets in config files',
        description:
          'With sign-in, your config only holds the endpoint URL. If you use an API key, keep it in an environment variable, not a shared file.'
      },
      {
        icon: 'shield',
        title: 'Revoke access any time',
        description:
          'Signed-in clients are listed in Dashboard → API, where you can revoke them. Generating a new API key disables the old one immediately.'
      }
    ]
  },
  billing: {
    kicker: 'Pricing',
    title: { lead: 'Covered by your ', accent: 'API plan', tail: '' },
    lead: 'The MCP server draws from the same monthly request quota as the Scraper API and Reviews API. Each successful tool call counts as one request.',
    compare: 'Compare API plans',
    head: {
      plan: 'Plan',
      requests: 'Monthly requests',
      scale: '(log scale)',
      price: 'Price'
    }
  },
  faq: {
    title: { lead: 'MCP server ', accent: 'questions', tail: '' },
    items: [
      {
        question: 'What is the MapsGrab MCP server?',
        answer:
          'An MCP server with search_places, list_reviews and list_photos. AI agents get the same structured data as the Search, Reviews and Photos APIs.'
      },
      {
        question: 'Which clients can connect?',
        answer:
          'Any MCP client that supports Streamable HTTP: Claude Code, Cursor, VS Code, Codex, MCP Inspector and others. Use the endpoint URL exactly as shown, including the trailing slash.'
      },
      {
        question: 'How is it authenticated?',
        answer:
          'With OAuth sign-in: Claude Code, Cursor, VS Code, Codex and other clients that support MCP authorization open MapsGrab in your browser; you approve the client and can revoke it later in Dashboard → API. Only if your client can’t sign in, pass your API key as a bearer token in the Authorization header.'
      },
      {
        question: 'How are tool calls counted?',
        answer:
          'Each successful tool call counts as one request, including partial photo delivery. Search, Reviews, Photos and MCP share one monthly quota. Failed calls are not counted.'
      },
      {
        question: 'Can my agent get business photos?',
        answer:
          'Yes. Call list_photos with fid and an optional max_results (default 200). It returns public photo URLs and partial delivery details; a complete album is not guaranteed.'
      }
    ]
  },
  cta: {
    title: { lead: 'Give your agent ', accent: 'live Maps data', tail: '' },
    lead: 'One MCP connection, three tools — search, reviews and public business photo URLs in structured results.'
  }
}
