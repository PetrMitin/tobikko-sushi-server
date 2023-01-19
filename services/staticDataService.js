const sharp = require('sharp')
const path = require('path')
const fs = require('fs')
const { AboutUsParagraph, AboutUsImage } = require("../models/models")
const ApiError = require('../error/apiError')
const itemListService = require("./itemListService")

class StaticDataService {
    async getAllAboutUsParagraphs() {
        const data = await AboutUsParagraph.findAll()
        return data.map(elem => elem.dataValues)
    }

    async createAboutUsParagraph(text) {
        const oldText = await AboutUsParagraph.findOne({where: {text}})
        console.log(text);
        if (oldText) return ApiError.badRequest()
        const newText = await AboutUsParagraph.create({text}, {returning: true})
        await itemListService.appendItem(newText.dataValues.id, AboutUsParagraph)
        return newText.dataValues
    }

    async updateAboutUsParagraph(id, text) {
        const oldText = await AboutUsParagraph.findByPk(id)
        if (!oldText) return ApiError.badRequest()
        const newText = await AboutUsParagraph.update({text}, {where: {id}, returning: true})
        return newText[1].dataValues
    }

    async deleteAboutUsParagraph(id) {
        const oldText = await AboutUsParagraph.findByPk(id)
        if (!oldText) return ApiError.badRequest()
        await itemListService.deleteItemFromList(id, AboutUsParagraph)
        await AboutUsParagraph.destroy({where: {id}})
        return true
    }

    async getAboutUsImages() {
        const images = await AboutUsImage.findAll()
        return images.map(imageData => imageData.dataValues)
    }

    async addAboutUsImage(filename, imgBuffer) {
        if (!filename || !imgBuffer) return ApiError.badRequest()
        const ext = path.extname(filename)
        if (!ext) return ApiError.badRequest()
        console.log(ext, filename);
        const uniqueFilename = `${(new Date()).valueOf()}-${filename}`
        if (ext === '.jpeg' || ext === '.jpg') {
            await sharp(imgBuffer).jpeg({quality: 60}).withMetadata().toFile(path.resolve(__dirname, '..', 'static', uniqueFilename))
        } else if (ext === '.png') {
            await sharp(imgBuffer).png({compressionLevel: 7}).withMetadata().toFile(path.resolve(__dirname, '..', 'static', uniqueFilename))
        } else {
            return ApiError.badRequest('Invalid file extension')
        }
        const newImage = await AboutUsImage.create({filename: uniqueFilename}, {returning: true})
        return newImage.dataValues
    }

    async deleteAboutUsImage(id) {
        if (!id) return ApiError.badRequest()
        const oldImgData = (await AboutUsImage.findByPk(id)).dataValues
        if (!oldImgData) return ApiError.badRequest()
        fs.unlink(path.resolve(__dirname, '..', 'static', oldImgData.filename), (err) => {
            console.log(err);
        })
        await AboutUsImage.destroy({where: {id}})
        return true
    }
}

module.exports = new StaticDataService()