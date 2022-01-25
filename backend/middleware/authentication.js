const jwt = require("jsonwebtoken")
const User = require("../app/models/user.model.js")

// validate token and fetch user
module.exports = async (req, res, next) => {
    try {
        let token = req.headers.authorization
        if (!token) {
            return res.status(403).json({
              success: false
            })
        }

        const { Id } = await jwt.verify(token, req.app.get("jwtstring"))
        if (!Id) {
            return res.status(403).json({
                success: false
            })
        }

        const user = await User.findById(Id)

        if(!user || user.length < 1) {
            return res.status(403).json({ success: false })
        }

        req.user = user[0]
        
        return next()
    }
    catch (err) {
        console.log(err)
        return res.status(401).json({
            success: false
        })
    }
}