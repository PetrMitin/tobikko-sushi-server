const { MenuItem } = require("../models/models")

class PaymentService {
    async getMenuItemsByBasketItems(basketItems) {
        const menuItems = Promise.all(basketItems.map(async basketItem => {
            try {
                const menuItemId = basketItem.menuItemId
                return (await MenuItem.findByPk(menuItemId)).dataValues
            } catch(e) {
                return
            }
        }))
        return (await menuItems).filter(elem => !!elem)
    }
}

module.exports = new PaymentService()