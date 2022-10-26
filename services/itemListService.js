const { MenuItem } = require("../models/models")

class ItemListService {
     //append item to the end of list
     async appendItem(id) {
        const prevTailId = (await MenuItem.findOne({where: {next: 0}}))?.id || 0
        console.log(prevTailId)
        prevTailId && (await MenuItem.update({next: id}, {where: {id: prevTailId}}))
        await MenuItem.update({prev: prevTailId, next: 0}, {where: {id}, returning: true})

     }

     async deleteItemFromList(id) {
        const itemToDelete = await MenuItem.findOne({where: {id}})
        const prevId = itemToDelete.prev
        const nextId = itemToDelete.next
        if (prevId !== 0) {
            await MenuItem.update({next: nextId}, {where: {id: prevId}})
        }
        if (nextId !== 0) {
            await MenuItem.update({prev: prevId}, {where: {id: nextId}})
        }
     }
}

module.exports = new ItemListService()