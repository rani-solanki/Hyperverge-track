const {validationResult } = require('express-validator');
const User = require('../models/users');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require("config");

//@route  POST api/auth/login
//desc    user login
//access  private
const validations = (req) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return errors
    }
    else {
        return false
    }
}

exports.loginuser = async (req, res, next) => {   
     // Done validation 
    const error = validations(req);
    if (error) {
        next(error)
        return res.status(400).json({"validations error":error});
    }
    
    const { email, password } = req.body;
    try {
        let user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ errors: [{ msg: "invalid Email or passward" }] })
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) { return res.status(400).json({ errors: [{ msg: "invalid passward" }] }) }


        const payload = {
            user: {
                id: user._id
            }
        }

        jwt.sign(payload,
            config.jwtSecret,
            { expiresIn: 360000 }, (err, token) => {
                if (err) throw err;
                res.json({ token });
            });
    }
    catch (err) {
        console.log(err)
        return res.status(500).send('server error')
    }
}



