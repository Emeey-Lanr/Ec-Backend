const mongoose = require('mongoose')
const chatSchema = mongoose.Scehma({
    senderId: { type: String },
    recieverId: { type: String },
    mesage: { type: Array }
})

const chatModel = mongoose.model('chat-collection', chatSchema)




module.exports = chatModel