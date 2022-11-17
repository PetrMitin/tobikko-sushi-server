require('dotenv').config()
const https = require('https')
const fs = require('fs')
const privateKey = fs.readFileSync('./ssl/key.pem')
const certificate = fs.readFileSync('./ssl/cert.pem')
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
const httpApp = express()

const PORT = process.env.PORT || 4000
const HTTPS_PORT = process.env.HTTPS_PORT || 443

httpApp.all('*', (req, res, next) => {
    res.redirect('https://' + req.headers.host + req.url)
})

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
        httpApp.listen(PORT, () => {console.log(`HTTP app is running on port ${PORT}`)})
        https.createServer({
            key: privateKey,
            cert: certificate
        }, app).listen(HTTPS_PORT, () => {console.log(`HTTPS server is running on port ${HTTPS_PORT}`)})
    } catch (e) {
        console.log(e)
    }
}

start()