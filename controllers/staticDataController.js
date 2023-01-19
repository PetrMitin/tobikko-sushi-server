const ApiError = require('../error/apiError');
const { AboutUsParagraph } = require('../models/models');
const itemListService = require('../services/itemListService');
const staticDataService = require('../services/staticDataService.js')

class StaticDataController {
    async getAllAboutUsParagraphs(req, res, next) {
        try {
            const paragraphs = await staticDataService.getAllAboutUsParagraphs()
            return res.json(paragraphs)
        } catch(e) {
            return next(ApiError.internal())
        }
    }

    async createNewAboutUsParagraph(req, res, next) {
        try {
            const text = req.body.text
            if (!text) return next(ApiError.badRequest())
            const newParagraph = await staticDataService.createAboutUsParagraph(text)
            if(newParagraph instanceof ApiError) return next(newParagraph)
            return res.status(201).send({paragraph: newParagraph})
        } catch(e) {
            return next(ApiError.internal());
        }
    }

    async updateAboutUsParagraph(req, res, next) {
        try {
            const {text} = req.body
            const id = req.params.id
            if (!id || !text) return next(ApiError.badRequest())
            const newParagraph = await staticDataService.updateAboutUsParagraph(id, text)
            if(newParagraph instanceof ApiError) return next(newParagraph)
            return res.status(200).send({paragraph: newParagraph})
        } catch(e) {
            console.log(e);
            return next(ApiError.internal());
        }
    }

    async deleteAboutUsParagraph(req, res, next) {
        try {
            const id = req.params.id
            if (!id) return next(ApiError.badRequest())
            const newParagraph = await staticDataService.deleteAboutUsParagraph(id)
            if(newParagraph instanceof ApiError) return next(newParagraph)
            return res.sendStatus(204)
        } catch(e) {
            return next(ApiError.internal());
        }
    }

    async incrementAboutUsParagraph(req, res, next) {
        try {
            const id = req.params.id
            if (!id) return next(ApiError.badRequest())
            const newParagraph = await itemListService.incrementItemPosition(id, AboutUsParagraph)
            if(newParagraph instanceof ApiError) return next(newParagraph)
            return res.sendStatus(200)
        } catch(e) {
            return next(ApiError.internal());
        }
    }

    async decrement(req, res, next) {
        try {
            const id = req.params.id
            if (!id) return next(ApiError.badRequest('Invalid ID'))
            let oldItem = await AboutUsParagraph.findByPk(id)
            if (!oldItem) return next(ApiError.badRequest('Invalid ID'))
            if (!oldItem.prev) return next(ApiError.badRequest("Cannot decrement item at the beginning of the list"))
            req.params.id = oldItem.prev
            next()
        } catch(e) {
            console.log(e);
            return next(ApiError.internal());
        }
    }

    async getAboutUsImages(req, res, next) {
        try {
            const images = await staticDataService.getAboutUsImages()
            return res.json({images})
        } catch(e) {
            next(e)
        }
    }

    async addAboutUsImage(req, res, next) {
        try {
            const image = req.files?.image
            console.log(image);
            const filename = image?.name
            const buffer = image?.data
            const newImage = await staticDataService.addAboutUsImage(filename, buffer)
            if (newImage instanceof ApiError) return next(newImage)
            return res.status(201).json({image: newImage})
        } catch(e) {
            next(e)
        }
    }

    async deleteAboutUsImage(req, res, next) {
        try {
            const id = req.params.id
            const result = await staticDataService.deleteAboutUsImage(id)
            if (result instanceof ApiError) return next(result)
            return res.sendStatus(204)
        } catch(e) {
            next(e)
        }
    }
}

module.exports = new StaticDataController()