const {MenuItemType} = require('../models/models')
const ApiError = require('../error/apiError')
const IDValidators = require('../validators/idValidators')

class TypeController {
    async getAllTypes(req, res, next) {
        try {
            const types = await MenuItemType.findAll()
            return res.json(types)
        } catch(e) {
            next(ApiError.internal(e.message))
        }
    }

    async getTypeById(req, res, next) {
        try {
            const id = req.params.id
            const type = await IDValidators.isTypeIdValid(id)
            if (!type) return next(ApiError.notFound('Not Found'))
            return res.json(type)
        } catch(e) {
            next(ApiError.internal(e.message))
        }
    }

    async createType(req, res, next) {
        try {
            const {name} = req.body
            if (!name) return next(ApiError.badRequest('No Name Specified'))
            const newType = await MenuItemType.create({name}, {returning: true})
            return res.status(201).json(newType)
        } catch(e) {
            next(ApiError.internal(e.message))
        }
    }

    async updateType(req, res, next) {
        try {
            const id = req.params.id
            const oldType = await IDValidators.isTypeIdValid(id)
            if (!oldType) return next(ApiError.badRequest('Invalid ID'))
            let {name} = req.body
            name = name ? name : oldType.name
            const [nAffected, newTypes] = await MenuItemType.update({name}, {where: {id}, returning: true})
            return res.json(newTypes[0])
        } catch(e) {
            next(ApiError.internal(e.message))
        }
    }

    async deleteType(req, res, next) {
        try {
            const id = req.params.id
            const oldType = await IDValidators.isTypeIdValid(id)
            if (!oldType) return next(ApiError.badRequest('Invalid ID'))
            await MenuItemType.destroy({where: {id}})
            return res.sendStatus(204)
        } catch(e) {
            next(ApiError.internal(e.message))
        }
    }
}

module.exports = new TypeController()