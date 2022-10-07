const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const bcryptjs = require('bcryptjs')
const userSchema = mongoose.Schema({
    Email: { type: String, required: true, unique: true },
    userName: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    imgURL: { type: String },
    aboutMe: { type: String },
    ecIdentifier: { type: String },
    tokenValidation: { type: Boolean },
    friendList: { type: Array },
    notificationNumber: { type: Array },
    notification: { type: Array },
    status: { type: String }
})

let saltRound = 5

userSchema.pre('save', function (next) {
    bcrypt.hash(this.password, saltRound, (err, result) => {
        if (err) {
            console.log(err)
        } else {
            this.password = result
            next()
        }
    })
})

userSchema.methods.validatePassword = function (password, callback) {
    console.log(password)
    bcrypt.compare(password, this.password, (err, same) => {
        if (err) {
            console.log(err)
        } else {
            callback(err, same)
        }
    })
}

userSchema.methods.validateDelete = function (password, callback) {
   bcrypt.compare(password, this.password, (err, success)=>{
       if(err){
           console.log(err)
       }else{
           callback(err, success)
       }
   })
}

const userModel = mongoose.model('E-Chat_collection', userSchema)














module.exports = userModel