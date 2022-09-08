const ApiError = require('../error/apiError')
const { User } = require('../models/models')
const TokenService = require('../services/tokenService')
const UserService = require('../services/userService')
const idValidators = require('../validators/idValidators')

class UserController {
    async registration(req, res, next) {
        try {
            const IP = req.ip
            const {email, password, role} = req.body
            // console.log(`body: ${JSON.stringify(req.body)}`);
            const registrationResult = await UserService.registration(IP, email, password, role)
            if (registrationResult instanceof ApiError) return next(registrationResult)
            if (registrationResult.user.role === 'ADMIN') {
                // console.log(registrationResult.user)
                res.cookie('refreshToken', registrationResult.refreshToken, {maxAge: 15*24*60*60*1000, httpOnly: true})
            }
            return res.status(201).json(registrationResult)
        } catch(e) {
            return next(ApiError.internal('Something went wrong...'))
        }
    }

    async login(req, res, next) {
        try {
            const IPAddress = req.ip
            // console.log(`body: ${JSON.stringify(req.body)}`);
            const {email, password, role} = req.body
            const loginResults = await UserService.login(IPAddress, email, password, role)
            if (loginResults instanceof ApiError) return next(loginResults)
            if (loginResults.user.role === 'ADMIN') {
                res.cookie('refreshToken', loginResults.refreshToken, {maxAge: 15*24*60*60*1000, httpOnly: true})
            }
            return res.json(loginResults)
        } catch (e) {
            return next(ApiError.internal('Something went wrong...'))
        }
    }

    async logout(req, res, next) {
        try {
            const {refreshToken} = req.cookies
            // console.log(refreshToken);
            await UserService.logout(refreshToken)
            res.clearCookie('refreshToken')
            return res.sendStatus(200)
        } catch (e) {
            return next(ApiError.internal('Something went wrong...'))
        }
    }

    async confirmEmail(req, res, next) {
        try {
            const link = req.params.link
            const confirmResults = await UserService.confirmEmail(link)
            if (confirmResults instanceof ApiError) return next(confirmResults)
            return res.send('Адрес электронной почты подтвержден. Можете закрыть эту страницу.')
        } catch (e) {
            return next(ApiError.internal('Something went wrong...'))
        }
    }

    async confirmAdmin(req, res, next) {
        try {
            const link = req.params.link
            const confirmResults = await UserService.confirmAdmin(link)
            if (confirmResults instanceof ApiError) return next(confirmResults)
            return res.json('Адрес электронной почты пользователя подтвержден. Можете закрыть эту страницу.')
        } catch (e) {
            return next(ApiError.internal('Something went wrong...'))
        }
    }

    async refresh(req, res, next) {
        try {
            const refreshToken = req.cookies?.refreshToken
            console.log(refreshToken, req.cookies);
            const newTokens = await UserService.refresh(refreshToken)
            if (newTokens instanceof ApiError) return next(newTokens)
            res.cookie('refreshToken', newTokens.refreshToken, {maxAge: 15*24*60*60*1000, httpOnly: true})
            return res.json(newTokens)
        } catch (e) {
            console.log(e)
            return next(ApiError.internal('Something went wrong...'))
        }
    }

    async deleteUser(req, res, next) {
        try {
            const id = req.params.id
            const oldUser = await idValidators.isUserIdValid(id)
            if (!oldUser) return next(ApiError.badRequest('Invalid ID'))
            const deletionResult = await UserService.deleteUser(id)
            if (deletionResult instanceof ApiError) return next(ApiError.badRequest('Invalid data'))
            return res.sendStatus(204)
        } catch(e) {
            console.log(e)
            return next(ApiError.internal('Something went wrong...'))
        }
    }
}

module.exports = new UserController()