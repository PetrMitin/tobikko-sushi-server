const {Router} = require('express')
const userController = require('../controllers/userController')
const authMiddleware = require('../middlewares/authMiddleware')
const userRouter = Router()

userRouter.post('/login', userController.login)
userRouter.post('/registration', userController.registration)
userRouter.get('/confirm-email/:link', userController.confirmEmail)
userRouter.get('/confirm-admin/:link', userController.confirmAdmin)
userRouter.get('/refresh', userController.refresh)
userRouter.get('/logout', authMiddleware, userController.logout)
userRouter.delete('/:id', authMiddleware, userController.deleteUser)

module.exports = userRouter