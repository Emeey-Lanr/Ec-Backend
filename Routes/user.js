const express = require('express')
const route = express.Router()
const { registerUser, authenticate , message, otpVerication } = require('../Controller/usercontroller')
route.post('/signup', registerUser)
route.post('/login', authenticate)

route.get('/message', message)
route.post('/otpVerifaction', otpVerication)













module.exports = route