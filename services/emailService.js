const nodemailer = require('nodemailer')

class EmailService {
    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port:  process.env.SMTP_PORT,
            secure: true,
            auth: {
                user:  process.env.SMTP_USER,
                pass:  process.env.SMTP_PASSWORD
            }
        })
    }

    async sendUserConfirmationLink(to, link) {
        await this.transporter.sendMail({
            from: process.env.SMTP_USER,
            to,
            subject: `Подтверждение почты ${to}`,
            text: '',
            html: 
                `<div>
                    <h1>Для активации аккаунта перейдите по ссылке, 
                        затем запросите подтверждение у администратора:</h1>
                    <a href="${link}">${link}</a>
                </div>`
        }) 
    }

    async sendAdminConfirmationLink(to, link, confirmingEmail) {
        await this.transporter.sendMail({
            from: process.env.SMTP_USER,
            to,
            subject: `Подтверждение почты ${confirmingEmail} администратором`,
            text: '',
            html: 
                `<div>
                    <h1>Для подтверждения статуса администратора аккаунта пользователя ${confirmingEmail} перейдите по ссылке</h1>
                    <a href="${link}">${link}</a>
                </div>`
        })
    }
}

module.exports = new EmailService()