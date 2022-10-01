const { sendOrderDataToAdmin } = require("../services/emailService");

class PaymentController {
    initializePayment(req, res, next) {
        const {
            userId, 
            phone, 
            email, 
            name, 
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
            address,
            deliveryRegion, 
            paymentMethod, 
            currentBasketItems,
            discounts,
            comment
        }
        console.log(req.orderData);
        next()
    }

    //handles courier payment
    proceedCourierPayment(req, res, next) {
        try {
            if (req.orderData.paymentMethod !== 'courier') return next()
            sendOrderDataToAdmin(req.orderData, process.env.ADMIN_EMAIL)
            res.json({message: 'courier'})
        } catch(e) {
            console.log(e);
            next(ApiError.internal(e.message))
        }
    }

    //handles online payment proccess
    proceedOnlinePayment(req, res, next) {
        try {
            if (req.orderData.paymentMethod !== 'online') return next()
            sendOrderDataToAdmin(req.orderData, process.env.ADMIN_EMAIL)
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