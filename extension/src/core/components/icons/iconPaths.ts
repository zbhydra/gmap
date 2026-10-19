import { IconName } from './iconTypes'

// 内联路径同时供 Vue 图标和 Shadow DOM 模板使用，避免跨源 sprite。
export const iconPaths: Record<IconName, string> = {
  [IconName.ARROW_RIGHT]: '<path d="M5 12h14"/><path d="m13 6 6 6-6 6"/>',
  [IconName.ARROW_LEFT]: '<path d="M19 12H5"/><path d="m11 18-6-6 6-6"/>',
  [IconName.ARROW_UP]: '<path d="M12 19V5"/><path d="m6 11 6-6 6 6"/>',
  [IconName.ARROW_DOWN]: '<path d="M12 5v14"/><path d="m6 13 6 6 6-6"/>',
  [IconName.ARROW_UP_RIGHT]: '<path d="M7 17 17 7"/><path d="M8 7h9v9"/>',
  [IconName.CHEVRON_DOWN]: '<path d="m6 9 6 6 6-6"/>',
  [IconName.CHEVRON_RIGHT]: '<path d="m9 6 6 6-6 6"/>',
  [IconName.CHECK]: '<path d="M20 6 9 17l-5-5"/>',
  [IconName.CHECK_CIRCLE]: '<circle cx="12" cy="12" r="9.5"/><path d="m8 12.2 2.8 2.8L16.2 9.5"/>',
  [IconName.X]: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
  [IconName.PLUS]: '<path d="M5 12h14"/><path d="M12 5v14"/>',
  [IconName.MINUS]: '<path d="M5 12h14"/>',
  [IconName.MENU]: '<path d="M4 7h16"/><path d="M4 12h16"/><path d="M4 17h16"/>',
  [IconName.MORE]:
    '<circle cx="5" cy="12" r="1.6" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.6" fill="currentColor" stroke="none"/><circle cx="19" cy="12" r="1.6" fill="currentColor" stroke="none"/>',
  [IconName.EXTERNAL]:
    '<path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>',
  [IconName.EXTERNAL_LINK]:
    '<path d="M14 4h6v6"/><path d="M10 14 20 4"/><path d="M19 14v4.5a1.5 1.5 0 0 1-1.5 1.5h-12A1.5 1.5 0 0 1 4 18.5v-12A1.5 1.5 0 0 1 5.5 5H10"/>',
  [IconName.LINK]:
    '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>',
  [IconName.COPY]:
    '<rect x="8" y="8" width="13" height="13" rx="2.5"/><path d="M4.5 16A1.5 1.5 0 0 1 3 14.5v-10A1.5 1.5 0 0 1 4.5 3h10A1.5 1.5 0 0 1 16 4.5"/>',
  [IconName.TRASH]:
    '<path d="M3.5 6h17"/><path d="M18.5 6v13.5a2 2 0 0 1-2 2h-9a2 2 0 0 1-2-2V6"/><path d="M8.5 6V4.5a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2V6"/><path d="M10 11v6"/><path d="M14 11v6"/>',
  [IconName.EYE]:
    '<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>',
  [IconName.INFO]: '<circle cx="12" cy="12" r="9.5"/><path d="M12 16v-4.5"/><path d="M12 8h.01"/>',
  [IconName.HELP]:
    '<circle cx="12" cy="12" r="9.5"/><path d="M9.2 9.2a2.9 2.9 0 0 1 5.65.9c0 1.95-2.85 2.75-2.85 2.75"/><path d="M12 17h.01"/>',
  [IconName.ALERT]:
    '<path d="M10.27 3.98 2.4 17.6A2 2 0 0 0 4.13 20.6h15.74a2 2 0 0 0 1.73-3L13.73 3.98a2 2 0 0 0-3.46 0Z"/><path d="M12 9.5v4"/><path d="M12 17h.01"/>',
  [IconName.ALERT_CIRCLE]:
    '<circle cx="12" cy="12" r="9.5"/><path d="M12 7.5V13"/><path d="M12 16.5h.01"/>',
  [IconName.CIRCLE_DASHED]:
    '<path d="M10.1 2.68a9.4 9.4 0 0 1 3.8 0"/><path d="M17.4 4.22a9.5 9.5 0 0 1 2.38 2.38"/><path d="M21.32 10.1a9.4 9.4 0 0 1 0 3.8"/><path d="M19.78 17.4a9.5 9.5 0 0 1-2.38 2.38"/><path d="M13.9 21.32a9.4 9.4 0 0 1-3.8 0"/><path d="M6.6 19.78a9.5 9.5 0 0 1-2.38-2.38"/><path d="M2.68 13.9a9.4 9.4 0 0 1 0-3.8"/><path d="M4.22 6.6A9.5 9.5 0 0 1 6.6 4.22"/>',
  [IconName.HOURGLASS]:
    '<path d="M5 22h14"/><path d="M5 2h14"/><path d="M17 22v-4.17a2 2 0 0 0-.59-1.42L12 12l-4.41 4.41A2 2 0 0 0 7 17.83V22"/><path d="M7 2v4.17a2 2 0 0 0 .59 1.42L12 12l4.41-4.41A2 2 0 0 0 17 6.17V2"/>',
  [IconName.HISTORY]:
    '<path d="M3 12a9 9 0 1 0 2.64-6.36L3 8.3"/><path d="M3 3.5v4.8h4.8"/><path d="M12 7.5V12l3.2 2"/>',
  [IconName.REFRESH]:
    '<path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/>',
  [IconName.RESET]: '<path d="M3.5 12a8.5 8.5 0 1 0 2.49-6.01L3.5 8.5"/><path d="M3.5 3.5v5h5"/>',
  [IconName.PLAY]:
    '<path fill="currentColor" stroke="none" d="M7 4.8v14.4a1 1 0 0 0 1.5.86l12-7.2a1 1 0 0 0 0-1.72l-12-7.2A1 1 0 0 0 7 4.8Z"/>',
  [IconName.PAUSE]:
    '<rect x="5.5" y="4.5" width="4.5" height="15" rx="1.4" fill="currentColor" stroke="none"/><rect x="14" y="4.5" width="4.5" height="15" rx="1.4" fill="currentColor" stroke="none"/>',
  [IconName.RESUME]:
    '<rect x="3.5" y="5" width="3.6" height="14" rx="1.2" fill="currentColor" stroke="none"/><path fill="currentColor" stroke="none" d="M10 5.6v12.8a1 1 0 0 0 1.52.85l9.6-6.4a1 1 0 0 0 0-1.7l-9.6-6.4A1 1 0 0 0 10 5.6Z"/>',
  [IconName.SKIP]: '<path d="M5 5.5v13l9.5-6.5z"/><path d="M19 5v14"/>',
  [IconName.SCAN]:
    '<path d="M3 7.5V5a2 2 0 0 1 2-2h2.5"/><path d="M16.5 3H19a2 2 0 0 1 2 2v2.5"/><path d="M21 16.5V19a2 2 0 0 1-2 2h-2.5"/><path d="M7.5 21H5a2 2 0 0 1-2-2v-2.5"/><circle cx="11.5" cy="11.5" r="3.2"/><path d="m16 16-2.2-2.2"/>',
  [IconName.DOCK_LEFT]:
    '<rect x="3" y="4" width="18" height="16" rx="2.5"/><rect x="5.5" y="6.5" width="5.5" height="11" rx="1.2" fill="currentColor" stroke="none"/>',
  [IconName.DOCK_RIGHT]:
    '<rect x="3" y="4" width="18" height="16" rx="2.5"/><rect x="13" y="6.5" width="5.5" height="11" rx="1.2" fill="currentColor" stroke="none"/>',
  [IconName.SEARCH]: '<circle cx="11" cy="11" r="7"/><path d="m20.5 20.5-4.6-4.6"/>',
  [IconName.PIN]:
    '<path d="M20 10c0 5-5.54 10.19-7.4 11.8a1 1 0 0 1-1.2 0C9.54 20.19 4 15 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/>',
  [IconName.STAR]:
    '<path fill="currentColor" stroke="none" d="M12 2.6l2.83 5.73 6.32.92-4.57 4.46 1.08 6.3L12 17.03l-5.66 2.98 1.08-6.3L2.85 9.25l6.32-.92z"/>',
  [IconName.REVIEW]:
    '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><path d="m12 6.6.9 1.83 2 .3-1.45 1.41.34 2-1.79-.95-1.79.95.34-2-1.45-1.41 2-.3z"/>',
  [IconName.IMAGE]:
    '<rect x="3" y="3" width="18" height="18" rx="2.5"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.09-3.09a2 2 0 0 0-2.82 0L6 21"/>',
  [IconName.LIST]:
    '<path d="M8 6h13"/><path d="M8 12h13"/><path d="M8 18h13"/><path d="M3 6h.01"/><path d="M3 12h.01"/><path d="M3 18h.01"/>',
  [IconName.LIST_PLUS]:
    '<path d="M11 12H3"/><path d="M16 6H3"/><path d="M16 18H3"/><path d="M18 9v6"/><path d="M21 12h-6"/>',
  [IconName.LIST_CHECKS]:
    '<path d="m3 17 2 2 4-4"/><path d="m3 7 2 2 4-4"/><path d="M13 6h8"/><path d="M13 12h8"/><path d="M13 18h8"/>',
  [IconName.STACK]:
    '<rect x="3" y="3.5" width="18" height="5" rx="1.6"/><rect x="3" y="10.5" width="18" height="5" rx="1.6"/><path d="M5 19.5h14"/>',
  [IconName.COLUMNS]:
    '<rect x="3" y="3.5" width="18" height="17" rx="2.5"/><path d="M9 3.5v17"/><path d="M15 3.5v17"/>',
  [IconName.DATABASE]:
    '<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14a9 3 0 0 0 18 0V5"/><path d="M3 12a9 3 0 0 0 18 0"/>',
  [IconName.DOWNLOAD]:
    '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5"/><path d="M12 15V3"/>',
  [IconName.EXPORT]:
    '<path d="M14.5 2.5H6.5a2 2 0 0 0-2 2v15a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V7.5z"/><path d="M14 2.5V7a1 1 0 0 0 1 1h4.5"/><path d="M12 11v6.5"/><path d="m9 14.5 3 3 3-3"/>',
  [IconName.FILE_CSV]:
    '<path d="M14.5 2.5H6.5a2 2 0 0 0-2 2v15a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V7.5z"/><path d="M14 2.5V7a1 1 0 0 0 1 1h4.5"/><path d="M8 12.5h3"/><path d="M13 12.5h3"/><path d="M8 16.5h3"/><path d="M13 16.5h3"/>',
  [IconName.FILE_JSON]:
    '<path d="M14.5 2.5H6.5a2 2 0 0 0-2 2v15a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V7.5z"/><path d="M14 2.5V7a1 1 0 0 0 1 1h4.5"/><path d="M10 11.5c-1 0-1.5.5-1.5 1.5v.4c0 .7-.4 1.1-1 1.1.6 0 1 .4 1 1.1v.4c0 1 .5 1.5 1.5 1.5"/><path d="M14 11.5c1 0 1.5.5 1.5 1.5v.4c0 .7.4 1.1 1 1.1-.6 0-1 .4-1 1.1v.4c0 1-.5 1.5-1.5 1.5"/>',
  [IconName.FILE_XLSX]:
    '<path d="M14.5 2.5H6.5a2 2 0 0 0-2 2v15a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V7.5z"/><path d="M14 2.5V7a1 1 0 0 0 1 1h4.5"/><rect x="8" y="11" width="8" height="7" rx="1"/><path d="M8 14.5h8"/><path d="M12 11v7"/>',
  [IconName.CLOUD_UPLOAD]:
    '<path d="M12 13v8"/><path d="M4 14.9A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.24"/><path d="m8 17 4-4 4 4"/>',
  [IconName.USER]: '<circle cx="12" cy="8" r="4.5"/><path d="M20 21a8 8 0 0 0-16 0"/>',
  [IconName.LOGIN]:
    '<path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><path d="m10 17 5-5-5-5"/><path d="M15 12H3"/>',
  [IconName.LOGOUT]:
    '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5"/><path d="M21 12H9"/>',
  [IconName.LOCK]:
    '<rect x="4" y="11" width="16" height="10" rx="2.5"/><path d="M8 11V7.5a4 4 0 0 1 8 0V11"/>',
  [IconName.CROWN]:
    '<path d="M11.56 3.27a.5.5 0 0 1 .88 0l2.95 5.6a1 1 0 0 0 1.52.29l4.27-3.66a.5.5 0 0 1 .8.52l-2.83 10.25a1 1 0 0 1-.96.73H5.81a1 1 0 0 1-.96-.73L2.02 6.02a.5.5 0 0 1 .8-.52l4.27 3.66a1 1 0 0 0 1.52-.29z"/><path d="M5 21h14"/>',
  [IconName.SPARKLE]:
    '<path d="M12 3c.55 4.6 2.4 6.45 7 7-4.6.55-6.45 2.4-7 7-.55-4.6-2.4-6.45-7-7 4.6-.55 6.45-2.4 7-7Z"/><path d="M19 15.5c.2 1.6.9 2.3 2.5 2.5-1.6.2-2.3.9-2.5 2.5-.2-1.6-.9-2.3-2.5-2.5 1.6-.2 2.3-.9 2.5-2.5Z"/>',
  [IconName.SPARKLES]:
    '<path d="M9.94 15.5A2 2 0 0 0 8.5 14.06l-6.14-1.58a.5.5 0 0 1 0-.96L8.5 9.94A2 2 0 0 0 9.94 8.5l1.58-6.14a.5.5 0 0 1 .96 0l1.58 6.14a2 2 0 0 0 1.44 1.44l6.14 1.58a.5.5 0 0 1 0 .96l-6.14 1.58a2 2 0 0 0-1.44 1.44l-1.58 6.14a.5.5 0 0 1-.96 0z"/>',
  [IconName.ZAP]:
    '<path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/>',
  [IconName.GEAR]:
    '<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>',
  [IconName.SHIELD]:
    '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/>',
  [IconName.MEGAPHONE]:
    '<path d="M3 11.2v1.6a1 1 0 0 0 .76.97L19.76 17.7A1 1 0 0 0 21 16.73V7.27a1 1 0 0 0-1.24-.97L3.76 10.23A1 1 0 0 0 3 11.2Z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/>',
  [IconName.SUN]:
    '<circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/>',
  [IconName.MOON]: '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>',
  [IconName.GLOBE]:
    '<circle cx="12" cy="12" r="9.5"/><path d="M12 2.5a14.5 14.5 0 0 0 0 19 14.5 14.5 0 0 0 0-19"/><path d="M2.5 12h19"/>',
  [IconName.MAIL]:
    '<rect x="2.5" y="4.5" width="19" height="15" rx="2.5"/><path d="m3 7 8.1 5.4a1.6 1.6 0 0 0 1.8 0L21 7"/>',
  [IconName.BUILDING]:
    '<path d="M3 21h18"/><path d="M5 21V8l7-5 7 5v13"/><path d="M9.5 21v-5h5v5"/><path d="M9 11h.01"/><path d="M15 11h.01"/>',
  [IconName.PUZZLE]:
    '<path d="M15.39 4.39a1 1 0 0 0 1.68-.47 2.5 2.5 0 1 1 3.01 3.01 1 1 0 0 0-.47 1.68l1.68 1.68a2.41 2.41 0 0 1 0 3.42l-1.68 1.68a1 1 0 0 1-1.68-.47 2.5 2.5 0 1 0-3.01 3.01 1 1 0 0 1 .47 1.68l-1.68 1.68a2.41 2.41 0 0 1-3.42 0l-1.68-1.68a1 1 0 0 0-1.68.47 2.5 2.5 0 1 1-3.01-3.01 1 1 0 0 0 .47-1.68l-1.68-1.68a2.41 2.41 0 0 1 0-3.42l1.68-1.68a1 1 0 0 1 1.68.47 2.5 2.5 0 1 0 3.01-3.01 1 1 0 0 1-.47-1.68l1.68-1.68a2.41 2.41 0 0 1 3.42 0z"/>',
  [IconName.FACEBOOK]:
    '<path d="M17.5 2.5h-3a5 5 0 0 0-5 5v3h-3v4h3v7h4v-7h3l1-4h-4v-3a1 1 0 0 1 1-1h3z"/>',
  [IconName.INSTAGRAM]:
    '<rect x="2.5" y="2.5" width="19" height="19" rx="5.5"/><circle cx="12" cy="12" r="4.2"/><path d="M17.5 6.5h.01"/>',
  [IconName.LINKEDIN]:
    '<path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/>',
  [IconName.X_SOCIAL]:
    '<path d="M4 4l11.73 16H20L8.27 4z"/><path d="M4 20l6.77-6.77"/><path d="M13.23 10.77 20 4"/>',
  [IconName.YOUTUBE]:
    '<path d="M2.5 17a24 24 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.6 49.6 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24 24 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.6 49.6 0 0 1-16.2 0A2 2 0 0 1 2.5 17"/><path d="m10 15 5-3-5-3z"/>',
  [IconName.TIKTOK]:
    '<path d="M21 7.92v4.03a9.95 9.95 0 0 1-5-1.95v4.5a6.5 6.5 0 1 1-8-6.33v4.33a2.5 2.5 0 1 0 4 2V3h4.08A6 6 0 0 0 21 7.92z"/>'
}
