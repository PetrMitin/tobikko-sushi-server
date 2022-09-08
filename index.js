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

app.options('*', cors({
    credentials: true,
    origin: process.env.CLIENT_URL
}))
app.use(cors({
    credentials: true,
    origin: process.env.CLIENT_URL
}))
app.all('*', (req, res, next) => {
    res.header("access-control-allow-origin", req.headers.origin)
    next()
})
app.use(express.json())
app.use(fileUpload({}))
app.use(cookieParser())
app.use(express.static(path.resolve(__dirname, 'static')))
app.use('/api', rootRouter)
app.use(errorHandlingMiddleware)
if(process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, '..', 'client', 'build')))
    app.get('/*', (req, res) => {
            res.sendFile(path.resolve(__dirname, '..', 'client', 'build', 'index.html'))
        })
}

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