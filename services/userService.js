const ApiError = require("../error/apiError")
const { User, Basket } = require("../models/models")
const bcrypt = require('bcrypt')
const uuid = require('uuid')
const EmailService = require("./emailService")
const { generateTokens, saveToken } = require("./tokenService")
const TokenService = require("./tokenService")

class UserService {
    async registration(IPAddress, email=null, password=null, role='USER') {
        try {
            if (!IPAddress) throw new Error() 
            if (!email || !password || role === 'USER') { //Default user registration
                const oldUser = await User.findOne({where: {IP: IPAddress}, include: Basket})
                if (oldUser && oldUser.role === 'USER') {
                    return {user: oldUser.dataValues, basket: oldUser.basket}
                }
                let newUser = await User.create({
                    email: email ? email : null,
                    password: password ? password : null,
                    role: 'USER',
                    basketId: null,
                    IP: IPAddress,
                    userConfirmationLink: null,
                    adminConfirmationLink: null,
                    isConfirmedEmail: false,
                    isConfirmedAdmin: false
                }, {returning: true})
                newUser = newUser.dataValues
                let newBasket = await Basket.create({
                    userId: newUser.id
                })
                newBasket = newBasket.dataValues
                console.log(newUser.id, newBasket.id)
                const newBasketWithUser = await Basket.update({
                    userId: newUser.id
                }, {where: {id: newBasket.id}, returning: true})
                return {user: newUser, basket: newBasketWithUser[1][0]}
            } else if (email && password && role === 'ADMIN') { //Admin registration
                if (!String(email).match(/^\S+@\S+\.\S+$/)) return ApiError.badRequest('Invalid data')
                const oldUser = await User.findOne({where: {email}})
                if (oldUser) return ApiError.badRequest('Something went wrong...')
                const hashedPassword = await bcrypt.hash(password, 4)
                const userConfirmationLink = uuid.v4()
                const adminConfirmationLink = uuid.v4()
                const newAdmin = await User.create({
                    email,
                    password: hashedPassword,
                    role: 'ADMIN',
                    basketId: null,
                    IP: IPAddress,
                    userConfirmationLink,
                    adminConfirmationLink,
                    isConfirmedEmail: false,
                    isConfirmedAdmin: false
                })
                await EmailService.sendUserConfirmationLink(
                    email, 
                    `${process.env.API_URL}/api/user/confirm-email/${userConfirmationLink}`
                )
                await EmailService.sendAdminConfirmationLink(
                    process.env.ADMIN_EMAIL, 
                    `${process.env.API_URL}/api/user/confirm-admin/${adminConfirmationLink}`, 
                    email
                )
                const tokens = generateTokens({
                    email: newAdmin.email, 
                    role: newAdmin.role, 
                    isConfirmedAdmin: newAdmin.isConfirmedAdmin
                })
                await saveToken(newAdmin.id, tokens.refreshToken)
                return {...tokens, user: newAdmin}
            }
        } catch (e) {
            console.log(e)
            return ApiError.badRequest('Bad request')
        }
    }

    async login(IPAddress, email=null, password=null, role='USER') {
        try {
            if (role !== 'ADMIN') {
                const oldUser = await User.findOne({where: {IP: IPAddress}, include: Basket})
                if (oldUser && oldUser.role === 'USER') return {user: oldUser.dataValues}
                return ApiError.badRequest('No such user, try to registrate one')
            } else if (role === 'ADMIN') {
                if (!email || !password) return ApiError.badRequest('Missing data')
                const user = await User.findOne({where: {email}})
                if (!user) return ApiError.notFound('Not Found')
                const userData = user.dataValues
                const isValidPassword = await bcrypt.compare(password, userData.password)
                if (!isValidPassword) return ApiError.badRequest('Invalid Data')
                const tokens = generateTokens({
                    email: userData.email, 
                    role: userData.role, 
                    isConfirmedAdmin: userData.isConfirmedAdmin
                })
                await saveToken(userData.id, tokens.refreshToken)
                return {...tokens, user: userData}
            }
        } catch (e) {
            console.log(e)
            return ApiError.internal('Something went wrong...')
        } 
    }

    async logout(refreshToken) {
        try {
            await TokenService.removeToken(refreshToken)
            return null
        } catch (e) {
            console.log(e)
            return ApiError.internal('Something went wrong...')
        } 
    }

    async deleteUser(id) {
        try {
            await User.destroy({where: {id}})
            return null
        } catch (e) {
            console.log(e)
            return ApiError.badRequest('Bad request')
        }
    }

    async confirmEmail(confirmEmailLink) {
        try {
            const user = await User.findOne({where: {userConfirmationLink: confirmEmailLink}})
            if (!user) return ApiError.badRequest('Invalid link')
            const updatedUser = await User.update({
                isConfirmedEmail: true
            }, {where: {id: user.dataValues.id}, returning: true})
            return updatedUser[1][0]
        } catch (e) {
            return ApiError.badRequest('Bad request')
        }
    }

    async confirmAdmin(confirmAdminLink) {
        try {
            const user = await User.findOne({where: {adminConfirmationLink: confirmAdminLink}})
            if (!user) return ApiError.badRequest('Invalid link')
            const updatedUser = await User.update({
                isConfirmedAdmin: true
            }, {where: {id: user.dataValues.id}, returning: true})
            return updatedUser[1][0]
        } catch (e) {
            return ApiError.badRequest('Bad request')
        }
    }

    async refresh(refreshToken) {
        if (!refreshToken) return ApiError.unauthorized('Invalid token')
        const userData = TokenService.validateRefreshToken(refreshToken)
        const tokenFromDb = await TokenService.findToken(refreshToken)
        console.log(userData, tokenFromDb);
        if (!userData || !tokenFromDb) {
            return ApiError.unauthorized('Unauthorized')
        }
        const tokens = generateTokens({
            email: userData.email, 
            role: userData.role, 
            isConfirmedAdmin: userData.isConfirmedAdmin
        })
        const user = await User.findOne({where: {email: userData.email}})
        await saveToken(user.dataValues.id, tokens.refreshToken)
        return {...tokens, user: user.dataValues}
    }
}

module.exports = new UserService() 