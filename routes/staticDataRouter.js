const {Router} = require('express')
const staticDataController = require('../controllers/staticDataController')
const authMiddleware = require('../middlewares/authMiddleware')

const staticDataRouter = Router()

staticDataRouter.get('/', staticDataController.getAllAboutUsParagraphs)
staticDataRouter.post('/', authMiddleware, staticDataController.createNewAboutUsParagraph)
staticDataRouter.put('/:id', authMiddleware, staticDataController.updateAboutUsParagraph)
staticDataRouter.put('/:id/increment', authMiddleware, staticDataController.incrementAboutUsParagraph)
staticDataRouter.put('/:id/decrement', authMiddleware, staticDataController.decrement, staticDataController.incrementAboutUsParagraph)
staticDataRouter.delete('/:id', authMiddleware, staticDataController.deleteAboutUsParagraph)
staticDataRouter.get('/images', staticDataController.getAboutUsImages)
staticDataRouter.post('/images', authMiddleware, staticDataController.addAboutUsImage)
staticDataRouter.delete('/images/:id', authMiddleware, staticDataController.deleteAboutUsImage)

module.exports = staticDataRouter