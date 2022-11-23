const {Router} = require('express')
const discountController = require('../controllers/discountController')
const discountRouter = Router()
const authMiddleware = require('../middlewares/authMiddleware')

discountRouter.get('/is-active', discountController.getIsDiscountActive)
discountRouter.post('/set-is-active', authMiddleware, discountController.setIsDiscountActive)
discountRouter.get('/active-promotion', discountController.getActivePromotion)
discountRouter.post('/active-promotion', authMiddleware, discountController.setActivePromotion)

module.exports = discountRouter