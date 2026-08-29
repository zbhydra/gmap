import type { SiteContent } from '../schema'
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
  pages: {
    account: {
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
        creditsLabel: 'เครดิต',
        enterEmailFirst: 'กรุณากรอกอีเมลก่อน',
        enterEmailAndCode: 'กรุณากรอกอีเมลและรหัสยืนยัน',
        sendCodeFailed: 'ส่งรหัสยืนยันไม่สำเร็จ',
        googleSignInFailed: 'เข้าสู่ระบบด้วย Google ไม่สำเร็จ',
        googleClientMissing: 'ยังไม่ได้ตั้งค่าการเข้าสู่ระบบด้วย Google',
        signInFailed: 'เข้าสู่ระบบไม่สำเร็จ',
      },
      checkin: {
        accountButtonLabel: 'เปิดเมนูบัญชี',
        accountMenuLabel: 'เมนูบัญชี',
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
  }
}
