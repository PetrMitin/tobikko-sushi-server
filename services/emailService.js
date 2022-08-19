const nodemailer = require('nodemailer')
const paymentService = require('./paymentService')

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
        this.sendOrderDataToAdmin = this.sendOrderDataToAdmin.bind(this)
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

    async sendOrderDataToAdmin(orderData, to) {
        const deliveryPrice = parseInt(orderData?.deliveryRegion?.price || '0') || 0
        let totalPrice = deliveryPrice
        const menuItems = await paymentService.getMenuItemsByBasketItems(orderData.currentBasketItems)
        console.log(menuItems);
        await this.transporter.sendMail({
            from: process.env.SMTP_USER,
            to,
            subject: `Новый заказ`,
            text: '',
            html: 
                `<div>
                    <h1>Заказ от ${orderData.name}</h1>
                    <h3>Телефон: ${orderData.phone}</h3>
                    <h3>Электронная почта: ${orderData.email}</h3> 
                    <h3>Адрес: ${orderData.address}</h3>
                    <h3>Способ оплаты: ${orderData.paymentMethod === 'courier' ? 'курьеру' : 'онлайн'}</h3>
                    <h3>Позиции меню: </h3>
                    <ul>
                        ${menuItems.map(menuItem => {
                            const amount = orderData.currentBasketItems.find(data => data.menuItemId === menuItem.id).amount || 0
                            if (amount === 0) return
                            totalPrice += amount * menuItem.price
                            return `<li>
                                <ul>
                                    <li>Наименование: ${menuItem.name}</li>
                                    <li>Цена: ${menuItem.price} р.</li>
                                    <li>Количество: ${orderData.currentBasketItems.find(data => data.menuItemId === menuItem.id).amount || 0}</li>
                                </ul>
                                <br/>    
                            </li>`}
                        ).join('\n')}
                    </ul>
                    <h3>Доставка: ${deliveryPrice} р.</h3>
                    <h3>Сумма: ${totalPrice} р.</h3>
                    <h3>Комментарий</h3>
                    <p>${orderData.comment}</p>
                </div>`
        })
    }
}

module.exports = new EmailService()