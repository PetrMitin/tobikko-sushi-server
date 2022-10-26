const {MenuItem, TypeItem, MenuItemType, MenuItemInfo} = require('../models/models')
const ItemListService = require('../services/itemListService')
const ApiError = require('../error/apiError')
const IDValidators = require('../validators/idValidators')
const path = require('path')
const uuid = require('uuid')
const fs = require('fs')
const { deleteItemFromList, appendItem } = require('../services/itemListService')

class ItemsController {
    // GET /
    async getAllItems(req, res, next) {
        try {
            const items = await MenuItem.findAll({include: [
                {model: MenuItemInfo}, 
                {model: MenuItemType}
            ]})
            return res.json(items)
        } catch(e) {
            next(ApiError.internal(e.message))
        }
    }

    // GET /:id
    async getItemById(req, res, next) {
        try {
            const id = req.params.id
            const item = await IDValidators.isItemIdValid(id)
            console.log(item);
            if (!item) return next(ApiError.badRequest('Invalid ID'))
            return res.json(item)
        } catch(e) {
            next(ApiError.internal(e.message))
        }
    }

    // POST /
    async createItem(req, res, next) {
        try {
            //menuItemTypesId: array of typeId, info: array of {title, info}
            let {name, price, halfportionprice, halfportionmass, massInGramms, menuItemTypesId, info} = req.body
            const image = req.files?.image
            console.log(name, price, massInGramms, menuItemTypesId, info, image)
            console.log(req.files)
            if (!name || !price || !massInGramms || !image || !menuItemTypesId || !menuItemTypesId.length) {
                return next(ApiError.badRequest('Invalid data'))
            }
            info = info ? JSON.parse(info) : []
            menuItemTypesId = menuItemTypesId ? JSON.parse(menuItemTypesId) : []
            const imgFileName = uuid.v4() + path.extname(image.name)
            image.mv(path.resolve(__dirname, '..', 'static', imgFileName))
            const newItem = await MenuItem.create({
                name,
                price: parseFloat(price),
                halfportionprice: halfportionprice ? parseFloat(halfportionprice) : null,
                halfportionmass: halfportionmass ? parseFloat(halfportionmass) : parseFloat(massInGramms),
                massInGramms: parseFloat(massInGramms),
                image: imgFileName
            }, {returning: true})
            const itemTypes = await Promise.all(menuItemTypesId.map(async id => {
                const type = await IDValidators.isTypeIdValid(id)
                if (!type) return
                return await TypeItem.create({
                    menuItemId: newItem.id,
                    menuItemTypeId: id
                }, {returning: true})
            }))
            const infos = await Promise.all(info.map(async ({title, info}) => {
                                    if (!title || !info) return 
                                    const newInfo = await MenuItemInfo.create({title, info, menuItemId: newItem.id}, {returning: true})
                                    return newInfo
                                }))
            await ItemListService.appendItem(newItem.dataValues.id)
            return res.status(201).json({...newItem.dataValues, infos, itemTypes})
        } catch(e) {
            next(ApiError.internal(e.message))
        }
    }

    //PUT /:id
    async updateItem(req, res, next) {
        try {
            const id = req.params.id
            let oldItem = await IDValidators.isItemIdValid(id)
            if (!oldItem) return next(ApiError.badRequest('Invalid ID'))
            oldItem = oldItem.dataValues
            let {name, price, halfportionprice, halfportionmass, massInGramms, menuItemTypesId, info} = req.body
            const image = req.files?.image
            name = name ? name : oldItem.name
            price = price ? parseFloat(price) : oldItem.price
            halfportionprice = halfportionprice ? parseFloat(halfportionprice) : oldItem.halfportionprice
            halfportionmass = halfportionmass? parseFloat(halfportionmass) : oldItem.halfportionmass
            massInGramms = massInGramms ? parseFloat(massInGramms) : oldItem.massInGramms
            let imgFileName = oldItem.image
            if (image) {
                fs.unlink(path.resolve(__dirname, '..', 'static', oldItem.image), (err) => {
                    if(err instanceof Error) {
                        return
                    }
                })
                imgFileName = uuid.v4() + path.extname(image.name)
                image.mv(path.resolve(__dirname, '..', 'static', imgFileName))
            }
            info = info ? JSON.parse(info) : []
            menuItemTypesId = menuItemTypesId ? JSON.parse(menuItemTypesId) : []
            let itemTypes = []
            if (menuItemTypesId.length > 0) {
                await TypeItem.destroy({where: {menuItemId: oldItem.id}})
                itemTypes = await Promise.all(menuItemTypesId.map(async id => {
                    try {
                        const type = await IDValidators.isTypeIdValid(id)
                        if (!type) return
                        return (await TypeItem.create({
                            menuItemId: oldItem.id,
                            menuItemTypeId: id
                        })).dataValues
                    } catch(e) {
                        return 
                    }
                }))
            }
            let newInfos = []
            if (info.length > 0) {
                await MenuItemInfo.destroy({where: {menuItemId: oldItem.id}})
                newInfos = await Promise.all(info.map(async ({title, info}) => {
                    try {
                        if (!title || !info) return
                        return (await MenuItemInfo.create({title, info, menuItemId: oldItem.id})).dataValues
                    } catch(e) {
                        return
                    }
                }))
            }
            const [nAffected, newItems] = await MenuItem.update({
                name,
                price,
                halfportionprice,
                halfportionmass,
                massInGramms,
                image: imgFileName
            }, {where: {id}, returning: true})
            itemTypes = itemTypes.filter(elem => elem)
            const updatedItem = newItems[0].dataValues
            if (!updatedItem.prev && !updatedItem.next) {
                await ItemListService.appendItem(updatedItem.id)
            }
            return res.json({
                ...updatedItem, 
                infos: newInfos.filter(elem => elem), 
                itemTypes: itemTypes.length>0 ? itemTypes : oldItem.menu_item_types
            })
        } catch(e) {
            console.log(e);
            next(ApiError.internal(e.message))
        }
    }

