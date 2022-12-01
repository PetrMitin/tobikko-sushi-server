const ApiError = require('../error/apiError')
const {Discount, Promotion} = require('../models/models')
const {DiscountService} = require('../services/discountService')

class DiscountController {
    async getActiveDiscount(req, res, next) {
        try {
            const activeDiscount = await Discount.findOne({where: {name: 'active'}})
            if (!activeDiscount) return next(ApiError.notFound())
            return res.json({...activeDiscount.dataValues})
        } catch(e) {
            next(ApiError.internal(e.message))
        }
    }

    async setActiveDiscount(req, res, next) {
        try {
            let oldRecord = await Discount.findOne({where: {name: 'active'}})
            let {multiplier} = req.body
            if (!multiplier) return next(ApiError.badRequest())
            if (!oldRecord) {
                oldRecord = await Discount.create({multiplier}, {returning: true})
            }
            await Discount.update({multiplier}, {where: {id: oldRecord.id}})
            return res.sendStatus(200)
        } catch(e) {
            next(ApiError.internal(e.message))
        }
    }

    async getActivePromotion(req, res, next) {
        try {
            const activePromotion = await Promotion.findOne()
            if (!activePromotion) return next(ApiError.notFound())
            return res.status(200).json({activePromotion})
        } catch(e) { 
            next(ApiError.internal(e.message))
        }
    }

    async setActivePromotion(req, res, next) {
        try {
            let {startDate, endDate, primaryText, secondaryText} = req.body
            console.log(JSON.stringify(req.body));
            if (!startDate || !endDate || !primaryText) return next(ApiError.badRequest())
            startDate = Date.parse(startDate)
            endDate = Date.parse(endDate)
            secondaryText = secondaryText ? secondaryText : ''
            await Promotion.destroy({truncate: true})
            await Promotion.create({startDate, endDate, primaryText, secondaryText})
            return res.sendStatus(201)
        } catch(e) {
            next(ApiError.internal(e.message))
        }
    }
}

module.exports = new DiscountController()