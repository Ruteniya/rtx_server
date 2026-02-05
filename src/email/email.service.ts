import { Injectable, Logger } from '@nestjs/common'
import { Resend } from 'resend';
import { Pto } from 'rtxtypes'
import { settings } from 'src/settings';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name)
  private client: Resend

  constructor() {
    if (!settings.resend.apiKey) {
      throw new Error('RESEND_API_KEY is not set')
    }
    if (!settings.resend.from) {
      throw new Error('RESEND_FROM is not set')
    }

    this.client = new Resend(process.env.RESEND_API_KEY)
  }

  async sendGroupCodeEmail(
    game: Pto.Games.Game,
    group: Pto.Groups.Group
  ): Promise<{ email: string; groupId: string; success: boolean; error?: string }[]> {
    const results: { email: string; groupId: string; success: boolean; error?: string }[] = []

    const subject = `Код вашої команди для гри «${game.name}»`

    const text = `
    Привіт! 👋
    
    Ви успішно зареєстровані для гри «${game.name}».
    
    ━━━━━━━━━━━━━━━━━━━━
    Назва команди:
    ${group.name}
    
    Код вашої команди:
    ${group.id}
    ━━━━━━━━━━━━━━━━━━━━
    
    ❗ Важливо:
    Скопіюйте цей код та використайте його під час реєстрації в програмі.
    
    Бажаємо успіху та гарної гри!
    Команда ${settings.teamName}
    `

    // Посилання на гру:
    // ${process.env.FRONTEND_LINK}
    

    for (const email of group.emails) {
      try {
        await this.client.emails.send({
          from: `"${settings.teamName}" <${settings.resend.from}>`,
          to: email,
          replyTo: settings.resend.replyTo,
          subject,
          text
        })

        results.push({ email, groupId: group.id, success: true })
        this.logger.log(`✅ Email успішно надіслано на ${email} для групи ${group.id}`)
      } catch (err: any) {
        results.push({ email, groupId: group.id, success: false, error: err.message })
        this.logger.error(`❌ Помилка надсилання email на ${email} для групи ${group.id}: ${err.message}`)
      }
    }

    return results
  }
}
