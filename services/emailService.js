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
        this.sendOrderToCustomer = this.sendOrderToCustomer.bind(this)
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

    async sendOrderToCustomer(orderData, to) {
        const deliveryPrice = parseInt(orderData?.deliveryRegion?.price || '0') || 0
        let totalPrice = deliveryPrice
        const menuItems = await paymentService.getMenuItemsByBasketItems(orderData.currentBasketItems)
        const discounts = orderData.discounts
        let totalMultiplier = 1
        discounts.forEach(discount => totalMultiplier *= discount.multiplier)
        await this.transporter.sendMail({
            from: process.env.SMTP_USER,
            to,
            subject: `Заказ TOBIKKO SUSHI`,
            text: '',
            html: 
                `<div>
                    <h1>Заказ от ${(new Date()).toLocaleTimeString('ru') + ' ' + (new Date()).toLocaleDateString('ru')}</h1>
                    <h3>Спасибо за заказ!</h3>
                    <p>В ближайшее время с Вами свяжется администратор для подтверждения и уточнения деталей</p>
                    <h4>Ваш заказ:</h4>
                    <table>
                    <thead>
                        <th>Название</th>
                        <th>Половина порции</th>
                        <th>Количество</th>
                        <th>Стоимость</th>
                        <th>Стоимость со скидками</th>
                        <th>Сумма</th>
                    </thead>
                    <tbody>
                        ${menuItems.map(menuItem => {
                            const basketItem = orderData.currentBasketItems.find(data => data.menuItemId === menuItem.id)
                            const amount = basketItem.amount || 0
                            const isHalfPortion = basketItem.isHalfPortion
                            if (amount === 0) return
                            const currentPrice = Math.ceil((isHalfPortion 
                                                ? amount * (menuItem.halfportionprice || 0) 
                                                : amount * menuItem.price) * totalMultiplier)
                            totalPrice += currentPrice
                            return `
                                <tr>
                                    <td>${menuItem.name}</td>
                                    <td>${isHalfPortion ? 'ДА' : 'НЕТ'}</td>
                                    <td>${amount}</td>
                                    <td>${isHalfPortion ? menuItem.halfportionprice : menuItem.price} р.</td>
                                    <td>${(isHalfPortion ? menuItem.halfportionprice : menuItem.price) * totalMultiplier} р.</td>
                                    <td>${(isHalfPortion ? menuItem.halfportionprice : menuItem.price) * totalMultiplier * amount} р.</td>
                                </tr>   
                            `}
                        ).join('\n')}
                    <tr>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td>Доставка: ${deliveryPrice} р.</td>
                    </tr>
                    <tr>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td>Итого: ${totalPrice} р.</td>
                    </tr>
                    </tbody>
                    </table>
                    <style>
                        h1 {
                            color: red;
                        }

                        td, th {
                            border: 1px solid black;
                            padding: 5px 10px;
                        }
                    </style>
                </div>`
        })
    }

    async sendOrderDataToAdmin(orderData, to) {
        const deliveryPrice = parseInt(orderData?.deliveryRegion?.price || '0') || 0
        let totalPrice = deliveryPrice
        const menuItems = await paymentService.getMenuItemsByBasketItems(orderData.currentBasketItems)
        const discounts = orderData.discounts
        let totalMultiplier = 1
        discounts.forEach(discount => totalMultiplier *= discount.multiplier)
        await this.transporter.sendMail({
            from: process.env.SMTP_USER,
            to,
            subject: `Новый заказ`,
            text: '',
            html: 
                `<div>
                    <h1>Заказ от ${(new Date()).toLocaleTimeString('ru') + ' ' + (new Date()).toLocaleDateString('ru')}</h1>
                    <br/>
                    <h3>Отправитель</h3>
                    <h3>Имя: ${orderData.name}</h3>
                    <h3>Телефон: ${orderData.phone}</h3>
                    <h3>Электронная почта: ${orderData.email}</h3> 
                    <h3>Количество персон: ${orderData.numberOfPerson}</h3> 
                    <br/>
                    <h3>Адрес доставки</h3>
                    <h3>Район: ${orderData.deliveryRegion.name}</h3>
                    <h3>Адрес: ${orderData.address}</h3>
                    <br/>
                    <h3>Способ оплаты: ${orderData.paymentMethod === 'courier' ? 'наличными курьеру' : 'онлайн'}</h3>
                    <h3>Скидки</h3>
                    <ul>
                        ${discounts.map(({name, multiplier}) => {
                            return `<li>Название: ${name}, скидка: ${Math.round((1 - multiplier)*100)}%</li>`
                        })}
                    </ul>
                    <br/>
                    <h3>Комментарий</h3>
                    <p>${orderData.comment}</p>
                    <br/>
                    <h3>Позиции меню: </h3>
                    <table>
                    <thead>
                        <th>Название</th>
                        <th>Половина порции</th>
                        <th>Количество</th>
                        <th>Стоимость</th>
                        <th>Стоимость со скидками</th>
                        <th>Сумма</th>
                    </thead>
                    <tbody>
                        ${menuItems.map(menuItem => {
                            const basketItem = orderData.currentBasketItems.find(data => data.menuItemId === menuItem.id)
                            const amount = basketItem.amount || 0
                            const isHalfPortion = basketItem.isHalfPortion
                            if (amount === 0) return
                            const currentPrice = Math.ceil((isHalfPortion 
                                                ? amount * (menuItem.halfportionprice || 0) 
                                                : amount * menuItem.price) * totalMultiplier)
                            totalPrice += currentPrice
                            return `
                                <tr>
                                    <td>${menuItem.name}</td>
                                    <td>${isHalfPortion ? 'ДА' : 'НЕТ'}</td>
                                    <td>${amount}</td>
                                    <td>${isHalfPortion ? menuItem.halfportionprice : menuItem.price} р.</td>
                                    <td>${(isHalfPortion ? menuItem.halfportionprice : menuItem.price) * totalMultiplier} р.</td>
                                    <td>${(isHalfPortion ? menuItem.halfportionprice : menuItem.price) * totalMultiplier * amount} р.</td>
                                </tr>   
                            `}
                        ).join('\n')}
                    <tr>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td>Доставка: ${deliveryPrice} р.</td>
                    </tr>
                    <tr>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td>Итого: ${totalPrice} р.</td>
                    </tr>
                    </tbody>
                    </table>
                    <style>
                        h1 {
                            color: red;
                        }

                        td, th {
                            border: 1px solid black;
                            padding: 5px 10px;
                        }
                    </style>
                </div>`
        })
    }
}

module.exports = new EmailService()