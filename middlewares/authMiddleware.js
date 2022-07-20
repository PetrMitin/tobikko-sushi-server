const ApiError = require("../error/apiError")
const TokenService = require("../services/tokenService")

module.exports = function(req, res, next) {
    try {
        const authHeader = req.headers.authorization
        console.log(authHeader);
        if (!authHeader) return next(ApiError.unauthorized('Unauthorized'))
        const accessToken = authHeader.split(' ')[1]
        console.log(accessToken);
        if (!accessToken) return next(ApiError.unauthorized('Unauthorized'))
        const userData = TokenService.validateAccessToken(accessToken)
        console.log(userData);
        if (userData instanceof ApiError || !userData.isConfirmedAdmin || !userData) {
            return next(ApiError.unauthorized('Unauthorized'))
        }
        req.user = userData
        next()
    } catch(e) {
        return next(ApiError.unauthorized('Unauthorized'))
    }
}