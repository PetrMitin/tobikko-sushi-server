const { sendOrderDataToAdmin, sendOrderToCustomer } = require("../services/emailService");
const ApiError = require('../error/apiError')

class PaymentController {
    initializePayment(req, res, next) {
        const {
            userId, 
            phone, 
            email, 
            name, 
            numberOfPeople,
            address,
            deliveryRegion, 
            paymentMethod, 
            currentBasketItems,
            discounts,
            comment
        } = req.body
        req.orderData = {
            userId, 
            phone, 
            email, 
            name, 
            numberOfPeople,
            address,
            deliveryRegion, 
            paymentMethod, 
            currentBasketItems,
            discounts,
            comment
        }
        console.log('order data');
        console.log(req.orderData);
        next()
    }

    //handles courier payment
    async proceedCourierPayment(req, res, next) {
        try {
            console.log('here');
            if (req.orderData.paymentMethod !== 'courier') return next()
            await sendOrderDataToAdmin(req.orderData, process.env.ADMIN_EMAIL)
            await sendOrderToCustomer(req.orderData, req.orderData.email)
            res.json({message: 'courier'})
        } catch(e) {
            console.log(e);
            next(ApiError.internal(e.message))
        }
    }

    //handles online payment proccess
    async proceedOnlinePayment(req, res, next) {
        try {
            if (req.orderData.paymentMethod !== 'online') return next()
            await sendOrderDataToAdmin(req.orderData, process.env.ADMIN_EMAIL)
            await sendOrderToCustomer(req.orderData, req.orderData.email)
            res.json({message: 'online'})
        } catch(e) {
            console.log(e);
            next(ApiError.internal(e.message))
        }
    }

    //updates user data according to client-sent data
    handleUserData(req, res, next) {
        try {  
            next()
        } catch(e) {
            next(ApiError.internal(e.message))
        }
    }
}

module.exports = new PaymentController()