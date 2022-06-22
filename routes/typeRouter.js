const {Router} = require('express')
const typeController = require('../controllers/typeController')
const authMiddleware = require('../middlewares/authMiddleware')
const typeRouter = Router()

typeRouter.get('/', typeController.getAllTypes)
typeRouter.get('/:id', typeController.getTypeById)
typeRouter.post('/', authMiddleware, typeController.createType)
typeRouter.put('/:id', authMiddleware, typeController.updateType)
typeRouter.delete('/:id', authMiddleware, typeController.deleteType)

module.exports = typeRouter