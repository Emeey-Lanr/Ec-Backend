const { Route } = require('express')
const express = require('express')
const route = express.Router()
const { registerUser,
    authenticate,
    message,
    otpVerication,
    jwtTokenVerification,
    userInfo,
    allUser,
    friendRequest,
    Notification,
    AceptFriendRequest,
    getMyFriend,
    uploadImage
} = require('../Controller/usercontroller')
route.post('/signup', registerUser)
route.post('/login', authenticate)

route.get('/message', message)
route.post('/otpVerifaction', otpVerication)
route.get('/jwtverification', jwtTokenVerification)
route.get('/userinfo', userInfo)
route.get('/allluser', allUser)
route.post('/friendRequest', friendRequest)
route.get('/notification', Notification)
route.post('/friendRequestAccepted', AceptFriendRequest)
route.get("/getMyFriend", getMyFriend)
route.post('/uploadImg', uploadImage)












module.exports = route