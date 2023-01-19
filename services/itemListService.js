const { MenuItem } = require("../models/models")
const ApiError = require('../error/apiError')
const IDValidators = require('../validators/idValidators')

class ItemListService {
     //append item to the end of list
     async appendItem(id, Model=MenuItem) {
        const prevTailId = (await Model.findOne({where: {next: 0}}))?.id || 0
        console.log(prevTailId)
        prevTailId && (await Model.update({next: id}, {where: {id: prevTailId}}))
        await Model.update({prev: prevTailId, next: 0}, {where: {id}, returning: true})
     }

     async deleteItemFromList(id, Model=MenuItem) {
        const itemToDelete = await Model.findOne({where: {id}})
        const prevId = itemToDelete.prev
        const nextId = itemToDelete.next
        if (prevId !== 0) {
            await Model.update({next: nextId}, {where: {id: prevId}})
        }
        if (nextId !== 0) {
            await Model.update({prev: prevId}, {where: {id: nextId}})
        }
     }

     async incrementItemPosition(id, Model=MenuItem) {
            let oldItem = await Model.findByPk(id)
            if (!oldItem) return ApiError.badRequest('Invalid ID')
            if (!oldItem.next) return ApiError.badRequest("Cannot increment item at the end of the list")
            const incId = oldItem.id
            const decId = oldItem.next
            const nextItem = await Model.findByPk(decId)
            if (!nextItem) return next(ApiError.internal('Invalid next item ID'))
            let leftBoundaryId
            let rightBoundaryId
            if (!oldItem.prev && !nextItem.next) {
                leftBoundaryId = 0
                rightBoundaryId = 0
            } else if (!oldItem.prev) {
                leftBoundaryId = 0
                rightBoundaryId = nextItem.next
                await Model.update({prev: incId}, {where: {id: rightBoundaryId}})
            } else if (!nextItem.next) {
                leftBoundaryId = oldItem.prev
                rightBoundaryId = 0
                await Model.update({next: decId}, {where: {id: leftBoundaryId}})
            } else {
                leftBoundaryId = leftBoundaryId = oldItem.prev
                rightBoundaryId = nextItem.next
                await Model.update({next: decId}, {where: {id: leftBoundaryId}})
                await Model.update({prev: incId}, {where: {id: rightBoundaryId}})
            }
            await Model.update({prev: decId, next: rightBoundaryId}, {where: {id: incId}})
            await Model.update({prev: leftBoundaryId, next: incId}, {where: {id: decId}})
            return true
     }
}

module.exports = new ItemListService()