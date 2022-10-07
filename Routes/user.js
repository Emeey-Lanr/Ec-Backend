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
    readNotification,
    delFriendReqNotification,
    Notification,
    AceptFriendRequest,
    getMyFriend,
    uploadImage,
    AboutMe,
    deleteAccount
} = require('../Controller/usercontroller')
route.post('/signup', registerUser)
route.post('/login', authenticate)
route.get('/message', message)
route.post('/otpVerifaction', otpVerication)
route.get('/jwtverification', jwtTokenVerification)
route.get('/userinfo', userInfo)
route.get('/allluser', allUser)
route.post('/friendRequest', friendRequest)
route.post('/readNotification', readNotification)
route.post('/delFriendNotification', delFriendReqNotification)
route.get('/notification', Notification)
route.post('/friendRequestAccepted', AceptFriendRequest)
route.get("/getMyFriend", getMyFriend)
route.post('/uploadImg', uploadImage)
route.post('/aboutMe', AboutMe)
route.post("/deleteAccount", deleteAccount)












module.exports = route