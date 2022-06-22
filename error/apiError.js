class ApiError extends Error {
    constructor(status, message) {
        super()
        this.status = status
        this.message = message
    }
    //400, 401, 403, 404, 500
    static badRequest(errMessage) {
        return new ApiError(400, errMessage)
    }

    static unauthorized(errMessage) {
        return new ApiError(401, errMessage)
    }

    static forbidden(errMessage) {
        return new ApiError(403, errMessage)
    }

    static notFound(errMessage) {
        return new ApiError(404, errMessage)
    }

    static internal(errMessage) {
        return new ApiError(500, errMessage)
    }
}

module.exports = ApiError