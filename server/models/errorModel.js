const { error } = require("console");

class HttpError extends Error{
    constructor(message,errorCode){
        super(message);this.code =errorCode
    }
}

module.exports = HttpError;