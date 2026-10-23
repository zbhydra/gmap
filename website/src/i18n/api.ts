import type { ApiPageSharedContent, ApiVariantContent } from './schema'

/**
 * API 落地页文案（en-US 基线，W4）：三个路由（Scraper / Reviews / Photos）共用一套版式。
 *
 * 端点、参数、计量与字段一律按 014 合同（docs/feat/014.Maps云端/tech-API与MCP.md）与 Provider DTO 写；
 * Photos 仅承诺有效部分交付，数量上限不保证实际交付数量或相册完整性。
 * 示例商户、电话（555-01xx）与 ID 均为虚构；价格、额度与方案名不在这里，逐字取自 pricing.ts。
 */

/** 主示例商户 Ember & Oak Coffee 的 FID（与 CID / Place ID 按 placeUrl 算法自洽）。 */
const SAMPLE_FID = '0x54950a2291f60bf1:0xbeb4a5f2c3d1e0ab'

export const apiPageContent: ApiPageSharedContent = {
  switchLabel: 'API endpoints',
  switchItems: {
    search: 'Scraper',
    reviews: 'Reviews',
    photos: 'Photos'
  },
  primaryCta: 'Get API key',
  pricingCta: 'View pricing',
  console: {
    label: 'Example API request and response',
    langLabel: 'Request language',
    langs: {
      curl: 'cURL',
      python: 'Python',
      node: 'Node.js'
    },
    copy: 'Copy request',
    replay: 'Replay request',
    ready: 'Ready',
    composing: 'Composing request…',
    sending: 'Sending request…',
    done: 'Response · 200 OK · application/json',
    waiting: '// waiting for response…',
    response: 'Example response'
  },
  endpoints: {
    kicker: 'Endpoints',
    title: { lead: 'One key. ', accent: 'Three', tail: ' endpoints.' },
    lead: 'Search for places, then pass any result’s `fid` to the Reviews or Photos API. All three share one API key and monthly request quota.',
    here: 'You’re here',
    paramsLabel: 'Parameters',
    mcp: {
      title: 'Building with AI agents?',
      description:
        'The MapsGrab MCP server brings Search, Reviews and Photos to Claude Code, Cursor, VS Code, Codex and other MCP clients — connect by signing in or with your API key.',
      link: 'Explore MCP'
    }
  },
  chain: {
    kicker: 'Chain endpoints',
    title: { lead: 'One ID takes you from search ', accent: 'to reviews and photos', tail: '' },
    lead: 'Every Search result carries its `fid`. Pass it to the Reviews or Photos API to read reviews and collect public business photo URLs.',
    label:
      'Search returns places with a fid. Reviews and Photos reuse that fid to return reviews and public business photo URLs.',
    places: [
      { name: 'Ember & Oak Coffee', meta: '4.7 · 1,284 reviews' },
      { name: 'Rose City Roasters', meta: '4.6 · 892 reviews' },
      { name: 'Hawthorne Bean Co.', meta: '4.8 · 2,106 reviews' }
    ],
    reviews: [
      {
        rating: 5,
        text: '“Best cortado on Division. Friendly crew.”',
        meta: 'Maya R. · 2 weeks ago',
        reply: 'Owner: Thanks Maya — see you soon!'
      },
      {
        rating: 4,
        text: '“Great beans. Cozy but small — come early on weekends.”',
        meta: 'Daniel K. · 3 weeks ago',
        reply: ''
      }
    ],
    photos: {
      note: 'Public photo URLs with partial delivery; a complete album is not guaranteed.'
    }
  },
  reference: {
    kicker: 'Reference',
    title: { lead: 'Request in, ', accent: 'JSON', tail: ' out' },
    lead: 'Send your key as `Authorization: Bearer YOUR_API_KEY` with a JSON body. Every response is wrapped in `{code, data, msg}`, and `code` 10000 means success.',
    baseUrl: 'Base URL',
    copyBaseUrl: 'Copy base URL',
    request: 'Request',
    response: 'Response',
    columns: {
      parameter: 'Parameter',
      field: 'Field',
      type: 'Type',
      description: 'Description',
      example: 'Example'
    },
    required: 'required',
    groupsLabel: 'Field groups',
    notes: [
      {
        icon: 'gauge',
        title: 'One request per successful call',
        description:
          'Successful Search and Reviews calls count once, including empty results. Photos partial delivery counts once regardless of photo count. Failed calls are not counted.'
      },
      {
        icon: 'key',
        title: 'A 401 means check your key',
        description:
          'A missing or invalid key returns HTTP 401. Other errors return HTTP 200 with a non-10000 `code` and a `msg`.'
      },
      {
        icon: 'locate',
        title: 'Location is a bias, not a fence',
        description: '`ll` tells Maps where to search. Places outside that view can still appear.'
      },
      {
        icon: 'target',
        title: 'Name the place',
        description: 'Put a city, state or ZIP in `q` — “near me” has nothing to anchor to on a server.'
      }
    ]
  },
  plans: {
    kicker: 'API plans',
    title: { lead: 'Programmatic access, ', accent: 'priced by requests', tail: '' },
    lead: 'Search, Reviews, Photos and the MCP server share one monthly request quota. Every successful call counts as one request.'
  },
  faq: {
    lead: 'The short answers. Anything else, support is one email away.',
    contact: 'Contact support'
  },
  cta: {
    kicker: 'Get started',
    note: 'Free monthly quota included. No credit card.'
  }
}

