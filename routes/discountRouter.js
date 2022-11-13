const {Router} = require('express')
const discountController = require('../controllers/discountController')
const discountRouter = Router()
const authMiddleware = require('../middlewares/authMiddleware')

discountRouter.get('/is-active', discountController.getIsDiscountActive)
discountRouter.post('/set-is-active', authMiddleware, discountController.setIsDiscountActive)

module.exports = discountRouter