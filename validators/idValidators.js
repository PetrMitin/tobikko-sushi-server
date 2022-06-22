const {
    User,
    Basket,
    BasketItem,
    MenuItem,
    MenuItemInfo,
    MenuItemType,
    TypeItem
} = require('../models/models')

class IDValidators {
    async isBasketIdValid(id) {
        try {
            if (!id) return false
            const basket = await Basket.findOne({where: {id}})
            if (!basket) return false
            return basket
        } catch(e) {
            return false
        }
    }

    async isItemIdValid(id) {
        try {
            if (!id) return false
            const item = await MenuItem.findOne({where: {id}, include: [
                {model: MenuItemInfo}, 
                {model: MenuItemType}
            ]})
            if (!item) return false
            return item
        } catch(e) {
            return false
        }
    }

    async isTypeIdValid(id) {
        try {
            if (!id) return false
            const type = await MenuItemType.findOne({where: {id}})
            if (!type) return false
            return type
        } catch(e) {
            return false
        }
    }

    async isUserIdValid(id) {
        try {
            if (!id) return false
            const user = await User.findOne({where: {id}})
            if (!user) return false
            return user
        } catch(e) {
            return false
        }
    }

    async isBasketItemIdValid(id) {
        try {
            if (!id) return false
            const basketItem = await BasketItem.findOne({where: {id}})
            if (!basketItem) return false
            return basketItem
        } catch(e) {
            return false
        }
    }

    async isItemInfoIdValid(id) {
        try {
            if (!id) return false
            const info = await MenuItemInfo.findOne({where: {id}})
            if (!info) return false
            return info
        } catch(e) {
            return false
        }
    }
}


module.exports = new IDValidators()