export const scraperApiContent: ApiVariantContent = {
  seo: {
    title: 'Google Maps Scraper API — Business Data in JSON | MapsGrab',
    description:
      'The MapsGrab Scraper API returns Google Maps search results as JSON: name, address, phone, website, rating, hours, coordinates, Place ID and fid — plus emails and social profiles on request.'
  },
  hero: {
    title: { lead: 'Google Maps ', accent: 'Scraper', tail: ' API' },
    lead: 'Send a keyword over HTTPS and get Google Maps businesses back as JSON: name, address, phone, website, rating, opening hours, coordinates, Place ID and fid — plus emails and social profiles on request.',
    meta: ['Free plan: {quota}', 'One key for Search and Reviews', 'JSON over HTTPS'],
    chips: [
      { label: 'Per place', value: '29 data fields' },
      { label: 'Per page', value: 'Up to 20 places' }
    ]
  },
  endpoint: {
    name: 'Scraper API',
    description:
      'Businesses for any keyword and optional location — 29 fields per place, plus emails and social profiles with `extra`.',
    link: 'Explore the Scraper API'
  },
  caps: {
    title: { lead: 'What the ', accent: 'Scraper API', tail: ' returns' },
    lead: 'A keyword and an optional location bias in; the places a Google Maps search shows out, as structured JSON.',
    items: [
      {
        icon: 'search',
        title: 'Search by keyword and location',
        description:
          'Send `q` with an optional `ll` location bias. `page` sets how many result pages to collect, 1–10, up to 20 places each, all in one response.'
      },
      {
        icon: 'table',
        title: '29 fields per place',
        description:
          'Name, categories, full address, phone, website, rating and review count, opening hours, coordinates, Place ID, CID, fid, owner and more.'
      },
      {
        icon: 'mail',
        title: 'Email and social enrichment',
        description:
          'Set `extra` to `true` to add `emails` and `medias`: Instagram, Facebook, YouTube, TikTok, LinkedIn and X profiles found on each business website.'
      },
      {
        icon: 'braces',
        title: 'Clean, predictable JSON',
        description:
          'snake_case fields in one `{code, data, msg}` envelope. Values Google Maps doesn’t show come back as `null` or an empty list, never as empty strings.'
      },
      {
        icon: 'layers',
        title: 'Partial data is flagged',
        description:
          'If some details can’t be filled in, you still get the places — with `partial` set to `true` and `warnings` saying what is missing.'
      },
      {
        icon: 'shield',
        title: 'Public data only',
        description: 'Results contain only what Google Maps shows publicly — the same details any visitor can read.'
      }
    ]
  },
  reference: {
    shape: 'data: { places, partial, warnings }',
    params: [
      {
        name: 'q',
        type: 'string',
        required: true,
        description:
          'What to search for, up to 300 characters — a business type plus a place, e.g. `coffee shop in Portland, OR`.'
      },
      {
        name: 'page',
        type: 'integer',
        required: false,
        description:
          'How many result pages to collect, 1–10, up to 20 places each, all returned in one response. Collection stops early when a page has fewer than 20 places or nothing new. Default `1`.'
      },
      {
        name: 'hl',
        type: 'string',
        required: false,
        description: 'Result language, e.g. `en` or `fr`. Default `en`.'
      },
      {
        name: 'll',
        type: 'string',
        required: false,
        description:
          'Optional location bias as `@lat,lng,zoom`, zoom 0–21. It tells Maps where to search; results aren’t clipped to a radius.'
      },
      {
        name: 'extra',
        type: 'boolean',
        required: false,
        description: '`true` adds `emails` and `medias` to every place. Default `false`.'
      }
    ],
    groups: [
      {
        label: 'Identity',
        fields: [
          { name: 'name', type: 'string', example: '"Ember & Oak Coffee"' },
          { name: 'categories', type: 'string[]', example: '["Coffee shop", "Espresso bar"]' },
          { name: 'place_id', type: 'string', example: '"ChIJ8Qv2kSIKlVQRq-DRw_KltL4"' },
          { name: 'cid', type: 'string', example: '"13741790825100206251"' },
          { name: 'fid', type: 'string', example: `"${SAMPLE_FID}"` },
          { name: 'kgmid', type: 'string', example: '"/g/11c5x9_qk_"' },
          { name: 'google_maps_url', type: 'string', example: '"https://www.google.com/maps?cid=13741790825100206251"' },
          { name: 'google_knowledge_url', type: 'string', example: '"https://www.google.com/search?kgmid=/g/11c5x9_qk_"' },
          { name: 'search_keyword', type: 'string', example: '"coffee shop in Portland, OR"' }
        ]
      },
      {
        label: 'Contact',
        fields: [
          { name: 'phone', type: 'string', example: '"(503) 555-0142"' },
          { name: 'phones', type: 'string[]', example: '["(503) 555-0142", "+1 503-555-0142"]' },
          { name: 'website', type: 'string', example: '"emberandoak.coffee/"' },
          { name: 'domain', type: 'string', example: '"emberandoak.coffee"' },
          { name: 'emails', type: 'string[]', example: '["hello@emberandoak.coffee"]', badge: 'extra' },
          { name: 'medias', type: 'object', example: '{"instagram": "https://www.instagram.com/emberandoak", …}', badge: 'extra' }
        ]
      },
      {
        label: 'Location',
        fields: [
          { name: 'full_address', type: 'string', example: '"3021 SE Division St, Portland, OR 97202"' },
          { name: 'street', type: 'string', example: '"3021 SE Division St"' },
          { name: 'municipality', type: 'string', example: '"Portland, OR 97202"' },
          { name: 'latitude', type: 'number', example: '45.504912' },
          { name: 'longitude', type: 'number', example: '-122.635377' },
          { name: 'time_zone', type: 'string', example: '"America/Los_Angeles"' }
        ]
      },
      {
        label: 'Ratings',
        fields: [
          { name: 'average_rating', type: 'number', example: '4.7' },
          { name: 'review_count', type: 'integer', example: '1284' },
          { name: 'review_url', type: 'string', example: '"https://search.google.com/local/reviews?placeid=ChIJ…"' }
        ]
      },
      {
        label: 'Profile',
        fields: [
          { name: 'about', type: 'string', example: '"Service options: [Dine-in, Takeout], Highlights: [Great coffee]"' },
          { name: 'opening_hours', type: 'object[]', example: '[{"name": "Thursday(2026-10-15)", "values": ["7\u202fAM–6\u202fPM"]}, …]' },
          { name: 'claimed', type: 'boolean', example: 'true' },
          { name: 'owner', type: 'string', example: '"Ember & Oak Coffee (Owner)"' },
          { name: 'owner_id', type: 'string', example: '"104287731665220398123"' },
          { name: 'owner_link', type: 'string', example: '"https://www.google.com/maps/contrib/1042877316…"' },
          { name: 'featured_image', type: 'string', example: '"https://lh5.googleusercontent.com/p/AF1Qip…"' }
        ]
      },
      {
        label: 'Page',
        fields: [
          { name: 'places', type: 'place[]', example: '[{…}, …]' },
          { name: 'partial', type: 'boolean', example: 'false' },
          { name: 'warnings', type: 'string[]', example: '[]' }
        ]
      }
    ]
  },
  faq: {
    title: { lead: 'Scraper API ', accent: 'questions', tail: '' },
    items: [
      {
        question: 'What does the Scraper API return?',
        answer:
          'JSON with up to 20 places per collected page. Each place has 29 fields — name, categories, address, phone, website, rating, review count, opening hours, coordinates, Place ID, CID, fid and more — plus emails and social profiles when extra is true.'
      },
      {
        question: 'How do I authenticate?',
        answer:
          'Send your MapsGrab API key as a bearer token in the Authorization header. Each account has one key. It is shown in full only when you generate it, and generating a new key disables the old one immediately.'
      },
      {
        question: 'How are requests counted?',
        answer:
          'Each successful call counts as one request, whatever its page value — including searches that return no places or partial data. Failed calls are not counted. Search, Reviews, Photos and the MCP server share one monthly quota.'
      },
      {
        question: 'What does page do?',
        answer:
          'page is how many result pages to collect in one call, from 1 to 10. Each page adds up to 20 places, and collection stops early when Google Maps has nothing new. It is not a page number.'
      },
      {
        question: 'Is the data public?',
        answer:
          'Yes. The API only returns information publicly displayed on Google Maps — the same details any visitor can read. It does not access private accounts or non-public data.'
      }
    ]
  },
  cta: {
    title: { lead: 'Put Maps data in your ', accent: 'application', tail: '' },
    lead: 'One HTTP request per search, structured JSON in the response — for CRMs, data pipelines and your own products.'
  }
}

