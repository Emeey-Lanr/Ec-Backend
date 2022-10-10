const nodemailer = require('nodemailer')
const bcrypt = require('bcryptjs')
const userModel = require('../model/usermodel')
const jwt = require('jsonwebtoken')
const { use } = require('express/lib/router')
const { status } = require('express/lib/response')
const cloudinary = require("cloudinary")
const { request } = require('express')
require('dotenv').config()
cloudinary.config({
    cloud_name: process.env.CLOUDNAME,
    api_key: process.env.APIKEY,
    api_secret: process.env.APISECRET,
});

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
                res.send({ status: false, message: 'Duplicate Email', duplicateEmail: true })
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
            res.send({ message: "An error ocurred", status: false })
        } else {
            if (result) {
                result.validatePassword(req.body.userSchema.password, (err, same) => {
                    if (err) {
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
                res.send({ status: false })
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
            res.send({ status: false })
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
            res.send({ message: "an error ocuured", status: false })
        } else {
            res.send({ status: true, result: result })

        }
    })
}

///All user
let friendSuggested = []
let ecIdentifier = "EC_Certified_User"
let userToFInd = []
let pending = []
let accepted = []
const allUser = (req, res) => {
    userModel.find({ ecIdentifier: ecIdentifier }, (err, result) => {
        if (err) {
            res.send({ status: false, message: 'no user found' })
        } else {
            userToFInd = result.filter((users, id) => users.Email !== userEmail)

            userModel.findOne({ Email: userEmail }, (err, result) => {

                if (err) {
                    res.send({ status: false })
                } else {
                    accepted = result.friendList.filter((user, id) => user.status === true)
                    pending = result.friendList.filter((user, id) => user.status === false)
                    accepted.map((status, id) => {
                        userToFInd.map((user, id) => {
                            if (user.userName === status.userName) {
                                user.status = 'a'
                            }
                        })
                    })

                    pending.map((status, id) => {
                        userToFInd.map((user, id) => {
                            if (user.userName === status.userName) {
                                user.status = 'b'
                            }
                        })
                    })

                    res.send({ status: true, result: userToFInd })
                }
            })


        }
    })
}
//Notification  
let notificationNumber = 0;
const Notification = (req, res) => {
    userModel.findOne({ Email: userEmail }, (err, result) => {
        if (err) {
            res.send({ status: false })
        } else {

            notificationNumber = result.notificationNumber[0]
            let notification = result.notification
            console.log(notification)
            res.send({ info: notification, notificationpoints: notificationNumber })
        }
    })
}

//Friend Request 
let lovedFriend = {}
let friendUwantToBeHisFriend = {}
const friendRequest = (req, res) => {
    userModel.findOne({ _id: req.body.moreinfo.userId }, (err, result) => {
        if (err) {
            console.log(err)
        } else {
            lovedFriend = result
            friendUwantToBeHisFriend = {
                Email: result.Email,
                userName: result.userName,
                imgURL: result.imgURL,
                aboutMe: result.aboutMe,
                status: false,
            }
            userModel.findOne({ Email: userEmail }, (err, result) => {
                let user = result
                user.friendList.push(friendUwantToBeHisFriend)
                userModel.findOneAndUpdate({ Email: userEmail }, user, (err, result) => {
                    if (err) {
                        console.log(err)
                    } else {
                        lovedFriend.notificationNumber[0] = lovedFriend.notificationNumber[0] + 1
                        lovedFriend.notification.push(req.body.notificationSent)
                        userModel.findOneAndUpdate({ _id: req.body.moreinfo.userId }, lovedFriend, (err) => {
                            if (err) {
                                console.log(err)
                                res.send({ status: false })
                            } else {
                                res.send({ status: true })
                            }
                        })
                    }
                })
            })
        }

    })
}


const readNotification = (req, res) => {
    userModel.findOne({ Email: userEmail }, (err, result) => {
        if (err) {
            res.send({ status: false })
        } else {
            result.notificationNumber[0] = 0
            userModel.findOneAndUpdate({ Email: userEmail }, result, (err) => {
                if (err) {
                    res.send({ status: false })

                } else {
                    res.send({ status: true })
                }
            })
        }
    })
}

//Accepting Friend Request 
let thefriendRequesting;
let user = {}
let userFriendId = 0;
const AceptFriendRequest = (req, res) => {
    ///We looked for the user the sent a friend request
    userModel.findOne({ userName: req.body.theAcceptedFriend.name }, (err, result) => {
        if (err) {

            res.send({ status: false })
        } else {
            thefriendRequesting = result
            //the user info is to be push into the person he has sent a friend request to friendlisty
            friendUwantToBeHisFriend = {
                Email: result.Email,
                userName: result.userName,
                imgURL: result.imgURL,
                aboutMe: result.aboutMe,
                status: true,
            }
            ///Looking for the id for the person he has sent a friend request to to
            //change the status to true, meaning it has been accepted
            thefriendRequesting.friendList.map((user, id) => {
                if (user.userName === req.body.theAcceptedFriend.userRequestingTo) {
                    userFriendId = id
                }
            })
            thefriendRequesting.friendList[userFriendId].status = true

            ///It shows the he has a notification
            thefriendRequesting.notificationNumber[0] = thefriendRequesting.notificationNumber[0] + 1
            ///A notification is pushed that the friend request has been accepted
            thefriendRequesting.notification.push(req.body.notificationSent)

            userModel.findOneAndUpdate({ userName: req.body.theAcceptedFriend.name }, thefriendRequesting, (err) => {
                if (err) {
                    consoel.log("failed")
                } else {
                    console.log('success')
                }
            })

            userModel.findOne({ Email: userEmail }, (err, result) => {
                if (err) {
                    res.send({ status: false })
                } else {
                    user = result
                    let notifiactionAtUserId;
                    user.notification.map((ui, ud) => {
                        if (ui.name === thefriendRequesting.userName) {
                            notifiactionAtUserId = ud
                        }
                    })
                    let thatnotification = user.notification[notifiactionAtUserId]
                    thatnotification.status = true
                    user.notification[notifiactionAtUserId] = thatnotification

                    user.friendList.push(friendUwantToBeHisFriend)
                    userModel.findOneAndUpdate({ Email: userEmail }, user, (err) => {
                        if (err) {
                            res.send({ status: false })
                        } else {
                            res.send({ status: true })
                        }

                    })
                }
            })
        }
    })
}

////Delete Friend Request Notification
const delFriendReqNotification = (req, res) => {
    console.log(req.body.name)
    userModel.findOne({ Email: userEmail }, (err, result) => {
        if (err) {
            res.send({ status: false })
        } else {
            let theRest = result.notification.filter((notifications, id) => notifications.name !== req.body.name)
            result.notification = theRest
            userModel.findOneAndUpdate({ Email: userEmail }, result, (err) => {
                if (err) {

                    res.send({ status: false })
                } else {
                    res.send({ status: true })

                }
            })


        }
    })
}

////Friend get 
let check = false
let myRealFriend = [{ userName: "check" }]
let myFriend = [

]
const getMyFriend = (req, res) => {
    myRealFriend = [{ userName: "check" }]
    userModel.findOne({ Email: userEmail }, (err, result) => {
        if (err) {
            res.send({ status: false })
        } else {
            myFriend = result.friendList.filter((friend, id) => friend.status === true)
            userModel.find({ ecIdentifier: ecIdentifier }, (err, result) => {
                if (err) {
                    console.log(err)
                } else {
                    console.log(result)
                    myFriend.map((users, myId) => {
                        result.map((user, userId) => {
                            if (user.userName == users.userName) {
                                console.log(user, "yessss")
                                myFriend.map((check, checkId) => {
                                    if (check.userName === user.userName) {
                                        check = true
                                    }
                                })
                                if (check) {
                                    console.log("user already exist")
                                } else {
                                    myRealFriend.push(user)
                                }
                            }

                        })
                    })
                    myRealFriend = myRealFriend.filter((user, id) => id !== 0)
                    res.send({ myFriend: myRealFriend, status: true })
                }
            })


        }
    })
}
const uploadImage = (req, res) => {
    cloudinary.v2.uploader.upload(req.body.imgUrl, { public_id: "user_img" }, (err, cresult) => {
        if (err) {
            console.log(err)
        } else {
            userModel.findOne({ Email: userEmail }, (err, result) => {
                result.imgURL = cresult.url
                userModel.findOneAndUpdate({ Email: userEmail }, result, (err) => {
                    if (err) {
                        res.send({ status: false })
                    } else {
                        res.send({ status: true, imgURL: cresult.url })

                    }
                })
            })

        }
    })
}

///Update About me words

const AboutMe = (req, res) => {
    userModel.findOne({ Email: userEmail }, (err, result) => {
        if (err) {
            console.log(err)
        } else {
            result.aboutMe = req.body.aboutMe
            userModel.findOneAndUpdate({ Email: userEmail }, result, (err) => {
                if (err) {
                    console.log(err)
                } else {
                    console.log("about me updated succesfully")
                    res.send({ status: true })
                }
            })
        }
    })
}


///deleting Account
const deleteAccount = (req, res) => {
    console.log(req.body.password)
    userModel.findOne({ Email: userEmail }, (err, result) => {
        if (err) {
            console.log(err)
        } else {
            result.validateDelete(req.body.password, (err, same) => {
                if (same) {
                    userModel.findOneAndDelete({ Email: userEmail }, (err) => {
                        if (err) {
                            res.send({ status: false, message: "An error occured" })
                        } else {
                            res.send({ status: true, message: "Deleted Succesfully" })
                        }
                    })
                } else {
                    res.send({ status: false, message: "Invalid Password" })
                }


            })
        }
    })

}
const sendMeMessage = (req, res) => {
    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'emeeylanr04@gmail.com',
            pass: process.env.GAPFE,
        }
    })
    var mailOptions = {
        from: 'Ec',
        to: `emeeylanr04@gmail.com`,
        subject: "EC Explorer Feed back",
        text: '',
        html: `<h1 style="color: #acd4ff; text-align: center;">${req.body.name}</h1>
        <p style="color: #868686; border:2px solid #868686; width:80%; margin:0 auto;">
        ${req.body.message}
        </p>
                `
    }
    transporter.sendMail(mailOptions, (err, result) => {
        if (err) {
            res.send({ message: 'message not sent succesfully', status: false })
        } else {
            res.send({ message: 'message sent succesfully', status: true })

        }
    })
}
module.exports = {
    registerUser,
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
    deleteAccount,
    sendMeMessage
}