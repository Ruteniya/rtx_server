import { Injectable, Logger } from '@nestjs/common'
import * as nodemailer from 'nodemailer'
import { Pto } from 'rtxtypes'
import { settings } from 'src/settings'

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name)
  private transporter

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: settings.smtp.host,
      port: settings.smtp.port,
      secure: settings.smtp.secure, // true for 465
      auth: {
        user: settings.smtp.user,
        pass: settings.smtp.pass
      }
    })
  }

  async sendGroupCodeEmail(game: Pto.Games.Game, group: Pto.Groups.Group): Promise<{ email: string; groupId: string; success: boolean; info?: any; error?: string }[]> {
    const subject = `Код вашої команди для гри "${game.name}"`
    const text = `
Привіт!

Ви зареєстровані для гри "${game.name}". 
Назва команди: ${group.name}.

Код вашої команди: 

${group.id}

Посилання на гру: ${process.env.FRONTEND_LINK}

Бажаємо успіху!
    `

    const results: { email: string; groupId: string; success: boolean; info?: any; error?: string }[] = []

    for (const email of group.emails) {
      try {
        const info = await this.transporter.sendMail({
          from: `"${process.env.APP_NAME || 'RTX Team'}" <${process.env.SMTP_USER}>`,
          to: email,
          subject,
          text
        })
        results.push({ email, groupId: group.id, success: true, info })
        this.logger.log(`Email успішно надіслано на ${email} для групи ${group.id}`)
      } catch (error) {
        results.push({ email, groupId: group.id, success: false, error: error.message })
        this.logger.error(`Помилка надсилання email на ${email} для групи ${group.id}: ${error.message}`)
      }
    }

    return results
  }
}
