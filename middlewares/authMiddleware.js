const ApiError = require("../error/apiError")
const TokenService = require("../services/tokenService")

module.exports = function(req, res, next) {
    try {
        const authHeader = req.headers.authorization
        if (!authHeader) return next(ApiError.unauthorized('Unauthorized'))
        const accessToken = authHeader.split(' ')[1]
        if (!accessToken) return next(ApiError.unauthorized('Unauthorized'))
        const userData = TokenService.validateAccessToken(accessToken)
        if (userData instanceof ApiError || !userData.isConfirmedAdmin || !userData) {
            return next(ApiError.unauthorized('Unauthorized'))
        }
        req.user = userData
        next()
    } catch(e) {
        return next(ApiError.unauthorized('Unauthorized'))
    }
}