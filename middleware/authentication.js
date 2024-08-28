const jwt = require('jsonwebtoken');

module.exports = {
    tokenValid: async (req, res, next) => {
        const token = req.headers.authorization
        jwt.verify(token, process.env.JWT_KEY, async (err, user) => {
            if(err) {
                return res.send({success: false, message: "Bad token."})
            } else {
                req.user = user
                next()
            }
        })
    }
}