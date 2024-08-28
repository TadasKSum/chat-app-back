
module.exports = {
    registerValid: (req, res, next) => {
        const {username, nickname, passOne, passTwo} = req.body;
        let regex = /[!@#$%^&*_+]/

        if (username.length < 4 || username.length > 20) {
            return res.status(400).send({ success: false, message: "Username length must be between 4 and 20 symbols" });
        }
        if (nickname.length < 4 || nickname.length > 20) {
            return res.status(400).send({ success: false, message: "Display name length must be between 4 and 20 symbols" });
        }
        if (passOne.length < 5 || passOne.length > 20) {
            return res.status(400).send({ success: false, message: "Password length must be between 4 and 20 symbols" });
        }
        if (!regex.test(passOne)) {
            return res.status(400).send({ success: false, message: "Password must include at least one of following symbols: !@#$%^&*_+" })
        }
        if (passOne !== passTwo) {
            return res.status(400).send({ success: false, message: "Submitted passwords don't match" });
        }
        next()
    },
    loginValid: (req, res, next) => {
        const {username, password} = req.body;
        let regex = /[!@#$%^&*_+]/
        if (username.length < 4 || username.length > 20) {
            return res.status(400).send({ success: false, message: "Username length must be between 4 and 20 symbols" });
        }
        if (password.length < 5 || password.length > 20) {
            return res.status(400).send({ success: false, message: "Password length must be between 4 and 20 symbols" });
        }
        if (!regex.test(password)) {
            return res.status(400).send({ success: false, message: "Password must include at least one of following symbols: !@#$%^&*_+" })
        }
        next()
    },
    changePassValid: (req, res, next) => {
        const {passOne, passTwo} = req.body;
        let regex = /[!@#$%^&*_+]/

        if (passTwo.length < 5 || passTwo.length > 20) {
            return res.status(400).send({ success: false, message: "Password length must be between 4 and 20 symbols" });
        }
        if (!regex.test(passOne)) {
            return res.status(400).send({ success: false, message: "Password must include at least one of following symbols: !@#$%^&*_+" })
        }
        if (passOne !== passTwo) {
            return res.status(400).send({ success: false, message: "Submitted passwords don't match" });
        }
        next()
    }
}