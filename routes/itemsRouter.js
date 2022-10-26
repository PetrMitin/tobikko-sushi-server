const {Router} = require('express')
const itemsController = require('../controllers/itemsController')
const itemsRouter = Router()
const authMiddleware = require('../middlewares/authMiddleware')

itemsRouter.get('/', itemsController.getAllItems)
itemsRouter.get('/:id', itemsController.getItemById)
itemsRouter.post('/', authMiddleware, itemsController.createItem)
itemsRouter.put('/:id', authMiddleware, itemsController.updateItem)
itemsRouter.put('/:id/increment', authMiddleware, itemsController.incrementItemPosition)
itemsRouter.put('/:id/decrement', authMiddleware, itemsController.decrement, itemsController.incrementItemPosition)
itemsRouter.delete('/:id', authMiddleware, itemsController.deleteItem)
itemsRouter.post('/:id/info', authMiddleware, itemsController.createItemInfo)
itemsRouter.delete('/:id/info/:infoId', authMiddleware, itemsController.deleteItemInfo)

module.exports = itemsRouter