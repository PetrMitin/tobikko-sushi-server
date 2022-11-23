const ApiError = require('../error/apiError')
const {Discount, Promotion} = require('../models/models')
const {DiscountService} = require('../services/discountService')

class DiscountController {
    async getIsDiscountActive(req, res, next) {
        try {
            const isActive = (await Discount.findOne({where: {name: '20%'}}))?.active || false
            return res.json({isActive})
        } catch(e) {
            next(ApiError.internal(e.message))
        }
    }

    async setIsDiscountActive(req, res, next) {
        try {
            let oldRecord = await Discount.findOne({where: {name: '20%'}})
            if (!oldRecord) {
                oldRecord = await Discount.create({}, {returning: true})
            }
            const isActive = req.body.isActive
            await Discount.update({active: isActive}, {where: {id: oldRecord.id}})
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