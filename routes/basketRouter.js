const {Router} = require('express')
const basketController = require('../controllers/basketController')
const basketRouter = Router()
const authMiddleware = require('../middlewares/authMiddleware')

basketRouter.get('/:id', basketController.getBasketById)
basketRouter.post('/', basketController.createBasket)
basketRouter.put('/:id', basketController.updateBasket)
basketRouter.delete('/:id', basketController.deleteBasket)
basketRouter.get('/:id/items', basketController.getBasketItems)
basketRouter.post('/:id/items', basketController.createBasketItem)
basketRouter.delete('/:id/items/:basketItemId', basketController.deleteBasketItem)

module.exports = basketRouter