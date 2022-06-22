const {Basket, User, BasketItem, MenuItem} = require('../models/models')
const ApiError = require('../error/apiError')
const IDValidators = require('../validators/idValidators')

class BasketController {
    // GET /:id
    async getBasketById(req, res, next) {
        try {
            const id = req.params.id
            const basket = await IDValidators.isBasketIdValid(id)
            if (!basket) return next(ApiError.badRequest('Invalid id'))
            return res.json(basket)
        } catch(e) {
            next(ApiError.internal(e.message))
        }
    }

    // POST /
    async createBasket(req, res, next) {
        try {
            let {userId, isPaid} = req.body
            isPaid = isPaid ? isPaid : false
            const user = await IDValidators.isUserIdValid(userId)
            console.log(user);
            if (!user) return next(ApiError.badRequest('Invalid user id'))
            const basket = await Basket.create({
                userId,
                is_paid: isPaid
            }, {returning: true})
            return res.status(201).json(basket)
        } catch(e) {
            next(ApiError.internal(e.message))
        }
    }

    // PUT /:id
    async updateBasket(req, res, next) {
        try {
            const id = req.params.id
            let {isPaid} = req.body
            const oldBasket = await IDValidators.isBasketIdValid(id)
            if (!oldBasket) return next(ApiError.badRequest('Invalid id'))
            isPaid = typeof(isPaid) === 'boolean' ? isPaid : oldBasket.is_paid
            const [nAffected, newBasket] = await Basket.update({is_paid: isPaid}, {where: {id}, returning: true})
            return res.status(200).json(newBasket[0])
        } catch(e) {
            next(ApiError.internal(e.message))
        }
    }   

    // DELETE /:id
    async deleteBasket(req, res, next) {
        try {
            const id = req.params.id
            const basket = await IDValidators.isBasketIdValid(id)
            if (!basket) return next(ApiError.badRequest('Invalid id'))
            await Basket.destroy({where: {id}})
            await BasketItem.destroy({where: {basketId: id}})
            return res.sendStatus(204)
        } catch(e) {
            next(ApiError.internal(e.message))
        }
    }

    // GET /:id/items
    async getBasketItems(req, res, next) {
        try {
            const id = req.params.id
            const basket = await IDValidators.isBasketIdValid(id)
            if (!basket) return next(ApiError.badRequest('Invalid id'))
            const basketItemsLinks = await BasketItem.findAll({where: {basketId: basket.id}})
            const itemsList = await Promise.all(basketItemsLinks.map(async ({id, amount, basketId, menuItemId}) => {
                const item = await MenuItem.findOne({where: {id: menuItemId}})
                return {item: item.dataValues, basketItemId: id, amount, basketId}
            }))
            return res.json(itemsList)
        } catch(e) {
            next(ApiError.internal(e.message))
        }
    }

    //POST /:id/items
    async createBasketItem(req, res, next) {
        try {   
            const basketId = req.params.id
            const {itemId, amount} = req.body
            if (!basketId || !itemId || !amount) return next(ApiError.badRequest('Invalid Data'))
            const basket = await IDValidators.isBasketIdValid(basketId)
            if (!basket) return next(ApiError.notFound('Not Found'))
            const basketItem = await BasketItem.create({
                amount: parseInt(amount), 
                basketId: basketId, 
                menuItemId: itemId
            })
            return res.json(basketItem.dataValues)
        } catch(e) {
            next(ApiError.internal(e.message))
        }
    }

    //DELETE /:id/items/:basketItemId
    async deleteBasketItem(req, res, next) {
        try {
            const id = req.params.basketItemId
            const basketItem = await IDValidators.isBasketItemIdValid(id)
            if (!basketItem) return next(ApiError.badRequest('Invalid id'))
            await BasketItem.destroy({where: {id}})
            return res.sendStatus(204)
        } catch(e) {
            next(ApiError.internal(e.message))
        }
    }
}

module.exports = new BasketController()