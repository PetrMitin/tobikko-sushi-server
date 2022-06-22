class PaymentController {
    initializePayment(req, res, next) {
        res.json({message: "Poka net"})
    }
}

module.exports = new PaymentController()