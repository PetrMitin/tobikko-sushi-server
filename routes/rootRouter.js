const {Router} = require('express')
const router = new Router()
const userRouter = require('./userRouter')
const itemsRouter = require('./itemsRouter')
const basketRouter = require('./basketRouter')
const typeRouter = require('./typeRouter')
const paymentRouter = require('./paymentRouter')
const discountRouter = require('./discountRouter')
const staticDataRouter = require('./staticDataRouter')

router.use('/user', userRouter)
router.use('/items', itemsRouter)
router.use('/basket', basketRouter)
router.use('/type', typeRouter)
router.use('/payment', paymentRouter)
router.use('/discount', discountRouter)
router.use('/static-data', staticDataRouter)

module.exports = router