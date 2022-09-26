const nodemailer = require('nodemailer')
const bcrypt = require('bcryptjs')
const userModel = require('../model/usermodel')
const jwt = require('jsonwebtoken')
const { use } = require('express/lib/router')
let userUserName = ''
let userEmail = ''
let OTP = {}
//User registeration
const registerUser = (req, res) => {

    OTP = req.body.otpSchema
    let form = new userModel(req.body.userSchema)
    userModel.findOne({ Email: req.body.userSchema.Email }, (err, result) => {
        if (err) {
            res.send({ status: false, message: 'An error ocuured' })
        } else {
            if (result) {
                console.log(result)
                res.send({ status: false, message: 'Duplicate Email', duplicateEmail: true })
                console.log('duplicate Email')
            } else {
                userModel.findOne({ userName: req.body.userSchema.userName }, (err, result) => {
                    if (err) {
                        res.send({ status: false, message: 'An error ocuured' })
                    } else {
                        if (result) {
                            res.send({ status: false, message: 'Username Already Picked', })
                        } else {
                            form.save((err, result) => {

                                if (err) {
                                    res.send({ message: "An error happened while saving", status: false })
                                } else {
                                    let token = jwt.sign({ pass: result.Email }, process.env.SECRET, { expiresIn: '1h' })
                                    res.send({ message: 'Saved Succesfully', status: true, token: token })
                                    userEmail = result.Email
                                    userUserName = result.userName

                                }
                            })
                        }
                    }
                })
            }
        }
    })


}
///User Login
const authenticate = (req, res) => {
    OTP = req.body.otpSchema
    userModel.findOne({ userName: req.body.userSchema.username }, (err, result) => {
        if (err) {
            console.log(err)
            res.send({ message: "An error ocurred", status: false })
        } else {
            if (result) {
                result.validatePassword(req.body.userSchema.password, (err, same) => {
                    if (err) {
                        console.log(err)
                        res.send({ message: "An error ocurred", status: false })
                    } else {
                        if (same) {
                            if (result.tokenValidation) {
                                let token = jwt.sign({ pass: result.Email }, process.env.SECRET, { expiresIn: '7d' })
                                res.send({ message: "token verified", tokenverification: true, token: token })
                                userEmail = result.Email
                                userUserName = result.userName
                            } else {
                                res.send({ message: "token notverified", tokenverification: false, })
                                userEmail = result.Email
                                userUserName = result.userName
                            }
                        } else {
                            res.send({ message: "invalid Pasword", status: false })
                        }
                    }
                })
            } else {
                res.send({ message: "Invalid Crendtails", status: false })
            }
        }
    })

}
const message = (req, res) => {

    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'emeeylanr04@gmail.com',
            pass: process.env.GAPFE,
        }
    })
    var mailOptions = {
        from: 'Ec',
        to: `${userEmail}`,
        subject: "Ec  Email Verification",
        text: '',
        html: `<p text-align: center;>Your OTP code is </p>
                 <h1 style="color: red; text-align: center;">
                 <span>${OTP.one}</span>
                 <span>${OTP.two}</span>
                 <span>${OTP.three}</span>
                 <span>${OTP.four}</span>
                 </h1>`
    }
    transporter.sendMail(mailOptions, (err, result) => {
        if (err) {
            res.send({ message: 'email sent succesfully', status: true })
        } else {
            res.send({ message: 'email sent succesfully', status: true })
            console.log(result)
        }
    })
}

///user otp verification
let userVerifying = {}
const otpVerication = (req, res) => {

    if (Number(req.body.one) === OTP.one && Number(req.body.two) === OTP.two && Number(req.body.three) === OTP.three && Number(req.body.four) === OTP.four) {
        userModel.findOne({ userName: userUserName }, (err, result) => {
            if (err) {
                console.log(err)
            } else {
                if (result) {
                    userVerifying = result
                    userVerifying.tokenValidation = true
                    userModel.findOneAndUpdate({ userName: userUserName }, userVerifying, (err, result) => {
                        if (err) {

                            res.send({ message: 'Unable to verify user token', status: false })
                        } else {
                            res.send({ message: 'token verified', status: true })
                        }
                    })
                }
            }
        })
    } else {
        console.log('invalid otp')
    }

}

//Token verification 
const jwtTokenVerification = (req, res) => {
    let token = req.headers.authorization.split(" ")[1]
    // console.log(m)
    jwt.verify(token, process.env.SECRET, (err, result) => {
        if (err) {
            console.log(err)
        } else {
            userEmail = result.pass
            res.send({ message: 'Token Verified Succesfully', status: true })
        }
    })

}

//A controller for getting the user info
const userInfo = (req, res) => {
    userModel.findOne({ Email: userEmail }, (err, result) => {
        if (err) {
            console.log(err)
            res.send({ message: "an error ocuured", status: false })
        } else {
            res.send({ status: true, result: result })

        }
    })
}

///All user
let ecIdentifier = "EC_Certified_User"
const allUser = (req, res) => {
    userModel.find({ ecIdentifier: ecIdentifier }, (err, result) => {
        if (err) {
            console.log(err)
            res.send({ status: false, message: 'no user found' })
        } else {
            let user = result.filter((users, id) => users.Email !== userEmail)
            res.send({ status: true, result: user })

        }
    })
}



module.exports = { registerUser, authenticate, message, otpVerication, jwtTokenVerification, userInfo, allUser }