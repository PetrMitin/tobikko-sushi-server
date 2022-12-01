const {Router} = require('express')
const discountController = require('../controllers/discountController')
const discountRouter = Router()
const authMiddleware = require('../middlewares/authMiddleware')

discountRouter.get('/get-active-discount', discountController.getActiveDiscount)
discountRouter.post('/set-active-discount', authMiddleware, discountController.setActiveDiscount)
discountRouter.get('/active-promotion', discountController.getActivePromotion)
discountRouter.post('/active-promotion', authMiddleware, discountController.setActivePromotion)

module.exports = discountRouter