    // PUT /:id/increment
    async incrementItemPosition(req, res, next) {
        try {
            const id = req.params.id
            let oldItem = await IDValidators.isItemIdValid(id)
            if (!oldItem) return next(ApiError.badRequest('Invalid ID'))
            if (!oldItem.next) return next(ApiError.badRequest("Cannot increment item at the end of the list"))
            const incId = oldItem.id
            const decId = oldItem.next
            const nextItem = await MenuItem.findByPk(decId)
            if (!nextItem) return next(ApiError.internal('Invalid next item ID'))
            let leftBoundaryId
            let rightBoundaryId
            if (!oldItem.prev && !nextItem.next) {
                leftBoundaryId = 0
                rightBoundaryId = 0
            } else if (!oldItem.prev) {
                leftBoundaryId = 0
                rightBoundaryId = nextItem.next
                await MenuItem.update({prev: incId}, {where: {id: rightBoundaryId}})
            } else if (!nextItem.next) {
                leftBoundaryId = oldItem.prev
                rightBoundaryId = 0
                await MenuItem.update({next: decId}, {where: {id: leftBoundaryId}})
            } else {
                leftBoundaryId = leftBoundaryId = oldItem.prev
                rightBoundaryId = nextItem.next
                await MenuItem.update({next: decId}, {where: {id: leftBoundaryId}})
                await MenuItem.update({prev: incId}, {where: {id: rightBoundaryId}})
            }
            console.log(leftBoundaryId, incId, decId, rightBoundaryId);
            await MenuItem.update({prev: decId, next: rightBoundaryId}, {where: {id: incId}})
            await MenuItem.update({prev: leftBoundaryId, next: incId}, {where: {id: decId}})
            res.status(201).json({message: 'Successfully updated order of items'})
        } catch(e) {
            console.log(e);
            next(ApiError.internal(e.message))
        }
    }

    // PUT /:id/decrement
    async decrement(req, res, next) {
        const id = req.params.id
        let oldItem = await IDValidators.isItemIdValid(id)
        if (!oldItem) return next(ApiError.badRequest('Invalid ID'))
        if (!oldItem.prev) return next(ApiError.badRequest("Cannot decrement item at the beginning of the list"))
        req.params.id = oldItem.prev
        next()
    }

    // DELETE /:id
    async deleteItem(req, res, next) {
        try {
            const id = req.params.id
            const oldItem = await IDValidators.isItemIdValid(id)
            if (!oldItem) return next(ApiError.badRequest('Invalid ID'))
            await ItemListService.deleteItemFromList(id)
            await MenuItem.destroy({where: {id}})
            return res.sendStatus(204)
        } catch(e) {
            next(ApiError.internal(e.message))
        }
    }

    // POST /:id/info/
    async createItemInfo(req, res, next) {
        try {
            const itemId = req.params.id
            const oldItem = await IDValidators.isItemIdValid(itemId)
            if (!oldItem) return next(ApiError.badRequest('Invalid ID'))
            const {title, info} = req.body
            if (!info) return next(ApiError.badRequest('Invalid Data'))
            const newInfo = await MenuItemInfo.create({menuItemId: itemId, title, info})
            return res.status(201).json({...oldItem.dataValues, 
                                        menu_item_infos: oldItem.dataValues.menu_item_infos.concat([newInfo])})
        } catch(e) {
            console.log(e);
            next(ApiError.internal(e.message))
        }
    }

    // DELETE /:id/info/:infoId
    async deleteItemInfo(req, res, next) {
        try {
            const itemId = req.params.id
            const oldItem = await IDValidators.isItemIdValid(itemId)
            if (!oldItem) return next(ApiError.badRequest('Invalid ID'))
            const infoId = req.params.infoId
            const info = await IDValidators.isItemInfoIdValid(infoId)
            if (!info) return next(ApiError.badRequest('Invalid ID'))
            await MenuItemInfo.destroy({where: {id: infoId}})
            return res.sendStatus(204)
        } catch(e) {
            next(ApiError.internal(e.message))
        }
    }
}  

module.exports = new ItemsController()