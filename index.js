require('dotenv').config()
const express = require('express')
const cors = require('cors')
const path = require('path')
const cookieParser = require('cookie-parser')
const sequelize = require('./db')
const models = require('./models/models')
const rootRouter = require('./routes/rootRouter')
const fileUpload = require('express-fileupload')
const errorHandlingMiddleware = require('./middlewares/errorHandlingMiddleware')

const app = express()

const PORT = process.env.PORT || 4000

app.use(cors())
app.use(express.json())
app.use(fileUpload({}))
app.use(cookieParser())
app.use(express.static(path.resolve(__dirname, 'static')))
app.use('/api', rootRouter)
app.use(errorHandlingMiddleware)

const start = async () => {
    try {
        await sequelize.authenticate()
        await sequelize.sync()
        app.listen(PORT, () => console.log(`Server is running on port ${PORT}`))
    } catch (e) {
        console.log(e)
    }
}

start()