export const reviewsApiContent: ApiVariantContent = {
  seo: {
    title: 'Google Maps Reviews Scraper API — Reviews in JSON | MapsGrab',
    description:
      'The MapsGrab Reviews API returns the public reviews of a Google Maps business as JSON: rating, text and translation, author, date, review photos and owner replies — up to 60 per page with a cursor.'
  },
  hero: {
    title: { lead: 'Google Maps ', accent: 'Reviews', tail: ' Scraper API' },
    lead: 'Request the public reviews of any Google Maps business by its fid and get structured JSON back: rating, text and translation, author, date, review photos and owner replies — page by page with a cursor.',
    meta: ['Free plan: {quota}', 'Up to 60 reviews per page', 'JSON over HTTPS'],
    chips: [
      { label: 'Per page', value: 'Up to 60 reviews' },
      { label: 'Sort by', value: 'Relevance · newest · rating' }
    ]
  },
  endpoint: {
    name: 'Reviews API',
    description: 'Public reviews of one business by `fid` — up to 60 per page, sorted your way, paged with a cursor.',
    link: 'Explore the Reviews API'
  },
  caps: {
    title: { lead: 'What the ', accent: 'Reviews API', tail: ' returns' },
    lead: 'Every public review of a business — ratings, text, authors, photos and owner replies — one page per request.',
    items: [
      {
        icon: 'review',
        title: 'Reviews by fid',
        description:
          'Address a business by the `fid` from any Scraper API result, then pass `next_cursor` back to read the next page, up to 60 reviews each.'
      },
      {
        icon: 'filter',
        title: 'Sorted your way',
        description: '`sort_by` returns the most relevant (1), newest (2), highest-rated (3) or lowest-rated (4) reviews first.'
      },
      {
        icon: 'list',
        title: 'Text, translation and dates',
        description:
          'Rating, review text, `translated_text` and `language`, with `published_at_ms` and a relative date for every review.'
      },
      {
        icon: 'user',
        title: 'Author details',
        description: 'Author name and profile link, the author’s review count and Local Guide status.'
      },
      {
        icon: 'image',
        title: 'Photos and owner replies',
        description:
          '`images` lists the photo URLs attached to a review; `owner_response` carries the owner’s reply and `owner_response_at_ms` its time.'
      },
      {
        icon: 'shield',
        title: 'Public data only',
        description: 'Only reviews publicly shown on Google Maps — the same content any visitor can read.'
      }
    ]
  },
  reference: {
    shape: 'data: { reviews, next_cursor }',
    params: [
      {
        name: 'fid',
        type: 'string',
        required: true,
        description: 'Business feature ID, e.g. `0x5495…:0xbeb4…`. Every Scraper API place includes it.'
      },
      {
        name: 'cursor',
        type: 'string',
        required: false,
        description: 'The `next_cursor` from the previous page. Omit it for the first page.'
      },
      {
        name: 'sort_by',
        type: 'integer',
        required: false,
        description: '`1` most relevant · `2` newest · `3` highest rating · `4` lowest rating. Default `1`.'
      },
      {
        name: 'hl',
        type: 'string',
        required: false,
        description: 'Language code, e.g. `en`. Default `en`.'
      }
    ],
    groups: [
      {
        label: 'Review',
        fields: [
          { name: 'review_id', type: 'string', example: '"ChdDSUhNMG9nS0VJQ0FnSUR3…"' },
          { name: 'rating', type: 'integer', example: '5' },
          { name: 'text', type: 'string', example: '"Best cortado on Division. Friendly crew."' },
          { name: 'translated_text', type: 'string', example: 'null' },
          { name: 'language', type: 'string', example: '"en"' },
          { name: 'published_at_ms', type: 'integer', example: '1790553600000' },
          { name: 'relative_date', type: 'string', example: '"2 weeks ago"' },
          { name: 'images', type: 'string[]', example: '["https://lh5.googleusercontent.com/p/AF1QipN…"]' },
          { name: 'origin', type: 'string', example: '"Google"' }
        ]
      },
      {
        label: 'Author',
        fields: [
          { name: 'author_name', type: 'string', example: '"Maya R."' },
          { name: 'author_url', type: 'string', example: '"https://www.google.com/maps/contrib/1123…"' },
          { name: 'author_review_count', type: 'integer', example: '38' },
          { name: 'author_is_local_guide', type: 'boolean', example: 'true' }
        ]
      },
      {
        label: 'Owner reply',
        fields: [
          { name: 'owner_response', type: 'string', example: '"Thanks Maya — see you soon!"' },
          { name: 'owner_response_at_ms', type: 'integer', example: '1790640000000' }
        ]
      },
      {
        label: 'Page',
        fields: [
          { name: 'reviews', type: 'review[]', example: '[{…}, …]' },
          { name: 'next_cursor', type: 'string', example: '"CAESBkVnSUlDZw…"' }
        ]
      }
    ]
  },
  faq: {
    title: { lead: 'Reviews API ', accent: 'questions', tail: '' },
    items: [
      {
        question: 'How do I address a specific business?',
        answer:
          'With its fid, the feature ID every Scraper API place includes. The free Place ID Finder also reads the FID from any Google Maps place URL.'
      },
      {
        question: 'What fields does a review include?',
        answer:
          'Review ID, rating, text with its translation and language, publish time and relative date, the author’s name, profile link, review count and Local Guide status, attached photos, and the owner reply with its time.'
      },
      {
        question: 'How many reviews can I collect?',
        answer:
          'Each request returns one page of up to 60 reviews plus a next_cursor. Pass it back to read the next page; when next_cursor is null, there are no more pages.'
      },
      {
        question: 'How are requests counted?',
        answer:
          'Each successful call counts as one request, including calls that return no reviews. Failed calls are not counted. The quota is shared with the Scraper API, Photos API and the MCP server.'
      },
      {
        question: 'Is the data public?',
        answer:
          'Yes. The API only returns reviews publicly displayed on Google Maps — the same content any visitor can read. It does not access private accounts or non-public data.'
      }
    ]
  },
  cta: {
    title: { lead: 'Monitor reviews ', accent: 'at scale', tail: '' },
    lead: 'Cursor-paged review threads in clean JSON — for monitoring, research and reporting.'
  }
}

