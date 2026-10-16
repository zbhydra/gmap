import type { SiteContent } from './schema'

/**
 * 免费工具矩阵内容（en-US 基线）。
 *
 * 7 个工具页（D1 清单全做）：每页 = 表单 + 纯前端逻辑 + SEO 正文 + FAQ + CTA 漏斗（安装插件 / 查看套餐）。
 * SEO 正文：Place ID Finder 为三步用法 + 标识讲解（steps / identifiers），其余工具为 howTo 三节。
 * 交互形态在 plans §1 W4 钉死：短链不支持、Email 纯格式校验、CSV 纯前端并集合并。
 * 工具名与一句话描述在 layout.footer.tools 与 pages.home.tools.descriptions，外壳直接复用。
 */
export const toolsContent: SiteContent['pages']['tools'] = {
  common: {
    crumbRoot: 'Free tools',
    guide: {
      kicker: 'About this tool',
      title: { lead: 'What it does and ', accent: 'how to use it', tail: '' },
      lead: 'Everything runs in your browser — nothing you paste or upload leaves your device.'
    },
    related: {
      kicker: 'Related tools',
      title: { lead: 'More free tools for ', accent: 'Maps data', tail: '' },
      lead: 'Small utilities that run entirely in your browser — what you paste never leaves your device.'
    },
    faq: {
      kicker: 'FAQ',
      lead: 'The short answers. Anything else, support is one email away.',
      contact: 'Contact support'
    },
    cta: {
      kicker: 'Bulk extraction',
      primary: 'Install MapsGrab',
      secondary: 'View pricing',
      note: 'Free monthly quota included. No credit card.'
    },
    resultHeading: 'Result',
    copy: 'Copy',
    copied: 'Copied to clipboard.',
    downloadCsv: 'Download CSV',
    genericError: 'Something went wrong. Check your input and try again.'
  },
  placeIdFinder: {
    seo: {
      title: 'Place ID Finder — Get a Google Maps Place ID from a URL | MapsGrab',
      description:
        'Paste a Google Maps place URL and get its Place ID, CID, and FID instantly. Free browser-based Place ID finder — no sign-in, your URL never leaves your device.'
    },
    hero: {
      title: { lead: 'Place ID ', accent: 'Finder', tail: '' },
      description:
        'Paste a full Google Maps place URL and read out its Place ID, CID, and FID in one click. Everything is decoded in your browser — the URL is never uploaded.'
    },
    form: {
      urlLabel: 'Google Maps place URL',
      urlPlaceholder: 'https://www.google.com/maps/place/…/data=…',
      submit: 'Find Place ID',
      errorShortLink: 'Short links (maps.app.goo.gl) are not supported. Open the link in your browser and paste the full URL from the address bar.',
      errorInvalidUrl: 'This does not look like a Google Maps place URL. Open a place in Google Maps and copy the full URL (it should contain "/maps/place/" and "@" or "data=").',
      errorNoIds: 'No place identifiers were found in this URL. Make sure you copied the URL of a place page, not a search results page.',
      examplesLabel: 'Try',
      examples: {
        city: 'San Francisco',
        business: 'Coffee shop · Portland',
        shortLink: 'Short link'
      }
    },
    result: {
      placeId: 'Place ID',
      cid: 'CID',
      fid: 'FID',
      placeIdNote: 'base64url of the two FID halves',
      cidNote: 'FID 2nd half, hex → decimal',
      fidNote: 'last two 0x… segments in the URL',
      anatomy: {
        fidHigh: 'FID · 1st half',
        fidLow: 'FID · 2nd half',
        empty: 'Paste a place URL — the identifiers it carries light up here.'
      },
      missing: 'Not in this link',
      copyLabel: 'Copy {label}',
      privacy: 'Decoded in your browser — the URL is never uploaded.'
    },
    chips: [
      { label: 'Google API key', value: 'Not needed' },
      { label: 'Your URL', value: 'Never uploaded' }
    ],
    steps: {
      head: {
        kicker: 'How it works',
        title: { lead: 'From a Maps link to a ', accent: 'Place ID', tail: '' },
        lead: 'No API key and no sign-in — the identifiers are already inside the place URL you copy.'
      },
      items: [
        {
          heading: 'Open the place in Google Maps',
          body: 'Search for the business and click its listing so the place page opens.'
        },
        {
          heading: 'Copy the full URL',
          body: 'Copy the long URL from the address bar — it contains the business name, an "@" coordinate segment, and a "data=" parameter.'
        },
        {
          heading: 'Paste and decode',
          body: 'Paste it above and press "Find Place ID". The Place ID, CID, and FID appear, each with a copy button.'
        }
      ],
      copiedBadge: 'Copied',
      note: 'Short links like maps.app.goo.gl cannot be decoded without following them across domains, so open the link first and paste the full address.'
    },
    identifiers: {
      head: {
        kicker: 'The identifiers',
        title: { lead: 'Three IDs, ', accent: 'one place', tail: '' },
        lead: 'A Place ID is Google\'s stable identifier for a location — a string starting with "ChIJ" that stays valid even if the business renames or moves.'
      },
      keys: {
        placeId: 'The "ChIJ…" string consumed by the Places API, review widgets, and booking systems.',
        fid: 'A pair of hexadecimal values that identify the same feature internally.',
        cid: 'The decimal form of the FID\'s second half, used by older Maps URLs and ads tooling.'
      },
      derive: {
        label: 'How the Place ID and CID are derived from the FID',
        source: 'FID from the URL',
        protobuf: 'protobuf · little-endian',
        base64: 'base64url',
        secondHalf: '2nd half',
        hexToDecimal: 'hex → decimal'
      },
      features: [
        {
          heading: 'No API key',
          body: 'The Place ID is already encoded inside the place URL you paste, so the tool can decode it offline.'
        },
        {
          heading: 'No rate limits',
          body: 'No lookup service is involved — the conversion from a Maps URL to a Place ID is deterministic.'
        },
        {
          heading: 'Never uploaded',
          body: 'The entire computation runs in your browser tab — the URL you paste is never sent to any server.'
        }
      ]
    },
    faq: {
      title: { lead: 'Place ID ', accent: 'questions', tail: '' },
      items: [
        {
          question: 'Does a Place ID ever change?',
          answer:
            'Rarely. Google documents Place IDs as stable long-term identifiers, but a small number of IDs can be retired when locations are merged or restructured. If a consumer of a Place ID reports it as invalid, look the place up again and refresh the stored value.'
        },
        {
          question: 'Is the Place ID the same as the CID?',
          answer:
            'No. The CID is a decimal identifier used by older Maps links and advertising tools, while the Place ID is the "ChIJ…" string consumed by the Places API. They identify the same feature but are not interchangeable, which is why this tool reports both.'
        },
        {
          question: 'Why is my maps.app.goo.gl link rejected?',
          answer:
            'Short links only resolve to the full place URL after a cross-domain redirect, which a browser-only tool cannot follow without sending your link to a third party. Open the short link in your browser and paste the full URL that appears in the address bar.'
        },
        {
          question: 'Do I need a Google API key for this?',
          answer:
            'No. The Place ID is already encoded inside the place URL you paste, so the tool can decode it offline. A Google API key is only needed when you want to call the Places API with the ID afterwards.'
        }
      ]
    },
    cta: {
      title: { lead: 'Need Place IDs ', accent: 'at scale?', tail: '' },
      lead: 'MapsGrab extracts the Place ID, CID, and FID for every business it collects — alongside 33 other columns — and exports straight to CSV or JSON.'
    }
  },
  reviewLinkGenerator: {
    seo: {
      title: 'Google Review Link Generator — Free Direct Review URL | MapsGrab',
      description:
        'Turn a Google Maps place URL into a direct Google review link you can share with customers. Free, browser-based, and nothing is uploaded.'
    },
    hero: {
      title: { lead: 'Google Review Link ', accent: 'Generator', tail: '' },
      description:
        'Paste a Google Maps place URL and get the direct "write a review" link for that business — the shortest path from a happy customer to a Google review.'
    },
    form: {
      urlLabel: 'Google Maps place URL',
      urlPlaceholder: 'https://www.google.com/maps/place/…/data=…',
      submit: 'Generate review link',
      errorShortLink: 'Short links (maps.app.goo.gl) are not supported. Open the link in your browser and paste the full URL from the address bar.',
      errorInvalidUrl: 'This does not look like a Google Maps place URL. Open a place in Google Maps and copy the full URL (it should contain "/maps/place/" and "@" or "data=").',
      errorNoIds: 'No place identifiers were found in this URL. Make sure you copied the URL of a place page, not a search results page.'
    },
    result: {
      linkLabel: 'Review link',
      open: 'Open'
    },
    howTo: [
      {
        heading: 'What is a Google review link?',
        body: 'A review link is a shortcut that opens the review dialog of one specific business on Google. Instead of asking customers to search for your business, scroll to the reviews section, and press "Write a review", you send them one URL — search.google.com/local/reviews?placeid=… — that lands directly on the review form. Businesses put these links in follow-up emails, QR codes at the counter, and post-transaction SMS messages.'
      },
      {
        heading: 'How to generate a review link',
        body: 'Open Google Maps, find your business, and open its place page. Copy the long URL from the address bar and paste it above. Press "Generate review link" and the tool builds the direct link with the place ID encoded, ready to copy or open. The link is universal: it works on desktop browsers and on the Google Maps mobile app.'
      },
      {
        heading: 'Where the place ID comes from',
        body: 'The tool reuses the same local decoding as the Place ID Finder: the identifier is already present in the Maps URL, and the conversion to the "ChIJ…" form happens entirely in your browser. If you manage several locations, repeat the process per place — or let MapsGrab carry the Place ID column in every export so review links can be generated in bulk from a spreadsheet.'
      }
    ],
    faq: {
      title: { lead: 'Review link ', accent: 'questions', tail: '' },
      items: [
        {
          question: 'Do review links expire?',
          answer:
            'No. The link is bound to the place ID of the location, which Google keeps stable. As long as the place exists on Google Maps, the link keeps opening its review dialog.'
        },
        {
          question: 'Can I use one link for multiple locations?',
          answer:
            'Each review link belongs to exactly one place. Generate a separate link per location — multi-location businesses usually keep a table of place IDs and derive the links from it.'
        },
        {
          question: 'Is asking for reviews with a link allowed?',
          answer:
            'Asking customers for honest reviews is fine; incentivising or filtering reviews is not. Google\'s policy prohibits compensation for reviews and review gating — send the same link to every customer and let the feedback speak for itself.'
        },
        {
          question: 'Why does my link open a search page instead of the review form?',
          answer:
            'That happens when the place ID in the link is wrong — usually the result of a manually edited URL. Regenerate the link from the original Maps place URL and verify the Place ID starts with "ChIJ".'
        }
      ]
    },
    cta: {
      title: { lead: 'Track every review you ', accent: 'earn', tail: '' },
      lead: 'MapsGrab pulls the reviews of any business page — rating, text, date, and owner replies — so you can watch feedback land and answer it faster.'
    }
  },
  emailChecker: {
    seo: {
      title: 'Email Checker — Free Email Format Validator | MapsGrab',
      description:
        'Check an email address for syntax errors and common typos instantly. Free format validation that runs in your browser — no SMTP probing, nothing is sent anywhere.'
    },
    hero: {
      title: { lead: 'Email ', accent: 'Checker', tail: '' },
      description:
        'Type an email address and instantly see whether its format is valid — plus hints for the most common typos. Everything runs in your browser.'
    },
    form: {
      emailLabel: 'Email address',
      emailPlaceholder: 'name@example.com',
      submit: 'Verify email',
      validHeading: 'This email address looks valid.',
      invalidHeading: 'This email address has problems:',
      issues: {
        empty: 'Enter an email address first.',
        multipleAt: 'The address contains more than one "@" symbol.',
        missingAt: 'The address is missing the "@" that separates the local part from the domain.',
        localEmpty: 'The part before the "@" is empty.',
        localTooLong: 'The part before the "@" is longer than the 64 characters allowed by the email standards.',
        localInvalidChars: 'The part before the "@" contains characters that are not allowed in email addresses (spaces, quotes, or control characters).',
        localDotPosition: 'Dots in the local part cannot be first, last, or appear twice in a row.',
        domainEmpty: 'The part after the "@" is empty.',
        domainNoTld: 'The domain has no ending (TLD) — add something like ".com" or ".org".',
        domainInvalidChars: 'The domain contains characters that are not allowed (spaces, underscores, or symbols).',
        domainLabelHyphen: 'Domain labels cannot start or end with a hyphen.',
        domainEmptyLabel: 'The domain contains two dots in a row or an empty segment.',
        domainTooLong: 'The domain is longer than the 253 characters allowed by the email standards.',
        typoDomain: 'This domain looks like a typo of a popular mail provider.'
      }
    },
    howTo: [
      {
        heading: 'What this checker does — and what it deliberately does not',
        body: 'This tool validates the format of an email address: the shape of the local part, the "@", and the domain, following the practical rules of the RFC specifications that mail servers actually enforce. It also flags likely typos of popular mailbox providers, the single most common cause of dead addresses in lead lists. It does not send any probe to the mail server: SMTP verification would disclose the address to a third party, which conflicts with running the whole check locally in your browser.'
      },
      {
        heading: 'How to check an email address',
        body: 'Type or paste the address and press "Verify email". A green result means the format is deliverable-shaped; a red result lists every rule the address breaks, and — when the domain looks like a misspelled provider — suggests the intended one. Fix the reported problems and verify again until the address passes.'
      },
      {
        heading: 'Where format checking fits in a data workflow',
        body: 'Format validation is the first, cheapest filter for any email list: it removes addresses that can never reach a mailbox before you spend deliverability or enrichment budget on them. MapsGrab applies this thinking to the whole lead workflow — the extension enriches every collected business with the email addresses found on its official website, so the verification step downstream starts from a much cleaner list.'
      }
    ],
    faq: {
      title: { lead: 'Email checking ', accent: 'questions', tail: '' },
      items: [
        {
          question: 'Does this tool check whether the mailbox really exists?',
          answer:
            'No — deliberately. Checking existence requires querying the recipient\'s mail server (SMTP probing), which cannot be done privately in a browser and can get your IP flagged. This tool verifies everything that can be verified without touching the network: structure, allowed characters, and common provider typos.'
        },
        {
          question: 'Can an address pass here and still bounce?',
          answer:
            'Yes. A syntactically perfect address can still be closed, full, or abandoned. Format validation removes the addresses that are wrong before delivery is even attempted — it cannot guarantee that a valid-looking mailbox is read by a human.'
        },
        {
          question: 'Why is "name@localhost" rejected?',
          answer:
            'The checker requires a domain with a public ending (TLD) because addresses without one cannot receive mail from the outside internet. Standards that allow internal-only domains are irrelevant for lead lists and customer data.'
        },
        {
          question: 'Is my input stored anywhere?',
          answer:
            'No. The validation runs as plain JavaScript in your browser tab; nothing is transmitted, logged, or stored — reload the page and the input is gone.'
        }
      ]
    },
    cta: {
      title: { lead: 'Collect emails that are worth ', accent: 'verifying', tail: '' },
      lead: 'MapsGrab finds the email addresses and social profiles behind every business it extracts — straight from each business\'s own website.'
    }
  },
  latLongToDms: {
    seo: {
      title: 'Convert Lat Long to DMS — Decimal Degrees to Degrees Minutes Seconds | MapsGrab',
      description:
        'Convert decimal latitude and longitude to degrees, minutes, seconds (DMS) format instantly. Free browser-based coordinate converter, nothing uploaded.'
    },
    hero: {
      title: { lead: 'Convert Lat Long to ', accent: 'DMS', tail: '' },
      description:
        'Enter decimal latitude and longitude and read the same coordinates in degrees, minutes, seconds — with hemisphere letters, ready to copy.'
    },
    form: {
      latitudeLabel: 'Latitude (decimal, -90 to 90)',
      longitudeLabel: 'Longitude (decimal, -180 to 180)',
      placeholder: '37.774929',
      submit: 'Convert to DMS',
      errorLatitude: 'Latitude must be a number between -90 and 90.',
      errorLongitude: 'Longitude must be a number between -180 and 180.'
    },
    result: {
      dms: 'Coordinates in DMS'
    },
    howTo: [
      {
        heading: 'What are decimal degrees and DMS?',
        body: 'Maps and spreadsheets store coordinates as decimal degrees — one signed number per axis, like 37.774929, -122.419416. Surveying, marine charts, and many property documents use the older sexagesimal notation: degrees, minutes, and seconds with hemisphere letters, like 37° 46\' 29.74" N, 122° 25\' 9.90" W. Both describe the same point; the DMS form simply splits the fraction into successively smaller units, where one minute is 1/60 degree and one second is 1/60 minute.'
      },
      {
        heading: 'How to convert',
        body: 'Paste the decimal latitude and longitude and press "Convert to DMS". Negative values map to the south and west hemispheres and are reported as S and W. The seconds are shown with two decimals — about a metre of ground resolution, more precise than any consumer GPS capture. Copy the result as a single line for documents, or as separated fields for spreadsheets.'
      },
      {
        heading: 'Why this matters for maps data work',
        body: 'Coordinate round-trips are a daily friction point when moving business data between tools: Google Maps exports decimals, while cadastral and print workflows expect DMS. MapsGrab keeps this friction low at scale — every extracted business already carries its latitude and longitude in the export, and batch coordinate conversions can be run offline with the same formula this page uses.'
      }
    ],
    faq: {
      title: { lead: 'Coordinate conversion ', accent: 'questions', tail: '' },
      items: [
        {
          question: 'How precise is the DMS result?',
          answer:
            'The seconds are shown to two decimals. One second of latitude is roughly 30 metres, so two decimals resolve to about 30 centimetres — far tighter than the underlying GPS data. Precision is limited by your input, not the conversion.'
        },
        {
          question: 'What do N, S, E, and W mean here?',
          answer:
            'They replace the sign of the decimal value: positive latitudes are north (N) and negative are south (S); positive longitudes are east (E) and negative are west (W). The tool picks the letters from the sign automatically.'
        },
        {
          question: 'Can I convert DMS back to decimal here?',
          answer:
            'Yes — use the companion tool "Convert DMS to DD" on this site. Converting both ways with the same implementation avoids rounding drift between different formulas.'
        },
        {
          question: 'Is my coordinate data uploaded?',
          answer:
            'No. The conversion is plain arithmetic in your browser tab; nothing you type leaves the page.'
        }
      ]
    },
    cta: {
      title: { lead: 'Coordinates for every business, already ', accent: 'extracted', tail: '' },
      lead: 'MapsGrab writes latitude and longitude into each row it exports — no manual coordinate lookup for your next routing or territory project.'
    }
  },
  dmsToDd: {
    seo: {
      title: 'Convert DMS to DD — Degrees Minutes Seconds to Decimal Degrees | MapsGrab',
      description:
        'Convert degrees, minutes, seconds coordinates to decimal degrees instantly. Free browser-based DMS to DD converter, nothing uploaded.'
    },
    hero: {
      title: { lead: 'Convert DMS to DD ', accent: '(Lat, Long)', tail: '' },
      description:
        'Enter degrees, minutes, and seconds for both axes and get clean decimal degrees — the format Google Maps, spreadsheets, and MapsGrab understand.'
    },
    form: {
      latitudeHeading: 'Latitude (N/S)',
      longitudeHeading: 'Longitude (E/W)',
      degreesLabel: 'Degrees',
      minutesLabel: 'Minutes',
      secondsLabel: 'Seconds',
      latitudeHemisphereLabel: 'N / S',
      longitudeHemisphereLabel: 'E / W',
      submit: 'Convert to decimal',
      errorValues: 'Degrees must be zero or a positive whole number, minutes and seconds must be between 0 and 60.'
    },
    result: {
      dd: 'Coordinates in decimal degrees'
    },
    howTo: [
      {
        heading: 'Why convert DMS back to decimal degrees?',
        body: 'Degrees-minutes-seconds is a human-facing notation, but virtually every machine-facing system wants decimal degrees: Google Maps search, GIS imports, spreadsheet distance formulas, and geocoding pipelines. The conversion is a simple weighted sum — degrees plus minutes divided by 60 plus seconds divided by 3600 — with the hemisphere letter deciding the sign.'
      },
      {
        heading: 'How to convert',
        body: 'Fill in degrees, minutes, and seconds for latitude and longitude and pick the hemisphere letters (N/S and E/W). Press "Convert to decimal" and the tool outputs both axes as signed decimal numbers with six decimal places, which resolves to roughly 11 centimetres on the ground — more than enough for any business-location use. Paste the result directly into Google Maps or your spreadsheet.'
      },
      {
        heading: 'Keeping coordinate data consistent',
        body: 'Mixed notations are the usual reason locations end up in the wrong ocean after an import. Deciding on decimal degrees once and converting everything at the boundary keeps pipelines sane. MapsGrab exports coordinates in decimal degrees already, so data collected with the extension drops into GIS and BI tools without any conversion step.'
      }
    ],
    faq: {
      title: { lead: 'DMS to decimal ', accent: 'questions', tail: '' },
      items: [
        {
          question: 'How many decimal places do I need?',
          answer:
            'Six decimal places resolve to roughly 11 centimetres — beyond the accuracy of consumer GPS. Five places (about 1 metre) are enough for business locations; fewer decimals intentionally blur the point.'
        },
        {
          question: 'What ranges must the fields satisfy?',
          answer:
            'Minutes and seconds range from 0 to below 60. Latitude degrees reach up to 90 and longitude up to 180; the converter reports it when a value would land outside the globe.'
        },
        {
          question: 'Should I enter negative numbers when I pick S or W?',
          answer:
            'No — the hemisphere letter already encodes the sign. If you enter a signed value and a conflicting letter at the same time, the tool flags the contradiction instead of guessing.'
        },
        {
          question: 'Is the conversion done on a server?',
          answer:
            'No. The formula runs in your browser; nothing you type is transmitted anywhere.'
        }
      ]
    },
    cta: {
      title: { lead: 'Skip manual coordinate work ', accent: 'at scale', tail: '' },
      lead: 'MapsGrab exports decimal latitude and longitude for every business it collects, next to the address, phone, and Place ID columns.'
    }
  },
  bulkKeywords: {
    seo: {
      title: 'Bulk Keywords Generator — Keyword + Location Combinations | MapsGrab',
      description:
        'Generate keyword and location combinations in bulk for local SEO and maps scraping tasks. Paste two lists, get every combination, download as CSV. Free.'
    },
    hero: {
      title: { lead: 'Bulk Keywords ', accent: 'Generator', tail: '' },
      description:
        'Paste your keywords and your locations, and get every "keyword + location" combination as a ready-to-paste list or CSV — the fastest way to seed a local search campaign.'
    },
    form: {
      keywordsLabel: 'Keywords (one per line)',
      keywordsPlaceholder: 'design agency\ncoffee shop\nplumber',
      locationsLabel: 'Locations (one per line)',
      locationsPlaceholder: 'New York\nChicago\nAustin',
      orderLabel: 'Combination order',
      keywordFirst: 'keyword + location (design agency New York)',
      locationFirst: 'location + keyword (New York design agency)',
      submit: 'Generate combinations',
      resultCount: '{count} combinations generated.',
      errorKeywords: 'Add at least one keyword.',
      errorLocations: 'Add at least one location.'
    },
    howTo: [
      {
        heading: 'What is bulk keyword generation for?',
        body: 'Local search campaigns live on combinations: the same service repeated across every city, district, or neighbourhood you serve. Ten keywords across ten locations is a hundred search phrases — "design agency New York", "design agency Chicago", and so on. Writing those by hand is error-prone; generating them from two lists takes seconds and guarantees nothing is missed.'
      },
      {
        heading: 'How to generate combinations',
        body: 'Paste your keywords in the first box — one per line — and your locations in the second. Choose whether the keyword or the location comes first, then press "Generate". Every keyword is paired with every location, blank lines and duplicates removed, and the full list appears below with a count. Copy it straight into Google Ads keyword lists, Google Trends checks, or a maps scraping task queue.'
      },
      {
        heading: 'From keyword list to collected data',
        body: 'The classic next step is running each combination as a Google Maps search and collecting the results. That loop is exactly what MapsGrab automates: the extension accepts a keyword list as a batch task, walks through the searches one by one, and exports every business it finds — so the combinations you generate here become structured rows without manual copying.'
      }
    ],
    faq: {
      title: { lead: 'Bulk keyword ', accent: 'questions', tail: '' },
      items: [
        {
          question: 'How many combinations can I generate?',
          answer:
            'As many as your browser can hold — the tool multiplies the two lists and deduplicates them locally. Ten thousand combinations are fine; for very large batches the CSV download is more practical than copying the textarea.'
        },
        {
          question: 'Are duplicates removed?',
          answer:
            'Yes. Duplicate lines within each list are dropped before pairing, and the output contains each keyword-location pair exactly once, in the order you chose.'
        },
        {
          question: 'Which order should I use?',
          answer:
            'Both are real search behaviour. "Plumber Austin" reads like how people type into Maps; "Austin plumber" reads like traditional SEO phrasing. Generating both orders is a common way to cover search variants.'
        },
        {
          question: 'Can I use city districts or postcodes as locations?',
          answer:
            'Yes — anything that makes sense as a Maps search suffix works: districts, postcodes, metro areas, or full "city, state" pairs. One line per location.'
        }
      ]
    },
    cta: {
      title: { lead: 'Turn the keyword list into ', accent: 'results', tail: '' },
      lead: 'MapsGrab batch tasks run every keyword as a Maps search and export the businesses behind them — CSV or JSON, with reviews, photos, and contact enrichment.'
    }
  },
  mergeCsv: {
    seo: {
      title: 'Merge CSV Files Online — Combine Multiple CSV Files Free | MapsGrab',
      description:
        'Merge multiple CSV files online into one file. Column headers are aligned automatically by union — free, private, and entirely browser-based.'
    },
    hero: {
      title: { lead: 'Merge CSV Files ', accent: 'Online', tail: '' },
      description:
        'Upload two or more CSV files and download a single merged file. Columns are aligned by header — missing fields are left empty. Files never leave your browser.'
    },
    form: {
      filesLabel: 'CSV files',
      filesHint: 'Select two or more .csv files. Check each file with translated labels on row 2 to skip that row. The merged CSV keeps one field-name header row. Files stay in your browser.',
      translationRow: 'Skip row 2 (translated labels) in {name}',
      submit: 'Merge files',
      errorNoFiles: 'Select at least two CSV files to merge.',
      errorEmptyFile: 'One of the files is empty or has no header row: {name}',
      fileSummary: '{name} — {rows} data rows',
      resultSummary: 'Merged {files} files into {rows} rows × {columns} columns.',
      previewLabel: 'Merged CSV preview'
    },
    howTo: [
      {
        heading: 'What does merging do here?',
        body: 'Merging stacks several CSV exports into one table: the columns are aligned by header name across all files, and every data row keeps its values under the matching header. Files are combined top to bottom in the order you selected them, so the result reads as one continuous dataset. Columns that only exist in some files stay in the output; rows from files without them get empty cells — a union of all headers.'
      },
      {
        heading: 'How to merge CSV files',
        body: 'Select two or more .csv files — for example the weekly exports of a maps scraping workflow. Press "Merge files" and the tool parses every file in your browser, reports the row count of each, and builds the merged table. Download it as a single CSV that opens cleanly in Excel, Google Sheets, or any database import.'
      },
      {
        heading: 'Built for multi-run data collection',
        body: 'The typical use case is appending runs: each MapsGrab extraction session exports its own CSV, and merging brings the week\'s sessions into one dataset before deduplication and cleaning. The parser handles quoted fields, embedded commas, and newlines inside cells (RFC 4180), so exports with multi-line addresses or review snippets merge correctly.'
      }
    ],
    faq: {
      title: { lead: 'CSV merging ', accent: 'questions', tail: '' },
      items: [
        {
          question: 'What happens when files have different columns?',
          answer:
            'The merged file contains the union of all headers in the order they first appear. Rows from files that lack a column get an empty cell in that column. Nothing is dropped or renamed.'
        },
        {
          question: 'Are my files uploaded to a server?',
          answer:
            'No. The files are read with the browser\'s FileReader API and merged in memory in your tab. Nothing is transmitted, and closing the page erases everything.'
        },
        {
          question: 'Does merging remove duplicate rows?',
          answer:
            'No — merging is a straight concatenation with aligned columns. Deduplication (for example by Place ID) is a separate cleaning step you run on the merged file.'
        },
        {
          question: 'How large can the files be?',
          answer:
            'The limit is your browser tab\'s memory, not a fixed number. For typical business-data exports — thousands to a few hundred thousand rows — merging is instant. For very large files, merge in batches.'
        }
      ]
    },
    cta: {
      title: { lead: 'One export per run — or ', accent: 'one dataset', tail: '' },
      lead: 'MapsGrab exports clean CSV/JSON per session with field selection and Place ID deduplication, so multi-run datasets start almost merged already.'
    }
  }
}
