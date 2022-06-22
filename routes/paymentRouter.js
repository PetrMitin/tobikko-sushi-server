const {Router} = require('express')
const paymentController = require('../controllers/paymentController')
const authMiddleware = require('../middlewares/authMiddleware')
const paymentRouter = Router()

paymentRouter.post('/initialize', paymentController.initializePayment)

module.exports = paymentRouter