export const photosApiContent: ApiVariantContent = {
  seo: {
    title: 'Google Maps Photos API — Business Photo URLs | MapsGrab',
    description:
      'Get public Google Maps business photo URLs by fid. Set a result limit and receive JSON with the delivered count, upstream reported total and partial delivery reason.'
  },
  hero: {
    title: { lead: 'Google Maps ', accent: 'Photos', tail: ' API' },
    lead: 'Pass a business’s fid to get public photo URLs as JSON. Set max_results to limit delivery; results are partial and do not guarantee a complete album.',
    meta: ['Free plan: {quota}', 'Public business photo URLs', 'Shared API request quota'],
    chips: [
      { label: 'Delivery', value: 'Partial results' },
      { label: 'Count', value: 'returned_count' }
    ]
  },
  endpoint: {
    name: 'Photos API',
    description: 'Public business photo URLs by `fid`, with a `max_results` limit and explicit partial delivery status.',
    link: 'Explore the Photos API'
  },
  caps: {
    title: { lead: 'Business ', accent: 'photos', tail: ' in JSON' },
    lead: 'Photo URLs and delivery details in one response.',
    items: [
      {
        icon: 'image',
        title: 'Photos by fid',
        description:
          'Use the `fid` from Search or the Place ID Finder. Each `photos` item contains a public photo `url`.'
      },
      {
        icon: 'filter',
        title: 'Limit each request',
        description: '`max_results` is a positive integer, default 200. It caps delivery; fewer photos may be returned. There is no page or cursor.'
      },
      {
        icon: 'list',
        title: 'Read the delivery status',
        description:
          '`status` is `partial`; `reason` explains why collection stopped. `reported_total` is an upstream count or `null`, not a verified album size.'
      }
    ]
  },
  reference: {
    shape: '{ photos: [{url}], returned_count, reported_total, status, reason }',
    params: [
      {
        name: 'fid',
        type: 'string',
        required: true,
        description: 'Business FID from Search or the Place ID Finder, in `0x…:0x…` format (12–20 hex digits per segment).'
      },
      {
        name: 'max_results',
        type: 'integer',
        required: false,
        description: 'Positive delivery limit. Default 200; does not guarantee that many photos.'
      }
    ],
    groups: [
      {
        label: 'Photos',
        fields: [
          { name: 'photos', type: 'photo[]', example: '[{"url": "https://lh5.googleusercontent.com/p/AF1Qip…"}]' },
          { name: 'url', type: 'string', example: '"https://lh5.googleusercontent.com/p/AF1Qip…"' }
        ]
      },
      {
        label: 'Delivery',
        fields: [
          { name: 'returned_count', type: 'integer', example: '2' },
          { name: 'reported_total', type: 'integer | null', example: '178' },
          { name: 'status', type: 'string', example: '"partial"' },
          { name: 'reason', type: 'string', example: '"limit_reached"' }
        ]
      }
    ]
  },
  faq: {
    title: { lead: 'Photos API ', accent: 'questions', tail: '' },
    items: [
      {
        question: 'How do I request business photos?',
        answer:
          'POST to /photos with fid and an optional max_results. Use the same bearer API key as Search and Reviews.'
      },
      {
        question: 'Will I get every photo?',
        answer:
          'A complete album is not guaranteed. Successful responses have status partial and a reason such as limit_reached, pagination_unverified or budget_exhausted. returned_count is the delivered count; reported_total is an unverified upstream count or null.'
      },
      {
        question: 'How do I get a business’s fid?',
        answer:
          'Every Scraper API place includes its fid, and the free Place ID Finder reads the FID from any Google Maps place URL.'
      },
      {
        question: 'How are requests counted?',
        answer:
          'Each successful partial delivery counts as one request, regardless of photo count. If no valid photos can be delivered, the call fails and is not counted. Search, Reviews, Photos and MCP share one quota.'
      },
      {
        question: 'Is the data public?',
        answer:
          'Yes. Image URLs point to photos publicly shown on Google Maps — the same images any visitor can see.'
      }
    ]
  },
  cta: {
    title: { lead: 'Bring business ', accent: 'photos', tail: ' to your app' },
    lead: 'One fid, public photo URLs and explicit delivery status — with the API key you already use for Search and Reviews.'
  }
}
