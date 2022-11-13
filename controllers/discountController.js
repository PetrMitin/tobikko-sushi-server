const {Discount} = require('../models/models')

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
}

module.exports = new DiscountController()