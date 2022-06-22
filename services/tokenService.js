const jwt = require('jsonwebtoken')
const ApiError = require('../error/apiError')
const {Token} = require('../models/models')

class TokenService {
    generateTokens(payload) {
        const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_SECRET, {expiresIn: '30m'})
        const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {expiresIn: '15d'})
        return {
            accessToken,
            refreshToken
        }
    }

    async saveToken(userId, refreshToken) {
        const oldToken = await Token.findOne({where: {userId}})
        if (oldToken) {
            const [nAffected, newTokens] = await Token.update({refreshToken}, {where: {id: oldToken.dataValues.id}, returning: true})
            return newTokens[0]
        }
        const newToken = await Token.create({userId, refreshToken})
        return newToken
    }

    validateAccessToken(token) {
        try {
            const userData = jwt.verify(token, process.env.JWT_ACCESS_SECRET)
            return userData
        } catch(e) {
            return ApiError.unauthorized('Invalid token')
        }
    }

    validateRefreshToken(token) {
        try {
            const userData = jwt.verify(token, process.env.JWT_REFRESH_SECRET)
            return userData
        } catch(e) {
            return ApiError.unauthorized('Invalid token')
        }
    }

    async findToken(refreshToken) {
        const token = await Token.findOne({where: {refreshToken}})
        return token?.dataValues
    }

    async removeToken(refreshToken) {
        await Token.destroy({where: {refreshToken}})
        return null
    }
}

module.exports = new TokenService()