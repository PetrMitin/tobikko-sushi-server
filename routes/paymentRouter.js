const {Router} = require('express')
const paymentController = require('../controllers/paymentController')
const authMiddleware = require('../middlewares/authMiddleware')
const paymentRouter = Router()

paymentRouter.post('/initialize', paymentController.initializePayment, paymentController.proceedCourierPayment, paymentController.proceedOnlinePayment, paymentController.handleUserData)

module.exports = paymentRouter