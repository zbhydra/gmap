import type { SiteContent } from '../schema'
import { downloadDisabledChannelWorkaroundContent } from '../downloadDisabledChannelWorkaround'
import { thTHPricingContent } from '../pricing'

export const thTH: SiteContent = {
  site: {
    name: 'ดาวน์โหลดวิดีโอ Telegram | TG Downloader',
    description:
      'ใช้ TG Downloader สำหรับ ดาวน์โหลดวิดีโอ Telegram ใน Telegram Web บันทึกไฟล์และสื่อที่โหลดแล้ว และทำงานต่อกับช่องส่วนตัว Telegram ได้ทันที',
    keywords:
      'ดาวน์โหลดวิดีโอ Telegram, ดาวน์โหลดสื่อ Telegram, บันทึกวิดีโอ Telegram, ดาวน์โหลดไฟล์ Telegram, ช่องส่วนตัว Telegram'
  },
  layout: {
    nav: {
      brand: 'TG ดาวน์โหลด',
      home: 'หน้าแรก',
      pricing: 'ราคา',
      solutions: 'โซลูชัน',
      changelog: 'การเปลี่ยนแปลง'
    },
    footer: {
      resources: 'แหล่งข้อมูล',
      rights: '© 2026 TG Downloader. สงวนลิขสิทธิ์.'
    }
  },
  common: {
    installCta: 'ติดตั้งตอนนี้'
  },
  sections: {
    features: {
      title: 'คุณสมบัติ ดาวน์โหลดสื่อ Telegram',
      subtitle:
        'คุณสมบัติ ดาวน์โหลดสื่อ Telegram ชุดนี้ครอบคลุมไฟล์ รูปภาพ วิดีโอ งานแบบชุดขนาดใหญ่ และเนื้อหาที่โหลดแล้วใน Telegram Web',
      metaDescription:
        'TG Downloader features: multi-file batch saves, private channel support, 1GB+ large file downloads, real-time media detection, and privacy-first design with no login required.',
      items: [
        {
          title: 'ดาวน์โหลดเป็นชุด',
          description:
            'รองรับการดาวน์โหลดเป็นชุดด้วยการเลือกหลายรายการ ดาวน์โหลดไฟล์สื่อทั้งหมดจากช่องหรือกลุ่มด้วยคลิกเดียว',
          details: [
            'รองรับการดาวน์โหลดเป็นชุดด้วยการเลือกหลายรายการ',
            'ดาวน์โหลดช่อง/กลุ่มทั้งหมดด้วยคลิกเดียว',
            'การกรองแบบอัจฉริยะตามประเภทไฟล์',
            'การจัดการคิวดาวน์โหลด'
          ]
        },
        {
          title: 'เนื้อหาจำกัด',
          description: 'ดาวน์โหลดสื่อจากช่องจำกัดและกลุ่มส่วนตัวแม้ไม่มีสิทธิ์',
          details: [
            'เข้าถึงเนื้อหาช่องที่จำกัด',
            'ดาวน์โหลดจากกลุ่มส่วนตัว',
            'ไม่ต้องมีการตรวจสอบสิทธิ์',
            'ทำงานกับเวอร์ชัน A/K'
          ]
        },
        {
          title: 'รองรับหลายรูปแบบ',
          description: 'รองรับรูปภาพ วิดีโอ GIF เสียง และรูปแบบสื่ออื่นๆ',
          details: [
            'รูปภาพ: JPG, PNG, WEBP, GIF',
            'วิดีโอ: MP4, WEBM, MOV',
            'ไฟล์เสียง: MP3, M4A, OGG',
            'การตรวจจับรูปแบบอัตโนมัติ'
          ]
        },
        {
          title: 'ปลอดภัยและปลอดภัย',
          description: 'ไม่ต้องใช้รหัสผ่านหรือเข้าสู่ระบบ API ไม่มีการเก็บข้อมูลผู้ใช้',
          details: [
            'ไม่ต้องใช้รหัสผ่านหรือเข้าสู่ระบบ API',
            'ไม่มีการเก็บข้อมูลผู้ใช้',
            'ไม่มีไวรัสและโฆษณา',
            'การทดสอบความปลอดภัยอย่างเข้มงวด'
          ]
        },
        {
          title: 'รองรับไฟล์ขนาดใหญ่',
          description: 'ดาวน์โหลดไฟล์ขนาดใหญ่กว่า 1GB อย่างมั่นคงด้วยการสนับสนุนการทำงานต่อ',
          details: [
            'การดาวน์โหลดไฟล์มากกว่า 1GB อย่างมั่นคง',
            'การสนับสนุนการทำงานต่อสำหรับการดาวน์โหลดที่ขัดจังหวะ',
            'การถ่ายโอนที่รวดเร็วและมั่นคง',
            'การติดตามความคืบหน้า'
          ]
        },
        {
          title: 'การตรวจจับแบบเรียลไทม์',
          description: 'สแกนและตรวจจับทรัพยากรสื่อโดยอัตโนมัติ อัปเดตรายการดาวน์โหลดแบบเรียลไทม์',
          details: [
            'การสแกนทรัพยากรสื่อของหน้าอัตโนมัติ',
            'การตรวจจับทรัพยากรในเวลาจริง',
            'การอัปเดตรายการอัตโนมัติ',
            'การแคชทรัพยากรอัจฉริยะ'
          ]
        }
      ]
    },
    steps: {
      title: 'คู่มือ บันทึกวิดีโอ Telegram',
      subtitle:
        'ทำตามคู่มือ บันทึกวิดีโอ Telegram นี้ เปิดข้อความใน Telegram Web แล้วเก็บวิดีโอหรือสื่ออื่นได้ในไม่กี่ขั้นตอน',
      metaDescription:
        'Step-by-step guide to saving Telegram videos, files, and albums with TG Downloader. Learn to install the extension, detect media in Telegram Web, and batch-download content.',
      items: [
        {
          title: 'ติดตั้งส่วนเสริม',
          description:
            'ค้นหาและติดตั้ง TG Downloader จากร้านค้าส่วนเสริมเบราว์เซอร์ของคุณ'
        },
        {
          title: 'ปักหมุดส่วนเสริม',
          description:
            'คลิกที่แถบเครื่องมือของเบราว์เซอร์เพื่อปักหมุดไอคอนส่วนเสริมสำหรับการเข้าถึงด่วน'
        },
        {
          title: 'เปิด Telegram Web',
          description: 'ไปที่ web.telegram.org ส่วนเสริมจะเริ่มสแกนทรัพยากรสื่อโดยอัตโนมัติ'
        },
        {
          title: 'ดาวน์โหลดเป็นชุด',
          description: 'เลือกไฟล์ที่จะดาวน์โหลดและคลิกปุ่มดาวน์โหลดเพื่อบันทึกไว้ในเครื่อง'
        }
      ]
    },
    cta: {
      title: 'พร้อมที่จะเริ่มต้น?',
      description: 'ติดตั้งส่วนเสริมและเริ่มดาวน์โหลดสื่อจาก Telegram ตอนนี้'
    },
    techSpecs: {
      title: 'ข้อกำหนดทางเทคนิค',
      browsersLabel: 'เบราว์เซอร์',
      browsers: 'Chrome, Edge, Brave และเบราว์เซอร์ที่ใช้ Chromium ทั้งหมด',
      telegramVersionsLabel: 'เวอร์ชัน Telegram',
      telegramVersions: 'เวอร์ชัน Web K และเวอร์ชัน A',
      permissionsLabel: 'สิทธิ์',
      permissions: 'ต้องการสิทธิ์ขั้นต่ำ',
      updatesLabel: 'การอัปเดต',
      updates: 'อัปเดตอัตโนมัติจากร้านค้าส่วนเสริม'
    }
  },
  pages: {
    homepage: {
      hero: {
        title: 'ดาวน์โหลดสื่อจากช่องส่วนตัวและช่องจำกัดของ Telegram',
        description:
          'คลิกเดียว ไม่ต้องล็อกอิน รองรับไฟล์ 1GB+ ดาวน์โหลดชุดจากช่องส่วนตัวและเนื้อหาจำกัด'
      },
      stats: {
        users: 'ผู้ใช้ทั่วโลก',
        downloads: 'การดาวน์โหลดทั้งหมด'
      },
      seo: {
        title: 'ตัวดาวน์โหลดวิดีโอส่วนตัว Telegram: ดาวน์โหลดสื่อส่วนตัวทุกชิ้น',
        description:
          'บันทึกวิดีโอจากช่องส่วนตัว Telegram ด้วยคู่มือตัวดาวน์โหลดที่ใช้ง่าย ดาวน์โหลดวิดีโอและสื่อที่เข้าถึงได้ แก้ปัญหาการดาวน์โหลดล้มเหลว และเลือกวิธีที่เหมาะกับอุปกรณ์ของคุณ',
        keywords:
          'ตัวดาวน์โหลดวิดีโอส่วนตัว telegram, ดาวน์โหลดวิดีโอช่องส่วนตัว telegram, โหลดวิดีโอส่วนตัว telegram, ตัวดาวน์โหลดสื่อส่วนตัว telegram, telegram private video downloader'
      },
      heroTrustPoints: [
        'ดาวน์โหลดวิดีโอ HD',
        'ไม่ต้องลงทะเบียน',
        'รองรับมือถือ',
        'ใช้ได้บน Windows, Mac, Android และ iPhone'
      ],
      situation: {
        title: 'เริ่มที่นี่: สถานการณ์ไหนตรงกับคุณ?',
        intro:
          'ผู้ใช้ส่วนใหญ่ที่ค้นหาตัวดาวน์โหลดวิดีโอส่วนตัว Telegram กำลังพยายามแก้ปัญหาข้อใดข้อหนึ่งเหล่านี้:',
        headers: ['สถานการณ์ของคุณ', 'ลองวิธีนี้ก่อน'],
        rows: [
          {
            cells: [
              'คุณมีลิงก์วิดีโอ Telegram จากช่องหรือแชท',
              'วางลิงก์ลงในตัวดาวน์โหลดวิดีโอ Telegram ออนไลน์'
            ]
          },
          {
            cells: [
              'คุณดูวิดีโอในช่องส่วนตัวได้แต่บันทึกไม่ได้',
              'ลองใช้ตัวเลือก Save Video As ของ Telegram Desktop'
            ]
          },
          {
            cells: [
              'วิดีโอเล่นได้ แต่การดาวน์โหลดและส่งต่อถูกบล็อก',
              'ใช้การบันทึกหน้าจอเฉพาะเมื่อคุณได้รับอนุญาตให้เก็บสำเนาเท่านั้น'
            ]
          },
          {
            cells: [
              'ตัวดาวน์โหลดแจ้งว่าไม่พบวิดีโอ',
              'ตรวจสอบสิทธิ์เข้าถึง ประเภทลิงก์ ข้อจำกัดของช่อง และว่าวิดีโอเปิดนอก Telegram ได้หรือไม่'
            ]
          }
        ]
      },
      solutions: {
        title: 'อะไรใช้ได้ผลกับวิดีโอส่วนตัวบน Telegram?',
        intro:
          'วิดีโอส่วนตัวบน Telegram มักหมายถึงวิดีโอที่แชร์ในช่องส่วนตัว กลุ่มส่วนตัว หรือแชทส่วนตัว วิดีโอเหล่านี้มองเห็นได้เฉพาะสมาชิกที่ได้รับอนุมัติ การดาวน์โหลดจึงต่างจากการบันทึกสื่อจากช่องสาธารณะ',
        quickAnswer:
          'คำตอบสั้นๆ: หากลิงก์เข้าถึงได้ ให้ใช้ตัวดาวน์โหลดวิดีโอส่วนตัว Telegram ออนไลน์ หากวิดีโอมองเห็นได้เฉพาะภายใน Telegram ให้ลอง Telegram Desktop หากการบันทึกถูกบล็อกแต่คุณได้รับอนุญาตให้เก็บเนื้อหา การบันทึกหน้าจออาจเป็นทางเลือกสำรองที่ใช้ได้จริง',
        items: [
          {
            title: 'วิธีที่ 1: ตัวดาวน์โหลดวิดีโอ Telegram ออนไลน์',
            description:
              'เหมาะที่สุดสำหรับลิงก์ Telegram ที่เข้าถึงได้ นี่เป็นวิธีที่ง่ายที่สุดสำหรับผู้ที่ต้องการดาวน์โหลดวิดีโอ Telegram ออนไลน์โดยไม่ต้องติดตั้งแอป ส่วนเสริม หรือบอท',
            useWhenLabel: 'ใช้วิธีนี้เมื่อ:',
            useWhen: [
              'ลิงก์วิดีโอ Telegram เป็นสาธารณะหรือเข้าถึงได้',
              'คุณต้องการดาวน์โหลดวิดีโอ Telegram ออนไลน์',
              'คุณต้องการไฟล์วิดีโอ HD อย่างรวดเร็ว',
              'คุณไม่ต้องการติดตั้งส่วนเสริมเบราว์เซอร์หรือแอปเดสก์ท็อป'
            ]
          },
          {
            title: 'วิธีที่ 2: Save Video As ของ Telegram Desktop',
            description:
              'เมื่อวิดีโอมีอยู่ใน Telegram Desktop และอนุญาตให้ดาวน์โหลด ให้คลิกขวาที่วิดีโอแล้วบันทึกลงโฟลเดอร์ในคอมพิวเตอร์ของคุณ วิธีนี้มักได้ผลดีกว่าสำหรับสมาชิกช่องส่วนตัว เพราะคุณยืนยันตัวตนอยู่แล้วภายใน Telegram',
            useWhenLabel: 'ใช้วิธีนี้เมื่อ:',
            useWhen: [
              'คุณดูวิดีโอใน Telegram Desktop ได้',
              'เจ้าของช่องไม่ได้ปิดการบันทึก',
              'คุณต้องการดาวน์โหลดลง Windows หรือ Mac โดยตรง'
            ]
          },
          {
            title: 'วิธีที่ 3: การบันทึกหน้าจอบนมือถือหรือเดสก์ท็อป',
            description:
              'หากตัวเลือกดาวน์โหลดถูกปิดแต่คุณได้รับอนุญาตให้ดูและเก็บเนื้อหา โปรแกรมบันทึกหน้าจอสามารถจับภาพวิดีโอและเสียงขณะเล่นได้ นี่เป็นทางเลือกสำรอง ไม่ใช่วิธีแรก เพราะใช้เวลานานกว่าและขึ้นอยู่กับคุณภาพการเล่น',
            useWhenLabel: 'ใช้วิธีนี้เมื่อ:',
            useWhen: [
              'คุณได้รับอนุญาตให้ดูและเก็บวิดีโอ',
              'ลิงก์ Telegram ไม่สามารถแยกได้ด้วยตัวดาวน์โหลด',
              'คุณต้องการสำเนาออฟไลน์ส่วนตัวไว้อ้างอิง'
            ]
          },
          {
            title: 'วิธีที่ 4: ตรวจสอบตัวจัดการไฟล์บน Android',
            description:
              'ในบางกรณีบน Android Telegram อาจเก็บสื่อที่โหลดแล้วไว้ชั่วคราวในโฟลเดอร์แอปในเครื่อง ตัวจัดการไฟล์อาจช่วยให้คุณหาวิดีโอที่โหลดไว้บนอุปกรณ์แล้วได้บ้าง แต่ขึ้นอยู่กับเวอร์ชันแอป สิทธิ์ที่จัดเก็บ และพฤติกรรมแคช',
            useWhenLabel: 'ใช้วิธีนี้เมื่อ:',
            useWhen: [
              'คุณเล่นวิดีโอใน Telegram บน Android ไปแล้ว',
              'คุณเข้าใจสิทธิ์ที่จัดเก็บของแอป',
              'คุณเพียงต้องการกู้ไฟล์ที่แคชไว้บนอุปกรณ์ของคุณแล้ว'
            ]
          }
        ]
      },
      benefits: {
        title: 'ทำไมต้องใช้ตัวดาวน์โหลดวิดีโอ Telegram ออนไลน์?',
        intro:
          'ตัวดาวน์โหลดที่ดีควรช่วยให้คุณตอบคำถามหนึ่งได้อย่างรวดเร็ว: วิดีโอ Telegram นี้บันทึกจากลิงก์ที่ฉันมีได้หรือไม่? ประสบการณ์ที่ดีที่สุดคือตรงไปตรงมา ชัดเจน และซื่อสัตย์เมื่อไม่สามารถประมวลผลลิงก์ส่วนตัวได้',
        items: [
          {
            title: 'บันทึกวิดีโอคุณภาพสูง',
            description:
              'เก็บวิดีโอ Telegram ในคุณภาพดีที่สุดที่มีไว้ดูออฟไลน์ ศึกษา ฝึกอบรม จัดเก็บ หรืออ้างอิงส่วนตัว'
          },
          {
            title: 'ใช้ได้หลายอุปกรณ์',
            description:
              'ใช้ตัวดาวน์โหลดจากเบราว์เซอร์บน Android, iPhone, Windows, Mac หรือแท็บเล็ต สำคัญเมื่อวิดีโออยู่บนมือถือแต่คุณต้องการบันทึกไปยังอุปกรณ์อื่น'
          },
          {
            title: 'ไม่ต้องเข้าสู่ระบบ Telegram',
            description:
              'เลือกเครื่องมือที่ประมวลผลลิงก์วิดีโอโดยไม่ขอรหัสผ่าน Telegram รหัสยืนยัน ไฟล์เซสชัน หรือข้อมูลรับรองบัญชีส่วนตัวของคุณ'
          },
          {
            title: 'เล่นออฟไลน์ได้ง่าย',
            description:
              'ดาวน์โหลดไฟล์ในรูปแบบวิดีโอทั่วไปเมื่อมี เพื่อให้คุณดูภายหลังได้โดยไม่ต้องเปิด Telegram หรือใช้ข้อมูลมือถือ'
          },
          {
            title: 'ขั้นตอนรวดเร็วด้วยลิงก์',
            description:
              'คัดลอก วาง วิเคราะห์ และดาวน์โหลด หากลิงก์ใช้ไม่ได้ หน้านี้ควรอธิบายว่าทำไมและบอกว่าควรลองอะไรต่อไป'
          },
          {
            title: 'ขอบเขตสิทธิ์ที่ชัดเจน',
            description:
              'ดาวน์โหลดเฉพาะวิดีโอที่คุณมีสิทธิ์เข้าถึงและบันทึกเท่านั้น เคารพกฎของช่อง สิทธิ์ของผู้สร้าง และนโยบายของ Telegram'
          }
        ]
      },
      troubleshooting: {
        title: 'หากลิงก์วิดีโอ Telegram ใช้งานไม่ได้',
        intro:
          'ไม่ใช่ทุกลิงก์ที่ล้มเหลวหมายความว่าตัวดาวน์โหลดเสีย วิดีโอส่วนตัวบน Telegram มักล้มเหลวเพราะไฟล์ไม่พร้อมใช้งานนอก Telegram ลองทำตามรายการตรวจสอบนี้:',
        items: [
          'เปิดลิงก์ในเบราว์เซอร์และยืนยันว่าโหลดได้',
          'ตรวจสอบว่าคุณยังเป็นสมาชิกของช่องส่วนตัวหรือกลุ่มอยู่',
          'ตรวจสอบว่าเจ้าของช่องปิดการบันทึก คัดลอก หรือส่งต่อหรือไม่',
          'ลอง Telegram Desktop หากวิดีโอเล่นได้เฉพาะภายในแอป',
          'ใช้เบราว์เซอร์หรือเครือข่ายอื่นหากหน้าเข้าถึง Telegram ไม่ได้',
          'หลีกเลี่ยงเครื่องมือใดก็ตามที่ขอรหัสเข้าสู่ระบบ Telegram ของคุณ'
        ]
      },
      permission: {
        title: 'ข้อควรทราบสำคัญเรื่องสิทธิ์',
        note:
          'ไม่ควรใช้ตัวดาวน์โหลดวิดีโอส่วนตัว Telegram เพื่อหลบเลี่ยงความเป็นส่วนตัว ลิขสิทธิ์ หรือข้อจำกัดการเข้าถึง บันทึกวิดีโอเฉพาะเมื่อคุณได้รับอนุญาตจากเจ้าของ หรือเมื่อการใช้งานของคุณได้รับอนุญาตตามกฎหมายและข้อกำหนดของ Telegram'
      },
      comparison: {
        title: 'เลือกวิธีดาวน์โหลด Telegram ที่เหมาะสม',
        headers: ['สถานการณ์', 'โซลูชันที่แนะนำ', 'เหมาะสำหรับ', 'สิ่งที่ต้องตรวจสอบ'],
        rows: [
          {
            cells: [
              'ลิงก์วิดีโอ Telegram สาธารณะหรือเข้าถึงได้',
              'ตัวดาวน์โหลดวิดีโอ Telegram ออนไลน์',
              'ดาวน์โหลด HD อย่างรวดเร็วโดยไม่ต้องใช้แอป',
              'ลิงก์เปิดได้และเครื่องมือเข้าถึงวิดีโอได้'
            ]
          },
          {
            cells: [
              'วิดีโอช่องส่วนตัวที่อนุญาตให้ดาวน์โหลด',
              'Save Video As ของ Telegram Desktop',
              'บันทึกลงคอมพิวเตอร์โดยตรง',
              'คุณเป็นสมาชิกและเจ้าของไม่ได้ปิดการบันทึก'
            ]
          },
          {
            cells: [
              'การบันทึกถูกจำกัดแต่เล่นวิดีโอดูได้',
              'โปรแกรมบันทึกหน้าจอในตัวหรือจากภายนอก',
              'อ้างอิงออฟไลน์ส่วนตัวโดยได้รับอนุญาต',
              'การจับเสียง พื้นที่หน้าจอ และกฎหมายท้องถิ่นหรือกฎของแพลตฟอร์ม'
            ]
          },
          {
            cells: [
              'สื่อที่แคชไว้บน Android',
              'ตรวจสอบด้วยตัวจัดการไฟล์',
              'หาสื่อที่โหลดไว้บนอุปกรณ์แล้ว',
              'สิทธิ์เข้าถึงที่จัดเก็บของแอป และว่า Telegram เก็บแคชในเครื่องหรือไม่'
            ]
          }
        ]
      },
      howTo: {
        title: 'วิธีดาวน์โหลดวิดีโอ Telegram ใน 3 ขั้นตอน',
        subtitle:
          'วิธีที่เร็วที่สุดคือใช้เครื่องมือดาวน์โหลดวิดีโอ Telegram แบบอิงลิงก์ ซึ่งทำงานได้ดีที่สุดเมื่อลิงก์วิดีโอ Telegram เป็นสาธารณะ เข้าถึงได้ หรืออ่านได้จากภายนอกแอป Telegram',
        steps: [
          {
            title: 'คัดลอกลิงก์วิดีโอ',
            description:
              'เปิด Telegram ค้นหาวิดีโอที่ต้องการบันทึก แล้วคัดลอกลิงก์ข้อความหรือลิงก์วิดีโอจากเมนูแชร์ หากช่องไม่อนุญาตให้คัดลอกลิงก์ ให้ไปที่โซลูชันสำหรับช่องส่วนตัวด้านล่าง'
          },
          {
            title: 'วางลิงก์แล้ววิเคราะห์',
            description:
              'วางลิงก์ Telegram ลงในช่องของเครื่องมือดาวน์โหลด เครื่องมือจะตรวจสอบว่าสามารถเข้าถึงไฟล์วิดีโอที่ดาวน์โหลดได้จากลิงก์นั้นหรือไม่'
          },
          {
            title: 'ดาวน์โหลดแบบ HD',
            description:
              'เลือกคุณภาพหรือรูปแบบที่มี แล้วบันทึกวิดีโอ Telegram ลงในโทรศัพท์ แท็บเล็ต หรือคอมพิวเตอร์ของคุณโดยตรง หากไม่มีไฟล์ปรากฏขึ้น แสดงว่าลิงก์น่าจะถูกจำกัดมากกว่าจะเสีย'
          }
        ]
      },
      faq: {
        title: 'คำถามที่พบบ่อย',
        description: 'คำถามที่ผู้คนมักถามก่อนดาวน์โหลดวิดีโอ Telegram หรือดาวน์โหลดไฟล์ Telegram ใน Telegram Web',
        items: [
          {
            question: 'ฉันดาวน์โหลดวิดีโอ Telegram ส่วนตัวได้ไหม?',
            answer:
              'คุณดาวน์โหลดหรือบันทึกวิดีโอ Telegram ส่วนตัวได้เฉพาะเมื่อคุณมีสิทธิ์เข้าถึงและแหล่งวิดีโอนั้นพร้อมใช้งาน บางช่องส่วนตัวจะบล็อกการบันทึก การส่งต่อ การคัดลอกลิงก์ หรือการเข้าถึงจากภายนอก'
          },
          {
            question: 'ฉันจะดาวน์โหลดวิดีโอจากช่องส่วนตัวของ Telegram ได้อย่างไร?',
            answer:
              'ลองใช้เครื่องมือดาวน์โหลดแบบอิงลิงก์ก่อนหากคุณมีลิงก์วิดีโอ Telegram ที่ใช้งานได้ หากไม่ได้ผล ให้ตรวจสอบตัวเลือก Save Video As ใน Telegram Desktop หากการดาวน์โหลดถูกบล็อกแต่คุณได้รับอนุญาตให้เก็บเนื้อหาไว้ การบันทึกหน้าจออาจเป็นทางเลือกสำรอง'
          },
          {
            question: 'ทำไมเครื่องมือดาวน์โหลดวิดีโอ Telegram จึงแจ้งว่าไม่พบวิดีโอ?',
            answer:
              'ลิงก์อาจถูกจำกัด ถูกลบ หมดอายุ มองเห็นได้เฉพาะภายใน Telegram หรือถูกบล็อกโดยเจ้าของช่อง ลองเปิดลิงก์ด้วยตัวเองก่อนและยืนยันว่าวิดีโอยังเล่นได้ หากใช้งานได้หลังจากล็อกอินเข้า Telegram เท่านั้น เครื่องมือดาวน์โหลดออนไลน์อาจไม่สามารถเข้าถึงได้'
          },
          {
            question: 'ฉันจำเป็นต้องติดตั้งซอฟต์แวร์ไหม?',
            answer:
              'ไม่จำเป็นสำหรับลิงก์ที่เข้าถึงได้ เครื่องมือดาวน์โหลดวิดีโอ Telegram ออนไลน์ทำงานในเบราว์เซอร์ คุณอาจต้องใช้ Telegram Desktop ตัวจัดการไฟล์ หรือโปรแกรมบันทึกหน้าจอสำหรับกรณีส่วนตัวหรือถูกจำกัดบางกรณี'
          },
          {
            question: 'ฉันดาวน์โหลดวิดีโอ Telegram โดยไม่มีลิงก์ได้ไหม?',
            answer:
              'โดยทั่วไปไม่ได้ เครื่องมือดาวน์โหลดออนไลน์ต้องใช้ลิงก์วิดีโอ Telegram เพื่อค้นหาไฟล์ หากคุณคัดลอกลิงก์ไม่ได้แต่ดูวิดีโอใน Telegram ได้ ให้ใช้ Telegram Desktop หรือวิธีอื่นในเครื่องที่ได้รับอนุญาต'
          },
          {
            question: 'การกรอกรหัสล็อกอิน Telegram ลงในเครื่องมือดาวน์โหลดปลอดภัยไหม?',
            answer:
              'ไม่ปลอดภัย เครื่องมือดาวน์โหลดไม่ควรต้องใช้รหัสผ่าน รหัสยืนยัน หรือข้อมูลเซสชัน Telegram ของคุณ หากเว็บไซต์ขอข้อมูลเหล่านี้ ให้ออกจากหน้านั้นทันที'
          },
          {
            question: 'เครื่องมือดาวน์โหลดสื่อ Telegram ฟรีไหม?',
            answer:
              'เครื่องมือดาวน์โหลดสื่อ Telegram แบบอิงลิงก์จำนวนมากให้ดาวน์โหลดพื้นฐานได้ฟรี หลีกเลี่ยงเครื่องมือที่บังคับให้ติดตั้งสิ่งที่น่าสงสัย ขอให้ล็อกอิน หรือมีปุ่มที่ทำให้เข้าใจผิด'
          },
          {
            question: 'การดาวน์โหลดวิดีโอ Telegram ถูกกฎหมายไหม?',
            answer:
              'ขึ้นอยู่กับเนื้อหา สิทธิ์ของคุณ และวัตถุประสงค์ในการใช้งาน อย่าดาวน์โหลดหรือเผยแพร่ซ้ำเนื้อหาที่มีลิขสิทธิ์ เป็นส่วนตัว หรือถูกจำกัดโดยไม่ได้รับอนุญาต'
          }
        ]
      },
      workspace: {
        auth: {
          eyebrow: 'การเข้าใช้เว็บ',
          title: 'เข้าสู่ระบบเพื่อซิงก์เครดิตของคุณ',
          signedInAs: 'เข้าสู่ระบบเป็น',
          continueWithGoogle: 'ดำเนินการต่อด้วย Google',
          googleLoading: 'กำลังเปิด Google...',
          or: 'หรือ',
          emailLabel: 'อีเมล',
          emailPlaceholder: 'name@example.com',
          continueWithEmail: 'ดำเนินการต่อด้วยอีเมล',
          sendCode: 'ส่งรหัส',
          sendingCode: 'กำลังส่ง...',
          sendCodeSuccess: 'ส่งรหัสยืนยันแล้ว',
          sendAgain: 'ส่งอีกครั้ง',
          codeLabel: 'รหัสยืนยัน',
          codePlaceholder: '123456',
          signIn: 'เข้าสู่ระบบ',
          termsNotice: 'เมื่อเข้าสู่ระบบ ถือว่าคุณยอมรับ',
          termsLink: 'ข้อกำหนด',
          privacyLink: 'นโยบายความเป็นส่วนตัว',
          logout: 'ออกจากระบบ',
          creditsLabel: 'เครดิต'
        },
        quota: {
          eyebrow: 'โควตาเว็บ',
          title: 'ยอดเครดิตปัจจุบัน',
          planLabel: 'แพ็กเกจ',
          remainingLabel: 'คงเหลือ',
          dailyLimitLabel: 'ขีดจำกัดรายวัน',
          unlimited: 'ไม่จำกัด'
        },
        checkin: {
          creditsLoading: 'เครดิต',
          creditsButtonLabel: 'เปิดการเช็กอินรายวัน',
          accountButtonLabel: 'เปิดเมนูบัญชี',
          accountMenuLabel: 'เมนูบัญชี',
          title: 'เครดิตฟรีของวันนี้พร้อมแล้ว',
          todayRewardText: 'รางวัลวันนี้: {credits} เครดิต',
          claimedRewardText: 'วันนี้คุณรับ {credits} เครดิตแล้ว',
          nextCountdown: 'รับครั้งถัดไปใน {time}',
          nextAt: '(รีเฟรชครั้งถัดไป: {time} EST)',
          claimButton: 'รับ {credits} เครดิต',
          claimingButton: 'กำลังรับ...',
          notNow: 'ไว้ทีหลัง',
          close: 'ปิด',
          loadFailed: 'โหลดสถานะเช็กอินไม่สำเร็จ',
          claimFailed: 'รับเครดิตไม่สำเร็จ'
        },
        creditPurchase: {
          title: 'ซื้อเครดิต',
          description: 'เพิ่มเครดิตแล้วดาวน์โหลดต่อในพื้นที่ทำงานนี้',
          successTitle: 'เพิ่มเครดิตแล้ว',
          successDescription: 'อัปเดตยอดคงเหลือแล้ว ปิดหน้าต่างนี้แล้วเริ่มดาวน์โหลดอีกครั้ง',
          packageEyebrow: 'จ่ายตามการใช้งาน',
          cardNote: 'ใช้เครดิตสำหรับการดาวน์โหลดบนเว็บ เครดิตไม่มีวันหมดอายุ',
          creditsAmount: '{credits} เครดิต',
          buyNow: 'ซื้อเลย',
          selectPackage: 'เลือก',
          paymentMethodLabel: 'เลือกวิธีชำระเงิน',
          paymentTitle: 'เลือกวิธีชำระเงิน',
          selectedPackageLabel: 'สินค้าที่เลือก',
          confirmPurchase: 'ไปชำระเงินต่อ',
          backToProducts: 'กลับ',
          close: 'ปิด',
          agreementText: 'ฉันยอมรับเงื่อนไขการซื้อ ข้อกำหนด และนโยบายความเป็นส่วนตัว',
          loadingConfigs: 'กำลังโหลดแพ็กเกจเครดิต...',
          loadFailed: 'โหลดแพ็กเกจเครดิตไม่สำเร็จ โปรดลองอีกครั้ง',
          noConfigs: 'ยังไม่มีแพ็กเกจเครดิตให้ซื้อในขณะนี้ โปรดลองใหม่ภายหลัง',
          ready: 'เลือกแพ็กเกจเครดิต ราคาแสดงเป็น USD',
          creatingOrder: 'กำลังสร้างคำสั่งซื้อ...',
          pendingPayment: 'ชำระเงินในแท็บที่เปิดใหม่ ระบบจะตรวจสอบผลให้อัตโนมัติ',
          pendingPaymentTitle: 'รอการชำระเงิน',
          cancelPayment: 'ยกเลิกการชำระเงิน',
          supportMailPrefix: 'รายงานปัญหา: ',
          success: 'ชำระเงินเสร็จแล้ว เครดิตพร้อมใช้งาน',
          failed: 'การชำระเงินยังไม่เสร็จ คุณสามารถลองใหม่หรือปิดหน้าต่างนี้ได้',
          successCredits: '+{credits} เครดิตเพิ่มแล้ว',
          successBalance: 'ยอดปัจจุบัน: {balance} เครดิต',
          createFailed: 'สร้างคำสั่งซื้อไม่สำเร็จ โปรดลองอีกครั้ง',
          invalidPaymentData: 'ลิงก์ชำระเงินไม่ถูกต้อง โปรดลองใหม่ภายหลัง',
          priceUpdated: 'ราคาเปลี่ยนแล้ว โปรดตรวจสอบราคาล่าสุดแล้วซื้ออีกครั้ง',
          gatewayFailed: 'ช่องทางชำระเงินไม่พร้อมใช้งานชั่วคราว โปรดลองใหม่ภายหลัง',
          paymentCanceled: 'การชำระเงินถูกยกเลิก เลือกวิธีชำระเงินแล้วลองอีกครั้ง',
          pollFailed: 'อัปเดตสถานะการชำระเงินไม่สำเร็จ โปรดลองอีกครั้ง',
          pollTimeout: 'การอัปเดตอัตโนมัติหมดเวลา โปรดรีเฟรชผลหลังชำระเงิน',
          orderNotFound: 'คำสั่งซื้อนี้ไม่พร้อมใช้งานแล้ว โปรดสร้างคำสั่งซื้อใหม่',
          orderExpired: 'คำสั่งซื้อหมดอายุแล้ว โปรดซื้ออีกครั้ง',
          fulfillmentFailed: 'ได้รับการชำระเงินแล้ว แต่ยังไม่ได้เพิ่มเครดิต โปรดลองใหม่ภายหลัง',
          authExpired: 'การเข้าสู่ระบบหมดอายุ กรุณาเข้าสู่ระบบใหม่เพื่อดำเนินการต่อ'
        },
        parse: {
          eyebrow: 'แยกลิงก์โดยตรง',
          title: 'เริ่ม ดาวน์โหลดวิดีโอ Telegram',
          helperText:
            'วางลิงก์เพื่อเตรียม ดาวน์โหลดวิดีโอ Telegram สำหรับเนื้อหาที่โหลดไว้แล้ว',
          telegramMessageListLinkError:
            'ลิงก์ Telegram นี้เปิดแชทหรือช่อง ไม่ใช่ข้อความที่เฉพาะเจาะจง โปรดคัดลอกลิงก์ข้อความที่ถูกต้องแล้ววางที่นี่',
          linkLabel: 'ลิงก์ Telegram',
          linkPlaceholder: 'https://t.me/example/123',
          clearInput: 'ล้างข้อมูลที่ป้อน',
          submit: 'แยกลิงก์',
          submitting: 'กำลังแยก...',
          noResults: 'ไม่พบไฟล์ที่ดาวน์โหลดได้ในข้อความนี้',
          download: 'ดาวน์โหลด',
          downloading: 'กำลังดาวน์โหลด...',
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
          largeFileExtensionInlineChromeTitle: 'ส่วนขยาย Chrome',
          largeFileExtensionInlineChromeDescription:
            'ส่วนขยายสำหรับ Chrome เพื่อจับสื่อ Telegram ได้ในคลิกเดียว',
          largeFileExtensionInlineChromeCta: 'ติดตั้งส่วนขยาย',
          largeFileExtensionInlineEdgeTitle: 'ส่วนขยาย Edge',
          largeFileExtensionInlineEdgeDescription:
            'ส่วนขยายสำหรับ Microsoft Edge ที่รองรับการดาวน์โหลดเนื้อหา Telegram',
          largeFileExtensionInlineEdgeCta: 'ติดตั้งส่วนขยาย'
        },
        errors: {
          enterEmailFirst: 'กรุณากรอกอีเมลก่อน',
          enterEmailAndCode: 'กรุณากรอกอีเมลและรหัสยืนยัน',
          sendCodeFailed: 'ส่งรหัสยืนยันไม่สำเร็จ',
          googleSignInFailed: 'เข้าสู่ระบบด้วย Google ไม่สำเร็จ',
          googleClientMissing: 'ยังไม่ได้ตั้งค่าการเข้าสู่ระบบด้วย Google',
          restoreSessionFailed: 'กู้คืนเซสชันไม่สำเร็จ',
          signInFailed: 'เข้าสู่ระบบไม่สำเร็จ',
          logoutFailed: 'ออกจากระบบไม่สำเร็จ',
          loadQuotaFailed: 'โหลดเครดิตไม่สำเร็จ',
          enterLink: 'กรุณากรอกลิงก์สื่อ',
          invalidLink: 'นี่ไม่ใช่ URL ที่ถูกต้อง',
          parseFailed: 'ไม่สามารถแยกลิงก์นี้ได้',
          downloadFailed: 'ดาวน์โหลดไฟล์นี้ไม่สำเร็จ',
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
          xParseFailed: 'ลิงก์ X นี้ยังไม่รองรับ โปรดลองโพสต์วิดีโอสาธารณะ',
          instagramParseFailed: 'ลิงก์ Instagram นี้ยังไม่รองรับ โปรดลองโพสต์สาธารณะ',
          instagramImageParseFailed: 'ลิงก์ Instagram นี้ยังไม่รองรับ โปรดลองโพสต์รูปภาพสาธารณะ',
          threadsParseFailed: 'ลิงก์ Threads นี้ยังไม่รองรับ โปรดลองโพสต์สาธารณะ',
          redditParseFailed: 'ดึงสื่อ Reddit ไม่สำเร็จ โปรดลองโพสต์วิดีโอ รูปภาพ หรือแกลเลอรีสาธารณะ',
          douyinParseFailed: 'ดึงวิดีโอ Douyin นี้ไม่สำเร็จ โปรดลองลิงก์วิดีโอสาธารณะ',
          quotaExceeded: 'เครดิตไม่พอสำหรับดาวน์โหลดไฟล์นี้',
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
        title: 'เครื่องมือดาวน์โหลดวิดีโอเพิ่มเติม',
        items: [
          {
            label: 'TikTok Downloader',
            href: '/tiktok-downloader/',
            description: 'ดาวน์โหลดวิดีโอ TikTok ไม่มีลายน้ำคุณภาพ HD'
          },
          {
            label: 'X (Twitter) Downloader',
            href: '/x-downloader/',
            description: 'ดาวน์โหลดวิดีโอและ GIF จาก X/Twitter คุณภาพ HD'
          },
          {
            label: 'Vimeo Downloader',
            href: '/vimeo-downloader/',
            description: 'ดาวน์โหลดวิดีโอ Vimeo คุณภาพ HD พร้อมตัวเลือกหลายความละเอียด'
          },
          {
            label: 'Instagram Downloader',
            href: '/instagram-downloader/',
            description: 'ดาวน์โหลดรูปภาพ Reels และอัลบั้มจาก Instagram คุณภาพ HD'
          },
          {
            label: 'Threads Downloader',
            href: '/threads-downloader/',
            description: 'ดาวน์โหลดวิดีโอและรูปภาพจาก Threads คุณภาพต้นฉบับ'
          }
        ]
      }
    },
    changelog: {
      title: 'บันทึก ดาวน์โหลดวิดีโอ Telegram',
      description:
        'ติดตามทุกอัปเดตเกี่ยวกับ ดาวน์โหลดวิดีโอ Telegram เวิร์กโฟลว์บนเว็บ และช่วงการบันทึกที่ยาวขึ้น',
      seoTitle: 'บันทึก ดาวน์โหลดวิดีโอ Telegram | TG Downloader',
      seoDescription:
        'ดูบันทึก ดาวน์โหลดวิดีโอ Telegram นี้เพื่อตรวจสอบการเปลี่ยนแปลงของเวิร์กโฟลว์บนเว็บ ไฟล์ขนาดใหญ่ และเวอร์ชันล่าสุด',
      entries: [
        {
          version: '1.1.3',
          date: '2025-01-15',
          title: 'การปรับปรุงประสิทธิภาพ',
          description: 'การปรับปรุงประสิทธิภาพอย่างมีนัยสำคัญเพื่อประสบการณ์การใช้งานที่ดีขึ้น',
          features: [
            'เพิ่มความเร็วในการตรวจจับทรัพยากร 50%',
            'ปรับปรุงความมั่นคงในการดาวน์โหลดไฟล์ขนาดใหญ่',
            'ปรับปรุงความตอบสนองของ UI'
          ]
        },
        {
          version: '1.1.2',
          date: '2024-11-10',
          title: 'รองรับหลายภาษา',
          description: 'เพิ่มการรองรับ 14 ภาษาทั่วโลก',
          features: [
            'เพิ่มการรองรับภาษาญี่ปุ่น เกาหลี และภาษาอื่นๆ',
            'ปรับปรุงความแม่นยำของการแปล',
            'เพิ่มการตรวจจับภาษาอัตโนมัติ'
          ]
        },
        {
          version: '1.1.0',
          date: '2024-09-01',
          title: 'ดาวน์โหลดแถบด้านข้าง',
          description: 'คุณสมบัติการดาวน์โหลดแถบด้านข้างใหม่พร้อมการรองรับแบบกลุ่ม',
          features: [
            'เพิ่มการดาวน์โหลดไฟล์เดี่ยวในแถบด้านข้าง',
            'เพิ่มฟีเจอร์การดาวน์โหลดแบบกลุ่ม',
            'ปรับปรุงการจัดการคิวดาวน์โหลด'
          ]
        },
        {
          version: '1.0.2',
          date: '2024-08-15',
          title: 'ความปลอดภัยและความเป็นส่วนตัว',
          description: 'การปรับปรุงความปลอดภัยและการเสริมสร้างความเป็นส่วนตัว',
          features: [
            'ลบการติดตามการวิเคราะห์ทั้งหมด',
            'เพิ่มโหมดการประมวลผลเฉพาะในเครื่อง',
            'ปรับปรุงการเข้ารหัสข้อมูล'
          ]
        },
        {
          version: '1.0.0',
          date: '2024-07-01',
          title: 'การเปิดตัวครั้งแรก',
          description: 'การเปิดตัวครั้งแรกพร้อมการรองรับการดาวน์โหลดในหน้าต่างแชท',
          features: [
            'ฟีเจอร์การดาวน์โหลดในหน้าต่างแชท',
            'รองรับ Telegram Web เวอร์ชัน K และ A',
            'การรองรับรูปแบบสื่อพื้นฐาน'
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
    pricing: thTHPricingContent,
    downloadDisabledChannelWorkaround: downloadDisabledChannelWorkaroundContent['th-TH'],
    extensionLoginV2: {
      title: 'เข้าสู่ระบบส่วนขยาย | TG Downloader',
      description: 'เข้าสู่ระบบ TG Downloader และซิงค์เซสชันเว็บไซต์ของคุณกับส่วนขยายเบราว์เซอร์',
      eyebrow: 'ส่วนขยายเบราว์เซอร์',
      heading: 'เข้าสู่ระบบ TG Downloader',
      checkingState: 'กำลังตรวจสอบเซสชัน',
      signInRequiredState: 'ต้องเข้าสู่ระบบ',
      syncedState: 'เข้าสู่ระบบแล้ว',
      verificationFailedState: 'การยืนยันล้มเหลว',
      preparingTitle: 'กำลังเตรียมเข้าสู่ระบบ…',
      preparingText: 'TG Downloader กำลังเตรียมตรวจสอบเซสชันเว็บไซต์',
      checkingSessionTitle: 'กำลังตรวจสอบเซสชันเว็บไซต์…',
      checkingSessionText: 'TG Downloader กำลังยืนยันโทเค็นเว็บไซต์ที่เก็บไว้ในเบราว์เซอร์นี้',
      finishingGoogleTitle: 'กำลังเสร็จสิ้นการเข้าสู่ระบบด้วย Google…',
      finishingGoogleText: 'TG Downloader กำลังแลกผลการเข้าสู่ระบบด้วย Google เป็นเซสชันเว็บไซต์',
      signInRequiredTitle: 'เข้าสู่ระบบเพื่อดำเนินการต่อ',
      signInRequiredText: 'ใช้หน้าต่างเข้าสู่ระบบ TG Downloader เดียวกับบนเว็บไซต์',
      signInButtonLabel: 'เข้าสู่ระบบ',
      syncingTitle: 'กำลังซิงค์โทเค็นส่วนขยาย…',
      syncingText: 'TG Downloader กำลังแลกเซสชันเว็บไซต์ของคุณเป็นโทเค็นส่วนขยาย',
      syncedTitle: 'เข้าสู่ระบบสำเร็จ',
      syncedText: 'ส่วนขยายเชื่อมต่อกับบัญชี TG Downloader ของคุณแล้ว คลิก กลับไปยัง Telegram เพื่อกลับ',
      returnButtonLabel: 'กลับไปยัง Telegram',
      returningButtonLabel: 'กำลังกลับ…',
      verificationFailedTitle: 'ไม่สามารถเข้าสู่ระบบส่วนขยายให้เสร็จสิ้นได้',
      retryButtonLabel: 'ลองอีกครั้ง',
    },
    platformDownloaders: {
      tiktok: {
        seo: {
          title: 'ดาวน์โหลดวิดีโอ TikTok ไม่มีลายน้ำ - คุณภาพ HD | TG Downloader',
          description:
            'ดาวน์โหลดวิดีโอ TikTok ไม่มีลายน้ำคุณภาพ HD ฟรี ไม่ต้องติดตั้งแอป บันทึกวิดีโอ สไลด์โชว์ และสตอรี่ TikTok ได้ทันที',
          keywords:
            'ดาวน์โหลด tiktok, ดาวน์โหลดวิดีโอ tiktok, tiktok ไม่มีลายน้ำ, โหลดวิดีโอ tiktok hd, บันทึกวิดีโอ tiktok, โหลด tiktok ฟรี'
        },
        workspace: {
          title: 'ดาวน์โหลดวิดีโอ TikTok ไม่มีลายน้ำ',
          helperText:
            'วางลิงก์วิดีโอ TikTok เพื่อดาวน์โหลดไม่มีลายน้ำคุณภาพ HD รองรับลิงก์ Telegram, X และ Vimeo ด้วย',
          linkPlaceholder: 'https://www.tiktok.com/@user/video/1234567890'
        },
        features: {
          title: 'ทำไมต้องใช้ TikTok Downloader ของเรา',
          subtitle: 'บันทึกวิดีโอ TikTok คุณภาพสูงสุดไม่มีลายน้ำ ฟรีทั้งหมด',
          items: [
            {
              title: 'ไม่มีลายน้ำ',
              description:
                'ดาวน์โหลดวิดีโอ TikTok โดยไม่มีลายน้ำ TikTok ทับ ได้วิดีโอคุณภาพต้นฉบับพร้อมบันทึกหรือแชร์'
            },
            {
              title: 'คุณภาพ HD',
              description:
                'บันทึกวิดีโอ TikTok ในความละเอียด HD ต้นฉบับ ไม่สูญเสียคุณภาพ ไม่บีบอัด ตรงตามที่ผู้สร้างอัปโหลด'
            },
            {
              title: 'เร็วและฟรี',
              description:
                'ไม่ต้องติดตั้งแอป ไม่ต้องลงทะเบียน ไม่มีค่าใช้จ่ายแอบแฝง วางลิงก์ รับวิดีโอ ใช้งานได้ทันทีในทุกเบราว์เซอร์'
            }
          ]
        },
        howTo: {
          title: 'วิธีดาวน์โหลดวิดีโอ TikTok ไม่มีลายน้ำ',
          subtitle:
            'สามขั้นตอนง่ายๆ ในการบันทึกวิดีโอ TikTok คุณภาพ HD ไม่มีลายน้ำ',
          steps: [
            {
              title: 'คัดลอกลิงก์วิดีโอ TikTok',
              description:
                'เปิด TikTok แตะปุ่มแชร์บนวิดีโอ แล้วเลือก "คัดลอกลิงก์"'
            },
            {
              title: 'วางลิงก์ด้านบน',
              description:
                'วาง URL TikTok ที่คัดลอกลงในช่องป้อนข้อมูลแล้วคลิกแยกลิงก์'
            },
            {
              title: 'ดาวน์โหลดไม่มีลายน้ำ',
              description:
                'คลิกปุ่มดาวน์โหลดเพื่อบันทึกวิดีโอ TikTok คุณภาพ HD ไม่มีลายน้ำ'
            }
          ]
        },
        faq: {
          title: 'คำถามที่พบบ่อย TikTok Downloader',
          items: [
            {
              question: 'TikTok downloader นี้ฟรีจริงหรือ?',
              answer:
                'ใช่ ฟรีทั้งหมดไม่มีค่าใช้จ่ายแอบแฝง คุณสามารถดาวน์โหลดวิดีโอ TikTok ไม่มีลายน้ำโดยไม่เสียค่าใช้จ่าย'
            },
            {
              question: 'วิดีโอที่ดาวน์โหลดจะมีลายน้ำหรือไม่?',
              answer:
                'ไม่มี ตัวดาวน์โหลดของเราลบลายน้ำ TikTok และส่งมอบวิดีโอต้นฉบับคุณภาพ HD'
            },
            {
              question: 'วิดีโอ TikTok ที่ดาวน์โหลดมีคุณภาพเท่าไหร่?',
              answer:
                'วิดีโอถูกบันทึกในความละเอียด HD ต้นฉบับตามที่ผู้สร้างอัปโหลด ไม่สูญเสียคุณภาพ'
            },
            {
              question: 'ต้องติดตั้งแอปหรือส่วนเสริมหรือไม่?',
              answer:
                'ไม่ต้องติดตั้ง เป็นเครื่องมือบนเว็บที่ทำงานในเบราว์เซอร์ได้โดยตรงบนทุกอุปกรณ์'
            },
            {
              question: 'ดาวน์โหลด TikTok Stories และ Slideshows ได้หรือไม่?',
              answer:
                'ได้ ตัวดาวน์โหลดของเรารองรับวิดีโอ TikTok สไลด์โชว์ภาพ และสตอรี่ วางลิงก์แล้วดาวน์โหลดได้เลย'
            }
          ]
        },
        crossLinks: {
          title: 'เครื่องมือดาวน์โหลดวิดีโอเพิ่มเติม',
          items: [
            {
              label: 'X (Twitter) Downloader',
              href: '/x-downloader/',
              description: 'ดาวน์โหลดวิดีโอและ GIF จาก X/Twitter คุณภาพ HD'
            },
            {
              label: 'Vimeo Downloader',
              href: '/vimeo-downloader/',
              description: 'ดาวน์โหลดวิดีโอ Vimeo คุณภาพ HD พร้อมตัวเลือกหลายความละเอียด'
            },
            {
              label: 'Instagram Downloader',
              href: '/instagram-downloader/',
              description: 'ดาวน์โหลดรูปภาพ Reels และอัลบั้มจาก Instagram คุณภาพ HD'
            },
            {
              label: 'Threads Downloader',
              href: '/threads-downloader/',
              description: 'ดาวน์โหลดวิดีโอและรูปภาพจาก Threads คุณภาพต้นฉบับ'
            },
            {
              label: 'Telegram Downloader',
              href: '/',
              description: 'ดาวน์โหลดวิดีโอ Telegram จากช่องและกลุ่มคุณภาพ HD'
            }
          ]
        }
      },
      x: {
        seo: {
          title: 'ดาวน์โหลดวิดีโอ X (Twitter) - บันทึกวิดีโอและ GIF HD | TG Downloader',
          description:
            'ดาวน์โหลดวิดีโอและ GIF จาก X (Twitter) คุณภาพ HD ฟรี ไม่ต้องติดตั้งแอป บันทึกวิดีโอหรือ GIF จากทวีตสาธารณะได้ทันที',
          keywords:
            'ดาวน์โหลด x, ดาวน์โหลดวิดีโอ twitter, โหลดวิดีโอ twitter, x video downloader, ดาวน์โหลด gif twitter, บันทึกวิดีโอ twitter'
        },
        workspace: {
          title: 'ดาวน์โหลดวิดีโอ X (Twitter)',
          helperText:
            'วางลิงก์วิดีโอ X หรือ Twitter เพื่อดาวน์โหลดคุณภาพสูงสุด รองรับลิงก์ Telegram, TikTok และ Vimeo ด้วย',
          linkPlaceholder: 'https://x.com/user/status/1234567890'
        },
        features: {
          title: 'ทำไมต้องใช้ X Video Downloader ของเรา',
          subtitle: 'บันทึกวิดีโอและ GIF จาก X/Twitter คุณภาพต้นฉบับ ฟรีทั้งหมด',
          items: [
            {
              title: 'วิดีโอและ GIF',
              description:
                'ดาวน์โหลดทั้งวิดีโอโพสต์และ GIF แอนิเมชันจาก X (Twitter) ได้สื่อตรงตามที่แสดงในทวีต'
            },
            {
              title: 'คุณภาพ HD ต้นฉบับ',
              description:
                'บันทึกวิดีโอ X ในความละเอียดสูงสุดที่มี ไม่สูญเสียคุณภาพ ได้บิตเรตเดียวกับต้นฉบับ'
            },
            {
              title: 'เร็วและฟรี',
              description:
                'ไม่ต้องติดตั้งแอป ไม่ต้องเข้าสู่ระบบ วาง URL ทวีต ดาวน์โหลดวิดีโอหรือ GIF ได้ในไม่กี่วินาที'
            }
          ]
        },
        howTo: {
          title: 'วิธีดาวน์โหลดวิดีโอ X (Twitter)',
          subtitle:
            'สามขั้นตอนง่ายๆ ในการบันทึกวิดีโอหรือ GIF จาก X/Twitter',
          steps: [
            {
              title: 'คัดลอก URL ทวีต',
              description:
                'บน X (Twitter) คลิกไอคอนแชร์บนทวีตแล้วเลือก "คัดลอกลิงก์"'
            },
            {
              title: 'วางลิงก์ด้านบน',
              description:
                'วาง URL X/Twitter ที่คัดลอกลงในช่องป้อนข้อมูลแล้วคลิกแยกลิงก์'
            },
            {
              title: 'ดาวน์โหลดวิดีโอหรือ GIF',
              description:
                'คลิกดาวน์โหลดเพื่อบันทึกวิดีโอหรือ GIF คุณภาพ HD ลงอุปกรณ์ของคุณ'
            }
          ]
        },
        faq: {
          title: 'คำถามที่พบบ่อย X Video Downloader',
          items: [
            {
              question: 'ดาวน์โหลดวิดีโอจาก X (Twitter) ได้อย่างไร?',
              answer:
                'คัดลอก URL ทวีตที่มีวิดีโอ วางลงในช่องป้อนข้อมูลด้านบนแล้วคลิกแยกลิงก์ จากนั้นคลิกดาวน์โหลดเพื่อบันทึกวิดีโอ'
            },
            {
              question: 'ดาวน์โหลด GIF จาก X ได้หรือไม่?',
              answer:
                'ได้ ตัวดาวน์โหลดของเรารองรับทั้งวิดีโอและ GIF แอนิเมชันจากโพสต์ X/Twitter โดย GIF จะถูกบันทึกเป็นไฟล์ MP4 เพื่อความเข้ากันได้ดีที่สุด'
            },
            {
              question: 'มีคุณภาพวิดีโอระดับไหน?',
              answer:
                'เราส่งมอบคุณภาพสูงสุดที่มีสำหรับแต่ละทวีต โดยทั่วไปเป็นความละเอียด HD ต้นฉบับที่ผู้โพสต์อัปโหลด'
            },
            {
              question: 'X downloader นี้ใช้ฟรีหรือไม่?',
              answer:
                'ใช่ ฟรีทั้งหมดไม่ต้องลงทะเบียน ดาวน์โหลดวิดีโอและ GIF จาก X โดยไม่เสียค่าใช้จ่าย'
            },
            {
              question: 'ต้องมีบัญชี X/Twitter เพื่อดาวน์โหลดหรือไม่?',
              answer:
                'ไม่ต้องมีบัญชี ตราบใดที่ทวีตเป็นสาธารณะ คุณสามารถดาวน์โหลดวิดีโอหรือ GIF ได้โดยไม่ต้องเข้าสู่ระบบ'
            }
          ]
        },
        crossLinks: {
          title: 'เครื่องมือดาวน์โหลดวิดีโอเพิ่มเติม',
          items: [
            {
              label: 'TikTok Downloader',
              href: '/tiktok-downloader/',
              description: 'ดาวน์โหลดวิดีโอ TikTok ไม่มีลายน้ำคุณภาพ HD'
            },
            {
              label: 'Vimeo Downloader',
              href: '/vimeo-downloader/',
              description: 'ดาวน์โหลดวิดีโอ Vimeo คุณภาพ HD พร้อมตัวเลือกหลายความละเอียด'
            },
            {
              label: 'Instagram Downloader',
              href: '/instagram-downloader/',
              description: 'ดาวน์โหลดรูปภาพ Reels และอัลบั้มจาก Instagram คุณภาพ HD'
            },
            {
              label: 'Threads Downloader',
              href: '/threads-downloader/',
              description: 'ดาวน์โหลดวิดีโอและรูปภาพจาก Threads คุณภาพต้นฉบับ'
            },
            {
              label: 'Telegram Downloader',
              href: '/',
              description: 'ดาวน์โหลดวิดีโอ Telegram จากช่องและกลุ่มคุณภาพ HD'
            }
          ]
        }
      },
      vimeo: {
        seo: {
          title: 'ดาวน์โหลดวิดีโอ Vimeo HD - หลายความละเอียด | TG Downloader',
          description:
            'ดาวน์โหลดวิดีโอ Vimeo คุณภาพ HD พร้อมตัวเลือกหลายความละเอียดฟรี ไม่ต้องติดตั้งแอป บันทึกวิดีโอ Vimeo สาธารณะได้ทันที',
          keywords:
            'ดาวน์โหลด vimeo, ดาวน์โหลดวิดีโอ vimeo, โหลดวิดีโอ vimeo hd, vimeo downloader ฟรี, บันทึกวิดีโอ vimeo, ดาวน์โหลด vimeo hd'
        },
        workspace: {
          title: 'ดาวน์โหลดวิดีโอ Vimeo HD',
          helperText:
            'วางลิงก์วิดีโอ Vimeo เพื่อดาวน์โหลดคุณภาพ HD พร้อมเลือกความละเอียด รองรับลิงก์ Telegram, TikTok และ X ด้วย',
          linkPlaceholder: 'https://vimeo.com/123456789'
        },
        features: {
          title: 'ทำไมต้องใช้ Vimeo Downloader ของเรา',
          subtitle: 'บันทึกวิดีโอ Vimeo คุณภาพ HD เลือกความละเอียดได้ ฟรีทั้งหมด',
          items: [
            {
              title: 'คุณภาพ HD ต้นฉบับ',
              description:
                'ดาวน์โหลดวิดีโอ Vimeo ในความละเอียด HD เต็ม ได้คุณภาพคมชัดเหมือนที่ผู้สร้างอัปโหลด'
            },
            {
              title: 'หลายความละเอียด',
              description:
                'เลือกจากความละเอียดที่มี (360p, 720p, 1080p และอื่นๆ) เลือกคุณภาพที่เหมาะกับความต้องการของคุณ'
            },
            {
              title: 'เร็วและฟรี',
              description:
                'ไม่ต้องติดตั้งแอป ไม่ต้องมีบัญชี วางลิงก์ Vimeo เลือกความละเอียด แล้วดาวน์โหลดได้ทันที'
            }
          ]
        },
        howTo: {
          title: 'วิธีดาวน์โหลดวิดีโอ Vimeo คุณภาพ HD',
          subtitle:
            'สามขั้นตอนง่ายๆ ในการบันทึกวิดีโอ Vimeo ตามความละเอียดที่ต้องการ',
          steps: [
            {
              title: 'คัดลอกลิงก์วิดีโอ Vimeo',
              description:
                'เปิดหน้าวิดีโอ Vimeo แล้วคัดลอก URL จากแถบที่อยู่เบราว์เซอร์'
            },
            {
              title: 'วางลิงก์ด้านบน',
              description:
                'วาง URL Vimeo ที่คัดลอกลงในช่องป้อนข้อมูลแล้วคลิกแยกลิงก์'
            },
            {
              title: 'เลือกความละเอียดและดาวน์โหลด',
              description:
                'เลือกความละเอียดวิดีโอที่ต้องการแล้วคลิกดาวน์โหลดเพื่อบันทึกวิดีโอ HD'
            }
          ]
        },
        faq: {
          title: 'คำถามที่พบบ่อย Vimeo Downloader',
          items: [
            {
              question: 'ดาวน์โหลดวิดีโอจาก Vimeo ได้อย่างไร?',
              answer:
                'คัดลอก URL หน้าวิดีโอ Vimeo วางลงในช่องป้อนข้อมูลด้านบน คลิกแยกลิงก์ จากนั้นเลือกความละเอียดที่ต้องการแล้วดาวน์โหลด'
            },
            {
              question: 'เลือกความละเอียดวิดีโอได้หรือไม่?',
              answer:
                'ได้ หลังจากแยกลิงก์แล้ว คุณสามารถเลือกจากความละเอียดทั้งหมดที่มี รวมถึง 360p, 720p, 1080p และสูงกว่าเมื่อมี'
            },
            {
              question: 'Vimeo downloader นี้ฟรีหรือไม่?',
              answer:
                'ใช่ ใช้งานฟรีทั้งหมด ดาวน์โหลดวิดีโอ Vimeo คุณภาพ HD โดยไม่เสียค่าใช้จ่ายหรือต้องลงทะเบียน'
            },
            {
              question: 'ต้องมีบัญชี Vimeo เพื่อดาวน์โหลดหรือไม่?',
              answer:
                'ไม่ต้องมีบัญชี คุณสามารถดาวน์โหลดวิดีโอ Vimeo สาธารณะใดก็ได้โดยไม่ต้องเข้าสู่ระบบ'
            },
            {
              question: 'วิดีโอที่ดาวน์โหลดเป็นรูปแบบอะไร?',
              answer:
                'วิดีโอ Vimeo ดาวน์โหลดในรูปแบบ MP4 ซึ่งเข้ากันได้กับอุปกรณ์และเครื่องเล่นแทบทุกชนิด'
            }
          ]
        },
        crossLinks: {
          title: 'เครื่องมือดาวน์โหลดวิดีโอเพิ่มเติม',
          items: [
            {
              label: 'TikTok Downloader',
              href: '/tiktok-downloader/',
              description: 'ดาวน์โหลดวิดีโอ TikTok ไม่มีลายน้ำคุณภาพ HD'
            },
            {
              label: 'X (Twitter) Downloader',
              href: '/x-downloader/',
              description: 'ดาวน์โหลดวิดีโอและ GIF จาก X/Twitter คุณภาพ HD'
            },
            {
              label: 'Instagram Downloader',
              href: '/instagram-downloader/',
              description: 'ดาวน์โหลดรูปภาพ Reels และอัลบั้มจาก Instagram คุณภาพ HD'
            },
            {
              label: 'Threads Downloader',
              href: '/threads-downloader/',
              description: 'ดาวน์โหลดวิดีโอและรูปภาพจาก Threads คุณภาพต้นฉบับ'
            },
            {
              label: 'Telegram Downloader',
              href: '/',
              description: 'ดาวน์โหลดวิดีโอ Telegram จากช่องและกลุ่มคุณภาพ HD'
            }
          ]
        }
      },
      instagram: {
        seo: {
          title: 'ดาวน์โหลดรูปภาพและวิดีโอ Instagram - คุณภาพ HD | TG Downloader',
          description:
            'ดาวน์โหลดรูปภาพ Reels และอัลบั้มจาก Instagram คุณภาพ HD ฟรี ไม่ต้องติดตั้งแอป บันทึกทันที',
          keywords:
            'ดาวน์โหลด Instagram, ดาวน์โหลดรูป Instagram, ดาวน์โหลด Reels Instagram, ดาวน์โหลดอัลบั้ม Instagram, บันทึกวิดีโอ Instagram, ตัวดาวน์โหลด Instagram ฟรี'
        },
        workspace: {
          title: 'ดาวน์โหลดรูปภาพและวิดีโอ Instagram',
          helperText:
            'วางลิงก์โพสต์ Instagram เพื่อดาวน์โหลดรูปภาพ Reels และอัลบั้มคุณภาพ HD รองรับลิงก์ Telegram, TikTok และ X ด้วย',
          linkPlaceholder: 'https://www.instagram.com/p/ABC123xyz/'
        },
        features: {
          title: 'ทำไมต้องใช้ตัวดาวน์โหลด Instagram ของเรา',
          subtitle: 'บันทึกรูปภาพ Reels และอัลบั้ม Instagram คุณภาพ HD ต้นฉบับ ฟรีทั้งหมด',
          items: [
            {
              title: 'รูปภาพและ Reels',
              description:
                'ดาวน์โหลดรูปภาพและวิดีโอ Reels จาก Instagram คุณภาพต้นฉบับ ได้สื่อตรงตามที่ผู้สร้างโพสต์'
            },
            {
              title: 'ดาวน์โหลดอัลบั้มทั้งหมด',
              description:
                'ดาวน์โหลดรูปภาพและวิดีโอทั้งหมดจากโพสต์อัลบั้ม Instagram ในครั้งเดียว ไม่ต้องบันทึกทีละรูป'
            },
            {
              title: 'คุณภาพ HD ต้นฉบับ',
              description:
                'บันทึกสื่อ Instagram ในความละเอียดสูงสุดที่มี ไม่บีบอัด ไม่สูญเสียคุณภาพ'
            }
          ]
        },
        howTo: {
          title: 'วิธีดาวน์โหลดรูปภาพและวิดีโอจาก Instagram',
          subtitle:
            'สามขั้นตอนง่ายๆ เพื่อบันทึกโพสต์ Instagram คุณภาพ HD',
          steps: [
            {
              title: 'คัดลอกลิงก์โพสต์ Instagram',
              description:
                'เปิด Instagram แตะจุดสามจุดที่โพสต์ แล้วเลือก "คัดลอกลิงก์"'
            },
            {
              title: 'วางลิงก์ด้านบน',
              description:
                'วาง URL Instagram ที่คัดลอกลงในช่องป้อนข้อมูล แล้วคลิก "วิเคราะห์"'
            },
            {
              title: 'ดาวน์โหลด HD',
              description:
                'คลิกปุ่ม "ดาวน์โหลด" เพื่อบันทึกรูปภาพ Reels หรืออัลบั้มคุณภาพต้นฉบับ'
            }
          ]
        },
        faq: {
          title: 'คำถามที่พบบ่อยเกี่ยวกับตัวดาวน์โหลด Instagram',
          items: [
            {
              question: 'ตัวดาวน์โหลด Instagram นี้ฟรีจริงหรือ?',
              answer:
                'ใช่ ฟรีทั้งหมดไม่มีค่าใช้จ่ายแอบแฝง ดาวน์โหลดรูปภาพ Reels และอัลบั้ม Instagram ได้ฟรี'
            },
            {
              question: 'รองรับรูปแบบไฟล์อะไรบ้าง?',
              answer:
                'เรารองรับการดาวน์โหลดรูปภาพ Instagram (JPG) วิดีโอ Reels (MP4) และอัลบั้มที่มีสื่อทั้งหมด'
            },
            {
              question: 'ไฟล์ที่ดาวน์โหลดมีคุณภาพเท่าไร?',
              answer:
                'สื่อทั้งหมดบันทึกในความละเอียด HD ต้นฉบับของผู้สร้าง ไม่สูญเสียคุณภาพหรือบีบอัด'
            },
            {
              question: 'ต้องมีบัญชี Instagram เพื่อดาวน์โหลดหรือไม่?',
              answer:
                'ไม่ต้อง ตราบใดที่โพสต์เป็นสาธารณะ คุณสามารถดาวน์โหลดสื่อได้โดยไม่ต้องเข้าสู่ระบบ'
            },
            {
              question: 'ดาวน์โหลด Instagram Stories ได้ไหม?',
              answer:
                'ปัจจุบันรองรับโพสต์ Reels และอัลบั้ม การดาวน์โหลด Stories ต้องให้เนื้อหาเข้าถึงได้สาธารณะผ่านลิงก์โดยตรง'
            }
          ]
        },
        crossLinks: {
          title: 'ตัวดาวน์โหลดวิดีโอเพิ่มเติม',
          items: [
            {
              label: 'TikTok Downloader',
              href: '/tiktok-downloader/',
              description: 'ดาวน์โหลดวิดีโอ TikTok ไม่มีลายน้ำคุณภาพ HD'
            },
            {
              label: 'X (Twitter) Downloader',
              href: '/x-downloader/',
              description: 'ดาวน์โหลดวิดีโอและ GIF จาก X/Twitter คุณภาพ HD'
            },
            {
              label: 'Vimeo Downloader',
              href: '/vimeo-downloader/',
              description: 'ดาวน์โหลดวิดีโอ Vimeo HD เลือกความละเอียดได้หลายระดับ'
            },
            {
              label: 'Threads Downloader',
              href: '/threads-downloader/',
              description: 'ดาวน์โหลดวิดีโอและรูปภาพจาก Threads คุณภาพต้นฉบับ'
            },
            {
              label: 'Telegram Downloader',
              href: '/',
              description: 'ดาวน์โหลดวิดีโอจากช่องและกลุ่ม Telegram คุณภาพ HD'
            }
          ]
        }
      },
      threads: {
        seo: {
          title: 'ดาวน์โหลดวิดีโอและรูปภาพ Threads - คุณภาพต้นฉบับ | TG Downloader',
          description:
            'ดาวน์โหลดวิดีโอและรูปภาพจาก Threads คุณภาพต้นฉบับฟรี ไม่ต้องติดตั้งแอป บันทึกสื่อรวมถึงอัลบั้มทันที',
          keywords:
            'ดาวน์โหลด Threads, ดาวน์โหลดวิดีโอ Threads, โหลดวิดีโอ Threads, ดาวน์โหลดสื่อ Threads, บันทึกวิดีโอ Threads, ตัวดาวน์โหลด Threads ฟรี'
        },
        workspace: {
          title: 'ดาวน์โหลดวิดีโอและรูปภาพ Threads',
          helperText:
            'วางลิงก์โพสต์ Threads เพื่อดาวน์โหลดวิดีโอและรูปภาพคุณภาพต้นฉบับ รองรับลิงก์ Telegram, TikTok และ Instagram ด้วย',
          linkPlaceholder: 'https://www.threads.net/@user/post/ABC123xyz'
        },
        features: {
          title: 'ทำไมต้องใช้ตัวดาวน์โหลด Threads ของเรา',
          subtitle: 'บันทึกวิดีโอและรูปภาพ Threads คุณภาพต้นฉบับ ฟรีทั้งหมด',
          items: [
            {
              title: 'สื่อผสม',
              description:
                'ดาวน์โหลดวิดีโอและรูปภาพจากโพสต์ Threads รองรับโพสต์ที่มีเนื้อหาหลายประเภท'
            },
            {
              title: 'คุณภาพต้นฉบับ',
              description:
                'บันทึกสื่อ Threads ในความละเอียดสูงสุดที่มี ไม่บีบอัด ไม่สูญเสียคุณภาพ'
            },
            {
              title: 'รองรับอัลบั้ม',
              description:
                'ดาวน์โหลดสื่อทั้งหมดจากโพสต์อัลบั้ม Threads ในครั้งเดียว ได้ทุกรูปและวิดีโอในการดำเนินการเดียว'
            }
          ]
        },
        howTo: {
          title: 'วิธีดาวน์โหลดวิดีโอและรูปภาพจาก Threads',
          subtitle:
            'สามขั้นตอนง่ายๆ เพื่อบันทึกโพสต์ Threads คุณภาพต้นฉบับ',
          steps: [
            {
              title: 'คัดลอกลิงก์โพสต์ Threads',
              description:
                'เปิด Threads แตะไอคอนแชร์ของโพสต์ แล้วเลือก "คัดลอกลิงก์"'
            },
            {
              title: 'วางลิงก์ด้านบน',
              description:
                'วาง URL Threads ที่คัดลอกลงในช่องป้อนข้อมูล แล้วคลิก "วิเคราะห์"'
            },
            {
              title: 'ดาวน์โหลดสื่อ',
              description:
                'คลิกปุ่ม "ดาวน์โหลด" เพื่อบันทึกวิดีโอและรูปภาพคุณภาพต้นฉบับ'
            }
          ]
        },
        faq: {
          title: 'คำถามที่พบบ่อยเกี่ยวกับตัวดาวน์โหลด Threads',
          items: [
            {
              question: 'ตัวดาวน์โหลด Threads นี้ฟรีจริงหรือ?',
              answer:
                'ใช่ ฟรีทั้งหมดไม่มีค่าใช้จ่ายแอบแฝง ดาวน์โหลดวิดีโอและรูปภาพ Threads ได้ฟรี'
            },
            {
              question: 'รองรับสื่อประเภทไหนบ้าง?',
              answer:
                'เรารองรับการดาวน์โหลดวิดีโอ รูปภาพ และโพสต์สื่อผสมจาก Threads รวมถึงโพสต์อัลบั้มที่มีหลายรายการ'
            },
            {
              question: 'ไฟล์ที่ดาวน์โหลดมีคุณภาพเท่าไร?',
              answer:
                'สื่อทั้งหมดบันทึกในความละเอียดต้นฉบับของผู้สร้าง ไม่สูญเสียคุณภาพ'
            },
            {
              question: 'ต้องมีบัญชี Threads เพื่อดาวน์โหลดหรือไม่?',
              answer:
                'ไม่ต้อง ตราบใดที่โพสต์เป็นสาธารณะ คุณสามารถดาวน์โหลดสื่อได้โดยไม่ต้องเข้าสู่ระบบ'
            },
            {
              question: 'ดาวน์โหลดโพสต์อัลบั้มที่มีหลายรูปได้ไหม?',
              answer:
                'ได้ ตัวดาวน์โหลดของเรารองรับโพสต์อัลบั้ม Threads อย่างสมบูรณ์ รูปภาพและวิดีโอทั้งหมดในอัลบั้มพร้อมให้ดาวน์โหลด'
            }
          ]
        },
        crossLinks: {
          title: 'ตัวดาวน์โหลดวิดีโอเพิ่มเติม',
          items: [
            {
              label: 'TikTok Downloader',
              href: '/tiktok-downloader/',
              description: 'ดาวน์โหลดวิดีโอ TikTok ไม่มีลายน้ำคุณภาพ HD'
            },
            {
              label: 'X (Twitter) Downloader',
              href: '/x-downloader/',
              description: 'ดาวน์โหลดวิดีโอและ GIF จาก X/Twitter คุณภาพ HD'
            },
            {
              label: 'Vimeo Downloader',
              href: '/vimeo-downloader/',
              description: 'ดาวน์โหลดวิดีโอ Vimeo HD เลือกความละเอียดได้หลายระดับ'
            },
            {
              label: 'Instagram Downloader',
              href: '/instagram-downloader/',
              description: 'ดาวน์โหลดรูปภาพ Reels และอัลบั้มจาก Instagram คุณภาพ HD'
            },
            {
              label: 'Telegram Downloader',
              href: '/',
              description: 'ดาวน์โหลดวิดีโอจากช่องและกลุ่ม Telegram คุณภาพ HD'
            }
          ]
        }
      }

    }
  }
}
