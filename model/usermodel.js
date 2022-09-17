const mongoose = require('mongoose')
const userSchema = mongoose.Schema({
    phoneNumber: { type: Number, required: true, unique: true },
    userName: { type: String, required: true, unique: true },
    contacts: { type: Array, }
})